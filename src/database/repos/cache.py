"""
Semantic Cache Repository — Audience-isolated cache lookup & write.

Ensures that answers cached for user A are NEVER returned to user B unless their
permission_hash matches exactly and any guarded entity identifiers match.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, List, Optional
from src.database.repos.context import RequestContext
from src.database.supabase_client import get_supabase
from src.config import app as app_cfg

logger = logging.getLogger(__name__)


async def lookup_cache(
    ctx: RequestContext,
    query_embedding: List[float],
    threshold: float = 0.95,
    entity_guard: Optional[List[str]] = None,
) -> Optional[dict[str, Any]]:
    """
    Look up matching cached response.
    Requires exact match on tenant_id, permission_hash, and entity_guard.
    """
    if not ctx.has_permissions:
        return None

    guard = entity_guard or []
    params = {
        "query_embedding": query_embedding,
        "match_count": 1,
        "match_threshold": threshold,
        "p_tenant_id": ctx.tenant_id,
        "p_permission_hash": ctx.permission_hash,
        "p_entity_guard": guard,
    }

    try:
        supa = get_supabase()
        resp = supa.rpc("match_semantic_cache", params).execute()
        rows = resp.data or []
        if rows:
            return rows[0]
        return None
    except Exception as exc:
        logger.warning(f"Semantic cache lookup failed: {exc}")
        return None


async def save_cache(
    ctx: RequestContext,
    query: str,
    response: str,
    query_embedding: List[float],
    entity_guard: Optional[List[str]] = None,
    ttl_seconds: Optional[int] = None,
) -> bool:
    """Store an answer into the semantic cache with permission namespace."""
    if not ctx.has_permissions:
        return False

    ttl = ttl_seconds or app_cfg.semantic_cache_ttl_s
    expires_at = (datetime.now(timezone.utc) + timedelta(seconds=ttl)).isoformat()
    guard = entity_guard or []

    payload = {
        "tenant_id": ctx.tenant_id,
        "query": query,
        "response": response,
        "query_embedding": query_embedding,
        "permission_hash": ctx.permission_hash,
        "entity_guard": guard,
        "expires_at": expires_at,
    }

    try:
        supa = get_supabase()
        supa.table("semantic_cache").insert(payload).execute()
        return True
    except Exception as exc:
        logger.warning(f"Semantic cache save failed: {exc}")
        return False
