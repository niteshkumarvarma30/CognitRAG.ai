-- Migration 003: Language Tag
-- Ensures language_tag column and constraint exists on documents and chunks

ALTER TABLE documents ADD COLUMN IF NOT EXISTS language_tag TEXT DEFAULT 'en';
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS language_tag TEXT DEFAULT 'en';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'documents_language_tag_check'
    ) THEN
        ALTER TABLE documents ADD CONSTRAINT documents_language_tag_check CHECK (language_tag IN ('en', 'hi-latn', 'mixed'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'document_chunks_language_tag_check'
    ) THEN
        ALTER TABLE document_chunks ADD CONSTRAINT document_chunks_language_tag_check CHECK (language_tag IN ('en', 'hi-latn', 'mixed'));
    END IF;
END $$;
