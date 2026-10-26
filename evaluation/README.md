# CognitRAG Evaluation

Single folder for all evaluation work. Consolidated from `Evaluation/`, `eval_results/`, and `src/evaluation/`.

## Structure

```
evaluation/
├── datasets/         # Input data (test sets, loaders)
│   ├── data/
│   └── loaders/
├── runners/          # Scripts that execute eval runs
├── judges/           # LLM-as-Judge + scoring logic
├── tools/            # Build, inspect, tune utilities
├── results/          # Output JSON/CSV from runs
└── store_results.py  # Writes scores to public.eval_benchmark_runs
```

## Running an Evaluation

```bash
# Full pipeline evaluation
python evaluation/runners/run_pipeline.py

# Multi-view ablation
python evaluation/runners/run_multiview_ground_truth_judgments.py

# All evaluations (sequential)
python evaluation/runners/run_all_evaluations.py
```

## Adding a New Eval Run

1. Create a new runner in `runners/`
2. Use `judges/judge.py` for LLM-as-Judge scoring
3. Call `store_results.py` to persist scores to Supabase `eval_benchmark_runs`
4. Results are tracked by `run_id` in `public.eval_runs`

## Judge Models

- **Primary**: NVIDIA Nemotron (reasoning) — for faithfulness, context accuracy
- **Secondary**: Gemini 2.5 Flash — for relevance, latency benchmarks
