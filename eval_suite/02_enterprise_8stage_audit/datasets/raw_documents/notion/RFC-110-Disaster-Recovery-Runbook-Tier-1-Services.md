# RFC-110: Disaster Recovery Runbook for Tier-1 Storage Services
Author: Sarah Jenkins, Lead SRE
Status: Active Operational Runbook

## 1. Supabase Postgres Point-in-Time Recovery (PITR)
1. Navigate to Supabase Project Management Console -> Database -> Backups.
2. Select target recovery timestamp (accurate to the second within 30-day window).
3. Execute restore to secondary instance `prod-recovery-db`.
4. Run validation queries: `SELECT COUNT(*) FROM documents WHERE status = 'completed';`
5. Update Route 53 CNAME `db.cognitrag.ai` to point to recovered instance.

## 2. Neo4j AuraDB Backup Restoration
1. Access Neo4j Aura Console -> Instances -> Snapshots.
2. Choose latest scheduled daily snapshot or on-demand snapshot.
3. Click 'Restore to Instance'. Recovery completes in ~12 minutes.