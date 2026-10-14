"""
Feedback API Router for CognitRAG v5.

Allows recording user satisfaction and citation evaluation into public.answer_feedback.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from src.database.supabase_client import get_supabase

router = APIRouter(prefix="/api/v1/feedback", tags=["Feedback"])
logger = logging.getLogger(__name__)


class FeedbackPayload(BaseModel):
    query_log_id: str
    rating: int = Field(..., ge=-1, le=1)  # -1 or 1
    citation_id: Optional[str] = None
    user_id: Optional[str] = None
    reason: Optional[str] = None


@router.post("")
async def submit_answer_feedback(payload: FeedbackPayload) -> Dict[str, Any]:
    """Submit user rating (+1 or -1) for an answer or specific citation."""
    try:
        supa = get_supabase()
        # Look up tenant_id from query_log
        log_resp = supa.table("query_logs").select("tenant_id").eq("id", payload.query_log_id).single().execute()
        if not log_resp.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Query log not found")

        tenant_id = log_resp.data["tenant_id"]

        insert_payload = {
            "query_log_id": payload.query_log_id,
            "tenant_id": tenant_id,
            "citation_id": payload.citation_id,
            "user_id": payload.user_id,
            "rating": payload.rating,
            "reason": payload.reason,
        }

        resp = supa.table("answer_feedback").insert(insert_payload).execute()
        return {"status": "recorded", "id": resp.data[0]["id"] if resp.data else None}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Failed to submit feedback: {exc}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))
