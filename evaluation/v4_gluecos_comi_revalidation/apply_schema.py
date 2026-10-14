"""
Apply the eval schema to Supabase using the Python client's postgrest-py.
Uses the service role key which bypasses RLS.
Tables are created one at a time via separate PostgREST-compatible DDL calls.
"""
import os, sys, requests
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
sys.stdout.reconfigure(encoding='utf-8')
from dotenv import load_dotenv; load_dotenv()

url = os.environ.get('SUPABASE_URL','').strip().strip("'\"")
srk = os.environ.get('SUPABASE_SERVICE_ROLE_KEY','').strip().strip("'\"")

HEADERS_JSON = {
    "apikey": srk,
    "Authorization": f"Bearer {srk}",
    "Content-Type": "application/json",
}

# Supabase exposes a /rest/v1/rpc endpoint. We can create a pg function that runs DDL.
# But we need an existing function. Instead — use the Supabase Management API if available.

# Management API (requires project ref + management token — usually same as service role)
project_ref = url.replace("https://","").split(".")[0]

mgmt_url = f"https://api.supabase.com/v1/projects/{project_ref}/database/query"

DDL_STATEMENTS = [
    """CREATE TABLE IF NOT EXISTS public.eval_runs (
        run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        run_label TEXT NOT NULL,
        git_commit TEXT,
        started_at TIMESTAMPTZ DEFAULT now(),
        completed_at TIMESTAMPTZ,
        notes TEXT,
        supersedes_run_id UUID REFERENCES public.eval_runs(run_id)
    )""",
    """CREATE TABLE IF NOT EXISTS public.eval_benchmark_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        run_id UUID NOT NULL REFERENCES public.eval_runs(run_id) ON DELETE CASCADE,
        dataset_name TEXT NOT NULL,
        category TEXT,
        metric_name TEXT NOT NULL,
        metric_value FLOAT NOT NULL,
        ci_low FLOAT,
        ci_high FLOAT,
        sample_size INTEGER NOT NULL,
        eval_method TEXT NOT NULL,
        judge_model TEXT,
        judge_aggregation_rule TEXT,
        dataset_version TEXT NOT NULL,
        methodology_url TEXT,
        status TEXT NOT NULL
    )""",
    """CREATE TABLE IF NOT EXISTS public.eval_raw_traces (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        run_id UUID NOT NULL REFERENCES public.eval_runs(run_id) ON DELETE CASCADE,
        example_id TEXT NOT NULL,
        input_query TEXT,
        input_context TEXT,
        gold_answer TEXT,
        generated_answer TEXT,
        judge_a_label TEXT,
        judge_b_label TEXT,
        final_label TEXT,
        disagreed BOOLEAN,
        exact_match BOOLEAN
    )""",
    "CREATE INDEX IF NOT EXISTS idx_eval_results_run_id ON public.eval_benchmark_results(run_id)",
    "CREATE INDEX IF NOT EXISTS idx_eval_traces_run_id ON public.eval_raw_traces(run_id)",
    "CREATE INDEX IF NOT EXISTS idx_eval_results_dataset ON public.eval_benchmark_results(dataset_name)",
]

print(f"Project ref: {project_ref}")
print(f"Applying {len(DDL_STATEMENTS)} DDL statements via Supabase Management API...\n")

for i, stmt in enumerate(DDL_STATEMENTS, 1):
    label = stmt.strip()[:60].replace('\n', ' ')
    r = requests.post(mgmt_url,
        headers={**HEADERS_JSON, "Authorization": f"Bearer {srk}"},
        json={"query": stmt + ";"},
        timeout=20)
    if r.status_code in (200, 201):
        print(f"  [{i}] ✅ {label}")
    else:
        print(f"  [{i}] ❌ HTTP {r.status_code}: {r.text[:120]}")
        print(f"       Statement: {label}")

# Verify tables exist
print("\nVerifying tables via PostgREST...")
for tbl in ['eval_runs', 'eval_benchmark_results', 'eval_raw_traces']:
    r = requests.get(f"{url}/rest/v1/{tbl}?limit=0",
        headers={"apikey": srk, "Authorization": f"Bearer {srk}"},
        timeout=10)
    if r.status_code in (200, 206):
        print(f"  ✅ public.{tbl} is accessible")
    else:
        print(f"  ❌ public.{tbl} not found (HTTP {r.status_code})")
        print(f"     → Apply db/001_eval_runs_schema.sql manually via Supabase Dashboard > SQL Editor")
