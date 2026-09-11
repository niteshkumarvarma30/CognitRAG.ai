# 11 — CognitRAG Data Model
## Company Brain Data Structures, Storage Boundaries, Relationships & Governance

> **Status:** Master data-model specification.
>
> **Technical source of truth:** `Architecture(1).md`
>
> **API dependency:** `10_API_CONTRACTS.md`
>
> **Purpose:** Define the core objects that CognitRAG stores and how those objects move between Supabase/PostgreSQL + pgvector and Neo4j.
>
> **Important:** This document preserves the existing architecture. It separates source-backed records, vector retrieval data, semantic graph data, user memory, and future product objects instead of collapsing everything into a single database model.

---

# 1. Data Architecture Objective

CognitRAG has two primary knowledge stores:

```text
SUPABASE / POSTGRESQL
        +
PGVECTOR

Used for:
- source-backed content
- chunks
- embeddings
- metadata
- user memory
- access-controlled retrieval
```

and:

```text
NEO4J

Used for:
- entities
- relationships
- semantic dictionary
- ontology
- graph-based business logic
```

The product combines the two during retrieval.

---

# 2. Storage Responsibility

The simplest mental model is:

```text
SUPABASE
"What text/context can I retrieve?"

NEO4J
"How are the important things related?"

COGNITRAG
"How do I combine both to answer the question?"
```

---

# 3. Core Object Hierarchy

```text
Workspace
│
├── Users
│
├── Sources
│   ├── Source Items
│   ├── Chunks
│   └── Embeddings
│
├── Knowledge
│   ├── Entities
│   ├── Relationships
│   ├── Dictionary Terms
│   ├── SOPs
│   └── Decisions
│
├── Conversations
│   ├── Messages
│   └── Answers
│       └── Citations
│
├── Activity
│
└── Security
    ├── Roles
    ├── Permissions
    └── Audit Events
```

Future:

```text
Skills
Agents
Agent Runs
MCP Connections
```

---

# 4. Workspace

The workspace is the primary tenant boundary.

Conceptual fields:

```text
workspace_id
name
created_at
updated_at
```

A workspace owns:

```text
users
sources
knowledge
conversations
permissions
activity
```

---

# 5. Workspace Isolation

Every workspace-scoped record must be attributable to a workspace directly or through an owned relationship.

Conceptual:

```text
Workspace A
   ↓
Knowledge A

Workspace B
   ↓
Knowledge B
```

No cross-workspace retrieval should be possible.

---

# 6. User

A user represents a person interacting with CognitRAG.

Conceptual fields:

```text
user_id
workspace_id
external_identity_id
name
email
role
status
created_at
updated_at
```

Identity-provider-specific data should remain with the authentication system where appropriate.

---

# 7. User Role

Initial role model:

```text
Admin
Member
Viewer
```

Future roles can be introduced when customer requirements justify them.

---

# 8. User Status

Potential states:

```text
invited
active
suspended
revoked
```

The exact lifecycle should align with the authentication provider.

---

# 9. Source

A Source represents a connected external information system.

Examples:

```text
Slack
GitHub
Jira
Google Workspace
Salesforce
```

Conceptual fields:

```text
source_id
workspace_id
provider
display_name
status
external_account_id
created_at
updated_at
last_sync_at
```

---

# 10. Source Status

Possible:

```text
disconnected
connecting
connected
syncing
healthy
paused
authorization_required
error
```

---

# 11. Source Scope

A source may have an explicit scope.

Conceptual:

```text
source_id
scope_mode
included_resources
excluded_resources
```

Examples:

```text
Slack
43 included channels
7 excluded channels
```

The exact representation is connector-specific.

---

# 12. Source Permissions

Source access should preserve information required for authorization.

Possible metadata:

```text
source identity
external resource ID
scope
access mode
principal mapping
```

Do not store secrets as ordinary source metadata.

---

# 13. Source Item

A Source Item is a unit of external content.

Examples:

```text
Slack message/thread
Jira issue
GitHub PR
Google document
PDF
Notion page
```

Conceptual fields:

```text
item_id
workspace_id
source_id
external_id
item_type
title / subject where applicable
content
external_url
created_at
updated_at
source_timestamp
```

The actual normalized schema should accommodate different connector types.

---

# 14. Source Provenance

Every source-backed item should preserve provenance such as:

```text
source
external identifier
source type
source timestamp
external location
workspace
permissions
```

This supports traceability and citations.

---

# 15. Document

A Document is a normalized source object where document-oriented processing applies.

Examples:

```text
PDF
Google document
Notion page
Markdown document
```

Potential fields:

```text
document_id
source_id
workspace_id
title
mime_type
content
external_url
created_at
updated_at
```

---

# 16. Parsed Document

For PDFs/documents:

```text
Raw PDF
   ↓
pymupdf4llm
   ↓
Structured Markdown
```

The parsed representation should remain traceable to its source document.

---

# 17. Parent Chunk

The existing architecture uses parent chunking at approximately:

```text
2000 characters
```

Purpose:

> Preserve broader context for later generation.

Conceptual fields:

```text
parent_chunk_id
document_id / source_item_id
workspace_id
text
chunk_index
source_metadata
created_at
updated_at
```

---

# 18. Child Chunk

The existing architecture then creates approximately:

```text
400-character child chunks
```

Purpose:

> Enable precise retrieval.

Relationship:

```text
Parent Chunk
    │
    ├── Child Chunk 1
    ├── Child Chunk 2
    └── Child Chunk 3
```

---

# 19. Child Chunk Storage

Conceptual fields:

```text
child_chunk_id
parent_chunk_id
workspace_id
text
position
metadata
created_at
updated_at
```

The child chunk is the primary semantic retrieval unit.

---

# 20. Decoupled Retrieval Context

The architecture intentionally separates:

```text
CHILD CHUNK
→ retrieval representation

PARENT CHUNK
→ broader context representation
```

Conceptually:

```text
Query
 ↓
Child vector retrieval
 ↓
Child identifies relevant parent
 ↓
Parent context supplied to generation
```

This design should remain explicit in the data model.

---

# 21. Embedding

An embedding represents the child chunk's vector.

Conceptual:

```text
embedding_id
child_chunk_id
model_name
vector
created_at
```

The current architecture uses:

```text
jina-embeddings-v4
```

for dense embedding generation.

---

# 22. Embedding Metadata

Potential:

```text
model_name
model_version where available
embedding_dimension
created_at
```

Do not unnecessarily duplicate raw model-specific metadata.

---

# 23. Vector Index

Supabase/PostgreSQL + pgvector supports:

```text
dense vector search
```

The current retrieval architecture also uses:

```text
HNSW
```

for vector retrieval.

Index configuration is an engineering concern, not part of normal user-facing data.

---

# 24. Keyword Retrieval

The architecture also uses:

```text
BM25
```

for keyword retrieval.

Keyword-search configuration should remain close to the database/search implementation rather than being exposed as a user-facing object.

---

# 25. Search Result

A retrieval candidate is conceptually:

```text
child_chunk
+
semantic score
+
keyword score
+
metadata
```

The API can transform this into a product-level result.

Do not expose internal ranking mechanics by default.

---

# 26. RRF Result

The architecture fuses the:

```text
BM25 results
+
HNSW vector results
```

through:

```text
Reciprocal Rank Fusion
```

The resulting candidate list is a retrieval-stage representation, not permanent company knowledge.

---

# 27. Rerank Result

The first reranker produces:

```text
candidate
+
rerank score
```

Only retained items proceed.

The second reranker operates after graph context has been added.

These are temporary retrieval artifacts unless logging is deliberately enabled for evaluation/debugging.

---

# 28. Entity

An Entity is a meaningful object represented in the semantic graph.

Examples:

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
Skill
```

Conceptual Neo4j properties:

```text
entity_id
entity_type
name
workspace_id
metadata
created_at
updated_at
```

The actual graph schema can use labels appropriate to Neo4j.

---

# 29. Entity Identity

Entity identity is different from source identity.

Example:

```text
Slack:
"Billing"

GitHub:
"billing-service"

Jira:
"Billing Service"

        ↓

Company Entity
"Billing Service"
```

Entity resolution creates a semantic identity across source systems.

---

# 30. Entity Source Links

An entity should be traceable to supporting source objects.

Conceptually:

```text
Entity
  ↓
mentioned_in
  ↓
Source Item
```

This helps provide evidence.

---

# 31. Relationship

A Relationship connects two entities.

Examples:

```text
depends_on
owned_by
affected_by
decided_by
documented_by
changed_by
related_to
```

Conceptual:

```text
source_entity
relationship_type
target_entity
workspace_id
evidence
timestamps
```

---

# 32. Relationship Direction

Where meaningful, relationships should have explicit direction.

Example:

```text
Billing Service
     ↓
depends_on
     ↓
Payment API
```

Avoid ambiguous relationships where directional semantics matter.

---

# 33. Relationship Provenance

Important relationships should have evidence.

Conceptually:

```text
Relationship
     ↓
Evidence source
```

Example:

```text
Billing Service
→ affected_by
→ INC-902

Evidence
Jira BILL-902
```

---

# 34. Relationship Temporal Data

Where supported, preserve:

```text
first_seen
last_seen
valid_from
valid_to
```

This enables historical questions.

Do not invent temporal semantics if the underlying source cannot support them.

---

# 35. Neo4j Semantic Dictionary

The semantic dictionary is part of the graph/ontology layer.

Conceptual node:

```text
Term
 ├── name
 ├── definition
 ├── owner
 ├── version
 └── status
```

---

# 36. Semantic Definition

Example:

```text
Term
Churn Risk

Definition
Company-approved definition

Owner
Customer Success

Version
3
```

Definitions should be explicitly distinguishable from ordinary extracted text.

---

# 37. Semantic Dictionary Governance

Potential lifecycle:

```text
Draft
 ↓
Review
 ↓
Approved
 ↓
Active
 ↓
Deprecated
```

Authority to approve must follow workspace role/permission rules.

---

# 38. Ontology

The ontology represents meaningful company concepts and their relationships.

Conceptually:

```text
Customer
    ↓
has
    ↓
Subscription
    ↓
affected_by
    ↓
Incident
```

The ontology should remain intentionally controlled.

---

# 39. Business Logic

The architecture uses Neo4j for semantic/busines-logic-related ontology.

Business logic should distinguish:

```text
Authoritative rule
Suggested rule
Source observation
```

They are not equivalent.

---

# 40. Rule

A rule represents a condition or policy.

Conceptual:

```text
rule_id
workspace_id
name
condition
action / implication
status
version
owner
```

Rules may eventually be represented in graph structures.

---

# 41. Rule Example

```text
Rule

IF
infrastructure_outage = verified

THEN
refund_window = 45 days
```

This is an example of a structured business rule and should only become authoritative through the appropriate governance process.

---

# 42. Rule Evidence

Rules should connect to evidence:

```text
Rule
 ↓
Supported by
 ↓
Source / Decision / Policy
```

---

# 43. Decision

A Decision records an organizational choice.

Conceptual fields:

```text
decision_id
workspace_id
title
decision
reason
alternatives
owner
decision_date
status
```

---

# 44. Decision Example

```text
Decision

Use PostgreSQL for Billing Service

Reason
Transactional consistency and existing
operational expertise.

Alternatives
MySQL
DynamoDB
```

Evidence should be associated.

---

# 45. SOP

An SOP is current operational procedure knowledge.

Conceptual:

```text
sop_id
workspace_id
title
current_version
owner
status
content
created_at
updated_at
```

---

# 46. SOP Version

```text
sop_id
version
content
change_summary
created_at
created_by / approved_by
```

Do not overwrite historical versions when history is required.

---

# 47. SOP State

Potential:

```text
draft
review
current
stale
deprecated
```

---

# 48. Review Item

A Review Item represents a proposed knowledge change.

Conceptual:

```text
review_id
workspace_id
type
target_id
proposed_change
status
priority
created_at
reviewed_at
reviewer_id
```

---

# 49. Review Evidence

A review item should include or reference:

```text
source citations
related entities
supporting decisions
confidence/status
```

---

# 50. Review Lifecycle

```text
detected
 ↓
suggested
 ↓
review
 ↓
approved / rejected
 ↓
active / dismissed
```

---

# 51. Conversation

A conversation groups user messages and Brain answers.

Conceptual:

```text
conversation_id
workspace_id
user_id
title
created_at
updated_at
```

---

# 52. Message

A message represents:

```text
user message
assistant answer
system event where appropriate
```

Conceptual:

```text
message_id
conversation_id
role
content
created_at
```

Do not store sensitive internal reasoning.

---

# 53. Answer

An Answer is the generated product response.

Conceptual:

```text
answer_id
message_id
status
content
created_at
updated_at
```

---

# 54. Answer Status

Potential:

```text
complete
insufficient_evidence
conflicting
permission_limited
error
```

---

# 55. Citation

A Citation connects an answer to source evidence.

Conceptual:

```text
citation_id
answer_id
source_id / source_item_id
reference
updated_at
related_entity_ids
```

---

# 56. Answer → Citation Relationship

```text
Answer
 ├── cites → Jira BILL-902
 ├── cites → GitHub PR #1287
 └── cites → Slack #engineering
```

This supports the Source Receipt UI.

---

# 57. Graph Path

When graph retrieval materially contributes to an answer, preserve enough information to represent the relevant path.

Conceptual:

```text
answer_id
path_id
nodes[]
relationships[]
```

Do not expose full internal traversal data unless intended for user/debug use.

---

# 58. Answer Provenance

An answer can conceptually reference:

```text
sources
+
graph paths
+
timestamps
+
retrieval metadata
```

This creates an auditable answer receipt.

---

# 59. User Memory

The architecture loads Long-Term Memory from Supabase.

Conceptual:

```text
memory_id
user_id
workspace_id
memory_type
content
created_at
updated_at
status
```

---

# 60. Memory Types

Potential:

```text
preference
fact
working_context
summary
```

Use only types actually required by the product.

---

# 61. Memory Boundaries

User memory must not silently override authoritative company knowledge.

Recommended precedence concept:

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

This is a product-policy recommendation and must be implemented deliberately if adopted.

---

# 62. Rolling Conversation Summary

The architecture distills older messages into a rolling summary.

Conceptually:

```text
conversation_id
summary
updated_at
```

The summary supports contextualized follow-up questions.

---

# 63. Cache Record

The architecture uses:

```text
LRU in-memory cache
```

and a vector cache in Supabase.

Cache entries are operational artifacts, not permanent company knowledge.

Potential fields:

```text
cache_key
response / reference
created_at
expires_at
```

Avoid treating cached answers as authoritative knowledge.

---

# 64. Integration Sync Job

A sync operation can be represented as:

```text
sync_id
integration_id
status
started_at
completed_at
processed
total
error
```

---

# 65. Sync Job State

```text
queued
running
completed
failed
cancelled
partial
```

---

# 66. Activity Event

An Activity Event records important product changes.

Conceptual:

```text
activity_id
workspace_id
actor_id
event_type
resource_type
resource_id
timestamp
metadata
```

---

# 67. Audit Event

An Audit Event is a security/governance record.

Conceptual:

```text
audit_id
workspace_id
actor_id
action
resource_type
resource_id
timestamp
result
request_id
```

Examples:

```text
Role changed
Integration connected
Permission changed
SOP approved
Agent activated
```

---

# 68. Audit vs Activity

Keep distinct:

```text
ACTIVITY
Product-oriented timeline.

AUDIT
Security/governance record.
```

An event may appear in both systems with different detail.

---

# 69. Permission

A permission represents an authorization capability.

Examples:

```text
knowledge.read
knowledge.write
knowledge.approve
integration.manage
security.manage
agent.manage
```

Exact permission names should be standardized in the authorization layer.

---

# 70. Role-Permission Mapping

Conceptual:

```text
Admin
 ├── knowledge.read
 ├── knowledge.write
 ├── knowledge.approve
 ├── integration.manage
 └── security.manage

Member
 ├── knowledge.read
 └── ask

Viewer
 └── read
```

This is a conceptual model, not a final security policy.

---

# 71. Source Access Policy

In addition to application roles, source-specific access may matter.

Conceptually:

```text
User
 ↓
Workspace role
 ↓
Source permission
 ↓
Resource access
```

---

# 72. Data Access Principle

The system must not use the presence of a database record as proof that a user may access it.

Authorization must be evaluated.

---

# 73. Supabase Data Model

The relational side may contain tables conceptually similar to:

```text
workspaces
users / memberships
sources
source_items
documents
parent_chunks
child_chunks
embeddings
conversations
messages
answers
citations
user_memory
sync_jobs
activity_events
audit_events
```

Exact table names should follow the implementation repository.

---

# 74. Supabase RLS

Row Level Security should scope records appropriately.

Conceptually:

```text
workspace_id
+
authenticated principal
+
role / permission
```

The database should reject unauthorized records rather than depending solely on frontend filtering.

---

# 75. Neo4j Graph Data

Neo4j can conceptually represent:

```text
(:Person)
(:Customer)
(:Service)
(:Application)
(:Incident)
(:Project)
(:Document)
(:Decision)
(:SOP)
(:Skill)
(:Term)
```

and relationships such as:

```text
[:OWNS]
[:DEPENDS_ON]
[:AFFECTED_BY]
[:DECIDED_BY]
[:DOCUMENTED_BY]
[:CHANGED_BY]
[:RELATED_TO]
```

Exact labels and relationship types must follow the actual graph implementation.

---

# 76. Workspace in Neo4j

If graph data is multi-tenant, every graph object must be safely attributable to its workspace.

Possible approaches include:

```text
workspace property
```

or:

```text
separate graph / tenant boundary
```

The chosen implementation must guarantee tenant isolation.

---

# 77. Entity-Source Relationship

Recommended conceptual:

```text
Entity
  ↓
appears_in
  ↓
Source Item
```

Example:

```text
Billing Service
     ↓
appears_in
     ↓
PR #1287
```

---

# 78. Entity-Entity Relationship

```text
Billing Service
     ↓
depends_on
     ↓
Payment API
```

---

# 79. Entity-Decision Relationship

```text
Billing Service
     ↓
changed_by
     ↓
Decision
```

---

# 80. Entity-SOP Relationship

```text
Billing Service
     ↓
documented_by
     ↓
Billing Deployment SOP
```

---

# 81. Entity-Incident Relationship

```text
Billing Service
     ↓
affected_by
     ↓
INC-902
```

---

# 82. Source → Chunk Relationship

Conceptual:

```text
Source Item
 ↓
Document
 ↓
Parent Chunk
 ↓
Child Chunk
 ↓
Embedding
```

This establishes provenance from vector retrieval back to source.

---

# 83. Chunk → Entity Relationship

A child/parent chunk may have extracted entity metadata.

Conceptual:

```text
Chunk
 ↓
mentions
 ↓
Entity
```

This allows the retrieval pipeline to inspect surviving chunk entities before graph expansion.

---

# 84. Query-Time Knowledge Assembly

A user's answer context can be modeled as:

```text
Query
 ↓
Retrieved Child Chunks
 ↓
Parent Context
 ↓
Entities
 ↓
Graph Relationships
 ↓
Fused Context
 ↓
Answer
```

This is a runtime context assembly, not a permanent "answer object" in storage.

---

# 85. Cross-Source Entity Resolution

Example:

```text
Slack:
"billing"

Jira:
"BILL"

GitHub:
"billing-service"

        ↓

Same semantic entity:
Billing Service
```

This is important for Company Brain behavior.

---

# 86. Source Authority

Not all sources are necessarily equally authoritative.

Future data model may support:

```text
source_authority
```

or:

```text
knowledge_authority
```

Examples:

```text
Approved SOP
Official policy
Informal Slack comment
Historical document
```

Do not infer authority automatically unless the product defines a rule.

---

# 87. Freshness Metadata

Source-backed objects should support:

```text
created_at
updated_at
source_timestamp
```

where available.

This supports:

```text
current
historical
stale
```

classification.

---

# 88. Versioning

Versioned objects include:

```text
SOP
Decision
Semantic Definition
Skill
Agent
```

Version should be explicit.

Example:

```text
Billing SOP
v3.2
```

---

# 89. Soft Deletion

For historical/auditable objects, consider:

```text
deleted_at
```

rather than immediate physical deletion when business requirements require history.

The actual retention/deletion policy must be defined.

---

# 90. Source Deletion

Distinguish:

```text
Disconnect source
```

from:

```text
Delete indexed source data
```

These are separate product operations.

---

# 91. Retention

Define retention separately for:

```text
Source data
Chunks
Embeddings
Graph data
Conversations
User memory
Audit events
```

Do not assume one retention period is appropriate for everything.

---

# 92. Sensitive Data

Sensitive data categories should be identified explicitly.

Potential:

```text
Credentials
API keys
Personal information
Financial information
HR information
Private enterprise documents
```

The ingestion/security pipeline may filter or protect sensitive data according to the implemented controls.

---

# 93. Secrets

Never use:

```text
source item
chunk
entity
metadata
```

fields as general-purpose secret storage.

Provider credentials must use dedicated secure storage.

---

# 94. Data Minimization

Store what the product needs.

Avoid duplicating:

```text
entire source systems
unnecessary raw payloads
unnecessary sensitive fields
provider credentials
```

unless required for operation, audit, or recovery.

---

# 95. API Object Mapping

API DTOs map from these data concepts.

Example:

```text
Database / Graph
      ↓
Service layer
      ↓
AnswerDTO
CitationDTO
EntityDTO
GraphDTO
IntegrationDTO
ActivityDTO
```

The API should not expose raw database objects directly.

---

# 96. Core Product Objects

For the first product release, the most important data objects are:

```text
Workspace
User
Source
Source Item
Parent Chunk
Child Chunk
Embedding
Entity
Relationship
Conversation
Message
Answer
Citation
User Memory
Activity
Audit
```

---

# 97. P1 Objects

```text
Semantic Term
SOP
SOP Version
Decision
Review Item
Rule
```

---

# 98. P2 Objects

```text
Skill
Agent
Agent Run
Tool
MCP Connection
```

---

# 99. Object Lifecycle

## Source

```text
Disconnected
→ Connected
→ Syncing
→ Healthy
→ Paused / Error
```

## Knowledge

```text
Detected
→ Suggested
→ Reviewed
→ Approved
→ Active
→ Stale / Conflicting / Deprecated
```

## Agent

```text
Draft
→ Testing
→ Approved
→ Active
→ Paused
→ Deprecated
```

---

# 100. Core Relational Diagram

```text
WORKSPACE
│
├── MEMBERSHIPS ─── USER
│
├── SOURCES
│     │
│     └── SOURCE_ITEMS
│            │
│            └── DOCUMENTS
│                    │
│                    └── PARENT_CHUNKS
│                           │
│                           └── CHILD_CHUNKS
│                                  │
│                                  └── EMBEDDINGS
│
├── CONVERSATIONS
│      │
│      └── MESSAGES
│             │
│             └── ANSWERS
│                    │
│                    └── CITATIONS
│
├── USER_MEMORY
├── SYNC_JOBS
├── ACTIVITY_EVENTS
└── AUDIT_EVENTS
```

---

# 101. Core Graph Diagram

```text
                 ┌──────────────┐
                 │   PERSON     │
                 └──────┬───────┘
                        │
                      OWNS
                        │
                        ▼
                 ┌──────────────┐
                 │    SERVICE   │
                 └──────┬───────┘
                        │
              ┌─────────┼──────────┐
              │         │          │
         DEPENDS_ON  AFFECTED_BY  DOCUMENTED_BY
              │         │          │
              ▼         ▼          ▼
        Payment API   INC-902     SOP
                          │
                        CAUSED
                          │
                          ▼
                       DECISION
```

---

# 102. Runtime Context Diagram

```text
                     QUERY
                       │
                       ▼
             ┌──────────────────┐
             │ Retrieval Record │
             └────────┬─────────┘
                      │
             ┌────────┴────────┐
             ▼                 ▼
       SUPABASE              NEO4J
       Chunks              Entities
       Vectors             Relations
       Metadata            Definitions
             │                 │
             └────────┬────────┘
                      ▼
                CONTEXT FUSION
                      │
                      ▼
                    ANSWER
                      │
                ┌─────┴─────┐
                ▼           ▼
             Citation      Path
```

---

# 103. Multi-Source Context

A single answer can reference:

```text
Slack
+
Jira
+
GitHub
+
Document
```

Each source remains independently traceable.

---

# 104. Data Consistency

When source information changes:

```text
Source update
 ↓
Relevant source object updated
 ↓
Relevant chunks regenerated
 ↓
Embeddings updated
 ↓
Graph entities/relationships updated
```

The exact transactional behavior depends on the ingestion implementation.

---

# 105. Idempotency

Ingestion should use stable provider/source identifiers where available.

Conceptual:

```text
provider + external_id
```

This helps prevent duplicate records.

---

# 106. Duplicate Detection

Potential duplicate scenarios:

```text
Same Slack message
Same Jira issue
Same GitHub PR
Same document version
```

The ingestion layer should detect duplicates before creating duplicate knowledge representations.

---

# 107. Entity Deduplication

Potential duplicates:

```text
Billing
Billing Service
billing-service
```

The graph may need entity resolution/merge logic.

High-impact automatic merges should have safeguards.

---

# 108. Relationship Deduplication

Avoid creating duplicate edges for the same semantic relationship unless version/history makes duplication meaningful.

---

# 109. Data Migration

Schema changes should use explicit migrations.

Track:

```text
migration version
date
description
rollback strategy where applicable
```

---

# 110. Data Model Ownership

Recommended ownership:

```text
Workspace/User
→ Platform

Source / ingestion
→ Data Platform

Chunks / vectors
→ Retrieval Platform

Entities / relationships
→ Knowledge Platform

Conversations / answers
→ Product / AI Platform

Permissions / audit
→ Security Platform

Skills / agents
→ AI Platform
```

The exact organizational ownership depends on team structure.

---

# 111. API Contract Alignment

The following product DTOs should be defined from this model:

```text
WorkspaceDTO
UserDTO
SourceDTO
KnowledgeItemDTO
EntityDTO
RelationshipDTO
AnswerDTO
CitationDTO
ActivityDTO
AuditDTO
SkillDTO
AgentDTO
```

---

# 112. Database vs Graph Boundary

Do not duplicate every field in both Supabase and Neo4j.

Use each store for its purpose.

Example:

```text
Source item content
→ Supabase

Dense vector
→ Supabase / pgvector

Entity relationship
→ Neo4j

Semantic definition
→ Neo4j
```

Cross-store references should remain stable.

---

# 113. Stable IDs

Where an object crosses database boundaries, use stable identifiers.

Example:

```text
entity_id
```

can be referenced by:

```text
Supabase metadata
API responses
Neo4j
citations
activity
```

The ID strategy must be defined centrally.

---

# 114. Data Lineage

The system should be able to trace:

```text
Answer
 ↓
Citation
 ↓
Source item
 ↓
Chunk
 ↓
Parent context
 ↓
Original source
```

For graph-supported reasoning:

```text
Answer
 ↓
Graph path
 ↓
Entity
 ↓
Relationship
 ↓
Evidence source
```

This is a core Company Brain capability.

---

# 115. Data Governance

The system should distinguish:

```text
Raw source information
Derived semantic information
User-generated knowledge
Approved organizational knowledge
Runtime context
```

These categories have different authority and lifecycle semantics.

---

# 116. Derived vs Authoritative Data

Example:

```text
Slack message
= source observation

Extracted relationship
= derived semantic data

Approved SOP
= authoritative organizational knowledge
```

This distinction should remain explicit.

---

# 117. Knowledge Authority Model

Future version can assign:

```text
authority_level
```

Potential:

```text
source
derived
reviewed
approved
system
```

Do not implement an authority hierarchy without clearly defining its semantics.

---

# 118. Data Quality Signals

Possible metadata:

```text
source freshness
review status
conflict status
evidence count
last verified
```

These can support the product's Knowledge Health UX.

---

# 119. Knowledge Health

Conceptual aggregate:

```text
Freshness
Verification
Conflicts
Review Queue
```

Only calculate metrics that are technically defined.

---

# 120. Data Model and AI Safety

The data model should make it difficult to accidentally treat:

```text
Unverified chat
```

as:

```text
Approved policy
```

This is a fundamental governance requirement.

---

# 121. Agent Context Data

Future agent context can reference:

```text
Knowledge IDs
Entity IDs
Rule IDs
Skill IDs
Source IDs
```

The agent should receive a controlled context view rather than direct database access.

---

# 122. Agent Run Data

Future:

```text
run_id
agent_id
workspace_id
request
status
context_references
skill_id
tool_calls
result
created_at
```

Sensitive content should be stored only where justified.

---

# 123. MCP Connection Data

Future:

```text
mcp_connection_id
workspace_id
principal
status
permissions
created_at
updated_at
```

Secrets belong in secure credential storage.

---

# 124. Tool Call Data

Future agent execution can reference:

```text
tool
action
timestamp
authorization result
execution result
```

Do not store unnecessary sensitive payloads.

---

# 125. Product Data Flow

```text
External Source
      ↓
Source Item
      ↓
Parsed Content
      ↓
Parent Chunk
      ↓
Child Chunk
      ↓
Embedding
      +
Entity Extraction
      ↓
Supabase + Neo4j
      ↓
Retrieval
      ↓
Context Fusion
      ↓
Answer
      ↓
Citation / Graph Path
```

---

# 126. Data Model Principles

The data model must preserve:

```text
TENANCY
Which company owns this data?

PROVENANCE
Where did it come from?

TEMPORALITY
When was it true?

AUTHORITY
How authoritative is it?

ACCESS
Who can see it?

RELATIONSHIP
What is it connected to?

VERSION
What changed?

TRACEABILITY
Why did it contribute to an answer?
```

---

# 127. Definition of Done

The data model is ready for implementation when:

```text
[ ] Workspace model defined
[ ] User / membership model defined
[ ] Source model defined
[ ] Source item model defined
[ ] Document model defined
[ ] Parent chunk model defined
[ ] Child chunk model defined
[ ] Embedding model defined
[ ] Entity model defined
[ ] Relationship model defined
[ ] Semantic dictionary model defined
[ ] Rule model defined
[ ] Decision model defined
[ ] SOP model defined
[ ] Review model defined
[ ] Conversation model defined
[ ] Message model defined
[ ] Answer model defined
[ ] Citation model defined
[ ] User memory model defined
[ ] Activity model defined
[ ] Audit model defined
[ ] Permission model defined
[ ] Future Skill model defined
[ ] Future Agent model defined
[ ] Future MCP model defined
[ ] Supabase/Neo4j boundary defined
[ ] Tenant isolation defined
[ ] Provenance defined
[ ] Versioning defined
[ ] Retention questions identified
[ ] Data deletion semantics identified
```

---

# 128. Final Canonical Data Architecture

```text
                       WORKSPACE
                           │
             ┌─────────────┼─────────────┐
             │             │             │
           USERS         SOURCES       SECURITY
             │             │             │
             │             ▼             │
             │        SOURCE ITEMS       │
             │             │             │
             │             ▼             │
             │         DOCUMENTS         │
             │             │             │
             │             ▼             │
             │       PARENT CHUNKS       │
             │             │             │
             │             ▼             │
             │       CHILD CHUNKS        │
             │             │             │
             │             ▼             │
             │        EMBEDDINGS         │
             │             │             │
             │             ▼             │
             │       SUPABASE            │
             │       pgvector            │
             │             │              │
             │             └──────┐       │
             │                    │       │
             │                    ▼       │
             │                  NEO4J     │
             │                    │       │
             │              Entities      │
             │              Relations     │
             │              Definitions   │
             │                    │       │
             └──────────────┬─────┴───────┘
                            ▼
                       COGNITRAG
                         RETRIEVAL
                            │
                            ▼
                         ANSWER
                            │
                   ┌────────┴────────┐
                   ▼                 ▼
                CITATIONS        GRAPH PATH
```

---

# 129. Final Product Data Principle

> **Supabase stores the retrievable evidence and operational records; Neo4j stores the semantic relationships and controlled ontology; CognitRAG combines them at query time to produce traceable company context.**

---

# 130. Final Architecture Preservation Rule

This data model does not replace the existing architecture.

It formalizes it.

The existing architecture remains the authority for:

```text
model selection
chunk sizes
retrieval stages
reranking behavior
graph decision logic
API implementation
database configuration
```

This document provides the shared language required for:

```text
engineering
frontend
backend
security
product
AI
```

to work against the same conceptual data model.
