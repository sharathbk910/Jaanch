-- =============================================================================
-- JAANCH DATABASE SCHEMA MIGRATION 0002: RLS POLICIES & RPC FUNCTIONS
-- =============================================================================
-- Specification Authority: docs/SPEC_ORIGINAL.md (Decision D14) & docs/SPEC_ADDENDUM.md
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- -----------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_unknowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE reported_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_feedback ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. PROFILES POLICIES
-- -----------------------------------------------------------------------------

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 3. ORGANIZATIONS POLICIES (Public read-only registry)
-- -----------------------------------------------------------------------------

CREATE POLICY "Public read access to organizations registry"
  ON organizations FOR SELECT
  TO authenticated, anon
  USING (true);

-- -----------------------------------------------------------------------------
-- 4. ANALYSES POLICIES (Strict user isolation; guests persist nothing)
-- -----------------------------------------------------------------------------

CREATE POLICY "Users can view own analyses"
  ON analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON analyses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON analyses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5. CHILD ANALYSIS TABLES POLICIES (Linked via analyses.user_id = auth.uid())
-- -----------------------------------------------------------------------------

-- analysis_signals
CREATE POLICY "Users can view signals for own analyses"
  ON analysis_signals FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = analysis_signals.analysis_id AND analyses.user_id = auth.uid()));

CREATE POLICY "Users can insert signals for own analyses"
  ON analysis_signals FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = analysis_signals.analysis_id AND analyses.user_id = auth.uid()));

CREATE POLICY "Users can delete signals for own analyses"
  ON analysis_signals FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = analysis_signals.analysis_id AND analyses.user_id = auth.uid()));

-- analysis_unknowns
CREATE POLICY "Users can view unknowns for own analyses"
  ON analysis_unknowns FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = analysis_unknowns.analysis_id AND analyses.user_id = auth.uid()));

CREATE POLICY "Users can insert unknowns for own analyses"
  ON analysis_unknowns FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = analysis_unknowns.analysis_id AND analyses.user_id = auth.uid()));

CREATE POLICY "Users can delete unknowns for own analyses"
  ON analysis_unknowns FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = analysis_unknowns.analysis_id AND analyses.user_id = auth.uid()));

-- checklist_items
CREATE POLICY "Users can view checklist items for own analyses"
  ON checklist_items FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = checklist_items.analysis_id AND analyses.user_id = auth.uid()));

CREATE POLICY "Users can insert checklist items for own analyses"
  ON checklist_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = checklist_items.analysis_id AND analyses.user_id = auth.uid()));

CREATE POLICY "Users can update checklist items for own analyses"
  ON checklist_items FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = checklist_items.analysis_id AND analyses.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = checklist_items.analysis_id AND analyses.user_id = auth.uid()));

CREATE POLICY "Users can delete checklist items for own analyses"
  ON checklist_items FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = checklist_items.analysis_id AND analyses.user_id = auth.uid()));

-- analysis_checks
CREATE POLICY "Users can view checks for own analyses"
  ON analysis_checks FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = analysis_checks.analysis_id AND analyses.user_id = auth.uid()));

CREATE POLICY "Users can insert checks for own analyses"
  ON analysis_checks FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = analysis_checks.analysis_id AND analyses.user_id = auth.uid()));

CREATE POLICY "Users can delete checks for own analyses"
  ON analysis_checks FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = analysis_checks.analysis_id AND analyses.user_id = auth.uid()));

-- recruiter_challenges
CREATE POLICY "Users can view recruiter challenges for own analyses"
  ON recruiter_challenges FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = recruiter_challenges.analysis_id AND analyses.user_id = auth.uid()));

CREATE POLICY "Users can insert recruiter challenges for own analyses"
  ON recruiter_challenges FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = recruiter_challenges.analysis_id AND analyses.user_id = auth.uid()));

CREATE POLICY "Users can delete recruiter challenges for own analyses"
  ON recruiter_challenges FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM analyses WHERE analyses.id = recruiter_challenges.analysis_id AND analyses.user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- 6. LINK CHECKS POLICIES
-- -----------------------------------------------------------------------------

CREATE POLICY "Users can view own link checks"
  ON link_checks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users and guests can insert link checks"
  ON link_checks FOR INSERT
  TO authenticated, anon
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 7. REPORTED ENTITIES POLICIES (Only confirmed or suspicious records visible)
-- -----------------------------------------------------------------------------

CREATE POLICY "Public can view confirmed threat indicators"
  ON reported_entities FOR SELECT
  TO authenticated, anon
  USING (status IN ('confirmed', 'suspicious'));

-- -----------------------------------------------------------------------------
-- 8. SCAM REPORTS POLICIES
-- -----------------------------------------------------------------------------

CREATE POLICY "Authenticated users can submit scam reports"
  ON scam_reports FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can view own submitted scam reports"
  ON scam_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 9. FEEDBACK POLICIES
-- -----------------------------------------------------------------------------

CREATE POLICY "Anyone can submit offer feedback"
  ON feedback FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Anyone can submit page feedback"
  ON page_feedback FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 10. RPC FUNCTIONS & TRIGGERS
-- -----------------------------------------------------------------------------

-- Trigger function: Automatically create user profile when user registers via Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RPC Function: Check reported entities (Hashed lookup)
-- Returns confirmed or suspicious matches without leaking private reports
CREATE OR REPLACE FUNCTION check_reported_entities(p_hashes TEXT[])
RETURNS TABLE (
  id UUID,
  entity_type entity_type,
  value_hash TEXT,
  status entity_status,
  report_count INTEGER,
  notes TEXT,
  confirmed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    re.id,
    re.entity_type,
    re.value_hash,
    re.status,
    re.report_count,
    re.notes,
    re.confirmed_at
  FROM reported_entities re
  WHERE re.value_hash = ANY(p_hashes)
    AND re.status IN ('confirmed', 'suspicious', 'ai_flagged');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: Submit scam report atomically
-- Inserts user report and increments or creates reported_entities record
CREATE OR REPLACE FUNCTION submit_scam_report(
  p_entity_type entity_type,
  p_value_hash TEXT,
  p_channel channel_type,
  p_description TEXT
)
RETURNS UUID AS $$
DECLARE
  v_report_id UUID;
BEGIN
  -- Insert the user's specific report
  INSERT INTO scam_reports (
    user_id,
    entity_type,
    value_hash,
    channel,
    description
  ) VALUES (
    auth.uid(),
    p_entity_type,
    p_value_hash,
    p_channel,
    p_description
  )
  RETURNING id INTO v_report_id;

  -- Upsert aggregated reported_entities record
  INSERT INTO reported_entities (
    entity_type,
    value_hash,
    status,
    report_count
  ) VALUES (
    p_entity_type,
    p_value_hash,
    'reported',
    1
  )
  ON CONFLICT (value_hash) DO UPDATE SET
    report_count = reported_entities.report_count + 1,
    updated_at = now();

  RETURN v_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: Submit page feedback
CREATE OR REPLACE FUNCTION submit_page_feedback(
  p_page TEXT,
  p_rating INTEGER,
  p_message TEXT
)
RETURNS UUID AS $$
DECLARE
  v_feedback_id UUID;
BEGIN
  INSERT INTO page_feedback (
    page,
    rating,
    message
  ) VALUES (
    p_page,
    p_rating,
    p_message
  )
  RETURNING id INTO v_feedback_id;

  RETURN v_feedback_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
