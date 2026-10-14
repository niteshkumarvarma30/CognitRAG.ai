"""
Logs Repository — Query logging, structured citations, and user feedback tracking.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from src.database.repos.context import RequestContext
from src.database.supabase_client import get_supabase

logger = logging.getLogger(__name__)


async def log_query_and_answer(
    ctx: RequestContext,
    query_text: str,
    answer_text: str,
    citations: List[Dict[str, Any]],
    language_tag: Optional[str] = None,
    route: Optional[str] = None,
    cache_hit: bool = False,
    hidden_citations: int = 0,
    latency_ms: Optional[int] = None,
    first_token_ms: Optional[int] = None,
    tokens_used: Optional[int] = None,
) -> Optional[str]:
    """
    Record an executed query, its generated answer, metrics, and associated citations.
    Returns the created query_log_id.
    """
    supa = get_supabase()

    log_payload = {
        "tenant_id": ctx.tenant_id,
        "user_id": ctx.user_id,
        "surface": ctx.surface,
        "query_text": query_text,
        "answer_text": answer_text,
        "language_tag": language_tag,
        "route": route,
        "cache_hit": cache_hit,
        "hidden_citations": hidden_citations,
        "latency_ms": latency_ms,
        "first_token_ms": first_token_ms,
        "tokens_used": tokens_used,
    }

    try:
        resp = supa.table("query_logs").insert(log_payload).execute()
        if not resp.data:
            return None

        query_log_id = resp.data[0]["id"]

        # Insert answer citations if provided
        if citations:
            citation_rows = []
            for idx, c in enumerate(citations):
                citation_rows.append({
                    "query_log_id": query_log_id,
                    "tenant_id": ctx.tenant_id,
                    "chunk_id": c.get("chunk_id") or c.get("id"),
                    "position": idx + 1,
                    "claim_text": c.get("claim_text") or c.get("content", "")[:300],
                    "derivation": c.get("derivation", "extracted"),
                    "confidence_label": c.get("confidence_label", "high"),
                    "score": c.get("score") or c.get("similarity"),
                    "source_type": c.get("source_type"),
                    "raw_ref_url": c.get("raw_ref_url"),
                })
            supa.table("answer_citations").insert(citation_rows).execute()

        return query_log_id
    except Exception as exc:
        logger.error(f"Failed to log query and citations: {exc}")
        return None


async def submit_feedback(
    ctx: RequestContext,
    query_log_id: str,
    rating: int,  # 1 or -1
    citation_id: Optional[str] = None,
    reason: Optional[str] = None,
) -> bool:
    """Record user thumbs-up/down feedback."""
    supa = get_supabase()
    payload = {
        "query_log_id": query_log_id,
        "tenant_id": ctx.tenant_id,
        "citation_id": citation_id,
        "user_id": ctx.user_id,
        "rating": rating,
        "reason": reason,
    }
    try:
        supa.table("answer_feedback").insert(payload).execute()
        return True
    except Exception as exc:
        logger.error(f"Failed to submit answer feedback: {exc}")
        return False
