# RFC-102: Kafka KRaft Controller Migration & ZooKeeper Decommissioning
Author: Dave K., Distributed Systems Lead
Status: Approved | Scope: Streaming Clusters 1–12

## 1. Context & Motivation
ZooKeeper metadata management introduces dual-system complexity, slow controller failover (>45s), and limits cluster partition scalability. Migrating to KRaft (Kafka Raft Metadata Mode) eliminates ZooKeeper dependencies and enables sub-3 second controller election.

## 2. Migration Phases
1. **Phase 1 (Dual-Write Mode):** Enable KRaft controller quorum alongside ZooKeeper to synchronize metadata log.
2. **Phase 2 (Controller Cutover):** Transfer metadata leadership to KRaft 3-node controller quorum (`controller.quorum.voters=1@kafka-ctrl-1:9093,2@kafka-ctrl-2:9093,3@kafka-ctrl-3:9093`).
3. **Phase 3 (ZooKeeper Deprecation):** Decommission ZooKeeper ensemble after 14-day bake period.

## 3. Tuned Parameters (Resolving KAFKA-15022)
- `controller.quorum.fetch.timeout.ms = 6000`
- `metadata.log.segment.bytes = 67108864`