-- Migration 009: Contradictions table
CREATE TABLE IF NOT EXISTS contradictions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity      TEXT NOT NULL,
    claim_a     JSONB NOT NULL,   -- {value, source_chunk_id, confidence, raw_ref_url}
    claim_b     JSONB NOT NULL,
    status      TEXT DEFAULT 'unresolved'
                CHECK (status IN ('unresolved','resolved_by_recency','resolved_by_user')),
    resolved_by TEXT,
    created_at  TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

ALTER TABLE contradictions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_contradictions_tenant ON contradictions (tenant_id, status);
