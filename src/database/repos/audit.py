"""
Audit Repository — Audit log writer for enterprise compliance and security tracing.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Optional
from src.database.repos.context import RequestContext
from src.database.supabase_client import get_supabase

logger = logging.getLogger(__name__)


async def log_audit_event(
    ctx: RequestContext,
    action: str,
    target: Optional[str] = None,
    detail: Optional[Dict[str, Any]] = None,
) -> bool:
    """Record an audit trail event for administrative or security-sensitive actions."""
    supa = get_supabase()
    payload = {
        "tenant_id": ctx.tenant_id,
        "actor": ctx.user_id,
        "action": action,
        "target": target,
        "detail": detail or {},
    }
    try:
        supa.table("audit_log").insert(payload).execute()
        return True
    except Exception as exc:
        logger.error(f"Failed to write audit event '{action}': {exc}")
        return False
