# CognitRAG — Ground-Truth Source Records

This document contains the exact ground-truth records across Jira, Slack, GitHub, Notion, and Google Drive stored in the database, along with their chunk IDs, knowledge graph entities, and benchmark evaluation queries mapped to each chunk.

---

## 1. Jira Tickets (`source_type: jira`)

### Record 1: Jira Ticket BILL-101
- **Filename:** `Jira: BILL-101.txt`
- **Chunk ID:** `b9517f50-c53d-46ae-9462-e74b30d7025a`
- **Knowledge Graph Entities:** `["BILL-101", "Stripe Staging", "John Doe", "Sarah", "401 Unauthorized", "AWS Secrets Manager", "PR #45"]`
- **Exact Stored Content:**
  > "Jira Ticket: BILL-101. Title: Fix 401 Unauthorized error in Stripe Staging environment. Assignee: John Doe. Priority: High. Status: Resolved. Description: Following Sarah's report in Slack #engineering-alerts, the staging environment is throwing a 401 error. The staging EC2 instance was using production Stripe keys (sk_live_) instead of the test keys (sk_test_). Resolution: Resolved by PR #45 which moved keys to AWS Secrets Manager."

**Benchmark Queries Mapping to this Chunk:**
- `jira_1`: *"What was the root cause of the 401 Unauthorized error in Jira BILL-101?"*
- `jira_2`: *"Which pull request resolved the issue in Jira BILL-101?"*
- `jira_3`: *"Who was the assignee for Jira ticket BILL-101?"*
- `jira_4`: *"What status was Jira ticket BILL-101 transitioned to after the fix?"*

---

### Record 2: Jira Ticket AUTH-204
- **Filename:** `Jira: AUTH-204.txt`
- **Chunk ID:** `10da4925-8e8e-4f14-bcc2-5b19e3189101`
- **Knowledge Graph Entities:** `["AUTH-204", "OAuth2 PKCE", "David Kim", "code_verifier", "SHA-256", "Token Endpoint"]`
- **Exact Stored Content:**
  > "Jira Ticket: AUTH-204. Title: Implement OAuth2 PKCE Flow for Mobile & Native Apps. Assignee: David Kim. Priority: Critical. Status: In Progress. Description: Modern single-page apps and mobile clients must use Authorization Code with PKCE (Proof Key for Code Exchange) rather than implicit grant flows. Requires code_verifier SHA-256 challenge validation on the backend token endpoint."

**Benchmark Queries Mapping to this Chunk:**
- `jira_5`: *"What authorization flow is tracked in Jira AUTH-204 for mobile clients?"*
- `jira_6`: *"Who is assigned to implement the PKCE flow in Jira AUTH-204?"*
- `jira_7`: *"What cryptographic validation is required by Jira AUTH-204 on the token endpoint?"*
- `jira_8`: *"What priority is assigned to the PKCE implementation ticket AUTH-204?"*

---

## 2. Slack Messages (`source_type: slack`)

### Record 3: Slack Channel #engineering-alerts
- **Filename:** `Slack: #engineering-alerts.txt`
- **Chunk ID:** `2d6c849c-3200-42dc-88db-e4eb3df7e043`
- **Knowledge Graph Entities:** `["#engineering-alerts", "Sarah", "Stripe Integration", "401 Unauthorized", "AWS Secrets Manager", "BILL-101"]`
- **Exact Stored Content:**
  > "Slack Channel: #engineering-alerts. Message from Sarah (Lead Engineer): 'Hey team, the Stripe integration is failing in the staging environment. The API is returning a 401 Unauthorized error when creating checkout sessions. Can someone check environment variables in AWS Secrets Manager? I filed Jira BILL-101 to track this.'"

**Benchmark Queries Mapping to this Chunk:**
- `slack_1`: *"What did Sarah report about the Stripe integration in #engineering-alerts?"*
- `slack_2`: *"Which Jira ticket did Sarah file regarding the Stripe staging issue?"*
- `slack_3`: *"What role does Sarah hold according to the Slack alert message?"*
- `slack_4`: *"Where did Sarah suggest checking for the correct environment variables in Slack?"*

---

### Record 4: Slack Channel #architecture-decisions
- **Filename:** `Slack: #architecture-decisions.txt`
- **Chunk ID:** `7a730ae5-c974-44cd-ba9b-7a1d79d08bc2`
- **Knowledge Graph Entities:** `["#architecture-decisions", "Alex", "AWS ElastiCache", "VPC MemoryDB", "Multi-AZ Persistence"]`
- **Exact Stored Content:**
  > "Slack Channel: #architecture-decisions. Discussion on Cache Layer: Alex proposed migrating Redis cluster from AWS ElastiCache to VPC MemoryDB for guaranteed Multi-AZ persistence and sub-millisecond read latency. Decision: Consensus reached to adopt VPC MemoryDB in Q4 with cluster mode enabled."

**Benchmark Queries Mapping to this Chunk:**
- `slack_5`: *"What cache migration did Alex propose in #architecture-decisions?"*
- `slack_6`: *"What are the primary performance advantages cited for VPC MemoryDB in Slack?"*
- `slack_7`: *"When did the team decide to adopt VPC MemoryDB in #architecture-decisions?"*
- `slack_8`: *"Which feature must be enabled for the VPC MemoryDB adoption according to Slack?"*

---

## 3. GitHub Pull Requests (`source_type: github`)

### Record 5: GitHub PR #45
- **Filename:** `GitHub: PR #45.txt`
- **Chunk ID:** `746da291-8c08-4a39-87ba-bfad30485193`
- **Knowledge Graph Entities:** `["PR #45", "BILL-101", "John Doe", "Sarah", "config.yml", "AWS Secrets Manager", "sk_test_"]`
- **Exact Stored Content:**
  > "GitHub Pull Request: #45. Title: Fix: Updated Stripe staging API keys in AWS Secrets Manager (Resolves BILL-101). Author: John Doe. Merged by: Sarah. Description: Updated config.yml to pull sk_test_ keys from AWS Secrets Manager for the staging environment. Eliminates hardcoded sk_live_ credentials. Verified local and staging checkout flow passes 200 OK."

**Benchmark Queries Mapping to this Chunk:**
- `github_1`: *"What file was updated in GitHub PR #45 to fix the Stripe staging keys?"*
- `github_2`: *"Who merged GitHub PR #45?"*
- `github_3`: *"Which Jira ticket does GitHub PR #45 resolve?"*
- `github_4`: *"What specific key prefix was replaced in PR #45 to resolve the issue?"*

---

### Record 6: GitHub PR #112
- **Filename:** `GitHub: PR #112.txt`
- **Chunk ID:** `81e00650-8e46-4001-9c5e-9063a52f73a9`
- **Knowledge Graph Entities:** `["PR #112", "Maria Gomez", "Reciprocal Rank Fusion", "BM25", "pgvector", "recall@10"]`
- **Exact Stored Content:**
  > "GitHub Pull Request: #112. Title: Feature: Implement Reciprocal Rank Fusion (RRF) for Hybrid Vector and BM25 Search. Author: Maria Gomez. Status: Merged. Description: Added RRF score calculation with constant k=60 to fuse sparse BM25 scores and pgvector cosine similarity. Improves recall@10 by 18% across dense technical documents."

**Benchmark Queries Mapping to this Chunk:**
- `github_5`: *"What retrieval algorithm was introduced in GitHub PR #112?"*
- `github_6`: *"What constant k value was implemented for RRF in PR #112?"*
- `github_7`: *"Who authored GitHub PR #112?"*
- `github_8`: *"What quantitative recall improvement was measured in PR #112?"*

---

## 4. Notion Documents (`source_type: notion`)

### Record 7: Notion Q3 Stripe Billing PRD
- **Filename:** `Notion: Q3 Stripe Billing PRD.txt`
- **Chunk ID:** `6366740a-775d-4c20-bb94-44526e9a3e7b`
- **Knowledge Graph Entities:** `["Stripe Billing Integration", "Stripe Elements", "FastAPI", "AWS EC2", "AWS ECS Fargate", "Braintree"]`
- **Exact Stored Content:**
  > "Product Requirements Document (PRD): Q3 Stripe Billing Integration. Goal: Migrate core SaaS subscription payment gateway from legacy Braintree to Stripe Elements. Backend: FastAPI server processes webhooks for 'subscription_created' and 'invoice.paid' events. Infrastructure: Staged on AWS EC2, production deployment managed on AWS ECS Fargate. Target launch: October 15th."

**Benchmark Queries Mapping to this Chunk:**
- `notion_1`: *"What legacy gateway is being replaced by Stripe Elements according to the Notion PRD?"*
- `notion_2`: *"What target launch date is scheduled for the Stripe Billing PRD in Notion?"*
- `notion_3`: *"Which two webhook events does the FastAPI server process according to the Notion PRD?"*
- `notion_4`: *"What AWS compute service manages the production deployment for Stripe billing?"*

---

### Record 8: Notion RFC-014 Zero-Trust ACL
- **Filename:** `Notion: RFC-014 Zero-Trust ACL.txt`
- **Chunk ID:** `302041ee-b054-4e11-a0b3-f5b56a32561d`
- **Knowledge Graph Entities:** `["RFC-014", "Zero-Trust ACL", "allowed_entities", "SQL filtering", "Data Leakage Prevention"]`
- **Exact Stored Content:**
  > "Architecture RFC-014: Zero-Trust Document Level Access Control. Requirement: Every chunk ingested must store an allowed_entities metadata array containing user or team roles. Retrieval pipeline must enforce SQL filtering allowed_entities && ARRAY[user_roles] before reranking, guaranteeing zero data leakage between privileged executive channels and general contractors."

**Benchmark Queries Mapping to this Chunk:**
- `notion_5`: *"What metadata field must every chunk store under Notion RFC-014 Zero-Trust ACL?"*
- `notion_6`: *"What does the SQL array filter enforce under RFC-014 in Notion?"*
- `notion_7`: *"Between which two user groups does RFC-014 guarantee zero data leakage?"*
- `notion_8`: *"At what stage in the pipeline are permissions applied according to RFC-014?"*

---

## 5. Google Drive Documents (`source_type: google_drive`)

### Record 9: Multi-Tenant Cryptographic Isolation Spec
- **Filename:** `Drive: Multi-Tenant Isolation Spec.gdoc`
- **Chunk ID:** `8d5d4b2a-6a1e-439e-8d07-b6e9d208d878`
- **Content:**
  > "Technical Design Document: Multi-Tenant Cryptographic Isolation in Supabase. Each tenant workspace is assigned a deterministic UUID derived via UUID5 from workspace keys. Postgres Row-Level Security (RLS) policies enforce tenant_id = auth.uid() on all tables. Neo4j Knowledge Graph partitions nodes with mandatory tenantId property on all entities and relations."

---

### Record 10: Q3 Security Audit Summary
- **Filename:** `Drive: Q3 Security Audit Summary.gdoc`
- **Chunk ID:** `deb873a4-e472-4e8b-9582-448d675e50c0`
- **Content:**
  > "Security Audit Summary: Q3 Enterprise Compliance & Penetration Testing. Auditor: CyberDefense Labs. Findings: Zero critical vulnerabilities. Recommendations: Enable KMS customer-managed encryption keys for EBS volumes and rotate AWS IAM session tokens every 90 days."
