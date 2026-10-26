import os
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from typing import Dict, Any, Optional
from src.middleware.auth import get_current_user
from src.billing.stripe_client import create_checkout_session, create_customer_portal
from src.billing.metering import get_current_usage
from src.database.supabase_client import supabase_manager

router = APIRouter(prefix="/api/v1/billing", tags=["billing"])

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

@router.get("/usage")
async def get_usage(user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    """Returns the current workspace usage metrics against plan limits."""
    tenant_id = user_id or "ws_default"
    usage = get_current_usage(tenant_id)
    return usage

@router.post("/checkout")
async def create_checkout(request: Request):
    """Creates a Stripe checkout session for upgrading to Solo ($29) or Teams ($99)."""
    data = await request.json()
    plan_tier = data.get("plan", "solo").lower()
    price_id = data.get("price_id")
    tenant_id = data.get("tenant_id", "ws_default")

    # Mapping to standard plan price IDs if price_id is not passed
    tier_price_map = {
        "solo": os.environ.get("STRIPE_SOLO_PRICE_ID", "price_solo_29_monthly"),
        "teams": os.environ.get("STRIPE_TEAMS_PRICE_ID", "price_teams_99_monthly")
    }
    actual_price_id = price_id or tier_price_map.get(plan_tier, "price_solo_29_monthly")

    success_url = f"{request.base_url}settings?billing=success&plan={plan_tier}"
    cancel_url = f"{request.base_url}settings?billing=canceled"
    
    session = create_checkout_session(tenant_id, actual_price_id, success_url, cancel_url)
    if "error" in session:
        raise HTTPException(status_code=500, detail=session["error"])
        
    return {"url": session["url"], "session_id": session.get("session_id")}

@router.post("/portal")
async def create_portal(request: Request):
    """Creates a Stripe customer portal session."""
    data = await request.json()
    tenant_id = data.get("tenant_id", "ws_default")
    usage = get_current_usage(tenant_id)
    customer_id = usage.get("stripe_customer_id")
    
    if not customer_id:
        raise HTTPException(status_code=400, detail="No active Stripe customer found for workspace")
        
    return_url = f"{request.base_url}settings"
    session = create_customer_portal(tenant_id, customer_id, return_url)
    
    if "error" in session:
        raise HTTPException(status_code=500, detail=session["error"])
        
    return {"url": session["url"]}

@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: Optional[str] = Header(None)):
    """
    Handles Stripe webhooks (checkout.session.completed, customer.subscription.deleted).
    Activates Solo / Teams plans in Supabase tenants table.
    """
    payload = await request.body()
    event = None

    if STRIPE_WEBHOOK_SECRET and stripe_signature:
        try:
            event = stripe.Webhook.construct_event(
                payload, stripe_signature, STRIPE_WEBHOOK_SECRET
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Webhook signature error: {e}")
    else:
        # Fallback for dev / testing mode
        import json
        try:
            event = json.loads(payload.decode("utf-8"))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = event.get("type")
    data_object = event.get("data", {}).get("object", {})

    if event_type == "checkout.session.completed":
        tenant_id = data_object.get("client_reference_id") or data_object.get("metadata", {}).get("tenant_id")
        customer_id = data_object.get("customer")
        subscription_id = data_object.get("subscription")

        # Determine plan tier based on line items or amount
        amount_total = data_object.get("amount_total", 2900)
        plan_tier = "teams" if amount_total >= 9000 else "solo"

        if tenant_id:
            try:
                sb = supabase_manager.get_admin_client()
                sb.table("tenants").upsert({
                    "id": tenant_id,
                    "plan": plan_tier
                }).execute()
                print(f"[Stripe Webhook] Successfully activated {plan_tier.upper()} plan for tenant {tenant_id}")
            except Exception as e:
                print(f"[Stripe Webhook] Failed to update tenant in Supabase: {e}")

    elif event_type == "customer.subscription.deleted":
        customer_id = data_object.get("customer")
        try:
            sb = supabase_manager.get_admin_client()
            sb.table("tenants").update({"status": "canceled"}).eq("stripe_customer_id", customer_id).execute()
        except Exception as e:
            print(f"[Stripe Webhook] Failed to cancel subscription in Supabase: {e}")

    return {"status": "success", "event": event_type}


# ==============================================================================
# RAZORPAY PAYMENT & QUOTA ENDPOINTS (LIVE INTEGRATION)
# ==============================================================================

import uuid
from src.billing.razorpay_client import create_razorpay_order, verify_razorpay_payment
from src.billing.quota_guard import check_query_quota, PLAN_QUOTAS

def _normalize_tenant_uuid(tenant_id: str) -> str:
    """Ensures tenant_id is formatted as a valid UUID for PostgreSQL."""
    if not tenant_id:
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, "default_anonymous"))
    try:
        uuid.UUID(tenant_id)
        return tenant_id
    except ValueError:
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, tenant_id))

@router.get("/quota")
async def get_quota_status(tenant_id: Optional[str] = None):
    """Returns the monthly query usage and remaining limit for a workspace."""
    uuid_tenant = _normalize_tenant_uuid(tenant_id)
    status = check_query_quota(uuid_tenant)
    return status

@router.post("/razorpay/create-order")
async def razorpay_create_order(request: Request):
    """
    Creates a Razorpay order for upgrading to Solo (₹2,499/mo) or Teams (₹7,999/mo).
    Returns order_id, amount, currency, and key_id for the frontend Checkout.js.
    """
    data = await request.json()
    tenant_id = data.get("tenant_id", "ws_default")
    plan = data.get("plan", "solo").lower()
    user_email = data.get("user_email")

    uuid_tenant = _normalize_tenant_uuid(tenant_id)
    order = create_razorpay_order(uuid_tenant, plan, user_email)

    if "error" in order:
        raise HTTPException(status_code=500, detail=order["error"])

    return order

@router.post("/razorpay/verify-payment")
async def razorpay_verify_payment(request: Request):
    """
    Verifies the cryptographic HMAC SHA-256 signature from Razorpay.
    Upon successful payment, automatically upgrades the tenant's plan in Supabase.
    """
    data = await request.json()
    tenant_id = data.get("tenant_id")
    plan = data.get("plan", "solo").lower()
    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_signature = data.get("razorpay_signature")

    if not all([tenant_id, razorpay_order_id, razorpay_payment_id, razorpay_signature]):
        raise HTTPException(status_code=400, detail="Missing required payment verification parameters")

    is_valid = verify_razorpay_payment(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid Razorpay signature. Payment verification failed.")

    uuid_tenant = _normalize_tenant_uuid(tenant_id)

    # Update tenant plan in Supabase
    try:
        sb = supabase_manager.get_admin_client()
        # Ensure tenant row exists and update plan
        sb.table("tenants").upsert({
            "id": uuid_tenant,
            "name": f"Workspace {uuid_tenant[:8]}",
            "plan": plan
        }).execute()

        # Log upgrade transaction
        sb.table("transactions").insert({
            "tenant_id": uuid_tenant,
            "operation_type": f"razorpay_upgrade_{plan}",
            "tokens_used": 0
        }).execute()

        print(f"[Razorpay] Successfully upgraded tenant {uuid_tenant} to plan '{plan}' via payment {razorpay_payment_id}")
        return {
            "status": "success",
            "plan": plan,
            "message": f"Payment verified! Your workspace is now on the {plan.upper()} plan.",
            "payment_id": razorpay_payment_id
        }
    except Exception as e:
        print(f"[Razorpay] Error updating tenant plan in Supabase: {e}")
        # Even if DB logging failed, payment was valid
        return {
            "status": "success",
            "plan": plan,
            "warning": f"Payment verified, but plan sync had issue: {e}",
            "payment_id": razorpay_payment_id
        }

