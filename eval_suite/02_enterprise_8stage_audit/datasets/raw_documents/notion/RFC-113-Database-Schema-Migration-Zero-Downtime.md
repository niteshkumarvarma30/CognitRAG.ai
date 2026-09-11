# RFC-113: Zero-Downtime Database Schema Migration Standard (Expand and Contract)
Author: Liam Zhao, Principal Infrastructure Engineer
Status: Mandatory Standard

## 1. Principle
No database migration may lock tables for > 100ms or break backwards compatibility with running backend application pods.

## 2. Standard Pattern: Expand and Contract
1. **Expand:** Add new nullable column or view. Deploy code that writes to both old and new columns.
2. **Backfill:** Asynchronously backfill historical rows in batches of 5,000 with a 50ms pause to prevent replication lag.
3. **Contract:** Deploy application code reading exclusively from new column. Deprecate and drop old column after 30 days.