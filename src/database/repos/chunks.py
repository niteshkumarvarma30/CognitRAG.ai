"""
Chunks Repository — Vector & Keyword Search with fail-closed permissions.

All queries pass through RequestContext and enforce strict token matching.
"""

from __future__ import annotations

import logging
from typing import Any, List, Optional
from src.database.repos.context import RequestContext
from src.database.supabase_client import get_supabase
from src.config import db as db_cfg

logger = logging.getLogger(__name__)


async def search_vector_chunks(
    ctx: RequestContext,
    query_embedding: List[float],
    match_count: int = 10,
    dim: Optional[int] = None,
) -> List[dict[str, Any]]:
    """
    Execute vector search using the appropriate RPC based on vector dimension.
    Fails closed: if user has no permission tokens, returns [] immediately.
    """
    if not ctx.has_permissions:
        logger.warning(f"Rejecting vector search: User {ctx.user_id} has 0 permission tokens.")
        return []

    target_dim = dim or db_cfg.embedding_dim
    rpc_name = "match_document_chunks_768" if target_dim == 768 else "match_document_chunks"

    params = {
        "query_embedding": query_embedding,
        "match_count": match_count,
        "p_tenant_id": ctx.tenant_id,
        "p_user_permissions": list(ctx.permission_tokens),
    }

    try:
        supa = get_supabase()
        resp = supa.rpc(rpc_name, params).execute()
        return resp.data or []
    except Exception as exc:
        logger.error(f"Error executing vector search RPC '{rpc_name}': {exc}")
        return []


async def search_keyword_chunks(
    ctx: RequestContext,
    query_text: str,
    match_count: int = 10,
) -> List[dict[str, Any]]:
    """
    Execute full-text BM25-style keyword search using Postgres tsvector & GIN index.
    Sanitizes query text into OR-joined terms for to_tsquery('simple', ...).
    Fails closed: if user has no permission tokens, returns [] immediately.
    """
    if not ctx.has_permissions:
        return []

    import re
    # Extract alphanumeric tokens, minimum 2 characters
    words = re.findall(r"\b[a-zA-Z0-9_\-\.]{2,}\b", query_text)
    if not words:
        return []

    # Join with ' | ' for boolean OR matching in tsquery
    sanitized_tsquery = " | ".join(words[:15])

    params = {
        "p_tsquery": sanitized_tsquery,
        "match_count": match_count,
        "p_tenant_id": ctx.tenant_id,
        "p_user_permissions": list(ctx.permission_tokens),
    }

    try:
        supa = get_supabase()
        resp = supa.rpc("keyword_search_chunks", params).execute()
        return resp.data or []
    except Exception as exc:
        logger.error(f"Error executing keyword search RPC: {exc}")
        return []
