# CognitRAG — The Autonomous Company Brain 🧠

> **CognitRAG** turns fragmented workplace knowledge across Google Drive, GitHub, Notion, Slack, and Jira into verified, hallucination-free context for teams and AI agents.

Powered by **True Hybrid Search (GraphRAG + Corrective Retrieval)**, **Neo4j 3D Knowledge Graph**, **NVIDIA NIM & Gemini 2.5/3.7 Models**, and bidirectional **Model Context Protocol (MCP)**.

---

## 🌟 Key Capabilities

- 🔍 **True Hybrid Retrieval (GraphRAG + Vector Search):** Fuses structured entity relationships in **Neo4j** with high-dimension embeddings in **Supabase pgvector** (HNSW) and BM25 full-text search.
- 🤖 **Corrective RAG (CRAG) & Agentic Routing:** LangGraph workflow automatically classifies intent, evaluates document relevance with strict rerankers, and triggers query rewrites when confidence is low.
- 🔌 **Enterprise OAuth Connectors:** Native asynchronous crawlers for **Google Drive**, **GitHub**, **Notion**, **Slack**, and **Jira** with real-time job status tracking.
- 🕸️ **Interactive 3D Graph Explorer:** Real-time WebGL visualization of your company's entity relationships, documents, concepts, and fact nodes.
- ⚡ **Bidirectional Model Context Protocol (MCP):** Exposes search, semantic jargon definitions, audit trails, and write/ingest capabilities to external AI IDEs (**Cursor**, **Windsurf**, **Claude Desktop**).
- 🛡️ **Mathematical Tenant Isolation:** Clerk-authenticated sessions enforce strict PostgreSQL Row-Level Security (RLS) and Neo4j tenant boundaries.
- 📊 **Audited with LLM-as-a-Judge:** Mathematically benchmarked with **NVIDIA Nemotron Reasoning** and **MLflow** to guarantee 0% hallucination on dense financial and corporate data.

---

## 🏗️ Architecture Overview

```mermaid
flowchart TD
    subgraph Ingestion["1. Continuous Multi-Source Ingestion"]
        Silos["Workplace Silos<br/>(GDrive, GitHub, Notion, Slack, Jira, Files, MCP)"]
        Parser["Parser & Cleaner<br/>(PyMuPDF / Markdown Chunking)"]
        Silos --> Parser
        Parser --> Embed["Vector Embeddings<br/>(NVIDIA NIM / Gemini)"]
        Parser --> Coref["Coreference Resolution & Entity Extractor<br/>(Groq / Llama 3)"]
        Embed --> VectorDB[("Supabase pgvector<br/>HNSW Chunks Table")]
        Coref --> GraphDB[("Neo4j Knowledge Graph<br/>Merged Entities & Facts")]
    end

    subgraph Retrieval["2. Hybrid CRAG Retrieval Loop"]
        Query([User Question / Agent API / MCP])
        Router{"Intent Classifier & Router"}
        Query --> Router
        Router --> Hybrid["Hybrid Search<br/>(pgvector + BM25 + Neo4j Cypher)"]
        Hybrid --> Grader{"Relevance Grader & Reranker"}
        Grader -->|Confidence Low| Rewrite["CRAG Query Rewrite Node"]
        Rewrite --> Hybrid
        Grader -->|Confidence High| Synthesizer["Multi-Model Synthesizer<br/>(SSE Streaming Generation)"]
    end

    subgraph OutputLayer["3. Output & Governance"]
        Synthesizer --> LiveAnswer([Verified Answer with Citations & Confidence Breakdown])
        LiveAnswer -.-> MemoryHub[("Workspace Memory Hub<br/>User Facts & Episodic Distillation")]
    end
```

---

## 💻 Tech Stack

- **Backend:** Python 3.11, FastAPI, Uvicorn, LangGraph, LangChain, LiteLLM
- **Databases:** Supabase (PostgreSQL + pgvector + RLS), Neo4j Graph Database
- **AI Models & NIM:** NVIDIA NIM (`nv-embedqa-e5-v5`, Nemotron Reasoning), Google Gemini 2.5/3.7 Flash, Groq (`llama-3.1-70b`, `gpt-oss-120b`), Sarvam AI (Indic Language Support)
- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS, Clerk Auth, Lucide Icons, `react-force-graph-3d`
- **Protocols & Standards:** Model Context Protocol (FastMCP Stdio & SSE Transport), Server-Sent Events (SSE)
- **Deployment & Cloud:** Docker, Docker Compose, AWS EC2 (Ubuntu 24.04 LTS), GitHub CI/CD

---

## 🖥️ Dashboard & Features Breakdown

- **`/home` (Executive Overview):** Live system health, active knowledge layers, and indexed resources.
- **`/ask` (Ask Brain):** Real-time conversational interface with streaming thought processes, verified citations, confidence breakdown, and source receipts.
- **`/integrations` (Connectors):** OAuth management and continuous ingestion pipelines for Google Drive, GitHub, Notion, Slack, Jira, and direct file uploads.
- **`/knowledge` (Knowledge Library):** Real-time registry of all ingested documents, markdown files, and status tags (`COMPLETED`, `PENDING`, `FAILED`).
- **`/knowledge/graph` (3D Graph Explorer):** Interactive 3D visualization of the company's knowledge graph with node inspector and category filtering.
- **`/ai/mcp` (Model Context Protocol Portal):** Developer hub providing copy-paste configurations for Cursor/Windsurf IDEs and SSE endpoints for external autonomous agents.
- **`/memory-hub` (Memory Administration):** Governs long-term workspace facts, rules, user preferences, and episodic memory distillation.
- **`/semantic-dictionary` (Business Glossary):** Centrally defined company jargon, abbreviations, and calculation metrics strictly enforced during retrieval.
- **`/security` (Governance & Audit):** RBAC member management, token access keys, and immutable workspace audit logs.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.11+
- Node.js 20+ & npm
- Docker & Docker Compose (Optional for containerized run)

### 2. Setup Environment
Clone the repository and copy the environment variables:
```bash
git clone https://github.com/niteshkumarvarma30/CognitRAG.ai.git
cd CognitRAG.ai
```
Configure your `.env` with your Supabase, Neo4j, NVIDIA, Gemini, Clerk, and OAuth client credentials.

### 3. Start Backend Server
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Start Frontend Application
```bash
cd frontend/app
npm install
npm run dev
```
Open **`http://localhost:5173`** (or `http://localhost:3000`) in your browser.

---

## 🐳 Docker & Cloud Deployment (AWS EC2)

Deploy CognitRAG with a single command using Docker Compose:
```bash
docker compose build
docker compose up -d
```

- **Frontend UI:** `http://YOUR-SERVER-IP:3000`
- **FastAPI Backend Docs:** `http://YOUR-SERVER-IP:8000/docs`

---

## 📄 License
Proprietary & Confidential. Built by the CognitRAG Engineering Team.
