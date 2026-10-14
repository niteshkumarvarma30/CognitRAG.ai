"""GitHub URL and Deep Link Builder."""

from __future__ import annotations
from typing import Any, Dict


def build_github_deep_link(raw_ref_url: str, metadata: Dict[str, Any]) -> str:
    """Returns canonical GitHub HTML URL."""
    html_url = metadata.get("html_url")
    if html_url:
        return html_url
    return raw_ref_url
