# RFC-111: Distributed Token Bucket Rate Limiter at API Gateway
Author: Kevin Miller, Edge Network Engineering
Status: Implemented | Engine: Envoy + Redis

## 1. Design
Protects CognitRAG APIs from abusive scrapers and denial-of-service traffic using a distributed Token Bucket algorithm implemented in Envoy Lua filters backed by Redis cluster.

## 2. Limits by Tier
- Free Tier: 60 requests/minute, burst capacity 100.
- Enterprise Tier: 2,400 requests/minute, burst capacity 4,000.
- HTTP 429 response includes headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`.