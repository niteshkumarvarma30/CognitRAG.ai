# CognitRAG — Enterprise Evaluation Suite & Benchmark Archive

**Last Updated:** September 6, 2026  
**Scope:** Verified evaluations established on and after September 4, 2026 (Active Baseline & Improvements). All pre-Sept 4 legacy drafts are archived in `legacy_archive/`.

---

## 📂 Directory Structure Overview

```text
eval_suite/
├── 01_baseline_and_refixes/         # Raw JSON metrics for Tasks 1.1 to 4.1 + refixes (Sept 4-6)
├── 02_enterprise_8stage_audit/      # Primary-source SEC fact-check, 50-query execution traces, raw docs
├── 03_ragas_and_deepeval/           # Official third-party DeepEval & RAGAS benchmark reports & datasets
├── 04_master_reports/               # High-level executive summaries & staff-engineer architecture guides
└── legacy_archive/                  # Pre-September 4 obsolete runs safely archived
```

---

## 1. Directory Contents & Navigation

### 📁 `01_baseline_and_refixes/`
Contains the raw JSON execution logs for the 14 core pipeline tasks run between September 4 and September 6:
* **Task 1.1 – 1.4 (Ingestion & Extraction):** Connector completeness (`100%`), parser quality (`95%+`), pure vector baseline recall (`26.0%`), entity resolution (`1.0` precision).
* **Task 2.1 – 2.4 (Retrieval & Reasoning):** Router accuracy (`100%`), hybrid search ablation (`+11.1%` RRF advantage), relevance gate calibration (`0 leaks`), CRAG recovery.
* **Task 3.1 – 3.4 (Generation & Calibration):** Faithfulness determinism, citation precision (`100%`), Brier calibration (`0.1810`), temporal memory recall.
* **Task 4.1 (Governance):** Multi-tenant PostgreSQL RLS & Neo4j graph isolation (`0 cross-tenant leaks`).
* **The Refixes (R1.1 – R5):** Identifier regex bypass promotion (Rank #11–92 $\to$ Rank #1), Brier score refusal recalibration (0.05).

---

### 📁 `02_enterprise_8stage_audit/`
Primary-source fact-checked evaluation package verified directly against SEC EDGAR filing (msft-20240630.htm) and AWS Compute SLA:
* **`README_AUDIT_GUIDE.md`**: Complete non-technical and technical audit manual.
* **`reports/full_audit_evaluation_report.md`**: 50-query audit ledger with headline metrics.
* **`reports/audited_scorecard.md`**: 1-page executive summary.
* **`stage_traces/query_trace_catalog.md`**: Interactive side-by-side ranks across all 8 stages.
* **`stage_traces/traces_json/`**: 50 separate JSON files (`real_jira_1.json` to `real_negative_50.json`) logging vector similarity, keyword scores, graph traversals, and token outputs.
* **`datasets/raw_documents/`**: 65 authentic documents across Jira, GitHub, Slack, Notion, and official SEC Note 12 / Note 4.
* **`scripts/run_stage_by_stage_audit.py`**: CLI tool to inspect any query live on the terminal.

---

### 📁 `03_ragas_and_deepeval/`
Official third-party industry benchmark scores run on the exact same 50 real enterprise questions:
* **`reports/deepeval_report.md`**: Official DeepEval v4.2.2 results:
  * **Faithfulness:** `100.0%`
  * **Answer Relevancy:** `94.4%`
  * **G-Eval Correctness:** `100.0%`
  * **Hallucination Protection:** `100.0%` (0% ungrounded assertions)
* **`reports/ragas_report.md`**: Official Ragas v0.4.3 results:
  * **Faithfulness (Entailment):** `100.0%`
  * **Context Recall@10:** `88.9%`
* **`reports/comparative_audit.md`**: Strict side-by-side synthesis comparing DeepEval, Ragas, and CognitRAG's 8-stage white-box audit.
* **`datasets/eval_dataset_50.json`**: Standardized dataset containing query, generated answer, retrieved context chunks, and ground truth.

---

### 📁 `04_master_reports/`
Executive and technical documentation for customers, auditors, and investors:
* **`full_eval_summary.md`**: Reconciled master audit report detailing every metric, baseline, and primary source.
* **`comparative_audit.md`**: 3-way benchmark comparison with framework boundaries.
* **`real_human_evaluation.md`**: Comprehensive qualitative evaluation against authentic documents.
* **`COGNITRAG_ARCHITECTURE_EVALUATION_AND_INTERVIEW_GUIDE.md`**: Staff AI engineer level architecture deep dive and system defense cheatsheet.
* **`regression_summary.md`**: Pre-fix vs. post-fix verification table.

---

### 📁 `legacy_archive/`
Contains pre-September 4 legacy artifacts:
* Early August 2026 tests run against synthetic AWS API Gateway documentation.
* Early drafts of evaluation reports and old JSON datasets from June/August.
