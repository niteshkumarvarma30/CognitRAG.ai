"""Jira Deep Link Builder."""

from __future__ import annotations
from typing import Any, Dict


def build_jira_deep_link(raw_ref_url: str, metadata: Dict[str, Any]) -> str:
    """Build canonical Jira browse URL: https://<site>.atlassian.net/browse/<KEY-123>"""
    site_url = metadata.get("site_url", "").rstrip("/")
    issue_key = metadata.get("issue_key")
    if site_url and issue_key:
        return f"{site_url}/browse/{issue_key}"
    return raw_ref_url
