# 18 — CognitRAG Infrastructure & Deployment Specification
## Development → Staging → Production Infrastructure, CI/CD, Secrets, Observability & Scaling

> **Status:** Master infrastructure and deployment specification.
>
> **Technical source of truth:** `Architecture(1).md`
>
> **Dependencies:** `09_TECHNICAL_PRODUCT_ARCHITECTURE_AND_WORKFLOW.md`, `10_API_CONTRACTS.md`, `11_DATA_MODEL.md`, `12_INGESTION_PIPELINE_SPEC.md`, `13_RETRIEVAL_PIPELINE_SPEC.md`, `15_SECURITY_AND_RBAC_TECHNICAL_SPEC.md`, `16_EVALUATION_AND_BENCHMARKING.md`, `17_AGENT_AND_MCP_TECHNICAL_SPEC.md`
>
> **Purpose:** Define a practical infrastructure strategy for launching CognitRAG as a startup while preserving the current application architecture and leaving room for enterprise scale.
>
> **Important:** Provider names and deployment components below are recommended implementation choices unless explicitly identified as already present in the architecture. They must not be represented as completed infrastructure until implemented.

---

# 1. Infrastructure Objective

CognitRAG needs infrastructure that can support:

```text
Premium web application
+
FastAPI backend
+
AI retrieval pipeline
+
Supabase / PostgreSQL / pgvector
+
Neo4j
+
External model APIs
+
Source connectors
+
Background ingestion
+
SSE streaming
+
Monitoring
```

The initial infrastructure should optimize for:

```text
Simplicity
Reliability
Security
Low operational overhead
Fast iteration
```

not premature hyperscale.

---

# 2. Current Application Architecture

The existing technical stack is:

```text
Frontend
Next.js / React
Clerk
Lucide React
SSE

Backend
FastAPI
Uvicorn

Relational / Vector
Supabase PostgreSQL
pgvector
BM25
HNSW
RLS

Graph
Neo4j

Orchestration
LangGraph

AI services
Groq
OpenAI
Jina
Sarvam / configured model service

Evaluation
NVIDIA model configuration where used for offline evaluation
```

---

# 3. Deployment Philosophy

Use managed infrastructure where it reduces operational burden.

Prefer:

```text
Managed PostgreSQL
Managed authentication
Managed graph database where suitable
Managed deployment platform
Managed DNS / TLS
```

Build custom infrastructure only where CognitRAG's product actually needs it.

---

# 4. Environment Strategy

Maintain at least:

```text
Development
Staging
Production
```

Each environment should have distinct configuration.

Where appropriate, use separate:

```text
database
credentials
OAuth applications
API keys
domains
storage
monitoring
```

---

# 5. Environment Separation

Conceptually:

```text
LOCAL
Developer machine
       ↓
DEVELOPMENT
       ↓
STAGING
       ↓
PRODUCTION
```

Do not connect development code directly to production customer data.

---

# 6. Production Boundary

Production contains:

```text
Real customer data
Real sources
Production credentials
Production model/API configuration
Production logs
```

Access must be restricted.

---

# 7. Frontend Deployment

Frontend:

```text
Next.js
```

Deployment requirements:

```text
HTTPS
Environment variables
Authentication integration
API endpoint configuration
SSE support
CDN / edge delivery where applicable
```

The exact host can be chosen based on cost, team expertise, and SSE/runtime requirements.

---

# 8. Frontend Environment Variables

Only expose variables intended for the browser.

Potential public configuration:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_API_URL
Clerk public configuration
```

Never expose:

```text
OpenAI API keys
Groq API keys
Jina secrets
database credentials
Neo4j credentials
OAuth client secrets
```

---

# 9. Backend Deployment

Backend:

```text
FastAPI
+
Uvicorn
```

Recommended production characteristics:

```text
Containerized
Stateless API instances
External persistent databases
Centralized logs
Health checks
Graceful shutdown
```

---

# 10. Backend Container

Conceptual:

```text
Dockerfile
 ↓
FastAPI application
 ↓
Uvicorn
```

The container should not contain persistent application state.

---

# 11. Stateless API Principle

The API layer should be horizontally scalable.

Do not store critical state only in:

```text
local filesystem
process memory
single server
```

except intentionally ephemeral caches such as the existing LRU cache.

---

# 12. LRU Cache

The existing architecture uses:

```text
in-memory LRU cache
```

This is useful for:

```text
single-instance low-latency caching
```

but it is not a durable distributed cache.

When multiple backend instances are introduced, decide whether:

```text
local LRU remains an optimization
```

or:

```text
distributed cache is introduced
```

---

# 13. Supabase Deployment

Supabase provides:

```text
PostgreSQL
pgvector
RLS
```

The production project should be separate from development/staging where required.

---

# 14. Supabase Security

Protect:

```text
database
service role keys
connection credentials
storage
RLS policies
```

Never expose privileged Supabase credentials to the browser.

---

# 15. PostgreSQL Backups

Production must have:

```text
automated backups
restore procedure
restore testing
retention policy
```

The actual backup capabilities depend on the selected Supabase plan/configuration.

---

# 16. Neo4j Deployment

Neo4j is the graph layer for:

```text
entities
relationships
ontology
semantic dictionary
graph context
```

For production, use a deployment model that supports:

```text
persistent storage
backup
monitoring
access control
recovery
```

Managed Neo4j can reduce operational burden for a small startup.

---

# 17. Neo4j Credentials

Store:

```text
Neo4j URI
username
password / credential
```

only on trusted backend infrastructure.

Never send Neo4j credentials to the frontend.

---

# 18. Model Provider Configuration

Current model responsibilities include:

```text
Groq
  llama-3.1-8b-instant
  llama-3.3-70b-versatile

OpenAI
  gpt-4o-mini

Jina
  jina-embeddings-v4
  jina-reranker-v2

Sarvam / configured model service
  Graph decision model

NVIDIA model configuration
  Offline evaluation
```

The exact provider/API configuration must be environment-specific.

---

# 19. API Key Storage

Store model-provider credentials using:

```text
environment variables
```

or:

```text
managed secret store
```

Never:

```text
Git repository
frontend bundle
database plaintext field
```

unless a dedicated secure secret-storage design explicitly requires it.

---

# 20. Secret Rotation

Create a process for:

```text
detect
rotate
replace
validate
revoke old key
```

for:

```text
model API keys
OAuth credentials
database credentials
MCP credentials
```

---

# 21. Secret Ownership

Document:

```text
Which service uses the secret?
Who owns it?
Where is it stored?
When does it expire?
How is it rotated?
```

---

# 22. CI/CD

Recommended deployment flow:

```text
Git push
 ↓
CI
 ↓
Tests
 ↓
Build
 ↓
Security checks
 ↓
Staging deploy
 ↓
Smoke tests
 ↓
Production approval
 ↓
Production deploy
```

---

# 23. Pull Request Checks

At minimum:

```text
Lint
Type/syntax checks where applicable
Unit tests
API tests
Security checks
Build
```

AI/retrieval changes should additionally run targeted evaluation tests.

---

# 24. Retrieval CI

When retrieval code changes:

```text
Golden benchmark
 ↓
Regression comparison
 ↓
Pass / Fail
```

Do not rely only on ordinary unit tests.

---

# 25. Graph CI

When graph extraction/schema changes:

```text
Golden graph dataset
 ↓
Entity tests
 ↓
Relationship tests
 ↓
Provenance tests
```

---

# 26. Permission CI

For authentication/authorization changes:

```text
Cross-tenant test
RLS test
Graph permission test
Citation leakage test
Cache test
```

Security regressions should block release.

---

# 27. Build Artifacts

Version:

```text
frontend build
backend image
migration version
configuration version
```

Record the deployment version.

---

# 28. Deployment Strategy

For MVP:

```text
Simple rolling deployment
```

is usually sufficient.

Later:

```text
blue/green
canary
regional deployment
```

may become useful.

Do not add deployment complexity without a real need.

---

# 29. Database Migrations

Use explicit migrations for:

```text
PostgreSQL schema
RLS policies
Indexes
Functions
```

Graph schema changes should also be versioned.

---

# 30. Migration Sequence

Recommended:

```text
Create migration
 ↓
Test locally
 ↓
Test staging
 ↓
Backup / recovery confirmation
 ↓
Deploy production
 ↓
Validate
```

---

# 31. Backward Compatibility

During a rolling deployment:

```text
old frontend
+
new backend
```

or:

```text
new frontend
+
old backend
```

may temporarily coexist.

Therefore API changes should be backward-compatible where practical.

---

# 32. SSE Deployment Requirements

Because Ask Brain uses SSE:

```text
reverse proxy
load balancer
platform
```

must support long-lived streaming connections correctly.

Avoid configurations that buffer the stream unexpectedly.

---

# 33. SSE Timeout

Configure infrastructure so an active SSE response is not terminated prematurely.

Exact timeout depends on:

```text
hosting platform
proxy
load balancer
application
```

---

# 34. SSE Disconnect Handling

Frontend should handle:

```text
connection lost
```

by showing:

```text
We lost the connection.

[ Retry ]
```

The backend should make retries safe.

---

# 35. Streaming Load

Monitor:

```text
concurrent SSE connections
stream duration
disconnect rate
backend memory
```

---

# 36. Background Jobs

Ingestion and background memory extraction should not block normal API workers when avoidable.

Conceptually:

```text
FastAPI
 ↓
Job / worker
 ↓
Ingestion
```

---

# 37. MVP Background Processing

A lightweight background worker approach can be used initially.

The exact queue technology should be chosen based on:

```text
job volume
reliability requirements
operational simplicity
```

---

# 38. Scale-Up Queue

At larger scale, introduce a queue/event system if required.

Potential:

```text
Redis-based queue
Cloud task queue
Kafka / Kinesis
```

The existing architecture identifies Kafka/Kinesis as possible enterprise event infrastructure, but they are not automatically MVP requirements.

---

# 39. Ingestion Workers

Workers perform:

```text
fetch
parse
chunk
pronoun resolution
graph extraction
embedding
storage
```

---

# 40. Worker Concurrency

Control concurrency using:

```text
provider rate limits
database capacity
memory
CPU
job size
```

---

# 41. Model Rate Limits

Track and respect:

```text
Groq limits
OpenAI limits
Jina limits
other provider limits
```

Use bounded retries.

---

# 42. Provider Fallback

A fallback provider should only be introduced if:

```text
reliability
cost
availability
customer requirements
```

justify it.

Do not silently switch model behavior during evaluation without recording the change.

---

# 43. DNS

Production should use a company-owned domain.

Recommended conceptual:

```text
www.example.com
app.example.com
api.example.com
```

The final CognitRAG domain should be selected by the founding team.

---

# 44. TLS

All production traffic should use:

```text
HTTPS
```

including:

```text
browser
API
provider connections
database connections
graph connections
```

where supported.

---

# 45. CORS

Allow only trusted frontend origins.

Example:

```text
https://app.example.com
```

Do not use unrestricted origins for authenticated production APIs.

---

# 46. CDN

Use CDN/edge delivery for static frontend assets where supported.

Do not route sensitive API traffic through a caching layer that could expose private responses.

---

# 47. API Caching

Cache only safe responses.

Do not cache private knowledge responses in shared public caches.

---

# 48. Browser Caching

Be cautious with:

```text
company knowledge
answers
source data
```

Sensitive product responses should not be stored in public browser caches unintentionally.

---

# 49. Logging

Centralize:

```text
backend logs
frontend error logs
worker logs
integration logs
security logs
```

---

# 50. Structured Logging

Recommended fields:

```text
timestamp
service
environment
request_id
workspace_id where appropriate
user_id where appropriate
route
status
latency
error_code
```

Avoid unnecessary sensitive content.

---

# 51. Sensitive Logging Restrictions

Never log:

```text
passwords
API keys
OAuth tokens
database credentials
private source content unnecessarily
full confidential documents unnecessarily
```

---

# 52. Monitoring

Monitor:

```text
API availability
API latency
Error rate
SSE failures
Database health
Neo4j health
Connector health
Worker health
Model-provider failures
```

---

# 53. Application Metrics

Track:

```text
requests
errors
latency
active streams
job count
sync status
```

---

# 54. Retrieval Metrics

Track:

```text
retrieval latency
reranker latency
graph latency
generation latency
TTFT
total answer latency
```

---

# 55. Product Metrics

Track:

```text
workspaces
active users
questions
successful answers
source inspections
source connections
review actions
```

---

# 56. Cost Metrics

Track:

```text
LLM usage
embedding usage
reranking usage
database usage
graph usage
hosting
storage
```

Separate:

```text
fixed infrastructure
variable AI cost
```

---

# 57. Cost Per Workspace

Useful internal metric:

```text
monthly infrastructure cost
/
active workspace
```

Segment by:

```text
small
medium
large
```

when sufficient data exists.

---

# 58. Cost Per Answer

Track:

```text
query retrieval cost
rerank cost
generation cost
```

Compare against:

```text
customer value
```

---

# 59. Alerts

Create alerts for:

```text
API outage
high error rate
SSE failure spike
database unhealthy
Neo4j unhealthy
connector failures
unexpected model cost spike
permission failure spike
```

---

# 60. Alert Severity

Use:

```text
Critical
High
Medium
Low
```

Critical examples:

```text
cross-tenant access issue
production unavailable
data integrity issue
```

---

# 61. Uptime

Choose an uptime target only after understanding:

```text
customer requirements
architecture
hosting
operational maturity
```

Do not publicly claim an SLA before an SLA actually exists.

---

# 62. Incident Response

Maintain:

```text
Detection
 ↓
Triage
 ↓
Containment
 ↓
Resolution
 ↓
Verification
 ↓
Postmortem
```

---

# 63. Incident Severity

Example:

```text
SEV-1
Security/data exposure or complete production outage

SEV-2
Major workflow unavailable

SEV-3
Limited degradation

SEV-4
Minor issue
```

Exact policy should be set by the company.

---

# 64. Security Incident

For suspected data exposure:

```text
Stop / contain
 ↓
Preserve logs
 ↓
Identify scope
 ↓
Patch
 ↓
Validate
 ↓
Communicate according to policy
```

---

# 65. Data Integrity Incident

Examples:

```text
Duplicate graph relationships
Incorrect deletion
Corrupt source indexing
Bad migration
```

Response:

```text
Stop affected workflow
 ↓
Assess scope
 ↓
Recover / reconcile
 ↓
Validate
 ↓
Resume
```

---

# 66. Disaster Recovery

Document:

```text
RPO
RTO
Backup location
Restore procedure
Owner
Validation
```

---

# 67. Supabase Recovery

Test:

```text
restore database
restore relevant storage
validate RLS
validate indexes
```

The exact mechanism depends on the selected Supabase configuration.

---

# 68. Neo4j Recovery

Test:

```text
graph backup
restore
schema validation
relationship validation
provenance validation
```

---

# 69. Recovery Exercise

At least periodically:

```text
Pretend production database is unavailable.
```

Verify:

```text
Backup exists
Restore works
Application can reconnect
Data integrity is preserved
```

---

# 70. Deployment Health Checks

Backend health should verify dependencies as appropriate:

```text
Application process
Database connectivity
Neo4j connectivity
Critical configuration
```

Avoid exposing sensitive dependency details publicly.

---

# 71. Readiness vs Liveness

Use:

```text
Liveness
Is process alive?

Readiness
Can process safely receive traffic?
```

For example:

```text
API process alive
but database unavailable
→ not ready
```

---

# 72. Graceful Shutdown

During deployment:

```text
Stop accepting new work
 ↓
Allow active requests to finish where practical
 ↓
Close streams safely
 ↓
Stop workers
```

SSE connections need special handling.

---

# 73. Horizontal Scaling

API layer can scale:

```text
Instance 1
Instance 2
Instance 3
```

because:

```text
state lives in external services
```

with local LRU as optional optimization.

---

# 74. Worker Scaling

Ingestion workers can scale independently:

```text
API workers
≠
Ingestion workers
```

This prevents large sync jobs from starving interactive requests.

---

# 75. Database Scaling

Scale according to:

```text
query load
storage
vector index size
transaction volume
graph size
```

Do not scale prematurely.

---

# 76. Read Replicas

Future if required:

```text
PostgreSQL primary
+
read replicas
```

Only after observed read pressure.

---

# 77. Graph Scaling

Neo4j scaling strategy should be based on:

```text
graph size
concurrent queries
traversal depth
availability requirements
```

---

# 78. Multi-Region

Do not implement multi-region for MVP unless customer/reliability requirements justify it.

Future:

```text
Region A
Region B
```

would require careful handling of:

```text
data locality
authorization
replication
latency
model providers
disaster recovery
```

---

# 79. Customer Data Isolation

Production infrastructure should separate:

```text
application environment
customer workspace
```

through application/database authorization.

For high-isolation enterprise deployments, separate infrastructure may later be offered.

---

# 80. Enterprise Deployment Options

Future packaging:

```text
Shared SaaS
Dedicated tenant
Dedicated infrastructure
Private deployment
```

Do not implement all modes before customer demand exists.

---

# 81. Private Deployment

Potential components:

```text
Next.js
FastAPI
Supabase/PostgreSQL
Neo4j
Model provider integration
Customer network
```

Exact deployment design will depend on customer requirements.

---

# 82. Customer-Managed Infrastructure

Potential future:

```text
Customer cloud
Customer database
Customer keys
Customer network
```

This should be a later enterprise offering.

---

# 83. Infrastructure Security Baseline

Production should have:

```text
HTTPS
restricted admin access
secret management
database access controls
RLS
firewall/network controls where applicable
logging
monitoring
backups
```

---

# 84. Infrastructure Least Privilege

Each service gets only the permissions it needs.

Example:

```text
Frontend
→ no database credentials

API
→ required database/service access

Worker
→ required ingestion access

Monitoring
→ metrics/log access
```

---

# 85. Repository Structure

Recommended:

```text
cognitrag/
├── frontend/
├── backend/
├── ingestion/
├── graph/
├── evaluation/
├── docs/
├── infra/
│   ├── docker/
│   ├── deployment/
│   ├── migrations/
│   └── monitoring/
└── scripts/
```

Exact repository layout should follow the actual codebase.

---

# 86. Configuration Structure

Conceptually:

```text
config/
├── development
├── staging
└── production
```

Do not commit secrets into configuration files.

---

# 87. Environment Configuration

Common backend configuration categories:

```text
AUTH
DATABASE
SUPABASE
NEO4J
OPENAI
GROQ
JINA
SARVAM / MODEL SERVICE
LOGGING
CORS
SSE
```

---

# 88. Configuration Validation

Backend should fail fast when critical production configuration is missing.

Example:

```text
Missing database configuration.
```

Do not start a partially functional production service silently.

---

# 89. Configuration Secrets

Distinguish:

```text
public configuration
```

from:

```text
secret configuration
```

Only public configuration may be sent to browsers.

---

# 90. Local Development

Local environment should support:

```text
Next.js
FastAPI
```

while using appropriately isolated development services.

Potential:

```text
development Supabase
development Neo4j
test model keys
```

---

# 91. Local Data

Do not require developers to use real customer data locally.

Prefer:

```text
synthetic fixtures
golden dataset
```

---

# 92. Staging Environment

Staging should mirror production behavior sufficiently to test:

```text
SSE
authentication
RLS
graph
ingestion
retrieval
deployment
```

without containing real customer secrets/data unless explicitly controlled.

---

# 93. Production Deployment Checklist

```text
[ ] Domain configured
[ ] TLS active
[ ] Auth configured
[ ] Database configured
[ ] Neo4j configured
[ ] Model credentials configured
[ ] CORS restricted
[ ] Secrets validated
[ ] Migrations applied
[ ] RLS validated
[ ] Health checks active
[ ] Logs active
[ ] Alerts active
[ ] Backups active
[ ] Restore tested
[ ] SSE tested
[ ] Smoke tests passed
```

---

# 94. Production Smoke Test

After deployment:

```text
Sign in
 ↓
Create/open workspace
 ↓
Open dashboard
 ↓
Ask Brain
 ↓
Receive streamed answer
 ↓
Open citation
 ↓
Open graph
 ↓
Check integration status
```

---

# 95. Deployment Rollback

Every production deployment should have:

```text
rollback plan
```

Potential:

```text
previous frontend build
previous backend container
database migration rollback strategy
```

Do not assume all database migrations are safely reversible.

---

# 96. Migration Rollback

Prefer additive migrations.

For destructive changes:

```text
expand
 ↓
migrate
 ↓
deploy
 ↓
contract
```

rather than immediately deleting old fields.

---

# 97. Expand/Contract Example

Bad:

```text
Delete old field
Deploy new code
```

Safer:

```text
Add new field
Deploy code using both
Backfill
Switch reads/writes
Remove old field later
```

---

# 98. Retrieval Configuration Management

Version:

```text
chunk settings
rerank threshold
graph depth
top-k
cache threshold
model versions
prompts
```

This enables reproducible evaluation and rollback.

---

# 99. Model Configuration Rollback

If a new model causes regression:

```text
detect
 ↓
compare
 ↓
revert configuration
 ↓
re-run evaluation
 ↓
restore service
```

---

# 100. Prompt Configuration Management

Prompts should be versioned separately enough to identify:

```text
which prompt produced which behavior
```

---

# 101. Evaluation Deployment Gate

Before deploying retrieval changes:

```text
Golden dataset
+
Permission tests
+
Graph tests
+
Citation tests
```

must pass.

---

# 102. Security Deployment Gate

Before security-sensitive changes:

```text
RLS tests
Cross-tenant tests
Graph leakage tests
Citation leakage tests
Secret scan
```

must pass.

---

# 103. Infrastructure Cost Control

At startup stage:

```text
Minimize idle resources
Use managed services
Set provider limits
Monitor usage
```

Avoid running infrastructure that is not earning its cost.

---

# 104. Cost Alerts

Set alerts for:

```text
LLM spend
Embedding spend
Reranking spend
Database usage
Hosting usage
```

---

# 105. Budget Ownership

Assign responsibility for:

```text
AI spend
cloud spend
database spend
```

so unexpected costs are investigated quickly.

---

# 106. Startup Infrastructure Maturity

Use the following progression:

```text
Stage 1
Simple managed infrastructure

Stage 2
Background workers + stronger monitoring

Stage 3
Queue / event architecture

Stage 4
Horizontal scaling

Stage 5
Enterprise isolation

Stage 6
Private / regional deployment
```

---

# 107. Avoid Premature Kubernetes

Do not introduce Kubernetes for MVP unless there is a clear operational reason.

For an early startup:

```text
managed container / application platform
```

is often simpler.

---

# 108. Avoid Premature Kafka

Do not introduce Kafka merely because future enterprise architecture diagrams contain event streaming.

Use it when:

```text
event volume
durability
replay
fan-out
```

actually require it.

---

# 109. Avoid Premature Microservices

Keep clear logical boundaries without splitting every component into separate network services.

Early system:

```text
FastAPI application
+
background workers
+
managed data services
```

may be sufficient.

---

# 110. Service Extraction Trigger

Extract a service when one component needs:

```text
independent scaling
independent deployment
different reliability profile
different security boundary
```

---

# 111. Observability Stack

Choose tools appropriate to deployment.

Potential capabilities:

```text
application logs
metrics
error tracking
tracing
uptime monitoring
```

The specific vendors can be selected later.

---

# 112. Distributed Tracing

As the system scales, trace:

```text
Request
 ↓
FastAPI
 ↓
LangGraph
 ↓
Supabase
 ↓
Neo4j
 ↓
Model providers
```

This helps diagnose latency.

---

# 113. Request Correlation

Use:

```text
request_id
```

across:

```text
frontend
API
retrieval
workers
logs
```

This is particularly valuable for Ask Brain incidents.

---

# 114. Retrieval Trace Correlation

A Brain query should be traceable internally through:

```text
request_id
conversation_id
message_id
```

and where safe:

```text
retrieval run ID
```

---

# 115. Data Access Monitoring

Monitor unusual:

```text
authorization failures
cross-tenant attempts
high-volume source access
```

Only implement advanced threat detection when supported.

---

# 116. Production Privacy

Production logs/monitoring should not become an accidental copy of customer knowledge.

Apply:

```text
minimum necessary logging
```

---

# 117. Disaster Recovery Ownership

Document who is responsible for:

```text
database recovery
graph recovery
deployment rollback
secret rotation
incident communication
```

---

# 118. Runbooks

Create internal runbooks:

```text
API outage
Database outage
Neo4j outage
Provider outage
SSE outage
Connector outage
Security incident
Bad migration
Retrieval regression
```

---

# 119. Provider Outage

If an external model provider fails:

```text
Detect
 ↓
Identify affected functionality
 ↓
Fallback if tested
or
degrade gracefully
 ↓
Notify internal team
```

Do not silently change model behavior if consistency is required.

---

# 120. Degraded Mode

Possible examples:

```text
Graph temporarily unavailable
```

Product may still serve:

```text
vector-backed answers
```

if the architecture supports safe degradation.

Do not claim degraded-mode capability until implemented.

---

# 121. Graceful Degradation

For noncritical dependency failures:

```text
preserve core experience
```

where safe.

Examples:

```text
Activity analytics unavailable
→ Ask Brain still works

Graph unavailable
→ vector-only path if safe
```

The actual fallback behavior should be tested before enabling it.

---

# 122. Critical Dependency Failures

If:

```text
authorization
database
core retrieval
```

fails, the system should prefer:

```text
safe failure
```

over:

```text
unsafe partial response
```

---

# 123. Production Capacity Planning

Initially estimate:

```text
users
questions/day
concurrent streams
documents/day
chunks
embeddings/day
graph nodes/edges
```

Use actual customer data to update the estimates.

---

# 124. Capacity Model

Example:

```text
50 workspaces
×
100 questions/day
=
5,000 questions/day
```

Then estimate:

```text
retrieval load
model calls
database load
```

Do not design for millions of requests before there is evidence of demand.

---

# 125. Growth Trigger

Revisit infrastructure when:

```text
p95 latency rises
database utilization rises
worker queue grows
model limits become bottlenecks
cost per workspace becomes problematic
```

---

# 126. Production Launch Sequence

```text
Development
 ↓
Staging
 ↓
Internal Alpha
 ↓
Design Partner
 ↓
Paid Pilot
 ↓
Production
 ↓
Broader Launch
```

---

# 127. Launch Day Checklist

```text
[ ] Production domain
[ ] Auth
[ ] Signup
[ ] Workspace
[ ] Connector
[ ] Sync
[ ] Ask Brain
[ ] Evidence
[ ] Graph
[ ] Permissions
[ ] Monitoring
[ ] Backup
[ ] Rollback
[ ] Support contact
```

---

# 128. Post-Launch Monitoring

For the first period after launch, monitor closely:

```text
errors
latency
sync failures
model failures
permission failures
cost spikes
customer questions
```

---

# 129. Production Support

Define:

```text
support channel
incident owner
response expectations
customer escalation process
```

Do not advertise support SLAs until they are established.

---

# 130. Enterprise Readiness Roadmap

Potential:

```text
SSO
SCIM
SAML
private deployment
network controls
customer-managed keys
advanced compliance
dedicated infrastructure
regional data hosting
```

These are future capabilities unless already implemented.

---

# 131. Infrastructure Architecture — MVP

```text
                       INTERNET
                          │
                          ▼
                    DNS / HTTPS
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
          Next.js                   FastAPI
          Frontend                  Backend
             │                         │
             │                         ├──────────────┐
             │                         │              │
             │                         ▼              ▼
             │                    Supabase         Neo4j
             │                    PostgreSQL        Graph
             │                    pgvector
             │
             └─────────────── SSE / API ──────────────┐
                                                      │
                                                      ▼
                                             Model Providers
                                          OpenAI / Groq / Jina /
                                             configured services
```

---

# 132. Infrastructure Architecture — Ingestion

```text
External Source
      ↓
Connector
      ↓
FastAPI / Worker
      ↓
Parsing / Normalization
      ↓
Parent Chunk
      ↓
Pronoun Resolution
      ↓
Graph Extraction
      ├────────────→ Neo4j
      │
      ↓
Child Chunk
      ↓
Jina Embeddings
      ↓
Supabase / pgvector
```

---

# 133. Infrastructure Architecture — Query

```text
Browser
  ↓
Next.js
  ↓
FastAPI
  ↓
LangGraph
  ├── Cache
  ├── Memory
  ├── Contextualization
  ├── Intent
  ├── Hybrid Search
  ├── Rerank
  ├── Graph Decision
  ├── Neo4j
  ├── Context Fusion
  ├── Rerank
  └── Generation
          ↓
        SSE
          ↓
      Next.js
```

---

# 134. Infrastructure Architecture — Security

```text
User
 ↓
Clerk
 ↓
FastAPI
 ↓
Workspace / RBAC
 ↓
Supabase RLS
 +
Graph authorization
 ↓
Retrieval
 ↓
Authorized context
 ↓
Answer
 ↓
Audit
```

---

# 135. Infrastructure Architecture — Scale

```text
                     Load Balancer
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
          API #1         API #2         API #3
             │             │             │
             └─────────────┼─────────────┘
                           │
                    Shared Services
                 ┌─────────┼─────────┐
                 ▼         ▼         ▼
             Supabase   Neo4j     Workers
                                  /   |   \
                              Ingest Ingest Ingest
```

---

# 136. Production Architecture Principle

> **Keep the online user path fast and predictable; move large ingestion and maintenance workloads into independently managed background workers.**

---

# 137. Reliability Principle

The user-facing path:

```text
Ask Brain
```

should remain isolated from:

```text
large ingestion jobs
```

so that a customer sync does not cause the entire application to become slow.

---

# 138. Security Principle

The infrastructure should enforce:

```text
identity
tenant isolation
least privilege
secure secrets
permission-aware data access
auditing
```

at multiple layers.

---

# 139. Operational Principle

Do not optimize for hypothetical scale.

Optimize for:

```text
first 10 customers
then
first 100 customers
then
first enterprise deployment
```

---

# 140. Infrastructure Definition of Done — MVP

```text
[ ] Development environment exists.
[ ] Staging environment exists.
[ ] Production environment exists.
[ ] Frontend deploys.
[ ] FastAPI deploys.
[ ] Supabase production configured.
[ ] Neo4j production configured.
[ ] Model providers configured.
[ ] Secrets are not committed.
[ ] CI runs tests.
[ ] Retrieval regression runs.
[ ] Security regression runs.
[ ] SSE works in production.
[ ] Background ingestion works.
[ ] Logs exist.
[ ] Metrics exist.
[ ] Alerts exist.
[ ] Backups exist.
[ ] Restore procedure exists.
[ ] Rollback procedure exists.
[ ] Production smoke test exists.
```

---

# 141. Final Infrastructure Principle

> **CognitRAG should launch on the simplest secure infrastructure that can reliably support the Company Brain, then evolve architecture complexity only when real customer load, reliability, security, or enterprise requirements justify it.**
