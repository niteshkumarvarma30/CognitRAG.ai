"""Slack Deep Link Builder."""

from __future__ import annotations
from typing import Any, Dict


def build_slack_deep_link(raw_ref_url: str, metadata: Dict[str, Any]) -> str:
    """Build deep link: https://<domain>.slack.com/archives/<channel>/p<timestamp_digits>"""
    channel = metadata.get("channel_id")
    ts = metadata.get("ts")
    team_domain = metadata.get("team_domain", "app")

    if channel and ts:
        clean_ts = ts.replace(".", "")
        return f"https://{team_domain}.slack.com/archives/{channel}/p{clean_ts}"
    return raw_ref_url
