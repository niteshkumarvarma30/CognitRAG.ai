# 12 — CognitRAG Ingestion Pipeline Specification
## Source → Memory: Document Processing, Semantic Extraction, Vector Storage & Graph Construction

> **Status:** Master ingestion-pipeline specification.
>
> **Technical source of truth:** `Architecture(1).md`
>
> **Data model dependency:** `11_DATA_MODEL.md`
>
> **Product dependency:** `09_TECHNICAL_PRODUCT_ARCHITECTURE_AND_WORKFLOW.md`
>
> **Purpose:** Preserve and formalize the existing CognitRAG ingestion workflow from enterprise source data to vector memory and semantic graph representation.

---

# 1. Ingestion Objective

The ingestion pipeline transforms raw enterprise information into a representation that CognitRAG can query semantically and structurally.

The canonical flow is:

```text
RAW SOURCE
    ↓
PARSING / NORMALIZATION
    ↓
PARENT CHUNKING
    ↓
PRONOUN RESOLUTION
    ↓
GRAPH EXTRACTION
    ↓
NEO4J
    ↓
CHILD CHUNKING
    ↓
EMBEDDING
    ↓
SUPABASE / PGVECTOR
```

The pipeline creates two complementary representations:

```text
VECTOR MEMORY
Precise semantic retrieval

+

SEMANTIC GRAPH
Entities, relationships, ontology, business semantics
```

---

# 2. Existing Architecture — Source of Truth

The current architecture specifies:

```text
PDF/Document Parsing
→ pymupdf4llm

Parent Chunking
→ RecursiveCharacterTextSplitter
→ approximately 2000 characters

Pronoun Resolution
→ llama-3.1-8b-instant
→ Groq

Graph Extraction
→ gpt-4o-mini
→ instructor

Graph Storage
→ Neo4j

Child Chunking
→ approximately 400 characters

Embedding
→ jina-embeddings-v4

Vector Storage
→ Supabase PostgreSQL + pgvector
```

These are the existing architectural components and should not be silently substituted.

---

# 3. Ingestion Inputs

Supported conceptual inputs:

```text
PDF
Document
Google Workspace content
Slack content
Jira content
Salesforce content
```

The architecture specifically identifies Google Workspace, Slack, Jira, and Salesforce as structured integrations.

Additional connectors can be added later.

---

# 4. Connector Boundary

A connector is responsible for obtaining source data.

```text
External System
      ↓
Connector
      ↓
Normalized Source Object
      ↓
Ingestion Pipeline
```

The connector should not need to understand:

```text
embedding
reranking
answer generation
```

Its responsibility is acquisition and source metadata.

---

# 5. Source Provenance

Every ingested object should preserve source identity where available:

```text
workspace
source
external ID
source type
source URL/reference
created timestamp
updated timestamp
permission/scope metadata
```

The exact schema follows `11_DATA_MODEL.md`.

---

# 6. Ingestion Pipeline — High-Level

```text
1. Acquire source data
2. Normalize source representation
3. Parse documents when necessary
4. Create parent chunks
5. Resolve ambiguous references
6. Extract semantic entities/relationships
7. Merge semantic graph
8. Create child chunks
9. Generate embeddings
10. Store vector representation
11. Persist provenance
12. Mark ingestion status
```

---

# 7. Stage 1 — Source Acquisition

Source data arrives from:

```text
Documents
Slack
Jira
GitHub if connected
Google Workspace
Salesforce
```

The connector supplies:

```text
content
source metadata
external identifier
timestamps
scope/permission metadata
```

---

# 8. Acquisition Requirements

The pipeline should preserve:

```text
Source identity
External item ID
Original timestamps
External URL
Content type
Access metadata
```

Do not discard source identity during normalization.

---

# 9. Stage 2 — Normalization

Different sources have different formats.

Normalize them into a common source-oriented representation while preserving provider-specific metadata.

Conceptual:

```text
Slack Message
Jira Issue
PDF
Google Document

        ↓

Normalized Source Item
```

Normalization must not destroy information needed for provenance or authorization.

---

# 10. Document Parsing

For PDF/document ingestion, the existing architecture uses:

```text
pymupdf4llm
```

Pipeline:

```text
Raw PDF
   ↓
pymupdf4llm
   ↓
Structured Markdown
```

The objective is to produce a representation suitable for semantic processing and chunking.

---

# 11. Parsing Requirements

The parsed representation should preserve useful document structure where available:

```text
Headings
Paragraphs
Lists
Tables where supported
Section ordering
```

The exact parser behavior must follow the implementation.

---

# 12. Parsing Failure

If parsing fails:

```text
Source
 ↓
Parsing failure
 ↓
Ingestion status = failed
 ↓
Record error
```

Do not silently index incomplete or corrupted content as if parsing succeeded.

---

# 13. Stage 3 — Parent Chunking

The architecture uses:

```text
RecursiveCharacterTextSplitter
```

with approximately:

```text
2000-character parent chunks
```

Purpose:

> Preserve broad contextual meaning.

---

# 14. Parent Chunk Structure

Conceptual:

```text
ParentChunk
├── parent_chunk_id
├── workspace_id
├── source_item_id / document_id
├── text
├── chunk_index
├── metadata
├── created_at
└── updated_at
```

---

# 15. Parent Chunk Example

```text
Document

Section:
Billing Deployment

        ↓

Parent Chunk 1
~2000 characters

Parent Chunk 2
~2000 characters

Parent Chunk 3
~2000 characters
```

Parent chunks remain the broader generation context.

---

# 16. Why Parent Chunks Exist

The architecture intentionally preserves large context.

The purpose is:

```text
Precise retrieval
        +
Broader generation context
```

The smaller child chunk can identify the relevant region while the parent supplies more surrounding information.

---

# 17. Stage 4 — Pronoun Resolution

The architecture uses:

```text
llama-3.1-8b-instant
Provider:
Groq
```

Function:

> Resolve vague references such as "it", "they", or similar context-dependent references into more explicit references before later semantic and retrieval processing.

---

# 18. Pronoun Resolution Flow

```text
Parent Chunk
      ↓
llama-3.1-8b-instant
      ↓
Resolved Text
```

Example:

```text
Original:

"It caused the deployment to fail."

Context:

"INC-902 affected the billing migration.
It caused the deployment to fail."

        ↓

Resolved:

"INC-902 caused the billing deployment to fail."
```

The actual output depends on the model and prompt.

---

# 19. Pronoun Resolution Safety

A resolution should not invent entities that do not have sufficient contextual support.

Where ambiguity remains:

```text
Preserve uncertainty
```

rather than forcing an unsupported substitution.

The exact behavior must be encoded in the implementation.

---

# 20. Stage 5 — Graph Extraction

The resolved parent chunk is passed to:

```text
gpt-4o-mini
```

using:

```text
instructor
```

The extraction target is:

```text
Entities
+
Relationships
```

---

# 21. Entity Extraction

Potential entity categories:

```text
Person
Customer
Service
Application
Incident
Project
Document
Decision
SOP
Term
```

The actual supported ontology should remain aligned with the Neo4j implementation.

---

# 22. Relationship Extraction

Potential relationships:

```text
OWNS
DEPENDS_ON
AFFECTED_BY
DECIDED_BY
DOCUMENTED_BY
CHANGED_BY
RELATED_TO
```

These are examples of semantic relationship types.

The final list belongs to the graph schema.

---

# 23. Graph Extraction Output

Conceptually:

```json
{
  "entities": [
    {
      "name": "Billing Service",
      "type": "service"
    },
    {
      "name": "INC-902",
      "type": "incident"
    }
  ],
  "relationships": [
    {
      "source": "Billing Service",
      "type": "AFFECTED_BY",
      "target": "INC-902"
    }
  ]
}
```

The production schema should use structured validation.

---

# 24. Structured Extraction

The use of `instructor` should constrain extraction into the expected schema rather than relying on arbitrary free-form model output.

Expected benefits:

```text
Predictable structure
Validation
Easier persistence
Reduced parsing ambiguity
```

---

# 25. Graph Merge

Extracted entities and relationships are merged into:

```text
Neo4j
```

The system should avoid creating unnecessary duplicates where the same semantic entity already exists.

---

# 26. Entity Resolution

Example:

```text
Slack:
billing

Jira:
Billing Service

GitHub:
billing-service

        ↓

Canonical Entity:
Billing Service
```

Entity identity and deduplication should be handled carefully.

---

# 27. Entity Resolution Principle

Source labels are not necessarily canonical company identities.

The graph should distinguish:

```text
External reference
```

from:

```text
Company semantic entity
```

---

# 28. Entity Merge Safety

Automatic merging is potentially destructive.

For high-impact cases:

```text
Possible duplicate
 ↓
Validate
 ↓
Merge or keep separate
```

Do not silently merge ambiguous entities.

---

# 29. Stage 6 — Child Chunking

After graph extraction:

```text
Resolved Parent Chunk
       ↓
Child Chunking
       ↓
approximately 400-character children
```

Purpose:

> Provide precise mathematical retrieval units.

---

# 30. Child Chunk Structure

Conceptual:

```text
ChildChunk
├── child_chunk_id
├── parent_chunk_id
├── workspace_id
├── text
├── position
├── metadata
├── source reference
└── timestamps
```

---

# 31. Parent/Child Relationship

```text
Parent Chunk A
├── Child 1
├── Child 2
├── Child 3
└── Child 4
```

This relationship must remain available during retrieval.

---

# 32. Stage 7 — Embedding

The architecture uses:

```text
jina-embeddings-v4
```

Input:

```text
Child chunk text
```

Output:

```text
Dense vector
```

---

# 33. Embedding Storage

Vectors are stored in:

```text
Supabase PostgreSQL
+
pgvector
```

The vector remains associated with:

```text
child chunk
workspace
source
metadata
```

---

# 34. Embedding Model Metadata

Where practical, persist:

```text
model name
model version if available
embedding dimension
created_at
```

This helps future migrations and evaluation.

---

# 35. Vector Index

The retrieval architecture uses:

```text
HNSW
```

for vector search.

Index configuration is an engineering concern.

The ingestion pipeline should ensure that new vectors become available to the configured vector index according to database behavior.

---

# 36. Metadata

Every retrievable chunk should retain useful metadata.

Potential:

```text
workspace_id
source_id
source_item_id
document_id
parent_chunk_id
external_reference
source_timestamp
entities
permissions/scope
```

Only store metadata necessary for retrieval, provenance, and authorization.

---

# 37. Entity Metadata

The retrieval pipeline later inspects surviving chunk metadata for extracted entities.

Therefore the vector-side representation needs a reliable entity reference.

Conceptually:

```text
Child Chunk
 ↓
entities = [Billing Service, INC-902]
```

---

# 38. Permissions at Ingestion

Permission metadata should be carried forward from the source.

Conceptually:

```text
Source Permission
       ↓
Source Item
       ↓
Chunk Metadata
       ↓
Retrieval Authorization
```

The exact enforcement boundary is defined by the security architecture.

---

# 39. Important Security Rule

Adding permission metadata to a vector record is not by itself sufficient security.

The actual security boundary must remain:

```text
Supabase RLS / backend authorization
```

according to the existing architecture.

---

# 40. Stage 8 — Persistence

At the end of successful ingestion:

```text
SUPABASE
- source data
- chunks
- embeddings
- metadata

NEO4J
- entities
- relationships
- semantic dictionary / ontology
```

---

# 41. Ingestion Completion

A source item is considered successfully ingested only when the required pipeline stages complete according to the implementation.

Conceptual:

```text
Parse ✓
Parent Chunk ✓
Resolution ✓
Graph ✓
Child Chunk ✓
Embedding ✓
Storage ✓

Status:
Complete
```

---

# 42. Partial Ingestion

If the implementation allows partial processing:

```text
Status:
Partial
```

with a recorded failure reason.

Do not silently label incomplete processing as complete.

---

# 43. Ingestion Job

Each synchronization process should have a job representation.

Conceptual:

```text
sync_id
source_id
status
started_at
completed_at
processed
total
error
```

---

# 44. Ingestion Status

Recommended:

```text
queued
running
completed
partial
failed
cancelled
```

---

# 45. Progress

Where measurable:

```text
12,842 / 25,532
```

The frontend should receive:

```text
processed
total
status
```

without exposing internal implementation details unnecessarily.

---

# 46. Idempotency

The same source object may be delivered more than once.

The ingestion system should use stable external identifiers where available:

```text
provider
+
external_id
```

to avoid duplicate records.

---

# 47. Duplicate Event Handling

Example:

```text
Same Slack event arrives twice.

First:
Process.

Second:
Recognize already processed.

Skip / update according to event semantics.
```

---

# 48. Update Handling

When source content changes:

```text
Source update
 ↓
Identify affected item
 ↓
Reprocess representation
 ↓
Update parent/child chunks
 ↓
Update embeddings
 ↓
Update graph entities/relationships
```

The exact incremental strategy depends on connector behavior.

---

# 49. Delete Handling

When a source object is deleted:

```text
Deletion event
 ↓
Mark / remove source representation
 ↓
Ensure it is no longer retrievable
 ↓
Update affected graph relationships
```

The exact retention behavior depends on product policy.

---

# 50. Permission Revocation

If source access is revoked:

```text
Permission change
 ↓
Update access state
 ↓
Prevent unauthorized retrieval
```

The system must ensure previously indexed content does not bypass the current authorization rules.

---

# 51. Re-Embedding

If the embedding model changes:

```text
Existing child chunks
       ↓
New model
       ↓
New embeddings
```

Do not silently mix incompatible embeddings in the same retrieval index unless the architecture explicitly supports it.

---

# 52. Re-Processing

If extraction prompts/models change:

```text
Existing source content
 ↓
New processing version
 ↓
Updated graph / chunks
```

Store enough version information to understand how knowledge was generated.

---

# 53. Processing Versioning

Potential metadata:

```text
parser_version
chunking_version
resolution_model
extraction_model
embedding_model
```

This is useful for evaluation and migrations.

---

# 54. Source Lineage

The pipeline should support:

```text
Answer
 ↓
Citation
 ↓
Source Item
 ↓
Parent Chunk
 ↓
Child Chunk
 ↓
Embedding
```

and:

```text
Answer
 ↓
Graph Path
 ↓
Entity
 ↓
Relationship
 ↓
Source Evidence
```

---

# 55. Ingestion → Retrieval Connection

The ingestion pipeline directly determines what retrieval can discover.

```text
Good ingestion
 ↓
Good chunk metadata
 ↓
Good embeddings
 ↓
Good graph
 ↓
Better retrieval context
```

This is why ingestion quality is a first-class product concern.

---

# 56. Ingestion → Graph Connection

Graph extraction should produce relationships that can later support:

```text
Entity lookup
Relationship exploration
Graph retrieval
Decision context
Source traceability
```

---

# 57. Ingestion → Vector Connection

Child chunking and embeddings support:

```text
Semantic search
Exact + semantic hybrid retrieval
Reranking
```

---

# 58. Ingestion Quality Requirements

The pipeline should preserve:

```text
Context
Provenance
Entity identity
Relationship identity
Permissions
Timestamps
Chunk hierarchy
```

---

# 59. Content Quality

The pipeline should avoid indexing:

```text
Corrupted documents
Empty chunks
Unparseable garbage
Duplicate records
Obvious credential/secrets where filtering is implemented
```

The exact filtering behavior should match the active security/data-sanitization implementation.

---

# 60. PII / Secret Handling

The broader architecture identifies PII and secret filtering as an enterprise security concern.

For the ingestion implementation, define explicitly:

```text
What is detected?
What is removed?
What is masked?
What is retained?
Where is filtering performed?
```

Do not claim a filtering capability is complete unless it is implemented and tested.

---

# 61. Sensitive Source Handling

Sources such as:

```text
HR
Legal
Finance
M&A
```

may require narrower access.

The ingestion system should retain enough scope information for downstream authorization.

---

# 62. Ingestion Monitoring

Track:

```text
Items processed
Items failed
Processing duration
Embedding failures
Graph extraction failures
Provider API failures
Authorization failures
```

---

# 63. Ingestion Error Categories

Recommended:

```text
SOURCE_UNAVAILABLE
AUTHORIZATION_ERROR
PARSING_ERROR
NORMALIZATION_ERROR
CHUNKING_ERROR
EXTRACTION_ERROR
EMBEDDING_ERROR
DATABASE_ERROR
GRAPH_ERROR
UNKNOWN_ERROR
```

---

# 64. Retry Policy

Retries should be used for transient failures.

Examples:

```text
Temporary provider timeout
Temporary model error
Temporary database connectivity
```

Do not repeatedly retry permanent validation or authorization failures.

---

# 65. Backoff

Transient retries should use bounded backoff.

The exact policy belongs in infrastructure configuration.

---

# 66. Dead-Letter / Failed Items

For unrecoverable items, maintain an observable failed state:

```text
Item
Status:
Failed

Reason:
Parsing error

[ Retry ]
```

Do not lose failed source records silently.

---

# 67. Reprocessing Failed Items

Authorized admin/developer users should eventually be able to:

```text
Retry
Reprocess
Inspect error
```

The exact UI can come later.

---

# 68. Batch Processing

The pipeline should support batch ingestion where appropriate.

But batch size should be bounded to avoid:

```text
memory spikes
provider rate-limit problems
transaction failures
```

---

# 69. Concurrency

Different source items can often be processed concurrently.

However, shared constraints must be respected:

```text
LLM rate limits
Embedding rate limits
Provider limits
Database capacity
```

---

# 70. Backpressure

If downstream systems become saturated:

```text
Connector
 ↓
Queue
 ↓
Workers
 ↓
Storage
```

The exact queue architecture can evolve with scale.

Do not introduce Kafka solely because the architecture could eventually need it.

---

# 71. MVP Ingestion Architecture

For the initial startup:

```text
Connector
 ↓
FastAPI / background job
 ↓
Parser / normalizer
 ↓
Parent chunk
 ↓
Pronoun resolution
 ↓
Graph extraction
 ↓
Neo4j
 ↓
Child chunk
 ↓
Embedding
 ↓
Supabase
```

This is sufficient to validate the core product.

---

# 72. Scale-Up Ingestion Architecture

At higher scale, the system may evolve toward:

```text
Providers
 ↓
Webhook / Change Events
 ↓
Queue / Stream
 ↓
Worker Pool
 ↓
Processing Pipeline
 ↓
Supabase + Neo4j
```

The current architecture lists Kafka/Kinesis as possible event-streaming infrastructure in the broader enterprise design. That should remain an evolution path rather than an MVP requirement.

---

# 73. Real-Time Updates

For sources that provide events:

```text
Source Event
 ↓
Identify changed item
 ↓
Incremental ingestion
 ↓
Update graph/vector
```

This avoids unnecessary full reprocessing.

---

# 74. Initial Full Sync

When a source is connected:

```text
Connect
 ↓
Initial scan
 ↓
Process items
 ↓
Build knowledge
 ↓
Mark source healthy
```

---

# 75. Incremental Sync

After initial sync:

```text
New / changed item
 ↓
Process only changed content
```

This reduces cost and latency.

---

# 76. Connector Abstraction

Use a common connector interface conceptually:

```text
connect()
authorize()
discover()
fetch()
normalize()
get_changes()
get_permissions()
disconnect()
```

Actual methods depend on implementation.

---

# 77. Source Adapter

Each provider maps into a common model:

```text
SlackAdapter
JiraAdapter
GitHubAdapter
GoogleWorkspaceAdapter
SalesforceAdapter
```

The ingestion pipeline consumes normalized data.

---

# 78. Connector Expansion

Adding a new connector should primarily require:

```text
provider authentication
provider fetch/change handling
normalization
permission mapping
```

The downstream:

```text
chunking
graph extraction
embedding
storage
```

should remain reusable.

---

# 79. Ingestion Data Contract

Normalized item should conceptually contain:

```text
workspace_id
source_id
external_id
item_type
content
title/subject
external_url
created_at
updated_at
permissions
metadata
```

---

# 80. Document Data Contract

Document-oriented input adds:

```text
mime_type
raw reference
parsed content
page/section metadata where available
```

---

# 81. Chunk Data Contract

Parent:

```text
parent_chunk_id
source reference
text
index
metadata
```

Child:

```text
child_chunk_id
parent_chunk_id
text
index
metadata
```

---

# 82. Graph Data Contract

Entity:

```text
entity_id
type
name
workspace
metadata
source references
```

Relationship:

```text
relationship_id
source_entity
type
target_entity
evidence
timestamps
```

---

# 83. Embedding Data Contract

```text
embedding_id
child_chunk_id
model
vector
created_at
```

---

# 84. Ingestion Completion Contract

A completed item should be observable through:

```text
status
processed_at
source reference
processing version
```

---

# 85. Consistency Considerations

Graph and vector updates are separate storage operations.

Therefore the ingestion workflow should account for cases such as:

```text
Graph updated
Vector failed

or

Vector updated
Graph failed
```

The system must decide whether to:

```text
retry
mark partial
rollback
```

according to implementation policy.

---

# 86. Partial State

Do not present partially processed knowledge as fully synchronized.

Possible state:

```text
partial
```

with an actionable error.

---

# 87. Transaction Boundary

Supabase and Neo4j are separate systems.

A single cross-database atomic transaction should not be assumed.

The ingestion job must therefore track progress explicitly.

---

# 88. Reconciliation

A future reconciliation process can compare:

```text
Expected source items
vs
Indexed items
vs
Graph entities
```

and identify inconsistencies.

---

# 89. Ingestion Health

Source health can be summarized as:

```text
Healthy
Needs attention
Paused
Error
```

Underlying reasons should be inspectable by authorized users.

---

# 90. Quality Gates

Before an item is considered usable:

```text
[ ] Content is parseable.
[ ] Chunk exists.
[ ] Provenance exists.
[ ] Permissions are associated.
[ ] Embedding exists where required.
[ ] Graph extraction completed where required.
```

The required set depends on source/type.

---

# 91. Ingestion Testing

Test:

```text
PDF parsing
Slack message
Jira issue
Structured source
Duplicate item
Updated item
Deleted item
Permission change
Malformed content
Provider timeout
Model failure
Embedding failure
Graph failure
```

---

# 92. Golden Ingestion Dataset

Maintain a small deterministic test corpus.

Example:

```text
billing.pdf
billing Slack thread
BILL-902
PR #1287
```

Expected:

```text
Entities
Relationships
Chunks
Vectors
Provenance
```

This becomes a regression suite.

---

# 93. Ingestion Regression

When changing:

```text
parser
chunk size
prompt
model
embedding
graph extraction
```

rerun the golden dataset.

Compare:

```text
entity quality
relationship quality
retrieval quality
cost
latency
```

---

# 94. Ingestion Evaluation

Measure:

```text
Parsing success rate
Chunk coverage
Entity precision
Relationship precision
Embedding success rate
Duplicate rate
Processing latency
```

Exact metrics should be established with a labeled evaluation dataset.

---

# 95. Cost Monitoring

Track:

```text
Pronoun-resolution calls
Graph-extraction calls
Embedding volume
Database writes
```

This informs future architecture optimization.

---

# 96. Model Failure Handling

If:

```text
llama-3.1-8b-instant
```

fails during resolution:

```text
Retry / fallback / fail item
```

must be explicitly defined.

Do not silently substitute a different model without recording the behavior if consistency matters.

---

# 97. Model Versioning

Store model/configuration metadata where necessary.

This allows:

```text
Why does this entity look different now?
```

to be answered during evaluation and debugging.

---

# 98. Source Permission Propagation

The ideal conceptual lineage is:

```text
Source permission
       ↓
Source item
       ↓
Document
       ↓
Chunk
       ↓
Retrieval metadata
       ↓
Authorized answer
```

This is critical for enterprise deployment.

---

# 99. Ingestion Security Boundary

The ingestion system should ensure that:

```text
unauthorized source content
```

cannot become broadly accessible simply because it was indexed.

The exact enforcement mechanism must align with Supabase RLS and backend authorization.

---

# 100. Final Ingestion Workflow

```text
                         SOURCE
                           │
                ┌──────────┴──────────┐
                │                     │
           Documented              Structured
                │                     │
                ▼                     ▼
          pymupdf4llm             Connector
                │                     │
                └──────────┬──────────┘
                           ▼
                     NORMALIZATION
                           │
                           ▼
                  PARENT CHUNKING
                    ~2000 chars
                           │
                           ▼
                 PRONOUN RESOLUTION
               llama-3.1-8b-instant
                           │
                  ┌────────┴────────┐
                  │                 │
                  ▼                 ▼
          GRAPH EXTRACTION     CHILD CHUNKING
           gpt-4o-mini          ~400 chars
                  │                 │
                  ▼                 ▼
               NEO4J          JINA EMBEDDINGS v4
                                    │
                                    ▼
                              SUPABASE PGVECTOR
```

---

# 101. Final Ingestion → Retrieval Handoff

At completion:

```text
SUPABASE

Child chunks
Embeddings
Metadata
Source records
Permissions

+

NEO4J

Entities
Relationships
Dictionary
Ontology
Business semantics
```

This produces the knowledge substrate used by the retrieval pipeline.

---

# 102. Final Product Meaning

Technically:

> The ingestion pipeline creates complementary vector and graph representations of enterprise information.

Product-wise:

> **The Company Brain is learning how the company works.**

---

# 103. Definition of Done

The ingestion system is ready for MVP when:

```text
[ ] At least one source can be connected.
[ ] Source provenance is preserved.
[ ] Documents can be parsed.
[ ] Parent chunks are created.
[ ] Pronoun resolution executes.
[ ] Entities/relationships are extracted.
[ ] Neo4j is updated.
[ ] Child chunks are created.
[ ] Embeddings are generated.
[ ] Supabase stores vectors.
[ ] Metadata links chunks to sources.
[ ] Permissions are preserved/enforced.
[ ] Duplicate handling exists.
[ ] Update handling exists.
[ ] Basic failure handling exists.
[ ] Sync status is visible.
[ ] Golden ingestion tests exist.
[ ] Monitoring exists.
```

---

# 104. Final Ingestion Principle

> **Do not optimize ingestion only for storing more data. Optimize it for producing higher-quality, provenance-preserving semantic context that the retrieval pipeline can trust and use.**
