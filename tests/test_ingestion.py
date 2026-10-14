"""
Tests for Ingestion Pipeline, Language Detection, and Normalizer
"""
import pytest
from src.ingestion.language_detector import detect_language
from src.ingestion.normalizer import build_slack_doc, NormalizedDoc


def test_language_detector():
    # Pure English
    assert detect_language("The quarterly financial results were delivered on schedule.") == "en"

    # Hinglish (Romanized Hindi)
    hi_text = "Yaar last sprint mein kya decide hua tha, 30 sept tak ship karna hai bhai"
    detected = detect_language(hi_text)
    assert detected in ("hi-latn", "mixed"), f"Expected hi-latn or mixed, got {detected}"


def test_normalizer_structure():
    doc = build_slack_doc(
        tenant_id="00000000-0000-0000-0000-000000000001",
        channel_id="C123",
        channel_name="engineering",
        message_ts="1723632000.000100",
        user_name="Priya",
        text="Sprint planning decided the auth pattern will be OAuth 2.0.",
        language_tag="en",
        workspace_url="https://myorg.slack.com"
    )

    assert isinstance(doc, NormalizedDoc)
    assert doc.source_type == "slack"
    assert doc.author == "Priya"
    assert doc.language_tag == "en"
    assert doc.raw_ref_url == "https://myorg.slack.com/archives/C123/p1723632000000100"
