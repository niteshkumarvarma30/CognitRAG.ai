# 09 — CognitRAG Technical Product Architecture & Workflow
## Architecture → Backend → Retrieval → Product UI → Security → Agents

> **Status:** Technical bridge specification.
>
> **Source of truth:** `Architecture(1).md`
>
> **Purpose:** Preserve the existing CognitRAG architecture exactly while mapping each technical layer to the product experience defined in the startup, landing-page, design-system, UI/UX, and user-flow documents.
>
> **Important:** This document does not replace the architecture. It translates the architecture into a product/system boundary so engineering and product work remain aligned.

---

# 1. Architecture Source of Truth

The core CognitRAG architecture is:

```text
Frontend
Next.js + React
Clerk
Lucide
SSE
        ↓
Backend API
FastAPI + Uvicorn
        ↓
Data / Knowledge Layer
Supabase PostgreSQL + pgvector
Neo4j
        ↓
LangGraph Retrieval / Orchestration
        ↓
LLM + Embedding + Reranking Models
        ↓
Company Brain
```

The existing architecture specifically defines:

- Next.js / React frontend
- Clerk authentication
- Lucide React icons
- SSE streaming
- FastAPI / Uvicorn backend
- Supabase PostgreSQL + pgvector
- BM25 keyword search
- HNSW vector search
- Supabase Row Level Security
- Neo4j semantic dictionary / entity relationships / ontology

These must remain the technical foundation unless deliberately changed through a future architecture decision.

---

# 2. System Boundary

CognitRAG should be understood as five connected layers:

```text
┌─────────────────────────────────────────────┐
│                  EXPERIENCE                 │
│ Next.js UI / Ask Brain / Graph / Admin     │
└───────────────────────┬─────────────────────┘
                        │
┌───────────────────────▼─────────────────────┐
│                    API                       │
│ FastAPI / SSE / Authentication / Workspace │
└───────────────────────┬─────────────────────┘
                        │
┌───────────────────────▼─────────────────────┐
│              ORCHESTRATION                  │
│ LangGraph / Retrieval / Memory / Routing   │
└───────────────────────┬─────────────────────┘
                        │
┌───────────────────────▼─────────────────────┐
│              KNOWLEDGE LAYER                │
│ Supabase pgvector + Neo4j                  │
└───────────────────────┬─────────────────────┘
                        │
┌───────────────────────▼─────────────────────┐
│                DATA SOURCES                 │
│ Documents / Slack / Jira / GitHub / etc.  │
└─────────────────────────────────────────────┘
```

---

# 3. Frontend Layer

## Technology

```text
Next.js 14
React
JavaScript / JSX
Clerk
Lucide React
CSS variables
SSE
```

## Responsibilities

The frontend is responsible for:

```text
Authentication UI
Workspace UI
Onboarding
Ask Brain
Streaming answer rendering
Source evidence
Knowledge Graph
Knowledge Library
Integrations
Security controls
Activity
Agent experiences later
```

The frontend must not reproduce backend retrieval logic.

---

# 4. Backend API Layer

## Technology

```text
FastAPI
Uvicorn
```

## Responsibilities

```text
Authentication / authorization integration
Workspace operations
Chat / Brain requests
Streaming response
Knowledge queries
Integration operations
Graph queries
Administrative operations
```

The API should expose stable application-level operations rather than forcing the frontend to know individual retrieval stages.

---

# 5. Streaming Interface

The architecture uses:

```text
Server-Sent Events
```

for streaming chat.

Conceptual flow:

```text
Next.js
   │
   │ request
   ▼
FastAPI
   │
   ▼
LangGraph
   │
   ▼
Answer generation
   │
   │ stream
   ▼
SSE
   │
   ▼
Next.js Ask Brain
```

The UI should show meaningful states during this process.

---

# 6. Ingestion Architecture

The ingestion pipeline is the path from external information to Company Brain memory.

```text
SOURCE
  ↓
DOCUMENT / STRUCTURED DATA
  ↓
PARSING / NORMALIZATION
  ↓
PARENT CHUNK
  ↓
PRONOUN RESOLUTION
  ↓
GRAPH EXTRACTION
  ↓
CHILD CHUNK
  ↓
EMBEDDING
  ↓
VECTOR STORAGE
  +
GRAPH STORAGE
```

This is the core data-to-memory workflow.

---

# 7. PDF / Document Parsing

Technology:

```text
pymupdf4llm
```

Function:

```text
Raw PDF
   ↓
Structured Markdown
```

The goal is to preserve meaningful document structure before chunking.

---

# 8. Parent Chunking

Technology:

```text
RecursiveCharacterTextSplitter
```

Configured architecture:

```text
~2000-character parent chunks
```

Purpose:

> Preserve broad context for later answer generation.

The parent chunk should remain associated with the smaller retrieval chunks derived from it.

---

# 9. Pronoun Resolution

Model:

```text
llama-3.1-8b-instant
Provider:
Groq
```

Function:

> Resolve ambiguous references such as "it", "they", or similar context-dependent language into more explicit references before retrieval-oriented indexing.

Conceptual flow:

```text
Original text
      ↓
Pronoun resolution
      ↓
Resolved text
```

This is an ingestion transformation.

---

# 10. Graph Extraction

Model:

```text
gpt-4o-mini
```

Library:

```text
instructor
```

Input:

```text
Resolved parent chunk
```

Output:

```text
Entities
+
Relationships
```

Then:

```text
Extracted entities
        ↓
Neo4j
```

---

# 11. Neo4j Knowledge Graph

Neo4j stores:

```text
Entities
Relationships
Semantic Dictionary
Ontology / business logic
```

Examples:

```text
Billing Service
     ↓
related to
     ↓
Payment API

Incident
     ↓
affected
     ↓
Billing Service
```

The exact graph schema must remain aligned with the backend implementation.

---

# 12. Child Chunking

After graph extraction:

```text
Resolved parent chunk
        ↓
Child chunking
        ↓
~400-character child chunks
```

Purpose:

> Provide more precise retrieval units.

---

# 13. Embeddings

Model:

```text
jina-embeddings-v4
```

Function:

```text
Child chunk
    ↓
Dense vector
```

The vector is used for semantic search.

---

# 14. Decoupled Storage

The architecture intentionally separates:

```text
Retrieval representation
```

from:

```text
Answer context representation
```

Specifically:

```text
Child chunk
    ↓
Vector search

Parent text
    ↓
Context payload
```

This allows precise retrieval while preserving broader context for generation.

---

# 15. Supabase / pgvector

Supabase PostgreSQL stores:

```text
Vectors
Metadata
Knowledge records
User memory
Cache-related data
```

The architecture uses:

```text
pgvector
BM25
HNSW
Row Level Security
```

---

# 16. Structured Integrations

The architecture identifies structured sources including:

```text
Google Workspace
Slack
Jira
Salesforce
```

Their schemas can be mapped into Neo4j nodes to support structural relationships and business logic.

As the connector ecosystem expands, integrations should be added without changing the core product concept.

---

# 17. Ingestion End-to-End Example

Example:

```text
Slack message

"After the migration issue, let's require
the pre-check before billing deployment."

        ↓

Normalize / resolve

"After incident INC-902, require the
migration pre-check before billing deployment."

        ↓

Graph extraction

Entities:
Billing Service
INC-902
Migration Pre-check

Relationship:
INC-902
→ caused change to
→ Billing Deployment

        ↓

Child chunks
        ↓
Embeddings
        ↓
Supabase
        +
Neo4j
```

The exact transformations should remain consistent with the implemented pipeline.

---

# 18. Retrieval Architecture

The retrieval system is a multi-stage pipeline.

```text
USER QUERY
    ↓
Semantic Cache
    ↓
Memory
    ↓
Contextualization
    ↓
Intent Routing
    ↓
Hybrid Search
    ↓
Rerank
    ↓
Graph Decision
    ↓
Graph Expansion
    ↓
Context Fusion
    ↓
Second Rerank
    ↓
Generation
    ↓
SSE
    ↓
Background Extraction
```

This is the core query-to-answer workflow.

---

# 19. Retrieval Step 1 — Semantic Cache

The architecture checks:

```text
In-memory LRU cache
```

and:

```text
Supabase vector cache
```

If an acceptable cached answer exists, the system may return it without executing the entire retrieval process.

The exact cache rules remain backend implementation details.

---

# 20. Retrieval Step 2 — Memory Loading

The architecture loads:

```text
User Long-Term Memory
```

from Supabase.

Memory may include:

```text
Preferences
Facts
Conversation-derived information
```

Memory must not override authoritative company knowledge.

---

# 21. Retrieval Step 3 — Contextualization

A vague follow-up is rewritten into a standalone query.

Example:

```text
Previous:
"What happened with billing?"

Follow-up:
"What changed?"

        ↓

Contextualized:
"What changed in the billing process?"
```

This stage uses conversation history.

---

# 22. Retrieval Step 4 — Intent Routing

Model:

```text
llama-3.3-70b-versatile
Provider:
Groq
```

Function:

```text
Query
 ↓
Intent classification
```

Conversational intents can bypass the knowledge search path.

This reduces unnecessary retrieval work.

---

# 23. Retrieval Step 5 — Concurrent Hybrid Search

Two searches run:

```text
BM25 keyword search
+
HNSW vector search
```

Then:

```text
Results
 ↓
Reciprocal Rank Fusion
 ↓
Top 10 candidates
```

The purpose is to combine:

```text
Exact-term matching
+
Semantic similarity
```

---

# 24. Retrieval Step 6 — First Rerank

Model:

```text
jina-reranker-v2
```

Input:

```text
Top 10 candidates
```

Output:

```text
Ranked candidates
```

The architecture specifies a filtering threshold of:

```text
0.15
```

for this stage.

That value is an implementation parameter and should be adjustable for evaluation.

---

# 25. Corrective Retrieval

If all candidates fail the first reranking condition:

```text
Rerank
 ↓
No acceptable candidates
 ↓
CRAG
 ↓
Rewrite query
 ↓
Repeat retrieval
```

The UI should simply communicate:

```text
No strong evidence found.
Refining the search...
```

when this behavior is exposed at all.

---

# 26. Retrieval Step 7 — Graph Decision

The system inspects surviving chunk metadata for entities.

Then:

```text
Entities detected
      ↓
Graph decision
```

Model:

```text
sarvam-30b
```

Function:

> Determine whether graph expansion is useful for the current retrieval.

This prevents unnecessary graph traversal.

---

# 27. Graph Expansion

If graph retrieval is approved:

```text
Selected entities
       ↓
Neo4j
       ↓
1-hop semantic relationships
```

Example:

```text
Billing Service
    ↓
depends on
    ↓
Payment API
```

---

# 28. Retrieval Step 8 — Context Fusion

The system combines:

```text
Vector chunks
+
Graph-derived sentences / context
```

Then:

```text
Combined pool
 ↓
Jina reranker
 ↓
Top 15
```

These become the principal retrieval context.

---

# 29. Retrieval Step 9 — Generation

Model:

```text
gpt-4o-mini
```

Inputs:

```text
Top 15 context
+
User facts
+
User memory
```

Output:

```text
Final answer
```

The answer is streamed via SSE.

---

# 30. Retrieval Step 10 — Background Extraction

After interaction:

```text
Conversation
 ↓
Background extraction
 ↓
New facts
 ↓
Neo4j User node
```

Older messages can also be distilled into a rolling summary.

This should not block the user's current answer unless the implementation intentionally requires it.

---

# 31. Model Responsibility Map

```text
llama-3.1-8b-instant
    → Pronoun/coreference resolution

llama-3.3-70b-versatile
    → Intent routing

gpt-4o-mini
    → Graph entity extraction
    → Final answer generation

jina-embeddings-v4
    → Dense embeddings

jina-reranker-v2
    → First rerank
    → Second rerank

sarvam-30b
    → Graph decision verification

nvidia/nv-embedqa-e5-v5
    → Offline evaluation / benchmarking
```

This table is an architecture responsibility map, not a marketing feature list.

---

# 32. User Query → Product Mapping

The backend pipeline maps to the UI as:

```text
USER
"What changed in billing?"

        ↓

ASK BRAIN

        ↓

FastAPI

        ↓

LangGraph

        ↓

Retrieval

        ↓

Graph when useful

        ↓

Generation

        ↓

SSE

        ↓

ANSWER

        ↓

SOURCE RECEIPTS
```

The UI should abstract away most intermediate technical stages.

---

# 33. UI State Mapping

Backend behavior:

```text
Request started
```

UI:

```text
Retrieving company context...
```

Backend:

```text
Generation streaming
```

UI:

```text
Answer appears progressively
```

Backend:

```text
Complete
```

UI:

```text
Sources
Confidence/status
Actions
```

---

# 34. Evidence Flow

Architecture:

```text
Retrieved chunks
+
Graph paths
+
Source metadata
```

Product:

```text
Answer
 ↓
Evidence chips
 ↓
Source Receipt
 ↓
Original source
```

The exact metadata required by the frontend should be formally defined by the API contract.

---

# 35. Source Receipt Data Contract

At minimum, the UI should receive enough data to render:

```text
source_type
source_name
source_reference
timestamp / updated_at
related_entities
reason / relevance metadata where available
```

Exact API field names should be standardized before frontend implementation.

---

# 36. Confidence Data Contract

If a confidence score is exposed, define exactly what it means.

Possible UI statuses:

```text
High confidence
Moderate confidence
Low confidence
Conflicting
Insufficient evidence
```

Do not label an arbitrary score as calibrated probability.

---

# 37. Conflict Data Contract

The API should support a response state where appropriate:

```text
status = conflicting
```

and provide:

```text
supporting source A
supporting source B
timestamps
relevant excerpts where authorized
```

The UI then provides:

```text
Compare Sources
```

---

# 38. Permission Architecture

Security must occur before unauthorized context reaches the answer.

Conceptual:

```text
User
 ↓
Workspace
 ↓
Role
 ↓
Source permissions
 ↓
Database RLS
 ↓
Retrieval
 ↓
Answer
```

The frontend hiding an item is not sufficient security.

---

# 39. Supabase RLS

The architecture explicitly maps roles into Supabase Row Level Security.

Therefore:

```text
Unauthorized record
        ↓
Database access denied
```

This is a core security boundary.

---

# 40. Permission-Aware Search

Search must use authorization constraints.

```text
Candidate knowledge
 ↓
Permission filtering
 ↓
Authorized results
```

No restricted content should enter:

```text
Answer
Graph
Citation
```

unless allowed by policy.

---

# 41. Permission-Aware Graph

Neo4j graph queries must be constrained so the graph does not reveal relationships the user is not authorized to see.

If authorization is enforced outside Neo4j, the API must still guarantee that restricted graph data is never returned to the client.

The exact implementation boundary should be documented by engineering.

---

# 42. Semantic Dictionary

The semantic dictionary is not merely UI documentation.

It is part of the ontology/business-logic layer.

Example:

```text
Churn Risk

Definition
Company-approved definition

Owner
Customer Success

Version
3
```

The agent/retrieval system can use controlled definitions to reduce ambiguity.

---

# 43. Deterministic Business Semantics

The architecture positions administrator-defined definitions as a way to constrain important meanings.

Conceptual:

```text
Question
 ↓
Semantic Dictionary
 ↓
Controlled definition
 ↓
Retrieval / reasoning
 ↓
Answer
```

Do not market this as a literal guarantee of zero hallucinations.

---

# 44. Verifiable Answer Architecture

Every high-value answer should connect:

```text
Answer
 ↓
Retrieved evidence
 ↓
Source chunk
 +
Graph path when applicable
```

The product can therefore present:

```text
Answer Receipt
```

as the human-facing trust layer.

---

# 45. Answer Receipt

Conceptual backend payload:

```text
answer
status
sources[]
graph_paths[]
updated_at
confidence / quality status
```

The exact schema should be formalized in API contracts.

---

# 46. Company Brain Data Lifecycle

Complete system:

```text
SOURCE
 ↓
INGEST
 ↓
PARSE
 ↓
CHUNK
 ↓
RESOLVE
 ↓
EXTRACT
 ↓
EMBED
 ↓
STORE
 ↓
RETRIEVE
 ↓
RERANK
 ↓
GRAPH EXPAND
 ↓
FUSE
 ↓
GENERATE
 ↓
STREAM
 ↓
LEARN / UPDATE
```

This should remain the core CognitRAG technical story.

---

# 47. Architecture → Product Surface Mapping

```text
ARCHITECTURE              PRODUCT SURFACE

Ingestion                 Integrations
Supabase                  Knowledge / Search
Neo4j                     Knowledge Graph
Semantic Dictionary       Dictionary
LangGraph                 Ask Brain
Hybrid Retrieval          Search / Ask
Reranking                 Answer quality
SSE                       Streaming UI
User Memory               Conversation continuity
RLS                       Access Control
Source metadata           Evidence / Source Receipt
Background extraction     Brain evolution
```

---

# 48. Architecture → Customer Benefit

```text
TECHNICAL CAPABILITY
        ↓
CUSTOMER VALUE

Hybrid retrieval
        ↓
Find relevant information more effectively.

Knowledge graph
        ↓
Understand relationships.

Reranking
        ↓
Prioritize relevant evidence.

Semantic dictionary
        ↓
Use company-specific definitions.

RLS / permissions
        ↓
Respect access boundaries.

Source metadata
        ↓
Verify answers.

SSE
        ↓
Responsive answer experience.

Background extraction
        ↓
Maintain user/company context.
```

---

# 49. What the UI Should Hide

Do not expose by default:

```text
BM25
HNSW
RRF
LRU cache
model names
reranker thresholds
internal graph routing
LangGraph node names
embedding dimensions
raw backend traces
```

Expose these only in:

```text
Developer mode
Debug mode
Architecture documentation
Evaluation
```

---

# 50. What the UI Should Expose

Expose:

```text
Answer
Evidence
Freshness
Confidence/status
Relationships
Permissions
Knowledge changes
```

These are user-relevant outcomes.

---

# 51. Technical Debug Mode

For engineers, provide an optional mode:

```text
Query
Intent
Retrieved candidates
Rerank results
Graph decision
Graph paths
Final context
Latency
Model stage
```

This should never expose hidden model reasoning.

---

# 52. Evaluation Mode

A separate technical interface can compare:

```text
Vector only
Hybrid
Hybrid + reranking
Hybrid + graph
```

Metrics:

```text
Faithfulness
Context relevance
Retrieval quality
Answer correctness
Latency
Cost
```

This is for the engineering/evaluation team, not normal employees.

---

# 53. API Boundary

The frontend should communicate with product-level endpoints.

Possible conceptual APIs:

```text
POST /api/v1/chat/stream
GET  /api/v1/knowledge
GET  /api/v1/knowledge/entities/:id
GET  /api/v1/graph
GET  /api/v1/integrations
POST /api/v1/integrations/:id/sync
GET  /api/v1/activity
GET  /api/v1/security
```

These are conceptual contracts, not claims that these exact routes already exist.

---

# 54. Chat API

The existing architecture references:

```text
/api/v1/chat/stream
```

Conceptual request:

```text
workspace
user
conversation
message
```

Conceptual response events:

```text
start
content
citation
status
complete
error
```

Exact event schema should be standardized.

---

# 55. Frontend State Model

Ask Brain should track:

```text
idle
submitting
retrieving
streaming
complete
error
cancelled
```

Knowledge pages:

```text
loading
loaded
empty
error
unauthorized
```

Integrations:

```text
disconnected
connecting
syncing
healthy
paused
authorization_required
error
```

---

# 56. Error Boundary

Frontend should catch:

```text
API failure
SSE failure
render failure
authorization failure
network failure
```

User gets clear recovery options.

Technical errors are logged internally.

---

# 57. Data Fetching Principle

Frontend should not duplicate business logic.

For example:

Bad:

```text
Frontend decides which sources a user can see.
```

Correct:

```text
Backend returns only permitted data.
Frontend renders it.
```

The same principle applies to:

```text
Graph permissions
Search
Citations
Agent context
Audit data
```

---

# 58. Workspace Isolation

Every product request should be associated with the correct workspace.

Conceptually:

```text
Request
 ↓
Authenticated user
 ↓
Workspace membership
 ↓
Workspace scope
 ↓
Authorized data
```

No cross-workspace knowledge should leak.

---

# 59. Tenant Isolation

The backend and database design must prevent:

```text
Workspace A
```

from retrieving:

```text
Workspace B
```

data.

This is independent of UI visibility.

---

# 60. Integration Data Flow

Example:

```text
Slack
 ↓
OAuth / authorization
 ↓
Connector
 ↓
Ingestion
 ↓
Normalization
 ↓
Graph + vector storage
 ↓
CognitRAG
```

---

# 61. Integration Metadata

Store enough metadata to support:

```text
source identity
source type
sync status
last sync
permissions/scope
external reference
```

The exact schema belongs in the backend data contract.

---

# 62. Sync State Machine

```text
NOT_CONNECTED
      ↓
CONNECTING
      ↓
CONNECTED
      ↓
SYNCING
      ↓
HEALTHY
```

Error branches:

```text
SYNCING
   ↓
ERROR

CONNECTED
   ↓
AUTHORIZATION_REQUIRED
```

---

# 63. Ingestion Idempotency

The ingestion layer should avoid creating duplicate knowledge when the same source item is processed more than once.

Use source-specific stable identifiers where available.

This is an engineering requirement to define during implementation.

---

# 64. Update Handling

When source content changes:

```text
Source update
 ↓
Detect change
 ↓
Reprocess relevant representation
 ↓
Update vectors / graph relationships
 ↓
Preserve relevant history where required
```

Exact update semantics depend on connector behavior.

---

# 65. Deletion Handling

When source data is deleted or access is revoked:

```text
Source event
 ↓
Update access / knowledge state
 ↓
Ensure deleted/restricted content is not retrievable
```

The precise deletion and retention policy must be specified before enterprise deployment.

---

# 66. Temporal Knowledge

The architecture contains chronological/versioning concepts.

The product should distinguish:

```text
Current
Historical
Changed
Deprecated
```

When answering temporal queries:

```text
"What was the old process?"
```

vs:

```text
"What is the current process?"
```

the retrieval system must respect temporal context.

---

# 67. Current vs Historical UX

Example:

```text
CURRENT
Billing Deployment v3.2

HISTORICAL
Billing Deployment v3.1
```

The user should not confuse old evidence with current policy.

---

# 68. Knowledge Change Pipeline

Long-term:

```text
New source event
 ↓
Potential change
 ↓
Evidence gathering
 ↓
Suggested update
 ↓
Human review
 ↓
Approved knowledge
 ↓
Current version
```

This is a product governance layer built on top of the retrieval architecture.

---

# 69. Background Memory Pipeline

Existing architecture:

```text
Interaction
 ↓
Background extraction
 ↓
User facts
 ↓
Neo4j User node
 ↓
Rolling summary
```

The UX should not block on this process unless required.

---

# 70. Memory Precedence

Recommended conceptual precedence:

```text
Authoritative company rule
        >
Current approved knowledge
        >
Relevant source context
        >
User memory
        >
Conversational assumption
```

This is a product-policy recommendation; exact precedence must be encoded in backend logic before being treated as guaranteed behavior.

---

# 71. Agent Architecture

Long-term product:

```text
AI Agent
    ↓
MCP / API
    ↓
CognitRAG
    ↓
Knowledge
Rules
Skills
Permissions
    ↓
Agent context
```

Agent capabilities should build on the same knowledge/security foundations rather than creating a separate knowledge system.

---

# 72. Agent Context Flow

```text
Agent request
 ↓
Identify task
 ↓
Retrieve permitted company context
 ↓
Apply relevant definitions / rules
 ↓
Return context
```

If execution tools are later added:

```text
Context
 ↓
Policy / skill
 ↓
Tool
 ↓
Approval if required
 ↓
Action
```

---

# 73. MCP Boundary

MCP should expose product-level capabilities such as:

```text
Company knowledge
Policies
Skills
Entities
Context
```

The exact MCP surface should be defined separately in the agent platform specification.

---

# 74. API/MCP Security

Agent context must be permission-aware.

The system must determine:

```text
Which agent?
Which user / principal?
Which workspace?
Which sources?
Which permissions?
```

before returning restricted context.

---

# 75. Agent Observability

Future agent runs should record:

```text
Agent
Request
Context references
Skill
Tools
Result
Approval
Timestamp
```

This enables debugging and audit.

---

# 76. Technical Architecture → Startup Story

The architecture can be explained publicly as:

```text
Connect
 ↓
Understand
 ↓
Remember
 ↓
Verify
 ↓
Enable
```

Underneath:

```text
Ingestion
 ↓
Extraction
 ↓
Vector + Graph
 ↓
Hybrid retrieval
 ↓
Reranking
 ↓
Graph expansion
 ↓
Context fusion
 ↓
Generation
```

The two descriptions represent the same system at different abstraction levels.

---

# 77. Technical Architecture → Marketing Story

Public website:

> **Connect your company's systems.**

Technical architecture:

```text
Connectors
+
Ingestion
```

Public website:

> **Understand your company.**

Technical architecture:

```text
Entity extraction
+
Semantic graph
+
Controlled definitions
```

Public website:

> **Ask your company.**

Technical architecture:

```text
Hybrid retrieval
+
Reranking
+
Graph expansion
+
Context fusion
```

Public website:

> **Trust the answer.**

Technical architecture:

```text
RLS
+
Source metadata
+
Graph paths
+
Evidence
```

Public website:

> **Give your AI context.**

Technical architecture:

```text
API
+
MCP
+
Knowledge
+
Skills
```

---

# 78. Architecture Diagram for Investor / Sales Use

```text
                 ENTERPRISE SOURCES
       ┌────────┬────────┬────────┬────────┐
       │ Slack  │ Jira   │ GitHub │ Docs   │
       └────┬───┴────┬───┴────┬───┴────┬───┘
            │        │        │        │
            └────────┴────────┴────────┘
                         ↓
                  INGESTION LAYER
                         ↓
              ┌──────────┴──────────┐
              │                     │
         VECTOR MEMORY          KNOWLEDGE GRAPH
         Supabase/pgvector       Neo4j
              │                     │
              └──────────┬──────────┘
                         ↓
                  RETRIEVAL ENGINE
             Hybrid Search + Reranking
                         ↓
                  GRAPH EXPANSION
                         ↓
                  CONTEXT FUSION
                         ↓
                    LLM ANSWER
                         ↓
          ┌──────────────┴──────────────┐
          │                             │
       HUMANS                       AI AGENTS
      Ask Brain                      API/MCP
```

---

# 79. Architecture Diagram for Developers

```text
NEXT.JS
  │
  │ SSE
  ▼
FASTAPI
  │
  ▼
LANGGRAPH
  │
  ├── Cache
  ├── Memory
  ├── Contextualization
  ├── Intent Router
  ├── Hybrid Search
  ├── Reranker
  ├── Graph Decision
  ├── Neo4j Expansion
  ├── Context Fusion
  └── Generation
        │
        ├── Supabase / pgvector
        └── Neo4j
```

---

# 80. Architecture Diagram for Users

```text
YOUR SYSTEMS
      ↓
COMPANY BRAIN
      ↓
KNOWLEDGE + CONTEXT
      ↓
VERIFIED ANSWERS
      ↓
PEOPLE + AI AGENTS
```

The diagram changes by audience, not the underlying architecture.

---

# 81. Architecture Documentation Hierarchy

Maintain:

```text
ARCHITECTURE SOURCE OF TRUTH
        ↓
Technical architecture
        ↓
API contracts
        ↓
Data models
        ↓
Product requirements
        ↓
UI/UX
        ↓
Marketing
```

Never allow marketing copy to silently redefine technical behavior.

---

# 82. Recommended Technical Documentation Set

After this bridge document, maintain:

```text
10_API_CONTRACTS.md
11_DATA_MODEL.md
12_INGESTION_PIPELINE_SPEC.md
13_RETRIEVAL_PIPELINE_SPEC.md
14_KNOWLEDGE_GRAPH_SPEC.md
15_SECURITY_AND_RBAC_TECHNICAL_SPEC.md
16_EVALUATION_AND_BENCHMARKING.md
17_AGENT_AND_MCP_TECHNICAL_SPEC.md
18_INFRASTRUCTURE_AND_DEPLOYMENT.md
```

These should contain implementation-level details.

---

# 83. Technical Decision Records

For major architecture changes, create:

```text
ADR-001
Why Neo4j?

ADR-002
Why hybrid retrieval?

ADR-003
Why parent + child chunks?

ADR-004
Why graph decision routing?

ADR-005
Why SSE?

ADR-006
How is permission enforcement implemented?
```

This prevents architectural drift.

---

# 84. Change Management

If architecture changes:

```text
Old decision
 ↓
Reason for change
 ↓
New decision
 ↓
Affected product surfaces
 ↓
Updated documentation
```

Do not let code diverge from architecture documentation silently.

---

# 85. Technical Testing Strategy

Test separately:

```text
Ingestion
Retrieval
Graph
Generation
Permissions
Streaming
Frontend
```

Then test end-to-end:

```text
Source
 ↓
Ingestion
 ↓
Knowledge
 ↓
Question
 ↓
Answer
 ↓
Evidence
```

---

# 86. End-to-End Test

Example:

```text
Input source:
Billing incident document

Expected:
Entity: INC-902
Entity: Billing Service
Relationship: incident → affected service

Query:
"What changed in billing?"

Expected:
Answer cites incident
Answer reflects current process
Unauthorized user cannot retrieve restricted source
```

This should become a repeatable integration test.

---

# 87. Permission Test

```text
User A
Can access Engineering

User B
Cannot access Engineering

Question
"What happened to billing?"

Expected:
A sees permitted evidence.
B receives only permitted context.
```

---

# 88. Conflict Test

```text
Source A
Old deployment process

Source B
New deployment process

Query
"What is the current process?"

Expected:
Current source prioritized according to
the actual authority/temporal logic,
or conflict surfaced if authority is unresolved.
```

---

# 89. Graph Test

```text
Question
"Why did billing deployment change?"

Expected:
Relevant entity discovered
Graph expansion occurs if selected
Relevant relationship improves context
```

Do not assume graph expansion is required for every question.

---

# 90. Retrieval Regression Tests

Maintain representative questions for:

```text
Exact search
Semantic search
Cross-source retrieval
Temporal query
Graph relationship
Follow-up
Low evidence
Conflicting evidence
Permission restriction
```

Run after retrieval changes.

---

# 91. Cost / Performance Tests

Track:

```text
Retrieval latency
First token latency
Total answer latency
Embedding cost
Reranking cost
Generation cost
Graph latency
```

Optimize only where customer value or reliability warrants it.

---

# 92. Technical Limitations

The architecture should explicitly document:

```text
What is supported?
What is experimental?
What is approximate?
What is not implemented?
```

This is especially important for:

```text
confidence
freshness
automatic knowledge updates
agents
MCP
```

---

# 93. Current Architecture Boundaries

The following are explicitly established by the architecture:

```text
Frontend
Next.js / React

Backend
FastAPI

Vector
Supabase + pgvector

Graph
Neo4j

Orchestration
LangGraph

Streaming
SSE

Embeddings
Jina

Reranking
Jina

LLM tasks
Groq / OpenAI / Sarvam according to stage
```

Future changes should be recorded rather than silently substituted.

---

# 94. Product Boundary

CognitRAG is not merely:

```text
Vector database
```

not merely:

```text
Knowledge graph
```

and not merely:

```text
Chat UI
```

It is:

```text
INGESTION
+
SEMANTIC UNDERSTANDING
+
VECTOR RETRIEVAL
+
GRAPH CONTEXT
+
RERANKING
+
MEMORY
+
PERMISSIONS
+
EVIDENCE
+
GENERATION
```

presented as:

> **Company Brain**

---

# 95. Final Architecture Narrative

The technical story is:

> CognitRAG ingests enterprise information, transforms it into semantic and vector representations, retrieves relevant context using hybrid search and reranking, selectively expands relationships through Neo4j, fuses the resulting evidence, and generates a streamed answer while preserving user memory and access controls.

The product story is:

> **CognitRAG connects what your company knows and makes that knowledge usable by people and AI agents.**

Both statements describe the same product at different levels.

---

# 96. Final System Workflow

```text
                    DATA SOURCES
                         │
        ┌────────────────┼────────────────┐
        │                │                │
      Slack             Jira            GitHub
        │                │                │
        └────────────────┼────────────────┘
                         ▼
                 INGESTION PIPELINE
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
   VECTOR REPRESENTATION         GRAPH REPRESENTATION
   Supabase / pgvector                 Neo4j
          │                             │
          └──────────────┬──────────────┘
                         ▼
                  USER QUESTION
                         │
                         ▼
                 SEMANTIC CACHE
                         │
                         ▼
                  USER MEMORY
                         │
                         ▼
                 CONTEXTUALIZATION
                         │
                         ▼
                   INTENT ROUTING
                         │
                         ▼
               HYBRID SEARCH
             BM25 + HNSW Vector
                         │
                         ▼
                   RRF TOP 10
                         │
                         ▼
                    RERANK
                         │
                         ▼
                    CRAG if needed
                         │
                         ▼
                  GRAPH DECISION
                         │
                  ┌──────┴──────┐
                  │             │
                 NO            YES
                  │             │
                  │          Neo4j 1-hop
                  │             │
                  └──────┬──────┘
                         ▼
                  CONTEXT FUSION
                         │
                         ▼
                  SECOND RERANK
                         │
                         ▼
                    TOP 15
                         │
                         ▼
                  GPT-4o-mini
                         │
                         ▼
                   SSE STREAM
                         │
                         ▼
                  ASK BRAIN UI
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           ANSWER     EVIDENCE    GRAPH
                         │
                         ▼
                BACKGROUND EXTRACTION
```

---

# 97. Architecture → Product Principle

The architecture is not a separate technical artifact from the product.

It determines what the product can truthfully promise.

Therefore:

```text
Architecture
       ↓
Capabilities
       ↓
Product requirements
       ↓
UI
       ↓
Marketing
```

must remain synchronized.

---

# 98. Final Source-of-Truth Rule

There should be exactly one technical architecture authority:

> **`Architecture(1).md` / its maintained successor**

Startup documents should:

```text
Explain
Translate
Prioritize
Package
Visualize
```

but not silently alter the underlying architecture.

---

# 99. Final Technical Principle

> **CognitRAG's differentiation should be expressed as a complete semantic retrieval system—not as a collection of disconnected technologies.**

The system combines:

```text
precise retrieval
+
semantic relationships
+
controlled definitions
+
user/context memory
+
permission enforcement
+
source evidence
```

to provide the Company Brain experience.

---

# 100. Final Engineering Principle

Build the product in layers:

```text
Reliable ingestion
        ↓
Reliable retrieval
        ↓
Reliable permissions
        ↓
Reliable evidence
        ↓
Useful UI
        ↓
Knowledge governance
        ↓
Agent platform
```

Do not build autonomous execution on top of unreliable context.

---

# 101. Final Product Principle

The user sees:

> **Ask your company.**

Underneath:

```text
Cache
Memory
Contextualization
Intent
BM25
Vector
RRF
Rerank
CRAG
Graph
Fusion
Rerank
LLM
SSE
Memory update
```

That complexity is the product's infrastructure, not the user's burden.

---

# 102. Definition of Done

This technical bridge is complete when:

```text
[ ] Architecture source of truth is explicit.
[ ] Ingestion workflow is preserved.
[ ] Retrieval workflow is preserved.
[ ] Model responsibilities are preserved.
[ ] Supabase responsibilities are preserved.
[ ] Neo4j responsibilities are preserved.
[ ] Security boundary is explicit.
[ ] Frontend/backend boundary is explicit.
[ ] UI ↔ backend mapping exists.
[ ] API boundary is defined conceptually.
[ ] Evidence flow is defined.
[ ] Permission flow is defined.
[ ] Agent/MCP boundary is defined.
[ ] Technical testing strategy exists.
[ ] Architecture change process exists.
```

---

# 103. Canonical Technical Statement

> **CognitRAG is a Company Brain architecture that combines document and structured-data ingestion, semantic extraction, vector retrieval, hybrid search, reranking, selective knowledge-graph expansion, context fusion, generation, memory, and permission-aware access into a unified enterprise semantic layer.**

This statement should remain technically aligned with the architecture source of truth.
