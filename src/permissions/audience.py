"""
Audience and Surface Filtering for CognitRAG v5.

Ensures answers delivered onto shared surfaces (public Slack channels, public GitHub issues)
never expose confidential text or citations whose audience exceeds the surface's audience.
"""

from __future__ import annotations

from typing import Any, Sequence
from dataclasses import dataclass


@dataclass
class AudienceFilterResult:
    is_safe_for_surface: bool
    allowed_citations: list[dict[str, Any]]
    hidden_citations_count: int
    withheld_sources: list[str]


def filter_citations_for_audience(
    citations: Sequence[dict[str, Any]],
    surface_audience_tokens: Sequence[str]
) -> AudienceFilterResult:
    """
    Given a list of citation dictionaries (with 'allowed_entities') and the audience tokens
    of the destination channel/surface, filter out citations that the channel members cannot see.
    """
    surface_set = set(surface_audience_tokens)
    allowed: list[dict[str, Any]] = []
    hidden_count = 0
    withheld_sources: set[str] = set()

    for cite in citations:
        chunk_allowed = set(cite.get("allowed_entities") or [])
        # If the chunk requires permissions not present in the surface audience, it cannot be shown in shared view
        if chunk_allowed and not (chunk_allowed & surface_set):
            hidden_count += 1
            src_type = cite.get("source_type") or "restricted"
            withheld_sources.add(src_type)
        else:
            allowed.append(cite)

    return AudienceFilterResult(
        is_safe_for_surface=(hidden_count == 0),
        allowed_citations=allowed,
        hidden_citations_count=hidden_count,
        withheld_sources=sorted(withheld_sources)
    )
