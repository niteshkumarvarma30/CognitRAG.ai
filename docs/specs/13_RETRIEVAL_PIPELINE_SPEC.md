# 13 — CognitRAG Retrieval Pipeline Specification
## Query → Context → Graph → Answer: Complete Retrieval and Generation Workflow

> **Status:** Master retrieval-pipeline specification.
>
> **Technical source of truth:** `Architecture(1).md`
>
> **Data dependencies:** `11_DATA_MODEL.md`, `12_INGESTION_PIPELINE_SPEC.md`
>
> **API dependency:** `10_API_CONTRACTS.md`
>
> **Purpose:** Preserve and formalize the exact CognitRAG retrieval workflow from user question to streamed answer, including caching, memory, contextualization, routing, hybrid retrieval, reranking, corrective retrieval, selective graph expansion, context fusion, generation, and background memory extraction.

---

# 1. Retrieval Objective

The retrieval system converts a natural-language user question into the most relevant, authorized, and context-rich answer possible.

The canonical workflow is:

```text
USER QUERY
    ↓
SEMANTIC CACHE
    ↓
MEMORY LOADING
    ↓
CONTEXTUALIZATION
    ↓
INTENT ROUTING
    ↓
CONCURRENT HYBRID SEARCH
    ↓
RRF
    ↓
FIRST RERANK
    ↓
CRAG IF REQUIRED
    ↓
GRAPH DECISION
    ↓
NEO4J 1-HOP EXPANSION
    ↓
CONTEXT FUSION
    ↓
SECOND RERANK
    ↓
TOP 15 CONTEXT
    ↓
GPT-4o-mini
    ↓
SSE STREAM
    ↓
BACKGROUND MEMORY EXTRACTION
```

This pipeline is the technical core behind the user-facing **Ask Brain** experience.

---

# 2. Retrieval Design Principle

CognitRAG should not rely on a single retrieval mechanism.

It combines:

```text
Exact matching
+
Semantic matching
+
Reranking
+
Structured relationships
+
Conversation context
+
User memory
+
Permissions
```

The goal is not maximum pipeline complexity.

The goal is:

> **Use the right amount of context for the current question.**

---

# 3. Query Entry Point

A user submits a question through:

```text
Next.js
 ↓
FastAPI
 ↓
/api/v1/chat/stream
```

The request must be associated with:

```text
authenticated user
workspace
conversation
message
```

before retrieval begins.

---

# 4. Authorization Before Retrieval

The query must execute within an authorization context.

Conceptually:

```text
User identity
     ↓
Workspace membership
     ↓
Role
     ↓
Allowed source / knowledge scope
     ↓
Retrieval
```

The frontend must not be responsible for enforcing the security boundary.

---

# 5. Retrieval State

Conceptual LangGraph state may contain:

```text
workspace
user
conversation
query
chat_history
memory
intent
retrieved_chunks
reranked_chunks
entities
graph_context
fused_context
answer
citations
status
```

The exact state schema must match the implementation.

---

# 6. Stage 1 — Semantic Cache

The existing architecture checks:

```text
In-memory LRU cache
```

and:

```text
Supabase vector cache
```

The purpose is to avoid unnecessarily repeating expensive retrieval/generation work for sufficiently similar requests.

---

# 7. LRU Cache

Characteristics:

```text
In-memory
Very low latency
Short-lived
Operational optimization
```

The UI does not need to know whether a response came from LRU cache.

---

# 8. Vector Cache

The architecture also uses a vector cache with a similarity threshold:

```text
>85% similarity
```

before considering a cached response for reuse.

This threshold should remain configurable and should be evaluated against real query quality.

---

# 9. Cache Safety

Cached responses must not bypass current authorization rules.

Conceptually:

```text
Cached result
 ↓
Current user/workspace access validation
 ↓
Return only if still permitted
```

A previously authorized answer should not automatically remain accessible after permissions change.

---

# 10. Cache Invalidation

Potential invalidation triggers:

```text
Source update
Knowledge change
Permission change
Policy change
Model/prompt change where necessary
```

The exact invalidation strategy should be defined by the caching implementation.

---

# 11. Cache Miss

If no acceptable cached answer exists:

```text
Continue through retrieval pipeline.
```

---

# 12. Stage 2 — Memory Loading

The architecture loads user Long-Term Memory from Supabase.

Potential memory:

```text
Preferences
Facts
Context
Conversation summary
```

Memory provides personalization and continuity.

---

# 13. Memory Boundaries

Memory must not automatically override authoritative company information.

Conceptual precedence:

```text
Authoritative approved company knowledge
        >
Relevant source context
        >
User memory
        >
Conversation assumption
```

This is a product-policy recommendation and must be encoded explicitly if adopted.

---

# 14. Stage 3 — Contextualization

Follow-up questions can be vague.

Example:

```text
Previous:
"What happened with billing?"

Follow-up:
"What changed?"

        ↓

Contextualized query:
"What changed in the billing process?"
```

The contextualization stage uses:

```text
Current user question
+
conversation history
```

to construct a standalone retrieval query.

---

# 15. Contextualization Goal

The query should preserve:

```text
Entity references
Time context
Task intent
Conversation meaning
```

while removing unnecessary conversational ambiguity.

---

# 16. Contextualization Failure

If contextualization fails:

```text
Fallback to the user's original query
```

where safe and appropriate.

Do not invent missing references.

---

# 17. Stage 4 — Intent Routing

Model:

```text
llama-3.3-70b-versatile
Provider:
Groq
```

Purpose:

> Determine which retrieval path is appropriate for the user's query.

---

# 18. Intent Examples

Potential intents:

```text
Conversational
Knowledge lookup
Decision lookup
Entity lookup
Temporal question
Operational question
Relationship question
```

The exact intent taxonomy should match the router implementation.

---

# 19. Conversational Bypass

If the query is conversational and does not require company retrieval:

```text
Intent
 ↓
Conversational
 ↓
Bypass full knowledge search
```

This improves efficiency.

---

# 20. Retrieval Intent

For company-specific questions:

```text
Intent
 ↓
Knowledge retrieval
```

Proceed into hybrid retrieval.

---

# 21. Stage 5 — Concurrent Hybrid Search

Two searches execute concurrently against Supabase:

```text
BM25
+
HNSW vector search
```

The goal is to combine:

```text
Exact lexical matching
+
Semantic similarity
```

---

# 22. BM25 Search

BM25 is useful for:

```text
Names
Identifiers
Exact terminology
Ticket IDs
Service names
Code identifiers
```

Example:

```text
BILL-902
```

---

# 23. HNSW Vector Search

Vector retrieval is useful for:

```text
Semantic similarity
Conceptual wording
Paraphrases
Natural-language questions
```

Example:

```text
"Why did we change billing deployment?"
```

may retrieve content that uses different wording.

---

# 24. Concurrent Execution

The two searches should run concurrently where supported:

```text
               Query
                 │
        ┌────────┴────────┐
        ▼                 ▼
      BM25             HNSW Vector
        │                 │
        └────────┬────────┘
                 ▼
```

This reduces unnecessary sequential latency.

---

# 25. Result Pool

The architecture combines candidate results into:

```text
Top 10 candidates
```

through:

```text
Reciprocal Rank Fusion
```

---

# 26. Reciprocal Rank Fusion

RRF combines ranking information rather than treating BM25 and vector scores as directly interchangeable.

Conceptually:

```text
BM25 rank
+
Vector rank
 ↓
RRF
 ↓
Unified ranking
```

The exact formula/configuration belongs to the implementation.

---

# 27. RRF Output

Output:

```text
Top 10 candidate chunks
```

Each candidate retains enough metadata for:

```text
Source
Parent chunk
Entities
Permissions
```

---

# 28. Stage 6 — First Reranking

Model:

```text
jina-reranker-v2
```

Input:

```text
Top 10 hybrid candidates
```

Output:

```text
Relevance-ranked candidates
```

---

# 29. Rerank Threshold

The architecture specifies:

```text
0.15
```

as the discard threshold for the first reranking stage.

Candidates below this threshold are discarded.

This should remain configurable.

---

# 30. Why Reranking Exists

Initial retrieval is optimized for:

```text
Recall
```

Reranking is used to improve:

```text
Precision
```

Conceptually:

```text
Many possible candidates
      ↓
Reranker
      ↓
Few strong candidates
```

---

# 31. First Rerank Output

Potential states:

```text
Strong candidates remain
```

or:

```text
No acceptable candidates
```

---

# 32. Stage 7 — CRAG

If all retrieved candidates fail the first reranking condition:

```text
Top 10
 ↓
Rerank
 ↓
All fail
 ↓
CRAG
```

CRAG means:

> Corrective Retrieval-Augmented Generation.

In CognitRAG, the corrective step rewrites/refines the query and returns to retrieval.

---

# 33. CRAG Flow

```text
Original Query
      ↓
Hybrid Search
      ↓
Rerank
      ↓
No useful evidence
      ↓
Corrective query
      ↓
Hybrid Search
      ↓
Rerank
```

The retry count should be bounded.

---

# 34. CRAG Safety

Do not loop indefinitely.

Use:

```text
bounded retry count
```

After retry exhaustion:

```text
Insufficient evidence
```

or another defined fallback.

---

# 35. CRAG UI State

If exposed to the user:

```text
We couldn't find strong evidence.
Refining the search...
```

Do not expose internal chain details.

---

# 36. Stage 8 — Entity Inspection

After first reranking, inspect surviving chunk metadata:

```text
Extracted entities
```

Example:

```text
Billing Service
INC-902
Payment API
```

These entities are candidates for graph expansion.

---

# 37. Graph Decision

Model:

```text
sarvam-30b
```

Purpose:

> Decide whether a graph search is useful for the current question and surviving entities.

This prevents unnecessary graph traversal.

---

# 38. Why Graph Routing Matters

Not every question benefits from a graph.

Example:

```text
"What is our support email?"
```

Probably does not require graph traversal.

But:

```text
"Why did billing deployment change?"
```

may benefit from:

```text
Billing Service
→ Incident
→ Decision
→ GitHub change
```

---

# 39. Graph Decision Inputs

Potential:

```text
Original / contextualized query
Surviving entities
Retrieved context
```

The exact inputs should match the implementation.

---

# 40. Graph Decision Outputs

Conceptually:

```text
use_graph = true
```

or:

```text
use_graph = false
```

---

# 41. Graph Bypass

If:

```text
use_graph = false
```

then:

```text
First-reranked vector context
 ↓
Second context stage
```

The exact implementation path may differ.

---

# 42. Stage 9 — Neo4j Expansion

If graph search is approved:

```text
Selected entities
 ↓
Neo4j
 ↓
1-hop relationships
```

---

# 43. Graph Expansion Example

```text
Billing Service
       │
       ├── depends_on → Payment API
       │
       ├── affected_by → INC-902
       │
       └── documented_by → Billing SOP
```

---

# 44. Graph Context

Graph-derived context can include:

```text
Entity names
Relationship types
Connected entities
Relevant graph statements
```

The exact sentence-generation method should follow the implementation.

---

# 45. Graph Expansion Boundary

The current architecture specifies:

```text
1-hop
```

expansion.

Do not silently increase to multi-hop traversal because it sounds more powerful.

Depth should be intentionally configured and evaluated.

---

# 46. Graph Permission Boundary

Graph expansion must respect authorization.

Restricted entities or relationships must not enter the answer context.

---

# 47. Stage 10 — Context Fusion

The system combines:

```text
Vector retrieval context
+
Graph retrieval context
```

into one pool.

Conceptually:

```text
Vector chunks
       +
Graph sentences
       ↓
Fused context
```

---

# 48. Context Deduplication

The fusion stage should avoid unnecessary duplicate information.

Example:

```text
Same Jira issue
appears through vector retrieval
and graph relation
```

The combined context should remain efficient.

---

# 49. Stage 11 — Second Rerank

The fused pool is passed through:

```text
jina-reranker-v2
```

again.

Purpose:

> Select the strongest context after semantic graph information has been added.

---

# 50. Second Rerank Output

The architecture selects:

```text
Top 15 absolute best items
```

These become the generation context.

---

# 51. Why Two Reranking Stages

First rerank:

```text
Improve precision after hybrid search.
```

Second rerank:

```text
Improve precision after graph context is added.
```

Conceptually:

```text
Search
 ↓
Rerank
 ↓
Graph
 ↓
Rerank again
```

---

# 52. Final Context Set

Final generation context:

```text
Top 15
+
User Facts
+
User Memory
```

subject to authorization.

---

# 53. Context Ordering

The exact ordering should be determined by the final reranker and generation-context builder.

Potentially include:

```text
relevance
source
freshness
relationship context
```

Do not arbitrarily reorder high-quality retrieval results in the frontend.

---

# 54. Stage 12 — Final Generation

Model:

```text
gpt-4o-mini
Provider:
OpenAI
```

Input:

```text
User query
Top 15 fused context
User facts
Relevant memory
```

Output:

```text
Final answer
```

---

# 55. Generation Objective

The final model should:

```text
Answer the question
Use supplied context
Avoid unsupported claims
Respect uncertainty
Reference evidence
```

It should not invent citations.

---

# 56. Evidence Grounding

The generator should have access to the source metadata needed to associate claims with evidence.

The frontend then renders:

```text
Source chips
Source Receipt
```

---

# 57. Insufficient Context During Generation

If the final context does not adequately support the answer:

```text
Return an uncertainty / insufficient-evidence state
```

rather than forcing a confident answer.

The exact system prompt and output schema should enforce this behavior.

---

# 58. Conflict During Generation

If context contains contradictory evidence:

```text
Preserve the conflict
```

and where possible communicate:

```text
Source A says...
Source B says...
```

The generator must not silently manufacture agreement.

---

# 59. Stage 13 — SSE Streaming

The final answer streams through:

```text
Server-Sent Events
```

Path:

```text
FastAPI
 ↓
SSE
 ↓
Next.js
 ↓
Ask Brain
```

---

# 60. Streaming Events

Recommended product-level events:

```text
start
status
content
citation
metadata
complete
error
```

The exact contract is defined in:

```text
10_API_CONTRACTS.md
```

---

# 61. Streaming UI

Example:

```text
Retrieving company context...
```

Then:

```text
Billing deployment changed yesterday...
```

Then evidence:

```text
[Jira BILL-902]
[GitHub PR #1287]
[Slack #engineering]
```

Then:

```text
High confidence
```

where appropriate.

---

# 62. Stream Error

If streaming fails:

```text
We couldn't complete this answer.

[ Retry ]
```

Do not display raw backend stack traces.

---

# 63. Stream Cancellation

Where supported:

```text
[ Stop ]
```

This should trigger safe cancellation of generation/work.

---

# 64. Stage 14 — Background Extraction

After the interaction:

```text
Conversation
 ↓
Background extraction
 ↓
New user facts
 ↓
Neo4j User node
```

Older messages may also be distilled into a rolling summary.

---

# 65. Background Extraction Principle

This process should normally not block the current answer.

The user's response should be available independently of the background memory update where architecture allows.

---

# 66. Background Extraction Failure

If memory extraction fails:

```text
Current answer remains successful.
```

Log the background failure separately.

Do not tell the user their answer failed because a nonessential memory update failed.

---

# 67. Rolling Summary

The architecture distills older messages into a rolling summary.

This supports:

```text
conversation continuity
contextualization
```

The summary must not become an uncontrolled replacement for authoritative company knowledge.

---

# 68. Complete Query Lifecycle

```text
                   USER QUESTION
                         │
                         ▼
                 AUTH / WORKSPACE
                         │
                         ▼
                  SEMANTIC CACHE
                   /           \
               HIT               MISS
                │                 │
                ▼                 ▼
             ANSWER          USER MEMORY
                                  │
                                  ▼
                           CONTEXTUALIZE
                                  │
                                  ▼
                            INTENT ROUTER
                           /             \
                   Conversational      Knowledge
                        │                 │
                        ▼                 ▼
                      Answer      BM25 + HNSW
                                          │
                                          ▼
                                         RRF
                                          │
                                          ▼
                                      RERANK #1
                                          │
                         ┌────────────────┴──────────────┐
                         │                               │
                    Strong result                 No result
                         │                               │
                         │                             CRAG
                         │                               │
                         │                        retry retrieval
                         │                               │
                         └───────────────┬───────────────┘
                                         ▼
                                  ENTITY INSPECTION
                                         │
                                         ▼
                                  GRAPH DECISION
                                   /          \
                                 NO            YES
                                 │              │
                                 │            Neo4j
                                 │          1-hop graph
                                 │              │
                                 └──────┬───────┘
                                        ▼
                                  CONTEXT FUSION
                                        │
                                        ▼
                                     RERANK #2
                                        │
                                        ▼
                                      TOP 15
                                        │
                                        ▼
                                   GPT-4o-mini
                                        │
                                        ▼
                                     SSE
                                        │
                                        ▼
                                  ASK BRAIN
                                        │
                               ┌────────┴────────┐
                               ▼                 ▼
                            ANSWER          EVIDENCE
                               │                 │
                               └────────┬────────┘
                                        ▼
                              BACKGROUND MEMORY
```

---

# 69. Query Path — Simple Question

Example:

```text
"What is our company support email?"
```

Potential path:

```text
Query
 ↓
Intent
 ↓
Hybrid retrieval
 ↓
Rerank
 ↓
No graph required
 ↓
Final context
 ↓
Generation
```

The system should avoid unnecessary graph work.

---

# 70. Query Path — Relationship Question

Example:

```text
"Why did billing deployment change?"
```

Potential path:

```text
Query
 ↓
Contextualize
 ↓
Hybrid retrieval
 ↓
Rerank
 ↓
Entities detected
 ↓
Graph decision = yes
 ↓
Neo4j
 ↓
Incident / Decision / Service relationships
 ↓
Fusion
 ↓
Second rerank
 ↓
Generation
```

---

# 71. Query Path — Weak Evidence

```text
Question
 ↓
Hybrid retrieval
 ↓
Rerank
 ↓
No acceptable candidates
 ↓
CRAG
 ↓
Retry
 ↓
Still weak
 ↓
Insufficient evidence
```

---

# 72. Query Path — Conflict

```text
Question
 ↓
Retrieval
 ↓
Source A
+
Source B
 ↓
Contradictory information
 ↓
Answer state = conflicting
 ↓
Show both sources
```

---

# 73. Query Path — Permission Restriction

```text
Question
 ↓
Candidate knowledge
 ↓
Authorization filtering
 ↓
Restricted context removed
 ↓
Authorized context
 ↓
Answer
```

If evidence becomes insufficient:

```text
Permission-limited / insufficient evidence
```

according to the final response model.

---

# 74. Retrieval Context Object

Conceptual runtime object:

```text
query
intent
sources[]
chunks[]
entities[]
graph_context[]
memory[]
permissions
status
```

This is an internal representation unless exposed through developer/debug APIs.

---

# 75. Citation Generation

Citations should be derived from actual retrieved source records.

Conceptually:

```text
Retrieved chunk
 ↓
Source metadata
 ↓
Citation object
 ↓
SSE citation event / final response
```

Never fabricate citation metadata at the UI layer.

---

# 76. Citation Ordering

Citations can be ordered based on:

```text
relevance
contribution
source type
```

The exact logic belongs to the answer service.

---

# 77. Source Freshness

When source timestamps exist, preserve:

```text
updated_at
```

This allows the UI to communicate freshness.

Do not equate recency with correctness.

---

# 78. Source Authority

If authority metadata is implemented:

```text
Approved SOP
```

may have a different authority level than:

```text
Informal Slack comment
```

This must be explicit in the backend.

---

# 79. Query Temporal Context

Queries such as:

```text
What is the current process?
```

should prioritize current knowledge.

Queries such as:

```text
What was the process last month?
```

should preserve historical context where source metadata supports it.

---

# 80. Temporal Retrieval

The retrieval layer may use:

```text
timestamps
versions
status
source authority
```

to distinguish:

```text
current
historical
stale
deprecated
```

The exact ranking logic must be implemented and evaluated.

---

# 81. Follow-Up Query

Example:

```text
User:
Why did billing change?

Assistant:
...

User:
Who approved it?
```

Flow:

```text
Conversation history
+
follow-up
 ↓
contextualization
 ↓
standalone query
 ↓
retrieval
```

---

# 82. Conversation Context Limits

The contextualizer should not blindly send unlimited history.

Use:

```text
bounded history
+
rolling summary
+
relevant recent messages
```

according to implementation constraints.

---

# 83. Memory + Conversation

The system can combine:

```text
current conversation
+
rolling summary
+
long-term user memory
```

but must keep:

```text
user-specific memory
```

distinct from:

```text
company-authoritative knowledge
```

---

# 84. Retrieval Quality Hierarchy

The pipeline should conceptually optimize:

```text
1. Permission correctness
2. Evidence availability
3. Retrieval relevance
4. Context completeness
5. Answer correctness
6. Latency
7. Cost
```

This ordering is a product-quality recommendation.

---

# 85. Latency Budget

Measure separately:

```text
Cache
Memory
Contextualization
Intent
BM25
Vector
RRF
Rerank #1
Graph decision
Graph
Fusion
Rerank #2
Generation
```

This allows bottlenecks to be identified.

---

# 86. Cost Budget

Measure:

```text
Intent model calls
Pronoun / contextualization calls
Graph-decision calls
Reranker calls
Generation calls
Embedding calls during ingestion
```

Query-time generation and retrieval costs should be monitored.

---

# 87. Retrieval Logging

For controlled observability, log enough metadata to debug:

```text
request_id
workspace
query identifier
intent
candidate counts
graph decision
final status
latencies
```

Do not unnecessarily store sensitive user content.

---

# 88. Debug Retrieval Trace

Developer mode can show:

```text
Query
 ↓
Intent
 ↓
Hybrid candidates
 ↓
Rerank
 ↓
Graph decision
 ↓
Graph results
 ↓
Fused context
 ↓
Final selected context
```

Do not show hidden chain-of-thought.

---

# 89. Retrieval Regression Dataset

Maintain questions for:

```text
Exact lookup
Semantic question
Cross-source question
Temporal question
Relationship question
Follow-up
Insufficient evidence
Conflict
Permission
```

---

# 90. Retrieval Evaluation

Compare:

```text
BM25
Vector
Hybrid
Hybrid + Reranking
Hybrid + Graph
```

using the same evaluation dataset.

This determines whether each architectural stage materially improves quality.

---

# 91. Reranker Evaluation

Test:

```text
threshold 0.15
alternative thresholds
```

against:

```text
precision
recall
answer correctness
latency
```

The current architecture's threshold should not be treated as permanently optimal.

---

# 92. Graph Evaluation

Measure:

```text
How often graph routing helps
How often graph routing hurts
Added latency
Answer improvement
```

The graph should be used selectively.

---

# 93. CRAG Evaluation

Measure:

```text
How often CRAG triggers
Recovery success rate
Additional latency
Additional cost
```

A corrective loop should improve weak retrieval enough to justify its cost.

---

# 94. Cache Evaluation

Measure:

```text
Cache hit rate
Latency saved
Answer quality
Permission correctness
Invalidation correctness
```

A fast wrong/stale answer is not a successful optimization.

---

# 95. Memory Evaluation

Measure:

```text
Contextual follow-up quality
Incorrect personalization
Stale memory
Memory conflicts
```

Memory should improve continuity without corrupting authoritative answers.

---

# 96. Permission Evaluation

Test each retrieval stage:

```text
Cache
Memory
BM25
Vector
Graph
Final context
Citation
```

The system must not allow an earlier authorization mistake to leak restricted content.

---

# 97. Permission Regression

Test scenarios:

```text
User loses access after indexing.

User changes role.

Source scope changes.

Private channel becomes excluded.
```

Expected:

```text
Previously indexed restricted knowledge is no longer retrievable.
```

The exact implementation must be verified.

---

# 98. Answer Quality States

Final answer can be categorized as:

```text
complete
high confidence
moderate confidence
low confidence
conflicting
insufficient evidence
permission limited
error
```

Exact response schema should be standardized.

---

# 99. Final Answer Construction

The answer service should produce something conceptually equivalent to:

```json
{
  "status": "complete",
  "content": "...",
  "citations": [],
  "graph_paths": [],
  "updated_at": "...",
  "confidence": "high"
}
```

Fields are conceptual and should match the final API contract.

---

# 100. Final Product Mapping

The technical retrieval pipeline becomes:

```text
CACHE
→ Faster answers

MEMORY
→ Better continuity

CONTEXTUALIZATION
→ Better follow-ups

INTENT
→ Correct path

HYBRID SEARCH
→ Broader retrieval

RRF
→ Combined ranking

RERANK
→ Better precision

CRAG
→ Recovery from weak retrieval

GRAPH
→ Relationship context

FUSION
→ Richer evidence

SECOND RERANK
→ Final context selection

GENERATION
→ Answer

SSE
→ Responsive UX

BACKGROUND MEMORY
→ Continued personalization
```

---

# 101. Retrieval Pipeline — User-Friendly Explanation

The public product does not need to expose the entire pipeline.

Explain it simply as:

> **CognitRAG combines semantic search, exact matching, relationship-aware context, and source evidence to answer questions about your company.**

---

# 102. Retrieval Pipeline — Developer Explanation

For technical documentation:

```text
Cache
 → Memory
 → Contextualization
 → Intent
 → BM25 + HNSW
 → RRF
 → Jina reranker
 → CRAG
 → Graph decision
 → Neo4j 1-hop
 → Context fusion
 → Jina reranker
 → GPT-4o-mini
 → SSE
```

This is the complete retrieval story.

---

# 103. Retrieval Pipeline — Investor Explanation

> CognitRAG uses a multi-stage hybrid retrieval engine that combines lexical and semantic search with reranking and selective knowledge-graph expansion before generating a source-backed answer.

Do not burden investor materials with every model name unless relevant.

---

# 104. Architecture Principle

The retrieval pipeline should be optimized as a sequence of quality gates:

```text
PERMISSION
 ↓
RELEVANCE
 ↓
PRECISION
 ↓
RELATIONSHIP
 ↓
CONTEXT
 ↓
GENERATION
```

---

# 105. Final Retrieval Diagram

```text
                         USER
                          │
                          ▼
                     ASK BRAIN
                          │
                          ▼
                  FASTAPI / SSE
                          │
                          ▼
                    LANGGRAPH
                          │
                          ▼
                  SEMANTIC CACHE
                     /        \
                   HIT         MISS
                   │             │
                   ▼             ▼
                ANSWER        MEMORY
                                 │
                                 ▼
                         CONTEXTUALIZATION
                                 │
                                 ▼
                           INTENT ROUTING
                                 │
                                 ▼
                         BM25 + HNSW
                           /       \
                          /         \
                    Keyword      Semantic
                          \         /
                           \       /
                              RRF
                               │
                               ▼
                         TOP 10 CHUNKS
                               │
                               ▼
                         JINA RERANKER
                               │
                     ┌─────────┴─────────┐
                     │                   │
                  GOOD                ALL WEAK
                     │                   │
                     │                 CRAG
                     │                   │
                     │              RETRY SEARCH
                     │                   │
                     └─────────┬─────────┘
                               ▼
                         ENTITY INSPECTION
                               │
                               ▼
                         GRAPH DECISION
                          /          \
                        NO            YES
                        │              │
                        │            NEO4J
                        │           1-HOP
                        │              │
                        └──────┬───────┘
                               ▼
                         CONTEXT FUSION
                               │
                               ▼
                         JINA RERANKER
                               │
                               ▼
                              TOP 15
                               │
                    ┌──────────┼──────────┐
                    │          │          │
                 Memory      Facts     Context
                    └──────────┼──────────┘
                               ▼
                         GPT-4o-mini
                               │
                               ▼
                            SSE
                               │
                               ▼
                           ANSWER
                               │
                  ┌────────────┼────────────┐
                  ▼            ▼            ▼
               Content      Sources      Status
                               │
                               ▼
                       BACKGROUND MEMORY
```

---

# 106. Critical Engineering Rule

Do not let product UI assumptions alter retrieval semantics.

For example:

```text
UI wants "always use graph"
```

does not mean:

```text
retrieval should always use graph.
```

The graph decision is part of the retrieval architecture.

---

# 107. Critical Product Rule

Do not expose internal retrieval details to ordinary users unless those details help them trust or control the system.

Expose:

```text
Source
Evidence
Freshness
Confidence/status
Relevant relationships
```

Hide by default:

```text
RRF
HNSW
BM25
Model routing
Reranker scores
CRAG loops
LangGraph nodes
```

---

# 108. Critical Security Rule

Security must hold through the entire pipeline:

```text
Cache
Memory
Search
Reranking
Graph
Fusion
Generation
Citation
```

A secure database alone is not enough if another downstream path can return unauthorized context.

---

# 109. Critical Quality Rule

The best answer is not:

> The most fluent answer.

It is:

> **The best-supported answer available to the authorized user.**

---

# 110. Definition of Done

The retrieval pipeline is ready for production MVP when:

```text
[ ] Query enters correct workspace context.
[ ] Authentication is verified.
[ ] Authorization is enforced.
[ ] Semantic cache works safely.
[ ] User memory loads where applicable.
[ ] Follow-up contextualization works.
[ ] Intent routing works.
[ ] BM25 works.
[ ] HNSW vector search works.
[ ] RRF fusion works.
[ ] First reranking works.
[ ] CRAG retry is bounded.
[ ] Graph decision works.
[ ] Neo4j 1-hop expansion works when selected.
[ ] Context fusion works.
[ ] Second reranking works.
[ ] Top context is selected.
[ ] Final generation works.
[ ] SSE streaming works.
[ ] Citations are accurate.
[ ] Insufficient evidence is handled.
[ ] Conflicts are handled.
[ ] Permission restrictions are respected.
[ ] Background extraction does not block the answer.
[ ] Retrieval regression tests exist.
[ ] Permission tests exist.
[ ] Quality metrics are tracked.
[ ] Latency is monitored.
[ ] Cost is monitored.
```

---

# 111. Final Retrieval Principle

> **CognitRAG should treat retrieval as a quality pipeline rather than a single search operation: find candidates broadly, rank them precisely, add relationships when useful, fuse context, verify authorization, and generate only from the resulting evidence.**
