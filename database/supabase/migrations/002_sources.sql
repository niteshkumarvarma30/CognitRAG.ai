-- Migration: 002_sources.sql
-- Description: Source connectors and tracked external source items

CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- e.g., 'slack', 'github', 'jira'
    display_name TEXT,
    status TEXT NOT NULL DEFAULT 'disconnected', -- disconnected, connected, syncing, healthy, error
    config JSONB DEFAULT '{}',
    connected_at TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS source_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    title TEXT,
    external_url TEXT,
    permissions JSONB DEFAULT '{}',
    source_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(source_id, external_id)
);

-- Enable RLS
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_items ENABLE ROW LEVEL SECURITY;

-- Sources Policies
CREATE POLICY "Workspace members can view sources"
    ON sources FOR SELECT
    USING (workspace_id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = current_setting('request.jwt.claim.sub', true)));

-- Source Items Policies
CREATE POLICY "Workspace members can view source items"
    ON source_items FOR SELECT
    USING (workspace_id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = current_setting('request.jwt.claim.sub', true)));
