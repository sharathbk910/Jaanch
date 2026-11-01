DROP FUNCTION IF EXISTS public.reset_rate_limit(TEXT);
DROP FUNCTION IF EXISTS public.decrement_rate_limit(TEXT);
DROP FUNCTION IF EXISTS public.increment_rate_limit(TEXT, BIGINT);
DROP TABLE IF EXISTS public.rate_limits CASCADE;

