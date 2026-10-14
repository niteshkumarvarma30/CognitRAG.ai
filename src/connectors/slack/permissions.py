"""
Slack Permissions & Channel Access Grants Synchronizer.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List
import httpx

from src.connectors.base import AccessGrant

logger = logging.getLogger(__name__)


async def fetch_slack_access_grants(bot_token: str) -> List[AccessGrant]:
    """
    Fetch public and private channels the bot is member of, including member lists.
    Mirrors permissions directly from Slack.
    """
    grants: List[AccessGrant] = []
    headers = {"Authorization": f"Bearer {bot_token}"}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # conversations.list (public and private channels)
            resp = await client.get(
                "https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=200",
                headers=headers
            )
            data = resp.json()
            if not data.get("ok"):
                logger.error(f"Slack conversations.list error: {data.get('error')}")
                return []

            channels = data.get("channels", [])
            for c in channels:
                channel_id = c.get("id")
                is_private = c.get("is_private", False)
                name = c.get("name", channel_id)

                allowed_members: List[str] = []
                # For private channels, query members
                if is_private:
                    mem_resp = await client.get(
                        f"https://slack.com/api/conversations.members?channel={channel_id}&limit=500",
                        headers=headers
                    )
                    mem_data = mem_resp.json()
                    if mem_data.get("ok"):
                        allowed_members = mem_data.get("members", [])

                grants.append(
                    AccessGrant(
                        source_type="slack",
                        source_native_id=channel_id,
                        display_name=f"#{name}",
                        is_private=is_private,
                        allowed_member_ids=allowed_members,
                        audience_mode="mirrored"
                    )
                )
        except Exception as exc:
            logger.error(f"Failed to fetch Slack channels for access grants: {exc}")

    return grants
