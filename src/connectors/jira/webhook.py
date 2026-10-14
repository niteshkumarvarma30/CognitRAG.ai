"""
Jira Webhook Handler.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Optional
from src.connectors.base import NormalizedDocument
from src.connectors.jira.normalize import normalize_jira_issue

logger = logging.getLogger(__name__)


def process_jira_event(payload: Dict[str, Any]) -> Optional[NormalizedDocument]:
    """Parse a Jira webhook payload (e.g. jira:issue_created, jira:issue_updated)."""
    webhook_event = payload.get("webhookEvent")
    if not webhook_event:
        return None

    if "issue" in webhook_event:
        issue = payload.get("issue")
        if issue:
            return normalize_jira_issue(issue)

    return None
