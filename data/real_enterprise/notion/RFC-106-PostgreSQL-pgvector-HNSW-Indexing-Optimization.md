# RFC-106: PostgreSQL pgvector HNSW Indexing Tuning for 10M Document Scale
Author: Priya Patel, Lead Data Architect
Status: Approved & Verified | Benchmarked on Supabase Postgres 16

## 1. Objective
Maintain query retrieval latency < 20ms and Recall@10 > 95% as vector corpus expands to 10 million 1024-dimensional Bedrock Titan embeddings.

## 2. Benchmark Findings & Index Parameters
We benchmarked IVFFlat vs HNSW on an r6i.4xlarge instance (128GB RAM):
- **Index Type:** `hnsw` with `vector_cosine_ops`
- **m (max edges per node):** `16` (Balances memory size and recall)
- **ef_construction (construction search depth):** `64`
- **ef_search (runtime query search depth):** `40`

## 3. Results
- **Recall@10:** 98.2%
- **Query Latency (p95):** 14.2ms
- **Memory Footprint:** 4.18 GB for 1,000,000 vectors.