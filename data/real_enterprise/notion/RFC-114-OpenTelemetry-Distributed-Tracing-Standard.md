# RFC-114: OpenTelemetry Distributed Tracing & W3C TraceContext Standard
Author: Maya Lin, Container Runtime Specialist
Status: Implemented

## 1. Overview
Every HTTP and gRPC request passing through CognitRAG generates a W3C `traceparent` header propagated across all microservices.

## 2. Spans Captured
- `router.classify_intent`
- `retrieval.dense_vector_search`
- `retrieval.sparse_bm25_search`
- `retrieval.neo4j_graph_hop`
- `reranker.jina_rerank`
- `generator.llm_synthesis`
Traces export to OpenTelemetry Collector and visualize in Grafana Tempo.