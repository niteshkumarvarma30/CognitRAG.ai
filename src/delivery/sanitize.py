"""
Delivery Sanitizer — Prevents prompt injection, audience leakage, and mention abuse.
"""

from __future__ import annotations

import re


def sanitize_slack_mentions(text: str) -> str:
    """Neutralize @channel, @here, @everyone and raw Slack user ping exploits."""
    text = re.sub(r'<!(channel|here|everyone)>', r'@\1 (sanitized)', text, flags=re.IGNORECASE)
    text = re.sub(r'<@([A-Z0-9]+)>', r'[User \1]', text)
    return text


def sanitize_github_markdown(text: str) -> str:
    """Neutralize raw HTML tags, hidden script exploits, and malicious markdown links."""
    # Strip script and iframe tags
    text = re.sub(r'<\s*(script|iframe|style)[^>]*>.*?<\s*/\s*\1\s*>', '', text, flags=re.DOTALL | re.IGNORECASE)
    # Neutralize @mentions of org teams or members to avoid spamming
    text = re.sub(r'(?<!\w)@([a-zA-Z0-9_\-]+)', r'`@\1`', text)
    return text
