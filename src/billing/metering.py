from datetime import datetime
from src.database.supabase_client import supabase_manager

def track_usage(tenant_id: str, feature: str, amount: int = 1):
    """
    Tracks usage of a specific feature for billing purposes.
    Features: 'queries', 'documents_ingested', 'mcp_requests'
    """
    try:
        db = supabase_manager.get_admin_client()
        # Find current usage period (current month)
        current_month = datetime.now().strftime("%Y-%m")
        
        # In a real app, this would upsert into a usage table
        # We'll use a mocked RPC or direct table upsert
        print(f"[Metering] Tracked {amount} units of '{feature}' for tenant {tenant_id}")
        
        # Assuming we have a `tenant_usage` table with (tenant_id, billing_period, feature, amount)
        # For prototype, we just log it to avoid schema migrations right now
        
        return True
    except Exception as e:
        print(f"[Metering] Failed to track usage: {e}")
        return False

def get_current_usage(tenant_id: str):
    """
    Returns the current usage metrics against the plan limits.
    """
    # Mocked data for the UI
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
