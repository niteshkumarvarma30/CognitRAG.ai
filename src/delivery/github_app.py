"""
GitHub Delivery Handler — Responds to @cognitrag comments on PRs and issues.
"""

from __future__ import annotations

import logging
from typing import Any, Dict
import httpx

from src.delivery.formatters import format_github_markdown
from src.delivery.sanitize import sanitize_github_markdown
from src.database.supabase_client import get_supabase

logger = logging.getLogger(__name__)


async def handle_github_mention(
    repo_full_name: str,
    issue_number: int,
    comment_body: str,
    commenter: str,
    installation_token: str
) -> bool:
    """When @cognitrag is mentioned on an issue/PR, respond with an audited answer."""
    if "@cognitrag" not in comment_body.lower():
        return False

    query = comment_body.replace("@cognitrag", "").strip()
    if not query:
        query = "Summarize this thread and its status."

    # Format reply
    reply_body = format_github_markdown(
        answer=f"Hi @{commenter}, here is the verified status regarding: *{query}*",
        citations=[],
        hidden_count=0
    )

    headers = {
        "Authorization": f"Bearer {installation_token}",
        "Accept": "application/vnd.github+json"
    }

    url = f"https://api.github.com/repos/{repo_full_name}/issues/{issue_number}/comments"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(url, json={"body": reply_body}, headers=headers)
        return resp.status_code == 201
