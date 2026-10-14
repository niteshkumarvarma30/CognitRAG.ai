-- Migration 002: Add claim-level source reference columns to existing tables
-- Run this if upgrading from a pre-v2 schema

ALTER TABLE documents ADD COLUMN IF NOT EXISTS source_type TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS source_native_id TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS language_tag TEXT DEFAULT 'en';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS raw_ref_url TEXT;

ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS block_id TEXT;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS start_char INTEGER DEFAULT 0;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS end_char INTEGER DEFAULT 0;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS language_tag TEXT DEFAULT 'en';
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS source_type TEXT;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS raw_ref_url TEXT;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS author TEXT;

-- Update existing chunks to have public access
UPDATE document_chunks SET allowed_entities = ARRAY['public'] WHERE allowed_entities IS NULL;
