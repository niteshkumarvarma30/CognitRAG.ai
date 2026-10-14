# CognitRAG v4 — Evaluation Suite
### `Evaluation/v4_gluecos_comi_revalidation/`

This folder contains the **v4 evaluation batch** for CognitRAG. It is self-contained: all scripts, loaders, traces, and results live here. It never overwrites previous evaluation results.

---

## What's in This Folder

```
v4_gluecos_comi_revalidation/
├── api_check.py                      ← Step 0: Run before anything else
├── create_eval_run.py                ← Step 1: Creates run_ids in Supabase
├── run_hgqa_eval.py                  ← Step 2: HGQA grounded QA eval (N=60)
├── run_comi_lingua_revalidation.py   ← Step 3: COMI out-of-sample eval (N=120)
├── compare_runs.py                   ← Step 4: Side-by-side results comparison
├── api_check_sarvam.py               ← Utility: probe Sarvam API endpoints
├── loaders/
│   ├── hgqa_loader.py                ← SQuAD v2 + Hinglish prefix wrapping
│   └── comi_lingua_loader.py         ← Excludes prior 120 example_ids (seed 99)
├── db/
│   └── 001_eval_runs_schema.sql      ← Apply to Supabase dashboard first!
├── data/
│   ├── prior_comi_ids.json           ← The 120 IDs excluded from COMI revalidation
│   └── run_ids.json                  ← Created by create_eval_run.py
├── traces/
│   ├── hgqa_v1_traces.json           ← Created by run_hgqa_eval.py
│   └── comi_revalidation_traces.json ← Created by run_comi_lingua_revalidation.py
└── results/
    └── benchmark_report_v4.md        ← Created by compare_runs.py
```

---

## How to Run (in order)

### 0. Apply the SQL schema to Supabase
Open Supabase Dashboard → SQL Editor → paste contents of `db/001_eval_runs_schema.sql` → Run.

### 1. Check all APIs
```bash
python Evaluation/v4_gluecos_comi_revalidation/api_check.py
```
Must show all ✅. Fix any ❌ before proceeding.

### 2. Create run_ids
```bash
python Evaluation/v4_gluecos_comi_revalidation/create_eval_run.py
```
Creates two rows in `public.eval_runs` and saves them to `data/run_ids.json`.

### 3. Run HGQA evaluation
```bash
python Evaluation/v4_gluecos_comi_revalidation/run_hgqa_eval.py
```
Runs 60 Hinglish-wrapped SQuAD questions through the full CognitRAG pipeline.
Saves traces to `traces/hgqa_v1_traces.json` and results to Supabase.

### 4. Run COMI-LINGUA revalidation
```bash
python Evaluation/v4_gluecos_comi_revalidation/run_comi_lingua_revalidation.py
```
Tests the fixed language detector on 120 fresh examples (zero overlap with original 120).
Saves traces to `traces/comi_revalidation_traces.json`.

### 5. Compare both runs
```bash
python Evaluation/v4_gluecos_comi_revalidation/compare_runs.py
```
Prints side-by-side table + automated verdict for the hi-latn fix.

---

## Key Decisions Documented

| Decision | Reason |
|---|---|
| GLUECoS replaced with SQuAD v2 | GLUECoS not on HuggingFace Hub, requires DrQA pipeline |
| `eval` schema → `public` schema | PostgREST only exposes `public`, `graphql` schemas |
| Titan used for embedding | Production baseline — honest current-state score |
| 3-judge tiebreaker (NVIDIA nemotron-550b) | Breaks ties conservatively on disagreement |
| Seed 99 for COMI revalidation | Original used 42 — different seed guarantees fresh sample |

---

## Reporting Rule

**Always filter by `run_id`.** Never query `eval_benchmark_results` unfiltered.

```sql
-- ✅ Correct
SELECT * FROM eval_benchmark_results WHERE run_id = '<uuid>';

-- ❌ Wrong — mixes all historical runs
SELECT * FROM eval_benchmark_results;
```
