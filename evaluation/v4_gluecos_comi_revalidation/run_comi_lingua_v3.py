"""
CognitRAG v4 — COMI-LINGUA Out-of-Sample v3 Revalidation
Evaluates the updated language_detector.py (with K=1 capitalized English / proper nouns override)
on N=80 fresh out-of-sample examples (seed=7), strictly excluding all 200 IDs from v1 and v2.
"""
import os, sys, json, math, time, uuid
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from dotenv import load_dotenv
load_dotenv()

from Evaluation.v4_gluecos_comi_revalidation.loaders.comi_lingua_loader_v3 import load_comi_v3_out_of_sample
from src.ingestion.language_detector import detect_language


def wilson_ci(k: int, n: int, z: float = 1.96) -> tuple[float, float]:
    if n == 0:
        return 0.0, 0.0
    p = k / n
    denom = 1 + z**2 / n
    centre = (p + z**2 / (2 * n)) / denom
    margin = (z * math.sqrt(p * (1 - p) / n + z**2 / (4 * n**2))) / denom
    return round(max(0.0, centre - margin), 4), round(min(1.0, centre + margin), 4)


def run_comi_v3(run_id: str = None, n_per_label: int = 40, seed: int = 7):
    if not run_id:
        run_id = str(uuid.uuid4())

    print(f"\n{'='*65}")
    print(f"  COMI-LINGUA Out-of-Sample v3 Evaluation (Fixed K=1 Override)")
    print(f"  run_id: {run_id}")
    print(f"{'='*65}\n")

    # Load fresh out-of-sample data (excluding v1 + v2)
    sample = load_comi_v3_out_of_sample(n_per_label=n_per_label, seed=seed)

    print(f"\n[Eval] Running classifier on {len(sample)} examples...\n")

    per_label = {}
    confusion = {}
    traces = []

    for idx, ex in enumerate(sample, 1):
        gold = ex["gold_label"]
        pred = detect_language(ex["text"])

        per_label.setdefault(gold, {"n": 0, "correct": 0})
        per_label[gold]["n"] += 1
        per_label[gold]["correct"] += int(pred == gold)

        conf_key = f"gold_{gold}"
        confusion.setdefault(conf_key, {})
        confusion[conf_key][f"pred_{pred}"] = confusion[conf_key].get(f"pred_{pred}", 0) + 1

        is_correct = (pred == gold)
        symbol = "[OK]" if is_correct else "[X]"


        if idx % 10 == 0 or not is_correct:
            print(f"  [{idx:03d}/{len(sample)}] {symbol} gold={gold:7} pred={pred:7} | {ex['text'][:65]}...")

        trace = {
            "example_id": ex["example_id"],
            "input_query": ex["text"],
            "gold_answer": gold,
            "generated_answer": pred,
            "exact_match": is_correct,
        }
        traces.append(trace)

    print(f"\n{'='*65}")
    print(f"  COMI-LINGUA v3 Results (N={len(sample)}, seed={seed})")
    print(f"{'='*65}")

    label_results = {}
    for label, counts in per_label.items():
        n, correct = counts["n"], counts["correct"]
        acc = correct / n if n else 0.0
        lo, hi = wilson_ci(correct, n)
        label_results[label] = {
            "n": n,
            "correct": correct,
            "accuracy": round(acc, 4),
            "accuracy_pct": f"{acc * 100:.2f}%",
            "ci": [lo, hi],
            "ci_pct": [f"{lo * 100:.1f}%", f"{hi * 100:.1f}%"],
            "status": "statistically_sound" if n >= 30 else "preliminary (N < 30)"
        }
        print(f"\n  {label.upper()} (N={n})")
        print(f"    Accuracy : {acc*100:.2f}% ({correct}/{n})")
        print(f"    95% CI   : [{lo*100:.1f}%, {hi*100:.1f}%]")
        print(f"    Status   : {label_results[label]['status']}")

    total_correct = sum(v["correct"] for v in per_label.values())
    total_n = sum(v["n"] for v in per_label.values())
    overall_acc = total_correct / total_n if total_n else 0.0
    olo, ohi = wilson_ci(total_correct, total_n)

    overall_result = {
        "n": total_n,
        "correct": total_correct,
        "accuracy": round(overall_acc, 4),
        "accuracy_pct": f"{overall_acc * 100:.2f}%",
        "ci": [olo, ohi],
        "ci_pct": [f"{olo * 100:.1f}%", f"{ohi * 100:.1f}%"],
        "status": "statistically_sound"
    }

    print(f"\n  OVERALL (N={total_n})")
    print(f"    Accuracy : {overall_acc*100:.2f}% ({total_correct}/{total_n})")
    print(f"    95% CI   : [{olo*100:.1f}%, {ohi*100:.1f}%]")
    print(f"    Status   : statistically_sound")

    print(f"\n  Confusion Matrix:")
    all_labels = sorted(per_label.keys())
    header = "       " + "  ".join(f"pred_{l[:6]:6}" for l in all_labels)
    print(f"  {header}")
    for gold_label in all_labels:
        row_key = f"gold_{gold_label}"
        row_vals = confusion.get(row_key, {})
        row_str = "  ".join(f"{row_vals.get(f'pred_{l}', 0):8d}" for l in all_labels)
        print(f"  gold_{gold_label[:6]:6} {row_str}")

    # Save traces locally
    traces_file = os.path.join(os.path.dirname(__file__), "traces", "comi_v3_traces.json")
    with open(traces_file, "w", encoding="utf-8") as f:
        json.dump({
            "run_id": run_id,
            "seed": seed,
            "n": total_n,
            "overall": overall_result,
            "per_label": label_results,
            "confusion_matrix": confusion,
            "permanent_limitation": "English (en) exhausted in COMI-LINGUA (39 total in dataset, all used in v1).",
            "traces": traces
        }, f, indent=2, ensure_ascii=False)
    print(f"\n  Saved v3 traces → {traces_file}")

    # Save results summary
    results_file = os.path.join(os.path.dirname(__file__), "results", "comi_v3_results.json")
    with open(results_file, "w", encoding="utf-8") as f:
        json.dump({
            "run_id": run_id,
            "seed": seed,
            "overall": overall_result,
            "per_label": label_results,
            "confusion_matrix": confusion,
            "permanent_limitation": "English (en) exhausted in COMI-LINGUA (39 total in dataset, all used in v1)."
        }, f, indent=2)
    print(f"  Saved v3 summary results → {results_file}")

    return {
        "run_id": run_id,
        "overall": overall_result,
        "per_label": label_results,
        "confusion_matrix": confusion,
        "traces": traces
    }

if __name__ == "__main__":
    run_comi_v3()
