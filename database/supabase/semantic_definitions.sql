-- =================================================================
-- Phase 1: Semantic Dictionary (Ontology Store)
-- =================================================================
-- Run this in the Supabase SQL Editor AFTER getting user approval.
-- This creates the governed business definitions table.

CREATE TABLE IF NOT EXISTS semantic_definitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    term TEXT NOT NULL,
    definition TEXT NOT NULL,
    owner TEXT,         -- e.g. "CFO", "CTO", "Head of Sales"
    scope TEXT,         -- e.g. "finance", "product", "sales"
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, term)
);

-- Enable Row Level Security
ALTER TABLE semantic_definitions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Tenants can only see their own definitions
DROP POLICY IF EXISTS "Tenant Isolation" ON semantic_definitions;
CREATE POLICY "Tenant Isolation" ON semantic_definitions
    AS PERMISSIVE FOR ALL
    USING (tenant_id::text = (current_setting('request.jwt.claims', true)::json->>'tenant_id'))
    WITH CHECK (tenant_id::text = (current_setting('request.jwt.claims', true)::json->>'tenant_id'));

-- =================================================================
-- Phase 4: RBAC — Admin-only policy for semantic definitions
-- =================================================================
-- Uncomment and run AFTER Phase 4 backend is implemented.
--
-- DROP POLICY IF EXISTS "Admins only" ON semantic_definitions;
-- CREATE POLICY "Admins only" ON semantic_definitions
--     FOR ALL USING ((current_setting('request.jwt.claims', true)::json->>'user_role') = 'admin');

-- =================================================================
-- Sample Data (Optional) — Seed with example governed definitions
-- =================================================================
-- Replace 'YOUR-TENANT-UUID-HERE' with the actual tenant UUID from your tenants table.
--
-- INSERT INTO semantic_definitions (tenant_id, term, definition, owner, scope) VALUES
--   ('YOUR-TENANT-UUID-HERE', 'monthly revenue', 'Sum of all paid invoices, excluding refunds, for the current calendar month.', 'CFO', 'finance'),
--   ('YOUR-TENANT-UUID-HERE', 'churn risk', 'Users with 0 logins in the last 90 days who have an active subscription.', 'CTO', 'product'),
--   ('YOUR-TENANT-UUID-HERE', 'active customer', 'Any account with a paid subscription not cancelled in the last 30 days.', 'Head of Sales', 'sales');
