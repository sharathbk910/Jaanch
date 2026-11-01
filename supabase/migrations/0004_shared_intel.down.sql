-- =============================================================================
-- JAANCH – Supabase PostgreSQL Migration 0004 Down: Shared Scam Intelligence
-- Drops tables in safe reverse-dependency order
-- =============================================================================

DROP POLICY IF EXISTS "Moderators access moderation actions" ON moderation_actions;
DROP POLICY IF EXISTS "Moderators view all reports" ON intel_reports;
DROP POLICY IF EXISTS "Authenticated users submit reports" ON intel_reports;
DROP POLICY IF EXISTS "Reporters see only their own reports" ON intel_reports;
DROP POLICY IF EXISTS "Moderators manage indicators" ON intel_indicators;
DROP POLICY IF EXISTS "Public sees confirmed indicators" ON intel_indicators;
DROP POLICY IF EXISTS "Moderators manage intel records" ON intel_records;
DROP POLICY IF EXISTS "Public sees confirmed intel records" ON intel_records;
DROP POLICY IF EXISTS "Public can view domain allowlist" ON domain_allowlist;

DROP TABLE IF EXISTS moderation_actions CASCADE;
DROP TABLE IF EXISTS intel_reports CASCADE;
DROP TABLE IF EXISTS intel_indicators CASCADE;
DROP TABLE IF EXISTS intel_records CASCADE;
DROP TABLE IF EXISTS domain_allowlist CASCADE;
