"""
CognitRAG v2 — Slack App (Bolt for Python)
Handles /ask slash commands, @mentions, and event subscriptions.
End users interact with this — they never visit the website.
"""
import os
import json
from slack_bolt import App
from slack_bolt.adapter.fastapi import SlackRequestHandler
from src.database.supabase_client import supabase_manager

SLACK_BOT_TOKEN = os.environ.get("SLACK_BOT_TOKEN", "")
SLACK_SIGNING_SECRET = os.environ.get("SLACK_SIGNING_SECRET", "")

# Initialize Slack Bolt App
slack_app = App(
    token=SLACK_BOT_TOKEN,
    signing_secret=SLACK_SIGNING_SECRET
)
handler = SlackRequestHandler(slack_app)


def get_tenant_id_from_team(team_id: str) -> str | None:
    """Resolve Slack team_id to CognitRAG tenant_id."""
    db = supabase_manager.get_admin_client()
    try:
        result = db.table("tenants")\
            .select("id")\
            .eq("slack_team_id", team_id)\
            .execute()
        if result.data:
            return result.data[0]["id"]
    except Exception as e:
        print(f"Failed to resolve tenant for team {team_id}: {e}")
    return None


def format_slack_response(answer: str, citations: list[dict], contradictions: list[dict]) -> list[dict]:
    """
    Format CognitRAG response as Slack Block Kit blocks.
    This is the key UI for end users — claim-level citations in Slack.
    """
    blocks = [
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"🧠 *CognitRAG:*\n{answer}"}
        }
    ]

    if citations:
        blocks.append({"type": "divider"})
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": "*📎 Sources:*"}
        })

        for cite in citations[:5]:  # Max 5 citations in Slack
            derivation = cite.get("derivation", "extracted")
            confidence = cite.get("confidence", 0.0)
            source_type = cite.get("source_type", "unknown")
            language = cite.get("language_tag", "en")
            snippet = cite.get("content_snippet", cite.get("claim_text", ""))[:120]
            raw_url = cite.get("raw_ref_url", "")

            # Confidence tier label
            if derivation == "structured":
                tier_emoji = "🟢"
                tier_label = f"STRUCTURED 1.0"
            elif confidence >= 0.8:
                tier_emoji = "🟡"
                tier_label = f"EXTRACTED {confidence:.2f}"
            else:
                tier_emoji = "🔴"
                tier_label = f"EXTRACTED {confidence:.2f}"

            # Language badge
            lang_badge = ""
            if language == "hi-latn":
                lang_badge = " · `HI-LATN`"
            elif language == "mixed":
                lang_badge = " · `MIXED`"

            source_icon = {
                "slack": "💬", "github": "🐙", "jira": "📋",
                "notion": "📓", "drive": "📁",
                "meeting_zoom": "📹", "meeting_meet": "📹", "meeting_teams": "📹"
            }.get(source_type, "📄")

            cite_text = f"{tier_emoji} `{tier_label}`{lang_badge}\n{source_icon} _{snippet}_"

            cite_block: dict = {
                "type": "section",
                "text": {"type": "mrkdwn", "text": cite_text}
            }

            if raw_url:
                cite_block["accessory"] = {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "View Source"},
                    "url": raw_url
                }

            blocks.append(cite_block)

    if contradictions:
        blocks.append({"type": "divider"})
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"⚠️ *{len(contradictions)} conflicting claim(s) found* — check the audit dashboard for details."
            }
        })

    return blocks


# ============================================================
# SLASH COMMAND: /ask
# ============================================================
@slack_app.command("/ask")
def handle_ask_command(ack, body, say, client):
    """
    Main end-user command. 
    Usage: /ask yaar, last sprint mein kya decide kiya tha?
    """
    ack()  # Acknowledge immediately (Slack requires <3s response)

    question = body.get("text", "").strip()
    team_id = body.get("team_id")
    user_id = body.get("user_id")
    channel_id = body.get("channel_id")

    if not question:
        say("Please provide a question: `/ask your question here`")
        return

    # Show thinking indicator
    client.chat_postMessage(
        channel=channel_id,
        text=f"🔍 Searching company brain for: _{question}_..."
    )

    tenant_id = get_tenant_id_from_team(team_id)
    if not tenant_id:
        say("❌ CognitRAG is not configured for this workspace. Ask your admin to visit cognitrag.ai/install")
        return

    try:
        # Call the RAG pipeline
        import requests as req
        api_base = os.environ.get("API_BASE_URL", "http://localhost:8000")
        response = req.post(
            f"{api_base}/api/v1/chat",
            json={
                "tenant_id": tenant_id,
                "user_id": user_id,
                "message": question,
                "chat_history": []
            },
            timeout=60
        )
        response.raise_for_status()
        data = response.json()

        answer = data.get("answer", data.get("generation", "No answer found."))
        citations = data.get("citations", [])
        contradictions = data.get("contradictions", [])

        blocks = format_slack_response(answer, citations, contradictions)

        client.chat_postMessage(
            channel=channel_id,
            blocks=blocks,
            text=answer  # Fallback for notifications
        )

    except Exception as e:
        print(f"Slack /ask error: {e}")
        say(f"❌ Something went wrong. Please try again or contact your admin.")


# ============================================================
# APP MENTION: @cognitrag
# ============================================================
@slack_app.event("app_mention")
def handle_mention(body, say, client):
    """
    Handle @cognitrag mentions in any channel.
    Strips the mention and processes the question.
    """
    import re
    event = body.get("event", {})
    text = event.get("text", "")
    channel = event.get("channel")
    team_id = body.get("team_id")
    user_id = event.get("user")

    # Remove @mention from text
    question = re.sub(r'<@\w+>', '', text).strip()
    if not question:
        say("What would you like to know? Mention me with a question!")
        return

    tenant_id = get_tenant_id_from_team(team_id)
    if not tenant_id:
        say("CognitRAG is not configured for this workspace.")
        return

    try:
        import requests as req
        api_base = os.environ.get("API_BASE_URL", "http://localhost:8000")
        response = req.post(
            f"{api_base}/api/v1/chat",
            json={"tenant_id": tenant_id, "user_id": user_id, "message": question, "chat_history": []},
            timeout=60
        )
        response.raise_for_status()
        data = response.json()

        answer = data.get("answer", data.get("generation", "No answer found."))
        citations = data.get("citations", [])
        contradictions = data.get("contradictions", [])

        blocks = format_slack_response(answer, citations, contradictions)
        client.chat_postMessage(channel=channel, blocks=blocks, text=answer)

    except Exception as e:
        print(f"Slack mention error: {e}")
        say("Something went wrong. Please try again.")


# ============================================================
# MESSAGE EVENTS (for ingestion — captures new messages)
# ============================================================
@slack_app.event("message")
def handle_message_event(body, logger):
    """
    Capture new Slack messages for real-time ingestion.
    Skips bot messages and edited messages.
    """
    event = body.get("event", {})
    
    # Skip bot messages and edits
    if event.get("bot_id") or event.get("subtype"):
        return

    team_id = body.get("team_id")
    tenant_id = get_tenant_id_from_team(team_id)
    if not tenant_id:
        return

    # Queue for background ingestion
    try:
        import requests as req
        api_base = os.environ.get("API_BASE_URL", "http://localhost:8000")
        req.post(
            f"{api_base}/api/v1/integrations/slack/ingest_message",
            json={"tenant_id": tenant_id, "event": event, "team_id": team_id},
            timeout=5
        )
    except Exception:
        pass  # Non-critical, don't block Slack
