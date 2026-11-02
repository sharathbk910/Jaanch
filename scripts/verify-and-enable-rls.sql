-- =============================================================================
-- JAANCH – Database Row Level Security (RLS) Verification & Enforcement Script
--
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/_/sql
-- 2. Paste this entire script into the SQL Editor.
-- 3. Click "RUN" (or Ctrl + Enter).
-- 4. Review the returned table to confirm every table shows 'ENABLED (SECURE)'.
-- =============================================================================

-- Step 1: Ensure Row Level Security is explicitly enabled on all known Jaanch tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.detection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analysis_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analysis_unknowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analysis_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.link_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recruiter_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reported_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.scam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.page_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.domain_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.intel_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.intel_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.intel_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Step 2: Dynamically enable RLS on ANY additional public tables
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN (
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', rec.tablename);
  END LOOP;
END $$;

-- Step 3: Safety Assert - verify zero public tables have RLS disabled
DO $$
DECLARE
  unsecured_tables TEXT;
BEGIN
  SELECT string_agg(c.relname, ', ')
  INTO unsecured_tables
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relrowsecurity = FALSE;

  IF unsecured_tables IS NOT NULL THEN
    RAISE EXCEPTION 'CRITICAL SECURITY ALERT: Tables found with RLS disabled: %', unsecured_tables;
  ELSE
    RAISE NOTICE 'SUCCESS: All public tables have Row Level Security (RLS) properly enabled.';
  END IF;
END $$;

-- Step 4: Output comprehensive RLS audit report
SELECT 
  c.relname AS "Table Name",
  CASE 
    WHEN c.relrowsecurity THEN 'ENABLED (SECURE)' 
    ELSE 'DISABLED (VULNERABLE)' 
  END AS "RLS Status",
  CASE 
    WHEN c.relforcerowsecurity THEN 'YES (FORCED)' 
    ELSE 'NO' 
  END AS "Force RLS for Table Owner",
  (SELECT count(*) FROM pg_policy p WHERE p.polrelid = c.oid) AS "Active Policies Count"
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relkind = 'r'
ORDER BY c.relname ASC;
