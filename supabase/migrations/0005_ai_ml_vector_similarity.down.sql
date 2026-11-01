-- Down-migration for 0005_ai_ml_vector_similarity.sql

DROP FUNCTION IF EXISTS match_intel_semantic(vector(768), FLOAT, INT);
DROP FUNCTION IF EXISTS match_intel_similarity(TEXT, FLOAT, INT);
DROP INDEX IF EXISTS idx_intel_records_embedding_hnsw;
ALTER TABLE intel_records DROP COLUMN IF EXISTS embedding;
DROP INDEX IF EXISTS idx_intel_records_scrubbed_trgm;

