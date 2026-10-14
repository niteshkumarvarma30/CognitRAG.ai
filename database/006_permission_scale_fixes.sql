-- ============================================================================
-- CognitRAG v5 - Patch 006: permission, scale, audit and isolation fixes
-- Apply AFTER database/master_reconciled_schema.sql.
-- Idempotent. Contains no DROP TABLE and no DELETE of data.
-- Take a database snapshot before running. Review the "READ FIRST" notes.
--
-- READ FIRST
--  1. This patch replaces the vector-search RPCs. Their permission check in the
--     master script was open: "OR 'public' = ANY(p_user_permissions)" and
--     "allowed_entities IS NULL" made every chunk visible to anyone who passed the
--     default permission array. Here the check is a single overlap test and an
--     empty permission array returns nothing (fails closed).
--  2. RPC overloads are dropped by name. Update Python call sites in the same
--     deploy (match_semantic_cache has new arguments).
--  3. The REVOKE block at the end blocks direct browser access (anon and
--     authenticated roles). Confirm the frontend never calls Supabase directly.
--  4. If tenant_integrations already has duplicate (tenant_id, integration_type)
--     rows, the unique index fails. Check first:
--       SELECT tenant_id, integration_type, count(*) FROM tenant_integrations
--       GROUP BY 1,2 HAVING count(*) > 1;
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- A. Tenants: map Clerk organizations (Teams) and owners (Solo) to tenants
-- ---------------------------------------------------------------------------
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS clerk_org_id  TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS owner_user_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS uq_tenants_clerk_org
    ON tenants (clerk_org_id) WHERE clerk_org_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- B. Documents and chunks: source time, dedupe hash, keyword search, fail-closed ACL
-- ---------------------------------------------------------------------------
ALTER TABLE documents       ADD COLUMN IF NOT EXISTS source_timestamp TIMESTAMPTZ;
ALTER TABLE documents       ADD COLUMN IF NOT EXISTS content_hash     TEXT;

ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS source_native_id TEXT;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS source_timestamp TIMESTAMPTZ;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS content_hash     TEXT;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS content_tsv tsvector
    GENERATED ALWAYS AS (to_tsvector('simple', coalesce(content, ''))) STORED;

-- New chunks are invisible until ingestion assigns an access token.
-- Token format: '<source_type>:<source_native_id>', e.g. 'slack_channel:C123',
-- 'jira_project:PAY', 'github_repo:acme/api', 'notion_page:<id>'.
-- The token 'public' means "every member of this tenant" (manual uploads, legacy rows).
ALTER TABLE document_chunks ALTER COLUMN allowed_entities SET DEFAULT ARRAY[]::TEXT[];

-- ---------------------------------------------------------------------------
-- C. Constraints missing on tables that already existed live
--    (CREATE TABLE IF NOT EXISTS does not add CHECKs to existing tables)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_documents_language') THEN
    ALTER TABLE documents ADD CONSTRAINT chk_documents_language
      CHECK (language_tag IS NULL OR language_tag IN ('en','hi-latn','mixed')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_chunks_language') THEN
    ALTER TABLE document_chunks ADD CONSTRAINT chk_chunks_language
      CHECK (language_tag IS NULL OR language_tag IN ('en','hi-latn','mixed')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_tenants_plan') THEN
    ALTER TABLE tenants ADD CONSTRAINT chk_tenants_plan
      CHECK (plan IS NULL OR plan IN ('solo','teams','enterprise','free')) NOT VALID;
  END IF;
END $$;
-- After checking existing rows, run separately:
--   ALTER TABLE documents VALIDATE CONSTRAINT chk_documents_language;
--   ALTER TABLE document_chunks VALIDATE CONSTRAINT chk_chunks_language;
--   ALTER TABLE tenants VALIDATE CONSTRAINT chk_tenants_plan;

CREATE UNIQUE INDEX IF NOT EXISTS uq_tenant_integrations ON tenant_integrations (tenant_id, integration_type);
CREATE UNIQUE INDEX IF NOT EXISTS uq_pref_memory ON preference_memory (tenant_id, user_id, pref_key);

-- ---------------------------------------------------------------------------
-- D. Access grants: how the audience of a source container is determined
-- ---------------------------------------------------------------------------
-- mirrored  = membership copied from the source system (Slack, GitHub)
-- admin_set = audience chosen by a workspace admin in CognitRAG (Jira, Notion default)
ALTER TABLE source_access_grants ADD COLUMN IF NOT EXISTS audience_mode TEXT DEFAULT 'mirrored';
ALTER TABLE source_access_grants ADD COLUMN IF NOT EXISTS display_name   TEXT;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_sag_audience_mode') THEN
    ALTER TABLE source_access_grants ADD CONSTRAINT chk_sag_audience_mode
      CHECK (audience_mode IN ('mirrored','admin_set'));
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- E. New tables
-- ---------------------------------------------------------------------------
-- Maps a CognitRAG user to their identity in each connected tool.
-- Needed so a Slack /ask or a GitHub comment can be checked against the asker's access.
CREATE TABLE IF NOT EXISTS external_identities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id         TEXT NOT NULL,                      -- Clerk user id
    provider        TEXT NOT NULL CHECK (provider IN ('slack','jira','notion','github')),
    external_id     TEXT NOT NULL,                      -- Slack user id, Jira accountId, GitHub user id
    external_handle TEXT,
    email           TEXT,
    verified        BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (tenant_id, provider, external_id)
);
CREATE INDEX IF NOT EXISTS idx_ext_ident_user ON external_identities (tenant_id, user_id);

-- Per-connector sync progress (drives the onboarding progress UI and webhook upkeep).
CREATE TABLE IF NOT EXISTS sync_state (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL CHECK (integration_type IN ('slack','jira','notion','github')),
    phase            TEXT NOT NULL DEFAULT 'idle'
                     CHECK (phase IN ('idle','fast_pass','backfill','incremental','error')),
    items_indexed    INTEGER DEFAULT 0,
    items_estimated  INTEGER,
    cursor           JSONB DEFAULT '{}'::jsonb,
    webhook_ref      JSONB DEFAULT '{}'::jsonb,          -- e.g. Jira webhook ids and expiry
    last_synced_at   TIMESTAMPTZ,
    last_error       TEXT,
    updated_at       TIMESTAMPTZ DEFAULT now(),
    UNIQUE (tenant_id, integration_type)
);

-- Webhook de-duplication (providers retry; delivery can be out of order).
CREATE TABLE IF NOT EXISTS webhook_events (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider     TEXT NOT NULL,
    event_id     TEXT NOT NULL,
    tenant_id    UUID,
    status       TEXT DEFAULT 'received',
    received_at  TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ,
    UNIQUE (provider, event_id)
);

CREATE TABLE IF NOT EXISTS ingestion_jobs (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL,
    job_type         TEXT NOT NULL,   -- fast_pass | backfill | incremental | permission_sync | reindex
    status           TEXT NOT NULL DEFAULT 'queued'
                     CHECK (status IN ('queued','running','succeeded','failed','cancelled')),
    attempts         INTEGER DEFAULT 0,
    payload          JSONB DEFAULT '{}'::jsonb,
    error            TEXT,
    created_at       TIMESTAMPTZ DEFAULT now(),
    started_at       TIMESTAMPTZ,
    finished_at      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_tenant ON ingestion_jobs (tenant_id, status);

-- Audit trail of every answer, its citations, and user feedback.
CREATE TABLE IF NOT EXISTS query_logs (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id          TEXT,
    surface          TEXT NOT NULL CHECK (surface IN ('web','slack','github')),
    query_text       TEXT NOT NULL,
    language_tag     TEXT,
    route            TEXT,
    answer_text      TEXT,
    cache_hit        BOOLEAN DEFAULT false,
    hidden_citations INTEGER DEFAULT 0,       -- sources withheld because the audience could not see them
    latency_ms       INTEGER,
    first_token_ms   INTEGER,
    tokens_used      INTEGER,
    created_at       TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_query_logs_tenant ON query_logs (tenant_id, created_at DESC);

CREATE TABLE IF NOT EXISTS answer_citations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_log_id     UUID NOT NULL REFERENCES query_logs(id) ON DELETE CASCADE,
    tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    chunk_id         UUID,
    position         INTEGER,
    claim_text       TEXT,
    derivation       TEXT CHECK (derivation IN ('structured','extracted')),
    confidence_label TEXT CHECK (confidence_label IN ('high','medium','review')),
    score            FLOAT,
    source_type      TEXT,
    raw_ref_url      TEXT
);
CREATE INDEX IF NOT EXISTS idx_answer_citations_query ON answer_citations (query_log_id);

CREATE TABLE IF NOT EXISTS answer_feedback (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_log_id UUID NOT NULL REFERENCES query_logs(id) ON DELETE CASCADE,
    tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    citation_id  UUID REFERENCES answer_citations(id) ON DELETE SET NULL,
    user_id      TEXT,
    rating       SMALLINT CHECK (rating IN (-1, 1)),
    reason       TEXT,
    created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    actor      TEXT,
    action     TEXT NOT NULL,       -- integration.connected, member.added, grant.changed, data.deleted ...
    target     TEXT,
    detail     JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant ON audit_log (tenant_id, created_at DESC);

-- Evaluation: run-scoped results (public schema, never the unexposed eval schema).
CREATE TABLE IF NOT EXISTS eval_runs (
    run_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_label          TEXT NOT NULL,
    git_commit         TEXT,
    notes              TEXT,
    supersedes_run_id  UUID REFERENCES eval_runs(run_id),
    started_at         TIMESTAMPTZ DEFAULT now(),
    completed_at       TIMESTAMPTZ
);
ALTER TABLE eval_benchmark_runs ADD COLUMN IF NOT EXISTS run_id          UUID;
ALTER TABLE eval_benchmark_runs ADD COLUMN IF NOT EXISTS category        TEXT;
ALTER TABLE eval_benchmark_runs ADD COLUMN IF NOT EXISTS ci_low          FLOAT;
ALTER TABLE eval_benchmark_runs ADD COLUMN IF NOT EXISTS ci_high         FLOAT;
ALTER TABLE eval_benchmark_runs ADD COLUMN IF NOT EXISTS dataset_version TEXT;

-- ---------------------------------------------------------------------------
-- F. Semantic cache: never serve one user's answer to someone with a different audience
-- ---------------------------------------------------------------------------
ALTER TABLE semantic_cache ADD COLUMN IF NOT EXISTS permission_hash TEXT;   -- sha256 of sorted permission tokens
ALTER TABLE semantic_cache ADD COLUMN IF NOT EXISTS entity_guard TEXT[] DEFAULT ARRAY[]::TEXT[]; -- ids in the query (PR #45, BILL-101)
ALTER TABLE semantic_cache ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- G. Contradictions: link to the exact chunks and avoid duplicates
-- ---------------------------------------------------------------------------
ALTER TABLE contradictions ADD COLUMN IF NOT EXISTS chunk_a_id UUID;
ALTER TABLE contradictions ADD COLUMN IF NOT EXISTS chunk_b_id UUID;
CREATE UNIQUE INDEX IF NOT EXISTS uq_contradictions_pair
    ON contradictions (tenant_id, chunk_a_id, chunk_b_id)
    WHERE chunk_a_id IS NOT NULL AND chunk_b_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- H. Indexes (HNSW, GIN keyword, source lookup, cache)
-- ---------------------------------------------------------------------------
-- Note: CREATE INDEX CONCURRENTLY cannot run inside a transaction.
-- Remove it from the BEGIN/COMMIT block and run separately on a live database.
-- Included here for documentation; comment out if running in a transaction.
CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw
    ON document_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
-- Uncomment if Google Vertex AI (768-dim) is chosen as the primary embedding model:
-- CREATE INDEX IF NOT EXISTS idx_chunks_embedding768_hnsw
--     ON document_chunks USING hnsw (embedding_768 vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX IF NOT EXISTS idx_chunks_allowed_gin   ON document_chunks USING gin (allowed_entities);
CREATE INDEX IF NOT EXISTS idx_chunks_tsv           ON document_chunks USING gin (content_tsv);
CREATE INDEX IF NOT EXISTS idx_chunks_tenant_source ON document_chunks (tenant_id, source_type, source_native_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_chunks_hash
    ON document_chunks (tenant_id, document_id, content_hash) WHERE content_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_docs_source ON documents (tenant_id, source_type, source_native_id);
CREATE INDEX IF NOT EXISTS idx_cache_embedding_hnsw
    ON semantic_cache USING hnsw (query_embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_cache_lookup ON semantic_cache (tenant_id, permission_hash);

-- ---------------------------------------------------------------------------
-- I. Functions — drop every overload first, then recreate clean versions
-- ---------------------------------------------------------------------------
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    WHERE p.pronamespace = 'public'::regnamespace
      AND p.proname IN ('match_document_chunks','match_document_chunks_768',
                        'keyword_search_chunks','match_semantic_cache',
                        'get_user_permission_tokens')
  LOOP
    EXECUTE 'DROP FUNCTION ' || r.sig::text;
  END LOOP;
END $$;

-- Returns the set of access tokens a user holds in a tenant.
-- Non-members get nothing (empty array → no retrieval results).
-- Members get 'public' + every non-private container + every private container they are listed in.
CREATE FUNCTION get_user_permission_tokens(p_tenant_id UUID, p_user_id TEXT)
RETURNS TEXT[]
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (
      SELECT 1 FROM workspace_members m
      WHERE m.tenant_id = p_tenant_id AND m.user_id = p_user_id
    )
    THEN ARRAY['public']::TEXT[] || COALESCE(
           (SELECT array_agg(DISTINCT g.source_type || ':' || g.source_native_id)
              FROM source_access_grants g
             WHERE g.tenant_id = p_tenant_id
               AND (g.is_private = false OR p_user_id = ANY (g.allowed_member_ids))),
           ARRAY[]::TEXT[])
    ELSE ARRAY[]::TEXT[]
  END;
$$;

-- Vector search RPC (1024-dim: AWS Bedrock Titan v2 / Jina).
-- Fails closed: empty or NULL permissions return zero rows.
CREATE FUNCTION match_document_chunks(
    query_embedding    VECTOR(1024),
    match_count        INT,
    p_tenant_id        UUID,
    p_user_permissions TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS TABLE (
    id UUID, document_id UUID, content TEXT, parent_id TEXT, block_id TEXT,
    start_char INTEGER, end_char INTEGER, language_tag TEXT, source_type TEXT,
    source_native_id TEXT, raw_ref_url TEXT, author TEXT, source_timestamp TIMESTAMPTZ,
    entities JSONB, graph_score FLOAT, relationship_types JSONB, similarity FLOAT
)
LANGUAGE plpgsql STABLE
SET search_path = public
AS $$
BEGIN
    IF p_user_permissions IS NULL OR cardinality(p_user_permissions) = 0 THEN
        RETURN;
    END IF;
    RETURN QUERY
    SELECT dc.id, dc.document_id, dc.content, dc.parent_id, dc.block_id,
           dc.start_char, dc.end_char, dc.language_tag, dc.source_type,
           dc.source_native_id, dc.raw_ref_url, dc.author, dc.source_timestamp,
           dc.entities, dc.graph_score, dc.relationship_types,
           (1 - (dc.embedding <=> query_embedding))::FLOAT
    FROM document_chunks dc
    WHERE dc.tenant_id = p_tenant_id
      AND dc.embedding IS NOT NULL
      AND dc.allowed_entities && p_user_permissions
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Vector search RPC (768-dim: Google Vertex AI text-embedding-004).
CREATE FUNCTION match_document_chunks_768(
    query_embedding    VECTOR(768),
    match_count        INT,
    p_tenant_id        UUID,
    p_user_permissions TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS TABLE (
    id UUID, document_id UUID, content TEXT, parent_id TEXT, block_id TEXT,
    start_char INTEGER, end_char INTEGER, language_tag TEXT, source_type TEXT,
    source_native_id TEXT, raw_ref_url TEXT, author TEXT, source_timestamp TIMESTAMPTZ,
    entities JSONB, graph_score FLOAT, relationship_types JSONB, similarity FLOAT
)
LANGUAGE plpgsql STABLE
SET search_path = public
AS $$
BEGIN
    IF p_user_permissions IS NULL OR cardinality(p_user_permissions) = 0 THEN
        RETURN;
    END IF;
    RETURN QUERY
    SELECT dc.id, dc.document_id, dc.content, dc.parent_id, dc.block_id,
           dc.start_char, dc.end_char, dc.language_tag, dc.source_type,
           dc.source_native_id, dc.raw_ref_url, dc.author, dc.source_timestamp,
           dc.entities, dc.graph_score, dc.relationship_types,
           (1 - (dc.embedding_768 <=> query_embedding))::FLOAT
    FROM document_chunks dc
    WHERE dc.tenant_id = p_tenant_id
      AND dc.embedding_768 IS NOT NULL
      AND dc.allowed_entities && p_user_permissions
    ORDER BY dc.embedding_768 <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Keyword (tsvector / BM25-style) search — replaces loading tenant chunks into memory.
-- p_tsquery: sanitized alphanumeric tokens joined with ' | ' built by the backend.
CREATE FUNCTION keyword_search_chunks(
    p_tsquery          TEXT,
    match_count        INT,
    p_tenant_id        UUID,
    p_user_permissions TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS TABLE (
    id UUID, document_id UUID, content TEXT, parent_id TEXT, block_id TEXT,
    start_char INTEGER, end_char INTEGER, language_tag TEXT, source_type TEXT,
    source_native_id TEXT, raw_ref_url TEXT, author TEXT, source_timestamp TIMESTAMPTZ,
    entities JSONB, rank FLOAT
)
LANGUAGE plpgsql STABLE
SET search_path = public
AS $$
BEGIN
    IF p_tsquery IS NULL OR btrim(p_tsquery) = ''
       OR p_user_permissions IS NULL OR cardinality(p_user_permissions) = 0 THEN
        RETURN;
    END IF;
    RETURN QUERY
    SELECT dc.id, dc.document_id, dc.content, dc.parent_id, dc.block_id,
           dc.start_char, dc.end_char, dc.language_tag, dc.source_type,
           dc.source_native_id, dc.raw_ref_url, dc.author, dc.source_timestamp,
           dc.entities,
           ts_rank_cd(dc.content_tsv, to_tsquery('simple', p_tsquery))::FLOAT
    FROM document_chunks dc
    WHERE dc.tenant_id = p_tenant_id
      AND dc.allowed_entities && p_user_permissions
      AND dc.content_tsv @@ to_tsquery('simple', p_tsquery)
    ORDER BY 15 DESC
    LIMIT match_count;
END;
$$;

-- Semantic cache lookup: same tenant, same audience hash, same entity identifiers, not expired.
CREATE FUNCTION match_semantic_cache(
    query_embedding   VECTOR(1024),
    match_count       INT,
    match_threshold   FLOAT,
    p_tenant_id       UUID,
    p_permission_hash TEXT,
    p_entity_guard    TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS TABLE (id UUID, query TEXT, response TEXT, similarity FLOAT)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT sc.id, sc.query, sc.response,
         (1 - (sc.query_embedding <=> match_semantic_cache.query_embedding))::FLOAT AS similarity
  FROM semantic_cache sc
  WHERE sc.tenant_id = p_tenant_id
    AND sc.permission_hash = p_permission_hash
    AND sc.entity_guard = p_entity_guard
    AND (sc.expires_at IS NULL OR sc.expires_at > now())
    AND (1 - (sc.query_embedding <=> match_semantic_cache.query_embedding)) >= match_threshold
  ORDER BY sc.query_embedding <=> match_semantic_cache.query_embedding
  LIMIT match_count;
$$;

-- ---------------------------------------------------------------------------
-- J. Row-level security and privilege lockdown
--    Backend is the ONLY database client (service role).
--    Browsers never call Supabase directly.
-- ---------------------------------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;
GRANT ALL ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES    FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;

COMMIT;

-- ============================================================================
-- POST-COMMIT steps (run separately — cannot run inside a transaction):
-- ============================================================================
-- 1. Validate NOT VALID constraints (check for bad rows first):
--    ALTER TABLE documents VALIDATE CONSTRAINT chk_documents_language;
--    ALTER TABLE document_chunks VALIDATE CONSTRAINT chk_chunks_language;
--    ALTER TABLE tenants VALIDATE CONSTRAINT chk_tenants_plan;
--
-- 2. ANALYZE tables after bulk index creation:
--    ANALYZE document_chunks;
--    ANALYZE semantic_cache;
--
-- 3. If running on a large live table, recreate HNSW indexes CONCURRENTLY:
--    CREATE INDEX CONCURRENTLY idx_chunks_embedding_hnsw ON document_chunks
--      USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
-- ============================================================================
