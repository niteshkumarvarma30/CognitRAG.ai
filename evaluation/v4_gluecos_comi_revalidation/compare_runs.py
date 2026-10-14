"""
CognitRAG v4 — Run Comparison
Pulls both runs from Supabase and prints a side-by-side comparison table.
For COMI-LINGUA: compares original v1 (seed 42) vs revalidation v2 (seed 99) per label.

Run:
  python Evaluation/v4_gluecos_comi_revalidation/compare_runs.py
"""
import os, sys, json, requests
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").strip().strip("'\"")
SUPABASE_SRK = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip().strip("'\"")

HEADERS = {
    "apikey": SUPABASE_SRK,
    "Authorization": f"Bearer {SUPABASE_SRK}",
}

ORIG_RESULTS_PATH = os.path.join(os.path.dirname(__file__), "..", "results", "comi_lingua_results.json")
RUN_IDS_PATH = os.path.join(os.path.dirname(__file__), "data", "run_ids.json")


def fetch_results(run_id: str, dataset: str) -> list[dict]:
    """Fetch benchmark_results for a specific run_id + dataset from Supabase."""
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/eval_benchmark_results"
        f"?run_id=eq.{run_id}&dataset_name=eq.{dataset}&select=*",
        headers=HEADERS, timeout=15)
    if r.status_code == 200:
        return r.json()
    return []


def load_original_comi_results() -> dict:
    """Load original N=120 per-label results from local JSON (before Supabase schema)."""
    try:
        with open(ORIG_RESULTS_PATH) as f:
            data = json.load(f)
        return data.get("per_label", {})
    except Exception:
        return {}


def compare_comi(revalidation_run_id: str):
    """Print side-by-side comparison of COMI-LINGUA v1 vs v2."""
    print(f"\n{'='*65}")
    print(f"  COMI-LINGUA: v1 (N=120 seed=42) vs v2 out-of-sample (N=120 seed=99)")
    print(f"{'='*65}")

    orig = load_original_comi_results()
    new_rows = fetch_results(revalidation_run_id, "comi-lingua")
    new = {r["category"]: r for r in new_rows if r.get("category") != "overall"}

    print(f"\n  {'Label':<10} | {'v1 Accuracy':>12} | {'v2 Accuracy':>12} | {'Δ':>8} | Verdict")
    print(f"  {'-'*10}-+-{'-'*12}-+-{'-'*12}-+-{'-'*8}-+-{'-'*20}")

    for label in ["en", "hi-latn", "mixed"]:
        v1_data = orig.get(label, {})
        v2_data = new.get(label, {})

        v1_acc = v1_data.get("accuracy", 0.0) if v1_data else None
        v2_acc = v2_data.get("metric_value") if v2_data else None

        v1_str = f"{v1_acc*100:.2f}%" if v1_acc is not None else "N/A"
        v2_str = f"{v2_acc*100:.2f}%" if v2_acc is not None else "N/A"

        delta_str = "N/A"
        verdict = "—"
        if v1_acc is not None and v2_acc is not None:
            delta = v2_acc - v1_acc
            delta_str = f"{delta*100:+.2f}%"
            if label == "hi-latn":
                if v2_acc >= 0.85:
                    verdict = "✅ Fix GENERALIZED (≥85%)"
                elif v2_acc >= 0.70:
                    verdict = "⚠️  Partial hold (70–85%)"
                else:
                    verdict = "❌ Fix OVERFIT (<70%)"
            else:
                if abs(delta) < 0.05:
                    verdict = "✅ Stable"
                elif delta < -0.05:
                    verdict = "⚠️  Slight regression"
                else:
                    verdict = "✅ Improved"

        print(f"  {label:<10} | {v1_str:>12} | {v2_str:>12} | {delta_str:>8} | {verdict}")

    # Pull overall v2
    overall_row = next((r for r in new_rows if r.get("category") == "overall"), None)
    if overall_row:
        acc = overall_row["metric_value"]
        lo  = overall_row["ci_low"]
        hi  = overall_row["ci_high"]
        n   = overall_row["sample_size"]
        print(f"\n  Overall v2: {acc*100:.2f}% (95% CI [{lo*100:.1f}%, {hi*100:.1f}%], N={n})")

    print(f"\n{'='*65}")

    # The key conclusion
    hi_latn_new = new.get("hi-latn", {})
    if hi_latn_new:
        v2 = hi_latn_new.get("metric_value", 0)
        v1 = orig.get("hi-latn", {}).get("accuracy", 0)
        print(f"\n  ┌─ KEY FINDING (hi-latn) ───────────────────────────────")
        print(f"  │  v1 (diagnostic): {v1*100:.2f}%  →  v2 (out-of-sample): {v2*100:.2f}%")
        if v2 >= 0.85:
            print(f"  │  ✅ CONCLUSION: The hi-latn fix IS REAL and GENERALIZED.")
            print(f"  │     The homograph-aware lexicon expansion holds on fresh data.")
        elif v2 >= 0.70:
            print(f"  │  ⚠️  CONCLUSION: Fix partially holds but needs more robustness testing.")
        else:
            print(f"  │  ❌ CONCLUSION: Fix was OVERFIT to the original 120 examples.")
            print(f"  │     Recommend redesigning the classifier with a larger lexicon.")
        print(f"  └────────────────────────────────────────────────────────\n")


def compare_hgqa(run_id: str):
    """Print HGQA v1 results."""
    print(f"\n{'='*65}")
    print(f"  HGQA v1 — Hinglish-Grounded QA Results")
    print(f"{'='*65}")
    rows = fetch_results(run_id, "hgqa-v1")
    if not rows:
        print("  No results found. Has run_hgqa_eval.py completed?")
        return
    r = rows[0]
    print(f"  Grounded Retrieval Accuracy : {r['metric_value']*100:.2f}%")
    print(f"  95% CI                      : [{r['ci_low']*100:.1f}%, {r['ci_high']*100:.1f}%]")
    print(f"  N                           : {r['sample_size']}")
    print(f"  Judge models                : {r['judge_model']}")
    print(f"  Aggregation                 : {r['judge_aggregation_rule']}")
    print(f"  Status                      : {r['status']}")

    acc = r["metric_value"]
    print(f"\n  ┌─ INTERPRETATION ──────────────────────────────────────")
    if acc >= 0.70:
        print(f"  │  ✅ Hinglish QA pipeline works on real grounded evidence.")
    elif acc >= 0.50:
        print(f"  │  ⚠️  Moderate performance. Embedding model upgrade may help.")
    else:
        print(f"  │  ❌ Pipeline retrieval broken for Hinglish query style.")
        print(f"  │     Recommend: upgrade to multilingual embedder (snowflake/arctic-embed-l).")
    print(f"  └────────────────────────────────────────────────────────\n")


if __name__ == "__main__":
    with open(RUN_IDS_PATH) as f:
        run_ids = json.load(f)

    compare_hgqa(run_ids["hgqa_v1"])
    compare_comi(run_ids["comi_lingua_revalidation_v2"])
