# 03 — CognitRAG Landing Page Specification
## Complete Startup Marketing Website & Homepage Product Specification

> **Purpose:** Define exactly what the CognitRAG public website should communicate, what visitors should see, how the homepage should convert visitors into users/design partners, and how the marketing website should visually connect the Company Brain concept to the actual product.

---

# 1. Website Objective

The CognitRAG website is not documentation.

Its primary job is to answer five questions quickly:

1. What is CognitRAG?
2. What problem does it solve?
3. Why is it different from search or basic RAG?
4. Can I trust it with company information?
5. What should I do next?

The website should move visitors through:

```text
PROBLEM
   ↓
RECOGNITION
   ↓
PRODUCT
   ↓
DEMO
   ↓
PROOF
   ↓
TRUST
   ↓
CTA
```

The homepage should sell the **outcome**, not the implementation.

---

# 2. Primary Website Audience

The website must support several audiences without becoming confusing.

## Primary

- CTOs
- Heads of AI
- Engineering leaders
- Support leaders
- AI/platform engineers
- technology startup founders

## Secondary

- IT administrators
- enterprise security teams
- developers evaluating the API/MCP layer
- employees evaluating the product internally

---

# 3. Primary Website Goal

The main conversion should be:

> **Get Early Access**

For the early startup stage, this should lead to an onboarding or design-partner request rather than a complicated self-service purchase funnel.

---

# 4. Secondary Website Goals

Visitors should also be able to:

```text
See How It Works
        ↓
View Product
        ↓
Explore Security
        ↓
Explore Developer Platform
        ↓
Book a Demo
```

---

# 5. Recommended Website Navigation

Desktop navigation:

```text
┌─────────────────────────────────────────────────────────────┐
│ CognitRAG    Product   Solutions   How It Works   Security  │
│             Developers   Pricing                    [Log in]│
│                                      [ Get Early Access ]   │
└─────────────────────────────────────────────────────────────┘
```

Recommended dropdowns:

```text
PRODUCT
├── Ask Brain
├── Knowledge Graph
├── Living Knowledge
├── Skills
├── AI Agents
└── Integrations

SOLUTIONS
├── Engineering
├── Support
├── Operations
└── AI Teams

DEVELOPERS
├── API
├── MCP
├── Architecture
└── Documentation
```

---

# 6. Global Navigation Behavior

## Desktop

- sticky header
- transparent/blurred header at the top
- subtle border after scrolling
- primary CTA always visible
- responsive dropdowns

## Mobile

```text
CognitRAG
                         ☰
```

Menu:

```text
Product
Solutions
How It Works
Security
Developers
Pricing

Log in
Get Early Access
```

---

# 7. Overall Visual Direction

The website should feel like:

> **Premium enterprise AI infrastructure.**

Reference characteristics, not direct copies:

- Linear-level cleanliness
- Vercel-style technical confidence
- Stripe-style information hierarchy
- modern AI product visualization
- enterprise security credibility

Do not copy another company's exact design.

---

# 8. Visual Principles

## Principle 1 — Product First

Whenever possible, show the real product rather than abstract illustrations.

## Principle 2 — Explain Visually

Complex concepts should become diagrams.

## Principle 3 — Reduce Cognitive Load

One major message per section.

## Principle 4 — Use Animation Purposefully

Animation should explain:

- data movement
- graph relationships
- knowledge updates
- agent context
- integration flow

It should not exist merely for decoration.

## Principle 5 — Trust Through Transparency

Show:

- evidence
- source
- confidence
- permissions
- timestamps

---

# 9. Color Direction

Recommended foundation:

```text
Background
White / very light neutral

Primary text
Near-black / deep slate

Secondary text
Slate gray

Primary accent
Indigo / violet

Information
Blue

Verified
Green

Review
Amber

Error
Red
```

Dark mode can use:

```text
Deep navy / black
White text
Muted slate
Violet/indigo accents
```

Avoid turning the whole website into a neon AI interface.

---

# 10. Typography

Recommended:

```text
Primary:
Inter or Geist

Code / technical content:
JetBrains Mono
```

Hierarchy:

```text
Hero Display
        ↓
Section Heading
        ↓
Subheading
        ↓
Body
        ↓
Metadata
```

Use strong typography rather than excessive decorative graphics.

---

# 11. Homepage Structure

The homepage should contain:

```text
01  Navigation
02  Hero
03  Trust / Integration Strip
04  Problem
05  Product Introduction
06  How It Works
07  Ask Brain Demo
08  Living Knowledge
09  Semantic Graph
10  AI Agent / MCP
11  Security
12  Integrations
13  Proof / Evaluation
14  Solutions
15  Pricing
16  FAQ
17  Final CTA
18  Footer
```

---

# 12. Section 01 — Navigation

## Goal

Allow visitors to understand the product category and take action immediately.

Display:

```text
CognitRAG
Company Brain

Product
Solutions
How It Works
Security
Developers
Pricing

Log in

[ Get Early Access ]
```

The wordmark should be simple.

The product descriptor can appear as:

> Company Brain

---

# 13. Section 02 — Hero

This is the most important section.

The hero must communicate the startup in approximately five seconds.

## Eyebrow

> COMPANY BRAIN FOR AI-NATIVE TEAMS

## Primary headline

> **Your company already has a brain. Connect it.**

## Supporting text

> CognitRAG connects the knowledge scattered across Slack, Jira, GitHub, documents, and business systems—then turns it into trusted, permission-aware context for employees and AI agents.

## Primary CTA

> **Get Early Access**

## Secondary CTA

> **See How It Works**

---

# 14. Hero Visual

The right side should show the Company Brain transformation.

Preferred visual:

```text
       Slack
         \
       Jira --------\
         \           \
       GitHub ------> COMPANY BRAIN
         /           /
       Docs --------/
                     |
              ┌──────┴──────┐
              │             │
          Employees      AI Agents
```

The visual can be animated.

---

# 15. Hero Animation

Recommended sequence:

```text
Slack message
       ↓
Jira ticket
       ↓
GitHub change
       ↓
Document
       ↓
Connected nodes
       ↓
Company Brain
       ↓
Trusted answer
```

Animation should be 2–5 seconds and loop gently.

Avoid excessive glowing effects.

---

# 16. Hero Product Preview

The hero can include a product window:

```text
┌───────────────────────────────────────────┐
│ Ask Brain                                 │
│                                           │
│ What changed in billing this week?       │
│                                           │
│ Billing deployment changed yesterday.    │
│                                           │
│ • Migration pre-check added               │
│ • Jira BILL-902                           │
│ • GitHub PR #1287                         │
│ • Slack #engineering                      │
│                                           │
│ Confidence 97%                            │
└───────────────────────────────────────────┘
```

This makes the value immediately concrete.

---

# 17. Section 03 — Trust / Integration Strip

Immediately after the hero:

> **Connect the tools your company already uses.**

Display supported integrations:

```text
Slack
Google Workspace
Jira
GitHub
Notion
Salesforce
```

The current UI specification already identifies these as the initial integration surface.

Use logos only where actual integrations exist.

---

# 18. Section 04 — Problem

## Headline

> **Your knowledge is everywhere. Your context isn't.**

## Supporting text

> Important decisions, procedures, customer context, and operational knowledge are spread across conversations, tickets, repositories, documents, and individual employees.

---

# 19. Problem Visualization

Create a fragmented environment:

```text
┌─────────┐      ┌─────────┐
│ Slack   │      │ Jira    │
└────┬────┘      └────┬────┘
     │                 │

┌────┴────┐      ┌────┴────┐
│ GitHub  │      │ Notion  │
└────┬────┘      └────┬────┘
     │                 │

       ┌───────────────┐
       │  People/Docs  │
       └───────────────┘

          fragmented
            context
```

Then transition all sources toward the Company Brain.

---

# 20. Problem Copy Examples

Use recognizable situations:

```text
"Where did we decide this?"

"Which SOP is current?"

"Who owns this service?"

"Why was this architecture chosen?"

"Did anything change this week?"

"Ask Sarah. She knows."
```

The final line can be used humorously but professionally.

---

# 21. Section 05 — Product Introduction

## Headline

> **Meet your Company Brain.**

## Supporting text

> CognitRAG connects fragmented information, understands the relationships between it, and turns it into a living semantic layer that people and AI systems can use.

---

# 22. Product Transformation

Use a three-stage visual:

```text
COMPANY DATA
Slack
Jira
GitHub
Docs
CRM
Tickets

        ↓

COMPANY BRAIN
Entities
Relationships
Rules
Decisions
Policies
Context

        ↓

INTELLIGENCE
Answers
SOPs
Skills
AI Agents
Actions
```

---

# 23. Section 06 — How It Works

## Headline

> **Connect. Understand. Verify. Act.**

Four cards:

### 01 — Connect

> Bring together the systems where your company works.

### 02 — Understand

> Extract entities, relationships, decisions, and operational context.

### 03 — Verify

> Ground answers in evidence, permissions, definitions, and current sources.

### 04 — Act

> Make company context available to employees, applications, and AI agents.

---

# 24. How It Works Animation

Show:

```text
Slack ─┐
Jira ──┤
GitHub ┤
Docs ──┤
       ↓
  Ingestion
       ↓
Understanding
       ↓
Semantic Graph
       +
Vector Knowledge
       ↓
Company Brain
       ↓
Humans + Agents
```

Use moving dots/particles sparingly.

---

# 25. Section 07 — Ask Brain

This should be the first major product demonstration.

## Headline

> **Ask your company. Get an answer with evidence.**

## Supporting text

> Instead of searching across multiple systems, ask a question in natural language and inspect the sources behind the answer.

---

# 26. Ask Brain Interactive Demo

Create a fake/demo workspace containing realistic but clearly fictional company data.

Suggested query:

> What changed in our billing deployment process?

Response:

```text
Billing deployment now requires a
database migration pre-check before
production deployment.

What changed
A new migration verification step
was introduced.

Why
A previous deployment caused a
database migration issue.

Sources
Jira BILL-902
GitHub PR #1287
Slack #engineering

Confidence
97%

Last verified
4 hours ago
```

---

# 27. Ask Brain UI

The visual should include:

```text
┌──────────────────────────────────────────────────┐
│ Ask Brain                                        │
│                                                  │
│ What changed in our billing deployment process? │
│                                        [Send]    │
│                                                  │
│ ──────────────────────────────────────────────── │
│                                                  │
│ Billing deployment now requires...              │
│                                                  │
│ Evidence                                         │
│ ✓ Jira BILL-902                                  │
│ ✓ GitHub PR #1287                                │
│ ✓ Slack #engineering                             │
│                                                  │
│ Confidence 97%       Updated 4 hours ago         │
└──────────────────────────────────────────────────┘
```

---

# 28. Source Receipt Interaction

When the user clicks a source:

```text
SOURCE

Jira BILL-902

Updated
Aug 26, 2026

Related entity
Billing Service

Related decision
Migration pre-check

Open source →
```

This demonstrates traceability.

---

# 29. Section 08 — Living Knowledge

## Headline

> **Your documentation should evolve with your company.**

Supporting copy:

> CognitRAG can identify important operational changes and turn approved knowledge into current SOPs, decisions, and reusable context.

---

# 30. Living Knowledge Visual

Show:

```text
Slack Discussion
       ↓
Important change detected
       ↓
Evidence collected
       ↓
Human review
       ↓
Knowledge updated
       ↓
SOP v3.2
```

---

# 31. Living SOP Product Preview

```text
Billing Deployment SOP

v3.2

CURRENT

1. Merge to main
2. Run migration pre-check
3. Deploy
4. Monitor

NEW IN THIS VERSION

+ Migration pre-check

Reason
Incident INC-902

Evidence
Jira + GitHub + Slack

[ View History ]
```

---

# 32. Section 09 — Semantic Graph

## Headline

> **Search finds information. Relationships reveal context.**

Supporting copy:

> CognitRAG connects entities such as people, services, incidents, decisions, customers, and documents so related information can be understood together.

---

# 33. Graph Visual

Use a small, elegant graph:

```text
                 Billing Service
                    /       \
                   /         \
              GitHub       Incident
                 |             |
                 |             |
              PR #1287     INC-902
                   \         /
                    \       /
                    Migration
                    Pre-check
                        |
                        ↓
                       SOP
```

Node labels should be readable.

Do not fill the screen with hundreds of nodes.

---

# 34. Graph Interaction

User can:

```text
Click Node
    ↓
Open Entity Details
    ↓
See Relationships
    ↓
Open Source
    ↓
Ask Brain About Entity
```

---

# 35. Section 10 — AI Agents / MCP

## Headline

> **Give your AI agents the context your company actually has.**

Supporting copy:

> Let agents access company knowledge, rules, skills, and operational context through the interfaces your AI stack already uses.

---

# 36. Agent Architecture Visual

```text
                 AI AGENT
                     |
                     ↓
                  MCP/API
                     |
                     ↓
              COGNITRAG BRAIN
                     |
          +----------+----------+
          |          |          |
       Policies    Skills     Context
          |          |          |
          +----------+----------+
                     |
                     ↓
              Trusted Response
```

---

# 37. Agent Playground Preview

Show:

```text
Agent
Customer Support Agent

Question
Can this customer receive a refund?

Retrieved Context
✓ Customer history
✓ Refund policy
✓ Active incident
✓ Support ticket

Applicable Rule
45-day exception applies
during verified infrastructure outages.

Confidence
98%

[ Run Agent ]
```

---

# 38. Section 11 — Security

## Headline

> **Enterprise knowledge needs enterprise control.**

Supporting copy:

> Company context is only useful when it respects who is allowed to access it.

---

# 39. Security Feature Cards

```text
Role-Based Access
Access follows user roles.

Source Permissions
Respect connected-system access.

Database-Level Controls
Restrict retrieval before unauthorized
context reaches the answer pipeline.

Auditability
Trace answers to source evidence.

Controlled Definitions
Define important company terms and
business logic explicitly.
```

Only advertise controls that are actually implemented.

---

# 40. Security Visualization

Use a permission flow:

```text
User
  ↓
Role
  ↓
Allowed Sources
  ↓
Allowed Knowledge
  ↓
Retrieval
  ↓
Answer
```

Show blocked content visually:

```text
#hr-compensation
        🔒
Not accessible
```

Do not display real sensitive information.

---

# 41. Section 12 — Integrations

## Headline

> **Connect the systems your company already uses.**

Organize integrations by category.

### Communication

- Slack
- Microsoft Teams

### Engineering

- GitHub
- Jira
- Linear

### Knowledge

- Notion
- Google Workspace

### CRM / Support

- Salesforce
- Zendesk

Use only integrations that are actually available.

---

# 42. Integration Card

Example:

```text
┌────────────────────────────┐
│ Slack                      │
│ Communication              │
│                            │
│ ✓ Connected                │
│ 24,532 items               │
│ Last sync: 2 minutes ago   │
│                            │
│ [ Configure ]              │
└────────────────────────────┘
```

---

# 43. Section 13 — Proof / Evaluation

## Headline

> **Built to make enterprise AI more trustworthy.**

Proof should be factual.

Possible metrics:

```text
Faithfulness
100%

Context Accuracy
80%

Evaluation
RAGAS

Dataset
Internal benchmark
```

Only display numbers that have actually been measured and can be explained.

Add:

> View Evaluation Methodology

---

# 44. Evaluation Page

Create a separate:

`/evaluations`

Include:

- dataset description
- evaluation methodology
- metrics
- model configuration
- retrieval configuration
- known limitations
- evaluation date
- reproducibility information

This prevents the homepage from becoming overly technical.

---

# 45. Section 14 — Solutions

Instead of presenting dozens of features, show four practical outcomes.

## Engineering

> Understand systems, incidents, decisions, and operational procedures.

CTA:

> Explore Engineering

## Support

> Connect customer issues with the engineering knowledge needed to resolve them.

CTA:

> Explore Support

## Operations

> Keep processes, policies, and decisions current.

CTA:

> Explore Operations

## AI Teams

> Give agents access to trusted company context.

CTA:

> Explore AI Agents

---

# 46. Section 15 — Pricing

Early-stage pricing should remain simple.

Potential structure:

```text
STARTER

For small teams

Core knowledge
Limited integrations
Ask Brain

[ Get Started ]


PRO

For growing teams

More integrations
Semantic Graph
Living Knowledge
Advanced access controls

[ Get Early Access ]


ENTERPRISE

For larger organizations

Advanced security
Custom deployment
Dedicated support
Agent / API capabilities

[ Talk to Us ]
```

Do not publish detailed pricing until the pricing model has been validated with customers.

---

# 47. Pricing Philosophy

The value of CognitRAG increases with:

- connected systems
- users
- knowledge volume
- query volume
- agent usage
- security requirements
- deployment requirements

Therefore pricing can eventually combine:

```text
Platform
+
Usage
+
Users
+
Enterprise requirements
```

Do not prematurely optimize the exact pricing formula.

---

# 48. Section 16 — FAQ

Recommended questions:

### What is CognitRAG?

Explain Company Brain in simple language.

### How is CognitRAG different from enterprise search?

Explain relationship-aware context and evidence.

### Is CognitRAG another RAG system?

Explain that retrieval is part of the architecture, but the product adds semantic graph, controlled definitions, permissions, and context.

### What data can CognitRAG connect?

List currently supported integrations.

### Can CognitRAG access private company information?

Explain actual access controls.

### Can AI agents use CognitRAG?

Explain current API/MCP capabilities only if implemented.

### How long does setup take?

State the actual onboarding experience.

### Where is company data stored?

Explain the actual deployment architecture.

### Does CognitRAG guarantee zero hallucinations?

Answer honestly:

> No AI system should be marketed as guaranteeing zero hallucinations. CognitRAG is designed to improve grounding and verifiability through retrieval, semantic relationships, controlled definitions, permissions, and source evidence.

---

# 49. Section 17 — Final CTA

This section should be visually stronger.

## Headline

> **Make your company's intelligence usable.**

Supporting copy:

> Connect the knowledge your company already has and make it accessible to the people and AI systems that need it.

CTA:

> **Get Early Access**

Secondary:

> **Book a Demo**

---

# 50. Final CTA Alternative

For a more AI-focused version:

> **Give your AI the context your company already has.**

CTA:

> **Build Your Company Brain**

---

# 51. Footer

Structure:

```text
COGNITRAG
Company Brain for AI-native teams

PRODUCT
Ask Brain
Knowledge Graph
Living Knowledge
Skills
Agents
Integrations

SOLUTIONS
Engineering
Support
Operations
AI Teams

DEVELOPERS
API
MCP
Documentation
Architecture

COMPANY
About
Contact
Security
Privacy
Terms

SOCIAL
GitHub
LinkedIn
X

© CognitRAG
```

Only include social links that actually exist.

---

# 52. Product Website Pages

The homepage should link into a larger site.

Recommended pages:

```text
/
 /product
 /product/ask-brain
 /product/knowledge-graph
 /product/living-knowledge
 /product/skills
 /product/agents
 /integrations
 /solutions
 /solutions/engineering
 /solutions/support
 /solutions/operations
 /solutions/ai-teams
 /security
 /developers
 /pricing
 /evaluations
 /docs
 /contact
```

Do not build every page before validating the homepage and product.

---

# 53. Conversion Funnel

Recommended funnel:

```text
Visitor
  ↓
Homepage
  ↓
See Problem
  ↓
See Product
  ↓
Watch / interact with demo
  ↓
Understand Trust
  ↓
Get Early Access
  ↓
Workspace creation
  ↓
Connect source
  ↓
Ask first question
  ↓
Experience first value
```

---

# 54. Above-the-Fold Rule

The first viewport must answer:

```text
WHAT?
Company Brain

WHY?
Company knowledge is fragmented.

VALUE?
Trusted context for people + AI.

ACTION?
Get Early Access.
```

If a visitor has to scroll to understand what CognitRAG does, the hero needs improvement.

---

# 55. Website Animation System

Use four recurring animations.

## 1. Data Flow

Sources → Brain.

## 2. Graph Formation

Disconnected entities → connected relationships.

## 3. Knowledge Update

Old SOP → detected change → updated SOP.

## 4. Agent Context

Agent → Brain → context → answer.

These four animations tell the complete story.

---

# 56. Avoid Animation Overload

Do not animate:

- every card
- every heading
- every icon
- every button
- every graph node simultaneously

The product should feel calm.

Animation should communicate system behavior.

---

# 57. Marketing Screenshot Strategy

Do not use random dashboard screenshots.

Create purpose-built marketing screenshots for:

1. Ask Brain
2. Knowledge Graph
3. Living SOP
4. Source Evidence
5. Agent Playground
6. Integrations
7. Security

Each screenshot should tell one story.

---

# 58. Product Demo Data

The public website should use fictional/demo company data.

Example company:

> AcmeCloud

Example systems:

```text
Slack
Jira
GitHub
Notion
Salesforce
```

Example entities:

```text
Billing Service
Payment API
Customer ACME
Incident INC-902
Jira BILL-902
```

This allows the product to look realistic without exposing customer information.

---

# 59. Homepage Interactive Demo

The strongest marketing improvement is an interactive "Ask Brain" sandbox.

Visitors select:

```text
Engineering
Support
Operations
Sales
```

Then select a question.

Example:

```text
Engineering
"What changed in our billing deployment?"

Support
"Why is ACME receiving payment failures?"

Operations
"Which SOP changed this week?"

Sales
"What do we know about ACME?"
```

Then show a simulated answer.

Clearly label demo data as fictional.

---

# 60. Demo CTA

After the interactive response:

```text
This is what a connected Company Brain looks like.

[ Build Your Company Brain ]
```

This converts product curiosity into action.

---

# 61. Trust Placement

Security should NOT be only in the footer.

Trust signals should appear:

### Hero

Small:

> Permission-aware • Source-backed • Enterprise-ready

### Ask Brain

Sources + confidence.

### Security section

Detailed controls.

### Footer

Security link.

---

# 62. Marketing Copy Rule

Every technical statement should answer:

> Why should the customer care?

Example:

Bad:

> Uses Neo4j for graph traversal.

Better:

> Connect related people, systems, decisions, and incidents so answers include the context around the information.

Technical details can appear underneath.

---

# 63. Feature-to-Benefit Mapping

Never market only the feature.

```text
FEATURE
Knowledge Graph

BENEFIT
Understand relationships across company knowledge.


FEATURE
Hybrid Retrieval

BENEFIT
Find precise information using both meaning and exact terms.


FEATURE
Semantic Dictionary

BENEFIT
Keep critical company definitions consistent.


FEATURE
RBAC/RLS

BENEFIT
Respect who can access company knowledge.


FEATURE
Source Evidence

BENEFIT
See why an answer was generated.


FEATURE
MCP/API

BENEFIT
Make company context available to AI agents.
```

---

# 64. Homepage SEO Foundation

Primary phrase:

> Company Brain

Secondary concepts:

- enterprise AI context
- company knowledge AI
- enterprise semantic layer
- AI agent context
- organizational knowledge
- enterprise knowledge graph
- AI company knowledge

Do not keyword-stuff the website.

Write for humans first.

---

# 65. Suggested Meta Title

> CognitRAG — The Company Brain for AI-Native Teams

---

# 66. Suggested Meta Description

> CognitRAG connects fragmented company knowledge and turns it into trusted, permission-aware context for employees and AI agents.

---

# 67. Open Graph / Social Preview

Social preview should contain:

```text
COGNITRAG

YOUR COMPANY
ALREADY HAS A BRAIN.

Connect it.

Trusted company context
for humans + AI agents.
```

Background:

Subtle connected semantic graph.

---

# 68. Mobile Homepage

Mobile order:

```text
Hero
↓
CTA
↓
Integration strip
↓
Problem
↓
Product
↓
How It Works
↓
Ask Brain
↓
Living Knowledge
↓
Graph
↓
AI Agents
↓
Security
↓
Solutions
↓
Pricing
↓
FAQ
↓
CTA
```

Do not put large graph animations above the main mobile CTA.

---

# 69. Responsive Product Screens

Marketing screenshots should have mobile alternatives.

Desktop:

```text
Dashboard + Graph + Evidence
```

Mobile:

```text
Question
↓
Answer
↓
Sources
↓
Confidence
```

The mobile experience should prioritize the answer rather than graph exploration.

---

# 70. Accessibility

Minimum requirements:

- keyboard navigation
- visible focus states
- readable contrast
- semantic HTML
- alt text for meaningful images
- reduced-motion support
- accessible form labels
- proper heading hierarchy

Do not make critical information available only through animation.

---

# 71. Performance

The marketing site should load quickly.

Prioritize:

- optimized images
- lazy-loaded large visualizations
- minimal JavaScript for static sections
- server-rendered content
- optimized fonts
- compressed assets

Do not load the complete product dashboard application on the homepage.

---

# 72. Landing Page Technical Structure

Recommended Next.js structure:

```text
app/
├── page.js
├── product/
├── solutions/
├── security/
├── developers/
├── pricing/
├── evaluations/
└── docs/

components/
├── marketing/
│   ├── Navbar
│   ├── Hero
│   ├── IntegrationStrip
│   ├── ProblemSection
│   ├── ProductSection
│   ├── HowItWorks
│   ├── AskBrainDemo
│   ├── LivingKnowledge
│   ├── GraphSection
│   ├── AgentSection
│   ├── SecuritySection
│   ├── Solutions
│   ├── Pricing
│   ├── FAQ
│   ├── FinalCTA
│   └── Footer
└── ui/
```

---

# 73. Marketing Component Rules

Components should be reusable.

Example:

```text
Section
SectionHeader
FeatureCard
IntegrationLogo
ProductWindow
SourceBadge
ConfidenceBadge
CTAButton
MetricCard
GraphPreview
AgentFlow
FAQItem
```

Do not build every marketing section as one giant component.

---

# 74. Hero Implementation Requirements

The hero must:

- render immediately
- have accessible text
- work without animation
- have responsive layout
- contain primary CTA
- contain secondary CTA
- show product value within the first viewport

---

# 75. Product Screenshot Rules

Every product screenshot should have:

```text
Purpose
Context
Relevant UI
One key interaction
```

Avoid screenshots that show 20 unrelated panels.

---

# 76. Marketing Trust Rules

Never invent:

- customer logos
- testimonials
- revenue
- adoption
- uptime
- certifications
- benchmark numbers
- security certifications
- enterprise contracts

Use placeholders only in internal mockups.

---

# 77. Early Startup Version

The first public homepage can be much smaller:

```text
Hero
↓
Problem
↓
Product
↓
Ask Brain Demo
↓
How It Works
↓
Security
↓
Integrations
↓
Early Access CTA
↓
Footer
```

This is enough to launch.

Do not wait for 17 polished sections.

---

# 78. Version 1 Homepage Priority

Build these first:

### Priority 1

Hero.

### Priority 2

Ask Brain product demo.

### Priority 3

Problem.

### Priority 4

How it works.

### Priority 5

Security.

### Priority 6

Integrations.

### Priority 7

Early access.

Everything else can follow.

---

# 79. Homepage Success Test

Show the website to someone who knows nothing about CognitRAG.

Ask:

> "What does this company do?"

If they answer:

> "It's an AI chatbot."

The homepage failed.

If they answer:

> "It connects a company's internal knowledge and makes it usable by employees and AI agents."

The homepage succeeded.

---

# 80. Final Homepage Narrative

The complete story should feel like:

```text
YOUR COMPANY KNOWS A LOT.

But that knowledge is fragmented.

Slack.
Jira.
GitHub.
Docs.
Tickets.
People.

             ↓

COGNITRAG

Connects the pieces.

             ↓

UNDERSTANDS

Entities.
Relationships.
Decisions.
Rules.
Context.

             ↓

VERIFIES

Evidence.
Permissions.
Definitions.
Freshness.

             ↓

DELIVERS

Answers.
Living knowledge.
Skills.
Agent context.

             ↓

FOR

Employees.
Teams.
AI agents.

             ↓

RESULT

A company that can
use what it already knows.
```

---

# 81. Canonical Homepage Message

Use this as the final marketing narrative:

> **Your company already has a brain. Connect it.**
>
> CognitRAG connects the knowledge scattered across your company's systems and turns it into trusted, permission-aware context for humans and AI agents.
>
> Ask questions. Understand relationships. Track what changed. Verify the evidence. Give your AI the context it needs.
>
> **[ Get Early Access ]**

---

# 82. Definition of Done

The landing page is ready for launch when:

```text
[ ] Visitor understands CognitRAG within 5 seconds
[ ] Hero contains a clear value proposition
[ ] Primary CTA is visible
[ ] Problem is immediately recognizable
[ ] Realistic product demo exists
[ ] Ask Brain experience is understandable
[ ] Evidence/source experience is shown
[ ] Knowledge Graph is visually explained
[ ] AI agent story is explained
[ ] Security controls are explained accurately
[ ] Integrations are shown
[ ] No unsupported claims are present
[ ] Mobile layout works
[ ] Accessibility basics are implemented
[ ] Performance is acceptable
[ ] Early-access conversion works
```

---

# 83. Final Principle

The website should not make people think:

> "This company built an impressive AI architecture."

It should make them think:

> **"Our company has exactly this problem."**

Then:

> **"I can see how this solves it."**

Then:

> **"I trust it enough to try."**

Then:

> **"Let's connect our first source."**

That is the entire purpose of the CognitRAG marketing website.
