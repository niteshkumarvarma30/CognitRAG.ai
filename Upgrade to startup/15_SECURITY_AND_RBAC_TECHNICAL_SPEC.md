# 15 — CognitRAG Security & RBAC Technical Specification
## Identity, Tenant Isolation, Permissions, RLS, Knowledge Access & Auditability

> **Status:** Master security and authorization specification.
>
> **Technical source of truth:** `Architecture(1).md`
>
> **Dependencies:** `10_API_CONTRACTS.md`, `11_DATA_MODEL.md`, `13_RETRIEVAL_PIPELINE_SPEC.md`, `14_KNOWLEDGE_GRAPH_SPEC.md`
>
> **Purpose:** Define how CognitRAG protects company knowledge across the frontend, FastAPI backend, Supabase/pgvector, Neo4j, retrieval pipeline, and future agent layer.
>
> **Important:** This document formalizes the security boundary. It does not claim compliance certifications or security controls that are not actually implemented.

---

# 1. Security Objective

CognitRAG handles company knowledge that may include:

```text
Engineering information
Customer information
Operational information
Internal discussions
Policies
Documents
Business logic
AI-agent context
```

The security architecture must therefore protect:

```text
Identity
+
Workspace isolation
+
Source permissions
+
Knowledge access
+
Agent access
+
Auditability
```

---

# 2. Core Security Principle

The most important rule is:

> **Authorization must happen before restricted knowledge reaches the answer pipeline.**

The frontend must never be treated as the security boundary.

---

# 3. Existing Security Architecture

The current architecture explicitly uses:

```text
Clerk
Authentication

Supabase
PostgreSQL + pgvector

Supabase RLS
Database-level access control

Neo4j
Semantic graph / ontology

Source metadata
Provenance / access context
```

The architecture also states that roles map into Supabase Row Level Security and that unauthorized access is blocked before vectors are retrieved.

---

# 4. Security Layers

CognitRAG should be understood as multiple security boundaries:

```text
Layer 1
Identity

Layer 2
Workspace / Tenant

Layer 3
Application Authorization

Layer 4
Database RLS

Layer 5
Source Permissions

Layer 6
Graph Authorization

Layer 7
Retrieval Filtering

Layer 8
Answer / Citation Filtering

Layer 9
Audit
```

No single layer should be assumed to replace all others.

---

# 5. Identity

The existing architecture uses:

```text
Clerk
```

for authentication.

Conceptual flow:

```text
User
 ↓
Clerk
 ↓
Authenticated identity
 ↓
FastAPI
```

The backend must validate the authenticated identity.

---

# 6. Authentication vs Authorization

Keep these concepts separate.

```text
Authentication
"Who are you?"

Authorization
"What are you allowed to access or do?"
```

Clerk primarily handles identity/authentication while application/database layers enforce authorization according to the deployed design.

---

# 7. Identity Trust Boundary

The frontend may receive:

```text
user identity
workspace identity
role
```

but the backend must independently validate them.

Never trust:

```text
client-provided role
client-provided workspace membership
client-provided permission
```

as security decisions.

---

# 8. Workspace / Tenant Isolation

Every customer operates within a workspace boundary.

Conceptually:

```text
Workspace A
 ├── Users A
 ├── Sources A
 ├── Knowledge A
 └── Conversations A

Workspace B
 ├── Users B
 ├── Sources B
 ├── Knowledge B
 └── Conversations B
```

No request should be able to cross this boundary.

---

# 9. Tenant Isolation Rule

Every workspace-scoped operation should resolve:

```text
authenticated user
+
workspace membership
+
workspace identifier
```

before accessing data.

---

# 10. Workspace ID Validation

If a request contains:

```text
workspace_id
```

FastAPI should verify:

```text
Does this authenticated user belong to this workspace?
```

If not:

```text
403
```

or a privacy-preserving not-found response where appropriate.

---

# 11. Database Tenant Isolation

Supabase records should be scoped appropriately to:

```text
workspace_id
```

and protected using:

```text
Row Level Security
```

where applicable.

---

# 12. Supabase RLS

The existing architecture explicitly uses:

```text
Supabase Row Level Security
```

as a database-level security boundary.

Conceptually:

```text
Authenticated user
 ↓
RLS policy
 ↓
Authorized rows only
```

---

# 13. Why RLS Matters

Frontend filtering is not enough.

Bad:

```text
Database returns all records
 ↓
Frontend hides unauthorized records
```

Correct:

```text
Database / query boundary
 ↓
Unauthorized records never returned
```

---

# 14. RLS Policy Principles

RLS policies should account for:

```text
workspace membership
user identity
role
source scope
resource ownership
```

Exact policy expressions belong in the implementation repository.

---

# 15. Role Model

Initial roles:

```text
Admin
Member
Viewer
```

These roles should map to clearly defined permissions.

---

# 16. Admin

Potential capabilities:

```text
Manage users
Manage integrations
Manage workspace settings
Manage permissions
Review knowledge
View authorized security information
```

Only expose capabilities actually implemented.

---

# 17. Member

Potential:

```text
Ask Brain
Browse permitted knowledge
Explore permitted graph
```

Additional editing permissions can be added deliberately.

---

# 18. Viewer

Potential:

```text
Read permitted knowledge
Ask Brain
```

No administrative controls.

---

# 19. Permission Model

Use explicit permissions conceptually such as:

```text
knowledge.read
knowledge.write
knowledge.approve

integration.read
integration.manage

security.read
security.manage

agent.read
agent.manage
```

Exact permission names must be standardized by the authorization implementation.

---

# 20. Role → Permission

Conceptual:

```text
Admin
 ├── read
 ├── write
 ├── approve
 ├── integrations
 └── security

Member
 ├── read
 └── ask

Viewer
 └── read
```

This is a product-policy starting point, not a final security matrix.

---

# 21. Resource Authorization

Authorization must consider not only role but also resource.

Example:

```text
Member
+
Engineering role
```

does not necessarily imply access to:

```text
HR document
```

---

# 22. Source Permissions

Connected source systems may have their own permission boundaries.

Example:

```text
Slack
 ├── #engineering
 ├── #support
 └── #hr
```

A user may have access to:

```text
#engineering
```

but not:

```text
#hr
```

---

# 23. Permission Propagation

Conceptual flow:

```text
Source permission
 ↓
Source item
 ↓
Document
 ↓
Chunk metadata
 ↓
Retrieval authorization
 ↓
Answer
```

The exact implementation can enforce authorization centrally, but it must guarantee the same outcome.

---

# 24. Critical Retrieval Security Rule

A restricted source item must not become accessible simply because:

```text
it was indexed
```

Indexing does not override source authorization.

---

# 25. Permission Enforcement in Ask Brain

When a user asks:

```text
"What happened in HR?"
```

the retrieval path must operate within the user's permitted knowledge boundary.

Potential:

```text
Query
 ↓
Authorization context
 ↓
Retrieval
 ↓
Authorized evidence
 ↓
Answer
```

---

# 26. Permission Filtering Before Generation

Restricted context must be removed before:

```text
Final context assembly
```

and therefore before:

```text
LLM generation
```

---

# 27. Cache Security

Cached results are not exempt from authorization.

Conceptually:

```text
Cached answer
 ↓
Current authorization check
 ↓
Return only if authorized
```

A prior user permission cannot be assumed to remain valid forever.

---

# 28. Cache Invalidation on Permission Changes

When a permission boundary changes, consider:

```text
Cache invalidation
```

for affected content.

The exact implementation should be documented.

---

# 29. Search Security

Search results must respect current authorization.

Do not return:

```text
restricted titles
restricted snippets
restricted source references
```

unless metadata visibility is explicitly allowed.

---

# 30. Vector Search Security

The vector retrieval layer must operate within a permission-aware boundary.

Possible approach:

```text
RLS-constrained query
+
permission metadata
```

The exact implementation should follow the existing Supabase architecture.

---

# 31. Reranking Security

Reranking must only operate on authorized candidate content.

Do not:

```text
retrieve unauthorized content
then rerank
then hide it later
```

The restricted content has already crossed a security boundary.

---

# 32. Graph Security

Neo4j must also respect:

```text
workspace
+
user authorization
+
source/resource permission
```

---

# 33. Graph Authorization

Conceptual:

```text
User
 ↓
Workspace
 ↓
Permission context
 ↓
Neo4j query
 ↓
Authorized nodes / relationships
```

The exact technical implementation may use:

```text
query constraints
application-side filtering
separate graph boundaries
```

or another robust strategy.

---

# 34. Graph Leakage Risk

Even if a restricted document's content is hidden, graph structure itself can leak information.

Example:

```text
Restricted HR Person
      ↓
belongs_to
      ↓
Executive Investigation
```

Even the existence of that relationship may be sensitive.

Therefore graph metadata must also be permission-aware.

---

# 35. Citation Security

A citation must not expose unauthorized content.

Before returning a citation:

```text
Validate source access
```

Then:

```text
Return permitted citation
```

---

# 36. Citation Metadata Security

Potentially sensitive:

```text
source title
channel name
document name
external URL
entity metadata
```

Only expose fields allowed by policy.

---

# 37. Source Receipt Security

The Source Receipt drawer should only display information the user is authorized to see.

If the source is inaccessible:

```text
You don't have permission to view this source.
```

Do not expose restricted snippets.

---

# 38. Permission-Limited Answer

When relevant context is restricted:

```text
Some information relevant to this question
is not available to your account.
```

Do not reveal:

```text
exact restricted text
hidden source details
```

unless policy permits.

---

# 39. Not Found vs Forbidden

For sensitive resources, the system may intentionally return:

```text
404
```

instead of:

```text
403
```

to avoid revealing resource existence.

Use this deliberately.

---

# 40. API Authorization Pipeline

Every protected request:

```text
Request
 ↓
Authenticate
 ↓
Resolve identity
 ↓
Resolve workspace
 ↓
Check membership
 ↓
Check role/permission
 ↓
Check resource access
 ↓
Execute
```

---

# 41. API Input Security

Validate:

```text
workspace ID
resource ID
query
pagination
filters
enum values
request size
```

Never trust frontend validation alone.

---

# 42. API Output Security

Before returning data:

```text
Select only allowed fields
 ↓
Remove sensitive metadata
 ↓
Serialize response
```

---

# 43. Secret Management

Never return:

```text
OAuth refresh tokens
API keys
model provider secrets
MCP secrets
database credentials
encryption keys
```

through ordinary APIs.

---

# 44. Integration Credential Storage

Provider credentials should use secure secret storage.

Conceptually:

```text
OAuth
 ↓
Encrypted storage
 ↓
Connector
```

The frontend should receive:

```text
connection status
```

not raw credentials.

---

# 45. OAuth Security

OAuth implementations should protect against:

```text
CSRF
state mismatch
authorization-code replay
redirect tampering
token leakage
```

The precise implementation is provider-specific.

---

# 46. Agent Security

Future agents should not automatically inherit all user permissions.

The product must establish:

```text
agent principal
+
workspace
+
allowed sources
+
allowed skills
+
allowed actions
```

---

# 47. Agent Context Authorization

Before returning context to an agent:

```text
Identify requesting principal
 ↓
Resolve agent permissions
 ↓
Resolve workspace
 ↓
Filter knowledge
 ↓
Return authorized context
```

---

# 48. Agent Action Authorization

For write operations:

```text
Context access
```

and:

```text
Action permission
```

must be separate.

An agent may be allowed to:

```text
read customer policy
```

without being allowed to:

```text
change customer status
```

---

# 49. Human Approval

High-impact agent actions can require:

```text
Human approval
```

Flow:

```text
Agent proposes
 ↓
Human reviews context
 ↓
Human approves
 ↓
Action executes
 ↓
Audit
```

---

# 50. Agent Audit

Record where appropriate:

```text
Agent
Principal
Action
Resource
Time
Result
Approval
```

Do not store unnecessary sensitive payloads.

---

# 51. MCP Security

MCP clients must have explicit access context.

Potential:

```text
MCP connection
 ↓
Workspace
 ↓
Principal
 ↓
Allowed context
```

---

# 52. MCP Secret Security

MCP credentials must be:

```text
Stored securely
Rotatable
Revocable
Auditable
```

Never place long-lived secrets directly into frontend source code.

---

# 53. Conversation Security

Users should only access conversations they are authorized to access.

A conversation ID must not be sufficient to retrieve another user's conversation.

---

# 54. Shared Answers

If answer sharing is implemented:

```text
Current permissions
```

must remain enforced.

Do not create public links to private knowledge by default.

---

# 55. User Memory Security

User memory is:

```text
user-specific
```

and should not automatically be shared with other workspace members.

---

# 56. Memory Isolation

Conceptually:

```text
User A memory
≠
User B memory
```

unless explicitly shared through a product feature.

---

# 57. Memory + Company Knowledge

User memory must not become an unauthorized alternative access path.

For example:

```text
User A has seen restricted information
```

must not imply:

```text
User A can cause an agent or another workflow
to expose that information later.
```

Authorization remains authoritative.

---

# 58. Logging

Security-relevant events should be logged.

Potential:

```text
Authentication events
Authorization failures
Role changes
Permission changes
Integration changes
Knowledge approvals
Agent activation
Sensitive configuration changes
```

---

# 59. Audit Logs

Audit events should contain:

```text
actor
action
resource
timestamp
result
request_id
```

where appropriate.

---

# 60. Audit vs Application Logs

Keep distinct:

```text
Application logs
→ operational debugging

Audit logs
→ security/governance trail
```

An audit record should be stable and queryable.

---

# 61. Audit Integrity

Audit records should not be casually editable by ordinary users.

Administrative access should be tightly controlled.

Retention depends on customer/security policy.

---

# 62. Security Event Examples

```text
Admin changed member role.
User authorization failed.
GitHub connection created.
Slack scope changed.
SOP approved.
Agent activated.
MCP connection created.
```

---

# 63. Rate Limiting

Protect:

```text
Authentication
Chat
Search
Integration operations
Agent execution
Admin APIs
```

The exact rates should be based on workload and abuse patterns.

---

# 64. Abuse Prevention

Potential protections:

```text
Rate limits
Request size limits
Input validation
Account controls
Suspicious activity monitoring
```

Do not introduce claims about advanced threat detection unless implemented.

---

# 65. Network Security

At minimum:

```text
TLS / HTTPS
Secure cookies/session handling
Protected backend endpoints
Secure database connections
```

Infrastructure requirements should be documented separately.

---

# 66. Browser Security

Configure appropriate browser protections such as:

```text
Content Security Policy
Secure headers
SameSite cookies where applicable
Frame restrictions
```

Exact configuration depends on deployment.

---

# 67. CORS

Only allow trusted origins.

Avoid:

```text
Access-Control-Allow-Origin: *
```

for authenticated sensitive APIs unless the design explicitly requires it and security implications are understood.

---

# 68. CSRF

For cookie-based authenticated mutation requests, use appropriate CSRF protections.

For bearer-token architectures, follow the security properties of the implemented authentication mechanism.

---

# 69. XSS Protection

User/source content may contain hostile text.

The UI must safely render:

```text
Slack messages
documents
Markdown
source content
user-generated knowledge
```

Never insert untrusted HTML without sanitization.

---

# 70. Markdown Security

If Markdown is rendered:

```text
sanitize HTML
restrict dangerous URLs
avoid arbitrary script execution
```

Do not assume Markdown is inherently safe.

---

# 71. Prompt Injection Consideration

Enterprise source content can contain instructions such as:

```text
Ignore previous instructions...
```

The retrieval system should treat source content as data, not as trusted system instructions.

---

# 72. Source Content Trust Boundary

Conceptually:

```text
System instructions
>
Application policy
>
Authorized company context
>
Untrusted source text
```

The exact prompt architecture should enforce this hierarchy.

---

# 73. Prompt Injection in RAG

Retrieved text should not be allowed to redefine:

```text
system policy
authorization
tool permissions
```

The model should receive clear separation between:

```text
instructions
```

and:

```text
retrieved evidence
```

---

# 74. Agent Prompt Injection

Agents are especially sensitive because retrieved content may influence actions.

Therefore:

```text
retrieved content
≠
authorization
```

The tool/action layer must independently enforce permissions.

---

# 75. Tool Security

Future tools must verify authorization at execution time.

Do not rely on the LLM deciding:

```text
"I am allowed to do this."
```

The system must enforce it.

---

# 76. Write-Back Security

For future actions:

```text
Agent
 ↓
Action request
 ↓
Authorization service
 ↓
Policy check
 ↓
Human approval if required
 ↓
Tool
```

---

# 77. Data Deletion

Customers need a defined way to remove:

```text
Source connection
Indexed content
Knowledge
Conversations
User memory
Workspace
```

Exact retention/deletion behavior must be documented.

---

# 78. Disconnect vs Delete

These are different:

```text
Disconnect Source
→ stop future synchronization

Delete Indexed Data
→ remove existing indexed representation
```

The UI and API must make this distinction clear.

---

# 79. Permission Revocation

When a user loses access:

```text
User role changes
 ↓
Authorization updates
 ↓
RLS / application access changes
 ↓
Graph access changes
 ↓
Future retrieval blocks restricted content
```

Cache behavior must also be considered.

---

# 80. Source Scope Reduction

Example:

```text
Slack
Before:
43 channels

After:
36 channels
```

The system must ensure newly excluded content is no longer retrievable according to policy.

---

# 81. Data Retention

Retention policies should separately consider:

```text
Raw source data
Indexed content
Vectors
Graph objects
Conversation history
User memory
Audit records
```

Do not assume identical retention rules.

---

# 82. Backups

Production architecture should define:

```text
What is backed up?
How often?
How is it encrypted?
How is it restored?
Who can restore?
```

This belongs in deployment/operations documentation.

---

# 83. Disaster Recovery

Define:

```text
Recovery Point Objective
Recovery Time Objective
Database recovery
Graph recovery
Object storage recovery
Secret recovery
```

Exact targets should be set according to customer requirements.

---

# 84. Security Testing

Test:

```text
Unauthorized API access
Cross-workspace access
RLS bypass attempts
Graph leakage
Citation leakage
Permission changes
Source scope changes
Agent privilege escalation
MCP access
```

---

# 85. Cross-Tenant Test

Test:

```text
User from Workspace A
requests Workspace B resource
```

Expected:

```text
Denied
```

Also test indirect retrieval paths.

---

# 86. Indirect Leakage Test

Example:

```text
Workspace A user
asks a question whose answer could be constructed
from Workspace B context.
```

Expected:

```text
Workspace B data never enters retrieval context.
```

---

# 87. Graph Leakage Test

Test:

```text
Restricted node
Restricted edge
Restricted source metadata
```

Expected:

```text
Not exposed.
```

---

# 88. Citation Leakage Test

Test whether:

```text
restricted source
```

can accidentally appear through:

```text
answer citation
source chip
graph evidence
share link
activity event
```

All paths must be checked.

---

# 89. Cache Leakage Test

Test:

```text
User A has access.
User B does not.
```

User B requests similar query.

Expected:

```text
No unauthorized cached answer.
```

---

# 90. Agent Privilege Escalation Test

Test:

```text
User has support access.
Agent has support access.
Agent attempts HR access.
```

Expected:

```text
Denied.
```

---

# 91. Prompt Injection Test

Seed source content with hostile instructions.

Expected:

```text
Retrieved text does not override
system/application policies.
```

---

# 92. Secret Scanning

Before production:

```text
Scan repository
Scan logs
Scan configuration
Scan client bundle
```

for:

```text
API keys
tokens
passwords
private credentials
```

---

# 93. Secure Configuration

Secrets should be supplied through:

```text
environment / secret manager
```

not committed into source code.

---

# 94. Environment Separation

Maintain:

```text
Development
Staging
Production
```

with separate:

```text
credentials
databases
API keys
OAuth applications
```

where required.

---

# 95. Production Access

Production administrative access should be limited.

Potential controls:

```text
Least privilege
MFA
Short-lived credentials
Audit
```

The exact operational policy belongs in infrastructure documentation.

---

# 96. Least Privilege

Every component should receive only the permissions it needs.

Examples:

```text
Frontend
No database credentials.

Chat service
Only required knowledge access.

Integration worker
Only required provider scope.

Agent
Only configured tools/context.
```

---

# 97. Service Credentials

Avoid sharing one universal secret across all services.

Use separate credentials where practical.

---

# 98. Database Credentials

Database access should be scoped to the required application functionality.

Do not expose database credentials to browsers.

---

# 99. Model Provider Security

If external AI providers receive customer content, document:

```text
Which provider
What data is sent
Why
Retention behavior
Applicable contractual controls
```

Only publish verified provider behavior.

---

# 100. Model Input Minimization

Send only the context needed for the model task.

Example:

```text
Final generation
→ Top 15 fused context
```

rather than:

```text
entire company database
```

---

# 101. Model Output Handling

Treat model output as untrusted generated data.

Validate structured outputs before:

```text
database writes
graph writes
rule creation
tool actions
```

---

# 102. Graph Extraction Safety

The graph extraction model should not be allowed to execute actions.

Its output should be:

```text
validated
normalized
reviewed where necessary
```

before becoming semantic company state.

---

# 103. Semantic Dictionary Security

Only authorized users should modify authoritative definitions.

Potential:

```text
Admin
or
designated knowledge owner
```

The exact governance model must be implemented.

---

# 104. Rule Security

Only authorized users should:

```text
create
approve
activate
deprecate
```

authoritative rules.

---

# 105. SOP Security

Important SOP publication should require appropriate permission.

Example:

```text
Member
→ Draft

Manager/Admin
→ Approve
```

if that policy is chosen.

---

# 106. Decision Security

Sensitive organizational decisions may need narrower visibility than ordinary knowledge.

The data model and permission model should support this where required.

---

# 107. Security-Aware Search

Search indexing should not become a shortcut around permission enforcement.

Always resolve:

```text
who is asking
what may they access
```

before returning meaningful data.

---

# 108. Security-Aware Graph

Graph browsing must follow the same security expectations as Ask Brain.

A user must not gain more information by switching from:

```text
Ask Brain
```

to:

```text
Graph
```

---

# 109. Security-Aware Activity

Activity records may expose sensitive information.

Therefore:

```text
activity permissions
```

must be defined separately from:

```text
knowledge permissions
```

where necessary.

---

# 110. Security-Aware Notifications

Notifications should not leak restricted information.

Bad:

```text
New confidential HR incident created.
```

to a user without access.

Better:

```text
New activity requires attention.
```

only if the user is legitimately entitled to know that an event exists.

---

# 111. Security-Aware Analytics

Do not expose:

```text
sensitive query content
private documents
restricted user activity
```

in broad analytics dashboards.

---

# 112. Security-Aware Sharing

Shared links must evaluate:

```text
current authorization
```

not only authorization at link creation time.

---

# 113. Auditability

Important security-relevant actions should be traceable to:

```text
who
what
when
where
result
```

---

# 114. Audit Examples

```text
09:42
Admin
Role changed
Priya → Member

09:18
Admin
Slack scope updated

08:51
Manager
SOP approved
Billing Deployment v3.2
```

---

# 115. Security UX

Security should be understandable.

Users should know:

```text
What can I access?
What can this integration access?
What can this agent access?
What changed?
```

---

# 116. Permission Preview

Before connection:

```text
This integration can access:

✓ Engineering channels
✓ Public company documents

× HR
× Finance
```

---

# 117. Agent Permission Preview

Before activation:

```text
This agent can access:

✓ Support tickets
✓ Customer policies

× HR
× Finance

Allowed actions:
✓ Read
× Refund execution
```

---

# 118. Security Status

Dashboard can show:

```text
Security

Access controls      Healthy
Integrations         Healthy
Audit logging        Enabled
```

Only display statuses that are actually measured.

---

# 119. Security Incidents

If a security problem is detected:

```text
Security alert

GitHub authorization failed repeatedly.

[ Review Integration ]
```

The exact detection system must exist before displaying advanced alerts.

---

# 120. Incident Response

The company should maintain an internal process for:

```text
Detection
Containment
Investigation
Remediation
Customer communication
Post-incident review
```

This is an operational requirement.

---

# 121. Security Documentation

Create a public-facing security page containing only verified information:

```text
Authentication
Data access
Encryption
Permissions
Source handling
Audit
Data deletion
AI provider handling
```

---

# 122. Avoid Unsupported Certifications

Do not claim:

```text
SOC 2
ISO 27001
HIPAA
GDPR certification
PCI
```

unless the company has actually completed the relevant work and the claim is accurate.

---

# 123. Security Roadmap

Potential future:

```text
SSO
SCIM
SAML
Advanced audit
BYOK
Private deployment
Customer-managed keys
Network controls
Advanced compliance
```

Do not promise dates without a committed roadmap.

---

# 124. MVP Security Scope

P0:

```text
Clerk authentication
Workspace isolation
RBAC
Supabase RLS
Permission-aware retrieval
Secure source scopes
Secret management
Audit for consequential actions
```

---

# 125. P1 Security Scope

```text
Advanced audit
Knowledge governance
Detailed source policy
Security center
Permission analytics
```

---

# 126. P2 Enterprise Security Scope

```text
SSO
SCIM
Advanced enterprise identity
Private deployment
Customer-managed keys
Advanced compliance controls
```

---

# 127. Security Testing Matrix

```text
AUTH
✓ Valid login
✓ Invalid session

TENANT
✓ Same workspace
✓ Cross-workspace denied

RBAC
✓ Admin
✓ Member
✓ Viewer
✓ Insufficient permission

SOURCE
✓ Allowed source
✓ Restricted source

SEARCH
✓ Permission filtering

GRAPH
✓ Permission filtering

CACHE
✓ Permission validation

CITATIONS
✓ Restricted source hidden

AGENT
✓ Context restriction
✓ Action restriction

MCP
✓ Principal restriction
```

---

# 128. Security Review Before Customer Data

Before production customer onboarding:

```text
[ ] Authentication reviewed
[ ] RLS reviewed
[ ] Workspace isolation tested
[ ] Graph authorization tested
[ ] Source permission behavior tested
[ ] Cache security tested
[ ] Citation security tested
[ ] Secret handling reviewed
[ ] Prompt injection tested
[ ] Agent privilege model reviewed
[ ] Data deletion process documented
[ ] Backup/recovery tested
[ ] Logging reviewed
[ ] Incident response defined
```

---

# 129. Final Security Architecture

```text
                    USER
                      │
                      ▼
                    CLERK
                Authentication
                      │
                      ▼
                 FASTAPI API
                      │
             ┌────────┴────────┐
             │                 │
       Workspace check      RBAC
             │                 │
             └────────┬────────┘
                      ▼
                AUTH CONTEXT
                      │
             ┌────────┴───────────┐
             │                    │
       SUPABASE / RLS          NEO4J
             │                    │
       Vectors / Data       Graph / Ontology
             │                    │
             └────────┬───────────┘
                      ▼
                  RETRIEVAL
                      │
            Permission-aware context
                      │
                      ▼
                  GENERATION
                      │
            ┌─────────┴──────────┐
            ▼                    ▼
         ANSWER               SOURCES
            │                    │
            └─────────┬──────────┘
                      ▼
                    AUDIT
```

---

# 130. Final Retrieval Security Lifecycle

```text
QUESTION
   ↓
IDENTITY
   ↓
WORKSPACE
   ↓
PERMISSIONS
   ↓
CACHE
   ↓
MEMORY
   ↓
BM25 + VECTOR
   ↓
RERANK
   ↓
GRAPH
   ↓
FUSION
   ↓
FINAL CONTEXT
   ↓
GENERATION
   ↓
CITATIONS
```

At every stage:

```text
Do not cross the authorization boundary.
```

---

# 131. Final Security Principle

> **Security must follow knowledge through the entire system, not stop at the database or login page.**

---

# 132. Final RBAC Principle

> **Roles should determine what a user may do; resource permissions should determine what knowledge they may access; the backend and database must enforce both.**

---

# 133. Final Product Security Principle

> **A Company Brain is only valuable when users can trust that it knows what they are allowed to know, does not expose what they are not allowed to know, and can show how important information reached an answer.**

---

# 134. Definition of Done

Security is ready for MVP customer data when:

```text
[ ] Clerk authentication works.
[ ] Workspace isolation is enforced.
[ ] RBAC is defined.
[ ] Supabase RLS is tested.
[ ] Source permissions are respected.
[ ] Vector retrieval is permission-aware.
[ ] Graph access is permission-aware.
[ ] Citations do not leak restricted information.
[ ] Cache does not bypass permissions.
[ ] User memory is isolated.
[ ] Agent permissions are bounded.
[ ] Secrets are securely stored.
[ ] Sensitive logs are controlled.
[ ] Audit events exist for important actions.
[ ] Cross-tenant tests pass.
[ ] Prompt-injection tests exist.
[ ] Data deletion process exists.
[ ] Incident response process exists.
```

---

# 135. Canonical Security Statement

> **CognitRAG is designed around layered authorization: authenticated identity through Clerk, workspace isolation, role-based access, database-level controls through Supabase RLS, source-aware permissions, permission-aware graph and retrieval paths, and auditable consequential actions.**

This statement should only be expanded with additional claims when the corresponding controls are actually implemented and verified.
