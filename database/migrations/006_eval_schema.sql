-- Migration 006: Isolated Evaluation Schema
-- Creates a completely isolated 'eval' schema so benchmark ingestions and runs
-- never interact with or risk public/production tables.

CREATE SCHEMA IF NOT EXISTS eval;

-- Mirror documents and document_chunks table structures in eval schema
CREATE TABLE IF NOT EXISTS eval.documents (LIKE public.documents INCLUDING ALL);
CREATE TABLE IF NOT EXISTS eval.document_chunks (LIKE public.document_chunks INCLUDING ALL);

-- Benchmark metrics table in eval schema
CREATE TABLE IF NOT EXISTS eval.benchmark_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_name TEXT NOT NULL,
    category TEXT,
    metric_name TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    ci_low FLOAT,
    ci_high FLOAT,
    sample_size INTEGER NOT NULL,
    eval_method TEXT NOT NULL,
    judge_model TEXT,
    calibration_agreement FLOAT,
    dataset_version TEXT NOT NULL,
    run_date TIMESTAMPTZ DEFAULT now(),
    methodology_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_eval_benchmark_dataset ON eval.benchmark_runs (dataset_name, run_date DESC);
CREATE INDEX IF NOT EXISTS idx_eval_chunks_tenant ON eval.document_chunks (tenant_id);
