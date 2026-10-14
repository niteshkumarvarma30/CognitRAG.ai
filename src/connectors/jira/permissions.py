"""
Jira Permissions & Project Access Grants Synchronizer.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List
import httpx

from src.connectors.base import AccessGrant

logger = logging.getLogger(__name__)


async def fetch_jira_access_grants(
    cloud_id: str,
    access_token: str
) -> List[AccessGrant]:
    """
    Fetch Jira projects under this Atlassian Cloud ID.
    Audience mode defaults to 'admin_set' (as specified in v5 build plan).
    """
    grants: List[AccessGrant] = []
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            url = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/project"
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                projects = resp.json()
                for p in projects:
                    pkey = p.get("key", "").upper()
                    pname = p.get("name", pkey)
                    grants.append(
                        AccessGrant(
                            source_type="jira",
                            source_native_id=pkey,
                            display_name=f"Project {pkey} ({pname})",
                            is_private=False,  # Can be configured via AudienceEditor in UI
                            allowed_member_ids=[],
                            audience_mode="admin_set"
                        )
                    )
        except Exception as exc:
            logger.error(f"Failed to fetch Jira projects for access grants: {exc}")

    return grants
