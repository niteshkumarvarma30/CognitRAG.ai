"""
GitHub Webhook Handler — Signature verification (HMAC-SHA256) and event normalizer.
"""

from __future__ import annotations

import hmac
import hashlib
import logging
from typing import Any, Dict, Optional, Tuple
from src.config import github as github_cfg
from src.connectors.base import NormalizedDocument
from src.connectors.github.normalize import (
    normalize_github_issue_or_pr,
    normalize_github_comment
)

logger = logging.getLogger(__name__)


def verify_github_signature(payload_bytes: bytes, signature_header: Optional[str], secret: Optional[str] = None) -> bool:
    """
    Verify GitHub webhook signature header 'sha256=<hex_hmac>'.
    Fails closed if header is missing or mismatch.
    """
    if not signature_header or not signature_header.startswith("sha256="):
        return False

    webhook_secret = secret or github_cfg.webhook_secret
    if not webhook_secret:
        logger.error("GitHub webhook secret is not configured; rejecting request.")
        return False

    expected_mac = hmac.new(
        webhook_secret.encode("utf-8"),
        payload_bytes,
        hashlib.sha256
    ).hexdigest()

    received_mac = signature_header[7:]
    return hmac.compare_digest(expected_mac, received_mac)


def process_github_event(
    event_type: str,
    payload: Dict[str, Any]
) -> Optional[NormalizedDocument]:
    """Parse a GitHub event into a NormalizedDocument (if applicable)."""
    repo_info = payload.get("repository") or {}
    repo_full_name = repo_info.get("full_name")
    is_private = repo_info.get("private", False)

    if not repo_full_name:
        return None

    action = payload.get("action")
    if action in ("deleted", "removed"):
        # Document deletion signal
        return None

    if event_type == "issues":
        issue = payload.get("issue")
        if issue:
            return normalize_github_issue_or_pr(repo_full_name, issue, is_private=is_private)

    elif event_type == "pull_request":
        pr = payload.get("pull_request")
        if pr:
            return normalize_github_issue_or_pr(repo_full_name, pr, is_private=is_private)

    elif event_type == "issue_comment":
        comment = payload.get("comment")
        issue = payload.get("issue") or {}
        parent_number = issue.get("number", 0)
        if comment and parent_number:
            return normalize_github_comment(repo_full_name, parent_number, comment, is_private=is_private)

    return None
