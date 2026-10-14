"""
Notion Permissions & Page Access Grants Synchronizer.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List
import httpx

from src.connectors.base import AccessGrant
from src.connectors.notion.normalize import extract_title_from_properties

logger = logging.getLogger(__name__)


async def fetch_notion_access_grants(access_token: str) -> List[AccessGrant]:
    """
    Search Notion for shared root pages and databases.
    Audience mode defaults to 'admin_set' for Notion pages.
    """
    grants: List[AccessGrant] = []
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.post("https://api.notion.com/v1/search", json={"page_size": 50}, headers=headers)
            if resp.status_code == 200:
                results = resp.json().get("results", [])
                for item in results:
                    obj_type = item.get("object")
                    item_id = item.get("id", "").replace("-", "")
                    
                    if obj_type == "page":
                        title = extract_title_from_properties(item.get("properties", {}))
                    else:
                        title_arr = item.get("title", [])
                        title = " ".join([t.get("plain_text", "") for t in title_arr if "plain_text" in t]) or "Untitled Database"

                    grants.append(
                        AccessGrant(
                            source_type="notion",
                            source_native_id=item_id,
                            display_name=title,
                            is_private=True,
                            allowed_member_ids=[],
                            audience_mode="admin_set"
                        )
                    )
        except Exception as exc:
            logger.error(f"Failed to fetch Notion access grants: {exc}")

    return grants
