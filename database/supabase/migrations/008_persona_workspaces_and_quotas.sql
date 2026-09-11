-- ==============================================================================
-- Migration: 008_persona_workspaces_and_quotas.sql
-- Description: Multi-Persona Workspaces, Zero-Collision Scoping & Dynamic Quotas
-- Executed successfully in Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.workspaces (
    id TEXT PRIMARY KEY,                          -- Compound key: "ws_dev_<user_hash>", "ws_ent_<user_hash>", "ws_bharat_<user_hash>"
    owner_user_id TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    persona_type TEXT NOT NULL CHECK (persona_type IN ('developer_studio', 'enterprise_brain', 'bharat_intelligence')),
    name TEXT NOT NULL,
    plan_tier TEXT DEFAULT 'free',                -- 'free', 'pro', 'enterprise'
    
    -- Base Quota Enforcements
    file_upload_limit INT DEFAULT 50,             -- Dev Studio: 50 files (Pro: 250)
    loc_limit INT DEFAULT 50000,                  -- Dev Studio: 50,000 LOC
    
    -- 🚀 Day-by-Day Agile Feature Extensibility
    persona_config JSONB DEFAULT '{}'::jsonb, 
    feature_flags JSONB DEFAULT '{}'::jsonb,
    usage_stats JSONB DEFAULT '{"total_queries": 0, "storage_mb": 0}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_persona UNIQUE (owner_user_id, persona_type)
);

-- Add persona_type to existing documents table so documents are cleanly categorized
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS persona_type TEXT DEFAULT 'enterprise_brain';

ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Index for instant multi-tenant lookups
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_persona ON public.workspaces(owner_user_id, persona_type);
CREATE INDEX IF NOT EXISTS idx_documents_tenant_persona ON public.documents(tenant_id, persona_type);
