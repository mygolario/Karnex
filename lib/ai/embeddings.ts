import "server-only";

/**
 * Embedding client for the Persian Knowledge Base RAG.
 *
 * Model: BAAI/bge-m3 (1024-dim, multilingual incl. Persian) via the HuggingFace
 * Inference API. Stored in Supabase pgvector (`KbChunk.embedding`).
 *
 * HuggingFace is free-tier but rate-limited; this module batches inputs and
 * retries with backoff on 503 (model warming up).
 */

const HF_MODEL = "BAAI/bge-m3";
const HF_URL = `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`;
export const BGE_M3_DIM = 1024;

export function isEmbeddingsConfigured(): boolean {
  return !!process.env.HUGGINGFACE_API_TOKEN;
}

function toFloatArray(raw: unknown): number[] {
  // HF feature-extraction can return number[] (1D) or number[][] (2D) depending
  // on input shape and model. bge-m3 with `use_cache` returns a flat 1024 vector
  // per input. Normalize any nested structure into a flat number[].
  if (Array.isArray(raw)) {
    if (raw.length === 0) return [];
    if (typeof raw[0] === "number") return raw as number[];
    // Nested: take first sub-array (single input) or flatten one level.
    const first = (raw as unknown[])[0];
    if (Array.isArray(first) && typeof first[0] === "number") {
      return first as number[];
    }
  }
  return [];
}

export async function embedTexts(
  texts: string[],
  options?: { maxRetries?: number }
): Promise<number[][]> {
  if (!isEmbeddingsConfigured()) {
    throw new Error("HUGGINGFACE_API_TOKEN is not configured");
  }
  const maxRetries = options?.maxRetries ?? 4;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
    "Content-Type": "application/json",
  };

  let attempt = 0;
  while (true) {
    attempt++;
    try {
      const res = await fetch(HF_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          inputs: texts,
          options: { wait_for_model: true, use_cache: true },
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        // 503 = model loading; 429 = rate limit. Retry with backoff.
        if ((res.status === 503 || res.status === 429) && attempt <= maxRetries) {
          const delay = 2000 * Math.pow(2, attempt - 1);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw new Error(`HuggingFace embed HTTP ${res.status}: ${body.slice(0, 200)}`);
      }

      const data = await res.json();
      // For batch input, HF returns an array whose shape depends on the model.
      // bge-m3 returns [[...1024...], [...1024...], ...] when given multiple
      // inputs. Normalize to number[][].
      if (Array.isArray(data) && Array.isArray(data[0]) && typeof data[0]?.[0] === "number") {
        return data as number[][];
      }
      // Fallback: single input shape — wrap.
      return [toFloatArray(data)];
    } catch (err) {
      if (attempt > maxRetries) throw err;
      const delay = 2000 * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

export async function embedText(text: string): Promise<number[]> {
  const vecs = await embedTexts([text]);
  if (!vecs[0] || vecs[0].length === 0) {
    throw new Error("Empty embedding returned for input");
  }
  return vecs[0];
}
