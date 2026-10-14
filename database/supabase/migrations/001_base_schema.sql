-- Migration 001: Base Schema
-- Creates extensions, tenants, documents, and document_chunks

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS tenants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slack_team_id       TEXT,
    slack_team_name     TEXT,
    github_org          TEXT,
    plan        TEXT DEFAULT 'free',
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    filename          TEXT,
    source_type       TEXT,
    source_native_id  TEXT,
    language_tag      TEXT DEFAULT 'en',
    author            TEXT,
    raw_ref_url       TEXT,
    status            TEXT DEFAULT 'pending',
    created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    parent_id       TEXT,
    block_id        TEXT,
    start_char      INTEGER DEFAULT 0,
    end_char        INTEGER DEFAULT 0,
    content         TEXT NOT NULL,
    language_tag    TEXT DEFAULT 'en',
    source_type     TEXT,
    raw_ref_url     TEXT,
    author          TEXT,
    embedding       VECTOR(1024),
    entities        JSONB DEFAULT '[]'::jsonb,
    graph_score     FLOAT DEFAULT 0.0,
    relationship_types JSONB DEFAULT '[]'::jsonb,
    allowed_entities   TEXT[] DEFAULT ARRAY['public'],
    created_at      TIMESTAMPTZ DEFAULT now()
);
