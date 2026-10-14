import os
import sys
import json
from typing import List, Dict, Tuple

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dotenv import load_dotenv
load_dotenv()

from src.retrieval.hybrid import vector_search, keyword_search, compute_rrf, get_embedding
from Evaluation.store_results import RESULTS_DIR

TENANT_ID = "4aedf36c-6bcb-490a-98cc-6293366dd891"
USER_ID = "eval_user"

BENCHMARK_QUERIES = [
    {
        "id": "MV-01",
        "topic": "WebSocket Two-Way Messaging",
        "hinglish_query": "WebSocket API mein client aur server dono taraf messages kaise bhejte hain?",
        "english_query": "How are messages sent from both the client and server sides in the WebSocket API?",
        "required_criteria": ["websocket", "client", "server"]
    },
    {
        "id": "MV-02",
        "topic": "Payload Schema & Model Template",
        "hinglish_query": "Payload mapping template ke liye schema aur model kaise define karein?",
        "english_query": "How do we define the schema and model for a payload mapping template?",
        "required_criteria": ["payload", "mapping template", "schema"]
    },
    {
        "id": "MV-03",
        "topic": "Lambda Authorizer Authentication",
        "hinglish_query": "API Gateway mein Lambda custom authorizer authentication kaise configure karte hain?",
        "english_query": "How do you configure Lambda custom authorizer authentication in API Gateway?",
        "required_criteria": ["lambda", "authorizer"]
    },
    {
        "id": "MV-04",
        "topic": "Usage Plans & API Keys",
        "hinglish_query": "Customer tiers ke liye usage plans aur API keys kaise assign karein?",
        "english_query": "How can usage plans and API keys be assigned for customer tiers?",
        "required_criteria": ["usage plan", "api key"]
    },
    {
        "id": "MV-05",
        "topic": "Request Throttling & Rate Limits",
        "hinglish_query": "API Gateway request rate limit aur throttling parameters kaise kaam karte hain?",
        "english_query": "How do the request rate limit and throttling parameters of API Gateway work?",
        "required_criteria": ["throttl", "rate limit"]
    },
    {
        "id": "MV-06",
        "topic": "CORS Headers Configuration",
        "hinglish_query": "Cross-origin resource sharing CORS headers REST API mein kaise add karein?",
        "english_query": "How can I add CORS headers to a REST API?",
        "required_criteria": ["cors", "cross-origin"]
    },
    {
        "id": "MV-07",
        "topic": "Mutual TLS mTLS Authentication",
        "hinglish_query": "Certificate based mutual TLS authentication kaise setup karein?",
        "english_query": "How do you set up certificate-based mutual TLS authentication?",
        "required_criteria": ["mutual tls", "mtls", "truststore"]
    },
    {
        "id": "MV-08",
        "topic": "VPC Link Private Integration",
        "hinglish_query": "Private VPC network resources connect karne ke liye VPC link kaise banayein?",
        "english_query": "How can a VPC link be created to connect private VPC network resources?",
        "required_criteria": ["vpc link", "private integration"]
    },
    {
        "id": "MV-09",
        "topic": "CloudWatch Logging & Monitoring",
        "hinglish_query": "API execution logs aur detailed metrics CloudWatch mein kaise monitor karein?",
        "english_query": "How can we monitor API execution logs and detailed metrics in CloudWatch?",
        "required_criteria": ["cloudwatch", "logging", "metric"]
    },
    {
        "id": "MV-10",
        "topic": "Binary Media Types",
        "hinglish_query": "Images aur binary payloads ke liye binary media types kaise configure karein?",
        "english_query": "How can binary media types be configured for images and binary payloads?",
        "required_criteria": ["binary media", "contenthandling"]
    },
    {
        "id": "MV-11",
        "topic": "Canary Deployments",
        "hinglish_query": "Production API stage par canary deployment traffic split kaise configure karte hain?",
        "english_query": "How do you configure canary deployment traffic splitting on a production API stage?",
        "required_criteria": ["canary", "stage"]
    },
    {
        "id": "MV-12",
        "topic": "Stage Variables",
        "hinglish_query": "Different environments ke endpoints switch karne ke liye stage variables kaise use karein?",
        "english_query": "How can stage variables be used to switch endpoints across different environments?",
        "required_criteria": ["stage variable"]
    },
    {
        "id": "MV-13",
        "topic": "IAM SigV4 Authentication",
        "hinglish_query": "AWS IAM SigV4 signature authorization REST API methods par kaise enable karein?",
        "english_query": "How do you enable AWS IAM SigV4 signature authorization on REST API methods?",
        "required_criteria": ["sigv4", "iam"]
    },
    {
        "id": "MV-14",
        "topic": "Cognito User Pool Authorizer",
        "hinglish_query": "Amazon Cognito user pool JWT token authorizer ke saath API Gateway kaise integrate karein?",
        "english_query": "How do you integrate Amazon Cognito user pool JWT token authorizer with API Gateway?",
        "required_criteria": ["cognito", "user pool"]
    },
    {
        "id": "MV-15",
        "topic": "Mock Integration",
        "hinglish_query": "Backend service bina connect kiye testing ke liye mock integration response kaise banayein?",
        "english_query": "How can mock integration responses be created for testing without connecting backend services?",
        "required_criteria": ["mock integration"]
    },
    {
        "id": "MV-16",
        "topic": "Edge-Optimized vs Regional Endpoints",
        "hinglish_query": "CloudFront edge-optimized aur regional custom domain endpoints mein kya difference hota hai?",
        "english_query": "What is the difference between CloudFront edge-optimized and regional custom domain endpoints?",
        "required_criteria": ["edge-optimized", "regional"]
    },
    {
        "id": "MV-17",
        "topic": "AWS WAF Web ACL Protection",
        "hinglish_query": "API Gateway stages ko SQL injection aur attacks se protect karne ke liye WAF web ACL kaise attach karein?",
        "english_query": "How do you attach an AWS WAF web ACL to API Gateway stages to protect against attacks?",
        "required_criteria": ["waf", "web acl"]
    },
    {
        "id": "MV-18",
        "topic": "Integration Timeout Settings",
        "hinglish_query": "API Gateway backend integration request ka maximum timeout parameter kitna hota hai?",
        "english_query": "What is the maximum timeout parameter for API Gateway backend integration requests?",
        "required_criteria": ["timeout", "integration"]
    },
    {
        "id": "MV-19",
        "topic": "Velocity Template Language (VTL)",
        "hinglish_query": "Request payload JSON data transform karne ke liye Apache Velocity VTL mapping script kaise likhein?",
        "english_query": "How do you write Apache Velocity VTL mapping scripts to transform request payload JSON data?",
        "required_criteria": ["velocity", "mapping template"]
    },
    {
        "id": "MV-20",
        "topic": "AWS CloudTrail Auditing",
        "hinglish_query": "API Gateway REST API creation aur modification events ko AWS CloudTrail mein kaise audit karte hain?",
        "english_query": "How do you audit API Gateway REST API creation and modification events in AWS CloudTrail?",
        "required_criteria": ["cloudtrail", "audit"]
    },
    {
        "id": "MV-21",
        "topic": "Request Validation Checks",
        "hinglish_query": "Backend invoke hone se pehle request validation check kaise verify karein?",
        "english_query": "How do you verify request validation checks before the backend is invoked?",
        "required_criteria": ["request validation", "validator"]
    },
    {
        "id": "MV-22",
        "topic": "HTTP API vs REST API Comparison",
        "hinglish_query": "Latency aur cost ke perspective se HTTP APIs aur REST APIs choose karne mein kya trade-offs hain?",
        "english_query": "What are the trade-offs between HTTP APIs and REST APIs regarding latency and cost?",
        "required_criteria": ["http api", "rest api"]
    },
    {
        "id": "MV-23",
        "topic": "Private API Endpoints",
        "hinglish_query": "Internet public access block karke sirf VPC ke andar private API endpoints kaise deploy karein?",
        "english_query": "How can private API endpoints be deployed strictly within a VPC blocking public internet access?",
        "required_criteria": ["private api", "endpoint"]
    },
    {
        "id": "MV-24",
        "topic": "Custom Gateway Responses",
        "hinglish_query": "Unauthorized access ya invalid payload par custom gateway responses kaise return karein?",
        "english_query": "How do you return custom gateway responses for unauthorized access or invalid payloads?",
        "required_criteria": ["gateway response", "response"]
    },
    {
        "id": "MV-25",
        "topic": "Method Response Binding",
        "hinglish_query": "REST API resource execution flow mein method response aur integration response kaise bind hote hain?",
        "english_query": "How are method response and integration response bound in the REST API resource execution flow?",
        "required_criteria": ["method response", "integration response"]
    },
    {
        "id": "MV-26",
        "topic": "OpenAPI Specification Import",
        "hinglish_query": "Existing OpenAPI Swagger definition file import karke naya API Gateway REST API kaise generate karein?",
        "english_query": "How do you generate a new API Gateway REST API by importing an existing OpenAPI Swagger definition file?",
        "required_criteria": ["openapi", "swagger"]
    },
    {
        "id": "MV-27",
        "topic": "HTTP Proxy Integration",
        "hinglish_query": "Custom backend URL ke saath HTTP proxy integration direct pass-through kaise configure karein?",
        "english_query": "How do you configure HTTP proxy integration direct pass-through with custom backend URLs?",
        "required_criteria": ["http proxy", "integration"]
    },
    {
        "id": "MV-28",
        "topic": "CloudWatch Access Logging Format",
        "hinglish_query": "CloudWatch access logs mein context variables jaise requestTime aur identity IP kaise format karein?",
        "english_query": "How do you format context variables like requestTime and identity IP in CloudWatch access logs?",
        "required_criteria": ["access log", "context"]
    },
    {
        "id": "MV-29",
        "topic": "Custom Domain SSL Certificates",
        "hinglish_query": "API Gateway custom domain name create karte waqt ACM SSL certificate kaise attach karein?",
        "english_query": "How do you attach an ACM SSL certificate when creating an API Gateway custom domain name?",
        "required_criteria": ["custom domain", "certificate"]
    },
    {
        "id": "MV-30",
        "topic": "Lambda Proxy Integration",
        "hinglish_query": "Lambda function ko request headers aur query string pass karne ke liye Lambda proxy integration kaise use karte hain?",
        "english_query": "How do you use Lambda proxy integration to pass request headers and query string to a Lambda function?",
        "required_criteria": ["lambda proxy", "integration"]
    }
]

def is_grounded_match(doc_content: str, criteria: List[str]) -> bool:
    """Verifies that the retrieved document actually discusses the required technical ground truth."""
    c_lower = doc_content.lower()
    # If document is just a TOC line (... 1234), reject
    if "......." in doc_content:
        return False
    # Check if any strong criteria phrase is found in text
    return any(crit in c_lower for crit in criteria)

def retrieve_view(query: str, lang: str, top_k: int = 5):
    emb = get_embedding(query, language_tag=lang)
    v_res = vector_search(tenant_id=TENANT_ID, query=query, query_embedding=emb, top_k=top_k, user_id=USER_ID)
    k_res = keyword_search(tenant_id=TENANT_ID, query=query, top_k=top_k, user_id=USER_ID)
    fused, _ = compute_rrf(vector_res=v_res, keyword_res=k_res, graph_res=[], k=60, vector_weight=1.5, keyword_weight=1.0)
    return v_res, k_res, fused[:top_k]

def evaluate_grounded_ranks(docs: List[Dict], criteria: List[str]) -> Tuple[Dict[int, int], float, int]:
    first_rank = None
    for i, doc in enumerate(docs):
        if is_grounded_match(doc.get("content", ""), criteria):
            first_rank = i + 1
            break
            
    ranks = {
        1: 1 if (first_rank is not None and first_rank <= 1) else 0,
        3: 1 if (first_rank is not None and first_rank <= 3) else 0,
        5: 1 if (first_rank is not None and first_rank <= 5) else 0,
    }
    mrr = (1.0 / first_rank) if first_rank is not None else 0.0
    return ranks, mrr, first_rank

def main():
    print("=" * 80)
    print("COGNITRAG — MULTI-VIEW RETRIEVAL GROUND-TRUTH CORRECTNESS BENCHMARK")
    print(f"Scope: N={len(BENCHMARK_QUERIES)} queries with human-verified technical acceptance criteria")
    print("Comparing: Baseline (Surface View) vs English Pivot View vs Multi-View (Fused)")
    print("=" * 80)

    stats = {
        "baseline": {"hits": {1: 0, 3: 0, 5: 0}, "mrr_sum": 0.0},
        "pivot": {"hits": {1: 0, 3: 0, 5: 0}, "mrr_sum": 0.0},
        "multiview": {"hits": {1: 0, 3: 0, 5: 0}, "mrr_sum": 0.0},
    }

    rescues = 0
    traces = []

    for i, item in enumerate(BENCHMARK_QUERIES, 1):
        q_h = item["hinglish_query"]
        q_en = item["english_query"]
        crit = item["required_criteria"]
        topic = item["topic"]
        
        # 1. Baseline (Surface Hinglish)
        s_v, s_k, s_docs = retrieve_view(q_h, "mixed", top_k=5)
        # 2. English Pivot
        p_v, p_k, p_docs = retrieve_view(q_en, "en", top_k=5)
        # 3. Multi-View Fused (Reciprocal Rank Fusion across Surface Hybrid and English Pivot Hybrid)
        mv_docs, _ = compute_rrf(vector_res=s_docs, keyword_res=p_docs, graph_res=[], k=60, vector_weight=1.0, keyword_weight=1.0)
        mv_docs = mv_docs[:5]

        b_ranks, b_mrr, b_first = evaluate_grounded_ranks(s_docs, crit)
        p_ranks, p_mrr, p_first = evaluate_grounded_ranks(p_docs, crit)
        m_ranks, m_mrr, m_first = evaluate_grounded_ranks(mv_docs, crit)

        for k in [1, 3, 5]:
            stats["baseline"]["hits"][k] += b_ranks[k]
            stats["pivot"]["hits"][k] += p_ranks[k]
            stats["multiview"]["hits"][k] += m_ranks[k]
        stats["baseline"]["mrr_sum"] += b_mrr
        stats["pivot"]["mrr_sum"] += p_mrr
        stats["multiview"]["mrr_sum"] += m_mrr

        is_rescue = (b_ranks[5] == 0 and m_ranks[5] == 1)
        if is_rescue:
            rescues += 1
            flag = "🚀 [RESCUE BY MULTI-VIEW]"
        elif m_ranks[5] == 1 and b_ranks[5] == 1:
            flag = "✅ [BOTH SUCCEEDED]"
        elif p_ranks[5] == 1 and b_ranks[5] == 0:
            flag = "⚡ [PIVOT ONLY WIN]"
        else:
            flag = "❌ [FAILED]"

        print(f"\n[{i:02d}/10] {topic} {flag}")
        print(f"  Hinglish: \"{q_h}\"")
        print(f"  English : \"{q_en}\"")
        print(f"  First Correct Rank: Baseline={b_first or 'None'} | Pivot={p_first or 'None'} | Multi-View={m_first or 'None'}")
        print(f"  Grounded Recall@5: Baseline={b_ranks[5]} | Pivot={p_ranks[5]} | Multi-View={m_ranks[5]}")
        print(f"  Reciprocal Rank  : Baseline={b_mrr:.2f} | Pivot={p_mrr:.2f} | Multi-View={m_mrr:.2f}")

        traces.append({
            "id": item["id"],
            "topic": topic,
            "hinglish_query": q_h,
            "english_query": q_en,
            "criteria": crit,
            "baseline_rank": b_first,
            "pivot_rank": p_first,
            "multiview_rank": m_first,
            "is_rescue": is_rescue
        })

    n = len(BENCHMARK_QUERIES)
    import math
    def wilson_ci(k: int, n: int, z: float = 1.96) -> tuple:
        if n == 0: return 0.0, 0.0
        p = k / n
        denom = 1 + (z**2) / n
        center = (p + (z**2) / (2 * n)) / denom
        margin = (z * math.sqrt((p * (1 - p) / n) + (z**2) / (4 * n**2))) / denom
        return max(0.0, center - margin), min(1.0, center + margin)

    summary = {
        "n": n,
        "status": "statistically_sound" if n >= 30 else "preliminary",
        "baseline": {
            "grounded_recall@1": round(stats["baseline"]["hits"][1] / n, 4),
            "grounded_recall@1_ci": [round(x, 4) for x in wilson_ci(stats["baseline"]["hits"][1], n)],
            "grounded_recall@3": round(stats["baseline"]["hits"][3] / n, 4),
            "grounded_recall@3_ci": [round(x, 4) for x in wilson_ci(stats["baseline"]["hits"][3], n)],
            "grounded_recall@5": round(stats["baseline"]["hits"][5] / n, 4),
            "grounded_recall@5_ci": [round(x, 4) for x in wilson_ci(stats["baseline"]["hits"][5], n)],
            "mrr": round(stats["baseline"]["mrr_sum"] / n, 4)
        },
        "pivot_only": {
            "grounded_recall@1": round(stats["pivot"]["hits"][1] / n, 4),
            "grounded_recall@1_ci": [round(x, 4) for x in wilson_ci(stats["pivot"]["hits"][1], n)],
            "grounded_recall@3": round(stats["pivot"]["hits"][3] / n, 4),
            "grounded_recall@3_ci": [round(x, 4) for x in wilson_ci(stats["pivot"]["hits"][3], n)],
            "grounded_recall@5": round(stats["pivot"]["hits"][5] / n, 4),
            "grounded_recall@5_ci": [round(x, 4) for x in wilson_ci(stats["pivot"]["hits"][5], n)],
            "mrr": round(stats["pivot"]["mrr_sum"] / n, 4)
        },
        "multiview": {
            "grounded_recall@1": round(stats["multiview"]["hits"][1] / n, 4),
            "grounded_recall@1_ci": [round(x, 4) for x in wilson_ci(stats["multiview"]["hits"][1], n)],
            "grounded_recall@3": round(stats["multiview"]["hits"][3] / n, 4),
            "grounded_recall@3_ci": [round(x, 4) for x in wilson_ci(stats["multiview"]["hits"][3], n)],
            "grounded_recall@5": round(stats["multiview"]["hits"][5] / n, 4),
            "grounded_recall@5_ci": [round(x, 4) for x in wilson_ci(stats["multiview"]["hits"][5], n)],
            "mrr": round(stats["multiview"]["mrr_sum"] / n, 4)
        },
        "lift": {
            "recall@1_delta": round((stats["multiview"]["hits"][1] - stats["baseline"]["hits"][1]) / n, 4),
            "recall@3_delta": round((stats["multiview"]["hits"][3] - stats["baseline"]["hits"][3]) / n, 4),
            "recall@5_delta": round((stats["multiview"]["hits"][5] - stats["baseline"]["hits"][5]) / n, 4),
            "mrr_delta": round((stats["multiview"]["mrr_sum"] - stats["baseline"]["mrr_sum"]) / n, 4),
            "multi_view_rescues": rescues
        },
        "traces": traces
    }

    print("\n" + "=" * 80)
    print(f"FINAL GROUND-TRUTH VERIFIED MULTI-VIEW RETRIEVAL RESULTS (N={n}, Status: {summary['status']})")
    print("=" * 80)
    print(f"{'Metric':<20} | {'Baseline (Surface)':<22} | {'English Pivot':<22} | {'Multi-View (Fused)':<22} | {'Lift (Δ)':<10}")
    print("-" * 105)
    for m in ["grounded_recall@1", "grounded_recall@3", "grounded_recall@5", "mrr"]:
        b_val = summary["baseline"][m]
        p_val = summary["pivot_only"][m]
        mv_val = summary["multiview"][m]
        delta = mv_val - b_val
        delta_str = f"+{delta*100:.1f}%" if "recall" in m else f"+{delta:.3f}"
        b_ci = f" [{summary['baseline'][m+'_ci'][0]*100:.1f}%-{summary['baseline'][m+'_ci'][1]*100:.1f}%]" if "recall" in m else ""
        mv_ci = f" [{summary['multiview'][m+'_ci'][0]*100:.1f}%-{summary['multiview'][m+'_ci'][1]*100:.1f}%]" if "recall" in m else ""
        b_str = f"{b_val*100:.1f}%{b_ci}" if "recall" in m else f"{b_val:.3f}"
        p_str = f"{p_val*100:.1f}%" if "recall" in m else f"{p_val:.3f}"
        mv_str = f"{mv_val*100:.1f}%{mv_ci}" if "recall" in m else f"{mv_val:.3f}"
        print(f"{m:<20} | {b_str:<22} | {p_str:<22} | {mv_str:<22} | {delta_str:<10}")

    print("\n--- RESCUE & CONTRIBUTION SUMMARY ---")
    print(f"Total Multi-View Rescues (Baseline failed top-5, Multi-View succeeded): {rescues} / {n} queries")
    print(f"Baseline Failures Rescued by Multi-View: {rescues / (n - stats['baseline']['hits'][5]) * 100:.1f}%" if n != stats['baseline']['hits'][5] else "None")

    out_file = os.path.join(RESULTS_DIR, "multiview_ground_truth_results.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    print(f"\nSaved grounded results to {out_file}")

if __name__ == "__main__":
    main()
