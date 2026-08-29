# CognitRAG: Company Brain Architecture

This document serves as the single source of truth for the end-to-end architecture of **CognitRAG (The Company Brain)**. It details the transition from standard probabilistic RAG to a deterministic Enterprise Semantic Layer.

---

## 1. Core Architecture & Tech Stack

The architecture is divided into a robust client-facing application and a highly specialized Python backend capable of complex graph traversals and vector searches.

- **Frontend**: Next.js (React), Clerk (Authentication), Lucide React (Icons). Uses Server-Sent Events (SSE) for streaming chat.
- **Backend API**: FastAPI (Python), Uvicorn.
- **Vector Database**: Supabase (PostgreSQL with `pgvector`). Handles dense vector search, BM25 keyword search, and Row Level Security (RBAC).
- **Graph Database**: Neo4j. Handles the Semantic Dictionary, entity relationships, and deterministic business logic (ontology).

---

## 2. The Ingestion Pipeline (Data to Memory)

The ingestion pipeline transforms unstructured and structured enterprise data into a queryable semantic graph.

1. **PDF/Document Parsing**: `pymupdf4llm` converts raw PDFs into structured Markdown.
2. **Parent Chunking**: A `RecursiveCharacterTextSplitter` slices the Markdown into large 2000-character parent chunks to preserve broad context.
3. **Pronoun Resolution**: The chunk is sent to an LLM (`meta-llama/llama-3.3-70b-instruct:free` via OpenRouter). The LLM resolves vague pronouns ("it", "they") into specific proper nouns to ensure mathematical accuracy during vector search.
4. **Graph Extraction**: The resolved chunk is passed to `google/gemini-2.0-flash-exp:free` (using the `instructor` library) to extract exact Entities and Relationships. These are instantly merged into the **Neo4j Knowledge Graph**.
5. **Child Chunking**: The resolved parent chunk is sliced into smaller 400-character child chunks.
6. **Embedding & Storage**: 
   - The Child chunk text is sent to `jina-embeddings-v4` to generate a precise dense vector.
   - **Decoupled Storage**: Supabase stores the *child vector* for precise mathematical search, but returns the *parent text* as the context payload to give the LLM maximum context.

### Structured Integrations
The system connects to structured operational systems (Google Workspace, Slack, Jira, Salesforce). Schemas from these sources are mapped directly into Neo4j nodes to trace exact business logic.

---

## 3. The Retrieval Pipeline (Query to Answer)

When a user asks a question via the UI, it triggers a multi-agent LangGraph state machine.

1. **Semantic Caching**: Checks an in-memory `LRUCache` (0ms) and the Supabase vector cache (>85% similarity) to instantly return frequent queries.
2. **Memory Loading**: Fetches the user's Long-Term Memory (preferences, facts) from Supabase.
3. **Contextualization**: Rewrites vague follow-up questions using chat history into standalone, actionable queries.
4. **Intent Routing**: `google/gemini-2.0-flash-exp:free` classifies the query. Conversational intents bypass the search step entirely.
5. **Concurrent Hybrid Search**: Simultaneously runs BM25 Keyword Search and HNSW Vector Search against Supabase, fusing the top 10 candidates via Reciprocal Rank Fusion (RRF).
6. **First Rerank (Precision Filter)**: The Top 10 chunks are passed to the `jina-reranker-v2` cross-encoder. Chunks scoring below `0.15` are discarded. If all fail, a **CRAG** (Corrective RAG) node rewrites the query and loops back.
7. **Graph Decision & Expansion**: 
   - The system inspects the Supabase metadata of the surviving chunks for extracted "Entities".
   - It makes a fast LLM call (`google/gemini-2.0-flash-exp:free`) to verify if a graph search is necessary.
   - If approved, it queries Neo4j to find 1-hop semantic relationships connecting those specific entities.
8. **Context Fusion & Second Rerank**: The retrieved Neo4j graph sentences are merged with the vector chunks. Jina reranks the *entire pool again* to isolate the Top 15 absolute best items.
9. **Streaming Generation**: The LLM (`google/gemini-2.0-flash-exp:free`) synthesizes the final answer using the Top 15 fused context, User Facts, and Memory. Tokens stream back to the UI via Server-Sent Events (SSE).
10. **Background Extraction**: A background thread silently extracts new facts from the interaction, updates the Neo4j `(User)` node, and distills older messages into a rolling summary.

---

## 4. Models and APIs Master List

We utilize a multi-model architecture routing queries to the most cost-effective and capable models via **OpenRouter** to bypass API rate limits while maximizing context windows.

| Model / API | Provider | Purpose in Pipeline |
| :--- | :--- | :--- |
| `meta-llama/llama-3.3-70b-instruct:free` | OpenRouter | Pronoun Coreference Resolution during ingestion (high-volume text rewriting). |
| `google/gemini-2.0-flash-exp:free` | OpenRouter | Query Routing, Graph Extraction (Instructor), Graph Decisions, Memory Extraction, and Final Answer Generation (1M+ context window). |
| `jina-embeddings-v4` | Jina AI | Creating dense mathematical vectors for text chunks. |
| `jina-reranker-v2` | Jina AI | Cross-encoder reranking of retrieved chunks (twice). |
| `nvidia/nv-embedqa-e5-v5`| NVIDIA | (Used for offline Evaluation and Benchmarking, LLM-as-a-Judge). |

---

## 5. Security and Determinism

- **Zero Hallucinations (Semantic Dictionary)**: Enterprise Admins hardcode definitions (e.g., "Churn Risk") into the Neo4j ontology. The Agent queries this ontology *before* generating answers, preventing hallucinated formulas.
- **Strict RBAC**: Roles are mapped directly into Supabase Row Level Security (RLS). The system blocks unauthorized access at the database level before vectors are even retrieved.
- **Verifiable Audit Trails**: Every response includes the exact graph traversal path and source chunk attached as metadata to provide transparent "receipts" to the user.
