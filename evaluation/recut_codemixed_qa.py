import os
import sys
import json
import numpy as np
from typing import Dict, Any, List, Tuple

sys.stdout.reconfigure(encoding='utf-8')

def wilson_ci(successes: int, n: int, z: float = 1.96) -> Tuple[float, float]:
    """Computes Wilson score 95% Confidence Interval for a binomial proportion."""
    if n == 0:
        return (0.0, 0.0)
    phat = successes / n
    denom = 1 + z**2 / n
    center = (phat + z**2 / (2 * n)) / denom
    margin = (z * np.sqrt((phat * (1 - phat) + z**2 / (4 * n)) / n)) / denom
    return (round(max(0.0, float(center - margin)), 4), round(min(1.0, float(center + margin)), 4))

def aggregate_judges(judge_a_label: str, judge_b_label: str) -> Tuple[str, bool]:
    """
    Returns (final_label, was_disagreement)
    Rule: if judges disagree, take the MORE CONSERVATIVE label
    (UNSUPPORTED > PARTIAL > SUPPORTED in strictness) — a disagreement
    means the claim's support isn't unambiguous, so don't default to
    the generous reading.
    """
    strictness = {"UNSUPPORTED": 0, "PARTIAL": 1, "SUPPORTED": 2}
    label_a = judge_a_label.strip().upper() if judge_a_label else "UNSUPPORTED"
    label_b = judge_b_label.strip().upper() if judge_b_label else "UNSUPPORTED"
    
    if label_a == label_b:
        return label_a, False
    
    final = min([label_a, label_b], key=lambda l: strictness.get(l, 0))
    return final, True

def is_abstention(gen_answer: str, confidence: float = 1.0) -> bool:
    """Checks if the assistant properly abstained / refused when no context was present."""
    if not gen_answer or gen_answer.strip() == "":
        return True
    if confidence < 0.3:
        return True
    
    clean = gen_answer.strip().lower().rstrip(".")
    abstention_phrases = [
        "i don't know",
        "i do not know",
        "cannot be answered",
        "can't be answered",
        "not enough information",
        "no context provided",
        "insufficient context",
        "not mentioned in the text",
        "unknown"
    ]
    for phrase in abstention_phrases:
        if phrase in clean:
            return True
    return False

def recut_codemixed_qa():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    traces_path = os.path.join(base_dir, "results", "codemixed_qa_traces.json")
    train_data_path = os.path.join(base_dir, "data", "code_mixed_qa_train.json")
    output_path = os.path.join(base_dir, "results", "codemixed_qa_recut_results.json")

    with open(traces_path, "r", encoding="utf-8") as f:
        traces = json.load(f)

    with open(train_data_path, "r", encoding="utf-8") as f:
        source_questions = {str(q["id"]): q for q in json.load(f).get("questions", [])}

    print(f"Total traces loaded: {len(traces)}")

    # Attach context and resolve judges
    disagreements = 0
    for r in traces:
        qid = str(r["id"])
        source_item = source_questions.get(qid, {})
        r["retrieved_context"] = source_item.get("context", "")
        
        final_label, was_disagreed = aggregate_judges(r.get("judge_a", ""), r.get("judge_b", ""))
        r["final_judge_label"] = final_label
        r["was_disagreement"] = was_disagreed
        if was_disagreed:
            disagreements += 1

    total_n = len(traces)
    disagreement_rate = round(disagreements / total_n, 4) if total_n else 0.0
    print(f"Judge disagreement rate: {disagreement_rate * 100:.2f}% ({disagreements}/{total_n})")

    # B1: Split by real context vs placeholder context
    with_context, without_context = [], []
    for r in traces:
        ctx = r.get("retrieved_context", "").strip().lower()
        if ctx in ("", "general", "none"):
            without_context.append(r)
        else:
            with_context.append(r)

    print(f"With real context: {len(with_context)}")
    print(f"No real context (placeholder): {len(without_context)}")

    # B2: Two separate metrics
    # Metric 1: Grounded Retrieval Accuracy on real context
    with_ctx_correct = sum(1 for r in with_context if r["final_judge_label"] == "SUPPORTED")
    n_with_ctx = len(with_context)
    acc_with_ctx = round(with_ctx_correct / n_with_ctx, 4) if n_with_ctx else 0.0
    ci_low_with_ctx, ci_high_with_ctx = wilson_ci(with_ctx_correct, n_with_ctx)

    # Metric 2: Abstention correctness rate on placeholder context
    abstention_correct = sum(1 for r in without_context if is_abstention(r.get("generated_answer", ""), r.get("confidence", 1.0)))
    n_without_ctx = len(without_context)
    abstention_rate = round(abstention_correct / n_without_ctx, 4) if n_without_ctx else 0.0
    ci_low_abstain, ci_high_abstain = wilson_ci(abstention_correct, n_without_ctx)

    # B4: Language-specific breakdowns (Grounded retrieval on real context)
    hindi_with_ctx = [r for r in with_context if r.get("category") == "Hindi"]
    n_hindi_ctx = len(hindi_with_ctx)
    hindi_ctx_correct = sum(1 for r in hindi_with_ctx if r["final_judge_label"] == "SUPPORTED")
    acc_hindi_ctx = round(hindi_ctx_correct / n_hindi_ctx, 4) if n_hindi_ctx else 0.0
    ci_low_hindi, ci_high_hindi = wilson_ci(hindi_ctx_correct, n_hindi_ctx)

    telugu_with_ctx = [r for r in with_context if r.get("category") == "Telugu"]
    n_telugu_ctx = len(telugu_with_ctx)
    telugu_ctx_correct = sum(1 for r in telugu_with_ctx if r["final_judge_label"] == "SUPPORTED")
    acc_telugu_ctx = round(telugu_ctx_correct / n_telugu_ctx, 4) if n_telugu_ctx else 0.0
    ci_low_telugu, ci_high_telugu = wilson_ci(telugu_ctx_correct, n_telugu_ctx)

    # Determine status based on sample size in cells
    status = "preliminary (check N per cell)" if n_with_ctx < 30 else "statistically_sound"

    # B5: Required final output shape
    results_payload = {
        "dataset": "codemixed-qa",
        "recut_from": "original N=90 run, no new pipeline calls",
        "context_split": {
            "with_real_context": {
                "n": n_with_ctx,
                "grounded_retrieval_accuracy": acc_with_ctx,
                "ci_low": ci_low_with_ctx,
                "ci_high": ci_high_with_ctx
            },
            "placeholder_context": {
                "n": n_without_ctx,
                "abstention_correctness_rate": abstention_rate,
                "ci_low": ci_low_abstain,
                "ci_high": ci_high_abstain
            }
        },
        "judge_aggregation_rule": "most_conservative_on_disagreement",
        "judge_disagreement_rate": disagreement_rate,
        "hindi_only": {
            "n": n_hindi_ctx,
            "grounded_retrieval_accuracy": acc_hindi_ctx,
            "ci_low": ci_low_hindi,
            "ci_high": ci_high_hindi
        },
        "telugu_only": {
            "n": n_telugu_ctx,
            "grounded_retrieval_accuracy": acc_telugu_ctx,
            "ci_low": ci_low_telugu,
            "ci_high": ci_high_telugu,
            "note": "not a current product target"
        },
        "status": status
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results_payload, f, indent=2)

    print("\n--- RECUT RESULTS JSON ---")
    print(json.dumps(results_payload, indent=2))
    return results_payload

if __name__ == "__main__":
    recut_codemixed_qa()
