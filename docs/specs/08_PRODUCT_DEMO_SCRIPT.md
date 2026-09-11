# 08 — CognitRAG Product Demo Script
## 5–10 Minute Customer Demo for the Company Brain

> **Purpose:** Provide a repeatable customer-facing demo that communicates CognitRAG's value quickly and demonstrates the product through one coherent business story rather than a tour of every feature.
>
> **Audience:** CTOs, Heads of AI, Engineering leaders, Support leaders, AI/platform engineers, and startup founders.
>
> **Core story:** fragmented company knowledge → connected context → evidence-backed answer → semantic relationships → living knowledge → AI-agent readiness.

---

# 1. Demo Objective

The demo should make the prospect understand three things:

```text
1. Their company knowledge is fragmented.

2. CognitRAG connects the context between those systems.

3. The resulting Company Brain can serve both humans and AI agents.
```

The demo should not attempt to prove every future capability.

---

# 2. Demo Outcome

By the end of the demo, the prospect should be thinking:

> "This understands the context between our systems."

Then:

> "I can verify where the answer came from."

Then:

> "This could reduce the time our teams spend searching and asking each other."

Finally:

> "Our AI agents could use the same company context."

---

# 3. Demo Length

Recommended:

```text
5 minutes
Core demo

8 minutes
Standard demo

10 minutes
Detailed technical demo
```

Do not make the default demo a 30-minute product tour.

---

# 4. Demo Environment

Use a fictional company:

> **AcmeCloud**

Recommended demo systems:

```text
Slack
Jira
GitHub
Google Workspace / Documents
```

Use fictional data so no customer information is exposed.

---

# 5. Demo Dataset

Create a coherent dataset around one operational story.

Example:

```text
Company
AcmeCloud

Service
Billing Service

Related Service
Payment API

Incident
INC-902

Jira
BILL-902

GitHub
PR #1287

SOP
Billing Deployment v3.2
```

---

# 6. Demo Story

The customer story:

> AcmeCloud experienced a production issue involving database migrations during a billing deployment.

Relevant information appears in multiple places:

```text
Slack
Engineering discussion

Jira
Incident / decision

GitHub
Deployment workflow change

SOP
Updated operational process
```

The prospect asks:

> "What changed in billing deployment, and why?"

CognitRAG connects the information.

---

# 7. Pre-Demo Setup

Before the meeting, verify:

```text
[ ] Demo workspace loads.
[ ] Demo sources are connected.
[ ] Data indexing has completed.
[ ] Ask Brain works.
[ ] Sources open correctly.
[ ] Graph renders.
[ ] Demo answers are stable.
[ ] No real customer information appears.
[ ] No secrets are visible.
[ ] Permissions are configured.
[ ] Agent demo data is available if used.
```

Never improvise with unverified production data during a sales demo.

---

# 8. Demo Opening

Do NOT begin with:

> "Let me show you our architecture."

Begin with the pain.

Recommended opening:

> "Most companies don't have a knowledge problem. They have a context problem. The answer is usually somewhere in Slack, Jira, GitHub, documentation, or someone's memory. CognitRAG connects those pieces into a Company Brain."

Then:

> "Let me show you with one real workflow."

---

# 9. Demo Step 1 — Show the Problem

Time:

```text
30–45 seconds
```

Show:

```text
Slack
Jira
GitHub
Docs
```

Say:

> "Imagine an engineer wants to understand why the billing deployment process changed. The information isn't in one place."

Show the fragmented sources.

Do not spend more than one minute here.

---

# 10. Demo Step 2 — Connect the Sources

Time:

```text
30 seconds
```

Open:

```text
Integrations
```

Show:

```text
Slack       ✓
Jira        ✓
GitHub      ✓
Docs        ✓
```

Say:

> "CognitRAG connects the systems the team already uses and builds company context from them."

If the prospect already understands the integration concept, move quickly.

---

# 11. Demo Step 3 — Ask Brain

Time:

```text
60–90 seconds
```

Open:

```text
Ask Brain
```

Ask:

> **"What changed in our billing deployment process?"**

Do not explain the retrieval pipeline first.

Let the product answer.

---

# 12. Expected Answer

Example:

```text
Billing deployment now requires a database
migration pre-check before production deployment.

The change followed incident INC-902, where a
migration-related issue affected deployment.

Evidence:

Jira BILL-902
GitHub PR #1287
Slack #engineering

High confidence
Updated recently
```

Only use wording supported by the actual demo dataset.

---

# 13. Presenter Commentary

Do NOT say:

> "The LLM figured this out."

Say:

> "The important part is that this answer isn't coming from one document. It is combining relevant company context across several systems."

Then:

> "And we can inspect the evidence behind it."

---

# 14. Demo Step 4 — Open Evidence

Time:

```text
30–45 seconds
```

Click:

```text
Jira BILL-902
```

Open the Source Receipt.

Show:

```text
Source
Reference
Updated
Related entity
Why it was relevant
```

Say:

> "The user can verify where this conclusion came from instead of treating the answer as a black box."

This is one of the most important parts of the demo.

---

# 15. Demo Step 5 — Show Freshness

Point to:

```text
Updated
Aug 26
```

Say:

> "The user can also see when the information was updated."

Do not claim the information is current simply because it has a timestamp.

---

# 16. Demo Step 6 — Ask a Follow-Up

Ask:

> **"Why was this change made?"**

Show how the conversation retains context.

Example:

```text
The change was introduced after
INC-902 exposed a migration risk during deployment.
```

Then show evidence again.

---

# 17. Presenter Commentary

Say:

> "The Brain isn't just answering isolated questions. The user can continue the investigation without starting from scratch."

---

# 18. Demo Step 7 — Open the Knowledge Graph

Time:

```text
45–60 seconds
```

Navigate to:

```text
Knowledge Graph
```

Search:

```text
Billing Service
```

Show:

```text
Billing Service
   ├── depends on → Payment API
   ├── affected by → INC-902
   ├── changed by → PR #1287
   └── documented by → Billing SOP
```

---

# 19. Presenter Commentary

Say:

> "This is where we move beyond document retrieval. The system can represent relationships between the things the company actually operates."

Do not overclaim that a graph automatically guarantees correctness.

---

# 20. Demo Step 8 — Open an Entity

Click:

```text
Billing Service
```

Show:

```text
Owner
Related services
Incidents
SOPs
Decisions
Sources
```

Say:

> "The user can move from a question into the underlying company context."

---

# 21. Demo Step 9 — Show Living Knowledge

Time:

```text
60 seconds
```

Open:

```text
Billing Deployment SOP
```

Show:

```text
v3.2

Migration pre-check added.

Reason
INC-902

Evidence
Jira
GitHub
Slack
```

---

# 22. Presenter Commentary

Say:

> "Instead of treating documentation as static, CognitRAG can organize important changes into reusable operational knowledge."

If the demo includes human approval:

> "For important changes, the system can place the proposed update into a review workflow rather than treating every conversation as policy."

---

# 23. Human-in-the-Loop Demo

If implemented, show:

```text
Review Required

Proposed Change
Add migration pre-check.

Evidence
INC-902
BILL-902
PR #1287

[ Reject ]
[ Approve ]
```

Say:

> "The AI can identify a candidate change, but the organization can remain in control of what becomes authoritative knowledge."

---

# 24. Demo Step 10 — AI Agent Story

Time:

```text
60–90 seconds
```

Only use this section if the agent capability is actually functional.

Open:

```text
Agent Playground
```

Choose:

```text
Customer Support Agent
```

Ask:

> **"Can this customer receive a refund?"**

---

# 25. Agent Context

Show:

```text
Customer history
Refund policy
Active incidents
Support ticket
```

Then:

```text
Applicable rule
45-day exception during verified outage
```

---

# 26. Presenter Commentary

Say:

> "The same company context that a human can query can eventually be exposed to an AI agent."

Then:

> "The agent doesn't need to independently reconstruct the organization from disconnected systems."

---

# 27. MCP Explanation

Do not begin with protocol details.

Say:

> "For developers, CognitRAG can expose this company context through the interfaces their agent stack uses, including MCP where supported."

Then show:

```text
Agent
 ↓
MCP / API
 ↓
CognitRAG
 ↓
Company Context
```

Explain MCP technically only if the prospect is interested.

---

# 28. Demo Step 11 — Security

Time:

```text
30–60 seconds
```

Open:

```text
Security / Access
```

Show:

```text
Roles
Source access
Audit
```

Example:

```text
Support
✓ Customer
✓ Support
× HR

Engineering
✓ Engineering
✓ Incidents
× HR
```

---

# 29. Security Commentary

Say:

> "The Brain is only useful in enterprise environments if the context follows the right access boundaries."

Then:

> "The product therefore needs to enforce permissions before restricted context is returned."

Be precise about what is actually implemented.

---

# 30. Demo Step 12 — Close

Do not end by opening Settings.

End with the original problem.

Say:

> "We started with one question: what changed in billing and why? The answer required context from several systems. CognitRAG connected that context, showed the evidence, and made the result reusable."

Then:

> "That's the Company Brain."

---

# 31. Standard 8-Minute Demo Timeline

```text
00:00
Problem

00:45
Connected sources

01:15
Ask Brain

02:30
Evidence

03:15
Follow-up

04:00
Knowledge Graph

05:00
Living Knowledge

06:00
Agent context

07:00
Security

07:30
Close
```

Adjust based on audience.

---

# 32. CTO Version

Focus on:

```text
Fragmentation
Semantic layer
Retrieval quality
Graph
Permissions
Operational knowledge
Agent context
```

Avoid spending too much time on:

```text
Beautiful animations
Basic navigation
Generic chat features
```

---

# 33. Head of AI Version

Focus on:

```text
Context quality
Agent grounding
Knowledge relationships
Skills
MCP
API
Permissions
Evaluation
```

---

# 34. Engineering Manager Version

Focus on:

```text
Incident history
Ownership
Deployment context
SOPs
Decisions
Reduced repeated questions
```

---

# 35. Support Leader Version

Use a different opening question:

> **"Why is customer ACME experiencing payment failures?"**

Then show:

```text
Customer
↓
Ticket
↓
Incident
↓
Engineering change
↓
Current workaround
```

The story should emphasize reducing support → engineering escalation.

---

# 36. Operations Version

Ask:

> **"What changed in our refund policy this week?"**

Then show:

```text
Policy
↓
Source evidence
↓
Decision
↓
Approval
↓
Current SOP
```

---

# 37. AI Developer Version

Ask:

> **"What context would a support agent need to safely process a refund?"**

Then show:

```text
Knowledge
Rules
Skills
Permissions
API / MCP
```

---

# 38. Demo Question Bank

Use questions that require company-specific context.

## Engineering

```text
Why did we change the billing deployment process?

Who owns the Payment API?

What happened during INC-902?

What changed in production this week?
```

## Support

```text
Why is ACME seeing payment failures?

Can this customer receive a refund?

What workaround should support use?
```

## Operations

```text
Which SOP changed recently?

What is the current refund policy?

Who approved this policy?
```

## Company-wide

```text
Why did we choose PostgreSQL?

Who knows about billing?

What changed in the last 7 days?
```

---

# 39. Questions to Avoid in the Demo

Avoid questions whose answers depend on:

```text
Unstable data
Missing integrations
Unimplemented features
Unverified assumptions
```

Do not demo a capability simply because it looks impressive.

---

# 40. Demo Golden Path

The most reliable default story is:

```text
Question
 ↓
Answer
 ↓
Evidence
 ↓
Graph
 ↓
Living Knowledge
 ↓
Agent Context
```

This should be rehearsed until it is smooth.

---

# 41. Demo Golden Question

Use:

> **"What changed in our billing deployment process, and why?"**

Why this works:

```text
Requires cross-source context
Requires temporal reasoning
Shows decision/incident context
Shows evidence
Shows graph relationships
Can connect to SOP
Can later connect to agent execution
```

---

# 42. Demo Data Relationship

Construct the data intentionally:

```text
Slack
"Migration caused deployment issue."

        ↓

Jira
INC-902 / BILL-902

        ↓

GitHub
PR #1287 adds migration pre-check.

        ↓

SOP
Billing Deployment v3.2
```

The Brain answer should emerge from this connected data.

---

# 43. Demo Integrity Rule

The demo must never rely on hidden hardcoded answers disguised as real retrieval.

If a response is simulated for a marketing prototype, explicitly treat it as a demo experience.

For the production demo, the answer should come through the actual product flow.

---

# 44. Demo Environment Safety

Never place in the demo:

```text
Real passwords
API keys
Real customer secrets
Personal information
Confidential enterprise data
Internal tokens
```

Use:

```text
Synthetic company
Synthetic users
Synthetic customers
Synthetic incidents
```

---

# 45. Demo Recovery

If Ask Brain fails:

```text
Do not panic.
```

Use:

> "This is exactly why we're careful about production reliability. Let me switch to the prepared result so I can still show you the workflow."

Then continue.

Do not claim the live system succeeded when it did not.

---

# 46. Technical Deep-Dive Branch

If a technical buyer asks:

> "How did it get this answer?"

Switch to:

```text
Hybrid Search
+
Reranking
+
Entity Extraction
+
Graph Expansion
+
Context Fusion
```

Then explain:

```text
Query
 ↓
BM25 + Vector
 ↓
Rerank
 ↓
Entity detection
 ↓
Graph expansion when useful
 ↓
Context fusion
 ↓
Final answer
```

Use the actual architecture.

---

# 47. Technical Architecture Demo

If needed:

```text
Sources
 ↓
FastAPI ingestion
 ↓
Supabase / pgvector
 ↓
Neo4j
 ↓
LangGraph retrieval
 ↓
LLM synthesis
 ↓
SSE
 ↓
Ask Brain
```

Do not lead with this.

---

# 48. Security Deep-Dive Branch

If security is the buyer's priority:

Show:

```text
Authentication
Workspace isolation
RBAC
RLS
Source permissions
Audit
Data flow
```

Then explain where each control is actually enforced.

---

# 49. Evaluation Deep-Dive Branch

If asked about answer quality:

Show:

```text
Evaluation dataset
Retrieval metrics
Faithfulness
Context quality
Answer correctness
Latency
```

Explain methodology.

Do not use one benchmark score to imply universal accuracy.

---

# 50. Competitive Question — "How Is This Different From Search?"

Demo response:

> "Search helps me find the document or message. CognitRAG is designed to connect the relevant information across systems and answer the operational question with evidence."

Then demonstrate the cross-source question.

---

# 51. Competitive Question — "How Is This Different From RAG?"

Demo response:

> "Retrieval is part of CognitRAG, but the product is designed around a broader semantic layer that includes relationships, definitions, permissions, evidence, and changing operational context."

Then show Graph + Evidence.

---

# 52. Competitive Question — "Why Do I Need a Graph?"

Demo response:

> "Not every question needs graph expansion. The value appears when the answer depends on relationships between entities, decisions, incidents, systems, and people."

Then show:

```text
Billing Service
→ Incident
→ Decision
→ GitHub change
→ SOP
```

---

# 53. Competitive Question — "Can We Build This?"

Answer honestly:

> "You can build pieces of this yourself. The product value we are testing is whether maintaining the ingestion, semantic context, permissions, knowledge lifecycle, and agent interface is easier and more valuable as a dedicated platform."

Do not disparage internal engineering teams.

---

# 54. Competitive Question — "Do You Replace Our Knowledge Base?"

Recommended:

> "Not necessarily. CognitRAG can sit across the systems your organization already uses and connect their context."

The product should integrate rather than require every existing system to be replaced.

---

# 55. Objection — "Our Documentation Is Already Good."

Response:

> "That's useful. CognitRAG doesn't require documentation to be bad. The question is whether important context also lives outside documentation—in conversations, tickets, incidents, code changes, and decisions."

Then demonstrate cross-source retrieval.

---

# 56. Objection — "We Don't Want AI Changing Company Policy."

Response:

> "The workflow should distinguish detected information from approved organizational knowledge. Important changes can go through human review."

Show Review Queue if implemented.

---

# 57. Objection — "We Can't Give an AI Everything."

Response:

> "It shouldn't get everything. Access needs to follow the organization's authorization boundaries."

Then show permission controls.

---

# 58. Objection — "What If the Information Is Wrong?"

Response:

> "The system should make uncertainty visible, preserve source evidence, and surface conflicts rather than presenting unsupported claims as certainty."

Then show:

```text
Conflicting
or
Insufficient evidence
```

---

# 59. Demo Close — Design Partner

For an early-stage customer:

> "Rather than connect your entire company immediately, we can start with one workflow—such as support-to-engineering or incident knowledge—and measure whether CognitRAG actually saves your team time."

This is the recommended early-stage sales motion.

---

# 60. Design Partner CTA

```text
Pilot
 ↓
Choose one workflow
 ↓
Connect selected sources
 ↓
Define success metric
 ↓
Run for agreed period
 ↓
Measure outcome
```

---

# 61. Demo Close — Technical Team

> "The next step is to connect a small set of your real sources and test the same cross-system questions against your actual workflows."

---

# 62. Demo Close — Executive

> "The key question isn't whether we can build another AI search interface. It's whether we can reduce the cost of finding and applying organizational knowledge while making that context available to your AI systems."

---

# 63. Demo Follow-Up

After the meeting, send:

```text
Demo recap
Problem discussed
Workflow demonstrated
Relevant integrations
Pilot proposal
Security information
Next step
```

Do not send a generic feature dump.

---

# 64. Demo Recording

Maintain a short:

```text
2-minute product demo
```

for the website.

And:

```text
5–10 minute live demo
```

for sales.

---

# 65. Two-Minute Website Demo

Story:

```text
Question
 ↓
Answer
 ↓
Evidence
 ↓
Graph
 ↓
Agent
```

No long navigation.

---

# 66. Five-Minute Customer Demo

Story:

```text
Problem
 ↓
Connect
 ↓
Ask
 ↓
Evidence
 ↓
Graph
 ↓
Knowledge
```

---

# 67. Ten-Minute Technical Demo

Story:

```text
Problem
 ↓
Product
 ↓
Ask
 ↓
Evidence
 ↓
Graph
 ↓
Knowledge
 ↓
Agent
 ↓
Security
 ↓
Architecture
 ↓
Evaluation
```

---

# 68. Demo Visual Standards

Every demo screen should follow:

```text
Large readable content
Minimal distractions
One key message
Realistic data
Clear hierarchy
```

Do not open configuration pages unless configuration is the story.

---

# 69. Presenter Rules

Do:

```text
Start with a business problem.
Use one coherent dataset.
Ask concrete questions.
Show evidence.
Show relationships.
Explain trust.
Adapt to audience.
```

Do not:

```text
Read the UI aloud.
Explain every button.
Lead with architecture.
Make unsupported claims.
Pretend simulated behavior is live.
Use fake customer evidence.
```

---

# 70. Demo Story in One Sentence

> **"A company question requires context from several systems; CognitRAG connects that context, answers the question, shows the evidence, and makes the knowledge reusable."**

This is the core demonstration.

---

# 71. Demo Scorecard

After each demo, record:

```text
Did the prospect recognize the problem?

Did the prospect understand the product?

Which screen created the most interest?

Which question resonated?

What objection appeared?

Did security matter?

Did AI-agent capability matter?

Would they connect real data?

Would they run a pilot?
```

---

# 72. Customer Discovery During Demo

Do not turn the demo into an interrogation.

Ask only a few high-value questions:

```text
"Where does this information live today?"

"Who usually answers this question?"

"How long does it take?"

"What happens when the person who knows leaves?"

"Would solving this workflow be valuable enough to pilot?"
```

---

# 73. Demo Personalization

Before each customer demo, replace the fictional problem with the customer's actual workflow when possible.

For example:

```text
Customer support
→ customer issue context

Engineering
→ incident context

Operations
→ policy/SOP context
```

Keep the product story consistent.

---

# 74. Demo Success Signal

A strong prospect reaction is:

> "Can this connect to our Slack/Jira/GitHub?"

That indicates they are already imagining their own environment.

Another strong signal:

> "Can our agents use this?"

That indicates interest in the platform expansion.

---

# 75. Weak Demo Signal

If the prospect says:

> "This is basically ChatGPT over our documents."

The demo did not adequately demonstrate:

```text
Cross-system context
Relationships
Evidence
Operational knowledge
Permissions
Agent context
```

Change the demonstration, not the explanation.

---

# 76. Demo Iteration Loop

After every demo:

```text
Record reaction
 ↓
Identify confusion
 ↓
Identify strongest moment
 ↓
Improve story
 ↓
Improve dataset
 ↓
Repeat
```

The demo itself should evolve from customer conversations.

---

# 77. Recommended Demo Assets

Maintain:

```text
Demo workspace
Demo dataset
Demo script
2-minute video
5-minute script
10-minute technical script
Architecture diagram
Security overview
Evaluation overview
Pilot proposal
```

---

# 78. Demo File Structure

Recommended internal folder:

```text
demo/
├── dataset/
├── scripts/
│   ├── 2min.md
│   ├── 5min.md
│   └── 10min.md
├── screenshots/
├── videos/
├── architecture/
├── security/
└── pilot/
```

---

# 79. Final Demo Principle

The demo should never feel like:

> "Here are all our features."

It should feel like:

> **"Here is a problem your organization has. Watch the Company Brain solve it."**

---

# 80. Canonical 5-Minute Script

## 00:00 — Problem

> "Your company has the answer, but it is usually spread across Slack, Jira, GitHub, documentation, and people."

## 00:30 — Connect

> "CognitRAG connects those sources into one semantic company context layer."

## 01:00 — Ask

> "Let's ask: What changed in our billing deployment process, and why?"

## 01:45 — Answer

> "The Brain identifies the current process and the incident that caused the change."

## 02:15 — Evidence

> "Now let's verify it. These are the Jira, GitHub, and Slack sources behind the answer."

## 03:00 — Graph

> "We can see how the Billing Service, incident, code change, and SOP relate."

## 03:45 — Living Knowledge

> "The important operational change can become reusable knowledge."

## 04:15 — Agents

> "The same company context can eventually be provided to AI agents."

## 04:45 — Security

> "And the context has to respect permissions."

## 05:00 — Close

> "That's the Company Brain: connect the context your company already has and make it usable."

---

# 81. Final Technical Demo Principle

If the prospect wants the architecture, then show:

```text
Source
 ↓
Ingestion
 ↓
Hybrid retrieval
 ↓
Reranking
 ↓
Entity / graph context
 ↓
Context fusion
 ↓
Answer
```

Explain technical components based on the actual implementation.

---

# 82. Final Sales Principle

Do not sell:

> "We have a graph database."

Sell:

> "We can answer questions that require context from multiple parts of your company."

Do not sell:

> "We use vector search."

Sell:

> "We can retrieve the information users actually need."

Do not sell:

> "We use MCP."

Sell:

> "Your AI agents can access the same company context."

---

# 83. Final Demo Principle

The most important screen is:

> **Ask Brain**

The most important proof is:

> **Evidence**

The most important differentiation is:

> **Connected context**

The most important long-term vision is:

> **AI agents using the Company Brain**

---

# 84. Definition of Done

The demo package is ready when:

```text
[ ] 2-minute demo exists
[ ] 5-minute demo exists
[ ] 10-minute technical demo exists
[ ] Demo dataset is coherent
[ ] Demo workspace is stable
[ ] Ask Brain is stable
[ ] Evidence works
[ ] Graph works
[ ] Knowledge update works if demonstrated
[ ] Agent demo works if demonstrated
[ ] Security demo is accurate
[ ] No real sensitive data is used
[ ] No unsupported claims are used
[ ] Presenter can recover from errors
[ ] Audience-specific variants exist
[ ] Pilot CTA is defined
```

---

# 85. Final Product Story

The entire CognitRAG demo can be reduced to:

```text
A QUESTION
      ↓
requires information from
multiple systems
      ↓
COGNITRAG CONNECTS IT
      ↓
UNDERSTANDS THE CONTEXT
      ↓
ANSWERS
      ↓
SHOWS EVIDENCE
      ↓
REVEALS RELATIONSHIPS
      ↓
PRESERVES KNOWLEDGE
      ↓
ENABLES AI AGENTS
```

That is the story the product should repeatedly prove.
