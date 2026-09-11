# RFC-109: Cross-Service Delegation via OAuth 2.0 Token Exchange (RFC 8693)
Author: David Kim, IAM Specialist
Status: Approved | Security: Zero-Trust Microservices

## 1. Design
When an edge gateway invokes downstream internal microservices (e.g. Ingestion -> Knowledge Graph -> Vector Store), user context must be securely preserved without propagating broad user credentials.

## 2. Mechanism
Internal services exchange the incoming user token for a scoped down internal delegation token using Keycloak RFC 8693 Token Exchange. Downstream services receive tokens restricted strictly to their required audience (`aud: svc:knowledge-graph`).