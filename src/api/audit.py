"""
Audit & Compliance API Router for CognitRAG v5.

Exposes endpoints for querying public.query_logs and public.answer_citations.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from src.database.supabase_client import get_supabase

router = APIRouter(prefix="/api/v1/audit", tags=["Audit"])
logger = logging.getLogger(__name__)


@router.get("/logs")
async def list_query_logs(
    tenant_id: str = Query(..., description="Workspace tenant UUID"),
    limit: int = Query(50, le=100)
) -> Dict[str, Any]:
    """Retrieve historical query logs for a workspace."""
    try:
        supa = get_supabase()
        resp = supa.table("query_logs").select("*").eq("tenant_id", tenant_id).order("created_at", desc=True).limit(limit).execute()
        return {"logs": resp.data or []}
    except Exception as exc:
        logger.error(f"Failed to fetch query logs: {exc}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))


@router.get("/logs/{log_id}/citations")
async def get_query_citations(log_id: str) -> Dict[str, Any]:
    """Retrieve detailed citations and claims for a specific query log."""
    try:
        supa = get_supabase()
        resp = supa.table("answer_citations").select("*").eq("query_log_id", log_id).order("position").execute()
        return {"citations": resp.data or []}
    except Exception as exc:
        logger.error(f"Failed to fetch answer citations: {exc}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))


@router.get("/stats")
async def get_audit_stats(tenant_id: str = Query(...)) -> Dict[str, Any]:
    """Calculate summary audit statistics for tenant dashboard."""
    try:
        supa = get_supabase()
        total_queries = supa.table("query_logs").select("count", count="exact").eq("tenant_id", tenant_id).execute()
        cache_hits = supa.table("query_logs").select("count", count="exact").eq("tenant_id", tenant_id).eq("cache_hit", True).execute()
        withheld_logs = supa.table("query_logs").select("count", count="exact").eq("tenant_id", tenant_id).gt("hidden_citations", 0).execute()

        total = total_queries.count or 0
        hits = cache_hits.count or 0
        withheld = withheld_logs.count or 0

        return {
            "total_queries": total,
            "cache_hit_rate": round(hits / total, 2) if total > 0 else 0.0,
            "withheld_citations_queries": withheld,
        }
    except Exception as exc:
        logger.error(f"Failed to calculate audit stats: {exc}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))
