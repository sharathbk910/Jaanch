-- =============================================================================
-- JAANCH DATABASE SCHEMA DOWN-MIGRATION 0002: REVERT RLS POLICIES & FUNCTIONS
-- =============================================================================

-- Drop triggers and trigger functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON profiles;
DROP FUNCTION IF EXISTS protect_profile_role_update() CASCADE;

-- Drop RPC security definer functions
DROP FUNCTION IF EXISTS submit_page_feedback(TEXT, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS submit_scam_report(entity_type, TEXT, channel_type, TEXT) CASCADE;
DROP FUNCTION IF EXISTS check_reported_entities(TEXT[]) CASCADE;

