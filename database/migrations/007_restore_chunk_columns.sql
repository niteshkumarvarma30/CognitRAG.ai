-- Migration 007: Restore missing document_chunks columns
-- Reconciles live Supabase schema with application code expectations

ALTER TABLE document_chunks
  ADD COLUMN IF NOT EXISTS block_id       TEXT,
  ADD COLUMN IF NOT EXISTS start_char     INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS end_char       INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS language_tag   TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS source_type    TEXT,
  ADD COLUMN IF NOT EXISTS raw_ref_url    TEXT,
  ADD COLUMN IF NOT EXISTS author         TEXT,
  ADD COLUMN IF NOT EXISTS allowed_entities TEXT[] DEFAULT ARRAY['public'];

-- Ensure constraint on language_tag
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'document_chunks_language_tag_check'
    ) THEN
        ALTER TABLE document_chunks
        ADD CONSTRAINT document_chunks_language_tag_check
        CHECK (language_tag IN ('en', 'hi-latn', 'mixed'));
    END IF;
END $$;

-- Backfill existing chunks to have 'public' allowed_entities if null
UPDATE document_chunks
SET allowed_entities = ARRAY['public']
WHERE allowed_entities IS NULL;

-- Backfill source_type for existing chunks based on document filenames
UPDATE document_chunks dc
SET source_type = CASE
  WHEN d.filename ILIKE 'PR_%'        THEN 'github'
  WHEN d.filename ILIKE 'slack_%'     THEN 'slack'
  WHEN d.filename ILIKE 'jira_%'      THEN 'jira'
  WHEN d.filename ILIKE 'RFC-%'       THEN 'notion'
  ELSE 'general'
END
FROM documents d
WHERE dc.document_id = d.id
  AND dc.source_type IS NULL;
