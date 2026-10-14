-- Migration 012: RLS Policies and Permission-Aware Match RPC

-- 1. Enable RLS on core tables
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['tenants','documents','document_chunks',
    'tenant_integrations','semantic_cache','preference_memory',
    'transactions','contradictions','eval_benchmark_runs']
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t AND table_schema = 'public') THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;

-- 2. Tenant isolation policies for client queries (service_role automatically bypasses)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tenants: self only' AND tablename = 'tenants') THEN
    CREATE POLICY "Tenants: self only" ON tenants
      FOR ALL USING (id = (current_setting('app.tenant_id', true))::UUID);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Chunks: tenant-scoped' AND tablename = 'document_chunks') THEN
    CREATE POLICY "Chunks: tenant-scoped" ON document_chunks
      FOR ALL USING (tenant_id = (current_setting('app.tenant_id', true))::UUID);
  END IF;
END $$;

-- 3. Robust Permission-Aware Vector Search RPC
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
