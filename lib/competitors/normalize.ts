import type { BusinessPlan, Competitor, SWOTAnalysis } from "@/lib/db";
import {
  DEFAULT_MATRIX_DIMENSIONS,
  DEFAULT_POSITION_AXES,
  type CompetitorCitation,
  type CompetitorConfidence,
  type CompetitorDiscoveryMeta,
  type CompetitorDiscoveryOptions,
  type CompetitorDiscoveryResult,
  type CompetitorIntel,
  type CompetitorIntelItem,
  type CompetitorNextMove,
  type CompetitorScope,
  type CompetitorSource,
  type CompetitorType,
} from "./types";

function newId(prefix = "comp"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}

function clampRating(n: number): 1 | 2 | 3 | 4 | 5 {
  const rounded = Math.round(n);
  if (rounded <= 1) return 1;
  if (rounded === 2) return 2;
  if (rounded === 3) return 3;
  if (rounded === 4) return 4;
  return 5;
}

function normalizeRatings(
  ratings: Record<string, number> | undefined
): Record<string, 1 | 2 | 3 | 4 | 5> | undefined {
  if (!ratings || typeof ratings !== "object") return undefined;
  const out: Record<string, 1 | 2 | 3 | 4 | 5> = {};
  for (const [key, value] of Object.entries(ratings)) {
    if (typeof value === "number" && !Number.isNaN(value)) {
      out[key] = clampRating(value);
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function normalizeScope(scope: unknown): CompetitorScope | undefined {
  if (typeof scope !== "string") return undefined;
  const key = scope.toLowerCase().trim();
  switch (key) {
    case "local":
    case "city":
    case "municipal":
      return "local";
    case "national":
    case "iran":
    case "iranian":
    case "country":
      return "national";
    case "regional":
    case "region":
      return "regional";
    case "global":
    case "international":
    case "worldwide":
    case "world":
      return "global";
    default:
      return undefined;
  }
}

function normalizeConfidence(confidence: unknown): CompetitorConfidence {
  switch (confidence) {
    case "high":
    case "medium":
    case "low":
      return confidence;
    default:
      return "medium";
  }
}

function normalizeCompetitorType(type: unknown): CompetitorType | undefined {
  switch (type) {
    case "direct":
    case "indirect":
    case "substitute":
      return type;
    default:
      return undefined;
  }
}

function normalizeCitations(raw: unknown): CompetitorCitation[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: CompetitorCitation[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const url = typeof (item as { url?: unknown }).url === "string"
      ? (item as { url: string }).url.trim()
      : "";
    if (!url) continue;
    const title =
      typeof (item as { title?: unknown }).title === "string"
        ? (item as { title: string }).title.trim()
        : undefined;
    out.push(title ? { url, title } : { url });
  }
  return out.length > 0 ? out : undefined;
}

function normalizeThreatScore(n: unknown): 1 | 2 | 3 | 4 | 5 | undefined {
  if (typeof n !== "number" || Number.isNaN(n)) return undefined;
  return clampRating(n);
}

export function nextMovesFromStrings(moves: string[] | undefined): CompetitorNextMove[] {
  if (!moves?.length) return [];
  return moves
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({
      id: newId("move"),
      text,
      status: "todo" as const,
    }));
}

export function ensureActionableMoves(intel: CompetitorIntel): CompetitorNextMove[] {
  if (intel.actionableMoves?.length) return intel.actionableMoves;
  return nextMovesFromStrings(intel.nextMoves);
}

export function stringsFromActionableMoves(moves: CompetitorNextMove[] | undefined): string[] {
  if (!moves?.length) return [];
  return moves.map((m) => m.text).filter(Boolean);
}

export function emptyCompetitorIntel(): CompetitorIntel {
  return {
    updatedAt: new Date().toISOString(),
    competitors: [],
    matrixDimensions: [...DEFAULT_MATRIX_DIMENSIONS],
    yourPosition: {
      x: 0.5,
      y: 0.5,
      ...DEFAULT_POSITION_AXES,
    },
    yourRatings: {},
    nextMoves: [],
    actionableMoves: [],
    whiteSpace: [],
    featureRows: [],
  };
}

/** Migrate legacy string nextMoves → actionableMoves on read. */
export function hydrateCompetitorIntel(raw: CompetitorIntel | undefined | null): CompetitorIntel {
  if (!raw) return emptyCompetitorIntel();
  const actionableMoves = ensureActionableMoves(raw);
  return {
    ...emptyCompetitorIntel(),
    ...raw,
    competitors: raw.competitors || [],
    matrixDimensions:
      raw.matrixDimensions?.length
        ? raw.matrixDimensions
        : [...DEFAULT_MATRIX_DIMENSIONS],
    actionableMoves,
    nextMoves: stringsFromActionableMoves(actionableMoves),
  };
}

export function legacyCompetitorFromIntel(item: CompetitorIntelItem): Competitor {
  return {
    name: item.name,
    strength: item.strength,
    weakness: item.weakness,
    channel: item.channel || "وب‌سایت",
    isIranian: item.isIranian ?? true,
  };
}

export function projectActiveCompetitors(intel: CompetitorIntel): Competitor[] {
  return intel.competitors
    .filter((c) => c.status === "active")
    .map(legacyCompetitorFromIntel);
}

export function getActiveIntelItems(intel: CompetitorIntel | undefined | null): CompetitorIntelItem[] {
  if (!intel?.competitors) return [];
  return intel.competitors.filter((c) => c.status === "active");
}

export function getDismissedIntelItems(intel: CompetitorIntel | undefined | null): CompetitorIntelItem[] {
  if (!intel?.competitors) return [];
  return intel.competitors.filter((c) => c.status === "dismissed");
}

export function sortByThreat(items: CompetitorIntelItem[]): CompetitorIntelItem[] {
  return [...items].sort((a, b) => (b.threatScore || 0) - (a.threatScore || 0));
}

export function hasActiveCompetitors(plan: BusinessPlan | null | undefined): boolean {
  if (!plan) return false;
  const intel = plan.competitorIntel;
  if (intel?.competitors?.length) {
    return intel.competitors.some((c) => c.status === "active");
  }
  return Array.isArray(plan.competitors) && plan.competitors.length > 0;
}

export function isIntelStale(intel: CompetitorIntel, days = 14): boolean {
  const ts = intel.lastResearchedAt || intel.updatedAt;
  if (!ts) return true;
  const then = new Date(ts).getTime();
  if (Number.isNaN(then)) return true;
  return Date.now() - then > days * 24 * 60 * 60 * 1000;
}

export function swotArraysToAnalysis(swot: {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}): SWOTAnalysis {
  return {
    strengths: swot.strengths.join("\n"),
    weaknesses: swot.weaknesses.join("\n"),
    opportunities: swot.opportunities.join("\n"),
    threats: swot.threats.join("\n"),
  };
}

function fromLegacyCompetitor(
  item: Competitor,
  source: CompetitorSource = "plan"
): CompetitorIntelItem {
  return {
    id: newId(source),
    name: item.name || "نام رقیب",
    source,
    status: "active",
    isIranian: item.isIranian ?? true,
    channel: item.channel || "وب‌سایت",
    strength: item.strength || "",
    weakness: item.weakness || "",
    confidence: "medium",
    competitorType: "direct",
    entryPoints: [],
  };
}

function fromBrandName(name: string): CompetitorIntelItem {
  return {
    id: newId("brand"),
    name: name.trim(),
    source: "brand",
    status: "active",
    isIranian: true,
    channel: "نامشخص",
    strength: "",
    weakness: "",
    confidence: "low",
    competitorType: "direct",
    entryPoints: [],
  };
}

function fromLocationCompetitor(item: {
  name?: string;
  distance?: string;
  strength?: string;
  weakness?: string;
  coordinates?: { lat?: number; lng?: number; lon?: number };
}): CompetitorIntelItem {
  return {
    id: newId("loc"),
    name: item.name || "رقیب محلی",
    source: "location",
    status: "active",
    isIranian: true,
    scope: "local",
    channel: "محلی / حضوری",
    strength: item.strength || "",
    weakness: item.weakness || "",
    confidence: "medium",
    competitorType: "direct",
    entryPoints: [],
    locationRef: {
      distance: item.distance,
      lat: item.coordinates?.lat,
      lng: item.coordinates?.lng ?? item.coordinates?.lon,
    },
  };
}

/** Seed from Validation / market-research competitor name snippets when present. */
function fromMarketSnippet(name: string): CompetitorIntelItem {
  return {
    id: newId("market"),
    name: name.trim(),
    source: "market",
    status: "active",
    isIranian: true,
    channel: "تحقیق بازار",
    strength: "",
    weakness: "",
    confidence: "low",
    competitorType: "direct",
    entryPoints: [],
  };
}

function extractMarketCompetitorNames(plan: BusinessPlan): string[] {
  const names: string[] = [];
  const research = (plan as BusinessPlan & {
    marketResearch?: { competitors?: unknown; data?: { competitors?: unknown } };
  }).marketResearch;
  const list =
    (Array.isArray(research?.competitors) && research.competitors) ||
    (Array.isArray(research?.data?.competitors) && research.data?.competitors) ||
    [];
  for (const item of list) {
    if (typeof item === "string" && item.trim()) names.push(item.trim());
    else if (item && typeof item === "object" && typeof (item as { name?: string }).name === "string") {
      names.push((item as { name: string }).name.trim());
    }
  }
  return names;
}

export function seedCompetitorIntel(plan: BusinessPlan): CompetitorIntel {
  if (plan.competitorIntel?.competitors?.length) {
    return hydrateCompetitorIntel(plan.competitorIntel);
  }

  const intel = emptyCompetitorIntel();
  const seen = new Set<string>();

  const add = (item: CompetitorIntelItem) => {
    const key = item.name.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    intel.competitors.push(item);
  };

  for (const c of plan.competitors || []) {
    add(fromLegacyCompetitor(c, "plan"));
  }

  const brandNames = plan.brandKit?.wizardData?.competitors;
  if (Array.isArray(brandNames)) {
    for (const name of brandNames) {
      if (typeof name === "string" && name.trim()) add(fromBrandName(name));
    }
  }

  const local =
    plan.locationAnalysis?.competitorAnalysis?.directCompetitors || [];
  for (const c of local) {
    add(fromLocationCompetitor(c));
  }

  for (const name of extractMarketCompetitorNames(plan)) {
    add(fromMarketSnippet(name));
  }

  if (intel.competitors.length > 0) {
    intel.updatedAt = new Date().toISOString();
  }

  return intel;
}

export function discoveryItemToIntel(
  item: CompetitorDiscoveryResult["competitors"][number],
  source: CompetitorSource = "ai"
): CompetitorIntelItem {
  const scope = normalizeScope(item.scope) ?? (item.isIranian === false ? "global" : "national");
  return {
    id: newId(source),
    name: item.name,
    source,
    status: "active",
    isIranian: item.isIranian ?? true,
    scope,
    competitorType: normalizeCompetitorType(item.competitorType) || "direct",
    channel: item.channel || "وب‌سایت",
    url: item.url,
    tagline: item.tagline,
    productSummary: item.productSummary,
    pricingSignal: item.pricingSignal,
    targetSegment: item.targetSegment,
    strength: item.strength || "",
    weakness: item.weakness || "",
    entryPoints: item.entryPoints || [],
    citations: normalizeCitations(item.citations),
    threatScore: normalizeThreatScore(item.threatScore),
    confidence: normalizeConfidence(item.confidence),
    ratings: normalizeRatings(item.ratings),
    position: item.position
      ? { x: clamp01(item.position.x), y: clamp01(item.position.y) }
      : hashPosition(item.name),
  };
}

function hashPosition(name: string): { x: number; y: number } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const x = 0.2 + ((hash % 1000) / 1000) * 0.6;
  const y = 0.2 + (((hash / 1000) % 1000) / 1000) * 0.6;
  return { x, y };
}

/**
 * Merge AI discovery into existing intel without wiping user edits.
 * Returns proposed new/updated items for review, plus a preview intel if auto-accepted.
 */
export function mergeDiscoveryIntoIntel(
  existing: CompetitorIntel,
  discovery: CompetitorDiscoveryResult,
  options?: {
    autoAccept?: boolean;
    discoveryOptions?: CompetitorDiscoveryOptions;
    model?: string;
  }
): {
  intel: CompetitorIntel;
  proposed: CompetitorIntelItem[];
  updatedIds: string[];
} {
  const autoAccept = options?.autoAccept ?? false;
  const now = new Date().toISOString();
  const actionableFromDiscovery = nextMovesFromStrings(discovery.nextMoves);

  const discoveryMeta: CompetitorDiscoveryMeta = {
    ...(existing.discoveryMeta || {}),
    ...(options?.discoveryOptions || {}),
    model: options?.model || existing.discoveryMeta?.model,
    researchedAt: now,
  };

  const intel: CompetitorIntel = {
    ...hydrateCompetitorIntel(existing),
    competitors: existing.competitors.map((c) => ({ ...c })),
    updatedAt: now,
    lastResearchedAt: now,
    discoveryMeta,
  };

  if (discovery.brief) intel.brief = discovery.brief;
  if (discovery.wedge) intel.wedge = discovery.wedge;
  if (actionableFromDiscovery.length) {
    // Merge new move texts; keep done status for matching text
    const prevByText = new Map(
      (intel.actionableMoves || []).map((m) => [m.text.trim().toLowerCase(), m])
    );
    intel.actionableMoves = actionableFromDiscovery.map((m) => {
      const prev = prevByText.get(m.text.trim().toLowerCase());
      return prev ? { ...m, id: prev.id, status: prev.status } : m;
    });
    intel.nextMoves = stringsFromActionableMoves(intel.actionableMoves);
  }
  if (discovery.whiteSpace?.length) intel.whiteSpace = discovery.whiteSpace;
  if (discovery.matrixDimensions?.length) {
    intel.matrixDimensions = discovery.matrixDimensions;
  }
  if (discovery.yourPosition) {
    intel.yourPosition = {
      x: clamp01(discovery.yourPosition.x),
      y: clamp01(discovery.yourPosition.y),
      xAxis: discovery.yourPosition.xAxis || DEFAULT_POSITION_AXES.xAxis,
      yAxis: discovery.yourPosition.yAxis || DEFAULT_POSITION_AXES.yAxis,
    };
  }
  if (discovery.yourRatings) {
    intel.yourRatings = normalizeRatings(discovery.yourRatings) || intel.yourRatings;
  }

  const proposed: CompetitorIntelItem[] = [];
  const updatedIds: string[] = [];

  for (const raw of discovery.competitors || []) {
    const nameKey = raw.name.trim().toLowerCase();
    if (!nameKey) continue;

    const matchIdx = intel.competitors.findIndex(
      (c) => c.name.trim().toLowerCase() === nameKey
    );

    if (matchIdx >= 0) {
      const current = intel.competitors[matchIdx];
      if (current.source === "manual" || current.status === "dismissed") {
        if (current.status === "dismissed") {
          proposed.push({
            ...discoveryItemToIntel(raw),
            id: current.id,
            status: "dismissed",
          });
        }
        continue;
      }

      const merged: CompetitorIntelItem = {
        ...current,
        channel: raw.channel || current.channel,
        url: raw.url || current.url,
        tagline: raw.tagline || current.tagline,
        productSummary: raw.productSummary || current.productSummary,
        pricingSignal: raw.pricingSignal || current.pricingSignal,
        targetSegment: raw.targetSegment || current.targetSegment,
        strength: raw.strength || current.strength,
        weakness: raw.weakness || current.weakness,
        entryPoints:
          raw.entryPoints?.length ? raw.entryPoints : current.entryPoints,
        citations: normalizeCitations(raw.citations) || current.citations,
        threatScore: normalizeThreatScore(raw.threatScore) || current.threatScore,
        competitorType:
          normalizeCompetitorType(raw.competitorType) || current.competitorType,
        confidence: normalizeConfidence(raw.confidence || current.confidence),
        isIranian: raw.isIranian ?? current.isIranian,
        scope: normalizeScope(raw.scope) || current.scope,
        ratings: normalizeRatings(raw.ratings) || current.ratings,
        position: raw.position
          ? { x: clamp01(raw.position.x), y: clamp01(raw.position.y) }
          : current.position,
        source: current.source === "plan" || current.source === "brand" || current.source === "market"
          ? "ai"
          : current.source,
      };

      if (autoAccept) {
        intel.competitors[matchIdx] = merged;
        updatedIds.push(merged.id);
      } else {
        proposed.push(merged);
      }
      continue;
    }

    const created = discoveryItemToIntel(raw);
    if (autoAccept) {
      intel.competitors.push(created);
      updatedIds.push(created.id);
    } else {
      proposed.push(created);
    }
  }

  return { intel, proposed, updatedIds };
}

export function acceptProposedCompetitors(
  intel: CompetitorIntel,
  proposed: CompetitorIntelItem[]
): CompetitorIntel {
  const next = {
    ...hydrateCompetitorIntel(intel),
    competitors: intel.competitors.map((c) => ({ ...c })),
    updatedAt: new Date().toISOString(),
  };

  for (const item of proposed) {
    const idx = next.competitors.findIndex((c) => c.id === item.id);
    if (idx >= 0) {
      next.competitors[idx] = { ...item, status: "active" };
    } else {
      const byName = next.competitors.findIndex(
        (c) => c.name.trim().toLowerCase() === item.name.trim().toLowerCase()
      );
      if (byName >= 0) {
        next.competitors[byName] = {
          ...next.competitors[byName],
          ...item,
          id: next.competitors[byName].id,
          status: "active",
        };
      } else {
        next.competitors.push({ ...item, status: "active" });
      }
    }
  }

  return next;
}

/** Snapshot helpers for undo-last-accept */
export function cloneIntel(intel: CompetitorIntel): CompetitorIntel {
  return JSON.parse(JSON.stringify(intel)) as CompetitorIntel;
}

export function buildProjectContextBlock(plan: BusinessPlan): string {
  const canvas = plan.leanCanvas as unknown as Record<string, unknown> | undefined;
  const uniqueValue =
    (typeof canvas?.uniqueValue === "string" && canvas.uniqueValue) ||
    (Array.isArray(canvas?.uniqueValue) ? (canvas.uniqueValue as string[]).join("، ") : "");
  const channels =
    (typeof canvas?.channels === "string" && canvas.channels) ||
    (Array.isArray(canvas?.channels) ? (canvas.channels as string[]).join("، ") : "");
  const city =
    plan.locationAnalysis?.address ||
    plan.locationAnalysis?.city ||
    plan.genesisAnswers?.city ||
    "";
  const stage =
    (plan.genesisAnswers as { stage?: string } | undefined)?.stage ||
    (plan as { stage?: string }).stage ||
    "";

  const existingNames = new Set<string>();
  for (const c of plan.competitors || []) {
    if (c.name) existingNames.add(c.name);
  }
  for (const c of plan.competitorIntel?.competitors || []) {
    if (c.status === "active" && c.name) existingNames.add(c.name);
  }
  const existing = [...existingNames].slice(0, 8).join("، ");

  return [
    `نوع پروژه: ${plan.projectType || "startup"}`,
    stage ? `مرحله: ${stage}` : "",
    `نام: ${plan.projectName || ""}`,
    `توضیح/ایده: ${plan.overview || plan.ideaInput || plan.description || ""}`,
    `مخاطب: ${plan.audience || ""}`,
    `بودجه: ${plan.budget || ""}`,
    uniqueValue ? `ارزش پیشنهادی: ${uniqueValue}` : "",
    channels ? `کانال‌ها: ${channels}` : "",
    city ? `موقعیت/شهر: ${city}` : "",
    existing ? `رقبای فعلی ثبت‌شده: ${existing}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildBattleCardMarkdown(
  plan: BusinessPlan,
  intel: CompetitorIntel,
  competitor: CompetitorIntelItem
): string {
  const lines = [
    `# کارت نبرد — ${competitor.name}`,
    "",
    `پروژه: ${plan.projectName || "—"}`,
    intel.wedge ? `زاویه تمایز ما: ${intel.wedge}` : "",
    "",
    "## خلاصه رقیب",
    competitor.productSummary || competitor.tagline || "—",
    "",
    `**قوت:** ${competitor.strength || "—"}`,
    `**ضعف:** ${competitor.weakness || "—"}`,
    competitor.pricingSignal ? `**قیمت‌گذاری:** ${competitor.pricingSignal}` : "",
    competitor.targetSegment ? `**مخاطب آن‌ها:** ${competitor.targetSegment}` : "",
    "",
    "## چطور می‌بریم",
  ];
  const entries = competitor.entryPoints?.length
    ? competitor.entryPoints
    : ["روی ضعف‌های آن‌ها تمرکز کن و wedge خودت را برجسته کن."];
  for (const e of entries) lines.push(`- ${e}`);
  if (competitor.url) {
    lines.push("", `منبع: ${competitor.url}`);
  }
  return lines.filter((l) => l !== "").join("\n");
}

export function buildCompetitorExportMarkdown(
  plan: BusinessPlan,
  intel: CompetitorIntel
): string {
  const active = getActiveIntelItems(intel);
  const moves = ensureActionableMoves(intel);
  const lines: string[] = [
    `# تحلیل رقبا — ${plan.projectName || "پروژه"}`,
    "",
    `آخرین به‌روزرسانی: ${intel.updatedAt || "—"}`,
    "",
  ];

  if (intel.brief) {
    lines.push("## جایگاه شما", intel.brief, "");
  }
  if (intel.wedge) {
    lines.push("## زاویه تمایز (Wedge)", intel.wedge, "");
  }
  if (moves.length) {
    lines.push("## قدم‌های بعدی");
    for (const m of moves) {
      lines.push(`- [${m.status === "done" ? "x" : " "}] ${m.text}`);
    }
    lines.push("");
  }
  if (intel.whiteSpace?.length) {
    lines.push("## فضای سفید / شکاف بازار");
    for (const w of intel.whiteSpace) lines.push(`- ${w}`);
    lines.push("");
  }

  lines.push("## رقبا");
  for (const c of sortByThreat(active)) {
    lines.push(`### ${c.name}`);
    lines.push(`- کانال: ${c.channel || "—"}`);
    lines.push(`- حوزه: ${c.scope || "—"}`);
    lines.push(`- نوع: ${c.competitorType || "direct"}`);
    lines.push(`- ایرانی: ${c.isIranian ? "بله" : "خیر"}`);
    if (c.threatScore) lines.push(`- تهدید: ${c.threatScore}/5`);
    lines.push(`- اعتماد به داده: ${c.confidence || "medium"}`);
    if (c.tagline) lines.push(`- موقعیت‌یابی: ${c.tagline}`);
    if (c.productSummary) lines.push(`- خلاصه محصول: ${c.productSummary}`);
    if (c.pricingSignal) lines.push(`- سیگنال قیمت: ${c.pricingSignal}`);
    if (c.targetSegment) lines.push(`- مخاطب: ${c.targetSegment}`);
    if (c.url) lines.push(`- وب‌سایت: ${c.url}`);
    lines.push(`- قوت: ${c.strength || "—"}`);
    lines.push(`- ضعف: ${c.weakness || "—"}`);
    if (c.entryPoints?.length) {
      lines.push(`- نقاط ورود شما: ${c.entryPoints.join("؛ ")}`);
    }
    if (c.citations?.length) {
      lines.push(`- منابع: ${c.citations.map((x) => x.url).join("؛ ")}`);
    }
    lines.push("");
  }

  const narrative = [
    intel.wedge
      ? `زاویه تمایز ما: ${intel.wedge}`
      : "ما روی تمایز عملیاتی و درک عمیق مشتری تمرکز می‌کنیم.",
    active.length
      ? `رقبای اصلی ما شامل ${active
          .slice(0, 4)
          .map((c) => c.name)
          .join("، ")} هستند.`
      : "",
    intel.brief || "",
  ]
    .filter(Boolean)
    .join(" ");

  lines.push("## روایت سرمایه‌گذار (Competition)", narrative, "");

  return lines.join("\n");
}

export function createManualCompetitor(partial?: Partial<CompetitorIntelItem>): CompetitorIntelItem {
  return {
    id: newId("manual"),
    name: partial?.name || "رقیب جدید",
    source: "manual",
    status: "active",
    isIranian: partial?.isIranian ?? true,
    scope: partial?.scope || "national",
    competitorType: partial?.competitorType || "direct",
    channel: partial?.channel || "وب‌سایت",
    url: partial?.url,
    tagline: partial?.tagline || "",
    productSummary: partial?.productSummary || "",
    pricingSignal: partial?.pricingSignal || "",
    targetSegment: partial?.targetSegment || "",
    strength: partial?.strength || "",
    weakness: partial?.weakness || "",
    entryPoints: partial?.entryPoints || [],
    citations: partial?.citations || [],
    threatScore: partial?.threatScore,
    confidence: partial?.confidence || "medium",
    ratings: partial?.ratings || {},
    position: partial?.position || { x: 0.5, y: 0.5 },
  };
}
