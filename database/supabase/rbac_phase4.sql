-- =================================================================
-- Phase 4: RBAC — Admin-only policy for semantic definitions
-- =================================================================
-- Run this in the Supabase SQL Editor.
-- This ensures that only users with the 'admin' role can create,
-- update, or delete governed business definitions.

-- Drop any existing conflicting policies if you already created them
DROP POLICY IF EXISTS "Admins only" ON semantic_definitions;

-- Create the Admin-only RBAC policy
CREATE POLICY "Admins only" ON semantic_definitions
    FOR ALL
    USING ((current_setting('request.jwt.claims', true)::json->>'user_role') = 'admin')
    WITH CHECK ((current_setting('request.jwt.claims', true)::json->>'user_role') = 'admin');

-- Note: The "Tenant Isolation" policy handles standard read access for everyone in the tenant.
-- The "Admins only" policy restricts ALL operations (including writes) to admins.
