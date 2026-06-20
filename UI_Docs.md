# UI Documentation

This document outlines the core User Interface (UI) components and pages developed for the CognitRAG.ai platform. The frontend is built using **React** and **Vite**, utilizing custom CSS styling for a glassmorphism aesthetic.

## Core Pages

### 1. Home Dashboard (`HomeDashboard.jsx`)
The main landing page providing a high-level overview of the entire system's health and intelligence metrics.
- **Key Metrics Panel**: Displays real-time counts for Total Documents, Vector DB Health, Graph Connections (Neo4j), and Verified Memories.
- **Recent Intelligence**: A list of recently uploaded and processed knowledge documents.
- **Active Policies**: Renders a preview of the workspace's active preference memory (e.g., specific formatting rules the AI has learned).

### 2. AI Playground (`AIPlayground.jsx`)
The primary chat interface where users interact with the RAG assistant.
- **Conversational UI**: A sleek, real-time chat window.
- **Short-term RAM**: Holds the active session messages locally before the backend distills them into rolling summaries.
- **Trigger Point**: Sending messages here triggers the background fact extraction (Semantic Memory) and policy extraction (Preference Memory) pipelines.

### 3. Memory Hub (`MemoryHub.jsx`)
The central administration dashboard for monitoring the "Four Pillars of Workspace Memory."
- **Living Truth (Semantic Memory)**: Displays hard facts extracted from the AI Playground and stored in the `user_facts` Supabase table.
- **Active Policies (Preference Memory)**: Displays learned behavioral formatting rules stored in the `preference_memory` table.
- **Active Context (Session Memory)**: Displays the current, live "Rolling Summary" of the AI Playground chat session, fetching directly from the `episodic_memory` table.
- **Timeline (Episodic Memory)**: Displays a chronological history of past rolling summaries, showing the evolutionary timeline of the workspace context.

### 4. Graph Explorer (`GraphExplorer.jsx`)
An interactive visualization engine mapping the conceptual relationships stored in the Neo4j database.
- **Engine**: Powered by `react-force-graph-3d`.
- **Aesthetic**: Styled as a highly visible, analytical 2D network against a pure white background (`#ffffff`).
- **Nodes**: Deep solid blue orbs representing Documents, Entities, and Users.
- **Edges**: Thick (width `5`), solid green directional arrows representing the relationships (e.g., `REQUIRES`, `AFFECTS`) between nodes.
- **Legend**: A frosted-glass legend block in the top-left corner dynamically explaining the node color groupings.

## Layout Components

### 5. Sidebar Navigation (`Sidebar.jsx`)
The persistent left-hand navigation pane.
- **Routing**: Contains React Router `NavLink` elements pointing to the Home, AI Playground, Memory Hub, and Graph Explorer.
- **User Authentication**: Integrates with Clerk to display the user's profile and authentication status at the bottom.

## Design System & Aesthetics
- **CSS Framework**: Custom Vanilla CSS (`index.css`).
- **Theme**: Dark mode by default (except for the Graph Explorer, which uses a high-contrast white analytical view).
- **Glassmorphism**: Panels utilize semi-transparent backgrounds with subtle borders and backdrops to create depth.
- **Color Palette**: Highlights use primary brand colors (Deep Blue, Purple, Emerald Green).
