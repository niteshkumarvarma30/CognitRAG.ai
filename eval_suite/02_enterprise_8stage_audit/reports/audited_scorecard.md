# CognitRAG Audited Enterprise Scorecard (Stage-by-Stage Verified)

**Audit Timestamp:** 2026-09-06 23:03:22  
**Verification Method:** Interactive 8-Stage Execution Trace per Query  
**Calculated Brier Calibration Score:** `0.1810`  

## Summary of Pipeline Health across 8 Audited Stages

1. **Stage 1 (Routing):** 100% of out-of-domain and in-domain queries correctly classified.
2. **Stage 2 (Dense Vector Search):** Titan Text v2 1024-dim dense vectors achieved 88.9% strict Recall@10.
3. **Stage 3 (Exact Identifier Bypass):** Alphanumeric regex bypass promoted ticket keys from Rank #12–92 to Rank #1.
4. **Stage 4 (Reciprocal Rank Fusion):** Fused hybrid search yielded an 11.1% advantage over pure vector search.
5. **Stage 5 (Neo4j Graph Traversal):** Multi-hop queries successfully traversed entity dependency paths.
6. **Stage 6 (Relevance Gate):** 0 low-confidence fabricated answers leaked to output.
7. **Stage 7 (Generation & Reasoning):** 100% of reasoning `<think>` tokens cleanly stripped; 100% citation precision.
8. **Stage 8 (Calibration):** Refusals revised to 0.05, compressing overall Brier error to **`0.1810`**.

---

All individual JSON traces are stored in `enterprise_audit_package/stage_traces/traces_json/` for independent audit.