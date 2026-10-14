-- CognitRAG.ai v2 — Base Schema
-- Multilingual GraphRAG Company Brain with Claim-Level Citation Audit

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- TENANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS tenants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slack_team_id       TEXT,
    slack_team_name     TEXT,
    github_org          TEXT,
    plan        TEXT DEFAULT 'free',
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- DOCUMENTS  (Normalized Ingestion Object)
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    filename          TEXT,
    source_type       TEXT CHECK (source_type IN (
                        'github','slack','jira','notion','drive',
                        'meeting_zoom','meeting_meet','meeting_teams','pdf','manual'
                      )),
    source_native_id  TEXT,      -- PR number, message ts, page_id, meeting_id
    language_tag      TEXT DEFAULT 'en' CHECK (language_tag IN ('en','hi-latn','mixed')),
    author            TEXT,
    raw_ref_url       TEXT,      -- Deep link back to source
    status            TEXT DEFAULT 'pending',
    created_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- DOCUMENT CHUNKS  (Claim-Level Source Reference §3.2)
-- ============================================================
CREATE TABLE IF NOT EXISTS document_chunks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    parent_id       TEXT,
    block_id        TEXT,        -- Unique block identifier within parent doc
    start_char      INTEGER DEFAULT 0,
    end_char        INTEGER DEFAULT 0,
    content         TEXT NOT NULL,
    language_tag    TEXT DEFAULT 'en' CHECK (language_tag IN ('en','hi-latn','mixed')),
    source_type     TEXT,        -- mirrors parent document source_type
    raw_ref_url     TEXT,        -- Direct deep link to exact source location
    author          TEXT,
    embedding       VECTOR(1024),
    entities        JSONB DEFAULT '[]'::jsonb,
    graph_score     FLOAT DEFAULT 0.0,
    relationship_types JSONB DEFAULT '[]'::jsonb,
    allowed_entities   TEXT[] DEFAULT ARRAY['public'],
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CONTRADICTIONS TABLE (§3.4)
-- ============================================================
CREATE TABLE IF NOT EXISTS contradictions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity      TEXT NOT NULL,   -- e.g. "Delivery Date for PROJ-142"
    claim_a     JSONB NOT NULL,  -- {value, source_chunk_id, confidence, raw_ref_url}
    claim_b     JSONB NOT NULL,
    status      TEXT DEFAULT 'unresolved'
                CHECK (status IN ('unresolved','resolved_by_recency','resolved_by_user')),
    resolved_by TEXT,            -- user_id who resolved
    created_at  TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- ============================================================
-- TENANT INTEGRATIONS (OAuth Token Vault)
-- ============================================================
CREATE TABLE IF NOT EXISTS tenant_integrations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL CHECK (integration_type IN (
                       'slack','github','jira','notion','drive','meeting_bot'
                     )),
    access_token     TEXT,
    refresh_token    TEXT,
    token_expiry     TIMESTAMPTZ,
    workspace_id     TEXT,       -- slack team_id, github org, jira cloud_id, etc.
    workspace_name   TEXT,
    bot_user_id      TEXT,       -- Slack bot user ID
    extra_data       JSONB DEFAULT '{}'::jsonb,
    is_active        BOOLEAN DEFAULT true,
    created_at       TIMESTAMPTZ DEFAULT now(),
    updated_at       TIMESTAMPTZ DEFAULT now(),
    UNIQUE (tenant_id, integration_type)
);

-- ============================================================
-- WORKSPACE USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    clerk_id    TEXT,
    slack_user_id TEXT,
    email       TEXT,
    name        TEXT,
    role        TEXT DEFAULT 'member' CHECK (role IN ('admin','member')),
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SEMANTIC CACHE
-- ============================================================
CREATE TABLE IF NOT EXISTS semantic_cache (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id         TEXT,
    query           TEXT NOT NULL,
    response        TEXT NOT NULL,
    query_embedding VECTOR(1024),
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- MEMORY
-- ============================================================
CREATE TABLE IF NOT EXISTS preference_memory (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id     UUID,
    pref_key    TEXT NOT NULL,
    pref_value  TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fact_memory (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id     UUID,
    fact        TEXT NOT NULL,
    embedding   VECTOR(1024),
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TRANSACTIONS (billing metering)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    tokens_used     INTEGER DEFAULT 0,
    operation_type  TEXT DEFAULT 'query',
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE documents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE contradictions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions       ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS for backend operations
-- Frontend uses tenant-scoped JWT for isolation

-- ============================================================
-- VECTOR SEARCH RPC (claim-level, returns block_id + raw_ref_url)
-- ============================================================
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
      AND (dc.allowed_entities && p_user_permissions OR 'public' = ANY(p_user_permissions))
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================================
-- SEMANTIC CACHE RPC
-- ============================================================
CREATE OR REPLACE FUNCTION match_semantic_cache(
    p_query_embedding   VECTOR(1024),
    match_count         INT,
    match_threshold     FLOAT,
    p_tenant_id         UUID,
    p_user_id           TEXT DEFAULT NULL
)
RETURNS TABLE (
    id          UUID,
    response    TEXT,
    similarity  FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        sc.id,
        sc.response,
        1 - (sc.query_embedding <=> p_query_embedding) AS similarity
    FROM semantic_cache sc
    WHERE sc.tenant_id = p_tenant_id
      AND 1 - (sc.query_embedding <=> p_query_embedding) >= match_threshold
    ORDER BY sc.query_embedding <=> p_query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================================
-- FACT MEMORY RPC
-- ============================================================
CREATE OR REPLACE FUNCTION match_user_facts(
    p_query_embedding   VECTOR(1024),
    p_tenant_id         UUID,
    p_user_id           UUID,
    match_threshold     FLOAT DEFAULT 0.5,
    match_count         INT DEFAULT 3
)
RETURNS TABLE (
    id          UUID,
    fact        TEXT,
    similarity  FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        fm.id,
        fm.fact,
        1 - (fm.embedding <=> p_query_embedding) AS similarity
    FROM fact_memory fm
    WHERE fm.tenant_id = p_tenant_id
      AND fm.user_id = p_user_id
      AND 1 - (fm.embedding <=> p_query_embedding) >= match_threshold
    ORDER BY fm.embedding <=> p_query_embedding
    LIMIT match_count;
END;
$$;
