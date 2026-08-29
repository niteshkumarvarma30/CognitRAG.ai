# 06 — CognitRAG User Flows & Interaction Specification
## End-to-End UX Workflows for the Company Brain

> **Status:** Master interaction and user-flow specification.
>
> **Design foundation:** `04_DESIGN_SYSTEM.md`
>
> **UI foundation:** `05_COMPLETE_UI_UX_SPECIFICATION.md`
>
> **Purpose:** Define what happens before, during, and after each major user action so frontend and backend implementation can produce one consistent product experience.

---

# 1. Purpose

This document converts the CognitRAG UI specification into executable user journeys.

It answers:

```text
What does the user do?
        ↓
What does the interface show?
        ↓
What system action occurs?
        ↓
What happens if it succeeds?
        ↓
What happens if it fails?
        ↓
What can the user do next?
```

The product should always make the next meaningful action obvious.

---

# 2. Core UX Loop

The fundamental CognitRAG loop is:

```text
CONNECT
   ↓
INGEST
   ↓
UNDERSTAND
   ↓
CONNECT RELATIONSHIPS
   ↓
ASK
   ↓
RETRIEVE
   ↓
VERIFY
   ↓
ANSWER
   ↓
EXPLORE
   ↓
REUSE
```

For governance:

```text
DETECT
   ↓
SUGGEST
   ↓
REVIEW
   ↓
APPROVE
   ↓
PUBLISH
   ↓
UPDATE
```

For agents:

```text
REQUEST
   ↓
CONTEXT
   ↓
POLICY
   ↓
SKILL
   ↓
TOOL
   ↓
ACTION
   ↓
RESULT
```

---

# 3. Flow Notation

This document uses:

```text
USER
User action

UI
Visible interface response

SYSTEM
Backend / platform behavior

DECISION
Conditional branch

SUCCESS
Successful result

ERROR
Failure state
```

---

# 4. First-Time Visitor Flow

```text
Landing Page
     ↓
Understand Company Brain
     ↓
See Product Demo
     ↓
Trust / Security
     ↓
Get Early Access
```

Primary objective:

> Move a qualified visitor from understanding to signup/demo.

---

# 5. Early Access Flow

## User

Clicks:

```text
Get Early Access
```

## UI

Show concise form:

```text
Name
Work Email
Company
Role
Company Size
What are you trying to solve?
```

## User

Submits form.

## SYSTEM

```text
Validate
↓
Create lead / signup record
↓
Send confirmation
```

## SUCCESS

```text
You're on the list.

We'll be in touch soon.

[ Return Home ]
```

## ERROR

```text
We couldn't submit your request.

Please try again.

[ Retry ]
```

---

# 6. Sign-Up Flow

```text
Landing
 ↓
Sign Up
 ↓
Authentication
 ↓
Create Workspace
 ↓
Onboarding
```

Authentication options depend on the implemented identity provider.

---

# 7. Workspace Creation

## UI

```text
Create your workspace

Company name
[ AcmeCloud ]

Workspace URL
[ acmecloud ]

[ Continue ]
```

## SYSTEM

Validate:

```text
Company name
Workspace identifier
Current user's authorization
```

## SUCCESS

Create workspace and make user administrator/owner according to the actual auth model.

---

# 8. Onboarding Flow

Canonical sequence:

```text
Welcome
 ↓
Connect Source
 ↓
Choose Scope
 ↓
Authorize
 ↓
Initial Sync
 ↓
First Question
 ↓
First Answer
 ↓
Explore
 ↓
Invite Team
```

The user must be able to skip nonessential steps.

---

# 9. Connect First Source

## UI

```text
Connect your first source.

Slack
GitHub
Jira
Documents

[ Continue ]
```

## USER

Selects source.

## SYSTEM

Open source-specific authorization flow.

---

# 10. Source Authorization

Example:

```text
Connect Slack

CognitRAG requests access to:

✓ Selected channels
✓ Messages
✓ Files

Private channels
Not requested

[ Cancel ]
[ Authorize ]
```

The actual permissions must match the real connector.

---

# 11. Scope Selection

After authorization:

```text
Choose what CognitRAG can access.

Included
43 channels

Excluded
7 channels

[ Continue ]
```

The user should understand scope before indexing begins.

---

# 12. Initial Sync

## UI

```text
Building your Company Brain

██████████████░░ 84%

12,842 items processed

Current step
Understanding relationships
```

Potential stages:

```text
Fetching
Parsing
Indexing
Extracting entities
Building relationships
Finalizing
```

Only show stages that correspond to actual implementation.

---

# 13. Sync Completion

## SUCCESS

```text
Your Company Brain is ready.

We've connected Slack and indexed
your first set of company knowledge.

[ Ask Brain ]
[ Explore Graph ]
```

This is the first-value transition.

---

# 14. Sync Failure

```text
We couldn't complete the sync.

Your existing knowledge is unchanged.

[ Retry ]
[ View Integration ]
```

Never silently discard partial progress.

---

# 15. Ask Brain — Basic Flow

```text
User opens Ask Brain
       ↓
Types question
       ↓
Submits
       ↓
UI enters processing
       ↓
Backend retrieves permitted context
       ↓
Answer streams
       ↓
Evidence appears
       ↓
Confidence/status appears
       ↓
User can inspect / follow up
```

---

# 16. Ask Brain Input

## User

Types:

```text
What changed in billing this week?
```

## UI

Enable submit.

Show:

```text
↑
```

or equivalent submit control.

---

# 17. Ask Brain Validation

Before request:

```text
Empty?
Too long?
Invalid?
```

If empty:

```text
Enter a question first.
```

Do not send an empty request.

---

# 18. Ask Brain Processing

Immediately show:

```text
Retrieving company context...
```

Then, if supported:

```text
Synthesizing answer...
```

Do not expose internal chain-of-thought.

---

# 19. Ask Brain Retrieval

SYSTEM:

```text
User question
      ↓
Identity
      ↓
Permissions
      ↓
Retrieval
      ↓
Relevant sources
      ↓
Relevant entities
      ↓
Relevant relationships
```

The UI can show a concise status, not hidden reasoning.

---

# 20. Answer Streaming

As answer content arrives:

```text
Answer text streams
        ↓
Evidence appears
        ↓
Confidence/status appears
```

The interface should not jump around as content grows.

Reserve space where practical.

---

# 21. Successful Answer

Example:

```text
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

# 22. Answer Completion

After streaming:

Enable:

```text
Copy
Share
Save
Ask Follow-up
Open Sources
Feedback
```

---

# 23. Source Inspection Flow

```text
Answer
 ↓
User clicks source
 ↓
Source Receipt opens
 ↓
User reviews metadata/context
 ↓
User optionally opens original source
```

---

# 24. Source Receipt

Show:

```text
Source
Reference
Type
Updated
Related entities
Why it was relevant
```

Never expose source content the user is not authorized to access.

---

# 25. Open Original Source

## User

Clicks:

```text
Open Source
```

## SYSTEM

Check authorization.

## SUCCESS

Open external/source application or supported internal representation.

## ERROR

```text
This source is no longer available.

The evidence reference is preserved.

[ Close ]
```

---

# 26. Follow-Up Question

After answer:

```text
Why was this change made?
```

The system retains permitted conversation context.

Flow:

```text
Previous answer
      +
Follow-up
      ↓
New retrieval
      ↓
New answer
```

Do not assume the previous answer itself is always sufficient context.

---

# 27. New Conversation

User selects:

```text
New Chat
```

UI resets:

```text
Question input
Conversation
Suggested questions
```

Previous conversation remains in history if history is enabled.

---

# 28. Conversation History

User selects previous conversation.

Flow:

```text
History
 ↓
Conversation
 ↓
Load previous messages
 ↓
Continue
```

Permission checks still apply to current retrieval.

---

# 29. Rename Conversation

Optional:

```text
Rename
```

User changes:

```text
Billing deployment discussion
```

Save.

---

# 30. Delete Conversation

```text
Delete conversation?

This removes the conversation from your workspace history.

[ Cancel ]
[ Delete ]
```

Do not imply that deletion removes underlying source data unless it actually does.

---

# 31. Answer Feedback

User clicks:

```text
Not helpful
```

Show optional reasons:

```text
Incorrect
Outdated
Missing context
Wrong source
Other
```

Submit.

Show:

```text
Thanks for the feedback.
```

Do not interrupt the workflow unnecessarily.

---

# 32. Insufficient Evidence Flow

```text
Question
 ↓
Retrieval
 ↓
Evidence insufficient
 ↓
Do NOT fabricate
 ↓
Explain limitation
 ↓
Suggest useful next step
```

UI:

```text
Not enough reliable evidence.

The available sources don't support a confident answer.

[ View Sources ]

Try asking:
"How is billing deployed today?"
```

---

# 33. Conflicting Evidence Flow

```text
Question
 ↓
Multiple contradictory sources
 ↓
Detect conflict
 ↓
Answer with conflict
 ↓
Show sources
 ↓
Offer comparison
```

UI:

```text
I found conflicting information.

Source A
Aug 20
Merge → Deploy

Source B
Aug 26
Merge → Migration Check → Deploy

[ Compare Sources ]
```

---

# 34. Permission-Limited Retrieval

```text
User question
 ↓
Candidate knowledge
 ↓
Permission filtering
 ↓
Unauthorized content removed
 ↓
Answer generated from allowed context
```

If allowed evidence is insufficient:

```text
Some relevant company information is restricted.

No restricted content was displayed.
```

Never reveal:

```text
restricted document title
private content
private source snippets
restricted entity metadata
```

unless the authorization model explicitly permits it.

---

# 35. Search Flow

```text
Ctrl/⌘ K
 ↓
Command palette
 ↓
Search term
 ↓
Results
 ↓
Select result
```

Search categories:

```text
Knowledge
Entities
People
Decisions
SOPs
Skills
Sources
```

---

# 36. Search-to-Ask Flow

If the user enters a natural-language question:

```text
Search
 ↓
Recognize question intent
 ↓
Offer:

Ask Brain
```

Example:

```text
"What changed in billing?"

Ask Brain
Search exact text
```

This prevents search and AI answering from becoming confusingly merged.

---

# 37. Knowledge Graph Flow

```text
Open Graph
 ↓
Graph loads
 ↓
User searches/filter
 ↓
Nodes displayed
 ↓
User selects entity
 ↓
Entity panel opens
 ↓
Relationships highlighted
```

---

# 38. Graph Search

User enters:

```text
Billing Service
```

Graph:

```text
Billing Service
      ↓
related nodes
```

Center the selected entity.

---

# 39. Graph Filter

User selects:

```text
Incidents
Decisions
SOPs
```

UI updates visible graph relationships.

Filters should not destroy the user's understanding of the selected entity.

---

# 40. Graph Node Selection

User clicks:

```text
Billing Service
```

System:

```text
Select node
 ↓
Highlight relationships
 ↓
Open detail panel
```

---

# 41. Graph Entity Flow

From entity panel:

```text
Entity
 ↓
Relationships
 ↓
Source evidence
 ↓
Ask Brain
```

User can jump from graph exploration into a question.

---

# 42. Graph → Ask Brain

Example:

```text
Billing Service selected

[ Ask Brain ]

```

Automatically seed a contextual prompt such as:

```text
What are the recent changes related to Billing Service?
```

The user can edit before submitting.

---

# 43. Knowledge Library Flow

```text
Open Knowledge
 ↓
Search/filter
 ↓
Select knowledge item
 ↓
Open detail
 ↓
View source / relationships / history
```

---

# 44. Knowledge Filtering

User can combine:

```text
Type
Source
Owner
Freshness
Status
```

Example:

```text
Type = SOP
Status = Needs Review
```

---

# 45. SOP Review Flow

```text
SOP changes detected
 ↓
Review Queue
 ↓
User opens change
 ↓
Evidence shown
 ↓
User reviews
 ↓
Reject / Approve
```

---

# 46. SOP Approval

User clicks:

```text
Approve
```

Show confirmation if consequential:

```text
Approve this SOP change?

This will make the proposed version current.

[ Cancel ]
[ Approve ]
```

SYSTEM:

```text
Validate authorization
 ↓
Persist approval
 ↓
Create audit event
 ↓
Publish current version
```

---

# 47. SOP Rejection

User clicks:

```text
Reject
```

Optionally request reason:

```text
Why is this change being rejected?
```

SYSTEM records decision.

---

# 48. SOP Version History

```text
Current v3.2
 ↓
History
 ↓
Select v3.1
 ↓
Compare
```

Comparison:

```text
Removed
Added
Changed
```

---

# 49. Semantic Dictionary Flow

```text
Dictionary
 ↓
Search term
 ↓
Open definition
 ↓
Review usage
 ↓
Edit
 ↓
Save / Review
```

---

# 50. Dictionary Edit

User changes:

```text
Definition
Owner
Examples
Exclusions
Scope
```

Before saving:

```text
Current
vs
Proposed
```

---

# 51. Definition Governance

If approval is required:

```text
Edit
 ↓
Save Draft
 ↓
Review
 ↓
Approve
 ↓
Publish
```

Do not silently change authoritative definitions without the required governance.

---

# 52. Decision Capture Flow

```text
Decision detected
 ↓
Suggested Decision
 ↓
Review evidence
 ↓
Add owner/reason
 ↓
Approve
 ↓
Decision becomes reusable knowledge
```

---

# 53. Decision Detail

User should be able to see:

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

# 54. Entity Creation

If manual entity creation is supported:

```text
Create Entity
 ↓
Choose type
 ↓
Enter name
 ↓
Add metadata
 ↓
Save
```

Example:

```text
Type
System

Name
Billing Service

Owner
Engineering Platform
```

---

# 55. Entity Merge

If duplicate detection is supported:

```text
Possible duplicates

Billing API
Billing Service

[ Compare ]
```

User can:

```text
Merge
Keep Separate
Dismiss
```

Never automatically merge high-impact entities without a safe mechanism.

---

# 56. Integration Connection Flow

```text
Integrations
 ↓
Select integration
 ↓
Connect
 ↓
Authorize
 ↓
Choose scope
 ↓
Review permissions
 ↓
Confirm
 ↓
Initial sync
```

---

# 57. Integration Disconnect Flow

```text
Configure
 ↓
Disconnect
 ↓
Confirmation
 ↓
Authorization check
 ↓
Disconnect
 ↓
Audit event
```

Confirmation:

```text
Disconnect GitHub?

Synchronization will stop.

Existing indexed knowledge will remain
until separately removed.

[ Cancel ]
[ Disconnect ]
```

---

# 58. Integration Sync Now

User:

```text
Sync Now
```

UI:

```text
Starting synchronization...
```

Then:

```text
Syncing
```

Then:

```text
Complete
```

or:

```text
Partial
```

or:

```text
Failed
```

---

# 59. Partial Sync

If supported:

```text
Sync completed with warnings.

24,120 items processed
412 items failed

[ View Details ]
```

Do not label a partial sync as fully healthy.

---

# 60. Integration Authorization Expired

```text
GitHub authorization expired.

CognitRAG cannot access new data.

Existing indexed knowledge is unchanged.

[ Reconnect ]
```

---

# 61. Activity Flow

```text
Activity
 ↓
Filter
 ↓
Select event
 ↓
Open detail
 ↓
Navigate to related object
```

---

# 62. Activity → Object

Example:

```text
Billing SOP updated
```

Click:

```text
View SOP
```

Navigate to:

```text
Knowledge → SOP → Billing Deployment
```

---

# 63. Review Queue Flow

```text
New candidate change
 ↓
Review Queue
 ↓
Open item
 ↓
Inspect evidence
 ↓
Compare
 ↓
Approve / Reject
```

---

# 64. Review Queue Priority

Prioritize:

```text
High impact
High confidence
Recently changed
Conflicting
Security-sensitive
```

The exact ranking should come from backend policy.

---

# 65. AI Skill Creation

```text
Skills
 ↓
Create Skill
 ↓
Name
 ↓
Purpose
 ↓
Inputs
 ↓
Context
 ↓
Rules
 ↓
Actions
 ↓
Output
 ↓
Save Draft
```

---

# 66. Skill Validation

Before activation:

```text
Required fields complete?
Context available?
Permissions valid?
Referenced rules exist?
Referenced sources available?
```

If invalid:

```text
This skill cannot be activated yet.

Missing:
Required Context
Allowed Action
```

---

# 67. Skill Lifecycle

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
```

---

# 68. Agent Creation

```text
Agents
 ↓
Create Agent
 ↓
Purpose
 ↓
Select Skills
 ↓
Select Knowledge
 ↓
Set Permissions
 ↓
Configure Tools
 ↓
Save Draft
```

---

# 69. Agent Permission Review

Before activation:

```text
This agent can access:

✓ Support tickets
✓ Customer policies
✓ Customer history

Cannot access:

× HR
× Finance
```

User must explicitly understand access.

---

# 70. Agent Test Flow

```text
Draft Agent
 ↓
Playground
 ↓
Test request
 ↓
Retrieve context
 ↓
Evaluate policy
 ↓
Run skill
 ↓
Tool/action
 ↓
Response
```

---

# 71. Agent Failure

```text
Agent could not complete the task.

Reason:
Required permission was unavailable.

[ Review Permissions ]
```

Do not silently fall back to unauthorized context.

---

# 72. Agent Pause

```text
Pause Agent?

New executions will stop.

Existing executions may continue or terminate
according to the configured runtime policy.

[ Cancel ]
[ Pause ]
```

The exact runtime behavior must match implementation.

---

# 73. MCP Connection Flow

```text
MCP
 ↓
Create / configure connection
 ↓
Set permissions
 ↓
Generate credentials if supported
 ↓
Connect client
 ↓
Test
```

Secrets must never be shown in plaintext after initial secure creation unless the implementation explicitly supports safe retrieval.

---

# 74. MCP Test

```text
Connection
● Online

Test context request

[ Run Test ]

Result
Context returned successfully.
```

---

# 75. User Invitation Flow

```text
Security
 ↓
Invite User
 ↓
Email
 ↓
Role
 ↓
Send
```

Example:

```text
Email
priya@acme.com

Role
Member

[ Send Invite ]
```

---

# 76. Invitation State

```text
Pending
```

Actions:

```text
Resend
Revoke
```

---

# 77. Role Change Flow

```text
User
 ↓
Change Role
 ↓
Select role
 ↓
Review impact
 ↓
Confirm
 ↓
Audit event
```

For high-impact changes:

```text
Changing this role will grant access to
restricted knowledge.

[ Cancel ]
[ Confirm ]
```

---

# 78. User Suspension

```text
Suspend user?

They will no longer be able to access
this workspace.

[ Cancel ]
[ Suspend ]
```

---

# 79. Audit Flow

Every important administrative event should create an audit record:

```text
Actor
Action
Resource
Timestamp
Result
```

Examples:

```text
Role changed
Integration connected
SOP approved
Agent activated
Permission revoked
```

---

# 80. Security Investigation Flow

```text
Security
 ↓
Audit Logs
 ↓
Filter actor/resource/action
 ↓
Open event
 ↓
Inspect context
```

---

# 81. Notification Flow

When an important event occurs:

```text
Event
 ↓
Notification policy
 ↓
Create notification
 ↓
User sees notification
 ↓
Click
 ↓
Relevant object
```

---

# 82. Notification Examples

```text
SOP needs review
→ Open Review Queue

GitHub authorization expired
→ Open Integration

Agent failed repeatedly
→ Open Agent

Role changed
→ Open Security
```

---

# 83. Dashboard Action Flow

Dashboard should act as a command center.

Examples:

```text
Pending review
→ Review Queue

Integration unhealthy
→ Integration Detail

Recent knowledge change
→ Knowledge Detail

Ask Brain
→ Ask page
```

---

# 84. Global Search → Entity

```text
Search
 ↓
Billing Service
 ↓
Entity detail
 ↓
Graph
 ↓
Sources
```

---

# 85. Global Search → SOP

```text
Search
 ↓
Billing Deployment SOP
 ↓
SOP detail
 ↓
History
 ↓
Sources
```

---

# 86. Global Search → Ask Brain

```text
Search question
 ↓
Ask Brain
 ↓
Answer
```

---

# 87. Deep-Linking Principle

Every important object should have a stable URL.

Examples:

```text
/knowledge/entities/billing-service
/knowledge/sops/billing-deployment
/knowledge/decisions/postgresql-billing
/ai/agents/customer-support
/integrations/slack
```

This enables sharing and navigation.

---

# 88. Share Flow

User:

```text
Share Answer
```

Possible:

```text
Copy link
```

The shared representation must enforce current permissions.

---

# 89. Unauthorized Deep Link

User opens an object without access:

```text
You don't have access to this resource.

If you think you should have access,
contact your workspace administrator.
```

Do not reveal hidden object details.

---

# 90. Session Expiration

If authentication expires:

```text
Your session has expired.

[ Sign In Again ]
```

Preserve safe unsent user input where practical.

---

# 91. Network Failure

If a request fails due to connectivity:

```text
Connection lost.

We'll retry when possible.

[ Retry ]
```

Do not automatically retry destructive actions.

---

# 92. API Error

Translate backend errors into user-facing language.

Avoid:

```text
500 Internal Server Error
```

Prefer:

```text
We couldn't load this knowledge item.

[ Retry ]
```

Log technical details separately.

---

# 93. Rate Limit

```text
You're sending requests too quickly.

Please wait a moment and try again.
```

If retry timing is known, show it.

---

# 94. Long-Running Operations

For indexing or bulk operations:

```text
Started
Running
Progress
Completed
Failed
Cancelled
```

Users should be able to leave the page without losing the operation.

---

# 95. Cancellation

For cancellable operations:

```text
[ Cancel ]
```

Then:

```text
Cancel this operation?

[ Keep Running ]
[ Cancel ]
```

---

# 96. Autosave

For drafts such as:

```text
Skills
Agents
SOP edits
Dictionary definitions
```

If autosave exists:

```text
Saved
Saving...
Unsaved changes
```

Never imply autosave if it does not exist.

---

# 97. Unsaved Changes

When leaving:

```text
You have unsaved changes.

[ Stay ]
[ Leave Without Saving ]
```

---

# 98. Optimistic UI

Use optimistic updates only for low-risk operations.

Good:

```text
Toggle preference
Dismiss notification
```

Avoid optimistic updates for:

```text
Permission changes
Approvals
Deletion
Security changes
Publishing knowledge
```

---

# 99. Destructive Actions

General sequence:

```text
User clicks destructive action
 ↓
Explain consequence
 ↓
Confirm
 ↓
Authorization
 ↓
Execute
 ↓
Audit
 ↓
Feedback
```

---

# 100. Knowledge Publishing

```text
Candidate
 ↓
Review
 ↓
Approve
 ↓
Permission check
 ↓
Publish
 ↓
Version created
 ↓
Audit event
```

---

# 101. Knowledge Deprecation

```text
Open active knowledge
 ↓
Deprecate
 ↓
Explain consequence
 ↓
Confirm
 ↓
Set deprecated status
 ↓
Audit
```

Do not delete historical evidence merely because knowledge is deprecated.

---

# 102. Source Removal

If supported:

```text
Remove source data
```

Clearly distinguish:

```text
Disconnect source
```

from:

```text
Delete indexed source data
```

These are not necessarily the same operation.

---

# 103. Data Deletion Confirmation

```text
Delete indexed data from GitHub?

This cannot be undone.

Connected GitHub authorization will remain active.

[ Cancel ]
[ Delete Data ]
```

Exact wording must match implementation.

---

# 104. Workspace Deletion

High-risk flow:

```text
Settings
 ↓
Workspace
 ↓
Delete Workspace
 ↓
Explain consequences
 ↓
Require explicit confirmation
 ↓
Authentication / re-authentication if required
 ↓
Delete
```

Do not make this easy to trigger accidentally.

---

# 105. Billing Flow

If billing is implemented:

```text
Settings
 ↓
Billing
 ↓
Plan
 ↓
Usage
 ↓
Invoices
```

Do not expose billing screens in MVP if billing infrastructure does not yet exist.

---

# 106. Upgrade Flow

Future:

```text
Usage limit
 ↓
Upgrade prompt
 ↓
Compare plan
 ↓
Confirm
 ↓
Payment
 ↓
Plan active
```

The product should never hide essential knowledge behind an unexpected upgrade prompt.

---

# 107. First-Value Optimization

The UX should minimize time from:

```text
Signup
```

to:

```text
First trusted answer
```

The product should optimize this path aggressively.

---

# 108. Core Activation Metric

A strong activation event can be:

```text
User connects a source
+
User asks a question
+
User receives an evidence-backed answer
```

This is more meaningful than:

```text
Account created
```

---

# 109. Product Engagement Loop

After activation:

```text
Ask
 ↓
Discover
 ↓
Verify
 ↓
Explore
 ↓
Save / reuse
 ↓
Invite team
 ↓
Connect more sources
 ↓
More useful Brain
 ↓
More questions
```

---

# 110. Knowledge Improvement Loop

```text
Use Brain
 ↓
Detect missing / outdated / conflicting knowledge
 ↓
Review
 ↓
Improve
 ↓
Brain becomes more useful
```

---

# 111. Agent Improvement Loop

```text
Run Agent
 ↓
Observe execution
 ↓
Identify missing context
 ↓
Update Skill / Rule / Knowledge
 ↓
Test
 ↓
Deploy
```

---

# 112. Cross-Feature Navigation

Important connections:

```text
Ask Answer
 → Sources
 → Entity
 → Graph
 → SOP
 → Decision

Graph Entity
 → Ask Brain
 → Sources
 → Knowledge

SOP
 → Evidence
 → Decisions
 → Related Entities

Agent
 → Skills
 → Knowledge
 → Permissions
 → Execution
```

The product should feel like one connected system.

---

# 113. Context Preservation

When navigating:

```text
Graph → Entity → Source
```

the user should be able to return without losing their graph selection.

Likewise:

```text
Ask Brain → Source Receipt → Back
```

should preserve the conversation state.

---

# 114. Drawer vs Full Page

Use a drawer for:

```text
Quick entity inspection
Source receipt
Activity details
Small configuration
```

Use a full page for:

```text
Complex editing
Graph exploration
Agent configuration
Security administration
Integration setup
```

---

# 115. Modal vs Page

Use modal for:

```text
Confirmation
Small form
Quick action
```

Use page for:

```text
Multi-step setup
Complex forms
Large content
```

Avoid nested modals.

---

# 116. Notification vs Toast

Use toast for:

```text
Saved
Copied
Connected
```

Use notification center for:

```text
Review required
Authorization expired
Security change
Agent issue
```

---

# 117. Empty Workspace Flow

```text
Dashboard
 ↓
No sources
 ↓
Connect source CTA
 ↓
Connection
 ↓
Sync
 ↓
First question
```

Do not show meaningless analytics before there is enough data.

---

# 118. Partially Configured Workspace

If only one source is connected:

```text
Your Brain is connected to Slack.

Connect more sources to increase context.

[ Add GitHub ]
[ Add Jira ]
```

Do not imply the Brain has universal company knowledge.

---

# 119. Stale Knowledge Flow

If knowledge becomes stale:

```text
User asks question
 ↓
Retrieval identifies stale source
 ↓
Answer qualifies freshness
 ↓
Show source date
 ↓
Suggest refresh / review if applicable
```

---

# 120. Stale Status

Example:

```text
This information may be outdated.

Last updated
14 days ago
```

Use amber only when the condition warrants attention.

---

# 121. Agent Context Missing

```text
The agent couldn't find enough company context
to safely complete this task.

Missing:
Refund Policy

[ Connect Knowledge ]
[ Stop ]
```

Do not encourage agents to guess.

---

# 122. Tool Permission Missing

```text
The agent has the required context but
does not have permission to perform this action.

[ Review Permissions ]
```

---

# 123. Tool Failure

```text
The requested action could not be completed.

Tool
Customer CRM

Status
Unavailable

[ Retry ]
[ View Agent Run ]
```

---

# 124. Agent Safe Failure

If an action cannot be safely completed:

```text
I couldn't complete this action safely.

No external change was made.
```

Only use this wording when the system can guarantee that no action occurred.

---

# 125. Human Approval Flow

For actions requiring approval:

```text
Agent proposes action
 ↓
Human review
 ↓
Show context + proposed action
 ↓
Approve / Reject
 ↓
Execute if approved
 ↓
Record result
```

---

# 126. Approval UI

```text
Agent wants to:

Update customer status → At Risk

Reason:
Customer reported repeated failures.

Context:
3 support tickets
1 active incident

[ Reject ]
[ Approve ]
```

---

# 127. Agent Audit

Every consequential agent execution should be traceable to:

```text
Agent
User/request
Time
Context references
Skill
Tool
Result
Approval if applicable
```

---

# 128. Security UX Rule

Permissions should be understandable before the user depends on the system.

Users should not discover permissions only after an unexpected denial.

---

# 129. Permission Preview

When connecting a source or activating an agent:

```text
What will this access?

✓ Billing documents
✓ Engineering incidents

× HR documents
× Finance documents
```

---

# 130. Privacy UX

When appropriate, explain:

```text
What is indexed?
Who can access it?
How is it used?
How can it be removed?
```

Keep explanations concise and link to detailed documentation.

---

# 131. Admin vs Employee Flow

Employee:

```text
Ask
 ↓
Answer
 ↓
Evidence
 ↓
Knowledge
```

Admin:

```text
Security
 ↓
Access
 ↓
Permissions
 ↓
Audit
```

Developer:

```text
Agents
 ↓
Skills
 ↓
Playground
 ↓
MCP
```

---

# 132. Role-Based UI

Do not merely hide buttons visually.

The backend must enforce authorization.

UI visibility is:

```text
UX convenience
```

Backend authorization is:

```text
Security boundary
```

---

# 133. Permission Denied UX

```text
You don't have permission to perform this action.

Required role:
Administrator

[ Close ]
```

Do not reveal unnecessary authorization internals.

---

# 134. Search Permission Handling

Search results must be filtered according to access.

Do not show:

```text
Restricted result title
```

unless the policy permits metadata visibility.

---

# 135. Graph Permission Handling

Graph should not expose restricted relationships.

The graph must reflect the user's permitted knowledge view.

---

# 136. Activity Permission Handling

Users should only see activity records they are authorized to see.

Administrative activity can be restricted.

---

# 137. Audit Permission Handling

Audit logs should be visible only to authorized roles.

---

# 138. UX Telemetry

Measure meaningful product behavior:

```text
Time to first answer
Answer completion rate
Source inspection rate
Follow-up rate
Knowledge review rate
Integration activation
Agent test success
```

Do not collect sensitive content unnecessarily.

---

# 139. Funnel Events

Suggested events:

```text
landing_cta_clicked
signup_started
workspace_created
source_selected
source_connected
sync_started
sync_completed
first_question
first_answer
source_opened
graph_opened
knowledge_reviewed
agent_created
agent_tested
team_invited
```

---

# 140. UX Performance Targets

The exact technical targets belong in engineering requirements, but UX should prioritize:

```text
Fast initial page
Fast input response
Streaming answers
Visible progress
No unexplained waiting
```

For long-running operations, communicate progress rather than leaving users staring at a spinner.

---

# 141. Accessibility Flow

Every primary workflow must support:

```text
Keyboard
Screen reader
Focus management
Visible focus
Reduced motion
Accessible status
```

---

# 142. Keyboard Navigation

Example:

```text
Tab
Move controls

Enter
Activate

Esc
Close

Ctrl/⌘ K
Search

/
Search
```

---

# 143. Focus Management

When opening:

```text
Modal
```

focus should move appropriately.

When closing:

```text
Return focus to triggering element.
```

---

# 144. Reduced Motion

When reduced motion is enabled:

```text
Graph animation → disabled
Large transitions → reduced
Loading → static indicators
```

The information hierarchy remains intact.

---

# 145. Responsive Flow

Desktop:

```text
Sidebar
+
Main content
+
Optional detail panel
```

Tablet:

```text
Collapsed navigation
+
Main content
```

Mobile:

```text
Header
+
Main content
+
Bottom navigation / menu
```

---

# 146. Mobile Ask Flow

```text
Open Ask
 ↓
Type question
 ↓
Submit
 ↓
Stream answer
 ↓
Sources
 ↓
Source receipt drawer
```

Keep the answer readable without horizontal scrolling.

---

# 147. Mobile Integration Flow

```text
Integration
 ↓
Select
 ↓
Authorize
 ↓
Scope
 ↓
Review
 ↓
Connect
```

Use one step per screen when necessary.

---

# 148. Mobile Agent Flow

Complex agent configuration should not attempt to show all three desktop columns.

Instead:

```text
Agent
 ↓
Context
 ↓
Execution
 ↓
Result
```

Use tabs/sections.

---

# 149. Mobile Graph Flow

```text
Search
 ↓
Select Entity
 ↓
Focused graph
 ↓
Entity drawer
```

---

# 150. Global UX Principles

The entire product should follow:

```text
1. Show the answer.
2. Show why.
3. Show evidence.
4. Respect permissions.
5. Make uncertainty visible.
6. Make changes reviewable.
7. Make important actions auditable.
8. Preserve context.
9. Keep the interface calm.
10. Always provide a next step.
```

---

# 151. Critical Trust Principles

Never:

```text
❌ Invent evidence
❌ Hide uncertainty
❌ Expose restricted context
❌ Treat suggestions as approved knowledge
❌ Claim an action happened if it did not
❌ Claim an action did not happen unless verified
❌ Present unsupported confidence
```

---

# 152. Critical AI UX Principle

CognitRAG should not say:

> "I know."

The product should communicate:

> **"Here's what the available company context supports."**

This distinction is central to trust.

---

# 153. Critical Knowledge Principle

Knowledge should have lifecycle state:

```text
Detected
Suggested
Reviewed
Approved
Active
Stale
Conflicting
Deprecated
```

The UI should make state visible.

---

# 154. Critical Agent Principle

Agents should operate within:

```text
Context
+
Permissions
+
Skills
+
Policies
+
Tools
```

The UI should make these dependencies inspectable.

---

# 155. Critical Startup Principle

Do not expose every capability immediately.

The product's first experience should be:

```text
Connect
 ↓
Ask
 ↓
Trust
```

Advanced features come after the user understands the core value.

---

# 156. Complete End-to-End Journey

The ideal long-term customer journey:

```text
LANDING PAGE
     ↓
GET EARLY ACCESS
     ↓
SIGN UP
     ↓
CREATE WORKSPACE
     ↓
CONNECT SLACK
     ↓
SELECT PERMISSIONS
     ↓
SYNC
     ↓
FIRST QUESTION
     ↓
EVIDENCE-BACKED ANSWER
     ↓
SOURCE RECEIPT
     ↓
KNOWLEDGE GRAPH
     ↓
DISCOVER ENTITY RELATIONSHIPS
     ↓
CONNECT JIRA + GITHUB
     ↓
BRAIN BECOMES RICHER
     ↓
DETECT KNOWLEDGE CHANGE
     ↓
REVIEW SOP
     ↓
APPROVE
     ↓
CREATE SKILL
     ↓
CREATE AGENT
     ↓
TEST IN PLAYGROUND
     ↓
CONNECT MCP
     ↓
DEPLOY AGENT
     ↓
MONITOR ACTIVITY
     ↓
GOVERN ACCESS
     ↓
AUDIT
```

---

# 157. MVP End-to-End Journey

The first release should reduce this to:

```text
Landing
 ↓
Signup
 ↓
Workspace
 ↓
Connect Source
 ↓
Sync
 ↓
Ask Brain
 ↓
Answer + Evidence
 ↓
Graph
 ↓
Basic Permissions
```

Everything else can progressively unlock.

---

# 158. Product "Aha" Moment

The most important interaction is:

```text
User asks something
        ↓
CognitRAG finds multiple company sources
        ↓
Connects them
        ↓
Produces useful answer
        ↓
Shows evidence
```

The user should think:

> **"It understands how our company information connects."**

---

# 159. Product "Trust" Moment

Second critical moment:

```text
User clicks evidence
        ↓
Sees exact source
        ↓
Sees relationship/context
        ↓
Sees freshness
```

The user should think:

> **"I can verify this."**

---

# 160. Product "Expansion" Moment

Third critical moment:

```text
User connects another system
        ↓
Knowledge graph becomes richer
        ↓
Answers improve in context
```

The user should think:

> **"The more of our company we connect, the more useful this becomes."**

---

# 161. Product "Agent" Moment

Long-term:

```text
Agent
 ↓
Company Brain
 ↓
Company context
 ↓
Safe action
```

The user should think:

> **"Now our AI can actually work with our company's knowledge."**

---

# 162. Final UX Contract

Every CognitRAG workflow should be designed so that:

```text
USER ACTION
     ↓
CLEAR FEEDBACK
     ↓
SYSTEM RESULT
     ↓
TRUST INFORMATION
     ↓
NEXT ACTION
```

No major interaction should end with:

```text
"What now?"
```

---

# 163. Definition of Done

The interaction system is ready when:

```text
[ ] Signup flow defined
[ ] Workspace flow defined
[ ] Source connection flow defined
[ ] Sync states defined
[ ] Ask Brain flow defined
[ ] Streaming defined
[ ] Evidence flow defined
[ ] Confidence states defined
[ ] Conflict states defined
[ ] Permission states defined
[ ] Graph flow defined
[ ] Knowledge management defined
[ ] Review flow defined
[ ] Skills flow defined
[ ] Agents flow defined
[ ] MCP flow defined
[ ] Security flow defined
[ ] Audit flow defined
[ ] Mobile flows defined
[ ] Error recovery defined
[ ] Destructive actions defined
[ ] Accessibility defined
[ ] Analytics events defined
```

---

# 164. Final Interaction Philosophy

> **CognitRAG should make complex company intelligence feel simple without hiding the complexity that matters for trust, permissions, governance, and verification.**

The user should be able to move from:

```text
QUESTION
```

to:

```text
UNDERSTANDING
```

to:

```text
VERIFICATION
```

to:

```text
ACTION
```

with minimal friction and maximum clarity.
