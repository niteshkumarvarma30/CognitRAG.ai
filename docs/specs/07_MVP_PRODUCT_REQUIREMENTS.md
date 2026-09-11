# 07 — CognitRAG MVP Product Requirements
## Product Requirements, Scope, Priorities, Acceptance Criteria & Launch Plan

> **Status:** Master MVP requirements document.
>
> **Technical foundation:** Existing CognitRAG architecture.
>
> **UX foundation:** `05_COMPLETE_UI_UX_SPECIFICATION.md`
>
> **Interaction foundation:** `06_USER_FLOWS_AND_INTERACTIONS.md`
>
> **Goal:** Define the smallest production-quality CognitRAG product that can be launched to real design partners, demonstrate the Company Brain value, and generate evidence for product-market fit.

---

# 1. MVP Objective

The MVP is not the complete long-term Company Brain platform.

The MVP must prove one central hypothesis:

> **A company gets materially better answers when its fragmented internal knowledge is connected into a semantic, permission-aware context layer.**

The MVP should prove this through a small set of high-value workflows.

---

# 2. MVP Product Promise

The MVP should let a customer:

```text
Connect company sources
        ↓
Build company context
        ↓
Ask questions
        ↓
Receive grounded answers
        ↓
Inspect evidence
        ↓
Explore relationships
```

The first version does not need every future automation or agent capability.

---

# 3. MVP Scope Principle

Build:

> **One excellent Company Brain experience**

before building:

> **A complete enterprise AI platform.**

Avoid premature complexity.

---

# 4. MVP Priority Levels

Use:

```text
P0
Required for first real customer.

P1
Important immediately after initial validation.

P2
Expansion features.

P3
Long-term platform features.
```

---

# 5. P0 — Must Have

```text
Authentication
Workspace
Onboarding
Source connections
Initial ingestion
Permission controls
Hybrid retrieval
Knowledge graph
Ask Brain
Streaming answers
Source evidence
Confidence/status
Basic knowledge browsing
Basic graph exploration
Basic activity
Basic settings
```

---

# 6. P1 — Near-Term

```text
Semantic Dictionary
SOPs
Decisions
Review Queue
Knowledge change detection
Skills
Advanced knowledge governance
More integrations
Improved analytics
```

---

# 7. P2 — Platform Expansion

```text
AI Agents
Agent Playground
MCP
Advanced automation
Proactive intelligence
Write-back actions
Advanced audit
Advanced evaluation
```

---

# 8. P3 — Enterprise Scale

```text
Private deployment
Advanced enterprise identity
Advanced governance
Dedicated infrastructure
Expanded compliance program
Enterprise deployment controls
Large-scale connector ecosystem
```

---

# 9. Core MVP User

Primary user:

> Technical teams inside a growing technology company who lose operational knowledge across multiple systems.

Initial functional teams:

```text
Engineering
Support
Operations
AI / Platform
```

---

# 10. Primary MVP Use Case

The initial high-value use case should be:

> **Cross-system operational knowledge retrieval.**

Example:

```text
"What changed in our billing deployment?"
```

The answer may require:

```text
Slack
+
Jira
+
GitHub
```

The product must connect those sources and return:

```text
Answer
+
Context
+
Evidence
+
Freshness
```

---

# 11. Secondary MVP Use Case

## Engineering Knowledge

Questions:

```text
Who owns the billing service?

Why was PostgreSQL selected?

What happened during INC-902?

What is the current deployment workflow?
```

---

# 12. Secondary MVP Use Case

## Support → Engineering

Question:

```text
Why is customer ACME receiving payment failures?
```

Retrieve context from:

```text
Support ticket
+
Incident
+
Engineering discussion
+
Relevant code/change
```

Return:

```text
Cause
Current status
Resolution
Owner
Evidence
```

---

# 13. MVP Success Hypothesis

The MVP is successful if design partners demonstrate:

```text
Faster answers
Less internal searching
Fewer repeated questions
Reduced support → engineering escalation
Higher trust in AI answers
Regular Brain usage
```

Exact targets should be established after baseline measurements.

---

# 14. Product Requirements — Authentication

## Requirement

Users must be able to securely authenticate.

Existing architecture uses Clerk.

## Must support

```text
Sign up
Sign in
Sign out
Session persistence
Password / identity-provider recovery where applicable
```

## Acceptance criteria

```text
[ ] Unauthorized users cannot access dashboard.
[ ] Authenticated users reach their workspace.
[ ] Sign out invalidates the current application session.
[ ] Protected routes are enforced.
```

---

# 15. Workspace Requirements

A user must belong to a workspace.

## Workspace contains

```text
Users
Sources
Knowledge
Permissions
Brain configuration
```

## Acceptance criteria

```text
[ ] Workspace can be created.
[ ] Workspace can be identified.
[ ] User role is stored.
[ ] Workspace data is isolated.
```

---

# 16. Onboarding Requirements

The MVP onboarding must guide users through:

```text
Create workspace
        ↓
Connect first source
        ↓
Choose scope
        ↓
Start sync
        ↓
Ask first question
```

## Acceptance criteria

```text
[ ] New users know what to do next.
[ ] At least one source can be connected.
[ ] Sync status is visible.
[ ] User can reach Ask Brain.
```

---

# 17. Integration Requirements

Minimum launch connectors should be selected according to the target design partners.

Recommended initial set:

```text
Slack
GitHub
Jira
Google Workspace / Documents
```

Do not claim all connectors are available if they are not implemented.

---

# 18. Integration Connection

Every connector must provide:

```text
Connect
Authorize
Scope
Status
Sync
Error state
Disconnect
```

---

# 19. Integration Permission Scope

Users must understand what information is being accessed.

Example:

```text
Slack

Included
43 channels

Excluded
7 channels

Private channels
Not included
```

The actual scope must reflect the connector implementation.

---

# 20. Integration Sync

UI states:

```text
Not Connected
Connecting
Syncing
Healthy
Paused
Authorization Required
Error
```

---

# 21. Integration Acceptance Criteria

```text
[ ] User can authorize a connector.
[ ] Scope is shown before ingestion.
[ ] Connection status persists.
[ ] Sync progress is shown.
[ ] Errors are understandable.
[ ] User can reconnect.
[ ] User can disconnect.
[ ] Disconnect creates an audit event when audit infrastructure exists.
```

---

# 22. Ingestion Requirements

The architecture already includes:

```text
PDF / document parsing
Parent chunking
Pronoun resolution
Graph extraction
Child chunking
Embedding
Vector storage
Structured integrations
```

The MVP should preserve this architecture where it is already functioning.

---

# 23. Ingestion Pipeline

Conceptual MVP flow:

```text
Source
 ↓
Fetch
 ↓
Normalize
 ↓
Parse
 ↓
Extract context
 ↓
Resolve entities
 ↓
Create relationships
 ↓
Create chunks
 ↓
Generate embeddings
 ↓
Store
```

---

# 24. Ingestion Acceptance Criteria

```text
[ ] New source data is ingested.
[ ] Source metadata is preserved.
[ ] Parent/child context relationship is preserved where implemented.
[ ] Entities can be associated with source content.
[ ] Vectors are stored.
[ ] Graph relationships are created where supported.
[ ] Failed records are observable.
```

---

# 25. Data Freshness

The MVP must preserve source timestamps where available.

The UI should show:

```text
Updated 2 hours ago
```

rather than pretending all knowledge is always live.

---

# 26. Vector Retrieval Requirements

The existing architecture uses:

```text
BM25
+
HNSW vector search
+
RRF
```

The MVP should retain this hybrid retrieval architecture if already operational.

---

# 27. Retrieval Acceptance Criteria

```text
[ ] Query can retrieve semantic matches.
[ ] Exact-term queries can retrieve relevant matches.
[ ] Hybrid results can be fused.
[ ] Retrieved content respects access controls.
[ ] Source metadata is preserved.
```

---

# 28. Reranking Requirements

The existing system uses Jina reranking and a corrective retrieval path.

MVP requirement:

```text
Retrieve
 ↓
Rerank
 ↓
Filter
 ↓
Correct / retry if necessary
```

The exact score thresholds should remain implementation configuration rather than becoming a product-facing promise.

---

# 29. Graph Retrieval Requirements

If the graph decision path is enabled:

```text
Retrieved entities
 ↓
Determine whether graph expansion helps
 ↓
Traverse relevant relationships
 ↓
Merge with retrieved text
 ↓
Rerank combined context
```

The graph should be used when it adds useful context, not for every query.

---

# 30. Ask Brain Requirements

Ask Brain is P0.

The user must be able to:

```text
Enter question
Submit
See processing state
Receive streamed answer
See sources
See freshness
See confidence/status
Ask follow-up
```

---

# 31. Ask Brain Acceptance Criteria

```text
[ ] User can submit a question.
[ ] Question is associated with the correct workspace.
[ ] Retrieval respects permissions.
[ ] Answer streams to the UI.
[ ] Sources are shown.
[ ] Source references are clickable.
[ ] Follow-up questions preserve conversation context.
[ ] Errors are recoverable.
```

---

# 32. Answer Requirements

The standard answer structure:

```text
Answer
Important context
Evidence
Freshness
Confidence / status
Related knowledge
```

Do not force all answers into a long template.

---

# 33. Evidence Requirements

Every grounded answer should expose source evidence where available.

Example:

```text
Evidence

Jira BILL-902
GitHub PR #1287
Slack #engineering
```

---

# 34. Source Receipt Requirements

Clicking evidence opens:

```text
Source
Reference
Type
Updated
Why relevant
Related entity
```

---

# 35. Answer Safety Requirements

The MVP must avoid presenting unsupported information as established fact.

When evidence is insufficient:

```text
Not enough reliable evidence.

The available company context doesn't support
a confident answer.
```

---

# 36. Conflict Requirements

If relevant sources disagree:

```text
Conflicting information

Source A
...

Source B
...

[ Compare ]
```

Do not silently choose one source unless the implemented authority model supports doing so.

---

# 37. Confidence Requirements

Use:

```text
High confidence
Moderate confidence
Low confidence
Conflicting
Insufficient evidence
```

A numerical confidence percentage is optional and must have a defensible interpretation.

---

# 38. User Memory Requirements

The existing architecture includes user memory.

MVP should only expose or use memory where its behavior is clearly useful and privacy-safe.

Potential examples:

```text
User preferences
Personal working context
Conversation continuity
```

Do not use memory to override authoritative company knowledge.

---

# 39. Permission Requirements

Permissions are P0.

The MVP must distinguish:

```text
User identity
Workspace role
Source permissions
Knowledge access
```

---

# 40. Security Boundary

UI visibility is not the security boundary.

Backend/database authorization must enforce access before restricted content is returned.

---

# 41. RBAC Requirements

Minimum roles can begin with:

```text
Admin
Member
Viewer
```

Add more roles only when real customer requirements justify them.

---

# 42. Admin Capabilities

Admins can:

```text
Manage users
Manage sources
Configure permissions
Review important settings
View authorized audit information
```

---

# 43. Member Capabilities

Members can:

```text
Ask Brain
Browse permitted knowledge
Explore permitted graph
```

Additional editing capabilities should be deliberately assigned.

---

# 44. Viewer Capabilities

Viewer:

```text
Read permitted knowledge
Ask Brain
No administrative controls
```

Exact permissions should follow the actual authorization implementation.

---

# 45. Knowledge Graph Requirements

The MVP graph should support:

```text
Search
Select entity
Show relationships
View entity details
Open evidence
Ask Brain about entity
```

No need for advanced graph editing initially.

---

# 46. Graph Acceptance Criteria

```text
[ ] Relevant entities render.
[ ] User can search for an entity.
[ ] Selected entity is visually distinct.
[ ] Relationships are understandable.
[ ] Restricted nodes/edges are not leaked.
[ ] Entity details open.
```

---

# 47. Knowledge Library

P0 basic version:

```text
Search
Filter
Browse
Open item
View source
View relationships
```

Advanced editorial tooling can remain P1.

---

# 48. Semantic Dictionary

P1.

Purpose:

> Define controlled company terminology and business semantics.

Example:

```text
Churn Risk
Definition
Owner
Version
Usage
```

---

# 49. SOPs

P1.

Purpose:

> Turn operational knowledge into reusable procedures.

Requirements:

```text
List
Open
Version
Source evidence
Change history
Review
```

---

# 50. Decisions

P1.

Purpose:

> Preserve important organizational decisions.

Requirements:

```text
Decision
Reason
Alternatives
Owner
Date
Sources
Related entities
```

---

# 51. Knowledge Review Queue

P1.

Purpose:

> Give authorized humans a place to review proposed knowledge changes.

Items:

```text
Potential rule
SOP change
Conflict
Stale knowledge
Decision candidate
```

---

# 52. Human Approval

Important knowledge transitions:

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
```

Do not equate AI extraction with organizational authority.

---

# 53. Skills

P1/P2.

Skills should eventually contain:

```text
Purpose
Inputs
Required Context
Rules
Allowed Actions
Sources
Permissions
Version
```

Do not block MVP launch on a complete skill system.

---

# 54. AI Agents

P2.

Long-term requirements:

```text
Create
Configure
Test
Permission
Deploy
Pause
Audit
```

Initial MVP can demonstrate the concept without exposing the full platform.

---

# 55. MCP

P2.

MCP should become the machine-facing context interface.

Do not make MCP the primary onboarding concept for non-technical users.

---

# 56. Agent Playground

P2.

Purpose:

> Let developers test how agents use company context.

Should eventually show:

```text
Agent
Request
Context
Policies
Skills
Tools
Result
```

---

# 57. Activity

P0 basic.

Show:

```text
Knowledge changes
Sync events
Important system events
```

P1:

```text
Knowledge review
Agent activity
Detailed change history
```

---

# 58. Security Center

P0 basic:

```text
Users
Roles
Source access
Security status
```

P1/P2:

```text
Detailed audit
Advanced policies
Security analytics
```

---

# 59. Audit Logging

For consequential actions, record:

```text
Actor
Action
Resource
Timestamp
Result
```

Examples:

```text
Integration connected
Role changed
Rule approved
SOP published
Agent activated
```

---

# 60. Settings

P0:

```text
Workspace
Profile
Appearance
Basic notifications
```

P1:

```text
Advanced workspace settings
Knowledge settings
Developer settings
```

---

# 61. Dashboard Requirements

Home dashboard must show:

```text
Ask Brain
Connected sources
Knowledge health
Recent changes
Important actions
```

Do not overload it with every product metric.

---

# 62. Dashboard Empty State

Before data exists:

```text
Your Company Brain is waiting for context.

Connect your first source.

[ Connect Source ]
```

---

# 63. Dashboard Post-Activation

After first sync:

```text
Your Brain is ready.

12 sources
128,420 knowledge items
3 items need review

[ Ask Brain ]
```

Only show actual measured values.

---

# 64. Notification Requirements

Important notifications:

```text
Source disconnected
Sync failed
Knowledge review required
Security event
Agent issue
```

Do not notify users for every ingestion event.

---

# 65. Mobile MVP

Mobile must support:

```text
Sign in
Ask Brain
Search
Recent changes
Notifications
Basic knowledge browsing
Basic approval where implemented
```

Graph should be simplified.

---

# 66. Performance Requirements

The MVP UX should prioritize:

```text
Fast application load
Fast question submission
Streaming answers
Visible progress
Responsive navigation
```

Avoid blocking the entire application while large sync jobs run.

---

# 67. Error Handling Requirements

Every major workflow requires:

```text
Loading
Success
Empty
Error
Unauthorized
```

Where relevant:

```text
Partial
Stale
Conflicting
```

---

# 68. Observability Requirements

The team should be able to diagnose:

```text
Ingestion failure
Retrieval failure
Model/API failure
Graph failure
Permission failure
Frontend error
```

Internal logs may contain technical details that normal users should not see.

---

# 69. Analytics Requirements

Track product events:

```text
workspace_created
source_connected
sync_started
sync_completed
first_question
first_answer
source_opened
graph_opened
feedback_submitted
user_invited
```

For agents later:

```text
agent_created
agent_tested
agent_deployed
agent_failed
```

---

# 70. Privacy for Product Analytics

Do not unnecessarily store:

```text
full sensitive user queries
private source content
secrets
credentials
```

Capture only what is required for product improvement and operations.

---

# 71. MVP Activation Definition

Recommended activation:

> **A workspace connects at least one source and receives its first evidence-backed Brain answer.**

This is the initial "aha" event.

---

# 72. Retention Signal

A strong retention signal is:

> Users repeatedly return to ask company-specific questions because the Brain saves them meaningful time.

Track:

```text
Weekly active workspaces
Questions per workspace
Repeat users
Source inspection
```

---

# 73. Value Measurement

For design partners, establish a baseline.

Potential measures:

```text
Time to find answer
Support escalation volume
Repeated internal questions
Onboarding time
Time spent investigating incidents
```

Compare before vs after CognitRAG.

---

# 74. Launch Customer Profile

Ideal first customer:

```text
50–200 employees
Technology company
Multiple internal tools
Active Slack/Jira/GitHub usage
Frequent support/engineering collaboration
AI experimentation
Clear knowledge-fragmentation pain
```

This aligns with the initial startup strategy.

---

# 75. Design Partner Program

Target:

```text
5–10 companies
```

Offer:

```text
White-glove setup
Selected integrations
Custom onboarding
Weekly feedback
Direct founder access
Early pricing
```

---

# 76. Design Partner Requirements

Before onboarding, understand:

```text
Current knowledge systems
Most painful workflow
Expected outcome
Security requirements
Primary users
Existing AI tooling
```

Do not force every customer into the same integration package.

---

# 77. Customer Implementation

Recommended:

```text
Kickoff
 ↓
Define target workflow
 ↓
Connect first sources
 ↓
Scope permissions
 ↓
Index
 ↓
Test questions
 ↓
Validate answers
 ↓
Measure baseline
 ↓
Launch pilot
```

---

# 78. Pilot Success Criteria

Define with each customer.

Potential:

```text
Answer quality
Time saved
User adoption
Support escalation reduction
Employee satisfaction
AI agent improvement
```

Do not use universal success numbers before measuring real customers.

---

# 79. MVP Demo Requirements

The demo must show:

```text
Connect source
 ↓
Sync
 ↓
Ask question
 ↓
Answer
 ↓
Evidence
 ↓
Graph
```

Optional:

```text
Knowledge update
Agent context
```

---

# 80. MVP Demo Narrative

Use one story:

```text
A billing issue occurred.

Information is distributed across Slack,
Jira and GitHub.

CognitRAG connects the context.

User asks:
"What changed and why?"

Brain answers:
What changed
Why
Current process
Owner
Evidence

User opens graph.

Then opens source receipt.
```

---

# 81. Technical MVP Architecture Alignment

Current architecture:

```text
Next.js
Clerk
FastAPI
Supabase + pgvector
Neo4j
LangGraph
SSE
LLM routing
Jina embeddings
Jina reranking
```

MVP should avoid unnecessary new infrastructure unless required by real scale.

---

# 82. Architecture Simplification Principle

Do not add:

```text
Kafka
Kubernetes
additional databases
complex event buses
multi-region infrastructure
```

only because they are common enterprise technologies.

Introduce them when:

```text
traffic
scale
reliability
customer requirements
```

justify them.

---

# 83. MVP Data Model Concepts

Core objects:

```text
Workspace
User
Role
Source
Document / Item
Chunk
Embedding
Entity
Relationship
Conversation
Message
Answer
Citation
Knowledge Event
Audit Event
```

P1:

```text
SOP
Decision
Dictionary Term
Skill
Review Item
```

P2:

```text
Agent
Tool
MCP Connection
Execution
```

---

# 84. Core Object Relationship

```text
Workspace
 ├── Users
 ├── Sources
 ├── Knowledge
 ├── Conversations
 └── Permissions

Knowledge
 ├── Entities
 ├── Relationships
 ├── Sources
 └── History
```

---

# 85. Source Provenance

Every indexed knowledge item should preserve provenance such as:

```text
Source
Source ID
Timestamp
Location/reference
Permissions
```

The exact schema should follow the current backend implementation.

---

# 86. Answer Provenance

Every answer should preserve enough metadata to support:

```text
Which sources contributed?
Which entities were relevant?
What timestamp/source metadata applies?
```

This supports the Source Receipt UX.

---

# 87. MVP Security Minimum

Before real customer data is accepted:

```text
[ ] Authentication
[ ] Workspace isolation
[ ] Database-level authorization
[ ] Source scope controls
[ ] Permission-aware retrieval
[ ] Secure secrets handling
[ ] Audit for consequential admin actions
[ ] Secure transport
[ ] Backup / recovery process
[ ] Data deletion process
```

The exact security program should be reviewed before production enterprise deployment.

---

# 88. MVP Privacy Minimum

Define:

```text
What data is collected?
Where is it stored?
Who can access it?
How long is it retained?
How can it be deleted?
Which external AI services process data?
```

These must be documented accurately.

---

# 89. AI Provider Disclosure

If external model providers process customer data, customers should be able to understand:

```text
Which provider
What data is sent
Why it is sent
Retention behavior
Configuration
```

Only publish information supported by actual provider contracts/configuration.

---

# 90. MVP Compliance Messaging

Do not claim:

```text
SOC 2 certified
HIPAA compliant
GDPR certified
Enterprise certified
```

unless the relevant certification/compliance work is actually completed and applicable.

Use:

> **Security-first architecture**

or describe specific implemented controls.

---

# 91. Product Quality Requirements

The MVP should feel:

```text
Fast
Polished
Reliable
Trustworthy
Easy to understand
```

It is better to have:

```text
10 excellent screens
```

than:

```text
40 unfinished screens.
```

---

# 92. MVP Screen List

P0 screens:

```text
Landing
Sign Up / Sign In
Onboarding
Dashboard
Ask Brain
Source Receipt
Integrations
Knowledge Graph
Knowledge Library
Security / Access
Basic Settings
```

---

# 93. P1 Screen List

```text
Semantic Dictionary
SOPs
Decision Center
Entity Explorer
Review Queue
Activity Center
```

---

# 94. P2 Screen List

```text
Skills
Agents
Agent Playground
MCP
Advanced Analytics
Advanced Governance
```

---

# 95. MVP Definition of Done

Product:

```text
[ ] User can create/join workspace.
[ ] User can connect at least one source.
[ ] Source can synchronize.
[ ] Indexed content is permission-aware.
[ ] User can ask Brain.
[ ] Answer streams.
[ ] Evidence is shown.
[ ] Source receipt works.
[ ] Graph is usable.
[ ] Basic dashboard works.
[ ] Security controls are enforced.
[ ] Error states work.
[ ] Mobile works.
```

---

# 96. Customer Readiness Checklist

Before allowing real customer data:

```text
[ ] Security review
[ ] Permission testing
[ ] Data deletion tested
[ ] Backup/recovery tested
[ ] Connector authorization tested
[ ] Failed-sync behavior tested
[ ] Retrieval permission tests
[ ] Source citation tests
[ ] Hallucination/insufficient-evidence tests
[ ] Performance tests
[ ] Monitoring
[ ] Incident response process
```

---

# 97. AI Quality Evaluation

Create a representative evaluation dataset.

Questions should cover:

```text
Simple retrieval
Cross-source questions
Entity relationships
Temporal changes
Permissions
Conflicting sources
Insufficient evidence
Follow-up questions
```

---

# 98. Evaluation Metrics

Potential:

```text
Faithfulness
Context relevance
Context precision
Answer correctness
Retrieval recall
Latency
```

The exact benchmark methodology must be documented.

Do not present internal evaluation metrics as universal guarantees.

---

# 99. Retrieval Evaluation

Test:

```text
Vector-only
BM25-only
Hybrid
Hybrid + reranking
Hybrid + graph
```

Compare on the same dataset.

This validates whether the architectural complexity actually produces measurable benefit.

---

# 100. Permission Evaluation

Construct tests such as:

```text
User A can access source X
User B cannot access source X
```

Verify:

```text
Search
Graph
Ask Brain
Citations
```

all respect permissions.

---

# 101. Temporal Evaluation

Questions:

```text
What is the current deployment process?

What changed since last month?

What was the previous process?
```

The system must distinguish current vs historical knowledge where supported.

---

# 102. Conflict Evaluation

Test:

```text
Source A says X.
Source B says Y.
```

Expected:

```text
Conflict is surfaced
rather than silently ignored.
```

---

# 103. Insufficient Evidence Evaluation

Expected:

```text
System admits insufficient evidence
rather than inventing an answer.
```

---

# 104. Cost Monitoring

Track internally:

```text
LLM usage
Embedding usage
Reranking usage
Database usage
Infrastructure
```

The user does not need to see these in the MVP dashboard.

---

# 105. Latency Monitoring

Track:

```text
Time to first token
Retrieval latency
Reranking latency
Graph latency
Total answer latency
```

Use this for engineering optimization.

---

# 106. Reliability Monitoring

Monitor:

```text
API failures
Connector failures
Sync failures
Model failures
Database failures
SSE interruptions
```

---

# 107. MVP Launch Stages

Use:

```text
Internal Alpha
 ↓
Friendly Tester
 ↓
Design Partner
 ↓
Paid Pilot
 ↓
Repeatable Sales
 ↓
Public Launch
```

Do not go directly from prototype to mass-market launch.

---

# 108. Internal Alpha

Test:

```text
Authentication
Sources
Ingestion
Retrieval
Graph
Ask Brain
Permissions
```

Use synthetic or non-sensitive data.

---

# 109. Friendly Tester

Use trusted people to identify:

```text
UX confusion
Wrong answers
Missing sources
Poor graph usability
Onboarding problems
```

---

# 110. Design Partner

Use real workflow.

Focus on:

```text
One team
One workflow
2–4 sources
One measurable pain
```

---

# 111. Paid Pilot

Charge enough to validate willingness to pay.

Do not optimize packaging before understanding customer value.

---

# 112. Public Launch Readiness

Public launch should happen after:

```text
Repeated successful customer workflow
Stable ingestion
Reliable retrieval
Good permissions
Known security posture
Clear positioning
Strong demo
```

---

# 113. MVP Team Priorities

If the founding team is small:

```text
Founder/Product
Customer discovery
Product decisions
Demo
Sales

Backend/AI
Ingestion
Retrieval
Graph
Evaluation

Frontend
Landing page
Design system
Ask Brain
Dashboard
Integrations

Infrastructure/Security
Auth
Deployment
Monitoring
Data protection
```

One person can cover multiple areas.

---

# 114. Development Order

Recommended build sequence:

```text
1. Foundation / Auth
2. Workspace
3. Design system
4. Landing page
5. Integration framework
6. First connector
7. Ingestion
8. Retrieval
9. Ask Brain
10. Evidence
11. Permissions
12. Graph
13. Dashboard
14. Second/third connector
15. Pilot hardening
```

---

# 115. Why Ask Brain Comes Early

Ask Brain proves:

```text
Sources
→ Retrieval
→ Semantic context
→ Answer
```

without requiring the entire Company Brain platform to be complete.

---

# 116. Why Graph Comes After Retrieval

The graph is powerful, but the core customer value must first be observable.

Build:

```text
Useful retrieval
```

before:

```text
Advanced graph visualization
```

---

# 117. Why Skills/Agents Come Later

Skills and agents become much more valuable once:

```text
Knowledge
+
Permissions
+
Rules
+
Evidence
```

are reliable.

Do not build autonomous execution on weak knowledge foundations.

---

# 118. Product Expansion Sequence

```text
Search
 ↓
Company Brain
 ↓
Living Knowledge
 ↓
Skills
 ↓
Agents
 ↓
Execution
```

This is the strategic product expansion.

---

# 119. MVP North Star

Recommended:

> **Verified knowledge interactions per active workspace per week.**

Supporting metrics:

```text
Activation
Retention
Questions
Source inspection
User feedback
Customer outcome
```

---

# 120. Customer Value Dashboard

For internal customer reviews, report:

```text
Questions answered
Sources connected
Time saved
Repeated questions reduced
Support escalations
Most valuable workflows
```

Use measured data rather than invented ROI.

---

# 121. Exit Criteria for MVP

The MVP is ready for broader launch when:

```text
[ ] At least several real users successfully use it.
[ ] At least one workflow demonstrates clear customer value.
[ ] Users can verify answers.
[ ] Permission boundaries have been tested.
[ ] Core connectors are reliable.
[ ] Error recovery is acceptable.
[ ] The product can be demonstrated consistently.
[ ] The team understands why customers use it.
[ ] The team understands why customers do not use it.
[ ] Pricing discussions can begin from observed value.
```

---

# 122. What to Cut if Development Is Too Large

Cut first:

```text
Advanced analytics
Advanced agent playground
MCP UI polish
Complex knowledge editing
Large connector catalog
Advanced graph editing
Complex automation
```

Do NOT cut:

```text
Authentication
Permissions
Source evidence
Ask Brain
Retrieval quality
Reliable ingestion
Basic graph
Error handling
```

---

# 123. Final MVP Architecture

```text
            CUSTOMER WORKSPACE
                    |
           +--------+--------+
           |        |        |
         Slack    Jira     GitHub
           \        |       /
            \       |      /
             +------v-----+
             | INGESTION  |
             +------+-----+
                    |
             +------v------+
             |  KNOWLEDGE  |
             |             |
             | Vector +    |
             | Graph       |
             +------+------+
                    |
             +------v------+
             |   BRAIN     |
             |             |
             | Retrieval   |
             | Context     |
             | Evidence    |
             +------+------+
                    |
             +------+------+
             |             |
          Employees     Future Agents
```

---

# 124. Final MVP Product

The first real CognitRAG product should feel like:

```text
CONNECT
Your company's systems.

ASK
Your company's knowledge.

VERIFY
The evidence behind the answer.

EXPLORE
The relationships around it.
```

That is enough to validate the Company Brain thesis.

---

# 125. Final Principle

> **The MVP is not the smallest version of every feature. It is the smallest version of the product that proves the central customer value.**

For CognitRAG, that value is:

> **Connecting fragmented enterprise knowledge so people can get more useful, evidence-backed answers with the right context and permissions.**
