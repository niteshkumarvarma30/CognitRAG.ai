"""
Delivery Formatters — Renders answers, structured citations, and warnings into
Slack Block Kit and GitHub Markdown.
"""

from __future__ import annotations

from typing import Any, Dict, List
from src.delivery.sanitize import sanitize_slack_mentions, sanitize_github_markdown


def format_slack_response(
    answer: str,
    citations: List[Dict[str, Any]],
    hidden_count: int = 0,
    withheld_sources: List[str] = None
) -> List[Dict[str, Any]]:
    """Format answer and citations into Slack Block Kit blocks."""
    sanitized_answer = sanitize_slack_mentions(answer)
    blocks: List[Dict[str, Any]] = [
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": sanitized_answer}
        }
    ]

    # If sources were withheld due to audience constraints
    if hidden_count > 0:
        sources_str = ", ".join(withheld_sources or ["restricted containers"])
        blocks.append({
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": f"🔒 *{hidden_count} source(s) withheld* ({sources_str}): visible only to members with direct access."
                }
            ]
        })

    # Citations block
    if citations:
        blocks.append({"type": "divider"})
        cite_texts = []
        for c in citations[:5]:
            pos = c.get("position", 1)
            claim = c.get("claim_text", "")
            src_type = c.get("source_type", "doc")
            url = c.get("raw_ref_url")
            link = f"<{url}|[{src_type.upper()}]>" if url else f"[{src_type.upper()}]"
            confidence = c.get("confidence_label", "high").title()
            cite_texts.append(f"*{pos}.* {link} _{claim}_ (Confidence: `{confidence}`)")

        blocks.append({
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": "📚 *Audited Citations:*\n" + "\n".join(cite_texts)
                }
            ]
        })

    return blocks


def format_github_markdown(
    answer: str,
    citations: List[Dict[str, Any]],
    hidden_count: int = 0,
    query_log_id: str = None
) -> str:
    """Format answer and citations into GitHub Markdown comment."""
    clean_answer = sanitize_github_markdown(answer)
    lines = [
        clean_answer,
        "",
        "---",
    ]

    if hidden_count > 0:
        lines.append(f"> 🔒 **{hidden_count} source(s) withheld** because they are in private channels or restricted repositories not accessible in this context.\n")

    if citations:
        lines.append("<details><summary><b>📚 Audited Citations & Sources</b></summary>\n")
        for c in citations[:5]:
            pos = c.get("position", 1)
            claim = c.get("claim_text", "")
            src_type = c.get("source_type", "doc").upper()
            url = c.get("raw_ref_url")
            link = f"[{src_type}]({url})" if url else f"[{src_type}]"
            conf = c.get("confidence_label", "high")
            lines.append(f"{pos}. **{link}** — {claim} *(Confidence: `{conf}`)*")
        lines.append("\n</details>")

    if query_log_id:
        lines.append(f"\n<sub>Audit ID: `{query_log_id}` • Verified by CognitRAG.ai</sub>")

    return "\n".join(lines)
