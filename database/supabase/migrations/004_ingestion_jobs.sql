-- Migration: 004_ingestion_jobs.sql
-- Description: Tracking state and progress of ingestion pipelines

CREATE TABLE IF NOT EXISTS ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    processed_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_log TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ingestion_jobs ENABLE ROW LEVEL SECURITY;

-- Ingestion Jobs Policies
CREATE POLICY "Workspace members can view ingestion jobs"
    ON ingestion_jobs FOR SELECT
    USING (workspace_id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = current_setting('request.jwt.claim.sub', true)));
