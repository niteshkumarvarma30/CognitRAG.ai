# RFC-105: Multi-Region Active-Active Database Replication & Disaster Recovery
Author: Liam Zhao, Principal Infrastructure Engineer
Status: Approved | Target RTO: < 60s | Target RPO: < 5s

## 1. Strategy
To survive an entire AWS region outage (`us-east-1`), deploy an active-passive read-replica topology transitioning to active-active in `us-west-2`.

## 2. Component Replication
- **Supabase Postgres:** Configured AWS Aurora Global Database with physical replication lag < 1 second.
- **Neo4j AuraDB:** Multi-cluster read replicas deployed in secondary region with automated DNS failover via Route 53 Health Checks.
- **S3 Storage:** Bidirectional S3 Cross-Region Replication (CRR) enabled with KMS dual-key encryption.