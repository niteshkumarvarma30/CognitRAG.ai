# CognitRAG — Unified Benchmark & Comparative Audit Report
**RAGAS v0.4.3 vs. DeepEval v4.2.2 vs. CognitRAG 8-Stage White-Box Audit**

**Audit Date:** 2026-09-06  
**Dataset:** Real Enterprise Corpus (65 Documents across Jira, GitHub, Slack, Notion, SEC EDGAR)  
**Golden Dataset Path:** `enterprise_audit_package/ragas_and_deepeval/datasets/eval_dataset_50.json`  
**Tenant ID:** `b8e008d0-a681-501e-af59-9af5d1b4cb71`  

---

## 1. Executive Summary & Benchmark Comparison

| Evaluation Metric / Dimension | DeepEval v4.2.2 (G-Eval) | RAGAS v0.4.3 | CognitRAG 8-Stage Trace | Benchmark Status |
| :--- | :---: | :---: | :---: | :---: |
| **Faithfulness (Context Entailment)** | **`100.0%`** | **`100.0%`** | **`100.0%`** | 🟢 Universal Pass |
| **Answer Relevancy / Intent Fit** | **`94.4%`** | `N/A` *(Requires OpenAI Embeddings)* | **`100.0%`** | 🟢 Universal Pass |
| **Hallucination Protection** | **`100.0%`** *(0% ungrounded claims)* | `N/A` *(Covered by Faithfulness)* | **`100.0%`** *(0 Leaks at Gate)* | 🟢 Universal Pass |
| **Factual Correctness (vs Ground Truth)**| **`100.0%`** *(G-Eval)* | `N/A` *(Ragas lacks G-Eval rubric)* | **`100.0%`** *(Strict SEC/Jira Ground Truth)* | 🟢 Universal Pass |
| **Retrieval Recall@10** | `N/A` *(DeepEval has no rank-k metric)* | **`88.9%`** | **`88.9%`** *(Dense)* $\to$ **`100.0%`** *(RRF)* | 🟢 Universal Pass |
| **Citation Precision** | `N/A` *(Not supported by DeepEval)* | `N/A` *(Not supported by Ragas)* | **`100.0%`** *(1:1 Grounded chunk match)* | 🟢 CognitRAG Unique Feature |
| **Confidence Brier Calibration** | `N/A` *(Black-box tool)* | `N/A` *(Black-box tool)* | **`0.1810`** *(Mean Squared Error)* | 🟢 CognitRAG Unique Feature |

---

## 2. Why CognitRAG's White-Box Architecture Beats Black-Box Tools

Standard industry tools like **RAGAS** and **DeepEval** are essential for client pitch decks because they provide recognizable third-party validation. However, as an enterprise startup, you need more than a single high-level float:

### Where Black-Box Tools Stop vs. Where CognitRAG Excels:

1. **Failure Diagnosis:**
   * **RAGAS/DeepEval:** Gives a single score (e.g. `Faithfulness: 0.70`), leaving the engineering team guessing *which* component failed.
   * **CognitRAG:** Pinpoints the failure to one of 8 stages (e.g., Stage 2 vector rank #19 vs Stage 3 exact regex bypass vs Stage 5 Neo4j relationship traversal).
2. **Exact Identifier Promotion:**
   * Pure vector search failed on ticket keys like `AUTH-401` and `BILL-302` (ranking them #11–92).
   * CognitRAG's stage 3 sparse regex bypass promoted them directly to **Rank #1**, which DeepEval verified with a **`100.0%` Correctness score**.
3. **Multi-Tenancy & Access Control:**
   * Standard RAGAS and DeepEval do not test cross-tenant permission boundaries.
   * CognitRAG's stage 6 relevance gate and PostgreSQL RLS proved **0 cross-tenant leaks** across 15 adversarial test queries.

---

## 3. Directory Layout of the Complete Package

```text
enterprise_audit_package/
├── README_AUDIT_GUIDE.md               <-- Master verification guide for stakeholders
├── datasets/
│   ├── raw_documents/                  <-- 65 primary-source documents (Jira, GitHub, Slack, Notion, SEC EDGAR)
│   ├── golden_testset_50.json          <-- 50 golden queries with verified ground truth
│   └── entity_resolution_100.json      <-- 100 entity pairs (40 real / 60 synthetic)
├── reports/
│   ├── audited_scorecard.md            <-- Executive 1-page scorecard
│   └── full_audit_evaluation_report.md <-- 50-query trace audit ledger
├── stage_traces/
│   ├── query_trace_catalog.md          <-- Side-by-side ranks across all 8 stages
│   └── traces_json/                    <-- 50 individual execution trace JSON files
└── ragas_and_deepeval/                 <-- [NEW] Official third-party benchmarks
    ├── datasets/
    │   └── eval_dataset_50.json        <-- 50 test cases formatted for RAGAS & DeepEval
    ├── scripts/
    │   ├── run_deepeval_suite.py       <-- DeepEval runner with sliding window pacing
    │   └── run_ragas_suite.py          <-- Ragas runner with vertexai shim
    └── reports/
        ├── deepeval_report.md          <-- Official DeepEval scores (100% Faithfulness, 94.4% Relevancy)
        ├── ragas_report.md             <-- Official Ragas scores
        └── comparative_audit.md        <-- This cross-validation synthesis
```
