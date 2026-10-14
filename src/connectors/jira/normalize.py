"""
Jira Issue & Comment Normalizer.
Converts Jira REST API payloads into NormalizedDocument instances.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from src.connectors.base import NormalizedDocument


def parse_jira_datetime(dt_str: Optional[str]) -> Optional[datetime]:
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except Exception:
        return None


def extract_adf_text(content: Any) -> str:
    """Recursively extracts plain text from Atlassian Document Format (ADF) JSON or strings."""
    if isinstance(content, str):
        return content
    if not isinstance(content, dict):
        return ""

    text_parts = []
    if content.get("type") == "text":
        return content.get("text", "")

    for child in content.get("content", []):
        child_text = extract_adf_text(child)
        if child_text:
            text_parts.append(child_text)

    return " ".join(text_parts)


def normalize_jira_issue(
    issue: Dict[str, Any],
    site_url: str = ""
) -> NormalizedDocument:
    """Normalize a Jira issue."""
    key = issue.get("key", "UNKNOWN")
    fields = issue.get("fields") or {}
    summary = fields.get("summary", "")
    description_raw = fields.get("description")
    description = extract_adf_text(description_raw)
    
    project = fields.get("project") or {}
    project_key = project.get("key", key.split("-")[0] if "-" in key else "DEFAULT").upper()
    
    status_name = (fields.get("status") or {}).get("name", "Unknown")
    issue_type = (fields.get("issuetype") or {}).get("name", "Task")
    priority = (fields.get("priority") or {}).get("name", "Medium")
    creator = (fields.get("creator") or {}).get("displayName", "unknown")
    created_at = parse_jira_datetime(fields.get("created"))

    clean_site = site_url.rstrip("/") if site_url else "https://jira.atlassian.com"
    raw_ref_url = f"{clean_site}/browse/{key}"

    # Permission token format: 'jira_project:<KEY>'
    tokens = [f"jira_project:{project_key}"]

    content = (
        f"[{key}] {summary}\n"
        f"Project: {project_key} | Type: {issue_type} | Status: {status_name} | Priority: {priority}\n"
        f"Creator: {creator} | URL: {raw_ref_url}\n\n"
        f"{description}"
    )

    return NormalizedDocument(
        source_type="jira",
        source_native_id=key,
        title=f"[{key}] {summary}",
        content=content.strip(),
        author=creator,
        raw_ref_url=raw_ref_url,
        source_timestamp=created_at,
        allowed_entities=tokens,
        metadata={
            "issue_key": key,
            "project_key": project_key,
            "status": status_name,
            "site_url": clean_site,
        }
    )
