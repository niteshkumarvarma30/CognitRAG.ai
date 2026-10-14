"""
CognitRAG v4 — COMI-LINGUA Out-of-Sample Revalidation
Tests the fixed language_detector.py on N=120 fresh examples (seed 99).
Excludes all 120 example_ids from the original diagnostic run (seed 42).

Key question:
  Does hi-latn accuracy hold >= 85%? (generalized fix)
  Or drop back toward 39%? (overfit fix)

Run:
  python Evaluation/v4_gluecos_comi_revalidation/run_comi_lingua_revalidation.py
"""
import os, sys, json, math, time, requests
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from dotenv import load_dotenv
load_dotenv()

from Evaluation.v4_gluecos_comi_revalidation.loaders.comi_lingua_loader import load_comi_out_of_sample
from Evaluation.v4_gluecos_comi_revalidation.create_eval_run import load_run_ids

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").strip().strip("'\"")
SUPABASE_SRK = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip().strip("'\"")

HEADERS = {
    "apikey": SUPABASE_SRK,
    "Authorization": f"Bearer {SUPABASE_SRK}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

ORIG_RESULTS_PATH = os.path.join(os.path.dirname(__file__), "..", "results", "comi_lingua_results.json")


# ── Wilson CI ───────────────────────────────────────────────────────────────
def wilson_ci(k: int, n: int, z: float = 1.96) -> tuple[float, float]:
    if n == 0:
        return 0.0, 0.0
    p = k / n
    denom = 1 + z**2 / n
    centre = (p + z**2 / (2 * n)) / denom
    margin = (z * math.sqrt(p * (1 - p) / n + z**2 / (4 * n**2))) / denom
    return round(max(0.0, centre - margin), 4), round(min(1.0, centre + margin), 4)


# ── Supabase helpers ─────────────────────────────────────────────────────────
def insert_trace(run_id: str, row: dict):
    requests.post(f"{SUPABASE_URL}/rest/v1/eval_raw_traces",
                  headers=HEADERS, json={**row, "run_id": run_id}, timeout=15)

def insert_result(run_id: str, row: dict):
    requests.post(f"{SUPABASE_URL}/rest/v1/eval_benchmark_results",
                  headers=HEADERS, json={**row, "run_id": run_id}, timeout=15)


# ── Load original run results for comparison ─────────────────────────────────
def load_original_results() -> dict:
    """Load per-label scores from the original N=120 diagnostic run."""
    try:
        with open(ORIG_RESULTS_PATH) as f:
            data = json.load(f)
        # Expected shape: { "per_label": { "en": {...}, "hi-latn": {...}, "mixed": {...} } }
        return data.get("per_label", {})
    except Exception as e:
        print(f"[Warning] Could not load original results: {e}")
        return {}


# ── Main revalidation loop ───────────────────────────────────────────────────
def run_comi_revalidation(run_id: str, n_per_label: int = 40, seed: int = 99):
    print(f"\n{'='*55}")
    print(f"  COMI-LINGUA Out-of-Sample Revalidation")
    print(f"  run_id: {run_id[:8]}...")
    print(f"{'='*55}\n")

    # Step 1: Load fixed classifier
    from src.ingestion.language_detector import detect_language as classify_language

    # Step 2: Load fresh out-of-sample data
    sample = load_comi_out_of_sample(n_per_label=n_per_label, seed=seed)

    print(f"\n[Eval] Running classifier on {len(sample)} examples...\n")

    per_label = {}     # {"en": {"n": 0, "correct": 0}, ...}
    confusion  = {}    # {"gold_en": {"pred_en": 3, ...}, ...}
    traces     = []

    for idx, ex in enumerate(sample, 1):
        gold = ex["gold_label"]
        pred = classify_language(ex["text"])

        per_label.setdefault(gold, {"n": 0, "correct": 0})
        per_label[gold]["n"] += 1
        per_label[gold]["correct"] += int(pred == gold)

        conf_key = f"gold_{gold}"
        confusion.setdefault(conf_key, {})
        confusion[conf_key][f"pred_{pred}"] = confusion[conf_key].get(f"pred_{pred}", 0) + 1

        is_correct = pred == gold
        symbol = "✅" if is_correct else "❌"
        if idx % 20 == 0 or not is_correct:
            print(f"  [{idx:03d}/{len(sample)}] {symbol} gold={gold} pred={pred} | {ex['text'][:60]}...")

        trace = {
            "example_id": ex["example_id"],
            "input_query": ex["text"],
            "gold_answer": gold,
            "generated_answer": pred,
            "exact_match": is_correct,
        }
        traces.append(trace)
        insert_trace(run_id, trace)

    # ── Per-label results + Wilson CIs ───────────────────────────────────────
    print(f"\n{'='*55}")
    print(f"  COMI-LINGUA Revalidation Results (N={len(sample)}, seed={seed})")
    print(f"{'='*55}")

    label_results = {}
    for label, counts in per_label.items():
        n, correct = counts["n"], counts["correct"]
        acc = correct / n if n else 0
        lo, hi = wilson_ci(correct, n)
        label_results[label] = {"n": n, "accuracy": acc, "ci": [lo, hi]}
        status = "statistically_sound" if n >= 30 else "preliminary"

        print(f"\n  {label.upper()} (N={n})")
        print(f"    Accuracy   : {acc*100:.2f}%")
        print(f"    95% CI     : [{lo*100:.1f}%, {hi*100:.1f}%]")
        print(f"    Status     : {status}")

        insert_result(run_id, {
            "dataset_name": "comi-lingua",
            "category": label,
            "metric_name": "language_id_accuracy_out_of_sample",
            "metric_value": acc,
            "ci_low": lo,
            "ci_high": hi,
            "sample_size": n,
            "eval_method": "direct_classification_no_judge",
            "dataset_version": "LingoIITGN/COMI-LINGUA, out-of-sample N=120 seed=99",
            "status": status,
        })

    # ── Overall accuracy ──────────────────────────────────────────────────────
    total_correct = sum(v["correct"] for v in per_label.values())
    total_n       = sum(v["n"] for v in per_label.values())
    overall_acc   = total_correct / total_n if total_n else 0
    olo, ohi      = wilson_ci(total_correct, total_n)

    print(f"\n  OVERALL (N={total_n})")
    print(f"    Accuracy   : {overall_acc*100:.2f}%")
    print(f"    95% CI     : [{olo*100:.1f}%, {ohi*100:.1f}%]")

    insert_result(run_id, {
        "dataset_name": "comi-lingua",
        "category": "overall",
        "metric_name": "language_id_accuracy_out_of_sample",
        "metric_value": overall_acc,
        "ci_low": olo,
        "ci_high": ohi,
        "sample_size": total_n,
        "eval_method": "direct_classification_no_judge",
        "dataset_version": "LingoIITGN/COMI-LINGUA, out-of-sample N=120 seed=99",
        "status": "statistically_sound",
    })

    # ── Confusion matrix ──────────────────────────────────────────────────────
    print(f"\n  Confusion Matrix:")
    all_labels = sorted(per_label.keys())
    header = "       " + "  ".join(f"pred_{l[:6]:6}" for l in all_labels)
    print(f"  {header}")
    for gold_label in all_labels:
        row_key = f"gold_{gold_label}"
        row_vals = confusion.get(row_key, {})
        row_str = "  ".join(f"{row_vals.get(f'pred_{l}', 0):8d}" for l in all_labels)
        print(f"  gold_{gold_label[:6]:6} {row_str}")

    print(f"\n{'='*55}\n")

    # ── Save traces locally ───────────────────────────────────────────────────
    out_path = os.path.join(os.path.dirname(__file__), "traces", "comi_revalidation_traces.json")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({
            "run_id": run_id, "n": total_n, "overall_accuracy": overall_acc,
            "per_label": label_results, "confusion_matrix": confusion, "traces": traces
        }, f, indent=2, ensure_ascii=False)
    print(f"  Raw traces saved → {out_path}")

    return {
        "run_id": run_id,
        "overall_accuracy": overall_acc,
        "per_label": label_results,
        "confusion_matrix": confusion,
    }


if __name__ == "__main__":
    run_ids = load_run_ids()
    run_id  = run_ids["comi_lingua_revalidation_v2"]
    results = run_comi_revalidation(run_id)
