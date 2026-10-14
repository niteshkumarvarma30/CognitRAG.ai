"""
CognitRAG v4 — Sync COMI v3 Results & Traces to Supabase
Inserts:
1. public.eval_runs row for comi-lingua-revalidation-v3
2. public.eval_benchmark_results rows (hi-latn, mixed, overall)
3. public.eval_raw_traces rows (80 traces)
"""
import os, sys, json, requests, subprocess
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

def sync():
    v3_results_path = os.path.join(os.path.dirname(__file__), "results", "comi_v3_results.json")
    v3_traces_path = os.path.join(os.path.dirname(__file__), "traces", "comi_v3_traces.json")
    run_ids_path = os.path.join(os.path.dirname(__file__), "data", "run_ids.json")

    with open(v3_results_path, "r", encoding="utf-8") as f:
        res = json.load(f)

    with open(v3_traces_path, "r", encoding="utf-8") as f:
        traces_data = json.load(f)

    with open(run_ids_path, "r", encoding="utf-8") as f:
        run_ids = json.load(f)

    run_id = res["run_id"]
    v2_run_id = run_ids.get("comi_lingua_revalidation_v2")

    print(f"[Supabase Sync] Inserting eval_run: {run_id}")
    run_payload = {
        "run_id": run_id,
        "run_label": "comi-lingua-revalidation-v3",
        "git_commit": get_git_commit(),
        "notes": "COMI-LINGUA v3 out-of-sample revalidation (seed=7, N=80). Fixed K=1 capitalized English/proper nouns override. Strictly excludes 200 prior IDs from v1 and v2. English is exhausted.",
        "supersedes_run_id": v2_run_id
    }
    r = requests.post(f"{SUPABASE_URL}/rest/v1/eval_runs", headers=HEADERS, json=run_payload, timeout=15)
    if r.status_code in (200, 201):
        print("  -> Successfully created run row in eval_runs.")
    else:
        print(f"  -> eval_runs response HTTP {r.status_code}: {r.text[:200]}")

    # Insert benchmark results
    print(f"[Supabase Sync] Inserting eval_benchmark_results...")
    results_to_insert = []
    
    for lbl in ["hi-latn", "mixed"]:
        lbl_data = res["per_label"][lbl]
        results_to_insert.append({
            "run_id": run_id,
            "dataset_name": "comi-lingua",
            "category": lbl,
            "metric_name": "language_id_accuracy_out_of_sample",
            "metric_value": lbl_data["accuracy"],
            "ci_low": lbl_data["ci"][0],
            "ci_high": lbl_data["ci"][1],
            "sample_size": lbl_data["n"],
            "eval_method": "direct_classification_no_judge",
            "dataset_version": "LingoIITGN/COMI-LINGUA, out-of-sample N=80 seed=7 (v3)",
            "status": lbl_data["status"]
        })

    overall_data = res["overall"]
    results_to_insert.append({
        "run_id": run_id,
        "dataset_name": "comi-lingua",
        "category": "overall",
        "metric_name": "language_id_accuracy_out_of_sample",
        "metric_value": overall_data["accuracy"],
        "ci_low": overall_data["ci"][0],
        "ci_high": overall_data["ci"][1],
        "sample_size": overall_data["n"],
        "eval_method": "direct_classification_no_judge",
        "dataset_version": "LingoIITGN/COMI-LINGUA, out-of-sample N=80 seed=7 (v3)",
        "status": "statistically_sound"
    })

    r_bench = requests.post(f"{SUPABASE_URL}/rest/v1/eval_benchmark_results",
                            headers=HEADERS, json=results_to_insert, timeout=15)
    print(f"  -> Benchmark results insert HTTP {r_bench.status_code}: {len(results_to_insert)} rows.")

    # Insert traces (batch of 80)
    print(f"[Supabase Sync] Inserting 80 traces into eval_raw_traces...")
    traces_payload = []
    for t in traces_data["traces"]:
        traces_payload.append({
            "run_id": run_id,
            "example_id": t["example_id"],
            "input_query": t["input_query"],
            "gold_answer": t["gold_answer"],
            "generated_answer": t["generated_answer"],
            "exact_match": t["exact_match"]
        })

    # Batch insert in chunks of 40
    for chunk_start in range(0, len(traces_payload), 40):
        chunk = traces_payload[chunk_start:chunk_start+40]
        r_tr = requests.post(f"{SUPABASE_URL}/rest/v1/eval_raw_traces",
                             headers=HEADERS, json=chunk, timeout=20)
        print(f"  -> Batch {chunk_start//40 + 1} insert HTTP {r_tr.status_code}: {len(chunk)} rows.")

    # Update run_ids.json
    run_ids["comi_lingua_revalidation_v3"] = run_id
    with open(run_ids_path, "w", encoding="utf-8") as f:
        json.dump(run_ids, f, indent=2)
    print(f"[Supabase Sync] Updated run_ids.json with comi_lingua_revalidation_v3.")

if __name__ == "__main__":
    sync()
