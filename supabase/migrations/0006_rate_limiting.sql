-- =============================================================================
-- JAANCH – Supabase PostgreSQL Migration 0006: Persistent Rate Limiting
-- Objects:
--   1. rate_limits table (persistent hit counts across clustered instances)
--   2. increment_rate_limit stored function (atomic sliding window upsert)
--   3. decrement_rate_limit stored function
--   4. reset_rate_limit stored function
-- Invariants:
--   - Atomic increment ensures exact counting under high concurrency across nodes
--   - RLS enabled; only service_role / internal functions have access
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key TEXT PRIMARY KEY,
  hits INTEGER NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON public.rate_limits (reset_at);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'rate_limits' AND policyname = 'service_role_rate_limits_all'
  ) THEN
    CREATE POLICY service_role_rate_limits_all ON public.rate_limits
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- Atomic increment function
CREATE OR REPLACE FUNCTION public.increment_rate_limit(
  p_key TEXT,
  p_window_ms BIGINT
)
RETURNS TABLE (
  total_hits INTEGER,
  reset_time TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_expires_at TIMESTAMPTZ;
  v_hits INTEGER;
BEGIN
  v_expires_at := v_now + (p_window_ms || ' milliseconds')::INTERVAL;

  INSERT INTO public.rate_limits (key, hits, reset_at, updated_at)
  VALUES (p_key, 1, v_expires_at, v_now)
  ON CONFLICT (key) DO UPDATE
  SET 
    hits = CASE 
      WHEN public.rate_limits.reset_at <= v_now THEN 1 
      ELSE public.rate_limits.hits + 1 
    END,
    reset_at = CASE 
      WHEN public.rate_limits.reset_at <= v_now THEN v_expires_at 
      ELSE public.rate_limits.reset_at 
    END,
    updated_at = v_now
  RETURNING public.rate_limits.hits, public.rate_limits.reset_at
  INTO v_hits, v_expires_at;

  RETURN QUERY SELECT v_hits, v_expires_at;
END;
$$;

-- Decrement function
CREATE OR REPLACE FUNCTION public.decrement_rate_limit(
  p_key TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.rate_limits
  SET hits = GREATEST(0, hits - 1),
      updated_at = clock_timestamp()
  WHERE key = p_key AND reset_at > clock_timestamp();
END;
$$;

-- Reset function
CREATE OR REPLACE FUNCTION public.reset_rate_limit(
  p_key TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE key = p_key;
END;
$$;

