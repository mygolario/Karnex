-- Enable pgvector extension (required for the KbChunk.embedding column).
-- On Supabase this is already available; the IF NOT EXISTS guard makes it safe
-- to re-run.
CREATE EXTENSION IF NOT EXISTS vector;

-- Persian Knowledge Base chunks table.
CREATE TABLE IF NOT EXISTS "KbChunk" (
    "id"         TEXT NOT NULL,
    "source"     TEXT NOT NULL,
    "url"        TEXT NOT NULL,
    "section"    TEXT,
    "text"       TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL DEFAULT 0,
    "verified"   BOOLEAN NOT NULL DEFAULT false,
    "embedding"  vector(1024),
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KbChunk_pkey" PRIMARY KEY ("id")
);

-- Indexes (idempotent).
CREATE INDEX IF NOT EXISTS "KbChunk_source_idx"   ON "KbChunk"("source");
CREATE INDEX IF NOT EXISTS "KbChunk_verified_idx" ON "KbChunk"("verified");

-- HNSW cosine index for fast top-k retrieval. Drop & recreate to keep idempotent.
DROP INDEX IF EXISTS "KbChunk_embedding_idx";
CREATE INDEX "KbChunk_embedding_idx" ON "KbChunk"
  USING hnsw ("embedding" vector_cosine_ops);
