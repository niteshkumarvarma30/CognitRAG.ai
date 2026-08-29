-- Migration: 003_conversations.sql
-- Description: Conversation threading and memory for multi-tenant users

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    citations JSONB DEFAULT '[]', -- Array of source_item IDs or metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations Policies (Users can only see their own conversations)
CREATE POLICY "Users can manage their own conversations"
    ON conversations FOR ALL
    USING (user_id = current_setting('request.jwt.claim.sub', true) AND workspace_id IN (SELECT workspace_id FROM workspace_memberships WHERE user_id = current_setting('request.jwt.claim.sub', true)));

-- Messages Policies
CREATE POLICY "Users can manage messages in their conversations"
    ON messages FOR ALL
    USING (conversation_id IN (SELECT id FROM conversations WHERE user_id = current_setting('request.jwt.claim.sub', true)));
