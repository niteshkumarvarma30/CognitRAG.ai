import numpy as np
from typing import List, Dict, Any, Tuple, Optional

def wilson_ci(successes: int, n: int, z: float = 1.96) -> Tuple[float, float]:
    """
    Computes Wilson score 95% Confidence Interval for a binomial proportion.
    Accurate even for small sample sizes and proportions near 0 or 1.
    """
    if n == 0:
        return (0.0, 0.0)
    phat = successes / n
    denom = 1 + z**2 / n
    center = (phat + z**2 / (2 * n)) / denom
    margin = (z * np.sqrt((phat * (1 - phat) + z**2 / (4 * n)) / n)) / denom
    return (round(max(0.0, center - margin), 4), round(min(1.0, center + margin), 4))


def score_dataset(results: List[Dict[str, Any]], category_field: Optional[str] = "task_type") -> Dict[str, Any]:
    """
    Evaluates raw benchmark runs and calculates per-category metrics with Wilson CIs.
    """
    scores: Dict[str, Dict[str, int]] = {}
    
    for r in results:
        ex = r.get("example", {})
        resp = r.get("response", {})
        cat = ex.get(category_field, "overall") if category_field else "overall"
        
        scores.setdefault(cat, {"correct": 0, "total": 0})
        scores[cat]["total"] += 1

        # Check correctness by task type
        task = ex.get("task_type")
        is_correct = False

        if task == "language_id":
            is_correct = bool(resp.get("is_correct", False))
        elif task == "contradiction":
            # Correct if contradiction was properly recognized
            is_correct = len(resp.get("contradictions", [])) > 0 or ("contradict" in str(resp.get("answer", "")).lower())
        else:
            # QA / Citation: check non-empty grounded answer
            gold_ans = str(ex.get("gold_answer", "")).lower()
            gen_ans = str(resp.get("answer", "")).lower()
            if "i don't know" not in gen_ans and len(gen_ans) > 3:
                # Key token overlap
                gold_words = [w for w in gold_ans.split() if len(w) > 3]
                if gold_words:
                    is_correct = any(w in gen_ans for w in gold_words)
                else:
                    is_correct = True

        if is_correct:
            scores[cat]["correct"] += 1

    report: Dict[str, Any] = {}
    for cat, v in scores.items():
        lo, hi = wilson_ci(v["correct"], v["total"])
        score_val = v["correct"] / v["total"] if v["total"] > 0 else 0.0
        report[cat] = {
            "n": v["total"],
            "correct": v["correct"],
            "score": round(score_val, 4),
            "score_percent": round(score_val * 100, 2),
            "ci_low": lo,
            "ci_high": hi,
            "ci_range_percent": f"[{lo*100:.1f}% - {hi*100:.1f}%]"
        }

    return report
