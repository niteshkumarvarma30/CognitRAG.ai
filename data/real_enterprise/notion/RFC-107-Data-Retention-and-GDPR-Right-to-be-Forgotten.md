# RFC-107: Automated GDPR Right-to-be-Forgotten Orchestration
Author: Jessica Wong, CISO
Status: Approved | Compliance: GDPR Art. 17, CCPA

## 1. Requirements
When a user exercises their Right-to-be-Forgotten, all personally identifiable information (PII) must be purged across all persistent storage engines within 72 hours.

## 2. Deletion Workflow
1. User deletion request received via `/api/v1/compliance/erasure-request`.
2. Supabase Postgres: Cascading deletion on `user_id` removes user records, documents, and chunk vectors.
3. Neo4j Knowledge Graph: Cypher query `MATCH (n {userId: $userId}) DETACH DELETE n` purges all associated graph nodes and edges.
4. S3 Buckets: Lifecycle rule tags user objects for permanent expiration within 24 hours.