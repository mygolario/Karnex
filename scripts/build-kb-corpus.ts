/**
 * Build the Persian Knowledge Base seed corpus.
 *
 * Strategy (per the Karnex AI stack plan):
 *  1. Serper `site:<domain>` scoped queries → discover relevant URLs on each
 *     Iranian gov / regulatory site (no geo-block, scoped to the domain).
 *  2. Firecrawl `scrape` → fetch each URL as clean markdown.
 *  3. Emit JSONL records `{ url, title, section, text, source, fetchedAt }`
 *     to `kb-corpus.jsonl`, ready for `scripts/chunk-kb.ts`.
 *
 * Run (from project root):
 *   node --env-file=.env.local --env-file=.env scripts/build-kb-corpus.ts
 *   # or: npx tsx --env-file=.env.local scripts/build-kb-corpus.ts
 *
 * Requires: SERPER_API_KEY, FIRECRAWL_API_KEY
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const OUTPUT_PATH = resolve(process.cwd(), "kb-corpus.jsonl");

if (!SERPER_API_KEY || !FIRECRAWL_API_KEY) {
  console.error("Missing SERPER_API_KEY and/or FIRECRAWL_API_KEY in env.");
  process.exit(1);
}

interface Target {
  domain: string;
  source: string;
  queries: string[];
}

const TARGETS: Target[] = [
  {
    domain: "enamad.ir",
    source: "enamad",
    queries: ["نشان اعتماد الکترونیکی", "درخواست نشان", "ضوابط نشان اعتماد", "راهنمای ثبت"],
  },
  {
    domain: "nic.ir",
    source: "nic",
    queries: ["ثبت دامنه ir", "ضوابط ثبت دامنه", "راهنمای دامنه", "انتقال دامنه"],
  },
  {
    domain: "samandehi.ir",
    source: "samandehi",
    queries: ["ثبت ساماندهی", "ضوابط ساماندهی", "درخواست ساماندهی", "راهنمای ساماندهی"],
  },
  {
    domain: "intamedia.ir",
    source: "intamedia",
    queries: ["پروانه انتشار محتوا", "ثبت رسانه", "ضوابط رسانه دیجیتال", "راهنمای ثبت رسانه"],
  },
  {
    domain: "qds.ir",
    source: "qds",
    queries: ["سامانه queries", "ثبت شکایت", "راهنما"],
  },
  {
    domain: "tax.gov.ir",
    source: "tax",
    queries: ["مالیات بر ارزش افزوده", "مالیات کسب و کار", "ثبت مالیاتی", "پروانه کسب", "راهنمای مالیاتی"],
  },
  {
    domain: "kargozarsalari.ir",
    source: "kargozarsalari",
    queries: ["کارت بازرگانی", "صدور کارت بازرگانی", "ضوابط بازرگانی", "راهنمای بازرگانی"],
  },
];

async function serperSiteSearch(domain: string, query: string, num = 10): Promise<string[]> {
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: `site:${domain} ${query}`, num }),
    });
    if (!res.ok) {
      console.warn(`[serper] ${domain} "${query}" → HTTP ${res.status}`);
      return [];
    }
    const data = await res.json();
    const organic: any[] = Array.isArray(data?.organic) ? data.organic : [];
    return organic
      .map((r) => r.link)
      .filter((u): u is string => typeof u === "string" && u.includes(domain));
  } catch (err) {
    console.warn(`[serper] error for ${domain}:`, err);
    return [];
  }
}

interface FirecrawlScrapeResult {
  url: string;
  title?: string;
  markdown?: string;
}

async function firecrawlScrape(url: string): Promise<FirecrawlScrapeResult | null> {
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      console.warn(`[firecrawl] ${url} → HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    const d = data?.data ?? data;
    return {
      url,
      title: d?.metadata?.title || d?.title,
      markdown: d?.markdown || d?.content,
    };
  } catch (err) {
    console.warn(`[firecrawl] error for ${url}:`, err);
    return null;
  }
}

function deriveSection(url: string, title?: string): string {
  try {
    const u = new URL(url);
    const seg = u.pathname.split("/").filter(Boolean).slice(0, 2).join("/");
    return seg || title || u.hostname;
  } catch {
    return title || url;
  }
}

async function main() {
  const records: Array<{
    url: string;
    title: string;
    section: string;
    text: string;
    source: string;
    fetchedAt: string;
  }> = [];
  const seenUrls = new Set<string>();

  for (const target of TARGETS) {
    console.log(`\n=== ${target.domain} (${target.source}) ===`);
    const discovered = new Set<string>();
    for (const q of target.queries) {
      const urls = await serperSiteSearch(target.domain, q, 10);
      for (const u of urls) discovered.add(u);
    }
    console.log(`discovered ${discovered.size} URLs`);

    let scraped = 0;
    for (const url of discovered) {
      if (seenUrls.has(url)) continue;
      seenUrls.add(url);
      const scrapedResult = await firecrawlScrape(url);
      if (!scrapedResult?.markdown || scrapedResult.markdown.trim().length < 200) {
        continue;
      }
      records.push({
        url,
        title: scrapedResult.title || url,
        section: deriveSection(url, scrapedResult.title),
        text: scrapedResult.markdown,
        source: target.source,
        fetchedAt: new Date().toISOString(),
      });
      scraped++;
      // Be polite to Firecrawl.
      await new Promise((r) => setTimeout(r, 500));
    }
    console.log(`scraped ${scraped} pages from ${target.domain}`);
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  const jsonl = records.map((r) => JSON.stringify(r)).join("\n") + "\n";
  writeFileSync(OUTPUT_PATH, jsonl, "utf-8");
  console.log(`\nWrote ${records.length} records → ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("build-kb-corpus failed:", err);
  process.exit(1);
});
