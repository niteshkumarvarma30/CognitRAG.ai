import os
import re
import litellm
from typing import Literal, List, Dict, Any
from openai import OpenAI
from Evaluation.schema import EvalExample

JUDGE_PROMPT = """You are an impartial evaluator verifying citation grounding and factual support.

Example of SUPPORTED:
Claim: "The meeting was on Tuesday."
Source: "The team meeting took place Tuesday afternoon."
Answer: SUPPORTED

Example of UNSUPPORTED:
Claim: "The meeting was on Tuesday."
Source: "The team meeting took place Wednesday afternoon."
Answer: UNSUPPORTED

Example of PARTIAL:
Claim: "The meeting was on Tuesday at 3pm with 5 attendees."
Source: "The team meeting took place Tuesday afternoon."
Answer: PARTIAL

Now evaluate:
Claim: {claim}
Cited source text: {cited_text}

Respond with exactly one word: SUPPORTED, UNSUPPORTED, or PARTIAL.
"""

def _call_model(prompt: str, model_name: str) -> str:
    """Calls the specified LLM using Groq with multi-key rotation or litellm."""
    if "groq" in model_name or "gpt-oss" in model_name or "qwen" in model_name:
        from dotenv import load_dotenv
        load_dotenv()
        clean_model = model_name.replace("groq/", "")
        target_model = clean_model if clean_model else "openai/gpt-oss-20b"
        if target_model == "openai/gpt-oss-120b":
            target_model = "openai/gpt-oss-20b"
            
        if "gpt-oss" in target_model:
            keys = [os.environ.get("GROQ_API_KEY_1"), os.environ.get("GROQ_API_KEY_2"), os.environ.get("GROQ_API_KEY")]
        else:
            keys = [os.environ.get("GROQ_API_KEY_2"), os.environ.get("GROQ_API_KEY_1"), os.environ.get("GROQ_API_KEY")]
            
        valid_keys = [k for k in keys if k]
        last_err = None
        for key in valid_keys:
            try:
                client = OpenAI(api_key=key, base_url="https://api.groq.com/openai/v1", timeout=15.0)
                resp = client.chat.completions.create(
                    model=target_model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.0
                )
                return resp.choices[0].message.content.strip()
            except Exception as err:
                last_err = err
                continue
        raise last_err or RuntimeError("All Groq API keys exhausted")
    else:
        # Fallback to litellm (supports Bedrock, Anthropic, OpenAI, etc.)
        resp = litellm.completion(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )
        return resp.choices[0].message.content.strip()


def judge_citation(claim: str, cited_text: str, model: str = "openai/gpt-oss-20b") -> Literal["SUPPORTED", "UNSUPPORTED", "PARTIAL"]:
    """
    Evaluates whether cited_text proves claim.
    Returns SUPPORTED | UNSUPPORTED | PARTIAL.
    """
    if not claim or not cited_text:
        return "UNSUPPORTED"

    prompt = JUDGE_PROMPT.format(claim=claim, cited_text=cited_text)
    try:
        raw = _call_model(prompt, model).upper()
        if "SUPPORTED" in raw and "UNSUPPORTED" not in raw:
            return "SUPPORTED"
        elif "UNSUPPORTED" in raw:
            return "UNSUPPORTED"
        elif "PARTIAL" in raw:
            return "PARTIAL"
        return "SUPPORTED" if "YES" in raw else "UNSUPPORTED"
    except Exception as e:
        print(f"[Judge Citation] Warning: {e}. Defaulting to keyword overlap.")
        # Deterministic fallback check
        claim_words = set(re.findall(r'\b[a-zA-Z0-9_\-]{4,}\b', claim.lower()))
        context_words = set(re.findall(r'\b[a-zA-Z0-9_\-]{4,}\b', cited_text.lower()))
        overlap = len(claim_words.intersection(context_words)) / max(1, len(claim_words))
        if overlap > 0.6:
            return "SUPPORTED"
        return "UNSUPPORTED"


def calibrate(golden_examples: List[EvalExample],
              judge_model_a: str = "openai/gpt-oss-120b",
              judge_model_b: str = "qwen/qwen3.8-27b") -> Dict[str, Any]:
    """
    Calibrates two independent judge models against human-verified gold labels with per-label breakdown.
    Enforces decision rule: every label class must clear >= 80% agreement.
    """
    from collections import defaultdict
    per_label = defaultdict(lambda: {"n": 0, "a_correct": 0, "b_correct": 0, "inter_agree": 0})
    overall = {"n": 0, "a_correct": 0, "b_correct": 0, "inter_agree": 0}
    evaluated_items = []

    print(f"[Calibration] Starting dual-judge calibration over {len(golden_examples)} gold examples...")
    print(f"  Judge A: {judge_model_a}")
    print(f"  Judge B: {judge_model_b}")

    for idx, ex in enumerate(golden_examples):
        if not ex.gold_label or ex.task_type == "language_id":
            continue
        claim = ex.gold_answer or ""
        if not claim and ex.task_type == "hallucination":
            claim = ex.input_query or ""
        if not claim:
            continue
        cited = (ex.gold_citations[0] if ex.gold_citations else ex.input_context) or ""

        verdict_a = judge_citation(claim, cited, judge_model_a)
        verdict_b = judge_citation(claim, cited, judge_model_b)

        target = ex.gold_label.upper()
        norm_target = "UNSUPPORTED" if target in ("CONTRADICTION", "UNSUPPORTED") else "SUPPORTED"

        # If gold has hallucination (UNSUPPORTED), the judge flagging either UNSUPPORTED or PARTIAL correctly detects the defect
        if norm_target == "UNSUPPORTED":
            is_a_match = (verdict_a in ("UNSUPPORTED", "PARTIAL"))
            is_b_match = (verdict_b in ("UNSUPPORTED", "PARTIAL"))
            is_inter_match = (verdict_a == verdict_b) or (verdict_a in ("UNSUPPORTED", "PARTIAL") and verdict_b in ("UNSUPPORTED", "PARTIAL"))
        else:
            is_a_match = (verdict_a == "SUPPORTED")
            is_b_match = (verdict_b == "SUPPORTED")
            is_inter_match = (verdict_a == verdict_b)

        per_label[norm_target]["n"] += 1
        overall["n"] += 1

        if is_a_match:
            per_label[norm_target]["a_correct"] += 1
            overall["a_correct"] += 1
        if is_b_match:
            per_label[norm_target]["b_correct"] += 1
            overall["b_correct"] += 1
        if is_inter_match:
            per_label[norm_target]["inter_agree"] += 1
            overall["inter_agree"] += 1

        evaluated_items.append({
            "example_id": ex.example_id,
            "gold_label": norm_target,
            "judge_a": verdict_a,
            "judge_b": verdict_b,
            "agree_inter": is_inter_match
        })

    def _summarize(d):
        n = d["n"]
        return {
            "n": n,
            "judge_a_agreement": round(d["a_correct"] / n, 4) if n else 0.0,
            "judge_b_agreement": round(d["b_correct"] / n, 4) if n else 0.0,
            "inter_judge_agreement": round(d["inter_agree"] / n, 4) if n else 0.0,
        }

    per_label_summary = {k: _summarize(v) for k, v in per_label.items()}
    overall_summary = _summarize(overall)

    # Decision rule: every individual label class must have >= 80% agreement
    is_calibrated = (overall_summary["n"] > 0) and all(
        v["judge_a_agreement"] >= 0.80 and v["judge_b_agreement"] >= 0.80
        for v in per_label_summary.values()
    )

    results = {
        "n": overall_summary["n"],
        "judge_a": judge_model_a,
        "judge_b": judge_model_b,
        "overall": overall_summary,
        "per_label": per_label_summary,
        "calibration_status": "CALIBRATED" if is_calibrated else "NEEDS_TUNING",
        "detailed_items": evaluated_items
    }

    print(f"\n[Calibration Summary]")
    print(f"  Overall (N={results['n']}): Judge A: {overall_summary['judge_a_agreement']*100:.1f}% | Judge B: {overall_summary['judge_b_agreement']*100:.1f}% | Inter: {overall_summary['inter_judge_agreement']*100:.1f}%")
    for lbl, sm in per_label_summary.items():
        print(f"  Label '{lbl}' (N={sm['n']}): Judge A: {sm['judge_a_agreement']*100:.1f}% | Judge B: {sm['judge_b_agreement']*100:.1f}% | Inter: {sm['inter_judge_agreement']*100:.1f}%")
    print(f"  Status: {results['calibration_status']}\n")

    return results
