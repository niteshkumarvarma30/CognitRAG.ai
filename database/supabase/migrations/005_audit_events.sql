-- Migration: 005_audit_events.sql
-- Description: Immutable audit logging for security and compliance

CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    actor_id TEXT NOT NULL, -- User ID or API Key ID
    action TEXT NOT NULL, -- e.g., 'document.read', 'workspace.update', 'agent.execute'
    resource_type TEXT NOT NULL, -- e.g., 'source_item', 'workspace'
    resource_id TEXT, 
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Audit Policies
CREATE POLICY "Admins can view audit events"
    ON audit_events FOR SELECT
    USING (workspace_id IN (
        SELECT workspace_id FROM workspace_memberships 
        WHERE user_id = current_setting('request.jwt.claim.sub', true) 
        AND role = 'admin'
    ));

-- Note: No UPDATE or DELETE policies. Audit events should be immutable.
