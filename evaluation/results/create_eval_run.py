"""
CognitRAG v4 — Create Eval Run Rows
Creates a run_id in public.eval_runs and returns it.
Run once per eval batch — the returned run_id is used to tag all results and traces.
"""
import os, sys, subprocess, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").strip().strip("'\"")
SUPABASE_SRK = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip().strip("'\"")

HEADERS = {
    "apikey": SUPABASE_SRK,
    "Authorization": f"Bearer {SUPABASE_SRK}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def get_git_commit() -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", "HEAD"],
                                       stderr=subprocess.DEVNULL).decode().strip()
    except Exception:
        return "unknown"

def create_run(label: str, notes: str = "", supersedes_run_id: str = None) -> str:
    """Insert a row into public.eval_runs and return its run_id UUID."""
    import requests
    payload = {
        "run_label": label,
        "git_commit": get_git_commit(),
        "notes": notes,
    }
    if supersedes_run_id:
        payload["supersedes_run_id"] = supersedes_run_id

    r = requests.post(f"{SUPABASE_URL}/rest/v1/eval_runs",
                      headers=HEADERS, json=payload, timeout=15)
    if r.status_code not in (200, 201):
        raise RuntimeError(f"Failed to create run: HTTP {r.status_code} — {r.text[:200]}\n"
                           f"Have you applied db/001_eval_runs_schema.sql to Supabase?")

    data = r.json()
    run_id = data[0]["run_id"] if isinstance(data, list) else data["run_id"]
    print(f"  Created run '{label}' → run_id: {run_id}")
    return run_id

def save_run_ids(run_ids: dict, path: str = None):
    """Persist run_ids to a local JSON file so other scripts can load them."""
    if path is None:
        path = os.path.join(os.path.dirname(__file__), "data", "run_ids.json")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(run_ids, f, indent=2)
    print(f"  Saved run_ids → {path}")

def load_run_ids(path: str = None) -> dict:
    if path is None:
        path = os.path.join(os.path.dirname(__file__), "data", "run_ids.json")
    with open(path) as f:
        return json.load(f)

if __name__ == "__main__":
    print("\n[Creating v4 evaluation runs...]\n")

    hgqa_run_id = create_run(
        label="hgqa-v1",
        notes=(
            "Hinglish-Grounded QA baseline (replaces GLUECoS which is not on HuggingFace Hub). "
            "Source: rajpurkar/squad_v2 validation split, answerable rows only, N=60 stratified by topic. "
            "Questions wrapped in Hinglish prefix. Embedding: Amazon Titan (production baseline). "
            "Judges: gpt-oss-20b + qwen3.8-27b, aggregation: most-conservative."
        )
    )

    comi_run_id = create_run(
        label="comi-lingua-revalidation-v2",
        notes=(
            "Out-of-sample revalidation of the hi-latn threshold fix. "
            "Excludes all 120 example_ids from the original N=120 diagnostic run (seed 42). "
            "New sample: N=120, seed 99, stratified 40/label (en, hi-latn, mixed). "
            "Classifier: src/ingestion/language_detector.py (fixed version with homograph disambiguation)."
        )
    )

    run_ids = {"hgqa_v1": hgqa_run_id, "comi_lingua_revalidation_v2": comi_run_id}
    save_run_ids(run_ids)

    print(f"\n✅  Both runs created:")
    print(f"    hgqa-v1                    → {hgqa_run_id}")
    print(f"    comi-lingua-revalidation-v2 → {comi_run_id}")
    print(f"\n  Next: run run_hgqa_eval.py and run_comi_lingua_revalidation.py")
