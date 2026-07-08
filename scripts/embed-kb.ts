/**
 * Embed kb-chunks.jsonl with BAAI/bge-m3 and load into Supabase `KbChunk`
 * (pgvector). Idempotent: deletes existing rows for a source before re-inserting.
 *
 * Run:
 *   npx tsx --env-file=.env.local --env-file=.env scripts/embed-kb.ts
 *
 * Requires: HUGGINGFACE_API_TOKEN, DATABASE_URL
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import prisma from "../lib/prisma";
import { embedTexts, BGE_M3_DIM } from "../lib/ai/embeddings";

interface ChunkRecord {
  id: string;
  source: string;
  url: string;
  section: string;
  text: string;
  chunkIndex: number;
  fetchedAt: string;
}

const INPUT_PATH = resolve(process.cwd(), "kb-chunks.jsonl");
const BATCH_SIZE = 16;

function formatVector(vec: number[]): string {
  return `[${vec.map((v) => Number(v.toFixed(6))).join(",")}]`;
}

async function insertBatch(rows: ChunkRecord[], vectors: number[][]) {
  // Build a single multi-row INSERT with parameterized vector literals.
  const values: string[] = [];
  const params: unknown[] = [];
  let p = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const v = vectors[i];
    if (!v || v.length !== BGE_M3_DIM) {
      console.warn(`skip ${r.id}: bad vector (len=${v?.length})`);
      continue;
    }
    values.push(
      `($${++p},$${++p},$${++p},$${++p},$${++p},$${++p},$${++p},$${++p}::vector)`
    );
    params.push(r.id, r.source, r.url, r.section || null, r.text, r.chunkIndex, false, formatVector(v));
  }
  if (values.length === 0) return;
  const sql = `INSERT INTO "KbChunk" ("id","source","url","section","text","chunkIndex","verified","embedding") VALUES ${values.join(
    ","
  )}`;
  await prisma.$executeRawUnsafe(sql, ...params);
}

async function main() {
  const raw = readFileSync(INPUT_PATH, "utf-8");
  const records: ChunkRecord[] = raw
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as ChunkRecord);

  const bySource = new Map<string, ChunkRecord[]>();
  for (const r of records) {
    const arr = bySource.get(r.source) ?? [];
    arr.push(r);
    bySource.set(r.source, arr);
  }

  let inserted = 0;
  for (const [source, rows] of bySource) {
    console.log(`\n=== ${source} (${rows.length} chunks) ===`);
    // Idempotent: clear prior rows for this source.
    await prisma.$executeRawUnsafe(`DELETE FROM "KbChunk" WHERE "source" = $1`, source);

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const texts = batch.map((r) => r.text.slice(0, 8000));
      const vectors = await embedTexts(texts);
      await insertBatch(batch, vectors);
      inserted += batch.length;
      console.log(`  embedded ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
    }
  }

  console.log(`\nDone. Inserted ${inserted} chunks.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("embed-kb failed:", err);
  process.exit(1);
});
