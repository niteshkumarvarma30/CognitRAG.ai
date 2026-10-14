"""
GitHub Permissions & Access Grants Synchronizer.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List
import httpx

from src.connectors.base import AccessGrant

logger = logging.getLogger(__name__)


async def fetch_github_access_grants(
    installation_token: str,
) -> List[AccessGrant]:
    """
    Query GitHub API for repositories accessible under this installation.
    Each repo becomes an AccessGrant with token 'github_repo:<owner>/<repo>'.
    """
    grants: List[AccessGrant] = []
    headers = {
        "Authorization": f"Bearer {installation_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get("https://api.github.com/installation/repositories", headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                repos = data.get("repositories", [])
                for repo in repos:
                    full_name = repo.get("full_name", "").lower()
                    is_private = repo.get("private", False)
                    grants.append(
                        AccessGrant(
                            source_type="github",
                            source_native_id=full_name,
                            display_name=repo.get("name", full_name),
                            is_private=is_private,
                            allowed_member_ids=[],  # Filled or mirrored based on collaborators
                            audience_mode="mirrored"
                        )
                    )
        except Exception as exc:
            logger.error(f"Failed to fetch GitHub repositories for access grants: {exc}")

    return grants
