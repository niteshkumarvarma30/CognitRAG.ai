"""
Sources & Audience Management API Router for CognitRAG v5.

Allows workspace admins to configure source containers (channels, repos, projects, pages)
and their audience boundaries (public vs private, mirrored vs admin_set).
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel
from src.database.supabase_client import get_supabase

router = APIRouter(prefix="/api/v1/sources", tags=["Sources"])
logger = logging.getLogger(__name__)


class UpdateAudienceRequest(BaseModel):
    audience_mode: Optional[str] = None      # 'mirrored' | 'admin_set'
    is_private: Optional[bool] = None
    allowed_member_ids: Optional[List[str]] = None


@router.get("")
async def list_sources(tenant_id: str = Query(...)) -> Dict[str, Any]:
    """Retrieve all source containers and access grants for tenant."""
    try:
        supa = get_supabase()
        resp = supa.table("source_access_grants").select("*").eq("tenant_id", tenant_id).execute()
        return {"sources": resp.data or []}
    except Exception as exc:
        logger.error(f"Failed to fetch sources: {exc}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))


@router.patch("/{source_id}")
async def update_source_audience(
    source_id: str,
    body: UpdateAudienceRequest
) -> Dict[str, Any]:
    """Update audience mode or member grants for a source container."""
    update_data = {}
    if body.audience_mode is not None:
        if body.audience_mode not in ("mirrored", "admin_set"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid audience_mode")
        update_data["audience_mode"] = body.audience_mode

    if body.is_private is not None:
        update_data["is_private"] = body.is_private

    if body.allowed_member_ids is not None:
        update_data["allowed_member_ids"] = body.allowed_member_ids

    if not update_data:
        return {"status": "no_changes"}

    try:
        supa = get_supabase()
        resp = supa.table("source_access_grants").update(update_data).eq("id", source_id).execute()
        return {"source": resp.data[0] if resp.data else None}
    except Exception as exc:
        logger.error(f"Failed to update source audience: {exc}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))
