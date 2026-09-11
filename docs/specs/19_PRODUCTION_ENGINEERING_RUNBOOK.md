# 19 — CognitRAG Production Engineering Runbook
## Operations, Deployment, Incident Response, Recovery & Day-to-Day Reliability

> **Status:** Master production operations runbook.
>
> **Technical dependencies:** `09_TECHNICAL_PRODUCT_ARCHITECTURE_AND_WORKFLOW.md`, `12_INGESTION_PIPELINE_SPEC.md`, `13_RETRIEVAL_PIPELINE_SPEC.md`, `15_SECURITY_AND_RBAC_TECHNICAL_SPEC.md`, `18_INFRASTRUCTURE_AND_DEPLOYMENT.md`
>
> **Purpose:** Define how the CognitRAG engineering team operates, deploys, monitors, diagnoses, recovers, and safely changes the production system.
>
> **Important:** This is an operational framework. Exact cloud-provider commands, database-console procedures, and monitoring vendor configuration should be added after the production environment is selected.

---

# 1. Runbook Objective

The engineering team must be able to answer:

```text
What is running?
Is it healthy?
What changed?
Why did it fail?
How do we recover?
How do we prevent recurrence?
```

The runbook covers:

```text
Deployment
Migrations
Ingestion
Retrieval
Supabase
Neo4j
Model providers
SSE
Authentication
Permissions
Backups
Incident response
Rollback
Monitoring
```

---

# 2. Production System

Canonical system:

```text
Users
  ↓
Next.js
  ↓
FastAPI
  ↓
LangGraph
  ├── Cache
  ├── Memory
  ├── Hybrid Retrieval
  ├── Reranking
  ├── Graph Decision
  ├── Neo4j
  └── Generation
  ↓
SSE
  ↓
User
```

Data path:

```text
Sources
  ↓
Connectors
  ↓
Ingestion Workers
  ├── Supabase / pgvector
  └── Neo4j
```

---

# 3. Operational Priorities

When incidents occur, prioritize:

```text
1. Security
2. Data integrity
3. Authorization correctness
4. Core availability
5. Answer quality
6. Latency
7. Cost
```

Never trade security for uptime.

---

# 4. Service Inventory

Maintain an inventory containing:

```text
Frontend
API
Worker
Supabase
Neo4j
Authentication
Model Providers
Monitoring
DNS
```

For each service record:

```text
Owner
Environment
URL / endpoint
Dependencies
Criticality
Recovery method
```

---

# 5. Environment Inventory

Maintain separate inventories for:

```text
Development
Staging
Production
```

Never assume the environments are identical.

---

# 6. Production Ownership

Every critical subsystem should have an owner.

Example:

```text
Frontend
→ Product / Frontend

FastAPI
→ Backend

Retrieval
→ AI / Retrieval

Neo4j
→ Knowledge

Supabase
→ Platform / Backend

Integrations
→ Data Platform

Security
→ Security / Platform
```

The actual team assignments should be filled in by the company.

---

# 7. Daily Production Check

At least once per operating day, review:

```text
Application availability
API error rate
SSE failures
Connector failures
Sync backlog
Supabase health
Neo4j health
Model-provider failures
Cost anomalies
Security alerts
```

---

# 8. Dashboard Health

A production dashboard should summarize:

```text
API
Healthy / Degraded / Down

Workers
Healthy / Backlogged / Down

Supabase
Healthy / Degraded

Neo4j
Healthy / Degraded

Integrations
Healthy / Attention Required

AI Providers
Healthy / Degraded
```

---

# 9. API Health Check

Check:

```text
Health endpoint
Authenticated request
Ask Brain request
```

Expected:

```text
HTTP success
Normal latency
No persistent errors
```

---

# 10. Ask Brain Smoke Test

Use a known synthetic or approved test question.

Example:

```text
What changed in billing deployment?
```

Verify:

```text
Answer
Evidence
Streaming
Citation
Graph context where applicable
```

Do not use real confidential customer questions as routine smoke tests.

---

# 11. Integration Health

Review:

```text
Connected
Syncing
Healthy
Authorization Required
Error
```

Prioritize customer-critical connectors.

---

# 12. Sync Backlog

Monitor:

```text
Queued jobs
Running jobs
Failed jobs
Partial jobs
Oldest queued job
```

A growing backlog may indicate:

```text
worker shortage
provider rate limit
database issue
connector failure
```

---

# 13. Model Provider Health

Monitor providers used by the architecture:

```text
Groq
OpenAI
Jina
Sarvam / configured service
```

Watch:

```text
timeouts
rate limits
error rates
latency
unexpected cost
```

---

# 14. Neo4j Health

Review:

```text
Connectivity
Query latency
Failed queries
CPU / memory
Storage
Connection count
```

The exact metrics depend on deployment.

---

# 15. Supabase Health

Review:

```text
Database availability
Query latency
Connection count
Storage
pgvector performance
RLS behavior
```

Also check scheduled backup status.

---

# 16. Daily Cost Review

Track:

```text
LLM spend
Embedding spend
Reranking spend
Database usage
Hosting
```

Look for unexpected spikes.

---

# 17. Incident Severity

Suggested:

```text
SEV-1
Security/data exposure or complete production outage

SEV-2
Major customer workflow unavailable

SEV-3
Limited degradation

SEV-4
Minor issue
```

The company should define final severity policy.

---

# 18. Incident Lifecycle

```text
Detect
 ↓
Triage
 ↓
Classify
 ↓
Contain
 ↓
Investigate
 ↓
Recover
 ↓
Verify
 ↓
Communicate
 ↓
Postmortem
```

---

# 19. Incident Commander

For significant incidents designate one person as:

> Incident Commander

Responsibilities:

```text
Coordinate response
Set priorities
Track decisions
Assign owners
Communicate status
Declare recovery
```

Do not let everyone independently change production during a major incident.

---

# 20. Communication Principle

During an incident communicate:

```text
What happened
What is affected
What is not affected
Current mitigation
Next decision point
```

Do not speculate publicly.

---

# 21. SEV-1 Security Incident

Examples:

```text
Cross-workspace data exposure
Restricted source leakage
Credential compromise
Permission bypass
```

Immediate priorities:

```text
Contain
Preserve evidence
Stop further exposure
Assess scope
Rotate affected credentials
```

---

# 22. Cross-Tenant Exposure Response

If cross-workspace leakage is suspected:

```text
1. Stop affected endpoint/workflow if necessary.
2. Preserve logs.
3. Identify affected workspaces.
4. Revoke/rotate relevant credentials where needed.
5. Patch authorization issue.
6. Re-run security tests.
7. Verify no further leakage.
8. Follow customer communication policy.
```

Security incidents require explicit ownership and escalation.

---

# 23. Permission Bypass Response

If unauthorized knowledge can be retrieved:

```text
Disable affected path
 ↓
Determine whether source was returned
 ↓
Determine whether cache/graph/citation also leaked
 ↓
Patch authorization
 ↓
Invalidate affected caches
 ↓
Retest
```

Do not merely hide the frontend control.

---

# 24. Database Incident

Symptoms:

```text
API queries timing out
Database unavailable
High error rate
```

Response:

```text
Check Supabase health
 ↓
Check connection saturation
 ↓
Check recent deployment/migration
 ↓
Check query regression
 ↓
Mitigate
 ↓
Recover
```

---

# 25. Supabase RLS Incident

If RLS behaves unexpectedly:

```text
Stop risky operation
 ↓
Identify affected policies
 ↓
Test with representative users
 ↓
Correct policy
 ↓
Run authorization regression
 ↓
Verify production
```

Never disable RLS broadly as a casual workaround.

---

# 26. Neo4j Incident

Symptoms:

```text
Graph queries fail
Knowledge Graph unavailable
Graph-enabled queries degrade
```

Response:

```text
Check connectivity
 ↓
Check database health
 ↓
Check recent schema/query change
 ↓
Determine safe fallback
 ↓
Recover
```

If a safe vector-only fallback exists and has been tested, it may be used.

---

# 27. Graph Corruption Incident

Symptoms:

```text
Unexpected relationships
Duplicate nodes
Incorrect entity mappings
```

Response:

```text
Stop affected write path
 ↓
Identify time window
 ↓
Compare with known-good state
 ↓
Restore/reconcile
 ↓
Run golden graph tests
 ↓
Resume
```

---

# 28. Ingestion Incident

Symptoms:

```text
Sync failures
Large backlog
Missing knowledge
Partial indexing
```

Check:

```text
Connector
Worker
Parser
Model provider
Embedding provider
Supabase
Neo4j
```

---

# 29. Connector Failure

Example:

```text
Slack authorization expired.
```

Response:

```text
Confirm provider status
 ↓
Check authorization
 ↓
Reconnect
 ↓
Test small sync
 ↓
Resume
```

---

# 30. Provider Rate Limit Incident

Symptoms:

```text
429
timeouts
increased latency
```

Response:

```text
Check provider status/limits
 ↓
Reduce concurrency
 ↓
Backoff
 ↓
Queue work
 ↓
Resume gradually
```

Do not create retry storms.

---

# 31. Model Provider Outage

If an LLM provider is unavailable:

```text
Identify affected pipeline stage
 ↓
Determine if tested fallback exists
 ↓
Enable fallback if validated
or
degrade safely
 ↓
Monitor recovery
```

Do not switch models invisibly during a benchmark-sensitive incident unless necessary for availability.

---

# 32. Embedding Provider Failure

If embedding generation fails:

```text
Stop or queue affected ingestion
 ↓
Preserve source data
 ↓
Retry with bounded backoff
 ↓
Monitor provider
 ↓
Resume
```

Do not discard source records because embedding failed.

---

# 33. Reranker Failure

If Jina reranking is unavailable:

```text
Determine whether safe degraded retrieval exists.
```

If supported:

```text
Hybrid retrieval
 ↓
safe fallback
 ↓
answer with appropriate quality limitation
```

Do not silently claim the normal pipeline executed if it did not.

---

# 34. Graph Decision Model Failure

If `sarvam-30b` graph decision fails:

```text
Use safe configured fallback
or
skip graph
```

Only enable a fallback after evaluation.

---

# 35. Generation Failure

If final generation fails:

```text
Do not fabricate an answer.
```

UI:

```text
We couldn't complete this answer.

[ Retry ]
```

---

# 36. SSE Failure

Symptoms:

```text
Answer stops streaming
Client disconnects
Proxy closes stream
```

Check:

```text
Frontend
FastAPI
Proxy
Timeouts
Provider generation
```

---

# 37. SSE Recovery

If safe:

```text
Retry request
```

The client should avoid duplicate message creation.

Use:

```text
message_id
request_id
idempotency
```

where appropriate.

---

# 38. Slow SSE

Symptoms:

```text
Long delay before first token
```

Measure:

```text
TTFT
retrieval latency
graph latency
reranking
generation
```

Do not assume the LLM is the bottleneck.

---

# 39. Retrieval Quality Regression

Symptoms:

```text
Users report wrong answers
Relevant sources missing
Graph context irrelevant
```

Response:

```text
Freeze retrieval release
 ↓
Run golden benchmark
 ↓
Compare current vs previous version
 ↓
Identify changed stage
 ↓
Rollback or patch
 ↓
Re-run benchmark
```

---

# 40. Citation Regression

Symptoms:

```text
Answer cites wrong source
Source doesn't support claim
```

Treat as high-priority trust issue.

Response:

```text
Stop release
 ↓
Run citation benchmark
 ↓
Trace retrieval/provenance
 ↓
Fix
 ↓
Verify
```

---

# 41. Insufficient-Evidence Regression

If the model starts answering questions that previously produced:

```text
Insufficient evidence
```

test:

```text
generation prompt
retrieval changes
context construction
```

This can indicate increased hallucination risk.

---

# 42. Conflict Detection Regression

If contradictory information is silently merged:

```text
Run conflict benchmark
 ↓
Inspect retrieval / temporal logic
 ↓
Fix
```

---

# 43. Cache Incident

If cached responses are stale or unauthorized:

```text
Disable affected cache
 ↓
Invalidate affected entries
 ↓
Verify authorization
 ↓
Restore cache gradually
```

Never keep a cache enabled simply because it improves latency.

---

# 44. Memory Incident

If user memory is incorrect or leaks:

```text
Disable affected memory behavior
 ↓
Identify impacted users
 ↓
Inspect extraction
 ↓
Correct isolation
 ↓
Rebuild affected state
```

---

# 45. Bad Deployment

If production breaks immediately after deployment:

```text
Stop rollout
 ↓
Assess impact
 ↓
Rollback application
 ↓
Verify
```

If database schema changed:

```text
Follow migration recovery procedure.
```

---

# 46. Standard Deployment Flow

```text
PR
 ↓
CI
 ↓
Tests
 ↓
Build
 ↓
Staging
 ↓
Smoke tests
 ↓
Approval
 ↓
Production
 ↓
Smoke test
 ↓
Monitor
```

---

# 47. Deployment Preflight

Before production:

```text
[ ] Tests passing
[ ] Retrieval regression passing
[ ] Security tests passing
[ ] Build passing
[ ] Migrations reviewed
[ ] Configuration reviewed
[ ] Rollback path known
[ ] Monitoring ready
```

---

# 48. Production Deployment

Recommended:

```text
Deploy
 ↓
Health check
 ↓
Authenticated smoke test
 ↓
Ask Brain test
 ↓
Citation test
 ↓
Graph test
 ↓
Monitor errors
```

---

# 49. Post-Deployment Watch

Immediately review:

```text
error rate
latency
SSE
retrieval quality
database health
Neo4j
model provider
```

Keep the previous version available for rollback where practical.

---

# 50. Database Migration Runbook

```text
Review migration
 ↓
Test locally
 ↓
Apply staging
 ↓
Validate
 ↓
Backup / recovery confirmation
 ↓
Production migration
 ↓
Validate
```

---

# 51. Risky Migration

For destructive changes use:

```text
Expand
 ↓
Backfill
 ↓
Switch code
 ↓
Validate
 ↓
Contract later
```

Avoid:

```text
Delete old field
+
deploy immediately
```

---

# 52. Graph Schema Migration

```text
Define new schema
 ↓
Test queries
 ↓
Backfill if required
 ↓
Validate relationships
 ↓
Deploy
```

Preserve provenance.

---

# 53. Retrieval Configuration Change

Treat changes to:

```text
top-k
rerank threshold
graph depth
cache threshold
prompt
model
```

as controlled changes.

Run:

```text
evaluation
+
regression
```

before production.

---

# 54. Model Upgrade Runbook

```text
Candidate model
 ↓
Offline benchmark
 ↓
Security tests
 ↓
Cost/latency analysis
 ↓
Staging
 ↓
Design-partner test
 ↓
Production rollout
```

---

# 55. Prompt Change Runbook

```text
Create version
 ↓
Run benchmark
 ↓
Inspect failures
 ↓
Staging
 ↓
Production
```

---

# 56. Connector Upgrade Runbook

```text
Update adapter
 ↓
Golden connector data
 ↓
Permission tests
 ↓
Sync tests
 ↓
Staging
 ↓
Production
```

---

# 57. Backup Verification

Backups are not enough.

Periodically:

```text
Select backup
 ↓
Restore isolated environment
 ↓
Validate data
 ↓
Validate application connectivity
```

---

# 58. Supabase Restore Runbook

High-level:

```text
Identify backup
 ↓
Restore
 ↓
Check schema
 ↓
Check RLS
 ↓
Check vectors/indexes
 ↓
Run data validation
 ↓
Reconnect application
```

Use the actual platform-specific restore process.

---

# 59. Neo4j Restore Runbook

```text
Identify graph backup
 ↓
Restore isolated graph
 ↓
Validate node counts
 ↓
Validate edge counts
 ↓
Validate key relationships
 ↓
Validate provenance
 ↓
Reconnect
```

---

# 60. Disaster Recovery Test

At a planned interval:

```text
Simulate database outage
 ↓
Restore
 ↓
Run application tests
 ↓
Validate customer data
 ↓
Record recovery time
```

---

# 61. Recovery Metrics

Track:

```text
RPO
How much data could be lost?

RTO
How long to restore service?
```

Actual targets should be defined by customer/service requirements.

---

# 62. Data Reconciliation

After recovery compare:

```text
source item count
chunk count
embedding count
entity count
relationship count
```

against expected ranges/snapshots.

---

# 63. Post-Recovery Validation

Run:

```text
Authentication
Workspace
Ask Brain
Citation
Graph
Integration
Security
```

Do not declare recovery complete until these checks pass.

---

# 64. Security Rotation Runbook

If a secret is exposed:

```text
Identify secret
 ↓
Disable / rotate
 ↓
Update environment
 ↓
Redeploy
 ↓
Verify
 ↓
Review logs for misuse
```

---

# 65. API Key Rotation

For each provider:

```text
Create new key
 ↓
Deploy
 ↓
Verify
 ↓
Revoke old key
```

Avoid leaving old credentials active longer than necessary.

---

# 66. OAuth Credential Rotation

Follow provider-specific mechanism.

After rotation:

```text
Test connector
Check sync
Check permissions
```

---

# 67. MCP Credential Rotation

Future:

```text
Rotate
 ↓
Reconnect clients
 ↓
Verify scope
 ↓
Revoke old credential
 ↓
Audit
```

---

# 68. User Offboarding

When removing a user:

```text
Disable access
 ↓
Revoke sessions as supported
 ↓
Remove workspace membership
 ↓
Review agent/API access
 ↓
Audit
```

User memory and content ownership should follow the defined product policy.

---

# 69. Source Offboarding

When disconnecting a source:

```text
Revoke source authorization
 ↓
Stop future sync
 ↓
Determine indexed-data policy
 ↓
Delete/retain according to customer policy
 ↓
Audit
```

---

# 70. Customer Workspace Offboarding

Maintain a documented process for:

```text
User access removal
Source disconnection
Data export where applicable
Data deletion
Backup retention
Audit retention
```

Exact contractual requirements vary by customer.

---

# 71. Cost Spike Runbook

If AI/cloud cost suddenly rises:

```text
Identify service
 ↓
Identify usage change
 ↓
Check model/provider
 ↓
Check retries/loops
 ↓
Check connector sync
 ↓
Check cache behavior
 ↓
Mitigate
```

---

# 72. Common Cost Causes

Potential:

```text
Retry storm
CRAG over-triggering
Graph overuse
Large context
Repeated embedding
Duplicate ingestion
Agent loop
```

---

# 73. Latency Spike Runbook

```text
Check p95
 ↓
Break down stages
 ↓
Find changed component
 ↓
Compare deployment version
 ↓
Mitigate
```

---

# 74. Latency Breakdown

Measure:

```text
Auth
Cache
Memory
Contextualization
Intent
BM25
Vector
RRF
Rerank 1
Graph decision
Neo4j
Fusion
Rerank 2
Generation
SSE
```

---

# 75. Queue Backlog Runbook

If ingestion backlog grows:

```text
Check worker health
 ↓
Check provider limits
 ↓
Check database latency
 ↓
Check job failures
 ↓
Increase workers only if downstream capacity allows
```

Do not blindly scale workers into a rate-limit problem.

---

# 76. Duplicate Ingestion Incident

Symptoms:

```text
Duplicate source items
Duplicate chunks
Duplicate graph relationships
```

Response:

```text
Stop affected connector
 ↓
Identify duplicate key
 ↓
Patch idempotency
 ↓
Deduplicate
 ↓
Re-run golden ingestion tests
 ↓
Resume
```

---

# 77. Incorrect Graph Relationships

If model extraction produces bad relationships:

```text
Identify source/model version
 ↓
Stop/restrict graph update if needed
 ↓
Rollback/reconcile affected graph
 ↓
Improve extraction rules/prompt
 ↓
Run benchmark
```

---

# 78. Bad Entity Merge

If entity resolution incorrectly merges entities:

```text
Identify canonical + source identities
 ↓
Split/restore
 ↓
Preserve provenance
 ↓
Fix merge criteria
 ↓
Run entity-resolution benchmark
```

---

# 79. Data Freshness Incident

If new source information is not appearing:

```text
Check connector events
 ↓
Check sync
 ↓
Check update detection
 ↓
Check chunk regeneration
 ↓
Check embeddings
 ↓
Check retrieval
```

---

# 80. Stale Answer Incident

If Brain repeatedly returns old information:

```text
Check source update
 ↓
Check ingestion
 ↓
Check cache invalidation
 ↓
Check temporal ranking
 ↓
Check knowledge version
```

---

# 81. Wrong Citation Incident

If answer text is correct but citation is wrong:

```text
Trace:
answer
 ↓
citation
 ↓
source item
 ↓
chunk
```

Fix provenance mapping rather than only changing UI.

---

# 82. Graph Not Updating

If graph lacks new entities:

```text
Check extraction
 ↓
Check Neo4j write
 ↓
Check entity resolution
 ↓
Check source processing status
```

---

# 83. Frontend Incident

Symptoms:

```text
Blank page
broken navigation
Ask Brain not rendering
SSE UI broken
```

Check:

```text
deployment
browser errors
API availability
auth
environment variables
```

Rollback frontend if necessary.

---

# 84. Authentication Incident

If users cannot sign in:

```text
Check Clerk status/configuration
 ↓
Check frontend public configuration
 ↓
Check backend token validation
 ↓
Check callback/redirect configuration
```

Do not weaken authentication as a workaround.

---

# 85. CORS Incident

Symptoms:

```text
Browser blocks API
```

Check:

```text
allowed origins
environment
protocol
domain
```

Do not solve by opening CORS to all origins.

---

# 86. Production Configuration Incident

If configuration is missing:

```text
Identify missing variable
 ↓
Set secure value
 ↓
Redeploy
 ↓
Validate
```

Never commit emergency secrets to Git.

---

# 87. Runbook for Feature Flags

Where feature flags exist:

```text
New feature
 ↓
Staging
 ↓
Small rollout
 ↓
Monitor
 ↓
Increase
```

For risky features:

```text
instant disable
```

should be available where practical.

---

# 88. Feature Rollback

Prefer:

```text
Disable flag
```

before:

```text
rollback deployment
```

when the architecture supports safe feature flags.

---

# 89. Change Log

Every production change should record:

```text
date
change
owner
deployment version
migration
risk
rollback
```

---

# 90. Incident Timeline

During major incidents record:

```text
time
event
decision
owner
result
```

Example:

```text
10:02 Alert
10:06 Triage
10:11 Graph writes disabled
10:18 Root cause identified
10:31 Fix deployed
10:36 Validation passed
```

---

# 91. Postmortem

Every significant incident should capture:

```text
Summary
Impact
Timeline
Root cause
Contributing factors
Detection
Resolution
What went well
What failed
Actions
Owner
Due date
```

---

# 92. Blameless Principle

Focus on:

```text
system conditions
process
architecture
controls
```

rather than personal blame.

---

# 93. Preventive Action

Each serious incident should result in one or more:

```text
test
alert
automation
documentation
architecture change
```

---

# 94. Retrieval Incident Preventive Tests

Examples:

```text
Golden benchmark
Citation test
Conflict test
Insufficient evidence test
Permission test
```

---

# 95. Ingestion Incident Preventive Tests

Examples:

```text
Idempotency test
Source update test
Deletion test
Permission-change test
Graph consistency test
Embedding failure test
```

---

# 96. Security Incident Preventive Tests

Examples:

```text
Cross-tenant test
Graph leakage test
Citation leakage test
Cache leakage test
Agent privilege test
```

---

# 97. Release Runbook

Every release:

```text
Code freeze / release candidate
 ↓
CI
 ↓
Evaluation
 ↓
Security
 ↓
Staging
 ↓
Smoke
 ↓
Deploy
 ↓
Monitor
```

---

# 98. Release Notes

Include:

```text
New
Changed
Fixed
Migration
Known issues
Rollback
```

For internal engineering use.

---

# 99. On-Call Handoff

At handoff communicate:

```text
Active incidents
Pending migrations
Degraded services
Unusual cost
Connector failures
Upcoming deployments
```

---

# 100. On-Call Checklist

```text
[ ] Alerts checked
[ ] Active incidents known
[ ] Deployments known
[ ] Database health known
[ ] Graph health known
[ ] Provider health known
[ ] Sync backlog known
```

---

# 101. Production Access

Production access should be:

```text
Least privilege
Authenticated
Audited
Limited
```

Use stronger controls for administrative access where required.

---

# 102. Emergency Access

Emergency production access should be:

```text
Explicit
Time-bounded
Logged
Reviewed afterward
```

---

# 103. Runbook Storage

Store runbooks in version control.

Recommended:

```text
docs/runbooks/
```

Examples:

```text
api-outage.md
neo4j-outage.md
supabase-outage.md
model-outage.md
security-incident.md
bad-migration.md
retrieval-regression.md
```

---

# 104. Runbook Testing

A runbook is not complete merely because it is written.

Periodically test:

```text
restore
rollback
secret rotation
connector recovery
incident response
```

---

# 105. Automation Opportunities

Automate repetitive checks:

```text
health checks
backup verification
regression benchmarks
secret expiry alerts
cost anomaly detection
sync failure notifications
```

---

# 106. What Should Remain Manual

Human decision should remain for:

```text
security incident scope
major data deletion
customer communication
risky migration
architecture rollback
high-impact agent action
```

---

# 107. Production Readiness Checklist

```text
[ ] Health monitoring
[ ] Error monitoring
[ ] Cost monitoring
[ ] Backup
[ ] Restore
[ ] Rollback
[ ] RLS tests
[ ] Graph tests
[ ] Retrieval tests
[ ] Citation tests
[ ] Connector tests
[ ] SSE tests
[ ] Incident process
[ ] On-call owner
[ ] Runbooks
```

---

# 108. Architecture Change Runbook

When changing architecture:

```text
Proposal
 ↓
Impact analysis
 ↓
ADR
 ↓
Prototype
 ↓
Benchmark
 ↓
Security review
 ↓
Staging
 ↓
Production
```

---

# 109. Architecture Decision Record

Every significant decision should answer:

```text
Context
Problem
Options
Decision
Why
Trade-offs
Consequences
```

---

# 110. Example ADR

```text
ADR:
Selective Graph Expansion

Problem:
Graph traversal adds latency if used for every query.

Decision:
Use a graph-decision stage before Neo4j expansion.

Reason:
Relationship-heavy queries benefit more.

Validation:
Benchmark vector-only vs vector + graph.
```

---

# 111. Operational Principle

> **Do not debug from assumptions. Start from observable evidence: logs, metrics, traces, benchmark results, database state, and source provenance.**

---

# 112. Product Trust Principle

When users report:

```text
"That answer is wrong."
```

the team should be able to trace:

```text
Query
 ↓
Retrieved chunks
 ↓
Graph context
 ↓
Final context
 ↓
Answer
 ↓
Citations
```

where logging/traceability permits.

---

# 113. Security Trust Principle

When someone reports:

```text
"I can see information I shouldn't."
```

the team should be able to determine:

```text
Which principal?
Which workspace?
Which source?
Which API?
Which database path?
Which graph path?
Which cache?
```

---

# 114. Customer-Specific Incident

For a customer-reported issue:

```text
Identify workspace
 ↓
Identify workflow
 ↓
Check source status
 ↓
Trace request
 ↓
Inspect retrieval
 ↓
Inspect permissions
 ↓
Resolve
```

Avoid requesting customer secrets during support.

---

# 115. Support Handoff

Engineering should receive:

```text
workspace
time
workflow
error
request ID
safe reproduction steps
```

rather than:

```text
customer passwords
API credentials
unnecessary source content
```

---

# 116. Operational Documentation Map

Maintain:

```text
Architecture
09

API
10

Data
11

Ingestion
12

Retrieval
13

Graph
14

Security
15

Evaluation
16

Agents/MCP
17

Infrastructure
18

Production Runbooks
19
```

This becomes the internal technical knowledge base.

---

# 117. Daily / Weekly / Monthly Rhythm

## Daily

```text
Health
Alerts
Costs
Failures
Backlog
```

## Weekly

```text
Incidents
Performance
Retrieval quality
Connector reliability
Cost trends
```

## Monthly

```text
Disaster recovery
Security review
Architecture review
Capacity
Customer reliability
```

Exact cadence can change as the company grows.

---

# 118. Weekly Engineering Review

Review:

```text
Top production failures
Top retrieval failures
Top connector failures
Top security findings
Top cost drivers
```

Then decide:

```text
Fix now
Backlog
Monitor
Architecture change
```

---

# 119. Monthly Architecture Review

Review:

```text
Does infrastructure still match scale?
Does graph still provide value?
Are retrieval costs acceptable?
Are permissions still correct?
Are connectors reliable?
Are agents ready for broader deployment?
```

---

# 120. Production Reliability Goal

The system should become:

```text
Predictable
Observable
Recoverable
Secure
```

not merely:

```text
Available.
```

---

# 121. Final Operational Architecture

```text
                    PRODUCTION
                         │
        ┌────────────────┼─────────────────┐
        │                │                 │
     FRONTEND           API              WORKERS
        │                │                 │
        │                ▼                 ▼
        │           LANGGRAPH          INGESTION
        │                │                 │
        │       ┌────────┼────────┐        │
        │       ▼        ▼        ▼        │
        │    SUPABASE   NEO4J   MODELS     │
        │       │        │        │         │
        └───────┴────────┴────────┴─────────┘
                         │
                 OBSERVABILITY
                         │
         ┌───────────────┼────────────────┐
         ▼               ▼                ▼
       LOGS            METRICS          ALERTS
                         │
                         ▼
                    INCIDENT OPS
                         │
                ┌────────┴────────┐
                ▼                 ▼
             RECOVER            IMPROVE
```

---

# 122. Final Operational Loop

```text
BUILD
 ↓
TEST
 ↓
DEPLOY
 ↓
MONITOR
 ↓
DETECT
 ↓
RESPOND
 ↓
RECOVER
 ↓
LEARN
 ↓
IMPROVE
```

---

# 123. Final Runbook Principle

> **Production engineering for CognitRAG is the discipline of keeping the Company Brain secure, correct, observable, recoverable, and continuously improving as customer usage grows.**

---

# 124. Definition of Done

The production operations system is ready when:

```text
[ ] Service inventory exists.
[ ] Owners exist.
[ ] Health dashboards exist.
[ ] Alerts exist.
[ ] Deployment procedure exists.
[ ] Rollback exists.
[ ] Migration process exists.
[ ] Backup exists.
[ ] Restore has been tested.
[ ] Connector runbooks exist.
[ ] Retrieval regression runbook exists.
[ ] Security incident runbook exists.
[ ] Cost incident runbook exists.
[ ] Model outage procedure exists.
[ ] SSE incident procedure exists.
[ ] On-call process exists.
[ ] Postmortem process exists.
[ ] Architecture change process exists.
[ ] Operational documentation is version controlled.
```

---

# 125. Final Engineering Statement

> **CognitRAG should be operated as a production intelligence platform—not as a demo application: every important data path should be observable, every security boundary should be testable, every major failure should have a recovery procedure, and every architectural change should be validated by evidence.**
