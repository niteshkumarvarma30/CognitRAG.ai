"""
CognitRAG v4 — HGQA Route Re-slice Analysis
Re-cuts the 60 HGQA traces by routing path:
- faq (direct generation, no retrieval)
- technical_query + agent_query combined (retrieval / graph grounded)
- overall (blended)

Computes Wilson Score 95% Confidence Intervals for each slice.
"""
import re
import json
import math
import os

def wilson_ci(k: int, n: int, z: float = 1.96) -> tuple[float, float]:
    """Calculate 95% Wilson Score Interval for k successes out of n trials."""
    if n == 0:
        return 0.0, 0.0
    p = k / n
    denom = 1 + (z**2) / n
    center = (p + (z**2) / (2 * n)) / denom
    margin = (z / denom) * math.sqrt((p * (1 - p) / n) + (z**2) / (4 * (n**2)))
    return round(max(0.0, center - margin), 4), round(min(1.0, center + margin), 4)

def run_analysis():
    log_path = os.path.expanduser(r"C:\Users\varni\.gemini\antigravity-ide\brain\e3720375-c5d2-4587-a8d7-56f07d1a3b89\.system_generated\tasks\task-2738.log")
    traces_path = os.path.join(os.path.dirname(__file__), "..", "traces", "hgqa_v1_traces.json")

    with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
        log_text = f.read()

    parts = re.split(r'\[(\d\d)/60\]', log_text)
    log_records = []
    for i in range(1, len(parts), 2):
        num = int(parts[i])
        content = parts[i+1]
        m_dec = re.search(r'Decision: (\w+)', content)
        dec = m_dec.group(1) if m_dec else 'unknown'
        m_res = re.search(r'Final=(\w+)', content)
        final_label = m_res.group(1) if m_res else ''
        log_records.append({
            'idx': num,
            'route': dec,
            'final_label': final_label
        })

    with open(traces_path, "r", encoding="utf-8") as f:
        trace_data = json.load(f)
    
    traces = trace_data["traces"]
    assert len(traces) == len(log_records) == 60, f"Mismatch: {len(traces)} vs {len(log_records)}"

    # Enrich traces with route
    enriched_traces = []
    for i in range(60):
        t = dict(traces[i])
        lr = log_records[i]
        assert t["final_label"] == lr["final_label"], f"Mismatch at idx {i+1}: {t['final_label']} vs {lr['final_label']}"
        t["route"] = lr["route"]
        t["is_supported"] = (t["final_label"] == "SUPPORTED")
        enriched_traces.append(t)

    # Save enriched traces for full provenance & transparency
    enriched_path = os.path.join(os.path.dirname(__file__), "..", "traces", "hgqa_v1_traces_with_routes.json")
    with open(enriched_path, "w", encoding="utf-8") as f:
        json.dump({
            "run_id": trace_data.get("run_id"),
            "n": 60,
            "traces": enriched_traces
        }, f, indent=2)
    print(f"Saved enriched traces to: {enriched_path}")

    # Slices
    faq_traces = [t for t in enriched_traces if t["route"] == "faq"]
    tech_traces = [t for t in enriched_traces if t["route"] == "technical_query"]
    agent_traces = [t for t in enriched_traces if t["route"] == "agent_query"]
    retrieval_traces = [t for t in enriched_traces if t["route"] in ("technical_query", "agent_query")]

    def compute_stats(name: str, subset: list[dict]):
        n = len(subset)
        k = sum(1 for t in subset if t["is_supported"])
        acc = k / n if n > 0 else 0.0
        low, high = wilson_ci(k, n)
        exact_k = sum(1 for t in subset if t.get("exact_match", False))
        exact_acc = exact_k / n if n > 0 else 0.0
        return {
            "slice_name": name,
            "n": n,
            "supported_count": k,
            "accuracy": round(acc, 4),
            "accuracy_pct": f"{acc * 100:.2f}%",
            "wilson_ci_95": [low, high],
            "wilson_ci_pct": [f"{low*100:.1f}%", f"{high*100:.1f}%"],
            "exact_match_count": exact_k,
            "exact_match_pct": f"{exact_acc * 100:.2f}%",
            "status": "statistically_sound" if n >= 30 else "preliminary (N < 30)"
        }

    stats_faq = compute_stats("faq-routed (direct generation, no retrieval)", faq_traces)
    stats_tech = compute_stats("technical_query (hybrid BM25+vector+rerank)", tech_traces)
    stats_agent = compute_stats("agent_query (supervisor -> agents)", agent_traces)
    stats_retrieval = compute_stats("technical_query + agent_query (actual retrieval/graph-routed)", retrieval_traces)
    stats_overall = compute_stats("Overall (blended baseline)", enriched_traces)

    results = {
        "faq": stats_faq,
        "technical_query": stats_tech,
        "agent_query": stats_agent,
        "retrieval_combined": stats_retrieval,
        "overall_blended": stats_overall
    }

    # Save summary JSON
    out_json = os.path.join(os.path.dirname(__file__), "..", "results", "hgqa_route_recut_results.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"Saved results summary to: {out_json}\n")

    print("=" * 75)
    print("  HGQA v1 Route Re-slice Summary")
    print("=" * 75)
    for k, v in results.items():
        print(f"--- {v['slice_name']} ---")
        print(f"  N: {v['n']} | Supported: {v['supported_count']} / {v['n']} ({v['accuracy_pct']})")
        print(f"  95% Wilson CI: [{v['wilson_ci_pct'][0]}, {v['wilson_ci_pct'][1]}]")
        print(f"  Exact Match: {v['exact_match_count']} / {v['n']} ({v['exact_match_pct']})")
        print(f"  Status: {v['status']}\n")

if __name__ == "__main__":
    run_analysis()
