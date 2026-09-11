# RFC-104: Event-Driven Billing & Webhook Ingestion Engine
Author: Michael Chang, FinTech Transaction Core
Status: Implemented | Related Issues: BILL-301, BILL-302

## 1. Problem Statement
Synchronous processing of external payment webhooks (Stripe, PayPal) caused checkout bottlenecks and occasional subscription provisioning drops during network spikes.

## 2. Architectural Design
1. **API Gateway Ingestion:** Ingress gateway validates webhook signatures using preserved raw request bodies (PR #3011).
2. **Buffer Queue:** Webhook payloads publish immediately to partitioned Kafka topic `billing.events.v1` with key `customer_id`.
3. **Idempotent Consumer:** FastAPI worker executes state transitions inside an atomic Postgres transaction:
   - Verifies event idempotency via `stripe_events(event_id) UNIQUE`.
   - Updates `subscriptions` and `invoices` tables.
4. **Redis Rate Caching:** TaxJar calculations cached in VPC MemoryDB with 24h TTL (PR #3022).