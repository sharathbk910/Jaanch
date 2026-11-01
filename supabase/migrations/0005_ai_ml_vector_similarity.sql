-- =============================================================================
-- JAANCH – Supabase PostgreSQL Migration 0005: AI/ML Similarity & Semantic Embeddings
-- Objects:
--   1. pg_trgm & vector extensions
--   2. GIN trigram index on intel_records(scrubbed_text)
--   3. embedding column vector(768) on intel_records (for scrubbed intel only)
--   4. HNSW cosine index on intel_records(embedding)
--   5. Stored functions for similarity and semantic matching
-- Invariants:
--   - Matches strictly against status IN ('confirmed', 'suspicious')
--   - Embeddings stored strictly for scrubbed intel text, never raw student submissions
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. GIN trigram index for fast text similarity
CREATE INDEX IF NOT EXISTS idx_intel_records_scrubbed_trgm 
  ON intel_records USING gin (scrubbed_text gin_trgm_ops);

-- 2. Embedding column on intel_records
ALTER TABLE intel_records ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. HNSW cosine distance index
CREATE INDEX IF NOT EXISTS idx_intel_records_embedding_hnsw 
  ON intel_records USING hnsw (embedding vector_cosine_ops);

-- 4. Stored function: match_intel_similarity
CREATE OR REPLACE FUNCTION match_intel_similarity(
  query_text TEXT,
  similarity_threshold FLOAT DEFAULT 0.60,
  match_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  public_id TEXT,
  status entity_status,
  category TEXT,
  scrubbed_text TEXT,
  similarity_score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.public_id,
    r.status,
    r.category,
    r.scrubbed_text,
    similarity(r.scrubbed_text, query_text)::FLOAT AS similarity_score
  FROM intel_records r
  WHERE r.status IN ('confirmed', 'suspicious')
    AND similarity(r.scrubbed_text, query_text) >= similarity_threshold
  ORDER BY similarity_score DESC
  LIMIT match_limit;
END;
$$;

-- 5. Stored function: match_intel_semantic
CREATE OR REPLACE FUNCTION match_intel_semantic(
  query_embedding vector(768),
  similarity_threshold FLOAT DEFAULT 0.75,
  match_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  public_id TEXT,
  status entity_status,
  category TEXT,
  scrubbed_text TEXT,
  similarity_score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.public_id,
    r.status,
    r.category,
    r.scrubbed_text,
    (1 - (r.embedding <=> query_embedding))::FLOAT AS similarity_score
  FROM intel_records r
  WHERE r.status IN ('confirmed', 'suspicious')
    AND r.embedding IS NOT NULL
    AND (1 - (r.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY r.embedding <=> query_embedding ASC
  LIMIT match_limit;
END;
$$;
