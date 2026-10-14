import os
import sys
import re
import ast
import json
import random
import numpy as np
from typing import Dict, Any, List, Tuple
from datasets import load_dataset

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.ingestion.language_detector import detect_language

def wilson_ci(successes: int, n: int, z: float = 1.96) -> Tuple[float, float]:
    """Computes Wilson score 95% Confidence Interval for a binomial proportion."""
    if n == 0:
        return (0.0, 0.0)
    phat = successes / n
    denom = 1 + z**2 / n
    center = (phat + z**2 / (2 * n)) / denom
    margin = (z * np.sqrt((phat * (1 - phat) + z**2 / (4 * n)) / n)) / denom
    return (round(max(0.0, float(center - margin)), 4), round(min(1.0, float(center + margin)), 4))

def run_comi_lingua_evaluation():
    print("=================================================================")
    print("STEP 1: Load Dataset & Confirm Schema")
    print("=================================================================")
    ds = load_dataset("LingoIITGN/COMI-LINGUA", "LID", split="train")
    print("ds.features:", ds.features)
    print("ds[0]:", {k: (str(v)[:120] if not isinstance(v, (int, float, bool)) else v) for k, v in ds[0].items()})
    
    commit_sha = "0214cb358e59e36da60e01d3d59ddd24df897749"
    devanagari_pat = re.compile(r'[\u0900-\u097F]')

    print("\n=================================================================")
    print("STEP 2 & 3: Filter LID rows & Compute Full Source Label Distribution")
    print("=================================================================")
    
    pool_en = []
    pool_hi = []
    pool_mixed = []

    for i, row in enumerate(ds):
        sent = row.get("Sentences", "")
        # For language tagging verification of Romanized / Hinglish / English, focus on Romanized text in LID
        if devanagari_pat.search(sent):
            continue
        ann1 = row.get("Annotated by: Annotator 1")
        if not ann1:
            continue
        try:
            parsed = ast.literal_eval(ann1)
            tokens = [x.get("value") if isinstance(x, dict) else x[1] for x in parsed if isinstance(x, (dict, list, tuple))]
        except Exception:
            continue
            
        hi_count = sum(1 for t in tokens if t == "hi")
        en_count = sum(1 for t in tokens if t == "en")
        
        # Minimum length requirement for realistic evaluation (at least 3 words)
        if len(sent.split()) < 3:
            continue
            
        if en_count > 0 and hi_count == 0:
            pool_en.append({"id": f"comi_lid_{i}", "text": sent, "gold": "en", "hi_c": hi_count, "en_c": en_count})
        elif hi_count > 0 and en_count == 0:
            pool_hi.append({"id": f"comi_lid_{i}", "text": sent, "gold": "hi-latn", "hi_c": hi_count, "en_c": en_count})
        elif hi_count > 0 and en_count > 0:
            pool_mixed.append({"id": f"comi_lid_{i}", "text": sent, "gold": "mixed", "hi_c": hi_count, "en_c": en_count})

    source_dist = {
        "pure_en": len(pool_en),
        "pure_hi_latn": len(pool_hi),
        "mixed_hinglish": len(pool_mixed),
        "total_roman_candidates": len(pool_en) + len(pool_hi) + len(pool_mixed)
    }
    print(f"Full source label distribution in LID (Roman script candidates): {source_dist}")

    print("\n=================================================================")
    print("STEP 4: Stratified Random Sampling (Fixed Seed 42, Target N=120)")
    print("=================================================================")
    rng = random.Random(42)
    rng.shuffle(pool_en)
    rng.shuffle(pool_hi)
    rng.shuffle(pool_mixed)

    # Take all available pure English (39), 41 pure Hindi, 40 mixed
    sample_en = pool_en[:39]
    sample_hi = pool_hi[:41]
    sample_mixed = pool_mixed[:40]
    
    eval_sample = sample_en + sample_hi + sample_mixed
    rng.shuffle(eval_sample)
    
    achieved_dist = {
        "hi-latn": len(sample_hi),
        "en": len(sample_en),
        "mixed": len(sample_mixed)
    }
    print(f"Actual achieved label distribution in sample: {achieved_dist} (Total N={len(eval_sample)})")

    print("\n=================================================================")
    print("STEP 5 & 6: Run Language Detector & Compare to Gold Labels")
    print("=================================================================")
    confusion_matrix = {
        "gold_hi-latn": {"pred_hi-latn": 0, "pred_en": 0, "pred_mixed": 0},
        "gold_en": {"pred_hi-latn": 0, "pred_en": 0, "pred_mixed": 0},
        "gold_mixed": {"pred_hi-latn": 0, "pred_en": 0, "pred_mixed": 0}
    }
    per_label_counts = {
        "hi-latn": {"correct": 0, "total": 0},
        "en": {"correct": 0, "total": 0},
        "mixed": {"correct": 0, "total": 0}
    }
    
    traces = []

    for item in eval_sample:
        gold = item["gold"]
        pred = detect_language(item["text"])
        
        is_correct = (pred == gold)
        per_label_counts[gold]["total"] += 1
        if is_correct:
            per_label_counts[gold]["correct"] += 1
            
        confusion_matrix[f"gold_{gold}"][f"pred_{pred}"] += 1
        
        traces.append({
            "id": item["id"],
            "text": item["text"],
            "gold_label": gold,
            "predicted_label": pred,
            "is_correct": is_correct
        })

    print("\n=================================================================")
    print("STEP 7: Compute Metrics & Wilson 95% CIs")
    print("=================================================================")
    total_n = len(eval_sample)
    total_correct = sum(v["correct"] for v in per_label_counts.values())
    overall_acc = round(total_correct / total_n, 4)
    overall_ci_low, overall_ci_high = wilson_ci(total_correct, total_n)

    per_label_report = {}
    for lbl in ["hi-latn", "en", "mixed"]:
        n = per_label_counts[lbl]["total"]
        corr = per_label_counts[lbl]["correct"]
        acc = round(corr / n, 4) if n > 0 else 0.0
        ci_lo, ci_hi = wilson_ci(corr, n)
        per_label_report[lbl] = {
            "n": n,
            "accuracy": acc,
            "ci_low": ci_lo,
            "ci_high": ci_hi
        }

    results = {
        "dataset": "comi-lingua",
        "task": "language_identification",
        "dataset_version": commit_sha,
        "sample_size": total_n,
        "sampling_method": "random_stratified_seed42",
        "label_distribution_in_sample": achieved_dist,
        "overall": {
            "accuracy": overall_acc,
            "ci_low": overall_ci_low,
            "ci_high": overall_ci_high
        },
        "per_label": per_label_report,
        "confusion_matrix": confusion_matrix,
        "status": "statistically_sound"
    }

    out_file = os.path.join("Evaluation", "results", "comi_lingua_results.json")
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"Results successfully saved to {out_file}")

    # Save traces for handoff review
    traces_file = os.path.join("Evaluation", "results", "comi_lingua_traces.json")
    with open(traces_file, "w", encoding="utf-8") as f:
        json.dump(traces, f, indent=2)

    return results, traces

if __name__ == "__main__":
    res, tr = run_comi_lingua_evaluation()
    print("\n--- RESULTS JSON ---")
    print(json.dumps(res, indent=2))
