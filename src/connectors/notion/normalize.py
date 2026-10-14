"""
Notion Page & Block Normalizer.
Converts Notion API responses into NormalizedDocument instances.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from src.connectors.base import NormalizedDocument


def parse_notion_datetime(dt_str: Optional[str]) -> Optional[datetime]:
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except Exception:
        return None


def extract_title_from_properties(properties: Dict[str, Any]) -> str:
    """Extract plain text page title from Notion properties."""
    for prop_val in properties.values():
        if isinstance(prop_val, dict) and prop_val.get("type") == "title":
            title_parts = prop_val.get("title", [])
            return " ".join([t.get("plain_text", "") for t in title_parts if "plain_text" in t])
    return "Untitled Page"


def extract_plain_text_from_blocks(blocks: List[Dict[str, Any]]) -> str:
    """Extract and format textual content from a list of Notion blocks."""
    lines: List[str] = []
    for b in blocks:
        b_type = b.get("type")
        val = b.get(b_type) if b_type else None
        if isinstance(val, dict):
            rich_texts = val.get("rich_text", [])
            text = "".join([t.get("plain_text", "") for t in rich_texts if "plain_text" in t]).strip()
            if text:
                if b_type.startswith("heading_"):
                    lines.append(f"\n### {text}")
                elif b_type == "bulleted_list_item":
                    lines.append(f"- {text}")
                elif b_type == "numbered_list_item":
                    lines.append(f"1. {text}")
                elif b_type == "to_do":
                    checked = "[x]" if val.get("checked") else "[ ]"
                    lines.append(f"{checked} {text}")
                else:
                    lines.append(text)
    return "\n".join(lines)


def normalize_notion_page(
    page: Dict[str, Any],
    blocks: Optional[List[Dict[str, Any]]] = None
) -> NormalizedDocument:
    """Normalize a Notion page and its child blocks."""
    page_id = page.get("id", "").replace("-", "")
    props = page.get("properties") or {}
    title = extract_title_from_properties(props)
    
    url = page.get("url") or f"https://notion.so/{page_id}"
    created_at = parse_notion_datetime(page.get("created_time"))
    
    body = extract_plain_text_from_blocks(blocks or [])

    # Token format: 'notion_page:<clean_page_id>'
    tokens = [f"notion_page:{page_id}"]

    content = f"# {title}\nURL: {url}\n\n{body}"

    return NormalizedDocument(
        source_type="notion",
        source_native_id=page_id,
        title=title,
        content=content.strip(),
        raw_ref_url=url,
        source_timestamp=created_at,
        allowed_entities=tokens,
        metadata={
            "page_id": page_id,
            "url": url,
        }
    )
