# 21 — CognitRAG Pricing & Business Model
## Commercial Packaging, Pricing Logic, Unit Economics & Monetization Roadmap

> **Status:** Master commercial-model specification.
>
> **Dependencies:** `07_MVP_PRODUCT_REQUIREMENTS.md`, `17_AGENT_AND_MCP_TECHNICAL_SPEC.md`, `18_INFRASTRUCTURE_AND_DEPLOYMENT.md`, `20_STARTUP_GTM_AND_CUSTOMER_ACQUISITION.md`
>
> **Purpose:** Define how CognitRAG should monetize the Company Brain while preserving a simple buying experience, healthy gross margins, and an expansion path from pilot → team → company → AI-agent platform.
>
> **Important:** Pricing numbers in this document are starting hypotheses for testing, not established market facts. Actual pricing should be validated through customer willingness-to-pay, infrastructure costs, usage, and sales-cycle feedback.

---

# 1. Business Model Objective

CognitRAG should monetize:

```text
Company context
+
Knowledge infrastructure
+
Governance
+
AI-agent enablement
```

The business model should reward deeper adoption.

Ideal expansion:

```text
Pilot
 ↓
Team
 ↓
Business
 ↓
Enterprise
 ↓
Agent Platform
```

---

# 2. What Customers Are Paying For

Customers are not fundamentally paying for:

```text
tokens
vectors
Neo4j nodes
API calls
```

They are paying for:

```text
Time saved
Faster answers
Better operational context
Reduced repeated work
Knowledge continuity
AI-agent readiness
Governed company context
```

---

# 3. Core Commercial Principle

Price around:

```text
Value created
+
Scale of deployment
+
Infrastructure burden
+
Security requirements
```

Avoid a pricing model that makes successful customers afraid to use the product.

---

# 4. Initial Commercial Model

Recommended early-stage structure:

```text
Paid Pilot
+
Annual Subscription
+
Enterprise Add-ons
```

Avoid making the first several customers fit a complicated self-serve plan.

---

# 5. Paid Pilot

Purpose:

```text
Validate value
Validate willingness to pay
Validate onboarding effort
Validate infrastructure cost
```

Pilot includes:

```text
Selected sources
Limited users
One primary workflow
White-glove onboarding
Evaluation
Support
```

---

# 6. Pilot Pricing Philosophy

The pilot should be:

```text
Meaningfully paid
but
lower friction than a full enterprise contract.
```

Do not optimize for maximum pilot revenue if it prevents learning.

---

# 7. Pilot Scope

Recommended:

```text
1 workflow
1 team
2–4 source systems
limited duration
defined success metric
```

Examples:

```text
Engineering incident context
Support → Engineering investigation
Operational knowledge retrieval
```

---

# 8. Pilot Success Metrics

Agree before starting.

Examples:

```text
time-to-answer
investigation time
repeated questions
escalations
answer adoption
source verification
```

Use measured customer baselines.

---

# 9. Full Subscription

After a successful pilot:

```text
Pilot
 ↓
Annual subscription
```

Commercial transition should be explicit.

---

# 10. Recommended Pricing Structure

A practical future packaging model:

```text
Team
Business
Enterprise
```

with:

```text
Platform fee
+
usage / scale component where appropriate
```

---

# 11. Team Plan

Target:

```text
small engineering / support teams
```

Potential package:

```text
Core Company Brain
Selected integrations
Ask Brain
Knowledge Graph
Basic permissions
Basic support
```

This is a conceptual package.

---

# 12. Business Plan

Target:

```text
Growing companies
Multiple teams
More sources
Governance requirements
```

Potential:

```text
Everything in Team
+
advanced knowledge controls
+
review workflows
+
more integrations
+
advanced permissions
+
higher usage
```

---

# 13. Enterprise Plan

Target:

```text
Larger organizations
Security-sensitive deployments
Complex procurement
```

Potential:

```text
Everything in Business
+
SSO
SCIM
advanced audit
dedicated support
deployment options
custom security requirements
private/dedicated infrastructure
```

Only sell enterprise features once they actually exist.

---

# 14. Agent Platform Monetization

Long-term expansion:

```text
Company Brain
+
Skills
+
Agents
+
MCP
+
Tools
+
Controlled execution
```

Potential commercial dimensions:

```text
active agents
agent execution volume
tool usage
automation workflows
```

Do not charge for future capabilities before they exist.

---

# 15. What Should Be Included in Base Price

Base product should ideally include the core value loop:

```text
Sources
+
Ingestion
+
Knowledge
+
Ask Brain
+
Evidence
+
Graph
+
Basic permissions
```

A customer should not have to purchase five separate modules just to experience the core product.

---

# 16. Potential Usage Dimensions

Possible dimensions:

```text
Number of users
Number of sources
Indexed data volume
AI question volume
Agent executions
```

Pick only the dimensions that are understandable to buyers.

---

# 17. Avoid Token-Based Pricing as the Primary Model

Customers generally do not want to manage:

```text
prompt tokens
embedding tokens
reranker tokens
model-specific units
```

These are your cost drivers.

They should generally remain internal unless usage-based billing is required.

---

# 18. Recommended Commercial Metric

A simple future model could be:

```text
Platform fee
+
workspace size / users
+
high-cost AI usage above included allowance
```

This provides predictable pricing with some protection against extreme usage.

---

# 19. Usage Guardrails

Set internal usage controls for:

```text
chat
ingestion
agents
MCP
```

Do not unexpectedly stop critical workflows without clear communication.

---

# 20. AI Cost Management

Track internally:

```text
LLM generation
LLM routing
LLM graph extraction
Embedding
Reranking
```

These inform pricing.

---

# 21. Gross Margin

The goal is to build toward healthy software gross margins.

Calculate:

```text
Revenue
-
AI cost
-
compute
-
database
-
storage
-
variable infrastructure
=
Gross profit
```

Customer support salaries and general company expenses belong in broader operating economics rather than direct infrastructure cost.

---

# 22. Unit Economics

Track per workspace:

```text
Monthly recurring revenue
AI spend
Database cost
Infrastructure cost
Support cost
```

Then:

```text
Contribution margin
=
Revenue
-
variable costs
```

---

# 23. Workspace Unit Economics

For each customer:

```text
MRR
↓
Variable AI cost
↓
Variable infrastructure
↓
Support
↓
Contribution
```

This reveals whether expansion is economically healthy.

---

# 24. AI Cost Per Answer

Track:

```text
intent-routing cost
contextualization cost
graph-decision cost
reranking cost
generation cost
```

Also track:

```text
cache savings
```

---

# 25. Ingestion Cost

Track:

```text
document parsing
pronoun resolution
graph extraction
embedding
database storage
```

---

# 26. Cost Per Indexed Knowledge Unit

Internal metric:

```text
ingestion cost
/
new indexed source item
```

or:

```text
ingestion cost
/
new indexed chunk
```

Choose one consistent measure.

---

# 27. Cost Per Customer

Track:

```text
initial onboarding cost
+
monthly variable infrastructure
+
support cost
```

This is particularly important for white-glove pilots.

---

# 28. Onboarding Economics

Do not let:

```text
manual connector setup
manual data cleanup
manual permissions
```

make each new customer unprofitable.

Track implementation hours.

---

# 29. Customer Acquisition Cost

CAC:

```text
sales + marketing acquisition cost
/
new customers
```

At very early stage, founder time may not be fully monetized, but the team should still track the effort qualitatively and eventually quantitatively.

---

# 30. Payback

A useful future metric:

```text
CAC
/
monthly gross profit
```

Shorter payback generally increases ability to scale sales.

Do not optimize this metric before there is enough data.

---

# 31. LTV

Potential framework:

```text
Average revenue
×
gross margin
×
expected retention
```

Early-stage LTV assumptions are highly uncertain.

Use real retention data when possible.

---

# 32. Expansion Revenue

Track:

```text
initial contract
+
additional users
+
additional teams
+
additional sources
+
agent platform
```

Expansion can become a major growth mechanism.

---

# 33. Net Revenue Retention

Long-term measure:

```text
Starting recurring revenue
+
expansion
-
contraction
-
churn
/
starting recurring revenue
```

Use once the customer base is large enough to make the metric meaningful.

---

# 34. Pricing Psychology

Avoid:

```text
$9.99
```

style consumer pricing for an enterprise product.

Enterprise buyers care more about:

```text
value
risk
implementation
security
ROI
```

than small psychological price differences.

---

# 35. Pricing Page

Future pricing page should be simple.

Example:

```text
Team
For focused teams

Business
For growing companies

Enterprise
For organizations with advanced security and deployment needs

[ Talk to Sales ]
```

Exact prices should be added only after pricing validation.

---

# 36. Early Pricing Page

Before pricing is validated:

```text
Custom pricing
```

or:

```text
Talk to us about a pilot
```

may be preferable.

Do not publish arbitrary numbers simply to look complete.

---

# 37. Pilot Commercial Conversation

Ask:

```text
What workflow are we solving?
What is it costing you today?
Who uses it?
What would success be worth?
```

Then propose the pilot.

---

# 38. Value-Based Pilot Pricing

If the workflow saves substantial team time or reduces costly escalations, price should reflect:

```text
economic value
```

not just:

```text
number of documents
```

---

# 39. Per-Seat Pricing

Advantages:

```text
Simple
Predictable
Familiar
```

Disadvantages:

```text
May discourage broad adoption
Doesn't fully reflect infrastructure consumption
```

Use carefully.

---

# 40. Usage Pricing

Advantages:

```text
Scales with value/usage
Protects infrastructure economics
```

Disadvantages:

```text
Less predictable
Can create adoption anxiety
```

Potentially useful for:

```text
agent execution
high-volume API
```

---

# 41. Hybrid Pricing

Potential:

```text
Base platform subscription
+
usage above threshold
```

This may be the strongest long-term model if usage costs become meaningful.

---

# 42. Enterprise Pricing

Enterprise pricing can include:

```text
platform
+
deployment
+
support
+
security
+
usage
```

The package should be customized around actual requirements.

---

# 43. Dedicated Deployment Fee

If a customer requires:

```text
dedicated infrastructure
```

additional commercial terms may be justified.

Do not charge "enterprise" fees without corresponding delivered value.

---

# 44. Private Deployment

Long-term monetization can include:

```text
annual platform license
+
deployment
+
support
```

The actual model depends on the deployment architecture.

---

# 45. Professional Services

Potential:

```text
source onboarding
knowledge migration
custom integration
agent implementation
```

Keep professional services from becoming the main business.

The core goal remains software revenue.

---

# 46. Integration Packaging

Do not charge separately for every basic connector if that makes the product difficult to understand.

Potential model:

```text
Core integrations included
Advanced connectors / enterprise integrations as premium
```

Only adopt this after observing customer demand.

---

# 47. Connector Economics

Track:

```text
engineering cost
maintenance cost
provider API costs
support burden
customer value
```

A connector should justify its lifecycle cost.

---

# 48. Agent Economics

Future agent pricing may depend on:

```text
agent count
execution volume
tool actions
automation complexity
```

Do not price agents solely by model tokens.

---

# 49. MCP Economics

MCP may be included in higher-tier plans or enterprise/developer packages depending on its value and support burden.

The core MCP context interface should remain strategically aligned with the broader platform.

---

# 50. API Monetization

Future:

```text
Developer API
```

could be priced by:

```text
requests
context retrieval volume
workspace
agent calls
```

But internal API should not necessarily become a separate product immediately.

---

# 51. Monetization Roadmap

```text
Stage 1
Paid Pilot

Stage 2
Annual Company Brain Subscription

Stage 3
Enterprise Security / Deployment

Stage 4
Agent Platform

Stage 5
API / MCP Platform
```

---

# 52. Pricing Evolution

Early:

```text
custom pilot
```

Then:

```text
simple plans
```

Then:

```text
usage + platform
```

Finally:

```text
enterprise contracts
+
agent platform
```

---

# 53. Do Not Optimize Pricing Too Early

Before enough customers:

```text
Don't spend months designing 10 plans.
```

Instead:

```text
Sell
 ↓
Observe
 ↓
Measure
 ↓
Adjust
```

---

# 54. Pricing Experiments

Test:

```text
pilot price
annual price
platform + usage
per-user
per-workspace
```

Compare:

```text
conversion
sales friction
customer satisfaction
gross margin
expansion
```

---

# 55. Willingness-to-Pay Test

A strong signal is:

```text
customer agrees to pay
```

rather than:

```text
customer says the product is useful
```

---

# 56. Discounting

Early discounts may be appropriate for design partners.

Document:

```text
standard price
discount
reason
duration
renewal price
```

Avoid permanently anchoring the company to unsustainably low pricing.

---

# 57. Design Partner Discount

Potential structure:

```text
Pilot discount
+
clear expiration
+
case-study / feedback agreement where appropriate
```

Do not force customers to provide marketing rights as a condition of discounted pricing unless the agreement explicitly supports it.

---

# 58. Annual Contracts

Once value is proven:

```text
Annual subscription
```

improves:

```text
revenue predictability
customer commitment
expansion planning
```

---

# 59. Multi-Year Contracts

Enterprise customers may prefer:

```text
2–3 year agreements
```

where procurement supports them.

Do not give excessive discounts for long terms without understanding the economics.

---

# 60. Procurement

Expect enterprise procurement to ask:

```text
security
legal
privacy
pricing
SLA
deployment
support
```

Prepare materials as the company matures.

---

# 61. SLA

Do not promise:

```text
99.99%
24/7 support
```

unless the infrastructure and team can actually meet it.

---

# 62. Support Tiers

Potential future:

```text
Standard
Business
Enterprise
```

Differentiated by:

```text
response time
dedicated support
technical contact
```

Only publish commitments the company can fulfill.

---

# 63. Commercial Terms

Eventually standardize:

```text
payment terms
renewal
overage
data deletion
termination
support
security
```

Legal should review contracts.

---

# 64. Cancellation

Define:

```text
data export
data deletion
source disconnection
subscription end
```

Customers should understand what happens to data after termination.

---

# 65. Expansion Pricing

Potential triggers:

```text
additional users
additional teams
more sources
higher usage
agents
private deployment
advanced security
```

Expansion should be clear and predictable.

---

# 66. Land-and-Expand Economics

Example:

```text
Initial:
Engineering team

Expansion:
Support

Expansion:
Operations

Expansion:
Agents

Expansion:
Company-wide
```

Revenue can increase as product value increases.

---

# 67. Customer ROI Review

During renewal:

```text
Usage
+
Measured outcome
+
Expansion
```

show customer value.

---

# 68. Renewal Strategy

Start renewal conversation around:

```text
what changed
what was saved
what workflows expanded
what next workflow should be solved
```

not:

```text
"Your contract expires next month."
```

---

# 69. Pricing Objection — "Too Expensive"

Response framework:

```text
What is the workflow costing today?
What is the frequency?
Who is involved?
What happens when context is missing?
```

Then compare:

```text
current cost
vs
CognitRAG cost
```

Use customer-specific numbers.

---

# 70. Pricing Objection — "We Can Build It"

Response:

> "You can build many of the components internally. The commercial question is whether maintaining ingestion, semantic context, permissions, provenance, evaluation, and an evolving agent interface is a better use of your team's time than using a dedicated platform."

Do not claim the customer cannot build it.

---

# 71. Pricing Objection — "We Already Have AI"

Response:

> "The question is not whether you have an AI model. It is whether your AI has reliable, permission-aware access to the context your company already has."

---

# 72. Pricing Objection — "Usage Will Be Unpredictable"

Potential answer:

> Use predictable base platform pricing with defined usage allowances and clearly communicated overage behavior if a hybrid model is adopted.

Only use this once the commercial model actually supports it.

---

# 73. Financial Dashboard

Track internally:

```text
MRR
ARR
Gross margin
CAC
Pipeline
Conversion
Churn
Expansion
AI cost
Infrastructure cost
```

---

# 74. Revenue Recognition

As the company grows, involve accounting professionals for:

```text
annual contracts
implementation fees
professional services
usage-based billing
```

Do not rely on an informal spreadsheet indefinitely.

---

# 75. Billing Infrastructure

Future technical requirements:

```text
Customer
Plan
Subscription
Invoice
Payment
Usage
Credit / allowance
```

The specific billing provider can be selected later.

---

# 76. Usage Metering

If usage billing is introduced, define exactly what counts.

Examples:

```text
AI question
Agent run
Indexed data
API request
```

Do not meter opaque internal model calls directly.

---

# 77. Overage

If used:

```text
Included allowance
+
clear overage rate
```

The customer should know before incurring material charges.

---

# 78. Usage Alerts

Potential:

```text
70%
90%
100%
```

Notify administrators before hard limits where practical.

---

# 79. Fair-Use Controls

Protect infrastructure against:

```text
runaway agents
abusive APIs
sync loops
automated attacks
```

while preserving normal customer adoption.

---

# 80. Pricing and AI Agents

Agent usage can be significantly more variable than human chat.

Therefore:

```text
base platform
+
agent execution allowance
+
optional usage
```

may be more sustainable than unlimited agent execution.

---

# 81. Agent Enterprise Package

Future package:

```text
Company Brain
+
Agent runtime
+
Skills
+
MCP
+
Tools
+
Audit
```

This can become a higher-value platform tier.

---

# 82. Developer Platform

Long-term:

```text
CognitRAG API
+
MCP
+
SDK
+
Agent tooling
```

can become a developer platform.

---

# 83. API Platform Pricing

Potential:

```text
Free developer tier
Paid API
Enterprise API
```

Only after the developer ecosystem demonstrates demand.

---

# 84. Marketplace Strategy

Future:

```text
Skills marketplace
Connector marketplace
Agent templates
```

Potential monetization:

```text
platform fees
partner revenue
enterprise packages
```

This is a long-term possibility, not an MVP assumption.

---

# 85. Business Model Risk

Major risks:

```text
AI costs grow faster than revenue
Heavy onboarding
Too much custom work
Low willingness to pay
Users don't adopt frequently
Pricing too complex
Agent usage creates unpredictable costs
```

---

# 86. Risk Mitigation

Use:

```text
usage monitoring
design partners
paid pilots
simple pricing
cost controls
repeatable onboarding
```

---

# 87. Commercial Metrics by Stage

## Pre-PMF

```text
Pilot conversion
Willingness to pay
Usage
Customer outcomes
```

## Early PMF

```text
Retention
Expansion
Gross margin
ARR
```

## Scale

```text
CAC
LTV
NRR
Sales efficiency
Gross margin
```

---

# 88. Pricing Validation Process

```text
Interview
 ↓
Offer pilot
 ↓
Observe reaction
 ↓
Close
 ↓
Measure usage
 ↓
Renew / expand
 ↓
Adjust pricing
```

This is stronger evidence than survey-only pricing research.

---

# 89. Commercial Experiment Log

Track:

```text
Customer
Offer
Price
Discount
Contract length
Result
Objection
```

Review periodically.

---

# 90. Pricing Decision Framework

When changing price, evaluate:

```text
Customer value
Customer willingness to pay
Cost to serve
Sales friction
Competitive alternatives
Expansion potential
Gross margin
```

---

# 91. Pricing Page Messaging

Primary:

> **Connect your company. Ask your Company Brain.**

Then:

```text
Team
Business
Enterprise
```

Do not lead with infrastructure pricing.

---

# 92. Commercial Story

The customer journey:

```text
Pay for pilot
 ↓
Prove value
 ↓
Adopt
 ↓
Expand
 ↓
Automate
```

This aligns revenue with delivered value.

---

# 93. Business Model Flywheel

```text
More sources
 ↓
Richer Brain
 ↓
More valuable answers
 ↓
More users
 ↓
More workflows
 ↓
More agents
 ↓
More value
 ↓
Expansion revenue
```

---

# 94. Revenue Expansion Flywheel

```text
Team subscription
       ↓
More users
       ↓
More sources
       ↓
More workflows
       ↓
Knowledge governance
       ↓
Agents
       ↓
Higher-value platform
```

---

# 95. Final Commercial Architecture

```text
                    CUSTOMER
                       │
                       ▼
                 PAID PILOT
                       │
                       ▼
                COMPANY BRAIN
                       │
          ┌────────────┼─────────────┐
          ▼            ▼             ▼
       SOURCES       USERS        WORKFLOWS
          │            │             │
          └────────────┼─────────────┘
                       ▼
                    VALUE
                       │
                       ▼
                  EXPANSION
                       │
            ┌──────────┼───────────┐
            ▼          ▼           ▼
        MORE TEAMS   GOVERNANCE   AGENTS
            │          │           │
            └──────────┼───────────┘
                       ▼
                ENTERPRISE PLATFORM
```

---

# 96. Recommended Initial Pricing Process

Do not finalize public pricing immediately.

Instead:

```text
1. Recruit design partners.
2. Sell paid pilots.
3. Record price objections.
4. Measure infrastructure cost.
5. Measure onboarding effort.
6. Measure customer outcome.
7. Convert pilots to annual contracts.
8. Identify natural expansion units.
9. Publish simple tiers.
```

---

# 97. Initial Commercial Hypothesis

A practical starting hypothesis is:

```text
Pilot
→ fixed project price

Annual
→ platform subscription

Enterprise
→ custom platform + deployment/security

Future agents
→ additional platform/usage tier
```

This should be validated rather than assumed.

---

# 98. Final Pricing Principle

> **Charge for the value of connected company context, not for the underlying complexity of embeddings, graph nodes, or model calls.**

---

# 99. Final Business Model Principle

> **The best CognitRAG business model is one where customers pay more as the Company Brain becomes more deeply embedded in their workflows—not because the pricing formula becomes harder to understand.**

---

# 100. Definition of Done

The commercial model is ready for first real customers when:

```text
[ ] Paid pilot structure exists.
[ ] Pilot scope exists.
[ ] Pilot success metrics exist.
[ ] Commercial owner exists.
[ ] Basic contract exists.
[ ] Pricing hypothesis exists.
[ ] Cost model exists.
[ ] AI cost tracking exists.
[ ] Infrastructure cost tracking exists.
[ ] Customer onboarding cost is tracked.
[ ] Expansion model exists.
[ ] Renewal process exists.
[ ] Security/procurement materials exist.
[ ] Usage measurement exists where required.
[ ] Discount policy exists.
[ ] Pricing experiment log exists.
```

---

# 101. Long-Term Monetization Roadmap

```text
PHASE 1
Paid Design-Partner Pilots

        ↓

PHASE 2
Company Brain Subscription

        ↓

PHASE 3
Enterprise Security / Deployment

        ↓

PHASE 4
Skills + Agent Platform

        ↓

PHASE 5
API + MCP Developer Platform

        ↓

PHASE 6
Agent / Automation Ecosystem
```

---

# 102. Canonical Business Statement

> **CognitRAG monetizes the Company Brain as a software platform: customers begin with a focused workflow, prove value through a paid pilot, expand across sources and teams, and eventually use the same semantic context to power governed AI agents and enterprise automation.**
