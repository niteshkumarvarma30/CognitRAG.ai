-- Migration 005: Benchmark Runs Table for CognitRAG.ai Evaluation Suite
-- Records golden-dataset benchmark runs, Wilson 95% confidence intervals, and judge calibration metrics.

CREATE TABLE IF NOT EXISTS benchmark_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_name TEXT NOT NULL,
    category TEXT,
    metric_name TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    ci_low FLOAT,
    ci_high FLOAT,
    sample_size INTEGER NOT NULL,
    eval_method TEXT NOT NULL,            -- 'existing_golden_label' | 'llm_judge_calibrated'
    judge_model TEXT,
    calibration_agreement FLOAT,          -- agreement % from judge calibration, null if existing_golden_label
    dataset_version TEXT NOT NULL,
    run_date TIMESTAMPTZ DEFAULT now(),
    methodology_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_benchmark_dataset ON benchmark_runs (dataset_name, run_date DESC);
