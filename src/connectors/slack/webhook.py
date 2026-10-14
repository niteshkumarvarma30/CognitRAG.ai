"""
Slack Webhook & Event Handler — Signature verification (v0=<hmac>) and event parsing.
"""

from __future__ import annotations

import hmac
import hashlib
import time
import logging
from typing import Any, Dict, Optional, Tuple
from src.config import slack as slack_cfg
from src.connectors.base import NormalizedDocument
from src.connectors.slack.normalize import normalize_slack_message

logger = logging.getLogger(__name__)


def verify_slack_signature(
    body_bytes: bytes,
    timestamp_header: Optional[str],
    signature_header: Optional[str],
    signing_secret: Optional[str] = None
) -> bool:
    """
    Verify Slack signing secret: v0=HMAC-SHA256("v0:<timestamp>:<body>").
    Fails closed if headers missing or older than 5 minutes.
    """
    if not timestamp_header or not signature_header:
        return False

    secret = signing_secret or slack_cfg.signing_secret
    if not secret:
        logger.error("Slack signing secret is not configured; rejecting request.")
        return False

    try:
        req_ts = int(timestamp_header)
        if abs(time.time() - req_ts) > 60 * 5:
            # Replay attack prevention: older than 5 minutes
            return False
    except ValueError:
        return False

    sig_basestring = f"v0:{timestamp_header}:".encode("utf-8") + body_bytes
    computed = "v0=" + hmac.new(
        secret.encode("utf-8"),
        sig_basestring,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(computed, signature_header)


def process_slack_event(payload: Dict[str, Any]) -> Optional[NormalizedDocument]:
    """Parse a Slack Events API callback payload."""
    event_type = payload.get("type")
    
    # Handle message events
    if event_type == "event_callback":
        inner_event = payload.get("event") or {}
        if inner_event.get("type") == "message":
            channel_id = inner_event.get("channel")
            return normalize_slack_message(
                channel_id=channel_id,
                channel_name=channel_id,  # Will be mapped to name during enrichment
                message=inner_event,
                is_private=False
            )

    return None
