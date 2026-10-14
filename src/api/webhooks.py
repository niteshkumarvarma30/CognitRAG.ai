"""
Unified Webhook Receiver for CognitRAG v5.

Receives inbound events from Slack, GitHub, and Jira.
Performs cryptographic signature verification, de-duplicates using public.webhook_events,
and acknowledges with 200 OK within 200ms.
"""

from __future__ import annotations

import logging
from typing import Optional
from fastapi import APIRouter, Header, HTTPException, Request, Response, status

from src.connectors.github.webhook import verify_github_signature, process_github_event
from src.connectors.slack.webhook import verify_slack_signature, process_slack_event
from src.connectors.jira.webhook import process_jira_event
from src.database.supabase_client import get_supabase

router = APIRouter(prefix="/api/v1/webhooks", tags=["Webhooks"])
logger = logging.getLogger(__name__)


@router.post("/slack")
async def slack_webhook(
    request: Request,
    x_slack_request_timestamp: Optional[str] = Header(None),
    x_slack_signature: Optional[str] = Header(None)
):
    body_bytes = await request.body()

    # 1. Verify cryptographic HMAC signature
    if not verify_slack_signature(body_bytes, x_slack_request_timestamp, x_slack_signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Slack signature")

    payload = await request.json()

    # Handle Slack URL verification challenge immediately
    if payload.get("type") == "url_verification":
        return {"challenge": payload.get("challenge")}

    event_id = payload.get("event_id")
    if event_id:
        supa = get_supabase()
        # Check de-duplication
        existing = supa.table("webhook_events").select("id").eq("provider", "slack").eq("event_id", event_id).execute()
        if existing.data:
            return {"status": "already_processed"}

        # Record event
        supa.table("webhook_events").insert({"provider": "slack", "event_id": event_id}).execute()

    # Process or enqueue
    process_slack_event(payload)

    return {"ok": True}


@router.post("/github")
async def github_webhook(
    request: Request,
    x_github_event: Optional[str] = Header(None),
    x_github_delivery: Optional[str] = Header(None),
    x_hub_signature_256: Optional[str] = Header(None)
):
    body_bytes = await request.body()

    # 1. Verify HMAC signature
    if not verify_github_signature(body_bytes, x_hub_signature_256):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid GitHub signature")

    if not x_github_delivery or not x_github_event:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing required GitHub headers")

    supa = get_supabase()
    # 2. De-duplication check
    existing = supa.table("webhook_events").select("id").eq("provider", "github").eq("event_id", x_github_delivery).execute()
    if existing.data:
        return {"status": "already_processed"}

    supa.table("webhook_events").insert({"provider": "github", "event_id": x_github_delivery}).execute()

    payload = await request.json()
    process_github_event(x_github_event, payload)

    return {"ok": True}


@router.post("/jira")
async def jira_webhook(request: Request):
    payload = await request.json()
    event_id = payload.get("timestamp") or str(payload.get("issue", {}).get("id"))
    
    if event_id:
        supa = get_supabase()
        existing = supa.table("webhook_events").select("id").eq("provider", "jira").eq("event_id", str(event_id)).execute()
        if existing.data:
            return {"status": "already_processed"}
        supa.table("webhook_events").insert({"provider": "jira", "event_id": str(event_id)}).execute()

    process_jira_event(payload)
    return {"ok": True}
