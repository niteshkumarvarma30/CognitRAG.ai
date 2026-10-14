-- Migration 008: Restore missing document, tenant, and integration columns

-- 1. Restore documents columns
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS source_type      TEXT,
  ADD COLUMN IF NOT EXISTS source_native_id TEXT,
  ADD COLUMN IF NOT EXISTS language_tag     TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS author           TEXT,
  ADD COLUMN IF NOT EXISTS raw_ref_url      TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'documents_language_tag_check'
    ) THEN
        ALTER TABLE documents
        ADD CONSTRAINT documents_language_tag_check
        CHECK (language_tag IN ('en', 'hi-latn', 'mixed'));
    END IF;
END $$;

-- 2. Restore tenants columns
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS slack_team_id    TEXT,
  ADD COLUMN IF NOT EXISTS slack_team_name  TEXT,
  ADD COLUMN IF NOT EXISTS github_org       TEXT,
  ADD COLUMN IF NOT EXISTS plan             TEXT DEFAULT 'solo';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'tenants_plan_check'
    ) THEN
        ALTER TABLE tenants
        ADD CONSTRAINT tenants_plan_check
        CHECK (plan IN ('solo', 'teams', 'enterprise', 'free'));
    END IF;
END $$;

-- 3. Restore tenant_integrations columns
ALTER TABLE tenant_integrations
  ADD COLUMN IF NOT EXISTS refresh_token    TEXT,
  ADD COLUMN IF NOT EXISTS token_expiry     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS workspace_id     TEXT,
  ADD COLUMN IF NOT EXISTS bot_user_id      TEXT,
  ADD COLUMN IF NOT EXISTS extra_data       JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_active        BOOLEAN DEFAULT true;
