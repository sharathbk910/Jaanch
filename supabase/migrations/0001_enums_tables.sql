-- =============================================================================
-- JAANCH DATABASE SCHEMA MIGRATION 0001: ENUMS & TABLES
-- =============================================================================
-- Consolidates the final architecture specification directly:
-- Specification Authority: docs/SPEC_ORIGINAL.md (Decision D14) & docs/SPEC_ADDENDUM.md
-- =============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- -----------------------------------------------------------------------------
-- 1. ENUM TYPES
-- -----------------------------------------------------------------------------

CREATE TYPE opportunity_domain AS ENUM (
  'job',
  'internship',
  'scholarship',
  'freelance',
  'competition',
  'other',
  'general_message'
);

CREATE TYPE input_type AS ENUM (
  'raw_text',
  'screenshot',
  'pdf_document'
);

CREATE TYPE risk_level AS ENUM (
  'HIGH_RISK',
  'NEEDS_VERIFICATION',
  'NO_MAJOR_WARNING_SIGNS'
);

CREATE TYPE signal_category AS ENUM (
  'payment',
  'urgency',
  'data_request',
  'missing_details',
  'channel',
  'too_good_to_be_true',
  'link',
  'sender_identity',
  'source_authenticity',
  'reported_record',
  'content_quality'
);

CREATE TYPE signal_severity AS ENUM (
  'critical',
  'high',
  'medium',
  'low',
  'info'
);

CREATE TYPE signal_source AS ENUM (
  'rule',
  'ai_observed'
);

CREATE TYPE channel_type AS ENUM (
  'whatsapp',
  'telegram',
  'email',
  'sms',
  'job_portal',
  'other'
);

-- Approved 4-Verdict Model (docs/SPEC_ADDENDUM.md Section 3)
CREATE TYPE verification_status AS ENUM (
  'LIKELY_GENUINE',
  'NEEDS_REVIEW',
  'HIGH_CONCERN',
  'CONFIRMED_SCAM'
);

CREATE TYPE check_outcome AS ENUM (
  'pass',
  'fail',
  'unknown',
  'not_run',
  'user_attested',
  'none_found'
);

CREATE TYPE entity_type AS ENUM (
  'email',
  'domain',
  'phone',
  'upi',
  'bank_account'
);

-- Intelligence Record Lifecycle (docs/SPEC_ADDENDUM.md Section 4)
CREATE TYPE entity_status AS ENUM (
  'reported',
  'unverified',
  'ai_flagged',
  'suspicious',
  'confirmed',
  'dismissed',
  'disputed'
);

CREATE TYPE org_kind AS ENUM (
  'corporation',
  'government',
  'educational',
  'ngo',
  'other'
);

-- -----------------------------------------------------------------------------
-- 2. USER PROFILES TABLE (Mirrors auth.users)
-- -----------------------------------------------------------------------------

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi', 'kn')),
  default_share_indicators BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 3. ORGANIZATIONS REGISTRY
-- -----------------------------------------------------------------------------

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind org_kind NOT NULL DEFAULT 'corporation',
  primary_domain TEXT NOT NULL UNIQUE,
  domains TEXT[] NOT NULL DEFAULT '{}',
  official_portal_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  needs_team_review BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_primary_domain ON organizations(primary_domain);
CREATE INDEX idx_organizations_name_trgm ON organizations USING gin(name gin_trgm_ops);

-- -----------------------------------------------------------------------------
-- 4. ANALYSES TABLE (Logged-in user saved analyses; guests persist nothing)
-- -----------------------------------------------------------------------------

CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain opportunity_domain NOT NULL DEFAULT 'other',
  verification_status verification_status NOT NULL,
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  matched_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  sender_email_domain TEXT,
  headers_supplied BOOLEAN NOT NULL DEFAULT false,
  listing_match_status check_outcome NOT NULL DEFAULT 'not_run',
  unverified TEXT[] NOT NULL DEFAULT '{}',
  recommended_actions TEXT[] NOT NULL DEFAULT '{}',
  audit_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX idx_analyses_status ON analyses(verification_status);

-- -----------------------------------------------------------------------------
-- 5. ANALYSIS SIGNALS (Signals identified during analysis)
-- -----------------------------------------------------------------------------

CREATE TABLE analysis_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL,
  category signal_category NOT NULL DEFAULT 'content_quality',
  title TEXT NOT NULL,
  why_it_matters TEXT NOT NULL,
  evidence TEXT NOT NULL,
  severity signal_severity NOT NULL,
  source signal_source NOT NULL DEFAULT 'rule',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analysis_signals_analysis_id ON analysis_signals(analysis_id);

-- -----------------------------------------------------------------------------
-- 6. ANALYSIS UNKNOWNS
-- -----------------------------------------------------------------------------

CREATE TABLE analysis_unknowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  detail_key TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analysis_unknowns_analysis_id ON analysis_unknowns(analysis_id);

-- -----------------------------------------------------------------------------
-- 7. CHECKLIST ITEMS (Student next steps checklist)
-- -----------------------------------------------------------------------------

CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_checklist_analysis_step UNIQUE(analysis_id, step_key)
);

CREATE INDEX idx_checklist_items_analysis_id ON checklist_items(analysis_id);

-- -----------------------------------------------------------------------------
-- 8. ANALYSIS CHECKS (Coverage: k of 8 independent checks)
-- -----------------------------------------------------------------------------

CREATE TABLE analysis_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  check_id TEXT NOT NULL,
  outcome check_outcome NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analysis_checks_analysis_id ON analysis_checks(analysis_id);

-- -----------------------------------------------------------------------------
-- 9. LINK CHECKS TABLE
-- -----------------------------------------------------------------------------

CREATE TABLE link_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  hostname TEXT NOT NULL,
  risk_level risk_level NOT NULL,
  signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_link_checks_user_id ON link_checks(user_id);

-- -----------------------------------------------------------------------------
-- 10. RECRUITER CHALLENGES (Saved challenge/safe-reply drafts)
-- -----------------------------------------------------------------------------

CREATE TABLE recruiter_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL CHECK (template_type IN ('challenge', 'safe_reply')),
  generated_body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recruiter_challenges_analysis_id ON recruiter_challenges(analysis_id);

-- -----------------------------------------------------------------------------
-- 11. THREAT INTELLIGENCE: REPORTED ENTITIES (Hashed with REPORT_HASH_PEPPER)
-- -----------------------------------------------------------------------------

CREATE TABLE reported_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type entity_type NOT NULL,
  value_hash TEXT NOT NULL UNIQUE,
  status entity_status NOT NULL DEFAULT 'unverified',
  report_count INTEGER NOT NULL DEFAULT 1 CHECK (report_count >= 1),
  notes TEXT,
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reported_entities_value_hash ON reported_entities(value_hash);
CREATE INDEX idx_reported_entities_status ON reported_entities(status);

-- -----------------------------------------------------------------------------
-- 12. SCAM REPORTS (User-submitted community reports)
-- -----------------------------------------------------------------------------

CREATE TABLE scam_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type entity_type NOT NULL,
  value_hash TEXT NOT NULL,
  channel channel_type NOT NULL DEFAULT 'other',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scam_reports_value_hash ON scam_reports(value_hash);

-- -----------------------------------------------------------------------------
-- 13. FEEDBACK TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE page_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
