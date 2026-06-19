-- 1. Add new columns to document_chunks
ALTER TABLE document_chunks
ADD COLUMN IF NOT EXISTS parent_id TEXT,
ADD COLUMN IF NOT EXISTS entities JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS graph_score FLOAT DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS relationship_types JSONB DEFAULT '[]'::jsonb;

-- 2. Drop the old function if it exists so we can recreate it with the new return type
DROP FUNCTION IF EXISTS match_document_chunks(vector(1536), int, uuid);

-- 3. Create the new matching function that returns the metadata
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(1536),
  match_count int,
  p_tenant_id uuid
) RETURNS TABLE (
  id uuid,
  content text,
  parent_id text,
  entities jsonb,
  graph_score float,
  relationship_types jsonb,
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
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE dc.tenant_id = p_tenant_id
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
