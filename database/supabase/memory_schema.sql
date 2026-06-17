-- Memory Architecture: Preference and Episodic Memory Tables

-- 1. Preference Memory Table
-- Stores user-specific preferences with exact match lookup
CREATE TABLE IF NOT EXISTS preference_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    pref_key TEXT NOT NULL,
    pref_value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tenant_id, user_id, pref_key)
);

-- 2. Episodic Memory Table
-- Stores structured summaries of completed work/conversations
CREATE TABLE IF NOT EXISTS episodic_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    summary TEXT NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE preference_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodic_memory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Tenant Isolation using Custom JWTs
CREATE POLICY "Tenant Isolation" ON preference_memory
    AS PERMISSIVE FOR ALL
    USING (tenant_id::text = (current_setting('request.jwt.claims', true)::json->>'tenant_id'))
    WITH CHECK (tenant_id::text = (current_setting('request.jwt.claims', true)::json->>'tenant_id'));

CREATE POLICY "Tenant Isolation" ON episodic_memory
    AS PERMISSIVE FOR ALL
    USING (tenant_id::text = (current_setting('request.jwt.claims', true)::json->>'tenant_id'))
    WITH CHECK (tenant_id::text = (current_setting('request.jwt.claims', true)::json->>'tenant_id'));
