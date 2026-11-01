-- =============================================================================
-- JAANCH – Supabase PostgreSQL Migration 0004: Shared Scam Intelligence + Moderation
-- Schema Objects:
--   1. domain_allowlist (known-legitimate domains that can never be confirmed as scam)
--   2. intel_records (shared threat records, scrubbed text, peppered normalized hash)
--   3. intel_indicators (extracted contact/payment indicators, peppered hash, masked display)
--   4. intel_reports (deduplicated per-user reports linking to intel_records)
--   5. moderation_actions (immutable audit log of moderator state transitions & edits)
-- RLS:
--   - Reporters see only their own reports (reporter_id = auth.uid())
--   - Public sees only confirmed records' public fields
--   - Moderators have queue/triage access
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. DOMAIN ALLOWLIST
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS domain_allowlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed legitimate educational, corporate, and government domains
INSERT INTO domain_allowlist (domain) VALUES
  ('tcs.com'),
  ('infosys.com'),
  ('wipro.com'),
  ('hcltech.com'),
  ('accenture.com'),
  ('cognizant.com'),
  ('ibm.com'),
  ('microsoft.com'),
  ('google.com'),
  ('amazon.com'),
  ('amazon.in'),
  ('sbi.co.in'),
  ('aicte-india.org'),
  ('scholarships.gov.in'),
  ('mca.gov.in'),
  ('ncs.gov.in'),
  ('gov.in'),
  ('nic.in'),
  ('ac.in'),
  ('edu.in')
ON CONFLICT (domain) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. INTEL RECORDS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS intel_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id TEXT NOT NULL UNIQUE,
  status entity_status NOT NULL DEFAULT 'reported',
  category TEXT NOT NULL DEFAULT 'other',
  scrubbed_text TEXT NOT NULL,
  normalized_hash TEXT NOT NULL,
  first_reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intel_records_normalized_hash ON intel_records(normalized_hash);
CREATE INDEX IF NOT EXISTS idx_intel_records_status ON intel_records(status);
CREATE INDEX IF NOT EXISTS idx_intel_records_public_id ON intel_records(public_id);

-- -----------------------------------------------------------------------------
-- 3. INTEL INDICATORS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS intel_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES intel_records(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('url', 'domain', 'phone', 'upi')),
  value_hash TEXT NOT NULL,
  masked_display TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intel_indicators_value_hash ON intel_indicators(value_hash);
CREATE INDEX IF NOT EXISTS idx_intel_indicators_record_id ON intel_indicators(record_id);

-- -----------------------------------------------------------------------------
-- 4. INTEL REPORTS (Deduplicated per-user reports)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS intel_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES intel_records(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(record_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_intel_reports_record_id ON intel_reports(record_id);
CREATE INDEX IF NOT EXISTS idx_intel_reports_reporter_id ON intel_reports(reporter_id);

-- -----------------------------------------------------------------------------
-- 5. MODERATION ACTIONS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES intel_records(id) ON DELETE CASCADE,
  moderator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('confirm', 'dismiss', 'dispute', 'retract', 'edit_scrubbing')),
  reason TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_record_id ON moderation_actions(record_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_moderator_id ON moderation_actions(moderator_id);

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

ALTER TABLE domain_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;

-- domain_allowlist: public read, moderator write
CREATE POLICY "Public can view domain allowlist"
  ON domain_allowlist FOR SELECT
  USING (true);

-- intel_records:
-- Public can view only confirmed records
CREATE POLICY "Public sees confirmed intel records"
  ON intel_records FOR SELECT
  USING (status = 'confirmed');

-- Moderators can view, insert, update all intel records
CREATE POLICY "Moderators manage intel records"
  ON intel_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'moderator'
    )
  );

-- intel_indicators:
-- Public can view indicators associated with confirmed records
CREATE POLICY "Public sees confirmed indicators"
  ON intel_indicators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM intel_records r
      WHERE r.id = intel_indicators.record_id
      AND r.status = 'confirmed'
    )
  );

-- Moderators manage indicators
CREATE POLICY "Moderators manage indicators"
  ON intel_indicators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'moderator'
    )
  );

-- intel_reports:
-- Reporters see only their own reports
CREATE POLICY "Reporters see only their own reports"
  ON intel_reports FOR SELECT
  USING (reporter_id = auth.uid());

CREATE POLICY "Authenticated users submit reports"
  ON intel_reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

-- Moderators view all reports
CREATE POLICY "Moderators view all reports"
  ON intel_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'moderator'
    )
  );

-- moderation_actions:
-- Only moderators can access and create moderation action logs
CREATE POLICY "Moderators access moderation actions"
  ON moderation_actions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'moderator'
    )
  );
