import os
import stripe

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "sk_test_mock_key")

def create_checkout_session(tenant_id: str, plan_id: str, success_url: str, cancel_url: str):
    """Creates a Stripe Checkout session for upgrading a workspace plan."""
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{'price': plan_id, 'quantity': 1}],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            client_reference_id=tenant_id,
            metadata={'tenant_id': tenant_id}
        )
        return {"url": session.url, "session_id": session.id}
    except Exception as e:
        print(f"[Stripe] Checkout creation failed: {e}")
        return {"error": str(e)}

def create_customer_portal(tenant_id: str, stripe_customer_id: str, return_url: str):
    """Creates a Stripe Customer Portal session for managing billing."""
    try:
        session = stripe.billing_portal.Session.create(
            customer=stripe_customer_id,
            return_url=return_url
        )
        return {"url": session.url}
    except Exception as e:
        print(f"[Stripe] Portal creation failed: {e}")
        return {"error": str(e)}
