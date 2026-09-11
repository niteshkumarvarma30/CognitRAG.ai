# 14 — CognitRAG Knowledge Graph Specification
## Neo4j Ontology, Entities, Relationships, Semantic Dictionary & Graph Retrieval

> **Status:** Master Knowledge Graph specification.
>
> **Technical source of truth:** `Architecture(1).md`
>
> **Dependencies:** `11_DATA_MODEL.md`, `12_INGESTION_PIPELINE_SPEC.md`, `13_RETRIEVAL_PIPELINE_SPEC.md`
>
> **Purpose:** Define the Neo4j semantic layer that gives CognitRAG relationship-aware company context while preserving provenance, permissions, temporal information, and controlled business semantics.

---

# 1. Purpose of the Knowledge Graph

The Knowledge Graph is not a replacement for vector search.

Its purpose is to represent:

```text
Entities
+
Relationships
+
Definitions
+
Business semantics
+
Provenance
```

so CognitRAG can answer questions that depend on relationships rather than only textual similarity.

---

# 2. Core Principle

Vector retrieval answers:

> "What text is semantically relevant?"

The graph helps answer:

> "What important things are connected, and how?"

Together:

```text
Vector
   +
Graph
   ↓
Richer context
```

---

# 3. Neo4j Responsibilities

The current architecture assigns Neo4j responsibility for:

```text
Semantic Dictionary
Entity relationships
Ontology
Deterministic business logic
```

The graph may also support:

```text
Entity exploration
Graph-based retrieval
Relationship evidence
Knowledge lineage
```

---

# 4. Graph Architecture

Conceptually:

```text
                    NEO4J
                      │
        ┌─────────────┼─────────────┐
        │             │             │
      Entities    Relationships   Terms
        │             │             │
        └─────────────┼─────────────┘
                      │
                  Ontology
                      │
               Business Semantics
                      │
              Graph Retrieval
```

---

# 5. Graph Tenant Boundary

Every graph object must belong to or be safely attributable to a workspace.

Conceptually:

```text
workspace_id
```

or another robust tenant isolation mechanism.

The implementation must guarantee that one workspace cannot access another workspace's graph.

---

# 6. Entity Model

An Entity is a meaningful company object.

Examples:

```text
Person
Team
Customer
Service
Application
Incident
Project
Document
Decision
SOP
Term
Skill
```

Only categories that are actually supported should be exposed in production UI.

---

# 7. Entity Properties

Conceptual:

```text
entity_id
name
type
workspace_id
metadata
created_at
updated_at
```

Optional:

```text
canonical_name
aliases
status
external_ids
```

Use only fields supported by the actual implementation.

---

# 8. Entity Identity

An external source identifier is not necessarily a company-level semantic identity.

Example:

```text
Slack:
"billing"

Jira:
"Billing Service"

GitHub:
"billing-service"

        ↓

Canonical semantic entity:
Billing Service
```

This is one of the main values of entity resolution.

---

# 9. External Entity References

An entity may maintain links to source-specific identities:

```text
provider
external_id
source_id
```

This allows:

```text
Company Entity
      ↓
Slack reference
Jira reference
GitHub reference
```

---

# 10. Entity Types

Recommended initial ontology:

```text
PERSON
TEAM
CUSTOMER
SERVICE
APPLICATION
PROJECT
INCIDENT
DOCUMENT
DECISION
SOP
TERM
```

Future:

```text
PRODUCT
ACCOUNT
CONTRACT
VENDOR
LOCATION
SYSTEM
SKILL
AGENT
```

Only add new types when real product use cases justify them.

---

# 11. Relationship Model

Relationships express semantic connections.

Examples:

```text
OWNS
DEPENDS_ON
AFFECTED_BY
DECIDED_BY
DOCUMENTED_BY
CHANGED_BY
WORKS_ON
BELONGS_TO
RELATED_TO
```

The actual production vocabulary must remain controlled.

---

# 12. Relationship Properties

Conceptual:

```text
relationship_id
type
workspace_id
source_entity_id
target_entity_id
created_at
updated_at
```

Optional:

```text
confidence
valid_from
valid_to
evidence
```

Do not treat model-generated confidence as calibrated probability unless explicitly defined.

---

# 13. Directed Relationships

Where semantics require direction, preserve it.

Example:

```text
Billing Service
       │
       ▼
DEPENDS_ON
       │
       ▼
Payment API
```

The inverse relationship should not be created merely for convenience unless the graph model requires it.

---

# 14. Relationship Evidence

Important graph relationships should have provenance.

Example:

```text
Billing Service
   ↓
AFFECTED_BY
   ↓
INC-902

Evidence:
Jira BILL-902
Slack #engineering
```

This creates verifiable graph relationships.

---

# 15. Graph Provenance

A relationship may be supported by:

```text
Source Item
Document
Chunk
Decision
SOP
User-approved knowledge
```

Conceptually:

```text
Relationship
      ↓
SUPPORTED_BY
      ↓
Evidence
```

---

# 16. Entity Provenance

Entities can also be linked to their originating records:

```text
Entity
  ↓
MENTIONED_IN
  ↓
Source Item
```

This helps resolve the entity back to evidence.

---

# 17. Temporal Graph

Where supported, relationships can contain:

```text
valid_from
valid_to
first_seen
last_seen
```

This enables questions such as:

```text
Who owned the Billing Service last month?

What dependencies did the service have before the migration?
```

Only use temporal attributes when they have a defensible source.

---

# 18. Current vs Historical

The graph should conceptually distinguish:

```text
CURRENT
Historical
Deprecated
Unknown
```

A historical relationship should not automatically be treated as current.

---

# 19. Entity Status

Potential:

```text
active
deprecated
merged
archived
```

Exact states depend on entity governance.

---

# 20. Entity Resolution Pipeline

During ingestion:

```text
Resolved source text
       ↓
Graph extraction
       ↓
Candidate entity
       ↓
Entity resolution
       ↓
Existing entity?
   /          \
 YES          NO
  │            │
  ▼            ▼
Merge/Link   Create
```

The actual matching logic may be deterministic, model-assisted, or hybrid.

---

# 21. Entity Alias

Example:

```text
Canonical:
Billing Service

Aliases:
billing
billing-api
billing-service
```

Aliases improve entity discovery.

---

# 22. Entity Merge

If two entities are strongly determined to represent the same company object:

```text
Entity A
+
Entity B
 ↓
Canonical Entity
```

A merge operation must preserve:

```text
source references
relationships
history
provenance
```

---

# 23. Entity Merge Safety

Do not automatically merge ambiguous entities.

For uncertain cases:

```text
Possible duplicate
 ↓
Review
 ↓
Merge
or
Keep Separate
```

---

# 24. Relationship Deduplication

Prevent accidental duplicate relationships.

Example:

```text
Billing Service
→ depends_on
→ Payment API
```

should not become dozens of identical edges simply because the relationship was observed repeatedly.

If repeated observations are meaningful, preserve them as evidence/history rather than meaningless duplicate edges.

---

# 25. Ontology

The ontology defines:

```text
What concepts exist?
What relationships exist?
What properties matter?
What definitions apply?
```

Example:

```text
CUSTOMER
   ↓
has
   ↓
SUBSCRIPTION
   ↓
affected_by
   ↓
INCIDENT
```

---

# 26. Ontology Governance

Ontology changes should be controlled.

Potential lifecycle:

```text
Proposed
 ↓
Reviewed
 ↓
Approved
 ↓
Active
```

Avoid allowing arbitrary user-generated relationship types to fragment the graph vocabulary.

---

# 27. Semantic Dictionary

The Semantic Dictionary is part of the controlled semantic layer.

It provides explicit company definitions.

Example:

```text
Churn Risk

Definition:
Company-approved definition...

Owner:
Customer Success

Version:
3
```

---

# 28. Why the Dictionary Matters

Without explicit definitions:

```text
"Churn Risk"
```

could mean different things to:

```text
Sales
Marketing
Customer Success
AI agent
```

The dictionary creates a shared semantic contract.

---

# 29. Semantic Term Model

Conceptual:

```text
term_id
workspace_id
name
definition
owner
version
status
created_at
updated_at
```

Optional:

```text
examples
exclusions
scope
```

---

# 30. Term Status

Potential:

```text
draft
review
active
deprecated
```

---

# 31. Term Relationships

A term may be connected to:

```text
Business Rule
Decision
SOP
Skill
Agent
Entity
Source Evidence
```

Example:

```text
Churn Risk
   ↓
used_by
   ↓
Customer Retention Skill
```

---

# 32. Controlled Definition

A controlled definition should be visually distinguished from ordinary source text.

UI:

```text
OFFICIAL DEFINITION

Churn Risk
...

Version 3
Owner: Customer Success
```

---

# 33. Rule Model

Rules define business logic.

Example:

```text
IF
verified_outage = true

THEN
refund_window = 45 days
```

A rule can reference:

```text
terms
entities
policies
decisions
```

---

# 34. Rule Provenance

Every important rule should have:

```text
origin
evidence
owner
version
status
```

A rule extracted from a conversation should not automatically become an authoritative business rule.

---

# 35. Rule Lifecycle

```text
Detected
 ↓
Suggested
 ↓
Reviewed
 ↓
Approved
 ↓
Active
 ↓
Deprecated
```

---

# 36. Decision Model

A Decision records an organizational decision.

Example:

```text
Decision:
Use PostgreSQL for Billing Service.

Reason:
Transactional consistency and existing
operational expertise.

Alternatives:
MySQL
DynamoDB
```

---

# 37. Decision Relationships

```text
Decision
 ├── applies_to → Service
 ├── supported_by → Source
 ├── supersedes → Previous Decision
 └── documented_by → SOP
```

Only implement relationships that are supported by the actual product model.

---

# 38. SOP Relationships

```text
SOP
 ├── documents → Service
 ├── updated_by → Decision
 ├── supported_by → Sources
 └── supersedes → Previous Version
```

---

# 39. Graph Representation Example

```text
                 ┌───────────────┐
                 │ Billing       │
                 │ Service       │
                 └───────┬───────┘
                         │
                DEPENDS_ON
                         │
                         ▼
                 ┌───────────────┐
                 │ Payment API   │
                 └───────────────┘

Billing Service
       │
  AFFECTED_BY
       │
       ▼
    INC-902
       │
    CAUSED
       │
       ▼
 Billing Decision
       │
 DOCUMENTED_BY
       │
       ▼
 Billing SOP v3.2
```

---

# 40. Graph Query Purpose

The graph should answer:

```text
What is connected?
How is it connected?
What changed?
Who owns it?
What affected it?
What documents it?
Which decision caused it?
```

---

# 41. Graph Query Types

Potential:

```text
Entity lookup
Neighborhood lookup
Relationship lookup
Path lookup
Dependency lookup
Ownership lookup
Incident lookup
Decision lookup
```

---

# 42. Entity Neighborhood

Default graph expansion:

```text
1-hop
```

as specified in the existing retrieval architecture.

Example:

```text
Billing Service
 ↓
Payment API
INC-902
Billing SOP
```

---

# 43. Graph Expansion Decision

The retrieval engine should not query Neo4j for every question.

Current architecture:

```text
Surviving vector chunks
 ↓
Extracted entities
 ↓
sarvam-30b graph decision
 ↓
Use graph?
```

---

# 44. Graph Decision Input

Potential:

```text
query
entities
retrieved context
```

The exact implementation should match the current code.

---

# 45. Graph Decision Output

Conceptual:

```json
{
  "use_graph": true
}
```

The actual schema should follow the implementation.

---

# 46. Graph Decision — YES

```text
Entities
 ↓
Neo4j
 ↓
1-hop relationships
 ↓
Graph context
```

---

# 47. Graph Decision — NO

```text
Vector context
 ↓
Skip graph
 ↓
Continue toward context fusion / generation
```

---

# 48. Graph Context Formatting

Neo4j results need to be transformed into generation-friendly context.

Conceptual:

```text
Billing Service
depends_on
Payment API
```

rather than exposing raw Neo4j objects.

---

# 49. Graph Context + Vector Context

The final context can contain:

```text
Text evidence

+
Graph relationship evidence
```

Example:

```text
Text:
"Following INC-902, deployment requires
a migration pre-check."

Graph:
Billing Service
→ affected_by
→ INC-902
```

---

# 50. Context Fusion

```text
Vector candidates
+
Graph context
 ↓
Unified evidence pool
```

Then:

```text
Second reranking
 ↓
Top 15
```

The exact ranking flow remains defined by the retrieval specification.

---

# 51. Graph Path Provenance

When graph context contributes to an answer, preserve enough information to explain:

```text
Source Entity
Relationship
Target Entity
Supporting evidence
```

---

# 52. Answer → Graph Path

Conceptually:

```text
Answer
 ↓
Graph Path
 ↓
Billing Service
 → AFFECTED_BY
 → INC-902
```

The frontend can display this as:

```text
Graph context
Billing Service → INC-902
```

---

# 53. Graph UX

The user should not see raw database terminology.

Do not show:

```text
MATCH (n)-[r]->(m)
```

Show:

```text
Billing Service
is affected by
INC-902
```

---

# 54. Graph Node UX

Node:

```text
Billing Service
Application
```

Click:

```text
Owner
Relationships
Sources
History
```

---

# 55. Graph Relationship UX

Relationship:

```text
Billing Service
↓
affected by
↓
INC-902
```

Click:

```text
Why?
Evidence:
Jira BILL-902
Slack #engineering
```

---

# 56. Graph Search UX

User enters:

```text
Billing Service
```

System centers graph.

Then:

```text
[ Expand ]
[ Ask Brain ]
[ Sources ]
```

---

# 57. Graph Filtering

Filter by:

```text
People
Services
Incidents
Documents
Decisions
SOPs
Customers
```

The graph should remain understandable after filters.

---

# 58. Graph Depth Control

MVP:

```text
1 hop
```

Future:

```text
2 hop
3 hop
```

only if real customer workflows benefit from deeper traversal.

---

# 59. Why Not Always Multi-Hop?

Deep traversal can introduce:

```text
irrelevant relationships
noise
latency
context explosion
```

Therefore graph depth should be bounded.

---

# 60. Graph Noise Control

The graph should prioritize:

```text
relevant entity
relevant relationships
recent/current context
authorized data
```

Do not return hundreds of unrelated nodes.

---

# 61. Graph Ranking

Potential ranking signals:

```text
relationship relevance
entity relevance
source relevance
freshness
authority
```

The actual ranking logic should be tested before being treated as production behavior.

---

# 62. Graph Permissions

Graph queries must operate inside the same authorization boundary as vector retrieval.

Conceptually:

```text
User
 ↓
Workspace
 ↓
Permissions
 ↓
Neo4j query
 ↓
Authorized graph
```

---

# 63. Restricted Graph Data

Do not leak:

```text
restricted entity names
restricted relationships
restricted source references
```

unless the access policy explicitly permits metadata visibility.

---

# 64. Graph + RLS

Supabase RLS controls relational/vector data.

Neo4j authorization must also be enforced.

A complete architecture therefore needs:

```text
Supabase authorization
+
Graph authorization
+
API authorization
```

The exact implementation boundary should be documented and tested.

---

# 65. Graph Source Linking

Every graph node should be traceable back to supporting source objects when available.

Example:

```text
INC-902
 ↓
Jira BILL-902
```

---

# 66. Graph-to-Source Flow

```text
Graph node
 ↓
Source reference
 ↓
Source Receipt
 ↓
Original source
```

---

# 67. Graph-to-Knowledge Flow

```text
Entity
 ↓
Related SOP
 ↓
SOP detail
 ↓
Evidence
```

---

# 68. Graph-to-Decision Flow

```text
Entity
 ↓
Decision
 ↓
Reason
 ↓
Evidence
```

---

# 69. Graph-to-Ask Flow

```text
Entity
 ↓
Ask Brain
 ↓
Contextualized question
```

Example:

```text
Billing Service

[ Ask Brain ]

"What changed recently around Billing Service?"
```

---

# 70. Semantic Dictionary → Retrieval

When a query includes a controlled term:

```text
"Churn Risk"
```

the retrieval system can use the approved definition to reduce ambiguity where the architecture supports this behavior.

The exact integration between the dictionary and retrieval prompt/query must be implemented deliberately.

---

# 71. Semantic Dictionary → Agents

Future:

```text
Agent
 ↓
Company Brain
 ↓
Controlled definitions
 ↓
Policy / skill
```

This can help agents operate using organization-specific terminology.

---

# 72. Rule → Agent

Future:

```text
Agent request
 ↓
Relevant rule
 ↓
Permission / policy
 ↓
Action decision
```

Rules should be treated as explicit company semantics, not arbitrary model output.

---

# 73. Decision → SOP

When a decision changes an operational process:

```text
Decision
 ↓
Review
 ↓
SOP update
 ↓
New version
```

The relationship should be preserved where supported.

---

# 74. Decision Supersession

Example:

```text
Decision v1
    ↓
superseded_by
    ↓
Decision v2
```

This helps historical questions.

---

# 75. SOP Supersession

```text
SOP v3.1
    ↓
superseded_by
    ↓
SOP v3.2
```

Do not delete old evidence simply because it is no longer current.

---

# 76. Graph History

Potential UI:

```text
Current
Billing Service → Payment API

Previous
Billing Service → Legacy Payment API

Changed
Aug 26
```

Only show temporal history that is supported by actual data.

---

# 77. Graph Health

Useful internal indicators:

```text
Orphan entities
Duplicate candidates
Broken provenance
Unsupported relationships
Stale relationships
```

This can become a graph-quality admin tool later.

---

# 78. Graph Quality Review

Potential review items:

```text
Possible duplicate entity
Ambiguous relationship
Missing evidence
Conflicting relationship
Unknown entity
```

---

# 79. Graph Extraction Confidence

If graph extraction produces confidence metadata, treat it as model/system-specific.

Do not display:

```text
99% true
```

unless that number has a defensible probabilistic interpretation.

Prefer:

```text
Needs review
High extraction confidence
```

where justified.

---

# 80. Graph Extraction Errors

If model extraction fails:

```text
Source ingestion can continue if
vector indexing is independently successful
and the product policy allows it.
```

Otherwise:

```text
Item status = partial / failed
```

The exact dependency policy should follow implementation requirements.

---

# 81. Graph Update Strategy

When source content changes:

```text
Changed source item
 ↓
Re-extract relevant entities
 ↓
Reconcile relationships
 ↓
Preserve valid existing knowledge
 ↓
Update changed relationships
```

Avoid rebuilding the entire graph unnecessarily.

---

# 82. Graph Deletion Strategy

When source information disappears:

```text
Source deletion
 ↓
Identify dependent derived entities/relationships
 ↓
Mark / remove according to provenance policy
```

Do not delete independently supported knowledge merely because one source disappeared.

---

# 83. Provenance-Aware Deletion

Example:

```text
Relationship:
Billing → affected_by → INC-902

Evidence:
Jira
+
Slack
```

If Jira record disappears but Slack still supports it:

```text
Relationship can remain
```

subject to the actual evidence policy.

---

# 84. Ontology Expansion

New entity/relationship types should be introduced only when:

```text
Repeated product need
Strong semantics
Clear governance
```

Avoid uncontrolled ontology growth.

---

# 85. Graph Schema Migration

When changing graph structure:

```text
Define migration
 ↓
Backfill if required
 ↓
Test queries
 ↓
Validate provenance
 ↓
Release
```

Do not silently change relationship semantics.

---

# 86. Graph Query Safety

Queries should:

```text
Limit depth
Limit result count
Use indexed identifiers where available
Enforce workspace
Enforce authorization
```

Avoid unconstrained traversals.

---

# 87. Graph Query Performance

Monitor:

```text
query latency
node count
edge count
result size
database load
```

Especially for:

```text
large organizations
deep queries
high-frequency agent access
```

---

# 88. Graph Cache

Graph query caching can be introduced later.

Cached graph context must still respect:

```text
current permissions
current knowledge version
```

---

# 89. Knowledge Graph API

Conceptual:

```text
GET /api/v1/graph
GET /api/v1/graph/entities/{id}/neighbors
GET /api/v1/graph/relationships/{id}
```

Exact contracts are defined in:

```text
10_API_CONTRACTS.md
```

---

# 90. Graph UI Data Shape

The frontend needs:

```text
nodes[]
edges[]
selected_node
relationships
metadata
```

The backend should transform Neo4j objects into stable API DTOs.

---

# 91. Graph DTO

Conceptual:

```json
{
  "nodes": [
    {
      "id": "entity_1",
      "type": "service",
      "label": "Billing Service"
    }
  ],
  "edges": [
    {
      "id": "rel_1",
      "source": "entity_1",
      "target": "entity_2",
      "type": "depends_on"
    }
  ]
}
```

---

# 92. Graph Detail DTO

Conceptual:

```json
{
  "id": "entity_1",
  "name": "Billing Service",
  "type": "service",
  "owner": "Engineering Platform",
  "sources": [],
  "relationships": []
}
```

Only return authorized fields.

---

# 93. Graph Path DTO

Conceptual:

```json
{
  "nodes": ["billing-service", "inc-902"],
  "relationships": ["affected_by"],
  "evidence": ["jira-bill-902"]
}
```

---

# 94. Graph Search API

Potential:

```text
GET /api/v1/graph/search?q=Billing
```

Return authorized matching entities.

---

# 95. Entity Search

Search should support:

```text
name
alias
external ID
source reference
```

where implemented.

---

# 96. Entity Detail API

Potential:

```text
GET /api/v1/knowledge/entities/{entity_id}
```

The response can combine:

```text
entity metadata
relationships
sources
history
```

---

# 97. Graph + Vector Retrieval Contract

At retrieval time:

```text
Vector result
   ↓
Entity references
   ↓
Graph decision
   ↓
Graph expansion
```

This requires consistent entity IDs/reference metadata across the two systems.

---

# 98. Cross-System Identity Rule

If Supabase says:

```text
entity_id = E123
```

Neo4j should use the same stable semantic identity or a deterministic mapping.

Do not make the frontend reconcile two unrelated IDs.

---

# 99. Graph Context Construction

Graph context should be converted into concise factual statements.

Example:

```text
Billing Service depends on Payment API.
Billing Service was affected by INC-902.
INC-902 led to the migration pre-check decision.
```

Only generate statements supported by graph relationships.

---

# 100. Graph Context Quality

A graph-derived sentence should preserve:

```text
relationship direction
entity identity
relationship type
evidence
```

Avoid turning:

```text
depends_on
```

into:

```text
caused by
```

because the latter has a different semantic meaning.

---

# 101. Semantic Precision

Relationship vocabulary must be precise.

Examples:

```text
DEPENDS_ON
```

does not mean:

```text
CAUSED_BY
```

and:

```text
RELATED_TO
```

does not mean:

```text
OWNED_BY
```

Controlled ontology is essential.

---

# 102. Graph Business Logic

Where business rules are encoded:

```text
Graph
 ↓
Controlled rule
 ↓
Application behavior
```

Rules should be versioned and governed.

---

# 103. Determinism Goal

The graph/ontology layer can make specific semantics more deterministic.

Examples:

```text
Company-defined term
Company-defined relationship
Company-approved business rule
```

This does not make the entire AI system deterministic.

---

# 104. "Zero Hallucination" Positioning

Do not describe the graph as guaranteeing zero hallucinations.

Correct framing:

> **The semantic layer is designed to constrain important company-specific meanings and improve grounded, verifiable answers.**

---

# 105. Graph and Trust

The knowledge graph contributes to trust by enabling:

```text
Relationship visibility
Source lineage
Entity context
Historical context
Controlled definitions
```

---

# 106. Graph and Product UX

Marketing:

> Understand relationships.

Product:

```text
Knowledge Graph
```

Backend:

```text
Neo4j
+
Entity extraction
+
Graph expansion
```

These are the same capability at different abstraction levels.

---

# 107. Graph and Ask Brain

Ask Brain remains the primary user entry point.

The graph is an explanatory and context-enrichment layer.

Therefore:

```text
ASK first
GRAPH when useful
```

not:

```text
GRAPH first
ASK later
```

---

# 108. Graph and Living Knowledge

When an operational decision changes:

```text
Decision
 ↓
Relationship update
 ↓
SOP change
 ↓
Knowledge version
```

The graph can become the connective layer between these artifacts.

---

# 109. Graph and Agent Context

An agent can later use:

```text
Entity
Relationship
Rule
Policy
Skill
Source evidence
```

as structured company context.

---

# 110. Future Graph Capabilities

Potential:

```text
Multi-hop traversal
Temporal reasoning
Dependency analysis
Impact analysis
Ownership discovery
Root-cause exploration
Policy dependency
Skill/context mapping
```

These should remain future capabilities until validated.

---

# 111. MVP Graph Scope

MVP:

```text
Entity extraction
Relationship extraction
Neo4j storage
Search
1-hop expansion
Entity detail
Source provenance
Permission-aware graph
```

---

# 112. P1 Graph Scope

```text
Entity resolution improvements
Dictionary integration
Decisions
SOP relationships
Graph history
Review queue
Conflict handling
```

---

# 113. P2 Graph Scope

```text
Multi-hop
Advanced temporal graph
Impact analysis
Agent graph context
Graph analytics
Automated ontology suggestions
```

---

# 114. Graph Testing Strategy

Test:

```text
Entity extraction
Relationship extraction
Entity resolution
Duplicate handling
Relationship direction
Permissions
Provenance
Temporal metadata
Graph expansion
Graph-to-answer context
```

---

# 115. Golden Graph Dataset

Use a small known graph.

Example:

```text
Billing Service
Payment API
INC-902
BILL-902
Billing SOP
PR #1287
```

Expected:

```text
Entities
Relationships
Provenance
1-hop neighborhood
```

---

# 116. Graph Regression Testing

After changing:

```text
extraction model
prompt
ontology
entity resolver
relationship schema
```

rerun the golden graph tests.

---

# 117. Graph Evaluation Metrics

Potential:

```text
Entity precision
Entity recall
Relationship precision
Relationship recall
Duplicate rate
Unsupported relationship rate
Provenance coverage
Query latency
```

Use a labeled dataset.

---

# 118. Graph Retrieval Evaluation

Compare:

```text
Vector only
vs
Vector + graph
```

on relationship-heavy questions.

Measure:

```text
answer correctness
evidence quality
latency
```

---

# 119. Graph Decision Evaluation

Measure:

```text
graph selected when useful
graph skipped when unnecessary
false-positive graph use
false-negative graph skip
```

The goal is selective graph usage.

---

# 120. Graph Security Evaluation

Test:

```text
authorized node visible
unauthorized node hidden

authorized relationship visible
unauthorized relationship hidden
```

Also test:

```text
indirect leakage
```

where one relationship might reveal restricted information.

---

# 121. Ontology Governance

Maintain a registry:

```text
Entity Types
Relationship Types
Property Definitions
Semantic Terms
Rules
```

Each should have:

```text
owner
status
version
```

where appropriate.

---

# 122. Ontology Documentation

Create internal documentation:

```text
/knowledge-ontology
```

including:

```text
Node types
Relationship types
Examples
Constraints
Evidence requirements
Lifecycle
```

---

# 123. Graph Administration

Future admin screen:

```text
Graph Health

Entities
128,420

Relationships
412,820

Possible duplicates
42

Missing provenance
7

Stale relationships
13
```

Only expose metrics based on real calculations.

---

# 124. Graph Quality Workflow

```text
Detect issue
 ↓
Review
 ↓
Fix
 ↓
Audit
```

Examples:

```text
Merge duplicate entity
Correct relationship
Add evidence
Deprecate invalid relationship
```

---

# 125. Knowledge Graph Definition

Canonical product definition:

> **The CognitRAG Knowledge Graph is the structured semantic layer that connects the people, systems, customers, incidents, decisions, documents, and operational concepts that make up how a company works.**

---

# 126. Canonical Technical Definition

> **Neo4j stores the semantic graph, ontology, controlled definitions, and relationship context used by CognitRAG for relationship-aware retrieval and structured company context.**

---

# 127. Final Graph Architecture

```text
                     SOURCE DATA
                          │
                          ▼
                 GRAPH EXTRACTION
                    gpt-4o-mini
                          │
                          ▼
                   ENTITY RESOLUTION
                          │
                 ┌────────┴────────┐
                 │                 │
                 ▼                 ▼
             ENTITIES        RELATIONSHIPS
                 │                 │
                 └────────┬────────┘
                          ▼
                        NEO4J
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
      ONTOLOGY       DICTIONARY          RULES
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                     QUERY TIME
                          │
                  GRAPH DECISION
                          │
                     1-HOP EXPANSION
                          │
                          ▼
                  GRAPH CONTEXT
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
             VECTOR           GRAPH
             CONTEXT          CONTEXT
                 \                 /
                  \               /
                   ▼             ▼
                    CONTEXT FUSION
                           │
                           ▼
                      RERANK #2
                           │
                           ▼
                         TOP 15
                           │
                           ▼
                     FINAL ANSWER
```

---

# 128. Final Product Flow

```text
User asks
   ↓
Vector retrieval finds relevant text
   ↓
Entities are identified
   ↓
Graph decision determines whether relationships help
   ↓
Neo4j provides relevant relationships
   ↓
Vector + graph evidence are fused
   ↓
Final reranking selects context
   ↓
LLM generates answer
   ↓
User sees answer + evidence + context
```

---

# 129. Final Knowledge Graph Principle

> **The graph exists to add relationship-aware context when relationships matter—not to make every query look more sophisticated.**

---

# 130. Definition of Done

The Knowledge Graph layer is ready for MVP when:

```text
[ ] Workspace isolation exists.
[ ] Entity extraction works.
[ ] Relationship extraction works.
[ ] Entities can be stored in Neo4j.
[ ] Relationships can be stored in Neo4j.
[ ] Stable entity IDs exist.
[ ] Source provenance exists.
[ ] Entity references are available to retrieval.
[ ] Graph decision works.
[ ] 1-hop expansion works.
[ ] Graph context can be fused with vector context.
[ ] Graph permissions are enforced.
[ ] Graph UI can search entities.
[ ] Graph UI can display relationships.
[ ] Source evidence can be opened.
[ ] Golden graph dataset exists.
[ ] Graph regression tests exist.
```

---

# 131. Final Rule for Future Expansion

The graph should grow according to real product needs:

```text
Customer workflow
 ↓
Missing semantic capability
 ↓
Ontology / relationship addition
 ↓
Evaluation
 ↓
Production
```

Do not expand the ontology simply because a larger graph sounds more impressive.

---

# 132. Canonical Knowledge Graph Statement

> **CognitRAG uses Neo4j as a structured semantic layer for entities, relationships, controlled definitions, and business semantics, selectively enriching vector retrieval with relationship-aware context before final answer generation.**
