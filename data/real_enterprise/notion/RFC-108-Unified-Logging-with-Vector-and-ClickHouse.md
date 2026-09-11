# RFC-108: Unified Log Aggregation with Vector Agent & ClickHouse
Author: Carlos Santos, DevOps / Platform
Status: Implemented | Savings: $14,000/month

## 1. Migration Overview
Replaced legacy self-hosted Elasticsearch cluster with Timber.io Vector agent DaemonSets shipping structured logs directly to ClickHouse Cloud.

## 2. Advantages
- Ingestion throughput increased by 4.5x.
- Storage compression ratio reached 6.8x using ZSTD compression.
- Log retention expanded from 14 days to 90 days at 40% lower cost.