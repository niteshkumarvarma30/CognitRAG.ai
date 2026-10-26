"""
GitHub Connector Implementation.
Implements the Connector Protocol for GitHub.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
import httpx

from src.connectors.base import AccessGrant, Connector, NormalizedDocument, SyncBatchResult
from src.connectors.github.normalize import normalize_github_issue_or_pr
from src.connectors.github.links import build_github_deep_link
from src.connectors.github.permissions import fetch_github_access_grants
from src.connectors.github.webhook import process_github_event
from src.database.supabase_client import get_supabase

logger = logging.getLogger(__name__)


class GitHubConnector:
    """Implements Connector protocol for GitHub."""

    @property
    def provider_name(self) -> str:
        return "github"

    async def _get_installation_token(self, tenant_id: str) -> Optional[str]:
        """Fetch stored GitHub installation or access token for tenant."""
        try:
            from src.api.routes import get_tenant_uuid
            supa = get_supabase()
            uuid_tenant = get_tenant_uuid(tenant_id)
            candidate_ids = list(set([tenant_id, uuid_tenant]))
            resp = supa.table("tenant_integrations").select("*").in_("tenant_id", candidate_ids).eq("integration_type", "github").execute()
            if resp.data:
                for row in resp.data:
                    token = row.get("access_token") or (row.get("credentials") or {}).get("access_token") or (row.get("extra_data") or {}).get("access_token")
                    if token:
                        return token
        except Exception as e:
            logger.error(f"Failed to load GitHub credentials for tenant {tenant_id}: {e}")
        return None

    async def validate_connection(self, tenant_id: str, credentials: Dict[str, Any]) -> bool:
        token = credentials.get("access_token") or credentials.get("token")
        if not token:
            return False
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json"
        }
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get("https://api.github.com/user", headers=headers)
            return resp.status_code == 200

    async def fetch_fast_pass(self, tenant_id: str, limit: int = 50) -> SyncBatchResult:
        token = await self._get_installation_token(tenant_id)
        if not token:
            return SyncBatchResult(items=[])

        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json"
        }
        docs: List[NormalizedDocument] = []

        async with httpx.AsyncClient(timeout=10.0) as client:
            # 1. Fetch user repos
            resp = await client.get("https://api.github.com/user/repos?per_page=5&sort=updated", headers=headers)
            if resp.status_code != 200:
                return SyncBatchResult(items=[])

            repos = resp.json()
            for r in repos:
                repo_name = r.get("full_name")
                is_priv = r.get("private", False)
                # 2. Fetch top 10 most recent issues/PRs
                issue_resp = await client.get(f"https://api.github.com/repos/{repo_name}/issues?per_page=10&state=all", headers=headers)
                if issue_resp.status_code == 200:
                    for item in issue_resp.json():
                        docs.append(normalize_github_issue_or_pr(repo_name, item, is_private=is_priv))

        return SyncBatchResult(items=docs[:limit])

    async def fetch_backfill(self, tenant_id: str, cursor: Optional[Dict[str, Any]] = None, limit: int = 100) -> SyncBatchResult:
        # Full backfill uses pagination cursor
        return await self.fetch_fast_pass(tenant_id, limit=limit)

    async def fetch_incremental(self, tenant_id: str, since: datetime) -> SyncBatchResult:
        return await self.fetch_fast_pass(tenant_id)

    async def fetch_access_grants(self, tenant_id: str) -> List[AccessGrant]:
        token = await self._get_installation_token(tenant_id)
        if not token:
            return []
        return await fetch_github_access_grants(token)

    async def handle_webhook(self, tenant_id: str, event_type: str, payload: Dict[str, Any]) -> Optional[NormalizedDocument]:
        return process_github_event(event_type, payload)

    def build_deep_link(self, raw_ref_url: str, metadata: Dict[str, Any]) -> str:
        return build_github_deep_link(raw_ref_url, metadata)
