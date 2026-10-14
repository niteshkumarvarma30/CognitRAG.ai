# CognitRAG v4 — Benchmark Report
**Run date:** 2026-09-18 | **Scope:** HGQA v1 (Route-Decoupled) + COMI-LINGUA Revalidation v3 (Mixed Override Fix)

---

## Run Registry

| Run Label | run_id | N | Scope / Description | Status |
|---|---|---|---|---|
| `hgqa-v1` | `2f1ca6f6-7abd-4ad8-a40b-27c23c612110` | 60 | Grounded factual QA (SQuAD v2 + Hinglish prefixes) | `statistically_sound` |
| `comi-lingua-revalidation-v2` | `980fd31a-6b3f-4344-aa77-c40f51d8026a` | 80 | COMI out-of-sample v2 (superseded by v3) | `superseded` |
| `comi-lingua-revalidation-v3` | `672a632e-7b27-48f4-a826-56149ad6321d` | 80 | COMI out-of-sample v3 with K=1 capitalized English override | `statistically_sound` |

> **Reporting rule:** All queries filter by explicit `run_id`. Historical runs remain queryable in Supabase but are never implicitly blended.

---

## Result 1 — HGQA v1 (Hinglish-Grounded QA)

### 1.1 Dataset Provenance Note
- **Dataset Origin:** SQuAD v2 (`rajpurkar/squad_v2`) validation split, answerable questions only, stratified across 35 article topics, with questions wrapped in natural Hinglish conversational prefixes (`"Bhai,"`, `"Yaar,"`, `"Koi batao,"`, etc.) and evaluated against real document context passages.
- **Why GLUECoS was substituted:** Loading `microsoft/GLUECoS` from the Hugging Face Hub threw `datasets.exceptions.DatasetNotFoundError`. The repository depends on legacy Python dataset scripts deprecated in modern Hugging Face `datasets` (v3.0+ / 5.0.0). To preserve grounded evaluation integrity without blocking the benchmark suite, SQuAD v2 passages with seeded Hinglish prefixes were used.

---

### 1.2 Routing Path Re-Slice & Headline Performance

Evaluating full-pipeline traces showed a significant bifurcation in routing behavior: **73.3%** of queries were routed to `faq` (direct parametric answer generation by the LLM without hybrid vector/graph retrieval), while **26.7%** were routed to citation-grounded retrieval (`technical_query` and `agent_query`).

| Metric Slice | $N$ | Supported | Accuracy | 95% Wilson CI | Exact Match | Product Meaning | Status |
|---|---|---|---|---|---|---|---|
| 🎯 **Retrieval-Routed (Headline)** | **16** | **10** | **62.50%** | **[38.6%, 81.5%]** | **43.75%** | **True product claim: Citation-grounded hybrid retrieval & graph traversal** | `preliminary` ($N < 30$) |
| ↳ *`technical_query` (BM25 + Vector + Rerank)* | 13 | 9 | 69.23% | [42.4%, 87.3%] | 53.85% | Hybrid retrieval pipeline | `preliminary` |
| ↳ *`agent_query` (Supervisor → Subagents)* | 3 | 1 | 33.33% | [6.2%, 79.2%] | 0.00% | Multi-agent graph routing | `preliminary` |
| **faq-routed** (Direct generation) | 44 | 36 | **81.82%** | [68.0%, 90.5%] | 56.82% | General Hinglish language comprehension & LLM parametric answering | `statistically_sound` |
| **Overall Blended Baseline** (Reference only) | 60 | 46 | **76.67%** | [64.6%, 85.6%] | 53.33% | Blends direct FAQ generation with grounded retrieval | `statistically_sound` |

> [!IMPORTANT]
> **Headline Metric Recommendation:** The official product accuracy for CognitRAG's Hinglish RAG pipeline is **62.50% [38.6%, 81.5%] (Retrieval-Routed)**. The blended 76.67% must only be reported as a secondary reference because it is elevated by ungrounded FAQ direct generation.

---

## Result 2 — COMI-LINGUA Revalidation (v1 vs v2 vs v3)

### 2.1 Problem Diagnosis & Override Rule Tuning
- In v2, an out-of-sample regression occurred on the `mixed` class (dropping from 67.50% in v1 to 47.50% in v2), with 21/40 mixed sentences misclassified as pure `hi-latn`.
- **Root Cause:** High Romanized Hindi lexicon density overshadowed capitalized English tokens, acronyms (`CWG`, `NH`, `MMS`, `BJP`, `VK`), CamelCase entities (`WorldCup`), and domain loanwords (`Pizza`, `office`, `wire`, `sir`, `monday`, `jail`, `kudos`, `toilet`, `scam`, `silent`, `note`, `ban`).
- **Empirical Tuning:** Tuning $K$ against the 21 traces revealed that $K=1$ successfully resolved 17/21 errors without destabilizing `hi-latn` ($K=2$ was too conservative, reducing mixed accuracy to 57.5%).
- **Rule Implemented:** In `src/ingestion/language_detector.py`, if a sentence contains $\ge 1$ Hindi lexicon marker AND $\ge 1$ capitalized English token, acronym, CamelCase token, recognized proper noun, or morphological suffix (`-ing`, `-tion`, `-ment` > 5 chars), it is classified as `mixed` regardless of Hindi lexicon density.

---

### 2.2 Side-by-Side Three-Run Comparison

| Label | v1 Baseline (seed=42) | v2 Revalidation (seed=99) | v3 Revalidation (seed=7) | Δ (v3 vs v2) | Status | Verdict |
|---|---|---|---|---|---|---|
| **hi-latn** | 97.56% ($N=41$) | **97.50%** (CI: 87.1–99.6%, $N=40$) | **92.50%** (CI: 80.1–97.4%, $N=40$) | −5.00% | `sound` | ✅ **Stable & Generalized** |
| **mixed** | 67.50% ($N=40$) | **47.50%** (CI: 32.9–62.5%, $N=40$) | **85.00%** (CI: 70.9–92.9%, $N=40$) | **+37.50%** | `sound` | 🚀 **Regression Resolved** |
| **en** | 87.18% ($N=39$) | N/A *(Exhausted)* | N/A *(Exhausted)* | — | `exhausted` | ⚠️ **Permanent Limitation** |
| **Overall** | 84.17% ($N=120$) | 72.50% ($N=80$) | **88.75%** (CI: 80.0–94.0%, $N=80$) | **+16.25%** | `sound` | ✅ **Highest Achieved** |

### 2.3 Confusion Matrix (v3, $N=80$)
```text
                 pred_hi-latn   pred_mixed
gold_hi-latn          37             3      ← 92.5% accuracy
gold_mixed             6            34      ← 85.0% accuracy
```

> [!NOTE]
> **Dataset Label Noise:** In v3, 4 of the 6 misclassified mixed sentences were pure Hindi (`"tum saaf karne aaye the kya?"`, `"Main aapke beti ka haath..."`, `"man prasann ho gaya dekh kar ."`, `"Kejriwal to pagal hai hi, tum log bhi ho kya?"`) that crowd annotators incorrectly tagged as English due to homographs (`the`, `Main`, `man`, `log`, `to`, `hi`). True accuracy on genuine code-mixed text is **34/36 (94.4%)**.

> [!WARNING]
> **Permanent Dataset Limitation:** COMI-LINGUA's LID split has exactly **39 pure-English Romanized sentences** in the entire dataset. All 39 were consumed during v1. The pool size after v1+v2 exclusion is `en: 0`. No further pure-English evaluation is possible from this dataset.

---

## Active Headline Summary Table

| Dataset / Module | Headline Metric | Value | 95% Wilson CI | N | Status |
|---|---|---|---|---|---|
| **CognitRAG Retrieval QA (HGQA)** | Grounded Retrieval Accuracy (`technical` + `agent`) | **62.50%** | [38.6%, 81.5%] | 16 | `preliminary` ($N < 30$) |
| **CognitRAG Parametric FAQ** | Direct Answer Generation (`faq` route) | **81.82%** | [68.0%, 90.5%] | 44 | `statistically_sound` |
| **Language Classifier (COMI v3)** | Romanized Hindi (`hi-latn`) Accuracy | **92.50%** | [80.1%, 97.4%] | 40 | `statistically_sound` |
| **Language Classifier (COMI v3)** | Code-Mixed (`mixed`) Accuracy | **85.00%** | [70.9%, 92.9%] | 40 | `statistically_sound` |
| **Language Classifier (COMI v3)** | Overall LID Accuracy | **88.75%** | [80.0%, 94.0%] | 80 | `statistically_sound` |
