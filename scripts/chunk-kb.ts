/**
 * Chunk the KB corpus into ~500-token pieces with overlap, Persian-aware.
 *
 * Input:  kb-corpus.jsonl  (from scripts/build-kb-corpus.ts)
 * Output: kb-chunks.jsonl  → { id, source, url, section, text, chunkIndex, fetchedAt }
 *
 * Run:
 *   node --env-file=.env.local scripts/chunk-kb.ts
 *   # or: npx tsx scripts/chunk-kb.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const INPUT_PATH = resolve(process.cwd(), "kb-corpus.jsonl");
const OUTPUT_PATH = resolve(process.cwd(), "kb-chunks.jsonl");

const TARGET_WORDS = 500; // ~500 tokens
const OVERLAP_WORDS = 60;

// Boilerplate markers commonly found on Iranian gov site footners/nav.
const BOILERPLATE_PATTERNS = [
  /لیست\s*لینک\s*ها/gi,
  /منوی\s*اصلی/gi,
  /تماس\s*با\s*ما/gi,
  /حقوق\s*سایت\s*محفوظ\s*است/gi,
  /کلیه\s*حقوق\s*محفوظ\s*است/gi,
  /صفحه\s*اصلی/gi,
  /پیوند\s*به\s*ما/gi,
  /follow us/gi,
  /©\s*\d{4}/gi,
];

interface CorpusRecord {
  url: string;
  title: string;
  section: string;
  text: string;
  source: string;
  fetchedAt: string;
}

function stripBoilerplate(text: string): string {
  let out = text;
  for (const p of BOILERPLATE_PATTERNS) {
    out = out.replace(p, " ");
  }
  // Collapse runs of whitespace and remove long sequences of pipe/menu chars.
  out = out.replace(/\n{3,}/g, "\n\n").replace(/[|]{3,}/g, " ").replace(/\s{2,}/g, " ");
  return out.trim();
}

// Split text into Persian-aware sentences on . ؟ ! followed by space/end.
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.؟!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function wordsCount(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

function chunkText(text: string): string[] {
  const clean = stripBoilerplate(text);
  if (!clean) return [];
  const sentences = splitSentences(clean);
  if (sentences.length === 0) return [];

  const chunks: string[] = [];
  let current: string[] = [];
  let currentWords = 0;

  for (const sentence of sentences) {
    const w = wordsCount(sentence);
    if (currentWords + w > TARGET_WORDS && current.length > 0) {
      chunks.push(current.join(" "));
      // Overlap: keep the last few sentences.
      const overlap: string[] = [];
      let overlapWords = 0;
      for (let i = current.length - 1; i >= 0 && overlapWords < OVERLAP_WORDS; i--) {
        overlap.unshift(current[i]);
        overlapWords += wordsCount(current[i]);
      }
      current = overlap;
      currentWords = overlapWords;
    }
    current.push(sentence);
    currentWords += w;
  }
  if (current.length > 0) chunks.push(current.join(" "));
  return chunks;
}

function main() {
  const raw = readFileSync(INPUT_PATH, "utf-8");
  const lines = raw.split("\n").filter(Boolean);

  const out: Array<{
    id: string;
    source: string;
    url: string;
    section: string;
    text: string;
    chunkIndex: number;
    fetchedAt: string;
  }> = [];

  for (const line of lines) {
    let rec: CorpusRecord;
    try {
      rec = JSON.parse(line);
    } catch {
      continue;
    }
    const pieces = chunkText(rec.text);
    pieces.forEach((text, idx) => {
      out.push({
        id: `${rec.source}-${idx}-${Buffer.from(rec.url).toString("hex").slice(0, 10)}`,
        source: rec.source,
        url: rec.url,
        section: rec.section,
        text,
        chunkIndex: idx,
        fetchedAt: rec.fetchedAt,
      });
    });
  }

  const jsonl = out.map((r) => JSON.stringify(r)).join("\n") + "\n";
  writeFileSync(OUTPUT_PATH, jsonl, "utf-8");
  console.log(`Wrote ${out.length} chunks → ${OUTPUT_PATH}`);
}

main();
