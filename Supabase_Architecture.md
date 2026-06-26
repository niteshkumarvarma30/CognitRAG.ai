# Supabase Architecture - Vector & Keyword Engine

CognitRAG uses **Supabase (PostgreSQL + pgvector)** as its primary storage and semantic retrieval engine. It handles both high-dimensional vector similarity and exact keyword matching in parallel.

## 1. Data Ingestion Pipeline

When a document (PDF, TXT, or Notion Page) enters the system:
1. **Chunking**: The document text is passed through the `RecursiveCharacterTextSplitter`, which breaks it down into logical overlapping chunks to preserve context without blowing up token limits.
2. **Embeddings**: Each chunk is sent to the **Jina AI API** (`jina-embeddings-v4`, 1536 dimensions) to calculate its mathematical semantic meaning. An LRU Cache is utilized to prevent redundant API calls for duplicate text.
3. **Storage**: The chunks and their 1536-dimensional vectors are stored in the `document_chunks` table via `pgvector`.
   - Every chunk is strictly mapped to a `tenant_id` to ensure absolute multi-tenant data isolation.
   - The table also contains `content`, `parent_id`, and extracted metadata (like entities).

## 2. Query Retrieval & Search Execution

When a user asks a question, Supabase executes two distinct search algorithms **in parallel** via a `ThreadPoolExecutor`:

### A. Vector Semantic Search (Cosine Similarity)
This search looks for *meaning*, not exact words.
- The user's query is converted into a Jina embedding vector.
- The backend executes a custom Postgres RPC function (`match_document_chunks`) that performs a high-speed **Cosine Similarity** search across the `pgvector` index.
- It returns the Top-K chunks that are mathematically closest in meaning to the question.

### B. Full Text Keyword Search (BM25 Equivalent)
This search looks for *exact matches* (critical for specific IDs, code names, or acronyms like `im4gn.4xlarge`).
- The Python backend filters the query down to core words (length > 3).
- It constructs an `OR` query (e.g., `word1 | word2 | word3`) and executes it against the Supabase `document_chunks` table using native Postgres Full Text Search (`.text_search()`).

## 3. Post-Processing & Fusion

The results from both the Vector Search and the Keyword Search are passed to the **Reciprocal Rank Fusion (RRF)** algorithm alongside the Neo4j graph results. 
- Supabase Vector results are given a baseline boost weight of `2.0` (because semantic meaning is usually most important).
- Supabase Keyword results are given a weight of `1.5` to ensure hard-matches aren't lost.
- The RRF algorithm recalculates the rankings mathematically (`score = 1 / (k + rank)`) to yield a master list of context chunks that are perfectly balanced between semantic relevance and exact keyword matching.
