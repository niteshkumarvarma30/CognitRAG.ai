"""
Slack Connector Implementation.
Implements the Connector Protocol for Slack.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
import httpx

from src.connectors.base import AccessGrant, Connector, NormalizedDocument, SyncBatchResult
from src.connectors.slack.normalize import normalize_slack_message
from src.connectors.slack.links import build_slack_deep_link
from src.connectors.slack.permissions import fetch_slack_access_grants
from src.connectors.slack.webhook import process_slack_event
from src.database.supabase_client import get_supabase

logger = logging.getLogger(__name__)


class SlackConnector:
    """Implements Connector protocol for Slack."""

    @property
    def provider_name(self) -> str:
        return "slack"

    async def _get_bot_token(self, tenant_id: str) -> Optional[str]:
        try:
            supa = get_supabase()
            resp = supa.table("tenant_integrations").select("credentials").eq("tenant_id", tenant_id).eq("integration_type", "slack").single().execute()
            if resp.data and "credentials" in resp.data:
                creds = resp.data["credentials"]
                return creds.get("bot_access_token") or creds.get("access_token")
        except Exception as e:
            logger.error(f"Failed to load Slack credentials for tenant {tenant_id}: {e}")
        return None

    async def validate_connection(self, tenant_id: str, credentials: Dict[str, Any]) -> bool:
        token = credentials.get("bot_access_token") or credentials.get("access_token")
        if not token:
            return False
        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get("https://slack.com/api/auth.test", headers=headers)
            return resp.json().get("ok", False)

    async def fetch_fast_pass(self, tenant_id: str, limit: int = 50) -> SyncBatchResult:
        token = await self._get_bot_token(tenant_id)
        if not token:
            return SyncBatchResult(items=[])

        headers = {"Authorization": f"Bearer {token}"}
        docs: List[NormalizedDocument] = []

        async with httpx.AsyncClient(timeout=10.0) as client:
            # 1. Fetch first few channels
            resp = await client.get("https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=5", headers=headers)
            data = resp.json()
            if not data.get("ok"):
                return SyncBatchResult(items=[])

            for c in data.get("channels", []):
                cid = c.get("id")
                cname = c.get("name", cid)
                is_priv = c.get("is_private", False)

                # 2. Fetch recent messages
                hist_resp = await client.get(f"https://slack.com/api/conversations.history?channel={cid}&limit=15", headers=headers)
                hist_data = hist_resp.json()
                if hist_data.get("ok"):
                    for msg in hist_data.get("messages", []):
                        norm = normalize_slack_message(cid, cname, msg, is_private=is_priv)
                        if norm:
                            docs.append(norm)

        return SyncBatchResult(items=docs[:limit])

    async def fetch_backfill(self, tenant_id: str, cursor: Optional[Dict[str, Any]] = None, limit: int = 100) -> SyncBatchResult:
        return await self.fetch_fast_pass(tenant_id, limit=limit)

    async def fetch_incremental(self, tenant_id: str, since: datetime) -> SyncBatchResult:
        return await self.fetch_fast_pass(tenant_id)

    async def fetch_access_grants(self, tenant_id: str) -> List[AccessGrant]:
        token = await self._get_bot_token(tenant_id)
        if not token:
            return []
        return await fetch_slack_access_grants(token)

    async def handle_webhook(self, tenant_id: str, event_type: str, payload: Dict[str, Any]) -> Optional[NormalizedDocument]:
        return process_slack_event(payload)

    def build_deep_link(self, raw_ref_url: str, metadata: Dict[str, Any]) -> str:
        return build_slack_deep_link(raw_ref_url, metadata)
