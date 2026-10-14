"""
Slack Message Normalizer.
Converts Slack events and conversations.history items to NormalizedDocument.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from src.connectors.base import NormalizedDocument
from src.ingestion.language_detector import detect_language


def normalize_slack_message(
    channel_id: str,
    channel_name: str,
    message: Dict[str, Any],
    is_private: bool = False,
    team_domain: str = "slack"
) -> Optional[NormalizedDocument]:
    """Normalize a single message or thread reply from Slack."""
    # Skip bot messages or subtype events like channel_join
    subtype = message.get("subtype")
    if subtype in ("channel_join", "channel_leave", "bot_add"):
        return None

    text = message.get("text", "").strip()
    if not text:
        return None

    ts = message.get("ts", "")
    user = message.get("user", "unknown")
    thread_ts = message.get("thread_ts")

    # Native ID
    source_native_id = f"{channel_id}:{ts}"
    parent_id = f"{channel_id}:{thread_ts}" if thread_ts and thread_ts != ts else None

    # Construct timestamp
    try:
        dt = datetime.fromtimestamp(float(ts), tz=timezone.utc)
    except Exception:
        dt = None

    # Clean URL
    clean_ts = ts.replace(".", "")
    raw_ref_url = f"https://{team_domain}.slack.com/archives/{channel_id}/p{clean_ts}"

    # Tokens: 'slack_channel:<id>'. If public channel, also include 'public'
    tokens = [f"slack_channel:{channel_id}"]
    if not is_private:
        tokens.append("public")

    # Detect language (handles English, Hinglish 'hi-latn', and mixed)
    lang_tag, _ = detect_language(text)

    title = f"#{channel_name} - message by {user}"
    if parent_id:
        title = f"#{channel_name} - thread reply by {user}"

    return NormalizedDocument(
        source_type="slack",
        source_native_id=source_native_id,
        parent_id=parent_id,
        title=title,
        content=text,
        author=user,
        raw_ref_url=raw_ref_url,
        source_timestamp=dt,
        language_tag=lang_tag,
        allowed_entities=tokens,
        metadata={
            "channel_id": channel_id,
            "channel_name": channel_name,
            "ts": ts,
            "thread_ts": thread_ts,
            "team_domain": team_domain,
            "is_private": is_private,
        }
    )
