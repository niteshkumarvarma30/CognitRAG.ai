import os
import sys
import json
from typing import List, Dict, Tuple
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dotenv import load_dotenv
load_dotenv()

from src.retrieval.hybrid import vector_search, keyword_search, compute_rrf, get_embedding
from src.retrieval.multi_view_query import expand_query
from Evaluation.store_results import RESULTS_DIR

TENANT_ID = "4aedf36c-6bcb-490a-98cc-6293366dd891"
USER_ID = "eval_user"

# 10 diverse technical queries across AWS API Gateway Developer Guide (997 chunks)
EVAL_CASES = [
    {
        "id": "MV-01",
        "topic": "WebSocket Two-Way Messaging",
        "query": "WebSocket API mein client aur server dono taraf messages kaise bhejte hain?",
        "gold_chunk_id": "dcf7758d-5c52-4b23-a567-8d5217065888"
    },
    {
        "id": "MV-02",
        "topic": "Payload Schema & Model Template",
        "query": "Payload mapping template ke liye schema aur model kaise define karein?",
        "gold_chunk_id": "4c455501-bb03-4874-963c-277e4785e0d2"
    },
    {
        "id": "MV-03",
        "topic": "Lambda Authorizer Authentication",
        "query": "API Gateway mein Lambda custom authorizer authentication kaise configure karte hain?",
        "gold_chunk_id": "3db1332d-9428-4cbd-9903-668558d89876"
    },
    {
        "id": "MV-04",
        "topic": "Usage Plans & API Keys",
        "query": "Customer tiers ke liye usage plans aur API keys kaise assign karein?",
        "gold_chunk_id": "76f5dcbf-27f0-4983-9e18-67762ff785ba"
    },
    {
        "id": "MV-05",
        "topic": "Request Throttling & Rate Limits",
        "query": "API Gateway request rate limit aur throttling parameters kaise kaam karte hain?",
        "gold_chunk_id": "963a1b8f-8a29-4110-87f4-21d677213ee8"
    },
    {
        "id": "MV-06",
        "topic": "CORS Headers Configuration",
        "query": "Cross-origin resource sharing CORS headers REST API mein kaise add karein?",
        "gold_chunk_id": "8f8f2b6b-0c98-4f79-85f0-161b6968c6e4"
    },
    {
        "id": "MV-07",
        "topic": "Mutual TLS mTLS Authentication",
        "query": "Certificate based mutual TLS authentication kaise setup karein?",
        "gold_chunk_id": "f6fbda4c-b3a6-4ef6-b428-7f4e67bd1b92"
    },
    {
        "id": "MV-08",
        "topic": "VPC Link Private Integration",
        "query": "Private VPC network resources connect karne ke liye VPC link kaise banayein?",
        "gold_chunk_id": "2278e29e-6396-45bf-94df-9c4dafeea295"
    },
    {
        "id": "MV-09",
        "topic": "CloudWatch Logging & Monitoring",
        "query": "API execution logs aur detailed metrics CloudWatch mein kaise monitor karein?",
        "gold_chunk_id": "b040db10-dc14-4061-a002-e010bb9368a2"
    },
    {
        "id": "MV-10",
        "topic": "Binary Media Types",
        "query": "Images aur binary payloads ke liye binary media types kaise configure karein?",
        "gold_chunk_id": "ac1b8fdc-72d2-495e-9384-7f6a022617fb"
    }
]

def retrieve_view_components(query: str, lang: str = "mixed", top_k: int = 5):
    emb = get_embedding(query, language_tag=lang)
    v_res = vector_search(tenant_id=TENANT_ID, query=query, query_embedding=emb, top_k=top_k, user_id=USER_ID)
    k_res = keyword_search(tenant_id=TENANT_ID, query=query, top_k=top_k, user_id=USER_ID)
    fused, _ = compute_rrf(vector_res=v_res, keyword_res=k_res, graph_res=[], k=60, vector_weight=1.5, keyword_weight=1.0)
    return v_res, k_res, fused[:top_k]

def evaluate_retrieval(retrieved_docs: List[Dict], gold_id: str, k_list: List[int] = [1, 3, 5]) -> Tuple[Dict[int, int], float]:
    ranks = {}
    found_rank = None
    for i, doc in enumerate(retrieved_docs):
        doc_id = str(doc.get("id", ""))
        if doc_id == gold_id or gold_id in doc_id:
            found_rank = i + 1
            break
            
    for k in k_list:
        ranks[k] = 1 if (found_rank is not None and found_rank <= k) else 0
        
    mrr = (1.0 / found_rank) if found_rank is not None else 0.0
    return ranks, mrr

def run_ablation():
    print("=" * 80, flush=True)
    print("COGNITRAG — MULTI-VIEW RETRIEVAL ABLATION BENCHMARK", flush=True)
    print(f"Scope: N={len(EVAL_CASES)} queries against real AWS API Gateway Guide (997 chunks)", flush=True)
    print("Comparing: Baseline (Surface View) vs English Pivot View vs Multi-View (RRF Fused)", flush=True)
    print("=" * 80, flush=True)

    results = {
        "baseline": {"hits": {1: 0, 3: 0, 5: 0}, "mrr_sum": 0.0},
        "pivot_only": {"hits": {1: 0, 3: 0, 5: 0}, "mrr_sum": 0.0},
        "multiview": {"hits": {1: 0, 3: 0, 5: 0}, "mrr_sum": 0.0},
    }

    per_view_stats = {
        "rescues_by_multiview": 0,
        "pivot_unique_finds": 0,
        "surface_unique_finds": 0,
        "both_found": 0,
        "both_missed": 0,
        "total_unique_chunks_surface": 0,
        "total_unique_chunks_pivot": 0,
        "total_shared_chunks": 0
    }

    detailed_traces = []

    for idx, case in enumerate(EVAL_CASES, 1):
        q = case["query"]
        gold_id = case["gold_chunk_id"]
        topic = case["topic"]
        print(f"\n[{idx:02d}/{len(EVAL_CASES)}] Topic: {topic}", flush=True)
        print(f"  Hinglish Query: \"{q}\"", flush=True)

        # 1. Expand query to get Views (Single Groq call)
        views = expand_query(q, language_tag="mixed")
        pivot_query = views[1] if len(views) > 1 else q
        print(f"  English Pivot : \"{pivot_query}\"", flush=True)

        # 2. View 1 (Surface / Baseline)
        s_vec, s_key, surface_docs = retrieve_view_components(q, lang="mixed", top_k=5)

        # 3. View 2 (English Pivot)
        p_vec, p_key, pivot_docs = retrieve_view_components(pivot_query, lang="en", top_k=5)

        # 4. Multi-View (Fused RRF of both views without duplicate calls)
        all_vec = s_vec + p_vec
        all_key = s_key + p_key
        mv_docs, _ = compute_rrf(vector_res=all_vec, keyword_res=all_key, graph_res=[], k=60, vector_weight=1.5, keyword_weight=1.0)
        mv_docs = mv_docs[:5]

        # Score all three
        b_hits, b_mrr = evaluate_retrieval(surface_docs, gold_id)
        p_hits, p_mrr = evaluate_retrieval(pivot_docs, gold_id)
        m_hits, m_mrr = evaluate_retrieval(mv_docs, gold_id)

        for k in [1, 3, 5]:
            results["baseline"]["hits"][k] += b_hits[k]
            results["pivot_only"]["hits"][k] += p_hits[k]
            results["multiview"]["hits"][k] += m_hits[k]
        results["baseline"]["mrr_sum"] += b_mrr
        results["pivot_only"]["mrr_sum"] += p_mrr
        results["multiview"]["mrr_sum"] += m_mrr

        # Overlap analysis
        s_ids = {d.get("id") for d in surface_docs}
        p_ids = {d.get("id") for d in pivot_docs}
        shared = s_ids & p_ids
        per_view_stats["total_unique_chunks_surface"] += len(s_ids - p_ids)
        per_view_stats["total_unique_chunks_pivot"] += len(p_ids - s_ids)
        per_view_stats["total_shared_chunks"] += len(shared)

        b_succ = (b_hits[5] == 1)
        p_succ = (p_hits[5] == 1)
        m_succ = (m_hits[5] == 1)

        if not b_succ and m_succ:
            per_view_stats["rescues_by_multiview"] += 1
            print(f"  🚀 [MULTI-VIEW RESCUE] Baseline failed top-5, Multi-View retrieved gold chunk (MRR={m_mrr:.2f})!", flush=True)

        if b_succ and p_succ:
            per_view_stats["both_found"] += 1
        elif b_succ and not p_succ:
            per_view_stats["surface_unique_finds"] += 1
        elif not b_succ and p_succ:
            per_view_stats["pivot_unique_finds"] += 1
        else:
            per_view_stats["both_missed"] += 1

        print(f"  Recall@5: Baseline={b_hits[5]} | Pivot={p_hits[5]} | Multi-View={m_hits[5]}", flush=True)
        print(f"  MRR:      Baseline={b_mrr:.3f} | Pivot={p_mrr:.3f} | Multi-View={m_mrr:.3f}", flush=True)

        detailed_traces.append({
            "id": case["id"],
            "topic": topic,
            "query": q,
            "pivot_query": pivot_query,
            "gold_chunk_id": gold_id,
            "baseline_mrr": b_mrr,
            "pivot_mrr": p_mrr,
            "multiview_mrr": m_mrr,
            "baseline_recall_5": b_hits[5],
            "pivot_recall_5": p_hits[5],
            "multiview_recall_5": m_hits[5]
        })

    n = len(EVAL_CASES)
    summary = {
        "n": n,
        "baseline": {
            "recall@1": round(results["baseline"]["hits"][1] / n, 4),
            "recall@3": round(results["baseline"]["hits"][3] / n, 4),
            "recall@5": round(results["baseline"]["hits"][5] / n, 4),
            "mrr": round(results["baseline"]["mrr_sum"] / n, 4)
        },
        "pivot_only": {
            "recall@1": round(results["pivot_only"]["hits"][1] / n, 4),
            "recall@3": round(results["pivot_only"]["hits"][3] / n, 4),
            "recall@5": round(results["pivot_only"]["hits"][5] / n, 4),
            "mrr": round(results["pivot_only"]["mrr_sum"] / n, 4)
        },
        "multiview": {
            "recall@1": round(results["multiview"]["hits"][1] / n, 4),
            "recall@3": round(results["multiview"]["hits"][3] / n, 4),
            "recall@5": round(results["multiview"]["hits"][5] / n, 4),
            "mrr": round(results["multiview"]["mrr_sum"] / n, 4)
        },
        "lift": {
            "recall@5_delta": round((results["multiview"]["hits"][5] - results["baseline"]["hits"][5]) / n, 4),
            "mrr_delta": round((results["multiview"]["mrr_sum"] - results["baseline"]["mrr_sum"]) / n, 4)
        },
        "per_view_contribution": per_view_stats,
        "traces": detailed_traces
    }

    print("\n" + "=" * 80, flush=True)
    print("FINAL MULTI-VIEW ABLATION RESULTS", flush=True)
    print("=" * 80, flush=True)
    print(f"{'Metric':<18} | {'Baseline (Surface)':<20} | {'English Pivot':<20} | {'Multi-View (Fused)':<20} | {'Lift (Δ)':<10}", flush=True)
    print("-" * 96, flush=True)
    for m in ["recall@1", "recall@3", "recall@5", "mrr"]:
        b_val = summary["baseline"][m]
        p_val = summary["pivot_only"][m]
        mv_val = summary["multiview"][m]
        delta = mv_val - b_val
        delta_str = f"+{delta*100:.1f}%" if "recall" in m else f"+{delta:.3f}"
        b_str = f"{b_val*100:.1f}%" if "recall" in m else f"{b_val:.3f}"
        p_str = f"{p_val*100:.1f}%" if "recall" in m else f"{p_val:.3f}"
        mv_str = f"{mv_val*100:.1f}%" if "recall" in m else f"{mv_val:.3f}"
        print(f"{m:<18} | {b_str:<20} | {p_str:<20} | {mv_str:<20} | {delta_str:<10}", flush=True)

    print("\n--- PER-VIEW CONTRIBUTION BREAKDOWN ---", flush=True)
    print(f"Total Multi-View Rescues (Baseline failed top-5, Multi-View succeeded): {per_view_stats['rescues_by_multiview']} queries", flush=True)
    print(f"Pivot Unique Discoveries: {per_view_stats['pivot_unique_finds']} queries", flush=True)
    print(f"Surface Unique Discoveries: {per_view_stats['surface_unique_finds']} queries", flush=True)
    print(f"Shared Chunk Overlap Across All Queries: {per_view_stats['total_shared_chunks']} chunks", flush=True)
    print(f"Surface-Only Unique Retrieved Chunks: {per_view_stats['total_unique_chunks_surface']} chunks", flush=True)
    print(f"Pivot-Only Unique Retrieved Chunks: {per_view_stats['total_unique_chunks_pivot']} chunks", flush=True)

    out_file = os.path.join(RESULTS_DIR, "multiview_ablation_results.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    print(f"\nSaved full results and traces to: {out_file}", flush=True)

if __name__ == "__main__":
    run_ablation()
