# 04 — CognitRAG Premium Design System
## Framer-Style Startup UI + Enterprise Intelligence Product System

> **Design direction:** This is the official CognitRAG visual system for the startup launch. It replaces the earlier conventional enterprise-dashboard direction with a premium, spacious, editorial, product-led interface inspired by the quality and storytelling style of modern Framer/Linear/Vercel-class startup websites—while maintaining a distinct CognitRAG identity.

---

# 1. Design System Goal

CognitRAG is not supposed to look like a generic AI chatbot or an old-style enterprise admin panel.

The interface should communicate:

> **Sophisticated intelligence underneath. Effortless experience above.**

The design needs to work across two connected experiences:

```text
PUBLIC WEBSITE
Premium startup storytelling
        +
PRODUCT APPLICATION
Premium enterprise intelligence workspace
```

Both must feel like the same company.

---

# 2. Official Visual Direction

The selected direction is:

> **Premium Framer-style AI startup aesthetic + enterprise intelligence product UI.**

The visual language should combine:

```text
Editorial Web Design
        +
Modern SaaS
        +
AI Product
        +
Enterprise Trust
        +
Knowledge Graph Visualization
```

The result should feel:

```text
Premium
Clean
Intelligent
Calm
Modern
Technical
Trustworthy
Sophisticated
```

---

# 3. What We Are NOT Building

Do not make CognitRAG look like:

```text
❌ Generic admin dashboard
❌ Generic ChatGPT clone
❌ Cryptocurrency dashboard
❌ Cyberpunk AI interface
❌ Neon futuristic website
❌ Excessive glassmorphism
❌ Excessive gradients
❌ Card-heavy enterprise software
❌ Dense spreadsheet UI
❌ Template-looking SaaS
```

The product should look like a serious, well-funded AI infrastructure startup.

---

# 4. Brand Visual Idea

The central visual concept is:

> **Fragmented company knowledge becoming connected intelligence.**

The visual language should repeatedly show:

```text
Sources
  ↓
Connection
  ↓
Semantic relationships
  ↓
Company Brain
  ↓
Trusted context
  ↓
Humans + AI Agents
```

This becomes the visual identity of CognitRAG.

---

# 5. Primary Color Direction

The primary interface should use:

```text
OFF-WHITE
       +
WHITE
       +
SOFT LAVENDER
       +
INDIGO
       +
VIOLET
       +
NEAR-BLACK
```

The interface should remain predominantly neutral.

Purple/indigo is an accent, not the entire background.

---

# 6. Core Color Tokens

Recommended starting tokens:

```css
:root {
  --bg: #FAFAFC;
  --surface: #FFFFFF;
  --surface-soft: #F7F5FF;

  --text-primary: #11111A;
  --text-secondary: #626274;
  --text-muted: #9292A3;

  --border: #E9E7F0;
  --border-strong: #DCD9E7;

  --primary: #635BFF;
  --primary-hover: #5147E8;

  --violet: #7C3AED;
  --indigo: #4F46E5;

  --success: #16A34A;
  --warning: #D97706;
  --error: #DC2626;
  --info: #2563EB;
}
```

These are starting values, not immutable requirements. Final visual tuning should happen during implementation.

---

# 7. Color Distribution

Approximate visual balance:

```text
White / Off-white
70–80%

Black / Slate text
10–15%

Borders / neutrals
5–10%

Indigo / Violet
3–7%

Status colors
Only where required
```

The goal is a mostly clean canvas with carefully controlled accents.

---

# 8. Primary Brand Accent

The CognitRAG signature accent should be:

> **Indigo-Violet**

Use it for:

- primary CTA
- selected navigation
- Brain elements
- AI indicators
- important links
- active graph nodes
- product highlights
- subtle gradients

Do not use it on every component.

---

# 9. Gradient System

Gradients should be extremely subtle.

Recommended:

```text
White
   ↓
Very soft lavender
   ↓
White
```

or:

```text
Indigo
   ↓
Violet
```

Use gradients for:

- hero backgrounds
- Brain visual
- large feature illustrations
- subtle hover effects
- selected AI surfaces

Avoid:

```text
Full-page neon gradients
Rainbow gradients
Highly saturated backgrounds
```

---

# 10. Typography

Primary:

> **Geist or Inter**

Technical:

> **JetBrains Mono**

Typography is one of the most important parts of the visual identity.

The website should use large, confident headlines.

---

# 11. Marketing Typography

Hero headline:

```text
56–80px desktop
40–52px tablet
36–44px mobile
```

Section headings:

```text
40–56px desktop
32–40px mobile
```

Body:

```text
16–20px
```

The exact size should depend on viewport width and section importance.

---

# 12. Product Typography

The application should be more compact.

```text
Page title
28–36px

Section title
20–24px

Card title
15–18px

Body
14–16px

Metadata
12–13px

Technical
12–14px
```

---

# 13. Typography Personality

Use:

```text
Large headline
Short sentence
Generous spacing
High contrast
Minimal copy
```

Avoid:

```text
Huge paragraphs
All-uppercase body copy
Tiny unreadable metadata
Too many font weights
Decorative fonts
```

---

# 14. Spacing Philosophy

The new design should be significantly more spacious than a traditional dashboard.

Use a 4px base unit:

```text
4
8
12
16
24
32
40
48
64
80
96
120
160
```

Marketing sections may use large vertical spacing.

---

# 15. Website Section Spacing

Typical:

```text
Hero
120–180px vertical breathing room

Major section
96–144px

Feature block
64–96px

Card content
24–32px
```

Whitespace is part of the design.

Do not try to fill every empty area.

---

# 16. Product Spacing

Dashboard spacing should be tighter:

```text
Page padding
24–40px

Card gap
16–24px

Internal card padding
20–28px

Table row
48–60px
```

The application is information-dense, but still visually calm.

---

# 17. Border Radius

Use soft but controlled radius.

```text
Buttons
8–10px

Inputs
10–12px

Cards
14–18px

Large product windows
20–24px

Hero visual
24–32px

Pills
999px
```

Avoid making every component look like a bubble.

---

# 18. Border Style

Primary:

```text
1px solid
very subtle neutral
```

Borders should define structure without becoming visually dominant.

Use stronger borders for:

- active states
- selected states
- focus
- warnings
- security controls

---

# 19. Shadows

Use soft, layered shadows.

Example conceptual style:

```text
0 10px 40px rgba(...)
```

But shadows should remain subtle.

The visual hierarchy should primarily come from:

```text
Spacing
Typography
Surface contrast
Borders
```

not giant shadows.

---

# 20. Background System

Use several layers:

```text
Page Background
#FAFAFC

Surface
#FFFFFF

Soft AI Surface
#F7F5FF

Secondary Surface
Very light neutral

Dark Section
Near-black / deep indigo
```

Dark sections can be used selectively on the marketing site for visual contrast.

---

# 21. Dark Sections on Marketing Website

A dark section can create rhythm.

Example:

```text
LIGHT
Hero

LIGHT
Problem

LIGHT
Product

DARK
AI Agents

LIGHT
Security

DARK
Final CTA
```

Do not make the entire marketing website dark.

---

# 22. Hero Visual Language

The hero should feel like a premium product launch.

Preferred composition:

```text
               COGNITRAG

          COMPANY BRAIN

      Your company already has a brain.
                 Connect it.

          [ Get Early Access ]

                 ↓

     ┌──────────────────────────┐
     │     COMPANY BRAIN        │
     │                          │
     │ Slack ─┐                │
     │ Jira ──┼→ connected     │
     │ GitHub ┤   knowledge    │
     │ Docs ──┘                │
     └──────────────────────────┘
```

The hero should not feel like an ordinary SaaS dashboard screenshot.

---

# 23. Hero Product Mockup

Use a floating product window.

Inside:

```text
Ask Brain

"What changed in billing this week?"

        ↓

Billing deployment changed yesterday.

Evidence
Jira BILL-902
GitHub PR #1287
Slack #engineering

97% High confidence
```

This instantly explains the product.

---

# 24. Hero Product Window Style

Use:

- white surface
- rounded corners
- subtle border
- soft shadow
- slight depth
- small floating source chips
- restrained lavender glow

The product window should appear to float naturally over the page.

---

# 25. Source Visual Language

Connected tools should appear as small floating nodes:

```text
Slack
Jira
GitHub
Notion
Google Drive
Salesforce
```

Each can connect toward the Brain.

The lines should be thin and subtle.

---

# 26. Company Brain Visual

Do not use a literal 3D human brain as the primary logo.

Instead use:

```text
Connected semantic nodes
+
Central intelligence point
```

Possible structure:

```text
        ○
       /
  ○───●───○
       \
        ○
```

The center can subtly use the CognitRAG indigo-violet accent.

---

# 27. Logo Direction

Preferred:

### Concept A

A stylized "C" made from connected nodes.

### Concept B

A minimal semantic network.

### Concept C

A geometric Brain symbol.

### Concept D

C + connected graph.

The logo must work at:

```text
16px favicon
24px navbar
32px app sidebar
64px presentation
```

---

# 28. Navigation — Marketing Site

The navbar should be minimal.

Example:

```text
✦ CognitRAG

Product
Solutions
Resources
Pricing
Company

Sign in

[ Book a Demo ]
```

The header should not contain 15 links.

---

# 29. Marketing Navbar Style

At top:

```text
Transparent / subtle
```

After scroll:

```text
White
+
slight blur
+
subtle border
```

The navbar can have a rounded floating container if visually appropriate, but avoid making it look like a UI widget pasted onto the page.

---

# 30. Marketing CTA

Primary:

```text
[ Book a Demo ]
```

or early-stage:

```text
[ Get Early Access ]
```

The primary button should use CognitRAG indigo-violet.

---

# 31. CTA Style

Primary button:

```text
Indigo/Violet background
White text
8–10px radius
```

Hover:

```text
Slight darkening
Tiny upward / scale interaction
```

Do not create excessive glowing buttons.

---

# 32. Secondary CTA

Use:

```text
[ See How It Works → ]
```

Style:

```text
White / transparent
Dark text
Subtle border
```

---

# 33. Editorial Layout

Marketing pages should use alternating layouts.

Example:

```text
TEXT                    VISUAL
────                    ──────
Headline               Product UI
Description            Graph

VISUAL                  TEXT
──────                  ────
Knowledge              Living SOP

TEXT                    VISUAL
────                    ──────
AI Agents              Agent Playground
```

This creates visual rhythm.

---

# 34. Full-Width Product Sections

Occasionally use a large centered product window:

```text
          ASK BRAIN

    ┌───────────────────────────┐
    │                           │
    │      Product UI           │
    │                           │
    └───────────────────────────┘
```

This is more powerful than several small screenshots.

---

# 35. Feature Card System

Do not create a grid of 12 tiny feature cards.

Instead use:

```text
Large Feature
+
Short explanation
+
Visual
+
Optional small supporting features
```

One section should communicate one idea.

---

# 36. Bento Layout

Bento layouts can be used selectively.

Example:

```text
┌──────────────────────┬──────────────┐
│                      │              │
│   Ask Brain          │ Knowledge    │
│   large visual       │ Graph        │
│                      │              │
├───────────────┬──────┴──────────────┤
│ Integrations  │ AI Agents           │
│               │                     │
└───────────────┴─────────────────────┘
```

Do not make every section a bento grid.

---

# 37. Product Dashboard Style

The application should retain enterprise functionality while visually following the new design language.

Target:

> **Linear-like information quality + premium AI product aesthetics.**

The dashboard should have:

- clean sidebar
- generous content area
- subtle cards
- strong typography
- minimal borders
- indigo AI accents
- graph visualization
- source evidence
- excellent whitespace

---

# 38. Dashboard Layout

Recommended:

```text
┌─────────────────────────────────────────────────────┐
│ CognitRAG       Search...                  Bell User │
├─────────────┬───────────────────────────────────────┤
│             │                                       │
│ Navigation  │ Main Content                          │
│             │                                       │
│             │                                       │
└─────────────┴───────────────────────────────────────┘
```

The sidebar should be visually quiet.

---

# 39. Sidebar Design

The sidebar should NOT dominate the screen.

Use:

```text
CognitRAG

Home
Ask Brain

Knowledge
  Graph
  Dictionary
  SOPs
  Decisions

AI
  Agents
  Playground
  MCP

Data
  Integrations
  Activity

Security
  Access
  Audit

Settings
```

Icons should be subtle.

---

# 40. Sidebar Active State

Use:

```text
soft lavender background
+
indigo icon
+
dark text
```

Example:

```text
┌────────────────────────┐
│  ◉  Ask Brain          │
└────────────────────────┘
```

No thick colored bars.

---

# 41. Dashboard Header

Example:

```text
Good morning, Nitesh.

Here's what's happening in your company brain.

                         [ + Ask Brain ]
```

Below:

```text
Search your company...
```

The exact greeting should come from the current user profile.

---

# 42. Ask Brain Design

Ask Brain is the emotional center of the product.

It should feel:

```text
Calm
Large
Focused
Conversational
Evidence-driven
```

Do not make it look like a generic ChatGPT screen.

---

# 43. Ask Brain Empty State

```text
              Ask your company anything.

      What changed in billing this week?

        ┌─────────────────────────────┐
        │ Ask your company...         │
        │                         ↑   │
        └─────────────────────────────┘

        Suggested
        ┌────────────┐ ┌────────────┐
        │ Decisions  │ │ Changes    │
        └────────────┘ └────────────┘
```

---

# 44. Ask Brain Answer

Answer hierarchy:

```text
Main Answer
     ↓
Important context
     ↓
Evidence
     ↓
Confidence
     ↓
Related knowledge
```

Example:

```text
Billing deployment changed yesterday.

A migration pre-check was added before
production deployment after INC-902.

Evidence
[Jira BILL-902] [GitHub PR #1287] [Slack]

97% High confidence
Updated 4 hours ago
```

---

# 45. Answer Surface

Use a large white/soft surface.

Do not surround every paragraph with a card.

Use:

```text
one main answer surface
+
small evidence chips
+
metadata
```

---

# 46. Source Chips

Example:

```text
[Jira BILL-902]
[GitHub PR #1287]
[Slack #engineering]
```

Chips:

- compact
- white/soft surface
- thin border
- source icon
- hover state

---

# 47. Confidence Component

Example:

```text
● 97% High confidence
```

Click:

```text
Why this confidence?

✓ Multiple supporting sources
✓ Recent information
✓ Semantic relationship match
✓ No major source conflict
```

Do not represent an uncalibrated score as mathematical certainty.

---

# 48. Knowledge Graph Design

The graph should be elegant and restrained.

Use:

```text
Thin lines
Small nodes
Readable labels
Soft glow only on selected nodes
Minimal animation
```

Example:

```text
            Incident
             /   \
            /     \
      Billing ─── GitHub
         |
         |
       SOP
```

---

# 49. Graph Background

Use:

```text
White
or
very light lavender
```

Avoid black graph backgrounds unless inside a deliberately dark section.

---

# 50. Graph Selected State

Selected node:

```text
Indigo border
Soft violet glow
Readable label
```

Unselected:

```text
Muted neutral / category accent
```

---

# 51. Graph Detail Panel

When a node is selected:

```text
Billing Service

Application

Owner
Engineering Platform

Relationships
Payment API
Incident INC-902
Billing SOP

[ Ask Brain ]
[ Open Sources ]
```

The graph and entity panel should work together.

---

# 52. Semantic Dictionary Design

Use an editorial knowledge-library style.

Example:

```text
Semantic Dictionary

Company terminology, definitions and rules.

Search definitions...

Churn Risk
Customer Success
v3

Critical Incident
Engineering
v4

Active Customer
Sales
v2
```

---

# 53. Dictionary Detail

```text
Churn Risk

Definition

A customer is considered at churn risk when...

Owner
Customer Success

Version
3

Used by
12 workflows
7 skills

History
...
```

This should feel like a controlled knowledge system, not a database table.

---

# 54. Living Knowledge UI

This should be visually distinctive.

Example:

```text
Billing Deployment SOP

CURRENT v3.2

────────────────────────

NEW

Migration pre-check added

Why
Incident INC-902

Sources
Jira
GitHub
Slack

[ View Change ]
```

---

# 55. Version History

Use a clean timeline:

```text
v3.2    Aug 26
        Migration pre-check added

v3.1    Aug 18
        Rollback updated

v3.0    Aug 02
        Manual deployment removed
```

---

# 56. Activity Design

Activity should feel like a live company feed.

```text
Brain Activity

Today

09:42
New decision detected

08:51
Billing SOP updated

08:12
GitHub knowledge synchronized

Yesterday
New relationship discovered
```

---

# 57. Activity Visual Language

Use small icons and thin timeline connectors.

Avoid large cards for every event.

---

# 58. Integrations Design

Integration cards should be polished but simple.

Example:

```text
┌──────────────────────────────────────┐
│ Slack                                │
│ Communication                        │
│                                      │
│ ✓ Connected                          │
│ 24,532 items                         │
│ Last sync 2 minutes ago              │
│                                      │
│ Configure →                          │
└──────────────────────────────────────┘
```

---

# 59. Integration Page Layout

Use categories:

```text
Communication
Engineering
Knowledge
CRM
Support
```

Then show integrations.

---

# 60. Sync Visualization

During indexing:

```text
Slack

Syncing...

██████████████████░░  84%

21,442 / 25,532 items
```

Keep the progress visual clean.

---

# 61. Security UI

Security should feel serious and quiet.

Use:

```text
White
Deep slate
Subtle green
Minimal red
```

Avoid flashy security graphics.

---

# 62. Security Dashboard

Example:

```text
Security

Your Company Brain is protected by:

✓ Role-based access
✓ Source permissions
✓ Database-level controls
✓ Audit logging

Security status
Healthy
```

Only show controls actually implemented.

---

# 63. Permission Matrix

Use a clean table:

```text
                 Eng   Support   HR   Finance

Slack #eng       ✓       ×       ×      ×
Jira             ✓       ✓       ×      ×
HR Docs          ×       ×       ✓      ×
Finance          ×       ×       ×      ✓
```

This is an important enterprise UI.

---

# 64. Audit Log

Use:

```text
Timestamp
User
Action
Resource
Result
```

Example:

```text
09:42
Admin
Approved semantic rule
Refund Policy
Success
```

---

# 65. AI Agent UI

Agents should feel like products inside the Company Brain.

Agent card:

```text
Customer Support Agent

● Active

Skills
Refund Handling
Customer Lookup

Context
Customer
Policies
Incidents

[ Open ]
```

---

# 66. Agent Playground

Use a two/three-column layout:

```text
┌──────────────┬───────────────────────┬──────────────┐
│ Agent        │ Execution             │ Context      │
│              │                       │              │
│ Support      │ User request          │ Sources      │
│ Agent        │                       │ Policies     │
│              │ Tool calls            │ Rules        │
│ Skills       │                       │ Entities     │
│              │ Final response        │              │
└──────────────┴───────────────────────┴──────────────┘
```

This is the technical interface.

---

# 67. MCP UI

Developer-facing but still premium.

```text
MCP

● Connected

Available context

Knowledge
Rules
Skills
Entities

Connected agents
3

[ Developer Documentation ]
```

---

# 68. Developer Debug Mode

Optional advanced view:

```text
Retrieved Sources
Graph Paths
Latency
Tool Calls
Model Stages
Permissions
```

Do not expose this by default to normal users.

---

# 69. Modal Style

Modals should feel lightweight.

Use:

```text
White
Rounded 16px
Subtle shadow
Strong title
Short explanation
Clear CTA
```

---

# 70. Drawer Style

Use drawers for:

- entity details
- source receipts
- activity
- permissions
- previews

This keeps the user in context.

---

# 71. Source Receipt Design

Signature CognitRAG component:

```text
SOURCE RECEIPT

Jira BILL-902

Updated
Aug 26

Related
Billing Service

Why this matters
Contains the decision that introduced
the migration pre-check.

[ Open Source ]
```

This should look premium enough to become a recognizable product pattern.

---

# 72. Notifications

Notification panel:

```text
3 updates

New rule requires review
Billing SOP changed
GitHub sync completed
```

Each item should explain:

```text
What happened
Why it matters
What action is available
```

---

# 73. Toasts

Use minimal toasts:

```text
✓ Connected to Slack
```

```text
✓ Rule approved
```

Do not use giant notification banners for routine actions.

---

# 74. Search

Search should feel like a command interface.

```text
⌕ Search your company...

Ask Brain
Knowledge
People
Decisions
SOPs
Entities
```

Keyboard:

```text
⌘ K
```

or:

```text
Ctrl K
```

---

# 75. Search Results

Results should have type:

```text
Billing Deployment SOP
SOP

BILL-902
Decision

Billing Service
Entity
```

Optional metadata:

```text
Updated
Owner
Source
```

---

# 76. Empty States

Empty states should be elegant.

Example:

```text
No knowledge yet.

Connect your first source to start
building your Company Brain.

[ Connect a Source ]
```

Use a subtle illustration, not a giant empty icon.

---

# 77. Loading States

Prefer skeletons for content.

For Brain:

```text
Retrieving company context...
```

Then:

```text
Synthesizing answer...
```

Only show processing stages that correspond to actual product behavior.

---

# 78. Error States

Example:

```text
Something went wrong.

We couldn't complete the synchronization.

Your existing indexed knowledge is unchanged.

[ Retry ]
[ View Integration ]
```

Never expose raw stack traces.

---

# 79. Insufficient Evidence

This is a core trust state.

```text
Not enough reliable evidence.

I found related information, but the
available sources do not support a
confident answer.

[ View Sources ]

Try:
"How is billing deployed today?"
```

This is better than hallucinating.

---

# 80. Conflict State

Example:

```text
Conflicting knowledge

Two sources describe different
billing deployment processes.

Aug 20
Merge → Deploy

Aug 26
Merge → Migration Check → Deploy

[ Compare Sources ]
```

Use amber.

---

# 81. Permission State

Example:

```text
Some relevant information is restricted.

You do not have permission to view
the underlying content.

No restricted content has been displayed.

[ Review Access ]
```

Never leak sensitive information.

---

# 82. Status Language

Use:

```text
Connected
Syncing
Healthy
Verified
Needs Review
Stale
Conflicting
Blocked
Unavailable
```

Avoid vague statuses like:

```text
Working
Okay
Done
```

where more precise language exists.

---

# 83. Product Motion

Animation should communicate system behavior.

Primary motion types:

```text
Data Flow
Graph Connection
Knowledge Update
Answer Reveal
Agent Execution
```

---

# 84. Motion Style

Motion should feel:

```text
Smooth
Subtle
Fast
Elegant
```

No:

```text
Spinning brains
Constant particles
Huge zoom effects
Excessive bouncing
```

---

# 85. Hover Behavior

Hover should create small changes:

```text
Background shift
Border emphasis
Tiny elevation
Icon movement
```

Avoid dramatic scaling.

---

# 86. Scroll Animations

Marketing page can use:

```text
Fade
Translate
Parallax
Graph connection
Product window reveal
```

But content must remain usable with animation disabled.

---

# 87. Reduced Motion

Respect:

```text
prefers-reduced-motion
```

When enabled:

```text
Disable decorative transitions
Keep essential state changes
Avoid graph animation
```

---

# 88. Dark Mode

Dark mode is optional but should use the same visual identity.

Direction:

```text
Deep near-black
+
dark indigo
+
white text
+
muted slate
+
violet accents
```

Do not make dark mode neon.

---

# 89. Dark Mode Product

Example:

```text
Background
#0A0A0F

Surface
#111118

Surface Soft
#171522

Text
#F7F7FA

Muted
#9A9AAA

Border
#252532

Primary
Indigo/Violet
```

Exact values should be tuned during implementation.

---

# 90. Mobile Design Philosophy

Mobile is not a smaller desktop.

It is a prioritized experience.

Primary mobile actions:

```text
Ask Brain
Search
Notifications
Recent Changes
Approvals
```

---

# 91. Mobile Marketing

Hero should become:

```text
Your company
already has a brain.

Connect it.

[ Get Early Access ]

       ↓

Product visual
```

Do not put the full dashboard beside the hero copy on mobile.

Stack it vertically.

---

# 92. Mobile Dashboard

Use:

```text
Header
↓
Ask Brain
↓
Important metrics
↓
Recent changes
↓
Knowledge
↓
Integrations
```

Graph becomes a simplified preview.

---

# 93. Accessibility

Required:

```text
Keyboard navigation
Visible focus
Semantic HTML
Accessible labels
Readable contrast
Reduced motion
Screen-reader-friendly status
```

Critical state must never depend only on color.

---

# 94. Icon System

Use:

> Lucide React

Icons should be:

- thin
- consistent
- minimal
- recognizable

Use icon + text for ambiguous actions.

---

# 95. Illustration System

CognitRAG illustrations should use:

```text
Nodes
Connections
Documents
Source icons
AI agents
Semantic relationships
Data streams
```

Avoid generic AI robot illustrations.

---

# 96. Product Mockup Style

Marketing product windows should have:

```text
Large radius
Subtle border
Soft shadow
White surface
Realistic content
Minimal browser chrome
```

They should feel like actual product screenshots, not wireframes.

---

# 97. Browser Window

Optional:

```text
● ● ●
CognitRAG
```

Keep browser chrome subtle.

Do not overdo fake macOS windows.

---

# 98. Design Rhythm

A strong landing page should alternate:

```text
Text
Visual
Text
Visual
Full-width product
Text
Visual
Dark section
Light section
```

This prevents visual fatigue.

---

# 99. Marketing Section Formula

Every major section should contain:

```text
Eyebrow
↓
Headline
↓
1–2 sentence explanation
↓
Visual
↓
Optional CTA
```

Do not write long marketing paragraphs.

---

# 100. Section Eyebrows

Use small uppercase/monospace labels sparingly:

```text
THE PROBLEM
THE COMPANY BRAIN
HOW IT WORKS
ASK BRAIN
LIVING KNOWLEDGE
AI AGENTS
SECURITY
```

They should provide hierarchy.

---

# 101. Product Screenshot Formula

Each screenshot should demonstrate exactly one idea.

Examples:

```text
Ask Brain
→ Answer + evidence

Knowledge Graph
→ Relationships

Living Knowledge
→ Change + version

Agent Playground
→ Context + execution

Security
→ Permissions
```

---

# 102. Bento Grid Rules

Bento is allowed when:

```text
Cards have different importance
Visual hierarchy is obvious
Whitespace remains
```

Do not create:

```text
12 identical cards
```

That immediately looks like a template.

---

# 103. Data Visualization

Charts should be minimal.

Use only when they answer a useful question:

```text
Knowledge freshness
Usage
Activity
Confidence trends
Integration health
```

Avoid decorative charts.

---

# 104. Graph as Brand Motif

The semantic graph should appear subtly throughout the website:

```text
Hero
→ connected nodes

Problem
→ fragmented nodes

Solution
→ connected graph

Product
→ real graph

AI Agent
→ context network
```

This creates visual consistency.

---

# 105. The Brain Visual Transformation

One important recurring animation:

```text
Disconnected
○     ○
   ○
      ○

        ↓

Connected

○───○───○
 \  │  /
   \│/
    ●
```

The center represents CognitRAG.

---

# 106. Source-to-Brain Animation

```text
Slack ─┐
Jira ──┤
GitHub ┤
Docs ──┤
       ↓
   CONNECT
       ↓
    BRAIN
       ↓
   CONTEXT
```

This should be one of the hero's main animations.

---

# 107. Knowledge Update Animation

```text
Old SOP
   ↓
New evidence
   ↓
Change detected
   ↓
Review
   ↓
Updated SOP
```

This communicates "living knowledge."

---

# 108. Agent Context Animation

```text
Agent
  ↓
Question
  ↓
Company Brain
  ↓
Policy + Knowledge + Skill
  ↓
Verified context
  ↓
Action
```

This communicates the long-term product vision.

---

# 109. Component Architecture

Recommended:

```text
components/
│
├── ui/
│   ├── Button
│   ├── Input
│   ├── Card
│   ├── Badge
│   ├── Modal
│   ├── Drawer
│   ├── Tooltip
│   └── Tabs
│
├── marketing/
│   ├── Navbar
│   ├── Hero
│   ├── BrainVisual
│   ├── ProductWindow
│   ├── FeatureSection
│   ├── IntegrationStrip
│   ├── CTA
│   └── Footer
│
├── brain/
│   ├── AskBrain
│   ├── Answer
│   ├── SourceReceipt
│   ├── Confidence
│   └── SuggestedQueries
│
├── knowledge/
│   ├── Graph
│   ├── Entity
│   ├── Dictionary
│   ├── SOP
│   ├── Decision
│   └── Skill
│
├── integrations/
│   ├── IntegrationCard
│   ├── SyncStatus
│   └── ConnectorSetup
│
├── agents/
│   ├── AgentCard
│   ├── Playground
│   ├── ExecutionTimeline
│   └── MCP
│
└── security/
    ├── SecurityCard
    ├── PermissionMatrix
    └── AuditLog
```

---

# 110. Design Token Architecture

Organize:

```text
tokens/
├── colors
├── typography
├── spacing
├── radius
├── shadows
├── motion
└── breakpoints
```

Components consume tokens.

Do not hardcode visual values repeatedly.

---

# 111. Frontend Stack Compatibility

This system is compatible with the existing direction:

```text
Next.js
React
JavaScript / JSX
CSS variables
Lucide React
Clerk
SSE
```

Do not replace the frontend stack simply to achieve this aesthetic.

---

# 112. Marketing Page Component Architecture

Recommended:

```text
app/
├── page.js
├── product/
├── solutions/
├── security/
├── developers/
├── pricing/
└── contact/

components/
└── marketing/
    ├── Navbar
    ├── Hero
    ├── Problem
    ├── CompanyBrain
    ├── HowItWorks
    ├── AskBrainDemo
    ├── LivingKnowledge
    ├── KnowledgeGraph
    ├── Agents
    ├── Security
    ├── Integrations
    ├── Pricing
    ├── FAQ
    └── FinalCTA
```

---

# 113. Application Layout Architecture

Recommended:

```text
app/
├── dashboard/
├── ask/
├── knowledge/
├── graph/
├── dictionary/
├── sops/
├── decisions/
├── agents/
├── playground/
├── mcp/
├── integrations/
├── activity/
├── security/
└── settings/
```

---

# 114. Design System Priority

Build in this order:

## Phase 1 — Foundation

```text
Colors
Typography
Spacing
Radius
Shadows
Motion
```

## Phase 2 — Core UI

```text
Button
Input
Card
Badge
Tabs
Modal
Drawer
Tooltip
```

## Phase 3 — Product Identity

```text
Ask Brain
Answer
Source Receipt
Confidence
Graph
```

## Phase 4 — Platform

```text
Integrations
Knowledge
SOP
Dictionary
Agents
Security
```

## Phase 5 — Marketing

```text
Hero
Product Windows
Brain Visual
Feature Sections
CTA
```

---

# 115. Design QA

Before approving any screen:

```text
[ ] Does it feel premium?
[ ] Is the primary action obvious?
[ ] Is there enough whitespace?
[ ] Are accents restrained?
[ ] Is typography strong?
[ ] Are borders subtle?
[ ] Is the visual hierarchy obvious?
[ ] Does it feel like CognitRAG?
[ ] Does it work on mobile?
[ ] Does it work in dark mode?
[ ] Are loading states defined?
[ ] Are error states defined?
[ ] Are empty states defined?
[ ] Is accessibility considered?
```

---

# 116. Startup-Level Quality Test

Ask someone unfamiliar with the product to look at the website.

They should say:

> "This looks like a serious AI company."

Then:

> "I understand what the product does."

Then:

> "I can see the actual product."

Then:

> "I understand why I should trust it."

Then:

> "I know what to do next."

---

# 117. The Most Important Visual Rule

Do not let the website become a collection of beautiful sections with no product.

The hierarchy must remain:

```text
BRAND
  ↓
PROBLEM
  ↓
PRODUCT
  ↓
PRODUCT PROOF
  ↓
TRUST
  ↓
ACTION
```

---

# 118. The Most Important Product Rule

Do not let the dashboard become visually beautiful but functionally confusing.

Every screen needs:

```text
Purpose
Primary Action
Context
Feedback
```

---

# 119. The CognitRAG Signature

The following combination should make the interface recognizable:

```text
Large editorial typography
+
Off-white canvas
+
Subtle lavender surfaces
+
Indigo-violet accents
+
Connected semantic nodes
+
Minimal borders
+
Soft depth
+
Premium product windows
+
Evidence chips
+
Calm enterprise UI
```

---

# 120. Final Visual Identity

The official CognitRAG visual identity is:

> **A bright, premium, editorial AI interface built around off-white surfaces, subtle lavender depth, indigo-violet intelligence accents, strong typography, connected semantic visuals, and highly polished product interfaces.**

---

# 121. Final Design Philosophy

CognitRAG should look like:

> **A company that understands the future of AI infrastructure, but doesn't need to shout about it.**

The interface should communicate confidence through:

```text
Design quality
+
Product clarity
+
Evidence
+
Transparency
+
Restraint
```

not through excessive visual effects.

---

# 122. Canonical Design Statement

> **CognitRAG combines the visual sophistication of a premium modern AI startup with the clarity and control required by enterprise software. Its interface is spacious, editorial, and product-led on the surface, while exposing deeper semantic relationships, evidence, permissions, knowledge, and agent context when users need them.**

---

# 123. This Design System Is Now the Source of Truth

From this point forward:

```text
03_LANDING_PAGE_SPECIFICATION.md
        ↓
04_DESIGN_SYSTEM.md
        ↓
05_COMPLETE_UI_UX_SPECIFICATION.md
        ↓
06_USER_FLOWS.md
        ↓
07_MVP_PRODUCT_REQUIREMENTS.md
```

All future UI specifications must follow this visual system.

The previous conventional dashboard direction should no longer be treated as the primary visual direction.

---

# 124. Final Product Feeling

When a user opens CognitRAG, the intended reaction is:

> **"This feels premium."**

After using it:

> **"This is actually powerful."**

After inspecting an answer:

> **"I can see why it knows this."**

After connecting systems:

> **"It understands our company."**

After using an agent:

> **"Now my AI actually has our company's context."**

That is the design target.
