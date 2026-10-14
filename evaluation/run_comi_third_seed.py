import os
import sys
import json
import math
from typing import Dict, Any

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from Evaluation.v4_gluecos_comi_revalidation.loaders.comi_lingua_loader import load_comi_out_of_sample
from src.ingestion.language_detector import detect_language
from Evaluation.store_results import RESULTS_DIR

def wilson_ci(k: int, n: int, z: float = 1.96) -> tuple:
    if n == 0:
        return 0.0, 0.0
    p = k / n
    denom = 1 + (z**2) / n
    center = (p + (z**2) / (2 * n)) / denom
    margin = (z * math.sqrt((p * (1 - p) / n) + (z**2) / (4 * n**2))) / denom
    return max(0.0, center - margin), min(1.0, center + margin)

def evaluate_seed(seed: int, k_val: int = 1) -> Dict[str, Any]:
    examples = load_comi_out_of_sample(n_per_label=40, seed=seed, K=k_val)
    by_label = {
        "hi-latn": {"correct": 0, "n": 0, "preds": {"hi-latn": 0, "en": 0, "mixed": 0}},
        "mixed": {"correct": 0, "n": 0, "preds": {"hi-latn": 0, "en": 0, "mixed": 0}}
    }
    
    for ex in examples:
        gold = ex["gold_label"]
        if gold not in by_label:
            continue
        pred = detect_language(ex["text"])
        by_label[gold]["n"] += 1
        by_label[gold]["preds"][pred] = by_label[gold]["preds"].get(pred, 0) + 1
        if pred == gold:
            by_label[gold]["correct"] += 1
            
    tot_correct = by_label["hi-latn"]["correct"] + by_label["mixed"]["correct"]
    tot_n = by_label["hi-latn"]["n"] + by_label["mixed"]["n"]
    
    return {
        "seed": seed,
        "k": k_val,
        "n": tot_n,
        "correct": tot_correct,
        "accuracy": tot_correct / tot_n,
        "by_label": by_label
    }

def main():
    print("=" * 80)
    print("COMI-LINGUA — 3RD OUT-OF-SAMPLE SEED (seed=777) & POOLED 3-SEED REPLICATION")
    print("Investigating variance and checking if mixed accuracy holds across independent seeds")
    print("=" * 80)
    
    # Run seed 7, 99, 777
    seeds = [7, 99, 777]
    run_results = {}
    
    for s in seeds:
        print(f"\n[Evaluating seed={s} (K=1)]...")
        res = evaluate_seed(s, k_val=1)
        run_results[s] = res
        print(f"  Seed {s} Results:")
        print(f"    Overall: {res['correct']}/{res['n']} ({res['accuracy']*100:.2f}%)")
        for lbl in ["hi-latn", "mixed"]:
            c = res["by_label"][lbl]["correct"]
            n = res["by_label"][lbl]["n"]
            print(f"    {lbl:<7}: {c}/{n} ({c/n*100:.2f}%)")
            
    # Pool all 3 runs
    pooled_by_label = {
        "hi-latn": {"correct": 0, "n": 0, "preds": {"hi-latn": 0, "en": 0, "mixed": 0}},
        "mixed": {"correct": 0, "n": 0, "preds": {"hi-latn": 0, "en": 0, "mixed": 0}}
    }
    
    for s in seeds:
        res = run_results[s]
        for lbl in ["hi-latn", "mixed"]:
            pooled_by_label[lbl]["correct"] += res["by_label"][lbl]["correct"]
            pooled_by_label[lbl]["n"] += res["by_label"][lbl]["n"]
            for p_lbl, count in res["by_label"][lbl]["preds"].items():
                pooled_by_label[lbl]["preds"][p_lbl] = pooled_by_label[lbl]["preds"].get(p_lbl, 0) + count
                
    total_c = pooled_by_label["hi-latn"]["correct"] + pooled_by_label["mixed"]["correct"]
    total_n = pooled_by_label["hi-latn"]["n"] + pooled_by_label["mixed"]["n"]
    
    print("\n" + "=" * 80)
    print(f"POOLED 3-SEED OUT-OF-SAMPLE BENCHMARK (N={total_n}, seeds={seeds}, K=1)")
    print("=" * 80)
    print(f"{'Class':<12} | {'Correct / Total':<18} | {'Accuracy':<10} | {'Wilson 95% CI':<24} | {'Status':<20}")
    print("-" * 90)
    
    for lbl in ["hi-latn", "mixed"]:
        c = pooled_by_label[lbl]["correct"]
        n = pooled_by_label[lbl]["n"]
        acc = c / n
        ci_low, ci_high = wilson_ci(c, n)
        ci_str = f"[{ci_low*100:.2f}% - {ci_high*100:.2f}%]"
        status = "statistically_sound" if n >= 30 else "preliminary"
        print(f"{lbl:<12} | {c:>4} / {n:<11} | {acc*100:>7.2f}% | {ci_str:<24} | {status:<20}")
        
    tot_low, tot_high = wilson_ci(total_c, total_n)
    tot_ci_str = f"[{tot_low*100:.2f}% - {tot_high*100:.2f}%]"
    tot_status = "statistically_sound" if total_n >= 30 else "preliminary"
    print("-" * 90)
    print(f"{'OVERALL':<12} | {total_c:>4} / {total_n:<11} | {total_c/total_n*100:>7.2f}% | {tot_ci_str:<24} | {tot_status:<20}")
    
    print("\nPOOLED CONFUSION MATRIX (N=240):")
    print(f"{'':<16} Predicted hi-latn    Predicted en    Predicted mixed")
    for lbl in ["hi-latn", "mixed"]:
        p = pooled_by_label[lbl]["preds"]
        print(f"Gold {lbl:<11} {p.get('hi-latn', 0):>17} {p.get('en', 0):>15} {p.get('mixed', 0):>18}")
        
    out_file = os.path.join(RESULTS_DIR, "comi_lingua_3seed_pooled_results.json")
    out_payload = {
        "seeds": seeds,
        "k_value": 1,
        "n_total": total_n,
        "individual_runs": run_results,
        "pooled": {
            "overall": {
                "n": total_n,
                "correct": total_c,
                "accuracy": round(total_c / total_n, 4),
                "wilson_ci": [round(tot_low, 4), round(tot_high, 4)]
            },
            "by_label": {
                lbl: {
                    "n": pooled_by_label[lbl]["n"],
                    "correct": pooled_by_label[lbl]["correct"],
                    "accuracy": round(pooled_by_label[lbl]["correct"] / pooled_by_label[lbl]["n"], 4),
                    "wilson_ci": [round(wilson_ci(pooled_by_label[lbl]["correct"], pooled_by_label[lbl]["n"])[0], 4),
                                  round(wilson_ci(pooled_by_label[lbl]["correct"], pooled_by_label[lbl]["n"])[1], 4)],
                    "confusion": pooled_by_label[lbl]["preds"]
                } for lbl in ["hi-latn", "mixed"]
            }
        }
    }
    
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(out_payload, f, indent=2)
    print(f"\nSaved pooled results to {out_file}")

if __name__ == "__main__":
    main()
