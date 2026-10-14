"""
CognitRAG v4 — HGQA (Hinglish-Grounded QA) Evaluation
Runs the full 8-stage CognitRAG pipeline on N=60 Hinglish-wrapped SQuAD v2 questions.
Every row has a real context passage — zero placeholder rows.

Judge setup:
  Judge A  : openai/gpt-oss-20b    (Groq)
  Judge B  : qwen/qwen3.8-27b      (Groq)
  Tiebreaker: nvidia/nemotron-3-ultra-550b-a55b (NVIDIA NIM)
  Aggregation: most-conservative (UNSUPPORTED > PARTIAL > SUPPORTED)

Run:
  python Evaluation/v4_gluecos_comi_revalidation/run_hgqa_eval.py
"""
import os, sys, json, time, math, requests
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from dotenv import load_dotenv
load_dotenv()

from Evaluation.v4_gluecos_comi_revalidation.loaders.hgqa_loader import load_hgqa
from Evaluation.v4_gluecos_comi_revalidation.create_eval_run import load_run_ids
from Evaluation.judge import judge_citation

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").strip().strip("'\"")
SUPABASE_SRK = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip().strip("'\"")
NVIDIA_KEY   = os.environ.get("NVIDIA_API_KEY", "").strip().strip("'\"")
GROQ_KEY     = os.environ.get("GROQ_API_KEY", "").strip().strip("'\"")

HEADERS = {
    "apikey": SUPABASE_SRK,
    "Authorization": f"Bearer {SUPABASE_SRK}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

JUDGE_A = "openai/gpt-oss-20b"
JUDGE_B = "qwen/qwen3.8-27b"
NVIDIA_TIEBREAKER = "nvidia/nemotron-3-ultra-550b-a55b"
NVIDIA_BASE = "https://integrate.api.nvidia.com/v1"


# ── Wilson confidence interval ──────────────────────────────────────────────
def wilson_ci(k: int, n: int, z: float = 1.96) -> tuple[float, float]:
    if n == 0:
        return 0.0, 0.0
    p = k / n
    denom = 1 + z**2 / n
    centre = (p + z**2 / (2 * n)) / denom
    margin = (z * math.sqrt(p * (1 - p) / n + z**2 / (4 * n**2))) / denom
    return round(max(0.0, centre - margin), 4), round(min(1.0, centre + margin), 4)


# ── Tiebreaker judge ─────────────────────────────────────────────────────────
def nvidia_judge(claim: str, context: str) -> str:
    prompt = (
        "You are an impartial evaluator. Does the CONTEXT support the CLAIM?\n"
        f"CLAIM: {claim}\nCONTEXT: {context[:800]}\n"
        "Respond with exactly one word: SUPPORTED, UNSUPPORTED, or PARTIAL."
    )
    try:
        r = requests.post(f"{NVIDIA_BASE}/chat/completions",
            headers={"Authorization": f"Bearer {NVIDIA_KEY}", "Content-Type": "application/json"},
            json={"model": NVIDIA_TIEBREAKER, "messages": [{"role": "user", "content": prompt}], "max_tokens": 10},
            timeout=45)
        if r.status_code == 200:
            raw = r.json()["choices"][0]["message"]["content"].strip().upper()
            if "UNSUPPORTED" in raw: return "UNSUPPORTED"
            if "PARTIAL"     in raw: return "PARTIAL"
            if "SUPPORTED"   in raw: return "SUPPORTED"
    except Exception as e:
        print(f"    [NVIDIA Tiebreaker] Error: {e}")
    return "UNSUPPORTED"  # conservative default on failure


# ── Aggregation: most-conservative ──────────────────────────────────────────
CONSERVATISM = {"UNSUPPORTED": 0, "PARTIAL": 1, "SUPPORTED": 2}

def aggregate_judges(a: str, b: str, claim: str = "", context: str = "") -> tuple[str, bool]:
    """Returns (final_label, disagreed)."""
    if a == b:
        return a, False
    # Disagreement — call tiebreaker
    c = nvidia_judge(claim, context)
    candidates = [a, b, c]
    # Most conservative: lowest rank wins
    final = min(candidates, key=lambda x: CONSERVATISM.get(x, 0))
    return final, True


# ── Supabase insert helpers ──────────────────────────────────────────────────
def insert_trace(run_id: str, row: dict):
    requests.post(f"{SUPABASE_URL}/rest/v1/eval_raw_traces",
                  headers=HEADERS, json={**row, "run_id": run_id}, timeout=15)

def insert_result(run_id: str, row: dict):
    requests.post(f"{SUPABASE_URL}/rest/v1/eval_benchmark_results",
                  headers=HEADERS, json={**row, "run_id": run_id}, timeout=15)


# ── Pipeline call (in-process LangGraph) ────────────────────────────────────
def run_pipeline(example: dict) -> str:
    """Run one HGQA example through CognitRAG. Returns generated answer string."""
    try:
        from src.retrieval.graph import crag_app
        state = {
            "tenant_id": os.environ.get("EVAL_TENANT_ID", "e0a10000-0000-4000-8000-000000000001"),
            "user_id": "eval_hgqa",
            "question": example["input_query"],
            "generation": "",
            "documents": example["input_context"],   # context_override: injects directly
            "route": "",
            "chat_history": [],
            "query_language": "mixed",
        }
        final = crag_app.invoke(state)
        return final.get("generation", "")
    except Exception as e:
        print(f"    [Pipeline] Error: {e}")
        return ""


# ── Main eval loop ───────────────────────────────────────────────────────────
def run_hgqa_eval(run_id: str, n: int = 60, seed: int = 42):
    print(f"\n{'='*55}")
    print(f"  HGQA v1 Evaluation  (run_id: {run_id[:8]}...)")
    print(f"{'='*55}\n")

    examples = load_hgqa(n=n, seed=seed)
    print(f"\n[Eval] Starting {len(examples)} examples...")
    print(f"  Judge A : {JUDGE_A}")
    print(f"  Judge B : {JUDGE_B}")
    print(f"  Tiebreaker: {NVIDIA_TIEBREAKER}\n")

    correct = 0
    disagreements = 0
    traces = []

    for idx, ex in enumerate(examples, 1):
        print(f"  [{idx:02d}/{len(examples)}] {ex['original_q'][:60]}...")

        # 1. Run pipeline
        answer = run_pipeline(ex)

        # 2. Dual judge
        a_label = judge_citation(answer, ex["input_context"], JUDGE_A)
        b_label = judge_citation(answer, ex["input_context"], JUDGE_B)
        final_label, disagreed = aggregate_judges(a_label, b_label,
                                                   claim=answer,
                                                   context=ex["input_context"])

        # 3. Exact match (substring)
        exact = ex["gold_answer"].strip().lower() in answer.strip().lower() if answer else False

        is_correct = final_label == "SUPPORTED"
        correct += int(is_correct)
        if disagreed:
            disagreements += 1

        symbol = "✅" if is_correct else "❌"
        print(f"    {symbol} JudgeA={a_label} JudgeB={b_label} Final={final_label} "
              f"{'(DISAGREE→tiebreaker)' if disagreed else ''} ExactMatch={exact}")

        trace = {
            "example_id": ex["example_id"],
            "input_query": ex["input_query"],
            "input_context": ex["input_context"][:500],
            "gold_answer": ex["gold_answer"],
            "generated_answer": answer[:500] if answer else "",
            "judge_a_label": a_label,
            "judge_b_label": b_label,
            "final_label": final_label,
            "disagreed": disagreed,
            "exact_match": exact,
        }
        traces.append(trace)
        insert_trace(run_id, trace)
        time.sleep(0.3)  # Groq rate limit buffer

    n_total = len(examples)
    accuracy = correct / n_total
    lo, hi = wilson_ci(correct, n_total)
    disagree_rate = disagreements / n_total

    print(f"\n{'='*55}")
    print(f"  HGQA Results (N={n_total})")
    print(f"  Grounded Retrieval Accuracy : {accuracy*100:.1f}%")
    print(f"  Wilson 95% CI              : [{lo*100:.1f}%, {hi*100:.1f}%]")
    print(f"  Judge Disagreement Rate    : {disagree_rate*100:.1f}%")
    print(f"  Status                     : {'statistically_sound' if n_total >= 30 else 'preliminary'}")
    print(f"{'='*55}\n")

    # Store aggregated result
    insert_result(run_id, {
        "dataset_name": "hgqa-v1",
        "category": None,
        "metric_name": "grounded_retrieval_accuracy",
        "metric_value": accuracy,
        "ci_low": lo,
        "ci_high": hi,
        "sample_size": n_total,
        "eval_method": "llm_judge_calibrated",
        "judge_model": f"{JUDGE_A}+{JUDGE_B}+{NVIDIA_TIEBREAKER}(tiebreaker)",
        "judge_aggregation_rule": "most_conservative_on_disagreement",
        "dataset_version": "rajpurkar/squad_v2 validation, answerable rows, N=60, seed=42",
        "status": "statistically_sound" if n_total >= 30 else "preliminary",
    })

    # Save traces locally
    out_path = os.path.join(os.path.dirname(__file__), "traces", "hgqa_v1_traces.json")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"run_id": run_id, "n": n_total, "accuracy": accuracy,
                   "ci": [lo, hi], "traces": traces}, f, indent=2, ensure_ascii=False)
    print(f"  Raw traces saved → {out_path}")

    return {"accuracy": accuracy, "ci": (lo, hi), "n": n_total,
            "disagreement_rate": disagree_rate, "traces": traces}


if __name__ == "__main__":
    run_ids = load_run_ids()
    run_id  = run_ids["hgqa_v1"]
    results = run_hgqa_eval(run_id)
