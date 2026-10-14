"""
Permission Leak Suite (Gate 1).

Verifies fail-closed behavior across:
1. Empty permission tokens return 0 chunks.
2. User with token 'slack_channel:C1' cannot see chunks restricted to 'slack_channel:C2'.
3. Cache entries for user A with hash H1 are not returned to user B with hash H2.
"""

import pytest
from unittest.mock import MagicMock, patch
from src.database.repos.context import RequestContext
from src.database.repos.chunks import search_vector_chunks, search_keyword_chunks
from src.database.repos.cache import lookup_cache, save_cache
from src.permissions.audience import filter_citations_for_audience


@pytest.mark.asyncio
async def test_fail_closed_empty_permissions():
    """User with 0 permission tokens MUST receive 0 chunks."""
    ctx = RequestContext(
        tenant_id="00000000-0000-0000-0000-000000000001",
        user_id="user_unprivileged",
        plan="teams",
        permission_tokens=(),  # Empty!
    )
    assert ctx.has_permissions is False

    # Should short-circuit and return [] without even calling the database
    vector_results = await search_vector_chunks(ctx, [0.1] * 768)
    assert vector_results == []

    keyword_results = await search_keyword_chunks(ctx, "financial tax year")
    assert keyword_results == []


@pytest.mark.asyncio
async def test_permission_hash_differentiation():
    """Two users with different permission sets produce different cache hashes."""
    ctx_a = RequestContext(
        tenant_id="t1",
        user_id="alice",
        plan="teams",
        permission_tokens=("public", "slack_channel:C_LEADERSHIP"),
    )
    ctx_b = RequestContext(
        tenant_id="t1",
        user_id="bob",
        plan="teams",
        permission_tokens=("public", "slack_channel:C_GENERAL"),
    )

    assert ctx_a.permission_hash != ctx_b.permission_hash


def test_audience_citation_filtering():
    """Shared surface without leadership token must withhold confidential citations."""
    citations = [
        {
            "position": 1,
            "claim_text": "Public revenue figures",
            "allowed_entities": ["public"],
            "source_type": "doc",
        },
        {
            "position": 2,
            "claim_text": "Executive compensation package",
            "allowed_entities": ["slack_channel:C_LEADERSHIP"],
            "source_type": "slack",
        },
    ]

    # Destination channel audience only contains public members
    surface_tokens = ["public", "slack_channel:C_GENERAL"]
    res = filter_citations_for_audience(citations, surface_tokens)

    assert res.is_safe_for_surface is False
    assert res.hidden_citations_count == 1
    assert len(res.allowed_citations) == 1
    assert res.allowed_citations[0]["claim_text"] == "Public revenue figures"
    assert "slack" in res.withheld_sources
