# 10 — CognitRAG API Contracts
## Frontend ↔ FastAPI ↔ Knowledge Layer Contract Specification

> **Status:** API contract planning document.
>
> **Technical source of truth:** `Architecture(1).md`
>
> **Product/UI dependencies:** `05_COMPLETE_UI_UX_SPECIFICATION.md`, `06_USER_FLOWS_AND_INTERACTIONS.md`, `07_MVP_PRODUCT_REQUIREMENTS.md`, `09_TECHNICAL_PRODUCT_ARCHITECTURE_AND_WORKFLOW.md`
>
> **Important:** The routes and schemas in this document are proposed product-level contracts. They are not claims that every route already exists in the current codebase. Existing implemented routes should be mapped to these contracts rather than blindly replaced.

---

# 1. API Design Objective

The API layer is the boundary between:

```text
Next.js Product
       ↓
FastAPI
       ↓
LangGraph / Knowledge Services
       ↓
Supabase + Neo4j + Model Services
```

The API should expose stable product operations rather than exposing every internal retrieval step.

---

# 2. API Principles

The API should be:

```text
Predictable
Versioned
Authenticated
Workspace-scoped
Permission-aware
Traceable
Backward-compatible where practical
```

The frontend should not know:

```text
RRF implementation
Reranker threshold
Graph routing logic
Model routing
Embedding implementation
Cache internals
```

---

# 3. Versioning

Recommended base:

```text
/api/v1
```

Future breaking changes:

```text
/api/v2
```

Do not silently change the meaning of an existing response field.

---

# 4. Authentication

The existing architecture uses Clerk.

Conceptual request:

```text
Frontend
 ↓
Clerk session
 ↓
FastAPI
 ↓
Validate authenticated identity
 ↓
Resolve workspace membership
 ↓
Authorize operation
```

The backend must treat frontend-provided user/workspace identifiers as untrusted until validated.

---

# 5. Workspace Scope

Every workspace-scoped request should resolve:

```text
authenticated_user
workspace
role
permissions
```

Conceptual:

```json
{
  "workspace_id": "ws_demo",
  "user_id": "usr_demo"
}
```

These identifiers are examples only.

---

# 6. Standard API Response Principle

Successful responses should be:

```text
HTTP status
+
JSON body
```

Errors should be:

```text
HTTP status
+
machine-readable error code
+
human-readable message
+
request ID where available
```

---

# 7. Common Error Shape

Recommended:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested knowledge item could not be found.",
    "request_id": "req_demo"
  }
}
```

The actual production error schema should be standardized once implementation begins.

---

# 8. Common Error Codes

Recommended categories:

```text
AUTHENTICATION_REQUIRED
AUTHORIZATION_DENIED
WORKSPACE_NOT_FOUND
VALIDATION_ERROR
RESOURCE_NOT_FOUND
CONFLICT
RATE_LIMITED
INTEGRATION_ERROR
SYNC_ERROR
RETRIEVAL_ERROR
GENERATION_ERROR
STREAM_ERROR
INTERNAL_ERROR
```

---

# 9. HTTP Semantics

Recommended:

```text
GET
Read

POST
Create / execute

PATCH
Partial update

DELETE
Delete / remove
```

Do not use POST for every operation unless required by the architecture.

---

# 10. Request Correlation

Every backend request should have a request ID.

Conceptual:

```text
Frontend
X-Request-ID
        ↓
FastAPI
        ↓
Logs
        ↓
Downstream operations
```

If the backend generates the ID, return it in the response or stream metadata.

---

# 11. Core API Surface

Proposed product-level areas:

```text
/auth
/workspaces
/chat
/knowledge
/graph
/integrations
/activity
/security
/agents
/skills
/mcp
/settings
```

The final route tree should reflect the actual application structure.

---

# 12. Health Endpoint

Recommended:

```text
GET /api/v1/health
```

Purpose:

> Internal/system health check.

Potential response:

```json
{
  "status": "healthy"
}
```

This should not expose sensitive infrastructure information publicly.

---

# 13. User Context

Recommended:

```text
GET /api/v1/me
```

Response concept:

```json
{
  "id": "usr_demo",
  "name": "Demo User",
  "email": "user@example.com",
  "workspace_id": "ws_demo",
  "role": "member"
}
```

Actual identity fields depend on the authentication system.

---

# 14. Workspace API

## Create Workspace

```text
POST /api/v1/workspaces
```

Request:

```json
{
  "name": "AcmeCloud"
}
```

Response:

```json
{
  "id": "ws_demo",
  "name": "AcmeCloud"
}
```

---

# 15. Workspace Detail

```text
GET /api/v1/workspaces/{workspace_id}
```

Response should include only information the caller is authorized to see.

---

# 16. Workspace Update

```text
PATCH /api/v1/workspaces/{workspace_id}
```

Potential fields:

```json
{
  "name": "AcmeCloud"
}
```

---

# 17. ASK BRAIN API

The architecture currently references:

```text
/api/v1/chat/stream
```

This should remain the canonical streaming endpoint if already implemented.

---

# 18. Chat Stream Request

Conceptual:

```text
POST /api/v1/chat/stream
```

Request:

```json
{
  "workspace_id": "ws_demo",
  "conversation_id": "conv_demo",
  "message": "What changed in billing this week?"
}
```

The backend must independently validate:

```text
User
+
Workspace membership
+
Conversation ownership/access
```

---

# 19. Chat Stream Content Type

Recommended:

```text
text/event-stream
```

because the existing architecture uses SSE.

---

# 20. SSE Event Model

Recommended conceptual events:

```text
start
status
content
citation
metadata
complete
error
```

Example:

```text
event: start
data: {...}

event: status
data: {"status":"retrieving"}

event: content
data: {"text":"Billing deployment..."}

event: citation
data: {...}

event: complete
data: {...}
```

Exact event names and payloads should be fixed before frontend implementation.

---

# 21. SSE Start Event

Conceptual:

```json
{
  "conversation_id": "conv_demo",
  "message_id": "msg_demo"
}
```

---

# 22. SSE Status Event

Potential:

```json
{
  "status": "retrieving",
  "label": "Retrieving company context..."
}
```

Supported statuses may include:

```text
retrieving
synthesizing
complete
```

Avoid exposing hidden model reasoning.

---

# 23. SSE Content Event

```json
{
  "delta": "Billing deployment changed yesterday."
}
```

The frontend appends deltas to the current answer.

---

# 24. SSE Citation Event

Conceptual:

```json
{
  "citation_id": "cit_demo",
  "source_type": "jira",
  "source_name": "Jira",
  "reference": "BILL-902",
  "updated_at": "2026-08-26T10:20:00Z"
}
```

Actual fields depend on available source metadata.

---

# 25. SSE Metadata Event

Potential:

```json
{
  "status": "high_confidence",
  "updated_at": "2026-08-26T10:20:00Z",
  "citation_count": 3
}
```

Do not expose a numerical confidence percentage unless the backend defines its meaning.

---

# 26. SSE Complete Event

Potential:

```json
{
  "message_id": "msg_demo",
  "status": "complete"
}
```

The frontend then enables:

```text
Copy
Share
Save
Feedback
Follow-up
```

---

# 27. SSE Error Event

```json
{
  "code": "STREAM_ERROR",
  "message": "The answer could not be completed.",
  "retryable": true
}
```

The UI can then show:

```text
We couldn't complete the answer.

[ Retry ]
```

---

# 28. SSE Cancellation

Recommended conceptual endpoint:

```text
POST /api/v1/chat/{message_id}/cancel
```

Only implement if the backend supports cancellation safely.

---

# 29. Conversation API

## List Conversations

```text
GET /api/v1/conversations
```

Optional filters:

```text
limit
cursor
search
```

---

# 30. Conversation Detail

```text
GET /api/v1/conversations/{conversation_id}
```

Returns messages the current user is allowed to access.

---

# 31. Conversation Rename

```text
PATCH /api/v1/conversations/{conversation_id}
```

Request:

```json
{
  "title": "Billing deployment discussion"
}
```

---

# 32. Conversation Delete

```text
DELETE /api/v1/conversations/{conversation_id}
```

The backend must distinguish conversation deletion from underlying source deletion.

---

# 33. KNOWLEDGE API

Recommended:

```text
GET /api/v1/knowledge
```

Purpose:

> Browse authorized knowledge items.

Query parameters:

```text
q
type
source
owner
status
freshness
page
limit
```

---

# 34. Knowledge Item

Conceptual response:

```json
{
  "id": "knowledge_demo",
  "title": "Billing Deployment SOP",
  "type": "sop",
  "status": "current",
  "updated_at": "2026-08-26T10:20:00Z"
}
```

---

# 35. Knowledge Detail

```text
GET /api/v1/knowledge/{knowledge_id}
```

Potential fields:

```text
id
title
type
status
owner
updated_at
sources
entities
relationships
history
```

Only return authorized data.

---

# 36. Knowledge History

```text
GET /api/v1/knowledge/{knowledge_id}/history
```

Potential response:

```json
{
  "versions": [
    {
      "version": "3.2",
      "created_at": "2026-08-26T10:20:00Z",
      "change_summary": "Migration pre-check added"
    }
  ]
}
```

---

# 37. Knowledge Review API

Future/P1:

```text
GET /api/v1/knowledge/review
```

Filter:

```text
status
priority
type
```

---

# 38. Review Detail

```text
GET /api/v1/knowledge/review/{review_id}
```

Returns:

```text
proposed change
evidence
confidence/status
affected knowledge
required action
```

---

# 39. Approve Review

```text
POST /api/v1/knowledge/review/{review_id}/approve
```

Backend must:

```text
Validate authorization
 ↓
Validate review state
 ↓
Apply change
 ↓
Create version
 ↓
Create audit event
```

---

# 40. Reject Review

```text
POST /api/v1/knowledge/review/{review_id}/reject
```

Request:

```json
{
  "reason": "The proposed rule is not current."
}
```

The reason can be optional only if the governance model permits it.

---

# 41. Semantic Dictionary API

List:

```text
GET /api/v1/knowledge/dictionary
```

Detail:

```text
GET /api/v1/knowledge/dictionary/{term_id}
```

Create:

```text
POST /api/v1/knowledge/dictionary
```

Update:

```text
PATCH /api/v1/knowledge/dictionary/{term_id}
```

---

# 42. Dictionary Object

Potential:

```json
{
  "id": "term_demo",
  "term": "Churn Risk",
  "definition": "Company-approved definition...",
  "owner": "Customer Success",
  "version": 3,
  "status": "active"
}
```

---

# 43. Dictionary Governance

If approval is required:

```text
PATCH
 ↓
draft
 ↓
review
 ↓
approved
 ↓
active
```

Do not publish a definition automatically unless that is explicitly intended.

---

# 44. SOP API

List:

```text
GET /api/v1/knowledge/sops
```

Detail:

```text
GET /api/v1/knowledge/sops/{sop_id}
```

Update:

```text
PATCH /api/v1/knowledge/sops/{sop_id}
```

History:

```text
GET /api/v1/knowledge/sops/{sop_id}/history
```

---

# 45. Decision API

List:

```text
GET /api/v1/knowledge/decisions
```

Detail:

```text
GET /api/v1/knowledge/decisions/{decision_id}
```

Create/manual capture:

```text
POST /api/v1/knowledge/decisions
```

---

# 46. Entity API

List/search:

```text
GET /api/v1/knowledge/entities
```

Detail:

```text
GET /api/v1/knowledge/entities/{entity_id}
```

Potential fields:

```text
id
name
type
owner
metadata
sources
relationships
```

---

# 47. GRAPH API

Recommended:

```text
GET /api/v1/graph
```

Parameters:

```text
entity_id
depth
types
limit
```

The backend must enforce authorization before returning nodes or relationships.

---

# 48. Graph Response

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
      "source": "entity_1",
      "target": "entity_2",
      "type": "depends_on"
    }
  ]
}
```

Do not return restricted nodes or relationships.

---

# 49. Graph Entity Neighborhood

Recommended:

```text
GET /api/v1/graph/entities/{entity_id}/neighbors
```

Parameters:

```text
depth
relationship_types
```

For UI use, default to a small neighborhood.

---

# 50. Graph Relationship Detail

```text
GET /api/v1/graph/relationships/{relationship_id}
```

Potential:

```text
source entity
target entity
relationship type
supporting sources
created/updated metadata
```

---

# 51. INTEGRATIONS API

List:

```text
GET /api/v1/integrations
```

Detail:

```text
GET /api/v1/integrations/{integration_id}
```

---

# 52. Create Integration Connection

Conceptual:

```text
POST /api/v1/integrations/{provider}/connect
```

The exact OAuth architecture may instead require a browser redirect flow.

Do not pass provider access tokens through the normal client request unless explicitly required and securely handled.

---

# 53. OAuth Flow

Preferred conceptual flow:

```text
Frontend
 ↓
Backend creates authorization URL
 ↓
Provider OAuth page
 ↓
Provider callback
 ↓
Backend validates state
 ↓
Encrypted credential/token storage
 ↓
Integration connected
```

---

# 54. OAuth Authorization URL

Potential:

```text
GET /api/v1/integrations/{provider}/authorize
```

Response may contain a short-lived authorization URL.

The exact architecture should protect against:

```text
CSRF
authorization-code reuse
state mismatch
redirect manipulation
```

---

# 55. Integration Scope

```text
GET /api/v1/integrations/{integration_id}/scope
```

Potential response:

```json
{
  "included": 43,
  "excluded": 7,
  "permission_mode": "selected"
}
```

Actual source-specific scope data should be returned where available.

---

# 56. Update Integration Scope

```text
PATCH /api/v1/integrations/{integration_id}/scope
```

The backend should validate that the requested scope is possible and authorized.

---

# 57. Integration Sync

```text
POST /api/v1/integrations/{integration_id}/sync
```

Response:

```json
{
  "sync_id": "sync_demo",
  "status": "started"
}
```

The frontend can then poll or subscribe to status.

---

# 58. Sync Status

```text
GET /api/v1/integrations/{integration_id}/syncs/{sync_id}
```

Potential:

```json
{
  "status": "syncing",
  "processed": 12000,
  "total": 25000
}
```

Only show counts that are actually measurable.

---

# 59. Disconnect Integration

```text
POST /api/v1/integrations/{integration_id}/disconnect
```

Optional request:

```json
{
  "remove_indexed_data": false
}
```

This distinction must be implemented carefully.

---

# 60. Data Deletion

If supported:

```text
POST /api/v1/integrations/{integration_id}/delete-indexed-data
```

This operation should have stronger authorization and confirmation.

---

# 61. ACTIVITY API

List:

```text
GET /api/v1/activity
```

Filters:

```text
type
actor
date_from
date_to
resource
```

---

# 62. Activity Event

Conceptual:

```json
{
  "id": "activity_demo",
  "type": "knowledge_updated",
  "timestamp": "2026-08-26T09:18:00Z",
  "resource": {
    "type": "sop",
    "id": "sop_demo"
  }
}
```

Do not expose restricted metadata.

---

# 63. SECURITY API

## Current User Access

```text
GET /api/v1/security/my-access
```

---

# 64. Workspace Users

```text
GET /api/v1/security/users
```

Admin only.

---

# 65. Invite User

```text
POST /api/v1/security/users/invite
```

Request:

```json
{
  "email": "user@example.com",
  "role": "member"
}
```

---

# 66. Update Role

```text
PATCH /api/v1/security/users/{user_id}
```

Request:

```json
{
  "role": "admin"
}
```

The backend must validate whether the current actor may grant that role.

---

# 67. Suspend User

```text
POST /api/v1/security/users/{user_id}/suspend
```

---

# 68. Revoke User

```text
POST /api/v1/security/users/{user_id}/revoke
```

Exact semantics should be aligned with the authentication system.

---

# 69. Permission Matrix

```text
GET /api/v1/security/permissions
```

Return only authorization information appropriate for the current admin.

---

# 70. AUDIT API

```text
GET /api/v1/security/audit
```

Filters:

```text
actor
action
resource
date
result
```

---

# 71. Audit Event Detail

```text
GET /api/v1/security/audit/{event_id}
```

Potential fields:

```text
actor
action
resource
timestamp
result
request_id
```

Avoid storing sensitive payloads unnecessarily.

---

# 72. SKILLS API

P1/P2:

```text
GET /api/v1/skills
GET /api/v1/skills/{skill_id}
POST /api/v1/skills
PATCH /api/v1/skills/{skill_id}
POST /api/v1/skills/{skill_id}/test
POST /api/v1/skills/{skill_id}/activate
POST /api/v1/skills/{skill_id}/deactivate
```

---

# 73. Skill Object

Potential:

```json
{
  "id": "skill_demo",
  "name": "Customer Refund Handler",
  "status": "draft",
  "version": "2.1",
  "required_context": [
    "customer",
    "policy",
    "incident"
  ]
}
```

---

# 74. Skill Activation

Before activation, validate:

```text
Required fields
Referenced knowledge
Referenced rules
Permissions
Tools
```

---

# 75. AGENTS API

P2:

```text
GET /api/v1/agents
GET /api/v1/agents/{agent_id}
POST /api/v1/agents
PATCH /api/v1/agents/{agent_id}
POST /api/v1/agents/{agent_id}/test
POST /api/v1/agents/{agent_id}/activate
POST /api/v1/agents/{agent_id}/pause
```

---

# 76. Agent Object

Potential:

```json
{
  "id": "agent_demo",
  "name": "Customer Support Agent",
  "status": "active",
  "skills": ["skill_refund"],
  "permissions": ["support"]
}
```

---

# 77. Agent Run API

```text
POST /api/v1/agents/{agent_id}/runs
```

Request:

```json
{
  "input": "Can this customer receive a refund?"
}
```

The result may be streamed or returned synchronously depending on implementation.

---

# 78. Agent Run Detail

```text
GET /api/v1/agents/runs/{run_id}
```

Potential:

```text
status
agent
context references
skill
tools
result
timestamps
```

Do not expose private model chain-of-thought.

---

# 79. MCP API

P2:

```text
GET /api/v1/mcp
POST /api/v1/mcp/connections
GET /api/v1/mcp/connections
DELETE /api/v1/mcp/connections/{id}
```

The exact MCP implementation should follow the actual MCP server architecture.

---

# 80. MCP Credentials

Never return secret credentials in ordinary list/detail responses.

If a secret is created:

```text
Display once where appropriate
Store securely
Rotate
Revoke
Audit
```

---

# 81. MCP Permissions

Every MCP client/connection must have an explicit authorization context.

Potential:

```text
workspace
principal
allowed_sources
allowed_context
allowed_skills
```

---

# 82. SETTINGS API

Potential:

```text
GET /api/v1/settings
PATCH /api/v1/settings
```

Sections may include:

```text
workspace
appearance
notifications
developer
```

---

# 83. Settings Response

Do not return:

```text
API secrets
OAuth refresh tokens
private encryption keys
internal credentials
```

---

# 84. Pagination

Use cursor pagination for large collections.

Conceptual:

```text
GET /api/v1/knowledge?cursor=...
```

Response:

```json
{
  "items": [],
  "next_cursor": "..."
}
```

Avoid offset pagination for high-growth datasets when cursor pagination is more appropriate.

---

# 85. Filtering

Use query parameters.

Example:

```text
GET /api/v1/knowledge?type=sop&status=current
```

The backend should validate filter values.

---

# 86. Sorting

Example:

```text
sort=updated_at
order=desc
```

Only expose safe, indexed sorting options.

---

# 87. Search Query Limits

Apply server-side limits.

Example:

```text
limit <= configured maximum
```

Do not allow arbitrary enormous result sets.

---

# 88. Rate Limiting

Differentiate:

```text
Authentication
Read APIs
Search
Chat
Agent execution
Admin operations
```

Higher-cost operations should have stricter controls where necessary.

---

# 89. Idempotency

Use idempotency keys for operations that may be retried and could cause duplicate effects.

Examples:

```text
Create integration
Send invitation
Start external write-back
```

Do not rely solely on frontend retry behavior.

---

# 90. External Side Effects

Future action endpoints should clearly separate:

```text
Read context
```

from:

```text
Execute action
```

Example:

```text
GET customer context
```

vs:

```text
POST create refund
```

Actions require stronger authorization and logging.

---

# 91. API Authorization Layers

Every sensitive endpoint should follow:

```text
Authentication
 ↓
Workspace membership
 ↓
Role / permission
 ↓
Resource access
 ↓
Operation authorization
 ↓
Execute
```

---

# 92. API Input Validation

Use strict request schemas.

Reject:

```text
Unknown required fields
Invalid enum values
Malformed identifiers
Oversized payloads
Invalid pagination
```

Do not trust client validation alone.

---

# 93. API Output Filtering

Before sending data to the frontend:

```text
Authorize
 ↓
Select permitted fields
 ↓
Remove sensitive internal metadata
 ↓
Serialize
```

---

# 94. Internal vs Public API Models

Do not directly expose internal database/ORM objects.

Use explicit API response models.

Conceptually:

```text
Database Model
      ↓
Service Model
      ↓
API Response Model
```

This prevents accidental data leakage and coupling.

---

# 95. Citation Object

A reusable citation object should contain enough for:

```text
Source Chip
Source Receipt
Answer attribution
```

Potential:

```json
{
  "id": "cit_demo",
  "source_type": "jira",
  "source_name": "Jira",
  "reference": "BILL-902",
  "updated_at": "2026-08-26T10:20:00Z",
  "related_entities": ["billing-service"]
}
```

---

# 96. Entity Reference

Reusable:

```json
{
  "id": "entity_demo",
  "type": "service",
  "name": "Billing Service"
}
```

---

# 97. Knowledge Status Enum

Potential:

```text
candidate
review
active
stale
conflicting
deprecated
```

Exact enum should be standardized across backend and frontend.

---

# 98. Integration Status Enum

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

# 99. Agent Status Enum

```text
draft
testing
active
paused
deprecated
error
```

---

# 100. Review Status Enum

```text
pending
approved
rejected
expired
```

---

# 101. Answer Status Enum

Potential:

```text
complete
insufficient_evidence
conflicting
permission_limited
error
```

This allows the frontend to render consistent states.

---

# 102. Response Metadata

Where relevant, return:

```text
request_id
created_at
updated_at
source_count
```

Do not expose internal implementation metadata by default.

---

# 103. Latency Metadata

Developer/debug mode may expose:

```text
retrieval_ms
rerank_ms
graph_ms
generation_ms
total_ms
```

This should not be shown to normal employees unless useful.

---

# 104. Retrieval Debug API

Optional internal route:

```text
POST /api/v1/debug/retrieval
```

Admin/developer only.

Potential output:

```text
query
intent
retrieved candidates
rerank results
graph decision
graph paths
final context
latencies
```

Never expose hidden model reasoning.

---

# 105. Evaluation API

Internal:

```text
POST /api/v1/evaluation/run
GET /api/v1/evaluation/runs/{run_id}
```

Used for:

```text
retrieval benchmarks
answer quality
permission tests
regression tests
```

This should be separated from customer production APIs.

---

# 106. API Contract Testing

Every API contract should have tests for:

```text
Happy path
Validation
Unauthorized
Forbidden
Not found
Conflict
Rate limit
Dependency failure
```

---

# 107. SSE Contract Testing

Test:

```text
Start
Status
Content
Citation
Complete
Error
Disconnect
Reconnect / retry behavior
Cancel
```

---

# 108. Authorization Testing

Every protected endpoint should test:

```text
Correct user
Wrong user
Correct workspace
Wrong workspace
Correct role
Insufficient role
Restricted source
```

---

# 109. Contract Versioning

When changing a response:

```text
Additive change
→ usually safe

Breaking field change
→ new API version
```

Do not remove a field used by a deployed frontend without a migration plan.

---

# 110. API Documentation

Use OpenAPI generated from FastAPI.

The docs should include:

```text
Authentication
Endpoints
Request schemas
Response schemas
Error codes
Examples
Rate limits
Permissions
```

Do not publish internal debug endpoints in the public developer documentation.

---

# 111. Developer Documentation

Create:

```text
/docs/api
```

with:

```text
Quickstart
Authentication
Ask Brain
Knowledge
Graph
Integrations
Agents
MCP
Errors
Webhooks/events if applicable
```

Only document production-supported APIs.

---

# 112. API Security

Minimum:

```text
TLS
Authentication
Authorization
Input validation
Rate limiting
Secure secret storage
Request logging
Audit for critical actions
```

---

# 113. Secret Handling

Never send through normal API responses:

```text
OAuth refresh tokens
API keys
Provider secrets
Private signing keys
Encryption keys
```

Use secure secret-management infrastructure.

---

# 114. Sensitive Logging

Do not log:

```text
Passwords
Access tokens
API keys
Full private documents
Sensitive customer data
```

Logs should capture enough context for diagnosis without becoming a second data leak.

---

# 115. Request Logging

Useful fields:

```text
request_id
workspace_id
user_id
route
method
status
latency
error_code
```

Be careful with personally sensitive content.

---

# 116. API Observability

Monitor:

```text
Request latency
Error rate
Streaming failures
Authorization failures
Connector failures
Retrieval failures
Generation failures
```

---

# 117. Backend Service Boundary

Recommended conceptual structure:

```text
API Router
    ↓
Auth / Permission
    ↓
Application Service
    ↓
Domain Logic
    ↓
Repositories / Clients
    ↓
Supabase / Neo4j / Model APIs
```

Do not put all business logic directly inside route handlers.

---

# 118. Chat Service Boundary

Conceptually:

```text
Chat Router
 ↓
Chat Service
 ↓
LangGraph Orchestrator
 ↓
Retrieval Services
 ↓
Answer Service
 ↓
SSE Adapter
```

---

# 119. Integration Service Boundary

```text
Integration Router
 ↓
Integration Service
 ↓
Provider Connector
 ↓
Normalization
 ↓
Ingestion Pipeline
```

---

# 120. Knowledge Service Boundary

```text
Knowledge Router
 ↓
Knowledge Service
 ↓
Supabase / Neo4j
 ↓
Permission filtering
 ↓
API response
```

---

# 121. Graph Service Boundary

```text
Graph Router
 ↓
Graph Service
 ↓
Permission context
 ↓
Neo4j
 ↓
Graph DTO
```

---

# 122. Security Service Boundary

```text
Security Router
 ↓
Authorization service
 ↓
Identity provider
 +
Database permissions
 ↓
Audit
```

---

# 123. API-to-UI Mapping

```text
API                         UI

/chat/stream                Ask Brain

/knowledge                  Knowledge Library

/knowledge/entities         Entity Explorer

/graph                      Knowledge Graph

/integrations               Integrations

/activity                   Brain Activity

/security/users             Users

/security/audit             Audit Log

/skills                     Skills

/agents                     Agents

/mcp                        MCP

/settings                   Settings
```

---

# 124. API-to-Architecture Mapping

```text
API
 ↓
FastAPI
 ↓
Application Service
 ↓
LangGraph / Knowledge Services
 ↓
Supabase / Neo4j
 ↓
External model services
```

The API should not bypass authorization to query storage directly.

---

# 125. Chat Request → Architecture

```text
POST /chat/stream
      ↓
Authenticate
      ↓
Workspace / permissions
      ↓
LangGraph
      ↓
Cache
      ↓
Memory
      ↓
Contextualization
      ↓
Intent
      ↓
Hybrid search
      ↓
Rerank
      ↓
Graph decision
      ↓
Graph expansion
      ↓
Context fusion
      ↓
Second rerank
      ↓
GPT-4o-mini
      ↓
SSE
```

---

# 126. Ingestion API → Architecture

```text
Integration / ingestion trigger
      ↓
FastAPI
      ↓
Connector
      ↓
Parsing / normalization
      ↓
Pronoun resolution
      ↓
Graph extraction
      ↓
Child chunking
      ↓
Embedding
      ↓
Supabase
      +
Neo4j
```

The exact trigger can be OAuth/webhook/manual sync depending on connector implementation.

---

# 127. Graph API → Architecture

```text
Frontend
 ↓
GET /graph
 ↓
FastAPI
 ↓
Authorization
 ↓
Neo4j
 ↓
Filtered nodes / edges
 ↓
Graph UI
```

---

# 128. Evidence API → Architecture

Evidence may be included directly in the Chat response rather than exposed through a separate endpoint.

Conceptually:

```text
Retrieved chunk metadata
+
Graph path
+
Source metadata
 ↓
Citation object
 ↓
Frontend
```

A separate evidence endpoint is optional.

---

# 129. API Contract for Frontend Team

Frontend developers should implement against:

```text
API response types
```

not directly against database structures.

Example:

```text
AnswerDTO
CitationDTO
EntityDTO
GraphDTO
IntegrationDTO
ActivityDTO
UserDTO
```

---

# 130. Recommended Shared Types

Create a shared type contract where practical.

Conceptually:

```text
shared/
├── answer
├── citation
├── entity
├── knowledge
├── integration
├── activity
├── security
└── agent
```

The exact monorepo/shared-types approach depends on project structure.

---

# 131. Contract Stability Rule

Frontend should not depend on:

```text
private database field names
Neo4j internal IDs
embedding IDs
raw provider objects
```

Expose stable product identifiers.

---

# 132. Provider Abstraction

The product API should ideally return:

```text
source_type
source_name
reference
```

rather than forcing frontend code to understand every provider's raw API structure.

---

# 133. Integration Provider Model

Backend internal:

```text
SlackConnector
JiraConnector
GitHubConnector
GoogleWorkspaceConnector
```

Frontend:

```text
IntegrationDTO
```

This avoids provider-specific UI branching everywhere.

---

# 134. API Pagination Contract

Recommended:

```json
{
  "items": [],
  "next_cursor": "..."
}
```

For pages where total count is cheap and useful, optionally:

```json
{
  "items": [],
  "next_cursor": "...",
  "total": 1240
}
```

Do not calculate expensive totals unnecessarily.

---

# 135. API Filtering Contract

Use stable enums.

Example:

```text
status=current
type=sop
```

Invalid filter:

```text
400 VALIDATION_ERROR
```

---

# 136. Bulk Operations

Avoid early complexity.

If introduced later:

```text
POST /api/v1/knowledge/bulk
```

Use explicit action semantics.

Example:

```json
{
  "action": "archive",
  "ids": ["..."]
}
```

Authorization must be checked for every affected object.

---

# 137. Async Job Contract

For long-running jobs:

```text
POST
```

returns:

```json
{
  "job_id": "job_demo",
  "status": "queued"
}
```

Then:

```text
GET /api/v1/jobs/{job_id}
```

returns progress.

This is appropriate for large indexing/sync workflows.

---

# 138. Job Status

```text
queued
running
completed
failed
cancelled
partial
```

---

# 139. Job Error

```json
{
  "status": "failed",
  "error": {
    "code": "SYNC_ERROR",
    "message": "Synchronization could not be completed."
  }
}
```

Do not expose internal stack traces.

---

# 140. Webhooks / Events

Future connectors may use webhooks.

Conceptual:

```text
Provider
 ↓
Webhook endpoint
 ↓
Validate signature
 ↓
Queue / process
 ↓
Update knowledge
```

External webhook authentication and signature verification must be implemented per provider.

---

# 141. Idempotent Webhook Processing

Store provider event IDs when available.

```text
Event ID
 ↓
Already processed?
```

If yes:

```text
Ignore duplicate
```

This prevents duplicated ingestion.

---

# 142. API Security Event

Important failures such as:

```text
Repeated unauthorized access
OAuth failure
Permission denial
```

may produce internal security events.

Do not expose security-sensitive detection logic to normal users.

---

# 143. API Rate-Limit Response

Recommended:

```text
429
```

with:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later."
  }
}
```

Use retry metadata where appropriate.

---

# 144. Authorization Error Response

Recommended:

```text
403
```

```json
{
  "error": {
    "code": "AUTHORIZATION_DENIED",
    "message": "You do not have permission to perform this action."
  }
}
```

Do not reveal hidden resource existence when policy requires otherwise.

---

# 145. Not Found vs Restricted

In some cases, return a consistent:

```text
404
```

instead of:

```text
403
```

to avoid leaking existence of restricted resources.

This should be determined by resource sensitivity and authorization policy.

---

# 146. Conflict Response

For concurrent changes:

```text
409
```

Example:

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "This knowledge item was updated by another user."
  }
}
```

---

# 147. Optimistic Concurrency

For editable resources, consider:

```text
version
updated_at
ETag
```

Example:

```text
If-Match: <etag>
```

This is particularly useful for:

```text
SOPs
Dictionary terms
Skills
Agents
```

---

# 148. API Performance Principle

The API should:

```text
Avoid over-fetching
Avoid under-fetching
Return stable DTOs
Paginate large collections
Stream long answers
Use async jobs for long ingestion
```

---

# 149. Chat Performance

For Ask Brain:

```text
Request accepted
 ↓
SSE connected quickly
 ↓
Status event
 ↓
Answer deltas
```

Do not wait until the entire response is generated before opening the stream.

---

# 150. API Contract Documentation Example

For every endpoint document:

```text
Purpose
Method
Path
Authentication
Required permission
Request
Response
Errors
Example
Side effects
Idempotency
```

---

# 151. Example Endpoint Documentation

```text
POST /api/v1/chat/stream

Purpose
Stream a Company Brain answer.

Authentication
Required.

Workspace
Required.

Permissions
User must have access to requested workspace.

Request
workspace_id
conversation_id
message

Response
SSE stream.

Events
start
status
content
citation
complete
error

Side effects
Conversation message may be stored.
Background memory extraction may occur.
```

---

# 152. Public API vs Internal API

Keep separate:

```text
Public developer API
Internal application API
Evaluation/debug API
Webhook endpoints
```

Do not accidentally expose internal evaluation controls.

---

# 153. API Contract Ownership

Each endpoint should have an owner:

```text
Chat
AI / Backend

Knowledge
Backend / Knowledge

Integrations
Platform

Security
Backend / Security

Agents
AI Platform
```

The owner is responsible for changes.

---

# 154. API Change Process

Before changing an API:

```text
Identify consumers
 ↓
Update schema
 ↓
Update backend
 ↓
Update frontend
 ↓
Run contract tests
 ↓
Deploy
```

For breaking changes:

```text
Version
```

---

# 155. Definition of Done

The API contract layer is ready when:

```text
[ ] Authentication contract defined
[ ] Workspace contract defined
[ ] Chat/SSE contract defined
[ ] Citation contract defined
[ ] Knowledge contract defined
[ ] Graph contract defined
[ ] Integration contract defined
[ ] Sync/job contract defined
[ ] Activity contract defined
[ ] Security contract defined
[ ] Audit contract defined
[ ] Skills contract defined
[ ] Agent contract defined
[ ] MCP boundary defined
[ ] Error contract defined
[ ] Pagination defined
[ ] Filtering defined
[ ] Authorization rules defined
[ ] Sensitive fields excluded
[ ] Contract testing strategy defined
[ ] OpenAPI documentation planned
```

---

# 156. Final API Architecture

```text
                         NEXT.JS
                            │
                      PRODUCT API
                            │
                            ▼
                         FASTAPI
                            │
            ┌───────────────┼────────────────┐
            │               │                │
         AUTH /          PRODUCT          STREAM
       PERMISSIONS        SERVICES          SSE
            │               │                │
            └───────────────┼────────────────┘
                            ▼
                       LANGGRAPH
                            │
             ┌──────────────┼───────────────┐
             │              │               │
          RETRIEVAL      KNOWLEDGE       MEMORY
             │              │               │
             ▼              ▼               ▼
         SUPABASE         NEO4J          SUPABASE
        pgvector           GRAPH
             │              │
             └──────────────┼──────────────┘
                            ▼
                     MODEL SERVICES
```

---

# 157. Final Request Lifecycle

For a normal user question:

```text
1. Frontend sends question.
2. FastAPI authenticates request.
3. Workspace membership is checked.
4. Authorization context is created.
5. LangGraph receives the query.
6. Cache / memory / contextualization execute.
7. Intent routing determines the path.
8. Hybrid retrieval runs.
9. Reranking occurs.
10. Graph expansion occurs when useful.
11. Context is fused.
12. Final reranking occurs.
13. GPT-4o-mini generates response.
14. Answer streams through SSE.
15. Sources/citations are returned.
16. UI displays evidence.
17. Background extraction updates memory where applicable.
```

---

# 158. Final Ingestion Lifecycle

```text
1. Source authorization.
2. Connector retrieves content.
3. Content is normalized.
4. Documents are parsed where applicable.
5. Parent chunks are created.
6. Pronoun resolution is performed.
7. Entities/relationships are extracted.
8. Neo4j is updated.
9. Child chunks are created.
10. Jina embeddings are generated.
11. Supabase stores vectors and metadata.
12. Source timestamps/permissions are preserved.
13. Sync status is updated.
```

---

# 159. Final Security Lifecycle

```text
User
 ↓
Identity
 ↓
Workspace
 ↓
Role
 ↓
Source permissions
 ↓
RLS / authorization
 ↓
Retrieval
 ↓
Authorized context
 ↓
Answer
```

---

# 160. Canonical API Principle

> **The API should make the sophisticated CognitRAG architecture look simple to the product layer while preserving the technical guarantees, provenance, permissions, and workflow semantics underneath.**

---

# 161. Final Engineering Principle

The API contract is the agreement between:

```text
Frontend
Backend
Data Layer
AI Layer
Security Layer
```

Once these contracts are stable, the application can evolve without every UI component knowing how the retrieval engine works.

---

# 162. Final Rule

Do not design the API around what is easiest for the current frontend component.

Design the API around stable product concepts:

```text
Answer
Citation
Knowledge
Entity
Relationship
Integration
Activity
User
Permission
Skill
Agent
```

That keeps CognitRAG maintainable as the Company Brain grows.
