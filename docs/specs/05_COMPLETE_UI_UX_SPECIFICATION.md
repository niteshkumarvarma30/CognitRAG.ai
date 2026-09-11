# 05 — CognitRAG Complete UI/UX Specification
## Full Product Application — Screen-by-Screen Product Design

> **Status:** Master application UI/UX specification.
>
> **Visual foundation:** `04_DESIGN_SYSTEM.md`
>
> **Marketing foundation:** `03_LANDING_PAGE_SPECIFICATION_V2.md`
>
> **Objective:** Define the complete CognitRAG application experience so a frontend developer or Antigravity can implement the product consistently without inventing screens, navigation, states, or interaction behavior.

---

# 1. Product UI Philosophy

CognitRAG should not feel like:

> "A chatbot with some enterprise features."

It should feel like:

> **A Company Brain that people can explore, question, verify, manage, and connect to AI agents.**

The application therefore has five primary modes:

```text
ASK
Get answers.

EXPLORE
Understand knowledge and relationships.

MANAGE
Maintain knowledge, definitions, SOPs, skills, and sources.

AUTOMATE
Give agents access to company context.

CONTROL
Manage permissions, security, activity, and governance.
```

---

# 2. Application Information Architecture

The main application navigation should be:

```text
COGNITRAG

HOME

ASK
  Ask Brain

KNOWLEDGE
  Knowledge Graph
  Knowledge Library
  Semantic Dictionary
  SOPs
  Decisions
  Entities

AI
  Skills
  Agents
  Playground
  MCP

DATA
  Integrations
  Activity

SECURITY
  Access Control
  Audit Logs

SETTINGS
```

The exact routes can evolve, but the conceptual information architecture should remain stable.

---

# 3. Global Application Shell

Desktop:

```text
┌───────────────┬──────────────────────────────────────────┐
│               │ Global Header                            │
│               ├──────────────────────────────────────────┤
│   Sidebar     │                                          │
│               │                Page Content              │
│               │                                          │
│               │                                          │
│               │                                          │
└───────────────┴──────────────────────────────────────────┘
```

Mobile:

```text
┌──────────────────────────────────┐
│ ☰  CognitRAG              User  │
├──────────────────────────────────┤
│                                  │
│          Page Content            │
│                                  │
└──────────────────────────────────┘
```

---

# 4. Global Header

Header contains:

```text
Search / Command
Notifications
Help
Workspace selector
User menu
```

Example:

```text
┌──────────────────────────────────────────────────────┐
│ Search your company...        ?   🔔   Workspace  👤 │
└──────────────────────────────────────────────────────┘
```

---

# 5. Workspace Selector

For future multi-workspace support:

```text
AcmeCloud
Personal

[ Create Workspace ]
```

Enterprise customers may eventually have:

```text
Organization
  ├── Production
  ├── Staging
  └── Sandbox
```

Do not build unnecessary complexity into MVP.

---

# 6. User Menu

```text
Nitesh Kumar
user@company.com

Profile
Preferences
Keyboard Shortcuts

Organization Settings

Sign Out
```

---

# 7. Global Search

Shortcut:

```text
Ctrl + K
```

or:

```text
⌘ K
```

Search across:

```text
Documents
Entities
People
Decisions
SOPs
Skills
Sources
```

Also provide:

```text
Ask Brain
```

as a direct search-to-answer action.

---

# 8. Command Palette

Example:

```text
Search CognitRAG

Ask Brain
Open Knowledge Graph
Open Integrations
Search SOPs
View Recent Changes
Open Security
Create Skill
```

Support keyboard navigation.

---

# 9. Notification Center

Example:

```text
Notifications

Knowledge
New rule detected
Refund Policy may require review.

Knowledge
Billing SOP changed.

Integration
GitHub synchronization completed.

Security
New role assignment.
```

Each notification should include:

```text
What happened
Time
Action
```

---

# 10. HOME — Dashboard

Route:

```text
/dashboard
```

Purpose:

> Give users an immediate understanding of the state of their Company Brain.

---

# 11. Dashboard Header

```text
Good morning.

Your Company Brain is up to date.

                         [ Ask Brain ]
```

Use the user's actual name where available.

---

# 12. Dashboard Ask Brain Entry

Large central input:

```text
What do you want to know?

┌──────────────────────────────────────────────┐
│ Ask your company...                      ↑   │
└──────────────────────────────────────────────┘
```

Suggested queries:

```text
What changed this week?

Why was the billing architecture changed?

Who owns the payment service?

Which SOPs changed recently?
```

---

# 13. Dashboard Metrics

Only show meaningful metrics.

Recommended:

```text
Connected Sources
12

Knowledge Items
128,420

Knowledge Health
98.7%

Items Requiring Review
12
```

Avoid vanity metrics.

---

# 14. Dashboard Recent Changes

Section:

> **Recent changes**

Example:

```text
Billing SOP updated
2 hours ago

New incident relationship detected
4 hours ago

GitHub synchronization completed
5 hours ago

New decision captured
Yesterday
```

---

# 15. Dashboard Knowledge Health

Example:

```text
Knowledge Health

Freshness             98.7%
Verified              94.2%
Needs Review          12
Conflicting           3
```

These metrics must be backed by real calculations.

---

# 16. Dashboard Integrations

Small preview:

```text
Connected Sources

Slack       ✓
GitHub      ✓
Jira        ✓
Notion      ✓

[ Manage Integrations ]
```

---

# 17. Dashboard Brain Activity

Show a compact live feed:

```text
Brain Activity

09:42  Rule detected
09:18  SOP updated
08:51  Entity discovered
08:12  GitHub synced
```

---

# 18. Dashboard Empty State

For a new workspace:

```text
Your Company Brain is waiting for context.

Connect your first source to start.

[ Connect a Source ]
```

After connection:

```text
Your Brain is learning from Slack.

Initial sync
██████████████░░░░  72%

You can ask questions once the
first source is ready.
```

---

# 19. ASK BRAIN

Route:

```text
/ask
```

This is the core user experience.

---

# 20. Ask Brain Layout

Initial:

```text
             Ask your company anything.

       Search across your company knowledge.

┌────────────────────────────────────────────────┐
│ What changed in billing this week?         ↑  │
└────────────────────────────────────────────────┘

Suggested

[ Decisions ] [ Changes ] [ Ownership ] [ SOPs ]
```

---

# 21. Ask Brain Query Flow

```text
User question
     ↓
Input validation
     ↓
Retrieve relevant knowledge
     ↓
Apply permissions
     ↓
Combine context
     ↓
Generate answer
     ↓
Stream answer
     ↓
Display evidence
```

The UI should represent only meaningful user-facing states.

---

# 22. Ask Brain Processing State

Show:

```text
Retrieving company context...
```

Then:

```text
Synthesizing answer...
```

Do not expose hidden model reasoning.

---

# 23. Ask Brain Answer Layout

```text
ANSWER

Billing deployment changed yesterday.

A migration pre-check was added before
production deployment following incident INC-902.

Evidence

[Jira BILL-902]
[GitHub PR #1287]
[Slack #engineering]

● High confidence

Updated 4 hours ago
```

---

# 24. Answer Actions

Available:

```text
Copy
Share
Open Sources
Ask Follow-up
Save
Give Feedback
```

Optional:

```text
Open in Knowledge Graph
```

---

# 25. Follow-Up

After an answer:

```text
Ask a follow-up...

Examples:
Why was this change made?
Who approved it?
What SOP was updated?
```

Maintain conversation context.

---

# 26. Conversation History

Left side or separate history:

```text
Today

Billing deployment
10:42

Payment API ownership
09:31

Yesterday

Refund policy
17:22
```

Allow rename/archive/delete where appropriate.

---

# 27. Source Evidence

Every high-value answer should support:

```text
Sources
```

Each source:

```text
Source icon
Source name
Reference
Last updated
```

Example:

```text
Jira
BILL-902
Updated Aug 26
```

---

# 28. Source Receipt Drawer

Clicking a source opens a right drawer:

```text
SOURCE RECEIPT

Jira BILL-902

Issue
Billing deployment

Updated
Aug 26, 2026

Related
Billing Service
INC-902

Why this source was used

It contains the decision that introduced
the migration pre-check.

[ Open Source ]
```

---

# 29. Confidence UI

Use semantic confidence:

```text
High confidence
Moderate confidence
Low confidence
Conflicting
Insufficient evidence
```

Optional numerical score only if the system has a meaningful calibrated interpretation.

---

# 30. Insufficient Evidence

```text
Not enough reliable evidence.

I found related information, but the available
sources do not support a confident answer.

[ View Sources ]

Try:
"How is billing deployed today?"
```

---

# 31. Conflict Detection

```text
Conflicting information

Two sources describe different
billing deployment processes.

Source A
Aug 20
Merge → Deploy

Source B
Aug 26
Merge → Migration Check → Deploy

[ Compare ]
```

---

# 32. Permission-Limited Answer

```text
Some relevant company information
is restricted.

You don't have permission to view
the underlying content.

No restricted content was displayed.

[ Review Access ]
```

Never expose restricted source content.

---

# 33. KNOWLEDGE GRAPH

Route:

```text
/knowledge/graph
```

Purpose:

> Explore relationships between company entities.

---

# 34. Graph Layout

```text
┌────────────────────────────────────────────────────────┐
│ Knowledge Graph                         Search         │
├───────────────────────────────────────┬────────────────┤
│                                       │                │
│                                       │ Entity         │
│          ○                            │ Details        │
│        /   \                          │                │
│       ○─────●────○                    │ Billing        │
│        \    │     \                   │ Service        │
│         ○   ○      ○                  │                │
│                                       │ Relationships  │
│                                       │                │
└───────────────────────────────────────┴────────────────┘
```

---

# 35. Graph Controls

Provide:

```text
Zoom In
Zoom Out
Reset
Fit View
Search
Filters
Expand
Collapse
```

---

# 36. Graph Filters

Potential:

```text
People
Systems
Documents
Decisions
Incidents
Customers
SOPs
Skills
```

Allow multiple filters.

---

# 37. Graph Node Interaction

Hover:

```text
Node name
Type
```

Click:

```text
Select node
Open detail panel
Highlight relationships
```

---

# 38. Entity Detail Panel

Example:

```text
Billing Service

Application

Owner
Engineering Platform

Relationships

Payment API
INC-902
Billing SOP
PR #1287

Sources
12

[ Ask Brain ]
[ Open Entity ]
```

---

# 39. Graph Relationship Detail

Clicking a relationship:

```text
Billing Service
       ↓
affected by
       ↓
INC-902

Evidence
Jira BILL-902
Slack #engineering
```

This reinforces evidence-based relationships.

---

# 40. KNOWLEDGE LIBRARY

Route:

```text
/knowledge
```

Purpose:

> Browse the company's indexed knowledge.

---

# 41. Knowledge Library Layout

```text
Knowledge

Search knowledge...

Filters:
Type | Source | Owner | Freshness

────────────────────────────────────────

Billing Deployment SOP
SOP
Updated yesterday

Billing Architecture Decision
Decision
Updated 3 days ago

Payment API
Entity
Updated yesterday
```

---

# 42. Knowledge Filters

```text
Type
Source
Owner
Date
Freshness
Verified
Needs Review
```

---

# 43. Knowledge Item Detail

```text
Billing Deployment SOP

Type
SOP

Status
Current

Owner
Engineering Platform

Updated
Aug 26

Sources
Jira
GitHub
Slack

Related
Billing Service
INC-902
```

---

# 44. Knowledge Version History

```text
v3.2
Aug 26
Migration pre-check added

v3.1
Aug 18
Rollback instructions updated

v3.0
Aug 02
Deployment workflow changed
```

---

# 45. SEMANTIC DICTIONARY

Route:

```text
/knowledge/dictionary
```

Purpose:

> Manage controlled company terminology and definitions.

---

# 46. Dictionary List

```text
Semantic Dictionary

Search terms...

Term                 Owner          Version

Churn Risk            Customer       v3
Critical Incident     Engineering    v4
Active Customer       Sales          v2
```

---

# 47. Dictionary Detail

```text
Churn Risk

Definition

A customer is considered at churn risk when...

Owner
Customer Success

Version
3

Used by
7 Skills
12 Workflows

[ Edit ]
[ View History ]
```

---

# 48. Dictionary Governance

When editing:

```text
Definition
Owner
Scope
Examples
Exclusions
Version
```

Important definition changes should optionally require approval.

---

# 49. SOPs

Route:

```text
/knowledge/sops
```

Purpose:

> Manage current operational procedures.

---

# 50. SOP List

```text
SOPs

Billing Deployment
Current v3.2

Customer Refund
Current v4.1

Incident Escalation
Current v2.8
```

---

# 51. SOP Detail

```text
Billing Deployment

v3.2
Current

1. Merge
2. Migration pre-check
3. Deploy
4. Monitor

Recent change

Migration pre-check added.

Reason
INC-902

Evidence
Jira
GitHub
Slack

[ Edit ]
[ View History ]
```

---

# 52. SOP Change Review

```text
Review Change

Proposed change

Add migration pre-check before deployment.

Evidence
INC-902
BILL-902
PR #1287

Confidence
High

[ Reject ]
[ Approve ]
```

---

# 53. DECISIONS

Route:

```text
/knowledge/decisions
```

Purpose:

> Preserve important organizational decisions.

---

# 54. Decision List

```text
Decision

Use PostgreSQL for Billing Service

Decision owner
Platform Team

Date
Aug 12

Status
Current
```

---

# 55. Decision Detail

```text
Why PostgreSQL?

Decision
Use PostgreSQL for Billing Service.

Reason
Transactional consistency and existing
operational expertise.

Alternatives considered
MySQL
DynamoDB

Evidence
Architecture review
Slack discussion
Decision document

[ Open Sources ]
```

---

# 56. ENTITIES

Route:

```text
/knowledge/entities
```

Entity types:

```text
Person
Team
System
Application
Customer
Incident
Document
Decision
SOP
Skill
```

---

# 57. Entity List

```text
Entities

Search...

Billing Service
Application
Engineering

Priya Sharma
Person
Engineering

INC-902
Incident
Infrastructure
```

---

# 58. Entity Detail

```text
Billing Service

Application

Owner
Engineering Platform

Related

Payment API
Billing SOP
INC-902
PR #1287

Sources
12

[ Open Graph ]
[ Ask Brain ]
```

---

# 59. SKILLS

Route:

```text
/ai/skills
```

Purpose:

> Define reusable AI capabilities and structured instructions.

---

# 60. Skill List

```text
Skills

Customer Refund Handler
Active
v2.1

Incident Summarizer
Active
v1.4

Billing Deployment Assistant
Active
v3.0
```

---

# 61. Skill Detail

```text
Customer Refund Handler

Purpose
Handle customer refund requests.

Inputs
Customer ID
Order ID
Reason

Required Context
Refund Policy
Customer History
Active Incidents

Rules
3

Allowed Actions
2

Sources
7

Version
2.1
```

---

# 62. Skill Editor

Sections:

```text
Name
Purpose
Inputs
Required Context
Rules
Allowed Actions
Output Format
Sources
Permissions
Version
```

Do not make this a plain textarea-only editor.

Use structured fields.

---

# 63. AGENTS

Route:

```text
/ai/agents
```

Purpose:

> Manage AI agents that use CognitRAG context.

---

# 64. Agent List

```text
AI Agents

Customer Support Agent
● Active

Incident Assistant
● Active

Knowledge Analyst
○ Draft
```

---

# 65. Agent Card

```text
Customer Support Agent

● Active

Skills
Refund Handling
Customer Lookup

Context
Customers
Policies
Incidents

Last run
2 min ago

[ Open ]
```

---

# 66. Agent Detail

```text
Customer Support Agent

Status
Active

Purpose
Assist support with customer cases.

Skills
4

Knowledge Sources
12

Policies
3

Permissions
Support only

Recent Runs
...
```

---

# 67. Agent Permissions

Show clearly:

```text
Agent can access:

✓ Customer records
✓ Refund policies
✓ Support tickets

Cannot access:

× HR
× Finance
× Restricted engineering
```

---

# 68. AGENT PLAYGROUND

Route:

```text
/ai/playground
```

Purpose:

> Test an agent with visible context and execution information.

---

# 69. Playground Layout

```text
┌──────────────┬─────────────────────────┬───────────────┐
│ Agent        │ Conversation            │ Context       │
│              │                         │               │
│ Support      │ User                    │ Sources       │
│ Agent        │ Can this customer...    │ Policies      │
│              │                         │ Entities      │
│ Skills       │ Agent                   │ Skills        │
│              │ Based on...             │ Permissions   │
└──────────────┴─────────────────────────┴───────────────┘
```

---

# 70. Playground Execution

Show user-facing stages:

```text
Retrieving customer context...
Checking refund policy...
Evaluating active incidents...
Generating response...
```

Do not display private chain-of-thought.

---

# 71. Agent Execution Timeline

```text
Request
  ↓
Context retrieved
  ↓
Policy matched
  ↓
Skill selected
  ↓
Tool executed
  ↓
Response
```

Each stage can show latency and safe metadata.

---

# 72. MCP

Route:

```text
/ai/mcp
```

Purpose:

> Provide developer-facing access to CognitRAG context.

---

# 73. MCP Dashboard

```text
MCP

● Online

Connected Agents
3

Available Context

Knowledge
Rules
Skills
Entities

Usage
...

[ Developer Documentation ]
```

Never display secrets.

---

# 74. MCP Configuration

Potential:

```text
Server
Endpoint
Authentication
Available Context
Permissions
```

Use copy controls for non-secret configuration.

Secrets should be masked and rotatable.

---

# 75. INTEGRATIONS

Route:

```text
/integrations
```

Purpose:

> Connect external systems to the Company Brain.

---

# 76. Integration Categories

```text
Communication
Engineering
Knowledge
CRM
Support
```

---

# 77. Integration Cards

```text
Slack

Communication

✓ Connected

24,532 items
Last sync 2 min ago

[ Configure ]
```

---

# 78. Integration Setup Flow

```text
Select Source
      ↓
Authorize
      ↓
Choose Scope
      ↓
Review Permissions
      ↓
Connect
      ↓
Initial Sync
      ↓
Ready
```

---

# 79. Integration Permission Review

Before connection:

```text
Slack permissions

Read selected channels
✓

Access private channels
×

Read messages
✓

Read files
✓

[ Cancel ]
[ Connect ]
```

The actual scope must reflect the connector implementation.

---

# 80. Sync Status

States:

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

# 81. Integration Detail

```text
Slack

Status
Healthy

Channels
43 included
7 excluded

Items
24,532

Last sync
2 minutes ago

Permissions
...

[ Sync Now ]
[ Configure ]
[ Disconnect ]
```

---

# 82. ACTIVITY

Route:

```text
/activity
```

Purpose:

> Show important changes across the Company Brain.

---

# 83. Activity Timeline

```text
Today

09:42
New rule detected

09:18
Billing SOP updated

08:51
New relationship discovered

08:12
GitHub synchronized
```

---

# 84. Activity Filters

```text
Knowledge
Integrations
Security
Agents
Users
```

Date range:

```text
Today
7 days
30 days
Custom
```

---

# 85. Activity Detail

Click an event:

```text
Billing SOP updated

Changed by
Knowledge Review

Time
Aug 26, 09:18

Change
Migration pre-check added

Evidence
INC-902
BILL-902
PR #1287

[ View SOP ]
```

---

# 86. SECURITY

Route:

```text
/security
```

Purpose:

> Give administrators control and visibility over access.

---

# 87. Security Overview

```text
Security

Access Control        Healthy
Source Permissions    Healthy
Audit Logging         Healthy
Knowledge Policies    Healthy
```

Only display controls that actually exist.

---

# 88. ACCESS CONTROL

Route:

```text
/security/access
```

Users:

```text
Name
Role
Status
Last Active

Nitesh
Admin
Active

Priya
Member
Active
```

---

# 89. Roles

Example:

```text
Admin
Manager
Member
Viewer
```

Roles should be configurable according to the actual authorization model.

---

# 90. Permission Matrix

```text
                  Admin  Manager  Member  Viewer

Ask Brain           ✓       ✓       ✓       ✓
Knowledge           ✓       ✓       ✓       ✓
Edit SOP            ✓       ✓       ×       ×
Approve Rules       ✓       ✓       ×       ×
Integrations        ✓       ×       ×       ×
Security            ✓       ×       ×       ×
```

---

# 91. Source-Level Permissions

Example:

```text
Slack

Engineering
✓

Support
✓

HR
×

Finance
×
```

This should correspond to real source permissions and application-level authorization.

---

# 92. AUDIT LOG

Route:

```text
/security/audit
```

Table:

```text
Time
User
Action
Resource
Result

09:42
Admin
Updated role
Support
Success

09:18
Priya
Approved SOP change
Billing
Success
```

---

# 93. Audit Filters

```text
User
Action
Resource
Result
Date
```

Allow export only for authorized roles.

---

# 94. SETTINGS

Route:

```text
/settings
```

Sections:

```text
General
Profile
Workspace
Notifications
Appearance
Security
Developer
Billing
```

Only expose applicable settings.

---

# 95. General Settings

```text
Workspace Name
Workspace ID
Timezone
Default Language
```

---

# 96. Appearance

```text
Theme

○ Light
○ Dark
○ System

Density

○ Comfortable
○ Compact
```

---

# 97. Notifications

```text
Knowledge changes
✓

Security alerts
✓

Integration failures
✓

Agent failures
✓
```

---

# 98. Profile

```text
Name
Email
Role
Avatar
```

Profile data should come from the authentication/user system.

---

# 99. Onboarding

Route:

```text
/onboarding
```

Goal:

> Get the user to first value as quickly as possible.

---

# 100. Onboarding Flow

```text
Create / Join Workspace
        ↓
Connect First Source
        ↓
Choose Scope
        ↓
Initial Sync
        ↓
Ask First Question
        ↓
See Verified Answer
        ↓
Invite Team
```

Do not require users to configure every feature before experiencing value.

---

# 101. Onboarding Step 1

```text
Welcome to CognitRAG.

Let's build your Company Brain.

Workspace name
[ AcmeCloud ]

[ Continue ]
```

---

# 102. Onboarding Step 2

```text
Connect your first source.

[ Slack ]
[ GitHub ]
[ Jira ]
[ Documents ]

You can add more later.
```

---

# 103. Onboarding Step 3

```text
Choose what CognitRAG can access.

Included
43 channels

Excluded
7 channels

[ Continue ]
```

---

# 104. Onboarding Step 4

```text
Building your Company Brain

██████████████░░  84%

12,842 items indexed

You can explore once ready.
```

---

# 105. Onboarding Step 5

```text
Your Company Brain is ready.

Try asking:

"What changed this week?"

[ Ask Brain ]
```

---

# 106. First Answer Moment

The first successful answer should explicitly communicate:

```text
Your Brain found:

✓ Relevant company context
✓ Supporting sources
✓ Current information
```

This is the product's "aha moment."

---

# 107. Invite Team

After first value:

```text
Your Brain is ready.

Invite teammates who can benefit from it.

[ Invite Team ]
[ Do This Later ]
```

Do not block the user.

---

# 108. Global Error Pattern

Every important error should include:

```text
What happened
What was preserved
What to do next
```

Example:

```text
Sync failed.

Existing indexed knowledge is unchanged.

[ Retry ]
[ View Integration ]
```

---

# 109. Global Loading Pattern

Use:

```text
Skeleton
```

for content.

Use:

```text
Connecting...
Syncing...
Saving...
Generating...
```

for operations.

---

# 110. Global Empty State Pattern

```text
Nothing here yet.

Explanation.

[ Primary Action ]
```

Every empty state should provide a path forward.

---

# 111. Global Confirmation Pattern

Use confirmation for:

```text
Delete
Disconnect
Revoke
Approve
Publish
Remove
```

Example:

```text
Disconnect GitHub?

Future synchronization will stop.

Existing indexed knowledge remains until
you remove it separately.

[ Cancel ] [ Disconnect ]
```

---

# 112. Global Destructive Action Rules

Destructive buttons:

- use explicit wording
- appear after safe alternatives
- require confirmation when consequential
- never use ambiguous "Continue"

---

# 113. Mobile Navigation

Mobile bottom navigation can prioritize:

```text
Home
Ask
Knowledge
Agents
More
```

The full navigation lives inside:

```text
☰ Menu
```

---

# 114. Mobile Ask Brain

The mobile Ask Brain should be excellent.

```text
Ask your company anything.

┌───────────────────────────┐
│ Ask your company...    ↑  │
└───────────────────────────┘

Recent
Suggested
```

Answer:

```text
Billing deployment changed...

Sources
[Jira] [GitHub] [Slack]

High confidence
```

---

# 115. Mobile Graph

Do not reproduce the full desktop graph.

Use:

```text
Focused graph
+
search
+
entity drawer
```

Allow users to explore one relationship area at a time.

---

# 116. Mobile Tables

Dense tables should become:

```text
Stacked list cards
```

Example:

```text
Slack

Connected
Last sync 2 min ago
24,532 items

[ Configure ]
```

---

# 117. Responsive Rule

At every breakpoint:

```text
Preserve function
Reduce density
Maintain hierarchy
```

Do not simply shrink desktop components.

---

# 118. Keyboard Shortcuts

Initial:

```text
Ctrl/⌘ + K
Global search

/
Focus search

Esc
Close modal/drawer

?
Show shortcuts
```

Additional shortcuts can be introduced later.

---

# 119. Global Breadcrumbs

Use for deep pages:

```text
Knowledge
/
Entities
/
Billing Service
```

Do not show breadcrumbs on simple top-level pages unless useful.

---

# 120. Page Header Standard

Every major application page:

```text
Eyebrow / Breadcrumb
Title
Description
Primary Action
```

Example:

```text
KNOWLEDGE

Knowledge Graph

Explore relationships across your company.

[ Search Graph ]
```

---

# 121. Detail Page Standard

```text
Breadcrumb
Title
Type / Status
Metadata

Main content

Related
Sources
History
```

---

# 122. Information Hierarchy

For AI-generated information:

```text
ANSWER
↓
CONTEXT
↓
EVIDENCE
↓
FRESHNESS
↓
CONFIDENCE
↓
RELATED KNOWLEDGE
```

For operational objects:

```text
OBJECT
↓
CURRENT STATE
↓
OWNER
↓
RELATIONSHIPS
↓
SOURCES
↓
HISTORY
```

---

# 123. Core Product Components

The implementation should create reusable components:

```text
AppShell
Sidebar
Header
CommandPalette
PageHeader
SearchInput
Button
Card
Badge
Tabs
Drawer
Modal
Toast
Skeleton
EmptyState
ErrorState

AskBrain
Answer
SourceChip
SourceReceipt
ConfidenceBadge
SuggestedQuery

Graph
GraphNode
GraphControls
EntityPanel
RelationshipDetail

KnowledgeItem
DictionaryTerm
SOP
Decision
Skill

IntegrationCard
SyncProgress
PermissionReview

AgentCard
AgentExecution
Playground
MCPStatus

PermissionMatrix
AuditTable
ActivityTimeline
```

---

# 124. Data Loading Architecture

UI should support:

```text
Loading
Loaded
Empty
Partial
Error
Unauthorized
Stale
```

Do not assume every API request succeeds.

---

# 125. Streaming Architecture

For streaming Brain responses:

```text
POST /ask
        ↓
SSE stream
        ↓
UI progressively updates
```

The frontend should handle:

```text
connection start
tokens / events
completion
error
cancel
retry
```

---

# 126. Cancel Generation

Ask Brain should support:

```text
[ Stop ]
```

during a long response.

After stopping:

```text
Generation stopped.
```

---

# 127. Feedback

Allow:

```text
👍 Helpful
👎 Not helpful
```

Optional feedback reason:

```text
Incorrect
Outdated
Missing context
Wrong source
Other
```

Do not make feedback intrusive.

---

# 128. Source Citation Interaction

Source chips should be:

```text
Clickable
Keyboard accessible
Clearly typed
```

Hover:

```text
Source name
Updated
```

Click:

```text
Source Receipt
```

---

# 129. Save Answer

Optional:

```text
Save
```

Saved answers can later become:

```text
Knowledge notes
Team references
Pinned answers
```

Do not automatically turn every answer into permanent knowledge.

---

# 130. Share Answer

Share should preserve:

```text
Question
Answer
Evidence
Timestamp
```

Permissions must still apply.

Do not create a public link to restricted knowledge accidentally.

---

# 131. Knowledge Review Queue

Create a central review area for:

```text
New rules
Conflicts
Stale SOPs
Suggested updates
Unverified knowledge
```

This can eventually be:

```text
/knowledge/review
```

---

# 132. Review Queue UI

```text
Review Queue

12 items need attention

Refund exception rule
High confidence
[ Review ]

Billing SOP update
High confidence
[ Review ]

Conflicting deployment sources
Needs decision
[ Compare ]
```

---

# 133. Review Detail

```text
Suggested Knowledge Change

Change
Refund window may extend to 45 days
during verified outages.

Evidence
3 sources

Confidence
High

Impact
Support workflows

[ Reject ]
[ Approve ]
```

---

# 134. Governance Principle

CognitRAG should distinguish:

```text
Detected
Suggested
Reviewed
Approved
Published
Deprecated
```

Do not treat automatically detected knowledge as company policy.

---

# 135. Knowledge Lifecycle

```text
SOURCE
  ↓
INGESTED
  ↓
UNDERSTOOD
  ↓
RELATIONSHIPS
  ↓
CANDIDATE KNOWLEDGE
  ↓
REVIEW
  ↓
APPROVED
  ↓
ACTIVE
  ↓
UPDATED / DEPRECATED
```

---

# 136. AI Agent Lifecycle

```text
Draft
  ↓
Configured
  ↓
Tested
  ↓
Approved
  ↓
Active
  ↓
Paused
  ↓
Deprecated
```

The UI should reflect this lifecycle.

---

# 137. Integration Lifecycle

```text
Not Connected
  ↓
Authorization
  ↓
Connected
  ↓
Syncing
  ↓
Healthy
  ↓
Paused / Error
```

---

# 138. Permission Lifecycle

```text
Invited
  ↓
Active
  ↓
Role Changed
  ↓
Suspended
  ↓
Removed
```

Audit important transitions.

---

# 139. Product Navigation Principle

A user should always know:

```text
Where am I?
What am I looking at?
What can I do?
What changed?
```

---

# 140. Product Trust Principle

When CognitRAG answers something important, the UI should make it possible to understand:

```text
What did it answer?
Why?
Based on what?
Is the information current?
Am I allowed to see it?
```

---

# 141. Visual Consistency

All screens must inherit:

```text
04_DESIGN_SYSTEM.md
```

Do not independently invent:

```text
colors
radius
spacing
button styles
status styles
animations
```

for individual screens.

---

# 142. Marketing → Product Transition

The public website and product should feel continuous.

Marketing:

```text
Company Brain
```

Product:

```text
Company Brain Dashboard
```

Marketing:

```text
Ask your company anything.
```

Product:

```text
Ask Brain
```

Marketing:

```text
Relationships reveal context.
```

Product:

```text
Knowledge Graph
```

---

# 143. First-Time Product Experience

The user should not land on an empty dashboard with dozens of menus.

Recommended:

```text
Welcome
↓
Connect source
↓
Wait / sync
↓
Ask Brain
↓
First answer
↓
Explore graph
```

---

# 144. Returning User Experience

Returning user should immediately see:

```text
Recent changes
Pending reviews
Brain health
Ask Brain
```

The dashboard should feel alive.

---

# 145. Admin Experience

Admins need:

```text
Integrations
Users
Roles
Permissions
Security
Audit
Knowledge governance
```

Do not clutter ordinary employee views with admin-only controls.

---

# 146. Employee Experience

Employees primarily need:

```text
Ask Brain
Search
Knowledge
Graph
SOPs
Decisions
```

---

# 147. AI Developer Experience

Developers primarily need:

```text
Skills
Agents
Playground
MCP
API
Context
Execution
```

---

# 148. Navigation Role Awareness

The navigation can remain shared while highlighting role-relevant areas.

Example:

```text
Employee
Ask / Knowledge

Admin
Security / Integrations

Developer
Agents / Playground / MCP
```

---

# 149. MVP Application Screens

The first production MVP does NOT need every screen.

Priority:

```text
P0 — Must Have

Login / Workspace
Onboarding
Dashboard
Ask Brain
Source Evidence
Knowledge Graph
Integrations
Basic Settings
Security / Permissions
```

---

# 150. P1 Screens

After initial validation:

```text
Knowledge Library
Semantic Dictionary
SOPs
Decisions
Entities
Activity
Review Queue
Skills
```

---

# 151. P2 Screens

Later:

```text
Agents
Playground
MCP
Advanced Governance
Advanced Analytics
Advanced Evaluation
Enterprise Administration
```

---

# 152. MVP User Journey

```text
Landing Page
      ↓
Get Early Access / Sign Up
      ↓
Create Workspace
      ↓
Connect Slack / GitHub / Jira
      ↓
Initial Sync
      ↓
Ask Brain
      ↓
Receive Answer
      ↓
Open Sources
      ↓
Explore Graph
      ↓
Invite Team
```

---

# 153. MVP Success Moment

The first user should experience:

```text
Question
   ↓
Relevant answer
   ↓
Real company source
   ↓
Relationship/context
```

within the shortest practical time.

This is more important than exposing every advanced feature.

---

# 154. UX Anti-Patterns

Do not:

```text
❌ Force users through long setup
❌ Hide evidence
❌ Hide permissions
❌ Create fake confidence
❌ Show unsupported data
❌ Overuse cards
❌ Make every action a modal
❌ Make every screen a chat
❌ Put technical implementation details everywhere
❌ Expose private model reasoning
```

---

# 155. UX Quality Bar

A good CognitRAG screen should answer:

```text
What is this?
What can I do here?
What happened?
Why should I trust it?
What should I do next?
```

---

# 156. Definition of Done

The complete application UI is ready when:

```text
[ ] Application shell exists
[ ] Navigation is consistent
[ ] Ask Brain is polished
[ ] Evidence is visible
[ ] Confidence states exist
[ ] Graph is usable
[ ] Knowledge can be browsed
[ ] Integrations can be managed
[ ] Permissions are visible
[ ] Audit logs exist
[ ] Loading states exist
[ ] Error states exist
[ ] Empty states exist
[ ] Mobile works
[ ] Keyboard navigation works
[ ] Dark mode works
[ ] Responsive layouts work
[ ] Role-based visibility is defined
```

---

# 157. Canonical Product Architecture

The user-facing product can be understood as:

```text
                    COGNITRAG
                  COMPANY BRAIN
                        │
        ┌───────────────┼────────────────┐
        │               │                │
       ASK           EXPLORE           MANAGE
        │               │                │
    Ask Brain       Knowledge        SOPs
    Answers         Graph            Decisions
    Evidence        Entities          Dictionary
                    Sources           Skills
        │               │                │
        └───────────────┼────────────────┘
                        │
                    AUTOMATE
                        │
                  Agents / MCP
                        │
                    CONTROL
                        │
             Permissions / Security
                 / Audit / Governance
```

---

# 158. Final Product Principle

CognitRAG should feel like:

> **A living interface to what a company knows—not simply a place to ask an AI questions.**

The product's visual and interaction hierarchy should therefore consistently reinforce:

```text
KNOWLEDGE
   ↓
CONTEXT
   ↓
EVIDENCE
   ↓
TRUST
   ↓
ACTION
```

---

# 159. Final UX Statement

> **The best CognitRAG experience is one where a user can ask a question in seconds, understand the answer immediately, inspect the evidence when needed, explore the relationships behind it, and safely turn company knowledge into reusable workflows and AI-agent context.**
