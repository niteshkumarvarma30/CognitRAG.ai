-- Migration 011: Supabase Vault Token Migration
-- Adds encrypted vault reference columns for integration access tokens

ALTER TABLE tenant_integrations
  ADD COLUMN IF NOT EXISTS access_token_vault_id  UUID,
  ADD COLUMN IF NOT EXISTS refresh_token_vault_id UUID;
