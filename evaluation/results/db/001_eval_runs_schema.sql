-- ============================================================
-- CognitRAG v4 Evaluation — Run-Scoped Schema Migration
-- Apply via: Supabase Dashboard → SQL Editor → Run
-- Schema: public (eval schema not exposed via PostgREST)
-- Tables use eval_ prefix to avoid collision with product tables
-- ============================================================

-- 1. Run registry — one row per eval execution
CREATE TABLE IF NOT EXISTS public.eval_runs (
    run_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_label       TEXT NOT NULL,           -- e.g. 'hgqa-v1', 'comi-lingua-revalidation-v2'
    git_commit      TEXT,                    -- git rev-parse HEAD at run time
    started_at      TIMESTAMPTZ DEFAULT now(),
    completed_at    TIMESTAMPTZ,
    notes           TEXT,                    -- what this run supersedes + why
    supersedes_run_id UUID REFERENCES public.eval_runs(run_id)
);

-- 2. Aggregated metric results — one row per (run, dataset, category, metric)
CREATE TABLE IF NOT EXISTS public.eval_benchmark_results (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id               UUID NOT NULL REFERENCES public.eval_runs(run_id) ON DELETE CASCADE,
    dataset_name         TEXT NOT NULL,
    category             TEXT,              -- e.g. per-label key like 'hi-latn', 'en', 'mixed'
    metric_name          TEXT NOT NULL,
    metric_value         FLOAT NOT NULL,
    ci_low               FLOAT,
    ci_high              FLOAT,
    sample_size          INTEGER NOT NULL,
    eval_method          TEXT NOT NULL,     -- 'llm_judge_calibrated' | 'direct_classification_no_judge'
    judge_model          TEXT,
    judge_aggregation_rule TEXT,
    dataset_version      TEXT NOT NULL,
    methodology_url      TEXT,
    status               TEXT NOT NULL      -- 'statistically_sound' | 'preliminary'
);

-- 3. Raw per-example traces — full input/output/judgment for every example
CREATE TABLE IF NOT EXISTS public.eval_raw_traces (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id           UUID NOT NULL REFERENCES public.eval_runs(run_id) ON DELETE CASCADE,
    example_id       TEXT NOT NULL,
    input_query      TEXT,
    input_context    TEXT,
    gold_answer      TEXT,
    generated_answer TEXT,
    judge_a_label    TEXT,
    judge_b_label    TEXT,
    final_label      TEXT,
    disagreed        BOOLEAN,
    exact_match      BOOLEAN
);

-- Indexes for common report queries
CREATE INDEX IF NOT EXISTS idx_eval_results_run_id  ON public.eval_benchmark_results(run_id);
CREATE INDEX IF NOT EXISTS idx_eval_traces_run_id   ON public.eval_raw_traces(run_id);
CREATE INDEX IF NOT EXISTS idx_eval_results_dataset ON public.eval_benchmark_results(dataset_name);

-- ============================================================
-- REPORTING RULE: always filter by run_id
--   GOOD:  SELECT * FROM eval_benchmark_results WHERE run_id = '<uuid>'
--   BAD:   SELECT * FROM eval_benchmark_results   -- mixes historical runs!
-- ============================================================
