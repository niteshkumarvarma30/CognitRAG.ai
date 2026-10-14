import os
from typing import List, Dict
from src.retrieval.hybrid import vector_search, keyword_search, compute_rrf, get_embedding
from src.retrieval.multi_view_query import expand_query

def multi_view_retrieve(tenant_id: str, user_id: str, query: str, language_tag: str = "mixed", top_k: int = 10, user_permissions: list[str] = None) -> List[Dict]:
    """
    Multi-View Retrieval Architecture:
    1. Expand original query into multiple views (Surface + English Pivot).
    2. Embed each view.
    3. Run parallel vector + keyword searches for each view.
    4. Combine all resulting chunk sets mathematically using RRF.
    """
    if user_permissions is None:
        user_permissions = ["public"]
        
    views = expand_query(query, language_tag)
    print(f"[Multi-View] Views generated: {views}")
    
    view_results = []
    for view in views:
        view_embedding = get_embedding(view, language_tag="en" if view != query else language_tag)
        
        # Vector search
        v_res = vector_search(
            tenant_id=tenant_id,
            query=view,
            query_embedding=view_embedding,
            top_k=top_k,
            user_id=user_id,
            user_permissions=user_permissions
        )
        # Keyword search (BM25 fallback)
        k_res = keyword_search(
            tenant_id=tenant_id,
            query=view,
            top_k=top_k,
            user_id=user_id,
            user_permissions=user_permissions
        )
        # Fuse arms within this view
        view_fused, _ = compute_rrf(
            vector_res=v_res,
            keyword_res=k_res,
            graph_res=[],
            k=60,
            vector_weight=1.5,
            keyword_weight=1.0
        )
        view_results.append(view_fused[:top_k])
        
    if not view_results:
        return []
    if len(view_results) == 1:
        return view_results[0]
        
    # Cross-view Reciprocal Rank Fusion across view 1 (Surface) and view 2 (English Pivot)
    fused_results, _ = compute_rrf(
        vector_res=view_results[0],
        keyword_res=view_results[1],
        graph_res=[],
        k=60,
        vector_weight=1.0,
        keyword_weight=1.0
    )
    return fused_results[:top_k]
