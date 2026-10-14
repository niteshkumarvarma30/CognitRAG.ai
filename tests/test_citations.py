"""
Tests for Claim-Level Citation Schema and Derivation Tiers
"""
import pytest
from pydantic import BaseModel
from typing import List, Optional


class Citation(BaseModel):
    chunk_id: Optional[str] = "chunk_1"
    claim_text: str
    confidence: float
    derivation: str  # "structured" | "extracted"
    source_type: str
    language_tag: str
    raw_ref_url: Optional[str] = None
    author: Optional[str] = None


def test_structured_citation_derivation():
    # Structured citations come from native APIs and have 1.0 confidence
    citation = Citation(
        claim_text="delivery date set to Sept 30",
        confidence=1.0,
        derivation="structured",
        source_type="jira",
        language_tag="en",
        raw_ref_url="https://myorg.atlassian.net/browse/PROJ-142",
        author="Priya Sharma"
    )

    assert citation.derivation == "structured"
    assert citation.confidence == 1.0
    assert citation.source_type == "jira"
    assert "PROJ-142" in citation.raw_ref_url


def test_extracted_citation_derivation():
    # Extracted citations come from LLM inference over conversational text
    citation = Citation(
        claim_text="30 sept tak ship karna hai bhai",
        confidence=0.78,
        derivation="extracted",
        source_type="slack",
        language_tag="hi-latn",
        raw_ref_url="https://myorg.slack.com/archives/C123/p1723632000",
        author="Rahul Singh"
    )

    assert citation.derivation == "extracted"
    assert citation.confidence < 1.0
    assert citation.language_tag == "hi-latn"
    assert citation.source_type == "slack"
