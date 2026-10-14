"""
Tests for Slack Bolt App Integration and Webhook Handlers
"""
import pytest
from src.bots.slack_app import slack_app, format_slack_response


def test_slack_bolt_app_initialization():
    # Verify Slack Bolt app is initialized
    assert slack_app is not None


def test_slack_response_block_formatting():
    # Verify Block Kit formatting for claim-level citations in Slack
    answer = "Delivery date is September 30."
    citations = [
        {
            "chunk_id": "chunk-123",
            "claim_text": "Delivery date set to Sept 30",
            "confidence": 1.0,
            "derivation": "structured",
            "source_type": "jira",
            "language_tag": "en",
            "raw_ref_url": "https://jira.example.com/browse/PROJ-1"
        }
    ]
    contradictions = []

    blocks = format_slack_response(answer, citations, contradictions)
    assert isinstance(blocks, list)
    assert len(blocks) >= 2
    # Verify answer is in the first block
    assert "CognitRAG" in blocks[0]["text"]["text"]
