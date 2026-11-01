-- =============================================================================
-- JAANCH – Database Index EXPLAIN Plan Verification Script
-- Run against a PostgreSQL database with Jaanch schema applied
-- Demonstrates index usage for all core matching and high-throughput queries.
-- =============================================================================

-- 1. Exact Submission Hash Match (O(1) index scan on normalized_hash)
EXPLAIN (COSTS, BUFFERS, VERBOSE)
SELECT id, public_id, status, category, scrubbed_text, first_reported_at, confirmed_at
FROM intel_records
WHERE normalized_hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

-- Expected plan:
-- Index Scan using idx_intel_records_normalized_hash on public.intel_records

-- 2. Indicator Value Hash Match (O(1) index scan on value_hash)
EXPLAIN (COSTS, BUFFERS, VERBOSE)
SELECT i.id, i.record_id, i.type, i.value_hash, i.masked_display, r.status
FROM intel_indicators i
JOIN intel_records r ON i.record_id = r.id
WHERE i.value_hash = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';

-- Expected plan:
-- Nested Loop
--   -> Index Scan using idx_intel_indicators_value_hash on public.intel_indicators
--   -> Index Scan using intel_records_pkey on public.intel_records

-- 3. Trigram Text Similarity Matching (GIN Trigram Index Scan)
EXPLAIN (COSTS, BUFFERS, VERBOSE)
SELECT id, public_id, status, category, scrubbed_text,
       similarity(scrubbed_text, 'URGENT Electricity disconnection notice. Call electricity officer immediately')::FLOAT AS similarity_score
FROM intel_records
WHERE status IN ('confirmed', 'suspicious')
  AND similarity(scrubbed_text, 'URGENT Electricity disconnection notice. Call electricity officer immediately') >= 0.60
ORDER BY similarity_score DESC
LIMIT 5;

-- Expected plan:
-- Bitmap Heap Scan on public.intel_records
--   Recheck Cond: (scrubbed_text % 'URGENT Electricity disconnection notice...'::text)
--   Filter: (status = ANY ('{confirmed,suspicious}'::entity_status[]))
--   -> Bitmap Index Scan on idx_intel_records_scrubbed_trgm

-- 4. Vector HNSW Cosine Distance (Approximate Nearest Neighbors)
EXPLAIN (COSTS, BUFFERS, VERBOSE)
SELECT id, public_id, status, category, scrubbed_text,
       (1.0 - (embedding <=> '[0.01, 0.02, 0.03]'::vector))::FLOAT AS semantic_score
FROM intel_records
WHERE status IN ('confirmed', 'suspicious')
  AND embedding IS NOT NULL
ORDER BY embedding <=> '[0.01, 0.02, 0.03]'::vector
LIMIT 5;

-- Expected plan:
-- Index Scan using idx_intel_records_embedding_hnsw on public.intel_records
--   Order By: (embedding <=> '[0.01, 0.02, 0.03]'::vector)
--   Filter: (status = ANY ('{confirmed,suspicious}'::entity_status[]))

-- 5. Persistent Rate Limit Expiration Cleanup (Index Scan on reset_at)
EXPLAIN (COSTS, BUFFERS, VERBOSE)
DELETE FROM rate_limits
WHERE reset_at <= NOW();

-- Expected plan:
-- Delete on public.rate_limits
--   -> Index Scan using idx_rate_limits_reset_at on public.rate_limits
--        Index Cond: (reset_at <= now())

