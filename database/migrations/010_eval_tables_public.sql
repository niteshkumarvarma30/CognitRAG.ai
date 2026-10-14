-- Migration 010: Fix Eval Tables (Collapse to Public Prefix)
-- Ensures eval tables are accessible via PostgREST in the public schema

CREATE TABLE IF NOT EXISTS eval_run_traces (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id           UUID NOT NULL,
    dataset_name     TEXT NOT NULL,
    question         TEXT,
    gold_answer      TEXT,
    generated_answer TEXT,
    judge_a_score    TEXT,
    judge_b_score    TEXT,
    exact_match      BOOLEAN,
    is_correct       BOOLEAN,
    metadata         JSONB DEFAULT '{}'::jsonb,
    created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eval_run_traces_run ON eval_run_traces (run_id);
