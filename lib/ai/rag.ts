import "server-only";

/**
 * RAG retrieval over the Persian Knowledge Base (KbChunk + pgvector).
 *
 * Used to ground plan-gen, roadmap step guides, and (optionally) Copilot with
 * authoritative Iranian regulatory content (e‌namad, samandehi, nic, tax, ...).
 *
 * All retrieval is best-effort: if embeddings/DB are unavailable or the query
 * fails, callers get an empty result and continue un-grounded.
 */

import prisma from "@/lib/prisma";
import { embedText, isEmbeddingsConfigured, BGE_M3_DIM } from "@/lib/ai/embeddings";

export interface KbSnippet {
  id: string;
  source: string;
  url: string;
  section: string | null;
  text: string;
  score: number; // 1 - cosine_distance (higher is better)
}

export interface KbRetrievalOptions {
  k?: number;
  /** Only return chunks from these sources (e.g. ["enamad","tax"]). */
  sources?: string[];
  /** Skip chunks shorter than this many chars. */
  minChars?: number;
  /** Max chars of text to return per snippet (truncated). */
  maxCharsPerSnippet?: number;
}

function formatVector(vec: number[]): string {
  return `[${vec.map((v) => Number(v.toFixed(6))).join(",")}]`;
}

/**
 * Retrieve the top-k KbChunk rows by cosine distance to `query`.
 * Returns [] if embeddings are not configured or no rows match.
 */
export async function retrieveKbContext(
  query: string,
  options: KbRetrievalOptions = {}
): Promise<KbSnippet[]> {
  const k = options.k ?? 5;
  if (!isEmbeddingsConfigured() || !query.trim()) return [];

  let queryVec: number[];
  try {
    queryVec = await embedText(query);
  } catch (err) {
    console.warn("[rag] embed failed:", err);
    return [];
  }
  if (queryVec.length !== BGE_M3_DIM) return [];

  try {
    // Cosine distance via pgvector `<=>` operator. Order ascending distance,
    // convert to similarity score = 1 - distance.
    const sourcesClause =
      options.sources && options.sources.length > 0
        ? `AND "source" = ANY($2::text[])`
        : "";

    const params: unknown[] = [formatVector(queryVec), k];
    if (options.sources && options.sources.length > 0) {
      params.push(options.sources);
    }

    const sql = `
      SELECT "id", "source", "url", "section", "text",
             1 - ("embedding" <=> $1::vector) AS score
      FROM "KbChunk"
      WHERE "verified" = false
        ${sourcesClause}
      ORDER BY "embedding" <=> $1::vector
      LIMIT $2
    `;

    const rows = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        source: string;
        url: string;
        section: string | null;
        text: string;
        score: number;
      }>
    >(sql, ...params);

    const minChars = options.minChars ?? 60;
    const maxChars = options.maxCharsPerSnippet ?? 1200;

    return rows
      .filter((r) => (r.text?.length ?? 0) >= minChars)
      .map((r) => ({
        id: r.id,
        source: r.source,
        url: r.url,
        section: r.section,
        text: r.text.slice(0, maxChars),
        score: Number(r.score),
      }));
  } catch (err) {
    console.warn("[rag] retrieval failed:", err);
    return [];
  }
}

/**
 * Format retrieved snippets into a Persian prompt block suitable for injection
 * into plan-gen / guide prompts. Returns "" if no snippets.
 */
export function formatKbContext(snippets: KbSnippet[], header?: string): string {
  if (snippets.length === 0) return "";
  const lines: string[] = [
    header || "## منابع معتبر (پایگاه دانش ایران)",
    "",
  ];
  for (const s of snippets) {
    const src = s.section ? `${s.source} / ${s.section}` : s.source;
    lines.push(`### ${src}`);
    lines.push(`(منبع: ${s.url} — شباهت: ${(s.score * 100).toFixed(0)}%)`);
    lines.push(s.text.trim());
    lines.push("");
  }
  return lines.join("\n");
}

/**
 * Retrieve + format in one call. Returns "" on any failure.
 */
export async function getKbContextBlock(
  query: string,
  options?: KbRetrievalOptions
): Promise<string> {
  const snippets = await retrieveKbContext(query, options);
  return formatKbContext(snippets);
}
