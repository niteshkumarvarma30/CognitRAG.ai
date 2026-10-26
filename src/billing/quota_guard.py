import logging
from datetime import datetime
from typing import Dict, Any
from src.database.supabase_client import supabase_manager

logger = logging.getLogger(__name__)

# Plan tier quotas
PLAN_QUOTAS = {
    "free": {
        "monthly_queries": 20,
        "max_documents": 3,
        "seats": 1,
        "name": "Free Starter"
    },
    "solo": {
        "monthly_queries": 2500,
        "max_documents": 50,
        "seats": 1,
        "name": "Solo Plan"
    },
    "teams": {
        "monthly_queries": 15000,
        "max_documents": 500,
        "seats": 5,
        "name": "Teams Plan"
    },
    "enterprise": {
        "monthly_queries": 1000000,
        "max_documents": 1000000,
        "seats": 999,
        "name": "Enterprise Plan"
    }
}

def get_tenant_plan(tenant_id: str) -> str:
    """Fetches the current plan for a tenant from Supabase."""
    try:
        sb = supabase_manager.get_admin_client()
        res = sb.table("tenants").select("plan").eq("id", tenant_id).execute()
        if res.data and len(res.data) > 0:
            return (res.data[0].get("plan") or "free").lower()
    except Exception as e:
        logger.warning(f"[QuotaGuard] Could not fetch plan for tenant {tenant_id}: {e}")
    return "free"

def check_query_quota(tenant_id: str) -> Dict[str, Any]:
    """
    Checks if the workspace has remaining query credits for the current calendar month.
    Returns:
        allowed: bool
        plan: str
        used: int
        limit: int
        remaining: int
    """
    plan = get_tenant_plan(tenant_id)
    plan_info = PLAN_QUOTAS.get(plan, PLAN_QUOTAS["free"])
    limit = plan_info["monthly_queries"]

    # Calculate start of current UTC calendar month
    now = datetime.utcnow()
    start_of_month = datetime(now.year, now.month, 1).isoformat()

    used = 0
    try:
        sb = supabase_manager.get_admin_client()
        res = sb.table("transactions") \
            .select("id", count="exact") \
            .eq("tenant_id", tenant_id) \
            .eq("operation_type", "query") \
            .gte("created_at", start_of_month) \
            .execute()
        used = res.count or 0
    except Exception as e:
        logger.warning(f"[QuotaGuard] Failed to query transactions count for {tenant_id}: {e}")
        # Default allow if count check fails to avoid outage
        return {
            "allowed": True,
            "plan": plan,
            "used": 0,
            "limit": limit,
            "remaining": limit
        }

    allowed = used < limit
    remaining = max(0, limit - used)

    return {
        "allowed": allowed,
        "plan": plan,
        "used": used,
        "limit": limit,
        "remaining": remaining
    }

def record_query_usage(tenant_id: str, tokens_used: int = 0) -> bool:
    """Logs a query execution transaction for workspace metering."""
    try:
        sb = supabase_manager.get_admin_client()
        sb.table("transactions").insert({
            "tenant_id": tenant_id,
            "operation_type": "query",
            "tokens_used": tokens_used
        }).execute()
        return True
    except Exception as e:
        logger.warning(f"[QuotaGuard] Failed to log transaction for tenant {tenant_id}: {e}")
        return False
