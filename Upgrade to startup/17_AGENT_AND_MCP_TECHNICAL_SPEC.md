# 17 — CognitRAG Agent & MCP Technical Specification
## Skills → Agents → Company Context → Tools → Approval → Execution

> **Status:** Master future AI-agent platform specification.
>
> **Technical source of truth:** `Architecture(1).md`
>
> **Dependencies:** `09_TECHNICAL_PRODUCT_ARCHITECTURE_AND_WORKFLOW.md`, `10_API_CONTRACTS.md`, `11_DATA_MODEL.md`, `13_RETRIEVAL_PIPELINE_SPEC.md`, `14_KNOWLEDGE_GRAPH_SPEC.md`, `15_SECURITY_AND_RBAC_TECHNICAL_SPEC.md`, `16_EVALUATION_AND_BENCHMARKING.md`
>
> **Purpose:** Define how CognitRAG evolves from a human-facing Company Brain into a machine-facing context platform for AI agents, Skills, tools, MCP, and controlled execution.
>
> **Important:** Agent/MCP capabilities described here are the long-term platform direction unless explicitly marked as implemented.

---

# 1. Agent Platform Objective

The long-term goal is:

> **Give AI agents access to the company's authorized knowledge, semantics, rules, and context through a controlled interface.**

The agent layer should build on the existing Company Brain.

It should NOT create a second independent knowledge system.

---

# 2. Core Architecture

The long-term architecture is:

```text
                   AI AGENT
                       │
                Task / Request
                       │
                       ▼
                API / MCP Layer
                       │
                       ▼
                 COGNITRAG BRAIN
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     KNOWLEDGE       RULES          SKILLS
        │              │              │
        └──────────────┼──────────────┘
                       │
                 PERMISSIONS
                       │
                       ▼
                AUTHORIZED CONTEXT
                       │
                       ▼
                   AGENT
                       │
              Optional tool call
                       │
                       ▼
                   POLICY
                       │
              ┌────────┴────────┐
              │                 │
            DENY              APPROVE
              │                 │
              ▼                 ▼
            Stop             Execute
```

---

# 3. Agent Design Principle

The agent should not independently reconstruct the organization from disconnected systems.

Instead:

```text
Agent
 ↓
CognitRAG
 ↓
Company context
 ↓
Agent decision
```

This is the strategic value of the Company Brain.

---

# 4. Agent ≠ Knowledge Base

The Company Brain is the shared context layer.

Agents are consumers of that context.

Conceptually:

```text
Company Brain
      │
 ┌────┼─────────────┐
 │    │             │
Human Search      Agent
 │                  │
Ask Brain          MCP/API
```

---

# 5. Agent Components

A CognitRAG Agent should conceptually contain:

```text
Identity
Purpose
Skills
Knowledge access
Rules
Permissions
Tools
Output policy
Lifecycle state
```

---

# 6. Agent Identity

Every agent needs a stable identity.

Conceptual:

```text
agent_id
workspace_id
name
description
status
created_at
updated_at
```

The agent identity is not the same as the human user identity.

---

# 7. Agent Principal

An agent should have an explicit security principal.

Conceptually:

```text
Agent Principal
+
Workspace
+
Allowed scopes
```

This prevents accidental assumption that:

```text
agent = administrator
```

---

# 8. Agent Purpose

Every agent should have a clear declared purpose.

Example:

```text
Customer Support Agent

Purpose:
Assist support staff with customer questions
using authorized company context.
```

Avoid creating agents with vague unrestricted purposes.

---

# 9. Agent Knowledge Access

An agent can be granted access to:

```text
Knowledge
Entities
Sources
Policies
Rules
Skills
```

Access should be scoped.

---

# 10. Agent Permission Model

Permissions should distinguish:

```text
Read context
Use skill
Call tool
Write data
Approve action
```

These are separate permissions.

---

# 11. Example Agent Permissions

```text
Customer Support Agent

Context:
✓ Customer records
✓ Support tickets
✓ Refund policy
✓ Relevant incidents

Tools:
✓ Customer lookup
× HR lookup
× Finance updates

Actions:
✓ Read
× Write
```

---

# 12. Agent Context Flow

The canonical flow:

```text
Agent request
       ↓
Authenticate principal
       ↓
Resolve workspace
       ↓
Resolve agent permissions
       ↓
Retrieve relevant context
       ↓
Apply rules / semantics
       ↓
Return authorized context
```

---

# 13. Agent Request

Example:

```text
Can this customer receive a refund?
```

The agent should determine that it needs:

```text
Customer history
Refund policy
Active incidents
Relevant exceptions
```

---

# 14. Context Retrieval

The agent should use the existing CognitRAG retrieval stack where applicable:

```text
Cache
Memory where authorized
Contextualization
Intent / task routing
Hybrid retrieval
Reranking
Graph expansion when useful
Context fusion
```

The exact agent retrieval path may be task-specific.

---

# 15. Agent Context Should Be Scoped

Avoid:

```text
Entire company database
```

Prefer:

```text
Task-specific authorized context
```

This reduces:

```text
security risk
context noise
token cost
latency
```

---

# 16. Context Package

Conceptual agent context:

```json
{
  "task": "refund eligibility",
  "knowledge": [],
  "entities": [],
  "rules": [],
  "sources": [],
  "permissions": []
}
```

This is a conceptual shape, not a finalized wire protocol.

---

# 17. Source Evidence for Agents

Agent context should preserve evidence references where useful.

Example:

```text
Refund Policy v4
Source:
Knowledge item / policy source
Updated:
Aug 26
```

An agent should not treat unsupported generated statements as authoritative.

---

# 18. Agent Rules

Rules are company semantics that constrain specific decisions.

Example:

```text
IF verified_outage = true
THEN refund_window = 45 days
```

The rule must have:

```text
status
owner
version
provenance
```

where supported.

---

# 19. Rule Authority

Distinguish:

```text
Observed information
Suggested rule
Approved rule
```

An agent should only rely on authoritative rules for high-impact business decisions where the product requires that level of control.

---

# 20. Skills

A Skill is a reusable capability definition.

Example:

```text
Customer Refund Handler
```

A Skill can specify:

```text
Purpose
Inputs
Required Context
Rules
Allowed Actions
Output
Sources
Permissions
Version
```

---

# 21. Skill vs Agent

```text
SKILL
How to perform a capability.

AGENT
Who/what uses capabilities to accomplish a task.
```

Example:

```text
Skill:
Customer Refund Handler

Agent:
Customer Support Agent
```

---

# 22. Skill Lifecycle

```text
Draft
 ↓
Test
 ↓
Review
 ↓
Approved
 ↓
Active
 ↓
Deprecated
```

---

# 23. Skill Input Schema

Example:

```json
{
  "customer_id": "cust_demo",
  "order_id": "order_demo",
  "reason": "payment outage"
}
```

The exact schema depends on the skill.

---

# 24. Skill Required Context

Example:

```text
Required Context

Customer
Refund Policy
Active Incident
Order
```

The system should validate that required context is available and authorized.

---

# 25. Missing Context

If required context is unavailable:

```text
The agent does not have enough authorized
context to safely complete this task.
```

Do not encourage the agent to guess.

---

# 26. Skill Rules

Example:

```text
Rule:
Refund window extends during verified outage.
```

Rules should be explicitly associated with the Skill where required.

---

# 27. Skill Allowed Actions

Examples:

```text
read_customer
lookup_order
calculate_refund
```

Future write action:

```text
issue_refund
```

would require stronger authorization.

---

# 28. Agent Tool Layer

Tools are capabilities outside the knowledge layer.

Examples:

```text
CRM lookup
Ticket creation
Email draft
Calendar operation
Issue update
Customer status update
```

Tools must be separately authorized.

---

# 29. Tool Read vs Write

Separate:

```text
READ TOOL
Get information.

WRITE TOOL
Change external state.
```

A read permission must not imply write permission.

---

# 30. Tool Execution Architecture

```text
Agent
 ↓
Tool request
 ↓
Authorization
 ↓
Policy
 ↓
Approval if required
 ↓
Tool execution
 ↓
Result
 ↓
Agent
```

---

# 31. Tool Authorization

The LLM must not be the final authority.

Bad:

```text
Model decides:
"I am allowed to execute this."
```

Correct:

```text
Agent requests action
 ↓
Authorization service decides
 ↓
Tool executes only if authorized
```

---

# 32. Human Approval

High-impact actions can require human approval.

Examples:

```text
Issue refund
Change customer status
Delete record
Change production configuration
Publish policy
```

---

# 33. Approval Flow

```text
Agent proposes action
        ↓
Show action + context
        ↓
Human reviews
        ↓
Approve / Reject
        ↓
Authorization
        ↓
Execute
        ↓
Audit
```

---

# 34. Approval UI

Example:

```text
Agent wants to:

Mark Customer ACME as At Risk

Reason:
3 unresolved payment incidents.

Evidence:
2 support tickets
1 incident

[ Reject ]
[ Approve ]
```

---

# 35. Approval Security

Approval should be tied to:

```text
authenticated user
workspace
agent
action
resource
context
timestamp
```

---

# 36. Action Idempotency

External write actions may be retried.

Use idempotency where appropriate.

Example:

```text
issue_refund(request_id)
```

should not accidentally issue two refunds because the network retried.

---

# 37. Tool Result

The tool returns structured result:

```json
{
  "status": "success",
  "resource_id": "refund_demo"
}
```

or:

```json
{
  "status": "failed",
  "error": "..."
}
```

Avoid giving the model ambiguous free-form execution signals where structured results are possible.

---

# 38. Safe Failure

If an action cannot be safely completed:

```text
Action not completed.

No external change was made.
```

Only say this when the system can verify the statement.

---

# 39. Agent Execution States

Recommended:

```text
queued
running
waiting_for_context
waiting_for_approval
executing
completed
failed
cancelled
```

---

# 40. Agent Run Object

Conceptual:

```text
run_id
agent_id
workspace_id
principal
input
status
context_references
skill_references
tool_calls
approval
result
created_at
completed_at
```

---

# 41. Agent Run Timeline

UI:

```text
Request
 ↓
Context retrieved
 ↓
Policy checked
 ↓
Skill selected
 ↓
Approval requested
 ↓
Tool executed
 ↓
Result
```

Only show safe, meaningful metadata.

---

# 42. Do Not Expose Chain-of-Thought

The agent UI should expose:

```text
Context sources
Rules applied
Skills
Tool calls
Results
```

It should NOT expose hidden private reasoning.

---

# 43. Agent Context Evidence

For every important decision, show:

```text
What context was used?
Which rule applied?
Which source supported it?
```

This is the machine-facing equivalent of the human Source Receipt.

---

# 44. Agent Answer Receipt

Conceptual:

```text
Agent decision
+
Context references
+
Rules
+
Sources
+
Actions
```

This supports debugging and governance.

---

# 45. Agent Observability

Track:

```text
Run count
Success rate
Failure rate
Latency
Tool failures
Context failures
Approval rate
```

Only expose metrics that are actually calculated.

---

# 46. Agent Evaluation

Agent evaluation should measure:

```text
Task correctness
Context relevance
Rule adherence
Tool correctness
Permission correctness
Action safety
Latency
Cost
```

---

# 47. Agent Benchmark

Create tasks such as:

```text
Refund eligibility
Incident lookup
Customer context summary
Ownership lookup
SOP recommendation
```

Each task should specify:

```text
expected context
expected decision
allowed tools
expected outcome
```

---

# 48. Agent Security Benchmark

Test:

```text
Unauthorized source access
Unauthorized tool access
Privilege escalation
Cross-workspace access
Prompt injection
Tool injection
```

---

# 49. Agent Prompt Injection

Retrieved source content may contain malicious instructions.

The architecture should treat:

```text
source content
```

as untrusted data.

It must not override:

```text
system policy
authorization
tool permissions
```

---

# 50. Tool Injection

Tool outputs are also untrusted input.

A tool response must not cause the agent to bypass:

```text
authorization
approval
policy
```

---

# 51. Agent Policy Layer

Before execution:

```text
Requested action
 ↓
Policy evaluation
 ↓
Authorization
```

This layer must be external to the language model's judgment.

---

# 52. Agent Guardrails

Potential guardrails:

```text
Allowed tools
Allowed sources
Allowed actions
Maximum execution steps
Approval requirements
Rate limits
Budget limits
```

The exact set depends on implementation.

---

# 53. Agent Budget

Long-running agents may need:

```text
max steps
max tool calls
max runtime
max cost
```

This prevents uncontrolled loops.

---

# 54. Agent Loop Protection

Bad:

```text
Tool
 ↓
Model
 ↓
Tool
 ↓
Model
 ↓
...
```

Use:

```text
bounded execution
```

with clear termination criteria.

---

# 55. Agent Cancellation

Users/admins should be able to stop supported long-running runs.

```text
[ Stop Run ]
```

The runtime must define whether active external actions:

```text
complete
cancel
or continue
```

Do not promise cancellation after an external action has already been committed.

---

# 56. Agent Timeout

If the run exceeds configured limits:

```text
Run timed out.
```

No additional actions should occur after the runtime enters a terminal state.

---

# 57. MCP Objective

MCP should provide a standardized machine-facing interface to CognitRAG capabilities where supported.

Conceptually:

```text
AI Client
 ↓
MCP
 ↓
CognitRAG
 ↓
Company Context
```

---

# 58. MCP Position

MCP is an interface layer.

It is not:

```text
the knowledge store
```

It is:

```text
a machine-facing access mechanism
```

---

# 59. MCP Resources

Potential resources:

```text
Knowledge
Entities
Policies
Rules
Skills
Approved company context
```

The exact resource surface should be defined by the actual MCP server implementation.

---

# 60. MCP Tools

Potential tools:

```text
search_company_knowledge
get_entity
get_relationships
get_policy
get_skill_context
```

Only expose tools actually implemented.

---

# 61. MCP Authorization

Every MCP request should resolve:

```text
principal
workspace
permissions
```

before returning context.

---

# 62. MCP Authentication

The actual MCP authentication design may use:

```text
OAuth
API credentials
short-lived tokens
service principals
```

depending on deployment.

Never hardcode secrets into clients.

---

# 63. MCP Scope

A connection may be scoped to:

```text
workspace
sources
knowledge
skills
tools
```

Use least privilege.

---

# 64. MCP Read vs Write

Separate:

```text
Context retrieval
```

from:

```text
external action
```

Write capabilities should require stronger authorization.

---

# 65. MCP Context Response

Conceptual:

```json
{
  "context": [],
  "sources": [],
  "entities": [],
  "permissions": []
}
```

The final protocol/schema should follow MCP's actual implementation requirements.

---

# 66. MCP Source Provenance

When returning company context through MCP, preserve enough provenance for the receiving agent to understand:

```text
source
reference
timestamp
relationship
```

where supported.

---

# 67. MCP and Evidence

The same evidence principle applies:

```text
Agent receives context
 ↓
Agent can identify supporting source
```

This improves agent trust/debugging.

---

# 68. MCP Rate Limits

Apply rate limits by:

```text
principal
workspace
connection
operation
```

High-cost operations should have appropriate limits.

---

# 69. MCP Logging

Record appropriate operational/security metadata:

```text
principal
workspace
operation
timestamp
result
request ID
```

Avoid logging sensitive context unnecessarily.

---

# 70. MCP Revocation

Administrators should be able to:

```text
revoke connection
rotate credentials
change scope
disable client
```

where supported.

---

# 71. Agent ↔ Company Brain Architecture

```text
                    AGENT
                      │
                      ▼
               TASK / REQUEST
                      │
                      ▼
               API / MCP
                      │
                      ▼
                AUTHORIZATION
                      │
                      ▼
              COGNITRAG BRAIN
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
   KNOWLEDGE        GRAPH          RULES
       │              │              │
       └──────────────┼──────────────┘
                      ▼
              AUTHORIZED CONTEXT
                      │
                      ▼
                    AGENT
                      │
                ┌─────┴─────┐
                │           │
              Answer       Tool
                            │
                         Policy
                            │
                       Approval
                            │
                         Execute
```

---

# 72. Agent → Retrieval Mapping

The agent's context lookup may use:

```text
User/agent task
 ↓
CognitRAG query
 ↓
Contextualization
 ↓
Hybrid retrieval
 ↓
Reranking
 ↓
Graph if useful
 ↓
Context fusion
```

This reuses the Company Brain rather than rebuilding retrieval.

---

# 73. Agent → Semantic Dictionary

For company-specific terms:

```text
Agent
 ↓
Term "Churn Risk"
 ↓
Approved definition
 ↓
Skill logic
```

This reduces semantic ambiguity where the feature is implemented.

---

# 74. Agent → Rules

```text
Task
 ↓
Relevant rule
 ↓
Evaluate
 ↓
Agent response/action
```

The rule itself should remain authoritative independently of model generation.

---

# 75. Agent → SOP

Example:

```text
Agent:
"What is the current incident escalation procedure?"

CognitRAG:
Current SOP
+
Supporting sources
+
Relevant incident context
```

---

# 76. Agent → Decision

Example:

```text
Why was PostgreSQL selected?
```

Agent can retrieve:

```text
Decision
+
Reason
+
Alternatives
+
Evidence
```

---

# 77. Agent → Entity Graph

Example:

```text
Customer ACME
 ↓
Subscription
 ↓
Incident
 ↓
Service
 ↓
Owner
```

This can give an agent richer context than a single isolated document.

---

# 78. Agent → Source Evidence

The agent should be able to receive evidence references when relevant.

This creates:

```text
Machine-readable provenance
```

---

# 79. Agent → External Action

Future:

```text
Context
 ↓
Decision
 ↓
Policy
 ↓
Tool
 ↓
External system
```

Example:

```text
Customer issue
 ↓
Incident context
 ↓
Refund policy
 ↓
Refund tool
```

---

# 80. External Action Safety

Before any external write:

```text
Check principal
Check workspace
Check resource
Check permission
Check policy
Check approval
Execute
Audit
```

---

# 81. Agent Write-Back

Potential future actions:

```text
Create Jira ticket
Update CRM
Draft Slack message
Update support case
Create task
```

These should be introduced after the read/context layer is reliable.

---

# 82. Agent Readiness Ladder

Recommended maturity:

```text
Level 1
Context retrieval

Level 2
Context + structured skills

Level 3
Context + skills + read tools

Level 4
Context + controlled write tools

Level 5
Human-approved autonomous workflows

Level 6
Policy-controlled autonomy
```

Do not jump directly to Level 5/6.

---

# 83. MVP Agent Scope

Agents can remain:

```text
P2
```

while the Company Brain foundation is validated.

Initial agent MVP could be:

```text
Read-only
Company context
Skills
Basic permissions
Playground
```

---

# 84. Agent MVP Example

```text
Support Agent

Input:
"Why is ACME's payment failing?"

Context:
Customer
Ticket
Incident
Billing service

Output:
Explanation
Current workaround
Evidence
```

No external write action.

---

# 85. Agent P1/P2 Evolution

Later:

```text
Read
 ↓
Recommend
 ↓
Draft
 ↓
Approve
 ↓
Execute
```

This creates controlled automation.

---

# 86. Agent Context Quality

Before allowing write actions, ensure:

```text
Knowledge quality
Permission correctness
Rule correctness
Skill quality
Tool reliability
Evaluation quality
```

are strong enough for the use case.

---

# 87. Agent Reliability

Monitor:

```text
Task completion
Context failure
Tool failure
Policy violation
Unauthorized request
Human rejection
```

---

# 88. Agent Cost

Track:

```text
retrieval cost
model cost
tool cost
execution cost
```

The agent platform should have configurable limits.

---

# 89. Agent Latency

Measure:

```text
time to context
time to first response
tool latency
approval latency
total execution time
```

---

# 90. Agent Quality Evaluation

For each agent, evaluate:

```text
Task correctness
Context correctness
Rule adherence
Citation/provenance
Permission adherence
Action correctness
```

---

# 91. Agent Regression Dataset

Maintain tasks:

```text
simple
cross-source
relationship
temporal
permission
conflict
insufficient evidence
tool use
approval
```

Run after agent/skill changes.

---

# 92. Skill Regression

When a Skill changes:

```text
Test inputs
 ↓
Required context
 ↓
Expected rule
 ↓
Expected output
```

---

# 93. Tool Regression

Test:

```text
correct input
correct authorization
correct execution
correct result parsing
idempotency
failure handling
```

---

# 94. MCP Regression

Test:

```text
authentication
scope
resource access
tool access
revocation
rate limits
```

---

# 95. Security Principle

Agent permissions must be narrower than or equal to the authority granted by the organization's actual policy.

Never allow:

```text
agent-generated text
```

to create new permissions.

---

# 96. Architecture Principle

```text
LLM
= reasoning/generation component

Authorization
= system control

Policy
= organizational control

Tool
= external execution

Company Brain
= context layer
```

Do not collapse all four into one prompt.

---

# 97. Agent UX Principle

The user should understand:

```text
What is the agent?
What does it know?
What can it access?
What can it do?
What did it use?
What did it change?
```

---

# 98. Agent Configuration UI

Recommended tabs:

```text
Overview
Skills
Knowledge
Permissions
Tools
Playground
Runs
Settings
```

---

# 99. Agent Overview

```text
Customer Support Agent

Purpose
Assist support with customer cases.

Status
Active

Skills
4

Sources
12

Tools
2

Permissions
Support
```

---

# 100. Agent Knowledge Tab

Show:

```text
Allowed Knowledge
Allowed Sources
Policies
Rules
```

---

# 101. Agent Skills Tab

```text
Refund Handler
Customer Lookup
Incident Summary
Escalation Assistant
```

---

# 102. Agent Permissions Tab

```text
Sources
✓ Support
✓ Customer
× HR

Tools
✓ Customer Lookup
× Refund Execution
```

---

# 103. Agent Tools Tab

```text
Customer Lookup
Read-only
Healthy

Refund Execution
Write
Approval Required
```

---

# 104. Agent Playground

Three conceptual areas:

```text
Agent
Conversation
Context
```

Optional execution timeline below.

---

# 105. Agent Run Detail

```text
Run #9281

Request
Can ACME receive a refund?

Context
3 sources

Rule
Refund exception

Decision
Eligible

Action
No write action taken

Evidence
...
```

---

# 106. Agent Security Indicator

Every run can show:

```text
✓ Authorized context
✓ Policy checked
✓ No restricted data
```

Only display status claims backed by actual checks.

---

# 107. MCP Developer Experience

Developer page should provide:

```text
Connection
Endpoint
Scopes
Available resources
Available tools
Authentication
Examples
Logs
```

Do not expose secrets.

---

# 108. MCP Example

```text
Client
 ↓
MCP connection
 ↓
search_company_knowledge
 ↓
CognitRAG retrieval
 ↓
authorized context
```

---

# 109. API vs MCP

Use API/MCP based on client requirements.

Conceptually:

```text
Application integration
→ API

Agent/client context protocol
→ MCP
```

The actual choice depends on the client ecosystem.

---

# 110. Agent Platform Roadmap

Recommended:

```text
Phase 1
Read-only context

Phase 2
Skills

Phase 3
Agent Playground

Phase 4
MCP

Phase 5
Read tools

Phase 6
Controlled write tools

Phase 7
Human approval

Phase 8
Policy-controlled autonomy
```

---

# 111. Agent Architecture Readiness Criteria

Before write-enabled agents:

```text
[ ] Permission system proven
[ ] Retrieval quality proven
[ ] Evidence proven
[ ] Skills tested
[ ] Tool authorization exists
[ ] Audit exists
[ ] Action idempotency exists
[ ] Failure handling exists
[ ] Evaluation benchmark exists
```

---

# 112. Final Agent Architecture

```text
                       HUMAN / APPLICATION
                              │
                              ▼
                         AI AGENT
                              │
                    ┌─────────┴─────────┐
                    │                   │
                 CONTEXT              ACTION
                    │                   │
                    ▼                   ▼
              API / MCP             POLICY
                    │                   │
                    ▼                   │
              COGNITRAG BRAIN          │
                    │                   │
        ┌───────────┼───────────┐       │
        ▼           ▼           ▼       │
     VECTOR       GRAPH       RULES     │
        │           │           │       │
        └───────────┼───────────┘       │
                    ▼                   │
              AUTHORIZED CONTEXT        │
                    │                   │
                    └─────────┬─────────┘
                              ▼
                           TOOL
                              │
                        AUTHORIZATION
                              │
                          APPROVAL
                              │
                           EXECUTE
                              │
                            AUDIT
```

---

# 113. Final Machine-Facing Product Principle

> **CognitRAG should become the context and semantic control layer between company knowledge and AI agents, while leaving authorization and consequential execution under explicit system controls.**

---

# 114. Final Safety Principle

> **An agent may reason about what it should do, but the system—not the model—must decide what the agent is allowed to access or execute.**

---

# 115. Final Product Principle

The progression should be:

```text
Company Brain
      ↓
Context
      ↓
Skills
      ↓
Agents
      ↓
Tools
      ↓
Controlled actions
```

not:

```text
Chatbot
      ↓
Full autonomy immediately
```

---

# 116. Definition of Done

The agent/MCP platform is ready for serious production work when:

```text
[ ] Agent identity exists.
[ ] Agent permissions exist.
[ ] Context retrieval is permission-aware.
[ ] Skills are structured.
[ ] Rules are authoritative where required.
[ ] Agent context has provenance.
[ ] Agent runs are observable.
[ ] Tool access is separately authorized.
[ ] Write actions require explicit policy.
[ ] Human approval exists where required.
[ ] Action idempotency exists.
[ ] Agent loops are bounded.
[ ] MCP authentication exists.
[ ] MCP scope exists.
[ ] MCP revocation exists.
[ ] Agent evaluation exists.
[ ] Security regression tests exist.
[ ] Prompt-injection tests exist.
[ ] Tool-injection tests exist.
[ ] Auditability exists.
```

---

# 117. Canonical Agent Statement

> **CognitRAG provides AI agents with authorized company context, semantic definitions, rules, skills, and evidence through controlled API/MCP interfaces, while keeping permissions and consequential external actions outside the language model's authority.**
