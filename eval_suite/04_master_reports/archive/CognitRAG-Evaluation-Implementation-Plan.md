# CognitRAG Evaluation Implementation Plan

**Purpose:** Build a staged evaluation suite that tests each component of the CognitRAG
pipeline independently, instead of only scoring final answers end-to-end. Run phases in
order — each phase assumes the previous one has a baseline result recorded.

**Instructions for the coding agent:** Implement one numbered task at a time. After each
task, run it, save output to the specified path under `/eval/results/`, and report the
metric(s) before moving to the next task. Do not skip a task because a later one seems
more important — early-pipeline failures (ingestion, entity resolution) invalidate every
downstream metric, so they must be measured first.

---

## 0. Setup

### 0.1 Folder structure

Create this structure at the project root:

```
/eval
  /datasets          # labeled test data, versioned, never overwritten in place
  /results            # JSON output per test run, filename includes date
  /scripts             # one script per numbered task below
  /reports             # human-readable markdown summaries generated from /results
```

### 0.2 Dependencies

```bash
pip install ragas datasets pandas scikit-learn python-Levenshtein --break-system-packages
```

### 0.3 Result schema (use this for every task's output JSON)

```json
{
  "task_id": "1.1",
  "task_name": "Connector completeness reconciliation",
  "run_date": "2026-09-04",
  "pipeline_version": "git commit hash or tag",
  "sample_size": 0,
  "metrics": {},
  "failures": [],
  "notes": ""
}
```

Every task below must write a file matching this schema to
`/eval/results/{task_id}_{run_date}.json`. This is what lets you track regressions over
time in Phase 4.

---

## Phase 1 — Ingestion

### Task 1.1 — Connector completeness reconciliation

**Goal:** Confirm ingestion actually captured what exists at the source, per connector.

**Steps:**
1. For each connector (Slack, Jira, GitHub, Notion, Google Drive, local files/PDF),
   write a script that queries the source API directly for a count of items in a fixed
   time window (e.g., last 30 days) — messages, tickets, PRs, pages, files.
2. Query your own ingested store for the same window and count items tagged with that
   source.
3. Compute `completeness = ingested_count / source_count` per connector.
4. Flag any connector below 95% completeness for investigation — likely causes are rate
   limiting, pagination bugs, or permission scopes excluding content.

**Output:** `1.1_connector_completeness.json` — one entry per connector with
`source_count`, `ingested_count`, `completeness_pct`.

**Pass threshold:** ≥ 95% per connector. Below this, do not proceed to Phase 2 for that
connector's data until fixed.

---

### Task 1.2 — Parser & chunking quality (PyMuPDF / Markdown)

**Goal:** Detect silently broken text extraction, especially scanned PDFs and tables.

**Steps:**
1. Sample 30 documents per source type (PDF, Notion page, GitHub README/PR body, Slack
   thread export).
2. For each parsed chunk, run a garbled-text heuristic: percentage of non-alphanumeric
   characters, ratio of whitespace to content, presence of common OCR-artifact patterns
   (repeated single characters, unicode replacement characters).
3. Flag any document where >20% of its chunks trip the heuristic.
4. Manually review flagged documents — classify as "needs OCR," "table extraction
   failure," or "false positive."

**Output:** `1.2_parser_quality.json` — per source type: `documents_sampled`,
`documents_flagged`, `flagged_pct`, list of flagged doc IDs with classification.

**Pass threshold:** < 10% flagged per source type. PDFs commonly run higher — if so,
route flagged PDFs through an OCR fallback (e.g., Tesseract) and re-test.

---

### Task 1.3 — Embedding retrieval recall

**Goal:** Measure whether the right chunk is actually retrievable, independent of the
graph or reranker.

**Steps:**
1. Build a labeled dataset: 50 query → expected_chunk_id pairs, drawn evenly across all
   six source types (so ~8 per source).
2. For each query, embed it and run a pure vector search (bypass hybrid/graph) against
   pgvector, retrieving top 10.
3. Compute recall@5 and recall@10 = fraction of queries where expected_chunk_id appears
   in the top-k.
4. Break results down by source type — Slack messages, PDF paragraphs, and Notion pages
   embed very differently; don't pool the average, report per-type.

**Output:** `1.3_embedding_recall.json` — `recall_at_5`, `recall_at_10` overall and per
source type.

**Pass threshold:** recall@10 ≥ 0.85 overall. Any source type below 0.70 needs
chunk-size or embedding-model investigation for that type specifically.

---

### Task 1.4 — Entity resolution precision & recall

**Goal:** This is the highest-risk component in the architecture. Test it directly.

**Steps:**
1. Manually construct ~100 entity pairs sampled across sources, e.g.:
   - `("Sarah Chen" [Slack], "@sarah.chen" [GitHub])` → label: SAME
   - `("Sarah Chen" [Team A, Slack], "Sarah Chen" [Team B, Jira])` → label: DIFFERENT
     (deliberately include near-miss name collisions)
   - `("PaymentAPI" [Jira entity], "Payment API" [GitHub repo])` → label: SAME
2. Run each pair through your coreference/entity-extraction pipeline (Groq/Llama-3
   node) and record whether it merged them.
3. Compute:
   - **Precision** = correct merges / all merges made (false merges are the dangerous
     failure mode — two different people/things wrongly combined)
   - **Recall** = correct merges / all pairs that should have merged
4. Report false-merge cases separately and in full detail — these are the ones to fix
   first, since a wrong merge can leak or misattribute information across contexts.

**Output:** `1.4_entity_resolution.json` — `precision`, `recall`, `false_merge_examples`
(full list, not just count).

**Pass threshold:** precision ≥ 0.95 (false merges are worse than missed merges — hold
this bar high even if recall suffers). Do not relax this threshold to hit a recall
target.

---

## Phase 2 — Retrieval (CRAG Loop)

### Task 2.1 — Router / intent classifier accuracy

**Steps:**
1. Label 30 queries by intended path: single-source factual, cross-source synthesis,
   summarization, out-of-scope/should-refuse.
2. Run each through the router, record which path it selected.
3. Compute accuracy against the labels.

**Output:** `2.1_router_accuracy.json` — accuracy overall and confusion matrix by
category.

**Pass threshold:** ≥ 0.90 overall.

---

### Task 2.2 — Hybrid search ablation

**Steps:**
1. Using the same 50-question set from Task 1.3, run three retrieval configurations:
   vector-only, BM25-only, full hybrid (pgvector + BM25 + Neo4j Cypher).
2. Score each configuration's top-10 results against the same recall@5/@10 metric.
3. Compare hybrid against the best single method.

**Output:** `2.2_hybrid_ablation.json` — recall@5/@10 for all three configurations.

**Pass threshold:** Hybrid must beat the best single method by ≥ 5 percentage points on
recall@10. If it doesn't, the fusion logic isn't earning its added latency/complexity —
flag for architecture review rather than treating this as a pass/fail on its own.

---

### Task 2.3 — Relevance grader calibration (highest priority in Phase 2)

**Goal:** Verify the confidence gate actually predicts correctness. This is the
component your last evaluation run showed as broken — the model said "not addressed in
context" and then fabricated an answer anyway.

**Steps:**
1. Run all 50 questions from your evaluation set end-to-end.
2. For each, log two independent things: (a) the grader's confidence label (high/low),
   and (b) whether the final answer was actually correct (via RAGAS faithfulness +
   manual spot check).
3. Build a 2x2 contingency table: {high confidence + correct}, {high confidence +
   wrong}, {low confidence + correct}, {low confidence + wrong}.
4. Compute calibration: of all "low confidence" flags, what fraction led to a refusal
   or rewrite rather than a fabricated answer reaching the user?

**Output:** `2.3_grader_calibration.json` — contingency table, plus
`low_confidence_leaked_to_output_count` (this specific number is your most important
metric — it's the count of times the system knew it might be wrong and answered
confidently anyway).

**Pass threshold:** `low_confidence_leaked_to_output_count` = 0. Any non-zero value here
is a release blocker, not a metric to average away — fix the gating logic before
touching anything else in this plan.

---

### Task 2.4 — CRAG rewrite recovery rate

**Steps:**
1. From Task 2.3's low-confidence cases, track: did the rewrite loop improve retrieval
   on the next pass (compare recall before/after rewrite)? How many iterations did it
   take? Did any queries hit a max-iteration limit without resolving?
2. Compute recovery rate = queries that reached high confidence after rewrite / total
   low-confidence queries.

**Output:** `2.4_crag_recovery.json` — `recovery_rate`, `avg_iterations`,
`max_iteration_timeouts`.

**Pass threshold:** recovery_rate ≥ 0.60. If timeouts are frequent, the rewrite
strategy is delaying failure, not preventing it — that's worth flagging even if it
doesn't block this specific test.

---

## Phase 3 — Output & Governance

### Task 3.1 — Faithfulness (RAGAS) and determinism

**Steps:**
1. Run the full RAGAS suite (faithfulness, answer_relevancy, context_precision,
   context_recall) on your 50-question set using the real `ragas` library — continuous
   scores, not binary.
2. Separately, pick 10 questions and run each 5 times. Compare answers for material
   consistency (same facts, same conclusion) — this is your "governed determinism" test.

**Output:** `3.1_faithfulness_determinism.json` — RAGAS scores with confidence
intervals (bootstrap resample), plus `determinism_consistency_pct` from the repeat-run
test.

**Pass threshold:** faithfulness ≥ 0.85, determinism_consistency_pct ≥ 0.90.

---

### Task 3.2 — Citation-level accuracy

**Steps:**
1. For 30 answers containing citations, manually verify each individual citation
   actually supports the specific claim next to it (not just "a citation exists
   somewhere in the answer").
2. Compute citation precision = correctly-supporting citations / total citations shown.

**Output:** `3.2_citation_accuracy.json` — `citation_precision`, list of
misattributed citation examples.

**Pass threshold:** ≥ 0.95.

---

### Task 3.3 — Confidence score calibration

**Steps:**
1. Across your full evaluation set, plot displayed confidence score against actual
   correctness (calibration curve) and compute a Brier score.
2. Check specifically whether any answer displayed ≥90% confidence while being
   factually wrong — this is actively worse than showing no score.

**Output:** `3.3_confidence_calibration.json` — `brier_score`,
`high_confidence_wrong_answers` (full list).

**Pass threshold:** `high_confidence_wrong_answers` count = 0.

---

### Task 3.4 — Memory Hub temporal / contradiction handling

**Steps:**
1. Inject a fact into the system (e.g., "Billing SOP v3.1: no review step required").
2. Query it, confirm it's returned correctly.
3. Inject a superseding fact (e.g., "Billing SOP v3.2: human review step added, replaces
   v3.1").
4. Re-run the same query. Check: does the system surface v3.2, flag v3.1 as
   superseded/stale, and avoid presenting both as equally valid?
5. Repeat with 5 different contradiction scenarios (policy change, personnel change,
   incident resolution status, deployment process change, pricing change).

**Output:** `3.4_temporal_memory.json` — per scenario: `correctly_superseded` (bool),
`old_fact_still_surfaced` (bool).

**Pass threshold:** 5/5 scenarios correctly superseded, 0/5 showing stale facts as
current.

---

## Cross-Cutting — Permission Enforcement

### Task 4.1 — Access control leak test

**Steps:**
1. Set up two test users with different source permissions (e.g., User A has access to
   a private Slack channel and a restricted Jira project; User B does not).
2. As User B, query for information that only exists in User A's restricted sources —
   directly, and indirectly through an entity/graph relationship that might bridge
   permitted and restricted content.
3. Verify User B never receives restricted content in any form — direct answer,
   citation, or entity mention.

**Output:** `4.1_permission_leak_test.json` — `leak_count` (should be 0), full detail of
any leak found (source, query, what was exposed).

**Pass threshold:** `leak_count` = 0. This is a hard blocker for any real customer data
connection — do not proceed to connecting real enterprise Slack/Jira/Drive data until
this passes cleanly.

---

## Phase 4 — Tracking Over Time

### Task 5.1 — Regression dashboard

**Steps:**
1. Write a script that reads all files in `/eval/results/`, groups by `task_id`, and
   plots each metric over time (by `run_date`).
2. Generate `/eval/reports/regression_summary.md` automatically after each full run,
   listing any metric that dropped more than 5 percentage points from its previous run.

**Output:** `/eval/reports/regression_summary.md`, regenerated on each run.

**Run this after every change to retrieval, prompts, or the confidence-gating logic —
not just before a demo.**

---

## Suggested execution order (priority, not just phase number)

If time is limited, run in this order first:

1. **Task 2.3** (grader calibration) — this is the one that's currently known-broken
2. **Task 1.4** (entity resolution precision) — highest silent-failure risk
3. **Task 4.1** (permission leak test) — blocks any real customer data
4. **Task 1.1** (connector completeness) — cheap to run, catches basic ingestion bugs
5. Remaining tasks in phase order

## Definition of done for this whole plan

All tasks implemented as scripts under `/eval/scripts/`, each producing a JSON result
matching the schema in section 0.3, with at least one full run completed and summarized
in a single `/eval/reports/full_eval_summary.md` that states, in plain language, which
components pass their threshold and which don't — ready to hand to an external
technical reviewer (AWS, Google for Startups, or an investor) without further
explanation needed.
