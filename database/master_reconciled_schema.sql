-- ==============================================================================
-- CognitRAG.ai v5 — Master Reconciled & Unified Schema
-- Fixes all schema drift, missing columns, permission RPCs, and multi-source audit
-- Run this in Supabase Dashboard > SQL Editor
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TENANTS & WORKSPACES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS tenants (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              TEXT NOT NULL,
    slack_team_id     TEXT,
    slack_team_name   TEXT,
    github_org        TEXT,
    plan              TEXT DEFAULT 'solo' CHECK (plan IN ('solo', 'teams', 'enterprise', 'free')),
    created_at        TIMESTAMPTZ DEFAULT now()
);

-- Ensure all columns exist if upgrading from older schema
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS slack_team_id TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS slack_team_name TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS github_org TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'solo';

-- Workspace Members (Teams & Solo Tier permissions)
CREATE TABLE IF NOT EXISTS workspace_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL,            -- Clerk user_id
    role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    added_by    TEXT,
    added_at    TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_workspace_members_tenant ON workspace_members (tenant_id);

-- Workspace Users (Legacy compatibility)
CREATE TABLE IF NOT EXISTS workspace_users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    clerk_id      TEXT,
    slack_user_id TEXT,
    email         TEXT,
    name          TEXT,
    role          TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 3. SOURCE ACCESS GRANTS (Channel/Project/Doc Level Security)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS source_access_grants (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    source_type        TEXT NOT NULL, -- 'slack_channel'|'jira_project'|'notion_page'|'github_repo'|'gdrive_file'|'meeting'
    source_native_id   TEXT NOT NULL,
    is_private         BOOLEAN DEFAULT false,
    allowed_member_ids TEXT[] DEFAULT ARRAY[]::TEXT[],  -- Clerk user_ids
    synced_at          TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, source_type, source_native_id)
);
CREATE INDEX IF NOT EXISTS idx_sag_tenant ON source_access_grants (tenant_id, source_type);

-- ==============================================================================
-- 4. DOCUMENTS (Normalized Parent Documents)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS documents (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    filename          TEXT,
    source_type       TEXT,
    source_native_id  TEXT,
    language_tag      TEXT DEFAULT 'en' CHECK (language_tag IN ('en', 'hi-latn', 'mixed')),
    author            TEXT,
    raw_ref_url       TEXT,
    status            TEXT DEFAULT 'pending',
    metadata          JSONB DEFAULT '{}'::jsonb,
    created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE documents ADD COLUMN IF NOT EXISTS source_type TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS source_native_id TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS language_tag TEXT DEFAULT 'en';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS raw_ref_url TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- ==============================================================================
-- 5. DOCUMENT CHUNKS (Claim-Level Source Reference & Embeddings)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS document_chunks (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id        UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    parent_id          TEXT,
    block_id           TEXT,
    start_char         INTEGER DEFAULT 0,
    end_char           INTEGER DEFAULT 0,
    content            TEXT NOT NULL,
    language_tag       TEXT DEFAULT 'en' CHECK (language_tag IN ('en', 'hi-latn', 'mixed')),
    source_type        TEXT,
    raw_ref_url        TEXT,
    author             TEXT,
    embedding          VECTOR(1024),         -- AWS Bedrock Titan / Jina 1024
    embedding_768      VECTOR(768),          -- Google Vertex AI text-embedding-004
    entities           JSONB DEFAULT '[]'::jsonb,
    graph_score        FLOAT DEFAULT 0.0,
    relationship_types JSONB DEFAULT '[]'::jsonb,
    allowed_entities   TEXT[] DEFAULT ARRAY['public'],
    created_at         TIMESTAMPTZ DEFAULT now()
);

-- Ensure all columns exist on live table
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS block_id TEXT;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS start_char INTEGER DEFAULT 0;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS end_char INTEGER DEFAULT 0;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS language_tag TEXT DEFAULT 'en';
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS source_type TEXT;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS raw_ref_url TEXT;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS embedding_768 VECTOR(768);
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS allowed_entities TEXT[] DEFAULT ARRAY['public'];

CREATE INDEX IF NOT EXISTS idx_chunks_tenant ON document_chunks (tenant_id);
CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks (document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_source ON document_chunks (source_type);

-- Backfill allowed_entities
UPDATE document_chunks SET allowed_entities = ARRAY['public'] WHERE allowed_entities IS NULL;

-- ==============================================================================
-- 6. CONTRADICTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS contradictions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity      TEXT NOT NULL,
    claim_a     JSONB NOT NULL,
    claim_b     JSONB NOT NULL,
    status      TEXT DEFAULT 'unresolved' CHECK (status IN ('unresolved', 'resolved_by_recency', 'resolved_by_user')),
    resolved_by TEXT,
    created_at  TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_contradictions_tenant ON contradictions (tenant_id, status);

-- ==============================================================================
-- 7. TENANT INTEGRATIONS (OAuth Tokens & Vault)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS tenant_integrations (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id              UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    integration_type       TEXT NOT NULL,
    access_token           TEXT,
    refresh_token          TEXT,
    token_expiry           TIMESTAMPTZ,
    workspace_id           TEXT,
    workspace_name         TEXT,
    bot_user_id            TEXT,
    access_token_vault_id  UUID,
    refresh_token_vault_id UUID,
    extra_data             JSONB DEFAULT '{}'::jsonb,
    is_active              BOOLEAN DEFAULT true,
    created_at             TIMESTAMPTZ DEFAULT now(),
    updated_at             TIMESTAMPTZ DEFAULT now(),
    UNIQUE (tenant_id, integration_type)
);

ALTER TABLE tenant_integrations ADD COLUMN IF NOT EXISTS refresh_token TEXT;
ALTER TABLE tenant_integrations ADD COLUMN IF NOT EXISTS token_expiry TIMESTAMPTZ;
ALTER TABLE tenant_integrations ADD COLUMN IF NOT EXISTS workspace_id TEXT;
ALTER TABLE tenant_integrations ADD COLUMN IF NOT EXISTS bot_user_id TEXT;
ALTER TABLE tenant_integrations ADD COLUMN IF NOT EXISTS access_token_vault_id UUID;
ALTER TABLE tenant_integrations ADD COLUMN IF NOT EXISTS refresh_token_vault_id UUID;
ALTER TABLE tenant_integrations ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE tenant_integrations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ==============================================================================
-- 8. CACHE, MEMORY & BILLING
-- ==============================================================================
CREATE TABLE IF NOT EXISTS semantic_cache (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id         TEXT,
    query           TEXT NOT NULL,
    response        TEXT NOT NULL,
    query_embedding VECTOR(1024),
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS preference_memory (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id     TEXT,
    pref_key    TEXT NOT NULL,
    pref_value  TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fact_memory (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id     TEXT,
    fact        TEXT NOT NULL,
    embedding   VECTOR(1024),
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    tokens_used     INTEGER DEFAULT 0,
    operation_type  TEXT DEFAULT 'query',
    created_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS operation_type TEXT DEFAULT 'query';

-- ==============================================================================
-- 9. BENCHMARK & EVALUATION TABLES (Public Schema)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS eval_benchmark_runs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_date            TIMESTAMPTZ DEFAULT now(),
    dataset_name        TEXT NOT NULL,
    metric_name         TEXT NOT NULL,
    metric_value        FLOAT NOT NULL,
    sample_size         INTEGER NOT NULL,
    eval_method         TEXT NOT NULL,
    judge_model         TEXT,
    notes               TEXT,
    status              TEXT DEFAULT 'completed',
    created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS eval_run_traces (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id              UUID NOT NULL,
    dataset_name        TEXT NOT NULL,
    question            TEXT,
    gold_answer         TEXT,
    generated_answer    TEXT,
    judge_a_score       TEXT,
    judge_b_score       TEXT,
    exact_match         BOOLEAN,
    is_correct          BOOLEAN,
    metadata            JSONB DEFAULT '{}'::jsonb,
    created_at          TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_eval_traces_run ON eval_run_traces (run_id);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ==============================================================================
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'tenants','workspace_members','workspace_users','source_access_grants',
    'documents','document_chunks','contradictions','tenant_integrations',
    'semantic_cache','preference_memory','fact_memory','transactions'
  ]
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t AND table_schema = 'public') THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;

-- ==============================================================================
-- 11. PERMISSION-AWARE VECTOR SEARCH RPC (1024-dim AWS/Jina)
-- ==============================================================================
CREATE OR REPLACE FUNCTION match_document_chunks(
    query_embedding     VECTOR(1024),
    match_count         INT,
    p_tenant_id         UUID,
    p_user_permissions  TEXT[] DEFAULT ARRAY['public']
)
RETURNS TABLE (
    id                  UUID,
    content             TEXT,
    parent_id           TEXT,
    block_id            TEXT,
    start_char          INTEGER,
    end_char            INTEGER,
    language_tag        TEXT,
    source_type         TEXT,
    raw_ref_url         TEXT,
    author              TEXT,
    entities            JSONB,
    graph_score         FLOAT,
    relationship_types  JSONB,
    similarity          FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.content,
        dc.parent_id,
        dc.block_id,
        dc.start_char,
        dc.end_char,
        dc.language_tag,
        dc.source_type,
        dc.raw_ref_url,
        dc.author,
        dc.entities,
        dc.graph_score,
        dc.relationship_types,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    WHERE dc.tenant_id = p_tenant_id
      AND (
          dc.allowed_entities IS NULL
          OR dc.allowed_entities && p_user_permissions
          OR 'public' = ANY(p_user_permissions)
      )
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ==============================================================================
-- 12. PERMISSION-AWARE VECTOR SEARCH RPC (768-dim Google Vertex AI text-embedding-004)
-- ==============================================================================
CREATE OR REPLACE FUNCTION match_document_chunks_768(
    query_embedding     VECTOR(768),
    match_count         INT,
    p_tenant_id         UUID,
    p_user_permissions  TEXT[] DEFAULT ARRAY['public']
)
RETURNS TABLE (
    id                  UUID,
    content             TEXT,
    parent_id           TEXT,
    block_id            TEXT,
    start_char          INTEGER,
    end_char            INTEGER,
    language_tag        TEXT,
    source_type         TEXT,
    raw_ref_url         TEXT,
    author              TEXT,
    entities            JSONB,
    graph_score         FLOAT,
    relationship_types  JSONB,
    similarity          FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.content,
        dc.parent_id,
        dc.block_id,
        dc.start_char,
        dc.end_char,
        dc.language_tag,
        dc.source_type,
        dc.raw_ref_url,
        dc.author,
        dc.entities,
        dc.graph_score,
        dc.relationship_types,
        1 - (dc.embedding_768 <=> query_embedding) AS similarity
    FROM document_chunks dc
    WHERE dc.tenant_id = p_tenant_id
      AND (
          dc.allowed_entities IS NULL
          OR dc.allowed_entities && p_user_permissions
          OR 'public' = ANY(p_user_permissions)
      )
    ORDER BY dc.embedding_768 <=> query_embedding
    LIMIT match_count;
END;
$$;
