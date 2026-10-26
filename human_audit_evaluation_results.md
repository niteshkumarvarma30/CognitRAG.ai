# CognitRAG.ai — End-to-End Evaluation & Human Audit Report

**Audit Date:** 2026-09-16  
**Tenant ID:** `00000000-0000-4000-8000-000000000001`  
**Pipeline Components:** Hybrid Retrieval (pgvector + BM25 + RRF) | Neo4j Knowledge Graph Multi-Hop Traversal | Claim-Level Citation Audit | Contradiction Detector | LLM-as-a-Judge (`openai/gpt-oss-120b`)

---

## 1. Executive Metrics Summary

| Metric | System Score | Target Baseline | Verification Status |
| :--- | :---: | :---: | :---: |
| **Faithfulness (Zero Hallucination)** | **100.0%** | > 90% | **VERIFIED** |
| **Context Accuracy (Ground Truth Match)** | **100.0%** | > 85% | **VERIFIED** |
| **Citation Precision (Verifiable Proof)** | **100.0%** | > 90% | **VERIFIED** |
| **Hinglish Intent & Alignment** | **100.0%** | > 80% | **VERIFIED** |

---

## 2. Ingested Benchmark Data (5 Cross-System Documents)

Below are the exact 5 cross-system documents that were parsed, coreference-resolved, embedded via Amazon Titan Multilingual v2 into Supabase `document_chunks`, and structured into Neo4j nodes and edges:

### Document 1: [NOTION] PRD: Q3 Stripe Billing Migration
- **Source Type:** `notion` | **Author:** Priya Sharma (Product Lead) | **Language:** `en`
- **Reference URL:** `https://notion.so/myorg/prd-q3-stripe-billing-mig`
- **Ingested Content:**
  > Product Requirements Document (PRD): Q3 Stripe Billing Migration.  
  > Target launch delivery date is committed for October 15, 2024.  
  > Infrastructure decision: Staging is deployed on AWS EC2, and Production runs on AWS ECS.  
  > Architecture uses OAuth 2.0 with PKCE for all billing portal sessions.

### Document 2: [SLACK] Slack: #engineering-alerts Incident
- **Source Type:** `slack` | **Author:** Sarah Jenkins (Lead SRE) | **Language:** `en`
- **Reference URL:** `https://myorg.slack.com/archives/C101/p1723632000`
- **Ingested Content:**
  > Slack Channel #engineering-alerts.  
  > Sarah Jenkins: 'Hey team, the Stripe checkout service in staging is throwing 401 Unauthorized errors. It looks like the AWS EC2 instance was injected with live production keys (sk_live_) instead of sandbox test keys (sk_test_). Filed Jira ticket BILL-101 for immediate remediation.'

### Document 3: [JIRA] Jira: BILL-101 Fix Staging Stripe Keys
- **Source Type:** `jira` | **Author:** John Doe (Senior Backend Eng) | **Language:** `en`
- **Reference URL:** `https://myorg.atlassian.net/browse/BILL-101`
- **Ingested Content:**
  > Jira Ticket BILL-101: Fix 401 Unauthorized error in Stripe Staging.  
  > Assignee: John Doe. Priority: High. Status: In Progress.  
  > Resolution notes: Replaced sk_live_ keys with sk_test_ keys in AWS Secrets Manager. Linked GitHub PR #45 resolves this ticket.

### Document 4: [GITHUB] GitHub: PR #45 Secrets Manager Key Rotation
- **Source Type:** `github` | **Author:** John Doe (Senior Backend Eng) | **Language:** `en`
- **Reference URL:** `https://github.com/myorg/backend-service/pull/45`
- **Ingested Content:**
  > GitHub Pull Request #45: Fix: Updated Stripe staging API keys in AWS Secrets Manager (Resolves BILL-101).  
  > Author: John Doe. Merged into main branch.  
  > Tested locally and verified checkout session generates without 401 error. Production release remains on track for October 15.

### Document 5: [SLACK] Slack: #eng-standup Hinglish Status
- **Source Type:** `slack` | **Author:** Rahul Singh (DevOps) | **Language:** `hi-latn`
- **Reference URL:** `https://myorg.slack.com/archives/C102/p1723632900`
- **Ingested Content:**
  > Slack Channel #eng-standup.  
  > Rahul Singh: 'Yaar, Stripe keys wala issue John ne PR #45 mein solve kar diya hai. Staging pe checkout ab 100% chal raha hai, kal subah deploy kar denge bhai.'

---

## 3. Step-by-Step Pipeline Traces for Human Verification

### Trace 1: Root Cause Incident Diagnosis
- **User Query:** *"Why did the Stripe checkout service fail in the staging environment?"*
- **Step 1 (Language Detection):** Detected as `en` (English).
- **Step 2 (Hybrid Retrieval & Budgeting):** Retrieved 5 candidate chunks across Slack, Jira, and GitHub.
- **Step 3 (Neo4j Graph Traversal):** Direct hybrid retrieval resolved the incident cluster.
- **Step 4 (Contradiction Check):** 0 contradictions flagged.
- **Step 5 (Generated Answer):**
  > *"Because the staging environment was using live production Stripe keys (sk_live_) instead of sandbox test keys (sk_test_), causing 401 Unauthorized errors."*
- **Ground Truth Target:**
  > The staging EC2 instance was mistakenly configured with production Stripe secret keys (sk_live_) instead of sandbox test keys (sk_test_), causing 401 Unauthorized errors.
- **Step 6 (LLM-as-a-Judge Audit):**
  - **Faithfulness:** `1.0` (100%)
  - **Context Accuracy:** `1.0` (100%)
  - **Citation Precision:** `1.0` (100%)
  - **Judge Reasoning:** *"The generated answer exactly mirrors the ground truth, stating that live production Stripe keys were used in staging instead of test keys, leading to 401 errors. The cited JIRA ticket and GitHub PR explicitly discuss the Stripe key misconfiguration and its correction, directly supporting the answer."*

---

### Trace 2: Hinglish Cross-System Resolution Query
- **User Query:** *"Staging pe Stripe checkout error kis PR mein aur kisne fix kiya tha?"*
- **Step 1 (Language Detection):** Detected as `mixed` / `hi-latn` (Hinglish).
- **Step 2 (Hybrid Retrieval & Budgeting):** Retrieved 13 candidate chunks matching both English GitHub PR metadata and Hinglish Slack discussion.
- **Step 3 (Neo4j Graph Traversal):** 
  - `John Doe` -[:ASSIGNED_TO]-> `Jira Ticket BILL-101`
  - `Jira ticket BILL-101` -[:FILED_BY]-> `Sarah Jenkins`
  - `AWS EC2 instance` -[:RUNS_ON]-> `Stripe checkout service`
- **Step 4 (Contradiction Check):** 0 contradictions flagged.
- **Step 5 (Generated Answer):**
  > *"PR #45, fixed by John Doe."*
- **Ground Truth Target:**
  > PR #45 was created and merged by John Doe to update the Stripe API keys in AWS Secrets Manager and resolve BILL-101.
- **Step 6 (LLM-as-a-Judge Audit):**
  - **Faithfulness:** `1.0` (100%)
  - **Context Accuracy:** `1.0` (100%)
  - **Citation Precision:** `1.0` (100%)
  - **Judge Reasoning:** *"The generated answer correctly identifies PR #45 and John Doe as the fixer, matching the ground truth. No extra or incorrect information is introduced, and the provided citations explicitly mention PR #45 and John Doe fixing the issue."*

---

### Trace 3: Committed Delivery Date Extraction
- **User Query:** *"What is the committed launch date for the Q3 Stripe billing migration?"*
- **Step 1 (Language Detection):** Detected as `en` (English).
- **Step 2 (Hybrid Retrieval & Budgeting):** Retrieved 15 candidate chunks across Notion PRD and GitHub PR notes.
- **Step 3 (Neo4j Graph Traversal):**
  - `Q3 Stripe Billing Migration` -[:RELATES_TO]-> `Product Requirements Document`
  - `Q3 Stripe Billing Migration` -[:DEPLOYED_ON]-> `AWS EC2`
  - `Q3 Stripe Billing Migration` -[:RUNS_ON]-> `AWS ECS`
- **Step 4 (Contradiction Check):** 0 contradictions flagged.
- **Step 5 (Generated Answer):**
  > *"October 15, 2024"*
- **Ground Truth Target:**
  > October 15, 2024 according to the Q3 Stripe Billing Migration PRD.
- **Step 6 (LLM-as-a-Judge Audit):**
  - **Faithfulness:** `1.0` (100%)
  - **Context Accuracy:** `1.0` (100%)
  - **Citation Precision:** `1.0` (100%)
  - **Judge Reasoning:** *"The generated answer exactly matches the ground-truth date. The cited document excerpts explicitly state that the Q3 Stripe Billing Migration's target launch delivery date is committed for October 15, 2024, directly supporting the answer."*

---

### Trace 4: Hinglish Conversational Delivery Query
- **User Query:** *"Yaar, billing migration kab tak complete hone wali hai according to PRD?"*
- **Step 1 (Language Detection):** Detected as `hi-latn` (Hinglish).
- **Step 2 (Hybrid Retrieval & Budgeting):** Retrieved candidate chunks matching billing migration PRD facts.
- **Step 3 (Neo4j Graph Traversal):** Direct hybrid retrieval resolved the target date without cross-hop expansion.
- **Step 4 (Contradiction Check):** 0 contradictions flagged.
- **Step 5 (Generated Answer):**
  > *"October 15, 2024."*
- **Ground Truth Target:**
  > October 15, 2024.
- **Step 6 (LLM-as-a-Judge Audit):**
  - **Faithfulness:** `1.0` (100%)
  - **Context Accuracy:** `1.0` (100%)
  - **Citation Precision:** `1.0` (100%)
  - **Judge Reasoning:** *"The generated answer exactly matches the ground truth date and contains no extraneous information, fulfilling the query. The provided citations explicitly state the target launch delivery date as October 15, 2024, directly supporting the answer."*

---

### Trace 5: Cross-System Multi-Hop (Jira ↔ GitHub ↔ AWS)
- **User Query:** *"Which GitHub pull request resolved Jira ticket BILL-101 and what was updated?"*
- **Step 1 (Language Detection):** Detected as `en` (English).
- **Step 2 (Hybrid Retrieval & Exact Identifier Bypass):** Identifier bypass matched exact key `BILL-101` and retrieved 15 candidate chunks.
- **Step 3 (Neo4j Graph Traversal):**
  - `Jira Ticket BILL-101` -[:RESOLVED_BY]-> `GitHub PR #45`
  - `GitHub Pull Request #45` -[:UPDATED]-> `AWS Secrets Manager`
- **Step 4 (Contradiction Check):** 0 contradictions flagged.
- **Step 5 (Generated Answer):**
  > *"GitHub Pull Request #45 resolved Jira ticket BILL-101 by updating the Stripe staging API keys in AWS Secrets Manager."*
- **Ground Truth Target:**
  > GitHub PR #45 resolved Jira ticket BILL-101 by updating the Stripe staging API keys in AWS Secrets Manager.
- **Step 6 (LLM-as-a-Judge Audit):**
  - **Faithfulness:** `1.0` (100%)
  - **Context Accuracy:** `1.0` (100%)
  - **Citation Precision:** `1.0` (100%)
  - **Judge Reasoning:** *"The generated answer exactly matches the ground-truth statement about PR #45 resolving BILL-101 and updating the Stripe staging API keys in AWS Secrets Manager. The cited document excerpts explicitly mention PR #45, the update, and the resolution of BILL-101, providing direct support."*

---

## 4. Summary & Verification

All evaluation artifacts are preserved for audit and reproduction:
- **Machine JSON Report:** `eval_results/end_to_end_human_audit_report.json`
- **Human Markdown Report:** `eval_results/end_to_end_human_audit_report.md`
- **Component C Hinglish Alignment Matrix:** `eval_results/component_c_hinglish_alignment.json`
