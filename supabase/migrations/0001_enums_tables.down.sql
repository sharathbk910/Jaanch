-- =============================================================================
-- JAANCH DATABASE SCHEMA DOWN-MIGRATION 0001: REVERT ENUMS & TABLES
-- =============================================================================

-- Drop tables in reverse order of foreign key dependencies
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS detection_results CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS page_feedback CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS scam_reports CASCADE;
DROP TABLE IF EXISTS reported_entities CASCADE;
DROP TABLE IF EXISTS recruiter_challenges CASCADE;
DROP TABLE IF EXISTS link_checks CASCADE;
DROP TABLE IF EXISTS analysis_checks CASCADE;
DROP TABLE IF EXISTS checklist_items CASCADE;
DROP TABLE IF EXISTS analysis_unknowns CASCADE;
DROP TABLE IF EXISTS analysis_signals CASCADE;
DROP TABLE IF EXISTS analyses CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop enumerated types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS org_kind CASCADE;
DROP TYPE IF EXISTS entity_status CASCADE;
DROP TYPE IF EXISTS entity_type CASCADE;
DROP TYPE IF EXISTS check_outcome CASCADE;
DROP TYPE IF EXISTS verification_status CASCADE;
DROP TYPE IF EXISTS channel_type CASCADE;
DROP TYPE IF EXISTS signal_source CASCADE;
DROP TYPE IF EXISTS signal_severity CASCADE;
DROP TYPE IF EXISTS signal_category CASCADE;
DROP TYPE IF EXISTS risk_level CASCADE;
DROP TYPE IF EXISTS input_type CASCADE;
DROP TYPE IF EXISTS opportunity_domain CASCADE;

