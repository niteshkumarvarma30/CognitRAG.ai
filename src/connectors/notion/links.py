"""Notion Deep Link Builder."""

from __future__ import annotations
from typing import Any, Dict


def build_notion_deep_link(raw_ref_url: str, metadata: Dict[str, Any]) -> str:
    """Build canonical Notion URL."""
    notion_url = metadata.get("url")
    if notion_url:
        return notion_url
    page_id = metadata.get("page_id")
    if page_id:
        clean_id = page_id.replace("-", "")
        return f"https://notion.so/{clean_id}"
    return raw_ref_url
