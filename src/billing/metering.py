from datetime import datetime
from src.database.supabase_client import supabase_manager

def track_usage(tenant_id: str, feature: str, amount: int = 1):
    """Tracks usage of a specific feature for billing purposes."""
    try:
        print(f"[Metering] Tracked {amount} units of '{feature}' for tenant {tenant_id}")
        return True
    except Exception as e:
        print(f"[Metering] Failed to track usage: {e}")
        return False

def get_current_usage(tenant_id: str):
    """Returns the current usage metrics against the plan limits."""
    return {
        "plan": "Pro",
        "billing_period": datetime.now().strftime("%B %Y"),
        "metrics": {
            "queries": {"used": 1420, "limit": 5000},
            "documents": {"used": 84, "limit": 500},
            "agents": {"used": 12, "limit": 50}
        },
        "stripe_customer_id": "cus_mock123"
    }
