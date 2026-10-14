"""
Jira Connector Implementation.
Implements the Connector Protocol for Atlassian Jira.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
import httpx

from src.connectors.base import AccessGrant, Connector, NormalizedDocument, SyncBatchResult
from src.connectors.jira.normalize import normalize_jira_issue
from src.connectors.jira.links import build_jira_deep_link
from src.connectors.jira.permissions import fetch_jira_access_grants
from src.connectors.jira.webhook import process_jira_event
from src.database.supabase_client import get_supabase

logger = logging.getLogger(__name__)


class JiraConnector:
    """Implements Connector protocol for Atlassian Jira."""

    @property
    def provider_name(self) -> str:
        return "jira"

    async def _get_credentials(self, tenant_id: str) -> Optional[Dict[str, Any]]:
        try:
            supa = get_supabase()
            resp = supa.table("tenant_integrations").select("credentials").eq("tenant_id", tenant_id).eq("integration_type", "jira").single().execute()
            if resp.data and "credentials" in resp.data:
                return resp.data["credentials"]
        except Exception as e:
            logger.error(f"Failed to load Jira credentials for tenant {tenant_id}: {e}")
        return None

    async def validate_connection(self, tenant_id: str, credentials: Dict[str, Any]) -> bool:
        token = credentials.get("access_token")
        if not token:
            return False
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get("https://api.atlassian.com/oauth/token/accessible-resources", headers=headers)
            return resp.status_code == 200

    async def fetch_fast_pass(self, tenant_id: str, limit: int = 50) -> SyncBatchResult:
        creds = await self._get_credentials(tenant_id)
        if not creds or not creds.get("access_token") or not creds.get("cloud_id"):
            return SyncBatchResult(items=[])

        token = creds["access_token"]
        cloud_id = creds["cloud_id"]
        site_url = creds.get("site_url", "")
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
        docs: List[NormalizedDocument] = []

        async with httpx.AsyncClient(timeout=10.0) as client:
            # Fetch recent issues via JQL search
            url = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/search?jql=order+by+updated+desc&maxResults=25"
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                for issue in data.get("issues", []):
                    docs.append(normalize_jira_issue(issue, site_url=site_url))

        return SyncBatchResult(items=docs[:limit])

    async def fetch_backfill(self, tenant_id: str, cursor: Optional[Dict[str, Any]] = None, limit: int = 100) -> SyncBatchResult:
        return await self.fetch_fast_pass(tenant_id, limit=limit)

    async def fetch_incremental(self, tenant_id: str, since: datetime) -> SyncBatchResult:
        return await self.fetch_fast_pass(tenant_id)

    async def fetch_access_grants(self, tenant_id: str) -> List[AccessGrant]:
        creds = await self._get_credentials(tenant_id)
        if not creds or not creds.get("access_token") or not creds.get("cloud_id"):
            return []
        return await fetch_jira_access_grants(creds["cloud_id"], creds["access_token"])

    async def handle_webhook(self, tenant_id: str, event_type: str, payload: Dict[str, Any]) -> Optional[NormalizedDocument]:
        return process_jira_event(payload)

    def build_deep_link(self, raw_ref_url: str, metadata: Dict[str, Any]) -> str:
        return build_jira_deep_link(raw_ref_url, metadata)
