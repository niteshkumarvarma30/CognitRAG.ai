import os
import logging
import razorpay

logger = logging.getLogger(__name__)

RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "")

# Plan pricing mapping in INR (amount in paise, 1 INR = 100 paise)
PLAN_PRICING = {
    "solo": {
        "name": "Solo Plan",
        "amount_inr": 2499,
        "amount_paise": 249900,
        "currency": "INR",
        "queries_limit": 2500,
        "seats": 1
    },
    "teams": {
        "name": "Teams Plan",
        "amount_inr": 7999,
        "amount_paise": 799900,
        "currency": "INR",
        "queries_limit": 15000,
        "seats": 5
    }
}

def get_razorpay_client() -> razorpay.Client:
    """Initializes and returns an authenticated Razorpay client."""
    return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

def create_razorpay_order(tenant_id: str, plan: str = "solo", user_email: str = None) -> dict:
    """
    Creates an order in Razorpay for a workspace subscription upgrade.
    """
    plan_key = plan.lower()
    if plan_key not in PLAN_PRICING:
        plan_key = "solo"
    
    plan_info = PLAN_PRICING[plan_key]
    client = get_razorpay_client()

    order_payload = {
        "amount": plan_info["amount_paise"],
        "currency": plan_info["currency"],
        "receipt": f"rcpt_{tenant_id[:8]}_{plan_key}",
        "notes": {
            "tenant_id": str(tenant_id),
            "plan": plan_key,
            "plan_name": plan_info["name"],
            "user_email": user_email or ""
        }
    }

    try:
        order = client.order.create(data=order_payload)
        logger.info(f"[Razorpay] Created order {order.get('id')} for tenant {tenant_id} ({plan_key})")
        return {
            "order_id": order.get("id"),
            "amount": order.get("amount"),
            "currency": order.get("currency"),
            "key_id": RAZORPAY_KEY_ID,
            "plan": plan_key,
            "plan_name": plan_info["name"]
        }
    except Exception as e:
        logger.error(f"[Razorpay] Order creation failed: {e}")
        return {"error": str(e)}

def verify_razorpay_payment(order_id: str, payment_id: str, signature: str) -> bool:
    """
    Cryptographically verifies the HMAC SHA-256 signature from Razorpay.
    """
    client = get_razorpay_client()
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature
        })
        logger.info(f"[Razorpay] Verified payment signature for order {order_id}, payment {payment_id}")
        return True
    except razorpay.errors.SignatureVerificationError as e:
        logger.error(f"[Razorpay] Signature verification failed: {e}")
        return False
    except Exception as e:
        logger.error(f"[Razorpay] Unexpected verification error: {e}")
        return False
