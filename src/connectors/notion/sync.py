"""
Notion Connector Implementation.
Implements the Connector Protocol for Notion.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
import httpx

from src.connectors.base import AccessGrant, Connector, NormalizedDocument, SyncBatchResult
from src.connectors.notion.normalize import normalize_notion_page
from src.connectors.notion.links import build_notion_deep_link
from src.connectors.notion.permissions import fetch_notion_access_grants
from src.database.supabase_client import get_supabase

logger = logging.getLogger(__name__)


class NotionConnector:
    """Implements Connector protocol for Notion."""

    @property
    def provider_name(self) -> str:
        return "notion"

    async def _get_access_token(self, tenant_id: str) -> Optional[str]:
        try:
            supa = get_supabase()
            resp = supa.table("tenant_integrations").select("credentials").eq("tenant_id", tenant_id).eq("integration_type", "notion").single().execute()
            if resp.data and "credentials" in resp.data:
                return resp.data["credentials"].get("access_token")
        except Exception as e:
            logger.error(f"Failed to load Notion credentials for tenant {tenant_id}: {e}")
        return None

    async def validate_connection(self, tenant_id: str, credentials: Dict[str, Any]) -> bool:
        token = credentials.get("access_token")
        if not token:
            return False
        headers = {"Authorization": f"Bearer {token}", "Notion-Version": "2022-06-28"}
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get("https://api.notion.com/v1/users/me", headers=headers)
            return resp.status_code == 200

    async def fetch_fast_pass(self, tenant_id: str, limit: int = 50) -> SyncBatchResult:
        token = await self._get_access_token(tenant_id)
        if not token:
            return SyncBatchResult(items=[])

        headers = {
            "Authorization": f"Bearer {token}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        }
        docs: List[NormalizedDocument] = []

        async with httpx.AsyncClient(timeout=10.0) as client:
            # Search for pages
            resp = await client.post("https://api.notion.com/v1/search", json={"page_size": 15, "filter": {"value": "page", "property": "object"}}, headers=headers)
            if resp.status_code == 200:
                pages = resp.json().get("results", [])
                for p in pages:
                    pid = p.get("id")
                    # Fetch block children for page
                    blocks_resp = await client.get(f"https://api.notion.com/v1/blocks/{pid}/children?page_size=50", headers=headers)
                    blocks = blocks_resp.json().get("results", []) if blocks_resp.status_code == 200 else []
                    docs.append(normalize_notion_page(p, blocks))

        return SyncBatchResult(items=docs[:limit])

    async def fetch_backfill(self, tenant_id: str, cursor: Optional[Dict[str, Any]] = None, limit: int = 100) -> SyncBatchResult:
        return await self.fetch_fast_pass(tenant_id, limit=limit)

    async def fetch_incremental(self, tenant_id: str, since: datetime) -> SyncBatchResult:
        return await self.fetch_fast_pass(tenant_id)

    async def fetch_access_grants(self, tenant_id: str) -> List[AccessGrant]:
        token = await self._get_access_token(tenant_id)
        if not token:
            return []
        return await fetch_notion_access_grants(token)

    async def handle_webhook(self, tenant_id: str, event_type: str, payload: Dict[str, Any]) -> Optional[NormalizedDocument]:
        return None

    def build_deep_link(self, raw_ref_url: str, metadata: Dict[str, Any]) -> str:
        return build_notion_deep_link(raw_ref_url, metadata)
