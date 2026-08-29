# CognitRAG: UI & Frontend Architecture

This document outlines the detailed structure, design system, and key components of the CognitRAG "Company Brain" frontend application.

## 1. Tech Stack & Styling
- **Framework**: Next.js 14 (App Router).
- **Language**: JavaScript / JSX.
- **Authentication**: Clerk (with forced redirects to `/home` upon successful sign-in).
- **Styling**: Pure CSS using CSS variables in `globals.css` for a lightweight, highly maintainable design system.
- **Icons**: `lucide-react`.
- **Aesthetic**: Premium, minimalist, "white combination" SaaS design (inspired by modern platforms like Parley).

## 2. Core Pages & Layouts

### A. The Landing Page (`app/page.js`)
The landing page serves as an enterprise SaaS marketing funnel designed to sell the "Company Brain" vision.
- **Hero Section**: Features a 50/50 split layout. Left-aligned copywriting (*"Make every employee as informed as your most knowledgeable person"*) paired with a custom isometric illustration of a semantic knowledge graph.
- **The Problem Section**: A dedicated section highlighting "Knowledge Fragmentation," paired with a custom illustration of scattered, chaotic documents and chat threads.
- **The Core Features (Knowledge Lifecycle)**: A clean grid displaying the 5 pillars of the platform:
  1. Knowledge Ingestion
  2. Semantic Graph
  3. Intelligent Query
  4. Proactive Surfacing
  5. Access Control & Privacy
- **Benchmarks**: A section displaying RAGAS evaluation metrics (100% Faithfulness, 80% Context Accuracy).
- **Pricing**: Standard SaaS pricing tiers (Pro at $49/mo, and Custom Enterprise).

### B. Dashboard Shell (`app/components/layout/SidebarNavigation.js`)
The internal dashboard features a persistent, responsive sidebar navigation menu granting access to the core modules:
- Home / Dashboard
- Integrations
- Knowledge Vault
- Semantic Dictionary
- Graph Explorer
- AI Playground

### C. Integrations Hub (`app/(dashboard)/integrations/page.js`)
Specifically built for **Demo Step 1 (Ingestion)**.
- **UI Components**: Displays a grid of enterprise data connectors (Google Workspace, Slack, Jira, Salesforce, Notion, GitHub).
- **Interactivity**: Mocks the ingestion workflow. Clicking "Connect" on a disconnected service triggers a simulated 4-second "Syncing..." loading state before officially turning green and displaying "Connected".

### D. AI Playground / Chat (`app/components/Chat.jsx`)
The core interface where employees interact with the Company Brain. Built for **Demo Steps 2 & 3**.
- **Empty State**: Features a highly professional, grid-based "Suggested Queries" section.
- **Demo Queries**: Clicking a suggestion instantly populates the chat input. The suggestions map directly to enterprise use cases:
  1. *Decision Rationale*: "Why did we decide to use technology X?"
  2. *Aggregated Context*: "What do we know about customer Y from Salesforce & Slack?"
  3. *Expert Identification*: "Who knows about subject Z?"
  4. *Temporal Queries*: "What changed recently in area W?"
- **Backend Communication**: Uses Server-Sent Events (SSE) to stream tokens in real-time from the FastAPI backend (`/api/v1/chat/stream`), providing a responsive, ChatGPT-like experience.

## 3. Environment & Configuration
- **Environment Variables**: `.env.local` contains Google API keys and Clerk authentication keys.
- **Redirect Logic**: The frontend strictly enforces redirects (`forceRedirectUrl="/home"`) ensuring authenticated users cannot bypass the dashboard flow.

## 4. Asset Management
- **Static Assets**: Custom illustrations (Hero Graph, Problem Fragmentation) are served directly from the `public/` directory (`/hero_image.jpg`, `/problem_image.jpg`).
