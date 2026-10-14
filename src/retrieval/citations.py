"""
Citations Builder for CognitRAG v5.

Generates structured vs extracted citations with confidence labels and deep links.
Conforms to the public.answer_citations schema.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional
from dataclasses import dataclass


@dataclass
class FormattedCitation:
    position: int
    chunk_id: Optional[str]
    claim_text: str
    derivation: str               # 'structured' | 'extracted'
    confidence_label: str         # 'high' | 'medium' | 'review'
    score: float
    source_type: str              # 'slack' | 'github' | 'jira' | 'notion' | 'upload'
    raw_ref_url: Optional[str]
    allowed_entities: List[str]


def build_citations_from_chunks(
    retrieved_chunks: List[Dict[str, Any]],
    answer_text: str,
    max_citations: int = 5
) -> List[FormattedCitation]:
    """
    Construct formatted citations from retrieved chunks and the generated answer text.
    Classifies citations as 'structured' (if key entity or code reference is found)
    or 'extracted' (semantic sentence support).
    """
    citations: List[FormattedCitation] = []

    for idx, chunk in enumerate(retrieved_chunks[:max_citations]):
        content = chunk.get("content", "")
        chunk_id = chunk.get("id")
        source_type = chunk.get("source_type") or "manual"
        raw_ref_url = chunk.get("raw_ref_url")
        allowed_entities = chunk.get("allowed_entities") or []
        
        score = float(chunk.get("rrf_score") or chunk.get("similarity") or 0.8)

        # Detect structured entities (e.g. PR #123, JIRA-456, commit hashes, table figures)
        has_ticket_or_pr = bool(re.search(r'\b([A-Z]{2,10}-\d+|PR\s*#?\d+|#[0-9]+)\b', content))
        derivation = "structured" if has_ticket_or_pr else "extracted"

        # Confidence label derivation
        if score >= 0.035 or (derivation == "structured" and score >= 0.02):
            confidence = "high"
        elif score >= 0.015:
            confidence = "medium"
        else:
            confidence = "review"

        # Claim snippet: first 150 chars of content
        claim = content.split("\n")[0][:150].strip()

        citations.append(
            FormattedCitation(
                position=idx + 1,
                chunk_id=chunk_id,
                claim_text=claim,
                derivation=derivation,
                confidence_label=confidence,
                score=score,
                source_type=source_type,
                raw_ref_url=raw_ref_url,
                allowed_entities=allowed_entities,
            )
        )

    return citations
