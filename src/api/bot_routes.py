"""
CognitRAG v2 — Bot API Routes
FastAPI router for Slack Events API webhooks and OAuth install flow.
"""
import os
import json
import hmac
import hashlib
import time
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from fastapi.responses import RedirectResponse, JSONResponse
from pydantic import BaseModel
from src.database.supabase_client import supabase_manager

router = APIRouter()

SLACK_CLIENT_ID = os.environ.get("SLACK_CLIENT_ID", "")
SLACK_CLIENT_SECRET = os.environ.get("SLACK_CLIENT_SECRET", "")
SLACK_SIGNING_SECRET = os.environ.get("SLACK_SIGNING_SECRET", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8000")


# ============================================================
# SLACK EVENTS WEBHOOK
# ============================================================
@router.post("/api/v1/slack/events")
async def slack_events(request: Request):
    """
    Receives all Slack Events API webhooks.
    Routes to the Slack Bolt App handler.
    """
    from src.bots.slack_app import handler
    return await handler.handle(request)


# ============================================================
# SLACK OAUTH INSTALL FLOW
# ============================================================
@router.get("/api/v1/slack/install")
async def slack_install(tenant_id: str = None):
    """
    Redirects admin to Slack OAuth authorization page.
    One-click install for workspace admins.
    """
    if not SLACK_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Slack Client ID not configured")

    scopes = ",".join([
        "channels:history",
        "channels:read",
        "chat:write",
        "commands",
        "app_mentions:read",
        "users:read",
        "groups:history",
        "im:history",
        "mpim:history"
    ])

    redirect_uri = f"{API_BASE_URL}/api/v1/slack/callback"
    state = tenant_id or ""

    auth_url = (
        f"https://slack.com/oauth/v2/authorize?"
        f"client_id={SLACK_CLIENT_ID}"
        f"&scope={scopes}"
        f"&redirect_uri={redirect_uri}"
        f"&state={state}"
    )
    return RedirectResponse(auth_url)


@router.get("/api/v1/slack/callback")
async def slack_callback(code: str, state: str = None, error: str = None):
    """
    Handles Slack OAuth callback after admin authorizes.
    Stores tokens in tenant_integrations table.
    """
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/integrations?error={error}")

    import requests
    token_response = requests.post(
        "https://slack.com/api/oauth.v2.access",
        data={
            "client_id": SLACK_CLIENT_ID,
            "client_secret": SLACK_CLIENT_SECRET,
            "code": code,
            "redirect_uri": f"{API_BASE_URL}/api/v1/slack/callback"
        }
    ).json()

    if not token_response.get("ok"):
        return RedirectResponse(f"{FRONTEND_URL}/integrations?error=oauth_failed")

    bot_token = token_response.get("access_token")
    team = token_response.get("team", {})
    bot_user_id = token_response.get("bot_user_id")

    db = supabase_manager.get_admin_client()

    # Update tenant with Slack team info
    tenant_id = state
    if tenant_id:
        db.table("tenants").update({
            "slack_team_id": team.get("id"),
            "slack_team_name": team.get("name")
        }).eq("id", tenant_id).execute()

        # Store token in vault
        db.table("tenant_integrations").upsert({
            "tenant_id": tenant_id,
            "integration_type": "slack",
            "access_token": bot_token,
            "workspace_id": team.get("id"),
            "workspace_name": team.get("name"),
            "bot_user_id": bot_user_id,
            "is_active": True
        }, on_conflict="tenant_id,integration_type").execute()

    return RedirectResponse(f"{FRONTEND_URL}/integrations?slack=connected")


# ============================================================
# SLACK INGEST MESSAGE (called by Slack bot on new messages)
# ============================================================
class SlackMessageEvent(BaseModel):
    tenant_id: str
    team_id: str
    event: dict


@router.post("/api/v1/integrations/slack/ingest_message")
async def ingest_slack_message(payload: SlackMessageEvent, background_tasks: BackgroundTasks):
    """
    Background ingestion triggered when a new Slack message arrives.
    """
    background_tasks.add_task(_process_slack_message, payload.tenant_id, payload.event)
    return {"status": "queued"}


def _process_slack_message(tenant_id: str, event: dict):
    """Process and ingest a single new Slack message."""
    try:
        from src.ingestion.normalizer import build_slack_doc
        from src.ingestion.language_detector import detect_language
        from src.ingestion.parser import chunk_text, parse_slack_text
        from src.ingestion.pipeline import ingest_normalized_doc
        from src.database.supabase_client import supabase_manager

        text = event.get("text", "").strip()
        if not text or len(text) < 10:
            return

        channel_id = event.get("channel", "")
        ts = event.get("ts", "")
        user = event.get("user", "unknown")

        cleaned = parse_slack_text(text)
        language_tag = detect_language(cleaned)

        doc = build_slack_doc(
            tenant_id=tenant_id,
            channel_id=channel_id,
            channel_name=channel_id,
            message_ts=ts,
            user_name=user,
            text=cleaned,
            language_tag=language_tag
        )

        # Store document record
        db = supabase_manager.get_admin_client()
        db.table("documents").insert({
            "id": doc.doc_id,
            "tenant_id": tenant_id,
            "filename": doc.filename,
            "source_type": "slack",
            "source_native_id": doc.source_native_id,
            "language_tag": language_tag,
            "author": user,
            "raw_ref_url": doc.raw_ref_url,
            "status": "processing"
        }).execute()

        chunks = chunk_text(cleaned, language_tag)
        ingest_normalized_doc(doc, chunks)

        db.table("documents").update({"status": "ready"}).eq("id", doc.doc_id).execute()

    except Exception as e:
        print(f"Failed to ingest Slack message: {e}")


# ============================================================
# CONTRADICTIONS API
# ============================================================
@router.get("/api/v1/contradictions")
async def get_contradictions(tenant_id: str):
    """Get all unresolved contradictions for a tenant."""
    from src.ingestion.contradiction_detector import get_unresolved_contradictions
    contradictions = get_unresolved_contradictions(tenant_id)
    return {"contradictions": contradictions, "count": len(contradictions)}


class ResolveContradictionRequest(BaseModel):
    resolution: str  # "resolved_by_recency" | "resolved_by_user"
    resolved_by: str


@router.patch("/api/v1/contradictions/{contradiction_id}")
async def resolve_contradiction(contradiction_id: str, body: ResolveContradictionRequest):
    """Mark a contradiction as resolved."""
    from src.ingestion.contradiction_detector import resolve_contradiction
    success = resolve_contradiction(contradiction_id, body.resolution, body.resolved_by)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to resolve contradiction")
    return {"status": "resolved"}
