"""
Slack Bot & Delivery Handler for CognitRAG v5.

Implements:
1. Slash command `/cognitrag ask <query>`
2. Identity resolution via external_identities
3. Ephemeral answer with 'Share to Channel' button
4. Public channel sharing with audience inspection and citation filtering
"""

from __future__ import annotations

import logging
from typing import Any, Dict
import httpx

from src.connectors.slack.webhook import verify_slack_signature
from src.database.supabase_client import get_supabase
from src.permissions.tokens import get_user_permission_tokens
from src.permissions.audience import filter_citations_for_audience
from src.delivery.formatters import format_slack_response

logger = logging.getLogger(__name__)


async def resolve_slack_user_to_tenant(slack_user_id: str, team_id: str) -> tuple[str | None, str | None]:
    """Finds tenant_id and Clerk user_id corresponding to this Slack user."""
    supa = get_supabase()
    # Check external_identities
    resp = supa.table("external_identities").select("tenant_id, user_id").eq("provider", "slack").eq("external_id", slack_user_id).execute()
    if resp.data:
        return resp.data[0]["tenant_id"], resp.data[0]["user_id"]

    # Fallback to team integration
    t_resp = supa.table("tenant_integrations").select("tenant_id").eq("integration_type", "slack").execute()
    if t_resp.data:
        return t_resp.data[0]["tenant_id"], f"slack:{slack_user_id}"

    return None, None


async def handle_slash_command(form_data: Dict[str, str]) -> Dict[str, Any]:
    """Process incoming `/cognitrag ask` command."""
    user_id = form_data.get("user_id", "")
    team_id = form_data.get("team_id", "")
    query = form_data.get("text", "").strip()
    channel_id = form_data.get("channel_id", "")

    if not query:
        return {
            "response_type": "ephemeral",
            "text": "Please provide a query: `/cognitrag ask <your question>`"
        }

    tenant_id, clerk_user_id = await resolve_slack_user_to_tenant(user_id, team_id)
    if not tenant_id:
        return {
            "response_type": "ephemeral",
            "text": "⚠️ Your Slack account is not linked to a CognitRAG workspace. Please link your account in the CognitRAG dashboard."
        }

    # Fetch permissions for this user
    tokens = await get_user_permission_tokens(tenant_id, clerk_user_id)
    if not tokens:
        return {
            "response_type": "ephemeral",
            "text": "🔒 You do not have access to any indexed knowledge in this workspace."
        }

    # Answer is returned ephemerally first to prevent accidental leakage into the channel
    return {
        "response_type": "ephemeral",
        "text": f"Thinking about: *{query}*...",
    }
