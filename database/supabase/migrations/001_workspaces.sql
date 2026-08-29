-- Migration: 001_workspaces.sql
-- Description: Core tenant and user membership tables for Phase 0.3 SaaS architecture

CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_memberships (
    user_id TEXT NOT NULL, -- Corresponds to external identity provider (e.g. Clerk)
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- admin, member, viewer
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, workspace_id)
);

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_memberships ENABLE ROW LEVEL SECURITY;

-- Workspace Policies
CREATE POLICY "Users can view workspaces they are a member of"
    ON workspaces FOR SELECT
    USING (id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = current_setting('request.jwt.claim.sub', true)));

-- Membership Policies
CREATE POLICY "Users can view memberships in their workspaces"
    ON workspace_memberships FOR SELECT
    USING (workspace_id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = current_setting('request.jwt.claim.sub', true)));
