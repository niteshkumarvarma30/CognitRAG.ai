import os
import re
from src.database.supabase_client import supabase_manager
from src.database.neo4j_client import neo4j_manager
from src.retrieval.cache import LRUCache
import openai

# Identifier pattern for Jira keys (BILL-101), GitHub PRs (PR #45, #45), Slack channels (#incident-spark-deadlock), RFCs, and mentions (@username)
IDENTIFIER_REGEX = re.compile(r'([A-Z]{2,10}-\d+|PR\s*#?\d+|#\d+|#[a-zA-Z][a-zA-Z0-9_\-]+|RFC-\d+|@[\w-]+)', re.IGNORECASE)

def detect_query_source_type(query: str) -> str:
    """Classifies the target source document type explicitly queried by the user."""
    q = query.lower()
    if re.search(r'(?:pr\s*#?\d+|pull request)', q) or "github" in q:
        return "github"
    if re.search(r'#[a-zA-Z][a-zA-Z0-9_\-]+', q) or "slack" in q or "channel" in q:
        return "slack"
    if "jira" in q or "ticket" in q or re.search(r'\b[a-z]{2,10}-\d+\b', q):
        return "jira"
    if "rfc" in q or "notion" in q:
        return "notion"
    if "10-k" in q or "sec" in q or "form 10-k" in q or "note 12" in q or "note 3" in q or "soc 2" in q or "sla" in q:
        return "sec_edgar"
    return "general"

def detect_chunk_source_type(content: str, filename: str = "") -> str:
    """Determines the document origin type for a stored chunk."""
    fn = filename.lower()
    c = content.lower()
    if fn.startswith("slack_") or "channel: #" in c or "slack channel:" in c:
        return "slack"
    if fn.startswith("pr_") or "github pull request" in c:
        return "github"
    if fn.startswith("jira_") or "issue key:" in c or "jira ticket:" in c:
        return "jira"
    if fn.startswith("rfc-") or "# rfc-" in c or fn.startswith("notion:"):
        return "notion"
    if fn.startswith("msft_") or fn.startswith("aws_") or fn.startswith("soc_") or "form 10-k" in c or "service level agreement" in c or "soc 2 type ii" in c:
        return "sec_edgar"
    return "general"

embedding_cache = LRUCache(max_size=1000)

def get_embedding(text: str, language_tag: str = "en") -> list[float]:
    """Google Cloud Vertex AI text-embedding-004 (768-dim) router.
    Draws from Google for Startups $2,000 credit.
    """
    key = embedding_cache.generate_key(text + language_tag)
    cached = embedding_cache.get(key)
    if cached is not None:
        return cached

    try:
        from src.services.vertex_client import vertex_client
        vec = vertex_client.get_embedding(text)
        if not vec:
            vec = [0.0] * 768
    except Exception as e:
        print(f"[Embedding Error] Vertex AI embedding failed: {e}")
        vec = [0.0] * 768

    embedding_cache.put(key, vec, ttl_seconds=3600)
    return vec

def vector_search(tenant_id: str, query: str, query_embedding: list[float], top_k: int = 20, user_id: str = None, user_permissions: list[str] = None) -> list[dict]:
    """Cosine Similarity search using pgvector via custom RPC with fail-closed permission filtering."""
    if not user_permissions:
        # Strict fail-closed: empty permissions = 0 visible chunks
        return []

    db = supabase_manager.get_admin_client()
    try:
        rpc_params = {
            "query_embedding": query_embedding,
            "match_count": top_k,
            "p_tenant_id": tenant_id,
            "p_user_permissions": user_permissions,
        }
        dim = len(query_embedding)
        rpc_name = "match_document_chunks_768" if dim == 768 else "match_document_chunks"
        response = db.rpc(rpc_name, rpc_params).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Vector search failed: {e}")
        return []

def keyword_search(tenant_id: str, query: str, top_k: int = 20, user_id: str = None, user_permissions: list[str] = None) -> list[dict]:
    """BM25 equivalent using Postgres keyword_search_chunks RPC with GIN index and fail-closed security."""
    if not user_permissions:
        return []

    db = supabase_manager.get_admin_client()
    try:
        import re
        words = re.findall(r"\b[a-zA-Z0-9_\-\.]{2,}\b", query)
        if not words:
            return []
        sanitized_tsquery = " | ".join(words[:15])

        rpc_params = {
            "p_tsquery": sanitized_tsquery,
            "match_count": top_k,
            "p_tenant_id": tenant_id,
            "p_user_permissions": user_permissions,
        }
        response = db.rpc("keyword_search_chunks", rpc_params).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Keyword search failed: {e}")
        return []

def graph_search(tenant_id: str, user_id: str, query: str, query_entities: list[str] = None, top_k: int = 20) -> list[dict]:
    """Neo4j search matching query words or entities and pulling relationships."""
    if query_entities is None:
        query_entities = []
        
    results = []
    try:
        session = neo4j_manager.get_session()
        words = [word.lower() for word in query.replace("?", "").split() if len(word) > 2]
        def _read_tx(tx, t_id, u_id, wds, ents, tk):
            is_eval = "eval" in str(t_id).lower() or str(t_id).lower().startswith("e0a1")
            lbl = "EvalEntity" if is_eval else "Entity"
            if ents:
                q_str1 = f"""
                MATCH (e1:{lbl})-[r]->(e2:{lbl})
                WHERE e1.tenantId = $tenant_id
                AND (e1.name IN $entities OR e2.name IN $entities)
                RETURN e1.name + ' has the following relationship: ' + type(r) + ' with ' + e2.name AS content
                LIMIT $top_k
                """
            else:
                q_str1 = f"""
                MATCH (e1:{lbl})-[r]->(e2:{lbl})
                WHERE e1.tenantId = $tenant_id
                AND ANY(word IN $words WHERE toLower(e1.name) CONTAINS word OR toLower(e2.name) CONTAINS word)
                RETURN e1.name + ' has the following relationship: ' + type(r) + ' with ' + e2.name AS content
                LIMIT $top_k
                """
                
            q_str2 = f"""
            MATCH (u:User {{id: $u_id, tenantId: $tenant_id}})-[r]->(e:{lbl})
            WHERE ANY(word IN $words WHERE toLower(e.name) CONTAINS word)
            RETURN 'User has previously interacted with the topic: ' + e.name AS content
            LIMIT $top_k
            """
            
            if ents:
                res1 = [record["content"] for record in tx.run(q_str1, tenant_id=t_id, entities=ents, top_k=tk)]
            else:
                res1 = [record["content"] for record in tx.run(q_str1, tenant_id=t_id, words=wds, top_k=tk)]
                
            res2 = [record["content"] for record in tx.run(q_str2, tenant_id=t_id, u_id=u_id, words=wds, top_k=tk)]
            return res1 + res2
            
        res = session.execute_read(_read_tx, tenant_id, user_id, words, query_entities, top_k)
        for content in res:
            results.append({"content": content})
        session.close()
    except Exception as e:
        print(f"Graph search failed: {e}")
    return results

def exact_identifier_search(tenant_id: str, query: str, top_k: int = 5, user_permissions: list[str] = None) -> list[dict]:
    """
    Exact-match bypass for structured identifiers like Jira tickets (BILL-101),
    GitHub PRs (#45, PR #45), Slack channels (#incident-spark-deadlock), or @mentions.
    """
    matches = IDENTIFIER_REGEX.findall(query)
    if not matches:
        return []
    
    if not user_permissions:
        return []

    target_type = detect_query_source_type(query)
    db = supabase_manager.get_admin_client()
    results = []
    seen_ids = set()

    for token in matches:
        clean = token.strip()
        tokens_to_search = [clean]
        if clean.startswith("#"):
            if clean[1:].isdigit():
                tokens_to_search.append(f"PR {clean}")
                tokens_to_search.append(f"GitHub Pull Request #{clean[1:]}")
                tokens_to_search.append(f"GitHub Pull Request: #{clean[1:]}")
            else:
                # Slack channel identifier like #incident-stripe-webhook-outage
                core_parts = [p for p in clean.lstrip("#").replace("incident-", "").split("-") if len(p) > 2]
                if core_parts:
                    tokens_to_search.append("%".join(core_parts))
        elif re.match(r'PR\s*#?\d+', clean, re.IGNORECASE):
            num = re.search(r'\d+', clean).group(0)
            tokens_to_search.append(f"GitHub Pull Request #{num}")
            tokens_to_search.append(f"GitHub Pull Request: #{num}")
        
        is_eval = "eval" in str(tenant_id).lower() or str(tenant_id).lower().startswith("e0a1")
        chunks_tbl = "eval_document_chunks" if is_eval else "document_chunks"
        for t in tokens_to_search:
            try:
                try:
                    resp = db.table(chunks_tbl) \
                        .select("id, content, parent_id, entities, graph_score, relationship_types, allowed_entities") \
                        .eq("tenant_id", tenant_id) \
                        .ilike("content", f"%{t}%") \
                        .limit(top_k * 2) \
                        .execute()
                except Exception:
                    resp = db.table(chunks_tbl) \
                        .select("id, content, parent_id, entities, graph_score, relationship_types") \
                        .eq("tenant_id", tenant_id) \
                        .ilike("content", f"%{t}%") \
                        .limit(top_k * 2) \
                        .execute()

                if resp.data:
                    for row in resp.data:
                        cid = str(row.get("id"))
                        if cid not in seen_ids:
                            allowed = row.get("allowed_entities")
                            if allowed and not any(p in allowed for p in user_permissions):
                                continue
                            seen_ids.add(cid)
                            # Verify source document type: boost chunks matching target query source
                            chunk_type = detect_chunk_source_type(row.get("content", ""))
                            if target_type != "general" and chunk_type == target_type:
                                row["boost_factor"] = 4.0
                            else:
                                row["boost_factor"] = 1.5
                            results.append(row)
            except Exception as e:
                print(f"Identifier search error for token {t}: {e}")
                
    # Sort results so matching source type appears first
    results.sort(key=lambda x: x.get("boost_factor", 1.0), reverse=True)
    return results[:top_k]

def compute_rrf(
    vector_res: list[dict],
    keyword_res: list[dict],
    graph_res: list[dict],
    k: int = 60,
    vector_weight: float = 1.5,
    keyword_weight: float = 1.5,
    graph_weight: float = 0.5,
    exact_res: list[dict] = None,
    exact_weight: float = 3.0,
    confidence_threshold: float = 0.045
):
    """
    Fuses results mathematically using Reciprocal Rank Fusion.
    score = sum( base_weight * boost / (k + rank + 1) )
    Preserves chunk 'id' for accurate downstream citation and evaluation.
    """
    scores = {}
    metadata_map = {}
    
    def add_to_scores(results, base_weight=1.0):
        if not results:
            return
        for rank, res in enumerate(results):
            content = res.get("content", "")
            if not content:
                continue
                
            # Use chunk id as primary deduplication key; fallback to content
            grouping_key = str(res.get("id")) if res.get("id") else content
            boost = res.get("boost_factor", 1.0)
            final_weight = base_weight * boost
            
            if grouping_key not in scores:
                scores[grouping_key] = 0.0
                metadata_map[grouping_key] = {
                    "id": res.get("id"),
                    "content": content,
                    "parent_id": res.get("parent_id", ""),
                    "entities": res.get("entities", []),
                    "graph_score": res.get("graph_score", 0.0),
                    "relationship_types": res.get("relationship_types", [])
                }
            scores[grouping_key] += final_weight * (1.0 / (k + rank + 1))
            
    # Add all arms with their respective weights
    if exact_res:
        add_to_scores(exact_res, base_weight=exact_weight)
    add_to_scores(keyword_res, base_weight=keyword_weight)
    add_to_scores(vector_res, base_weight=vector_weight)
    add_to_scores(graph_res, base_weight=graph_weight)
    
    # Sort descending by RRF score
    sorted_contents = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
    
    high_confidence = False
    if sorted_contents:
        top_score = scores[sorted_contents[0]]
        if top_score >= confidence_threshold:
            high_confidence = True
            
    # Reconstruct the dictionaries preserving 'id' and 'rrf_score'
    final_results = []
    for grouping_key in sorted_contents:
        meta = metadata_map[grouping_key]
        final_results.append({
            "id": meta.get("id"),
            "content": meta["content"],
            "parent_id": meta["parent_id"],
            "entities": meta["entities"],
            "graph_score": meta["graph_score"],
            "relationship_types": meta["relationship_types"],
            "rrf_score": scores[grouping_key]
        })
            
    return final_results, high_confidence

import concurrent.futures

def hybrid_retriever(
    tenant_id: str, 
    user_id: str, 
    query: str, 
    query_embedding: list[float], 
    top_k: int = 5, 
    user_permissions: list[str] = None,
    vector_weight: float = None,
    keyword_weight: float = None,
    graph_weight: float = None,
    enable_identifier_bypass: bool = True
):
    if not user_permissions:
        print("  -> Warning: hybrid_retriever called with empty user_permissions. Failing closed.")
        return [], False
    print(f"  -> Running True Hybrid Search (Vector + Keyword + Neo4j Graph + Bypass) with ACL: {user_permissions}")
    
    # Defaults calibrated from empirical grid search (R1.1 winner)
    vw = 1.5 if vector_weight is None else vector_weight
    kw = 1.5 if keyword_weight is None else keyword_weight
    gw = 0.5 if graph_weight is None else graph_weight
    
    v_res, k_res, g_res, e_res = [], [], [], []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        future_v = executor.submit(vector_search, tenant_id, query, query_embedding, 20, user_id, user_permissions)
        future_k = executor.submit(keyword_search, tenant_id, query, 20, user_id, user_permissions)
        future_g = executor.submit(graph_search, tenant_id, user_id, query, None, 20)
        
        if enable_identifier_bypass and IDENTIFIER_REGEX.search(query):
            future_e = executor.submit(exact_identifier_search, tenant_id, query, 5, user_permissions)
        else:
            future_e = None
            
        v_res = future_v.result()
        k_res = future_k.result()
        g_res = future_g.result()
        if future_e:
            e_res = future_e.result()
            if e_res:
                print(f"  -> Identifier bypass matched {len(e_res)} candidate chunks for exact key.")
    
    print(f"  -> Applying Reciprocal Rank Fusion (RRF) [weights: vec={vw}, kw={kw}, graph={gw}]...")
    fused_docs, high_conf = compute_rrf(
        v_res, k_res, g_res,
        vector_weight=vw,
        keyword_weight=kw,
        graph_weight=gw,
        exact_res=e_res,
        exact_weight=3.0
    )
    
    # DYNAMIC TOKEN BUDGETING
    max_chars = 10000
    current_chars = len(query)
    
    top_contexts = []
    for doc in fused_docs:
        doc_chars = len(doc["content"])
        if current_chars + doc_chars > max_chars:
            print("  -> Token Budget Reached. Stopping retrieval to prevent context overflow.")
            break
        top_contexts.append(doc)
        current_chars += doc_chars
        if len(top_contexts) >= 15:
            break
            
    print(f"  -> Dynamic Budgeting allocated {len(top_contexts)} chunks using approx {current_chars//4} tokens.")
    
    # Source Document Type Verification: Prioritize chunks matching the specific source queried
    target_type = detect_query_source_type(query)
    if target_type != "general":
        matching_source = []
        other_source = []
        for doc in top_contexts:
            ctype = detect_chunk_source_type(doc.get("content", ""))
            if ctype == target_type:
                matching_source.append(doc)
            else:
                other_source.append(doc)
        if matching_source:
            top_contexts = matching_source + other_source

    return top_contexts, high_conf
