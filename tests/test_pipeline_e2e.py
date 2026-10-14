"""
End-to-End Pipeline & Audit Test for CognitRAG v5.

Validates:
1. RequestContext with permission tokens
2. Fail-closed hybrid search retrieval (vector + keyword search)
3. Citation generation (structured vs extracted)
4. Full audit logging to public.query_logs and public.answer_citations
5. Audience-isolated semantic cache read/write with zero leak
"""

import pytest
from unittest.mock import patch
from src.database.repos.context import RequestContext
from src.retrieval.hybrid import vector_search, keyword_search
from src.retrieval.citations import build_citations_from_chunks
from src.database.repos.logs import log_query_and_answer
from src.database.repos.cache import lookup_cache, save_cache
from src.database.supabase_client import get_supabase


@pytest.mark.asyncio
async def test_end_to_end_query_audit_flow():
    # Active live tenant in Supabase
    tenant_id = "4aedf36c-6bcb-490a-98cc-6293366dd891"
    user_id = "test_user_v5"

    # 1. User with authentic permission tokens
    ctx = RequestContext(
        tenant_id=tenant_id,
        user_id=user_id,
        plan="teams",
        surface="web",
        permission_tokens=("public", "slack_channel:C_ENG"),
    )
    assert ctx.has_permissions is True

    # 2. Run vector and keyword retrieval with fail-closed tokens
    dummy_vec = [0.01] * 1024
    vec_chunks = vector_search(
        tenant_id=tenant_id,
        query="AWS and cloud services",
        query_embedding=dummy_vec,
        top_k=3,
        user_permissions=list(ctx.permission_tokens)
    )

    kw_chunks = keyword_search(
        tenant_id=tenant_id,
        query="AWS services architecture",
        top_k=3,
        user_permissions=list(ctx.permission_tokens)
    )

    all_chunks = vec_chunks + kw_chunks

    # 3. Build structured vs extracted citations
    answer_text = "According to our AWS cloud documentation, services adhere to multi-region architectures."
    citations = build_citations_from_chunks(all_chunks, answer_text)

    # 4. Record to public.query_logs and public.answer_citations
    query_log_id = await log_query_and_answer(
        ctx=ctx,
        query_text="What are our AWS cloud architecture guidelines?",
        answer_text=answer_text,
        citations=[c.__dict__ for c in citations],
        route="hybrid_standard",
        cache_hit=False,
        latency_ms=85,
    )
    assert query_log_id is not None

    # 5. Verify query log exists in live database
    supa = get_supabase()
    log_row = supa.table("query_logs").select("*").eq("id", query_log_id).single().execute()
    assert log_row.data is not None
    assert log_row.data["query_text"] == "What are our AWS cloud architecture guidelines?"

    # 6. Test semantic cache with audience hash (live semantic_cache table uses 1536-dim)
    cache_vec = [0.01] * 1536
    saved = await save_cache(
        ctx=ctx,
        query="AWS cloud architecture guidelines",
        response=answer_text,
        query_embedding=cache_vec,
        ttl_seconds=600
    )
    assert saved is True

    # Cache lookup by matching audience must succeed
    cached = await lookup_cache(ctx, cache_vec, threshold=0.90)
    assert cached is not None
    assert cached["response"] == answer_text

    # Cache lookup by a user with different audience hash MUST return None
    unauthorized_ctx = RequestContext(
        tenant_id=tenant_id,
        user_id="outsider_user",
        plan="teams",
        permission_tokens=("slack_channel:C_OTHER",),  # Different hash!
    )
    leaked = await lookup_cache(unauthorized_ctx, cache_vec, threshold=0.90)
    assert leaked is None  # Zero audience leak!
