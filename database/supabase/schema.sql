-- Enable vector extension for pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create document_chunks table (Matryoshka embeddings typically output 1536, 1024, or 512 dims)
-- We'll assume a standard 1536 initially.
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    parent_id TEXT,
    content TEXT NOT NULL,
    embedding VECTOR(1536), 
    entities JSONB DEFAULT '[]'::jsonb,
    graph_score FLOAT DEFAULT 0.0,
    relationship_types JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Idiomatic Supabase RLS Policies using custom JWT claims
-- This ensures that only requests carrying a JWT with the correct 'tenant_id' can access the data.

CREATE POLICY "Tenant Isolation" ON documents
    AS PERMISSIVE FOR ALL
    USING (tenant_id::text = (current_setting('request.jwt.claims', true)::json->>'tenant_id'))
    WITH CHECK (tenant_id::text = (current_setting('request.jwt.claims', true)::json->>'tenant_id'));

CREATE POLICY "Tenant Isolation" ON document_chunks
    AS PERMISSIVE FOR ALL
    USING (tenant_id::text = (current_setting('request.jwt.claims', true)::json->>'tenant_id'))
    WITH CHECK (tenant_id::text = (current_setting('request.jwt.claims', true)::json->>'tenant_id'));

-- --------------------------------------------------------
-- Vector Search RPC
-- --------------------------------------------------------
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
