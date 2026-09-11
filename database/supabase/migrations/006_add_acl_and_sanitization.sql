-- Migration 006: Add Document-Level ACL and Permission-Aware Vector Search

-- 1. Add allowed_entities array to document_chunks
ALTER TABLE document_chunks 
ADD COLUMN IF NOT EXISTS allowed_entities TEXT[] DEFAULT ARRAY['public'];

-- 2. Create GIN index for high-speed permission array containment checking
CREATE INDEX IF NOT EXISTS idx_document_chunks_allowed_entities 
ON document_chunks USING GIN(allowed_entities);

-- 3. Drop conflicting signatures if necessary and recreate ACL-aware match_document_chunks
DROP FUNCTION IF EXISTS match_document_chunks(vector(1024), integer, uuid);
DROP FUNCTION IF EXISTS match_document_chunks(vector(1024), integer, uuid, text[]);

CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(1024),
  match_count int DEFAULT 10,
  p_tenant_id uuid DEFAULT NULL,
  p_user_permissions text[] DEFAULT ARRAY['public']
) RETURNS TABLE (
  id uuid,
  content text,
  parent_id text,
  entities jsonb,
  graph_score float,
  relationship_types jsonb,
  allowed_entities text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc.parent_id,
    dc.entities,
    dc.graph_score,
    dc.relationship_types,
    dc.allowed_entities,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE dc.tenant_id = p_tenant_id
    AND (
      'public' = ANY(dc.allowed_entities)
      OR dc.allowed_entities && p_user_permissions
    )
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
