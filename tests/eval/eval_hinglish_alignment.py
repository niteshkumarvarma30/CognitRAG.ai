"""
Component C: Hinglish vs. English Semantic Vector Alignment Benchmark
=====================================================================
Evaluates whether Romanized Hindi (Hinglish) code-switched queries retrieve
English technical documentation with parity compared to pure English queries.

Generates a detailed human-verifiable report and exports step-by-step JSON traces.
"""
import os
import sys
import json
import math
from datetime import datetime
from dotenv import load_dotenv

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
load_dotenv()

from src.retrieval.hybrid import get_embedding


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """Computes cosine similarity between two float vectors."""
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


# 15 Representative Enterprise Test Scenarios
BENCHMARK_SCENARIOS = [
    {
        "id": "scenario_01_auth_decision",
        "category": "Architecture Decision",
        "doc_chunk": (
            "RFC-14 Architectural Decision Record: We have selected OAuth 2.0 with PKCE for our client "
            "authentication pattern. This decision was ratified on August 3rd by the security team to support "
            "enterprise single sign-on (SSO) and SCIM user provisioning."
        ),
        "en_query": "Why was the OAuth 2.0 authentication pattern chosen?",
        "hi_query": "Yaar, auth pattern OAuth 2.0 kyun choose kiya tha?",
        "expected_entity": "OAuth 2.0 with PKCE"
    },
    {
        "id": "scenario_02_release_date",
        "category": "Sprint Planning",
        "doc_chunk": (
            "Sprint 34 Milestone: The delivery date for PROJ-142 has been committed for September 30, 2024. "
            "All engineering code freezes will take effect 48 hours prior on September 28 at 18:00 UTC."
        ),
        "en_query": "What is the committed release delivery date for PROJ-142?",
        "hi_query": "Bhai, PROJ-142 ki delivery date kab ki decide hui hai?",
        "expected_entity": "September 30, 2024"
    },
    {
        "id": "scenario_03_staging_incident",
        "category": "Incident Investigation",
        "doc_chunk": (
            "Incident #INC-802 Postmortem: The staging checkout service suffered a 401 Unauthorized outage because "
            "the AWS EC2 instance was mistakenly injected with production Stripe secret keys (sk_live_) instead of "
            "test sandbox keys (sk_test_)."
        ),
        "en_query": "Why is the staging checkout service failing with a 401 Unauthorized error?",
        "hi_query": "Staging pe checkout 401 error kyun de raha hai bhai?",
        "expected_entity": "production Stripe secret keys"
    },
    {
        "id": "scenario_04_database_indexing",
        "category": "Infra & Performance",
        "doc_chunk": (
            "RFC-106 Database Optimization: PostgreSQL pgvector tables have been upgraded with HNSW indexing using "
            "m=16 and ef_construction=64. This reduced vector search latency from 240ms to 18ms under concurrent load."
        ),
        "en_query": "What indexing algorithm was implemented to optimize vector search latency?",
        "hi_query": "Vector search fast karne ke liye kaunsa index lagaya tha?",
        "expected_entity": "HNSW indexing"
    },
    {
        "id": "scenario_05_pr_merge_fix",
        "category": "Code Review & PRs",
        "doc_chunk": (
            "GitHub PR #45: Updated Stripe staging API keys in AWS Secrets Manager and resolved BILL-101. "
            "Merged by John Doe into main branch after passing all integration tests."
        ),
        "en_query": "Which pull request fixed the Stripe staging API keys issue?",
        "hi_query": "Stripe staging keys wala bug kis PR mein fix hua tha?",
        "expected_entity": "GitHub PR #45"
    },
    {
        "id": "scenario_06_kafka_deadlock",
        "category": "Incident Investigation",
        "doc_chunk": (
            "Slack #eng-alerts: The Kafka consumer lag spiked because consumer group rebalancing timed out after "
            "max.poll.interval.ms was set too low (30000ms) for dense payload processing."
        ),
        "en_query": "What caused the Kafka consumer rebalance timeout and lag spike?",
        "hi_query": "Kafka lag itna zyada kyun badh gaya tha, reason kya tha?",
        "expected_entity": "max.poll.interval.ms set too low"
    },
    {
        "id": "scenario_07_rate_limiting",
        "category": "Architecture Decision",
        "doc_chunk": (
            "RFC-111 API Gateway: We implemented token bucket rate limiting at the Envoy proxy tier with a ceiling "
            "of 1000 requests per minute per tenant IP to mitigate DDoS spikes."
        ),
        "en_query": "What rate limiting strategy was configured on the API gateway?",
        "hi_query": "API gateway pe rate limit kaise set kiya gaya hai?",
        "expected_entity": "token bucket rate limiting"
    },
    {
        "id": "scenario_08_gdpr_retention",
        "category": "Compliance & Security",
        "doc_chunk": (
            "Compliance RFC-107: Data retention policy strictly enforces 30-day automated tombstoning for inactive user "
            "PII in accordance with GDPR Right to be Forgotten guidelines."
        ),
        "en_query": "How many days are inactive user records retained before automated deletion?",
        "hi_query": "Inactive users ka data kitne din baad delete hota hai compliance ke hisab se?",
        "expected_entity": "30-day automated tombstoning"
    },
    {
        "id": "scenario_09_billing_tier",
        "category": "Product & Billing",
        "doc_chunk": (
            "Pricing Policy: The Enterprise tier allows up to 50 dedicated agents, unlimited vector storage, and dedicated "
            "Neo4j VPC peering with 99.99% availability SLA."
        ),
        "en_query": "What are the feature limits included in the Enterprise plan?",
        "hi_query": "Enterprise plan mein kya kya features aur limits milti hain?",
        "expected_entity": "50 dedicated agents, unlimited vector storage"
    },
    {
        "id": "scenario_10_feature_flags",
        "category": "DevOps & Deployment",
        "doc_chunk": (
            "DevOps Guide: LaunchDarkly feature flag `enable_sarvam_asr` controls access to Indic voice transcription. "
            "It is currently enabled for 10% of beta workspaces in the APAC region."
        ),
        "en_query": "Which feature flag manages access to the Sarvam voice service?",
        "hi_query": "Voice transcription ka access kaunse feature flag se control hota hai?",
        "expected_entity": "enable_sarvam_asr"
    }
]


def run_hinglish_alignment_eval():
    print("=" * 75)
    print("COGNITRAG EVALUATION — COMPONENT C: HINGLISH VECTOR ALIGNMENT BENCHMARK")
    print("=" * 75)
    print(f"Total Scenarios: {len(BENCHMARK_SCENARIOS)}")
    print(f"Timestamp: {datetime.now().isoformat()}\n")

    results = []
    total_parity = 0.0

    os.makedirs("eval_results", exist_ok=True)

    for idx, sc in enumerate(BENCHMARK_SCENARIOS, 1):
        print(f"[{idx}/{len(BENCHMARK_SCENARIOS)}] Evaluating: {sc['category']} ({sc['id']})...")
        
        # 1. Embed target doc chunk
        doc_emb = get_embedding(sc["doc_chunk"], language_tag="en")
        
        # 2. Embed English query
        en_emb = get_embedding(sc["en_query"], language_tag="en")
        
        # 3. Embed Hinglish query
        hi_emb = get_embedding(sc["hi_query"], language_tag="hi-latn")

        # 4. Calculate similarities
        sim_en = cosine_similarity(en_emb, doc_emb)
        sim_hi = cosine_similarity(hi_emb, doc_emb)
        parity = sim_hi / sim_en if sim_en > 0 else 0.0
        total_parity += parity

        res = {
            "scenario_id": sc["id"],
            "category": sc["category"],
            "expected_entity": sc["expected_entity"],
            "doc_chunk_snippet": sc["doc_chunk"][:140] + "...",
            "english_query": sc["en_query"],
            "hinglish_query": sc["hi_query"],
            "similarity_english_to_doc": round(sim_en, 4),
            "similarity_hinglish_to_doc": round(sim_hi, 4),
            "alignment_parity_ratio": round(parity, 4),
            "status": "PASS" if parity >= 0.85 else "WARN"
        }
        results.append(res)

        print(f"    EN Similarity:       {sim_en:.4f}")
        print(f"    HI Similarity:       {sim_hi:.4f}")
        print(f"    Parity Ratio (HI/EN): {parity * 100:.1f}% [{res['status']}]\n")

    avg_parity = total_parity / len(BENCHMARK_SCENARIOS)
    print("=" * 75)
    print(f"BENCHMARK COMPLETE")
    print(f"Average Hinglish-to-English Alignment Parity: {avg_parity * 100:.2f}%")
    print(f"Benchmark Pass Condition (>= 85.0% parity): {'PASSED' if avg_parity >= 0.85 else 'FAILED'}")
    print("=" * 75)

    # Save complete human-verifiable JSON audit log
    out_file = "eval_results/component_c_hinglish_alignment.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({
            "benchmark": "Component C — Hinglish Semantic Vector Alignment",
            "evaluated_at": datetime.now().isoformat(),
            "average_parity_percent": round(avg_parity * 100, 2),
            "total_scenarios": len(results),
            "passed_scenarios": sum(1 for r in results if r["status"] == "PASS"),
            "traces": results
        }, f, indent=2)

    print(f"\nSaved full human-verifiable trace to: {out_file}")
    return results, avg_parity


if __name__ == "__main__":
    run_hinglish_alignment_eval()
