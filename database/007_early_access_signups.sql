-- ============================================================================
-- CognitRAG - Patch 007: Early Access Signups Table
-- Spec: CognitRAG Homepage Rebuild Plan - Section 6
-- ============================================================================

CREATE TABLE IF NOT EXISTS early_access_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  team_size TEXT,
  tools TEXT[] DEFAULT ARRAY[]::TEXT[],
  hinglish_use TEXT,
  message TEXT,
  source TEXT DEFAULT 'homepage',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_early_access_email ON early_access_signups (lower(email));

ALTER TABLE early_access_signups ENABLE ROW LEVEL SECURITY;

-- Revoke all access from anon and authenticated browser roles (backend only via service_role)
REVOKE ALL ON early_access_signups FROM anon, authenticated;
GRANT ALL ON early_access_signups TO service_role;
