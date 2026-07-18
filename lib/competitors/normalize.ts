import type { BusinessPlan, Competitor, SWOTAnalysis } from "@/lib/db";
import {
  DEFAULT_MATRIX_DIMENSIONS,
  DEFAULT_POSITION_AXES,
  type CompetitorConfidence,
  type CompetitorDiscoveryResult,
  type CompetitorIntel,
  type CompetitorIntelItem,
  type CompetitorScope,
  type CompetitorSource,
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
  switch (scope) {
    case "local":
    case "national":
    case "regional":
    case "global":
      return scope;
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
    whiteSpace: [],
    featureRows: [],
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

export function hasActiveCompetitors(plan: BusinessPlan | null | undefined): boolean {
  if (!plan) return false;
  const intel = plan.competitorIntel;
  if (intel?.competitors?.length) {
    return intel.competitors.some((c) => c.status === "active");
  }
  return Array.isArray(plan.competitors) && plan.competitors.length > 0;
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
    entryPoints: [],
    locationRef: {
      distance: item.distance,
      lat: item.coordinates?.lat,
      lng: item.coordinates?.lng ?? item.coordinates?.lon,
    },
  };
}

export function seedCompetitorIntel(plan: BusinessPlan): CompetitorIntel {
  if (plan.competitorIntel?.competitors?.length) {
    return {
      ...emptyCompetitorIntel(),
      ...plan.competitorIntel,
      competitors: plan.competitorIntel.competitors,
      matrixDimensions:
        plan.competitorIntel.matrixDimensions?.length
          ? plan.competitorIntel.matrixDimensions
          : [...DEFAULT_MATRIX_DIMENSIONS],
    };
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
    channel: item.channel || "وب‌سایت",
    url: item.url,
    tagline: item.tagline,
    strength: item.strength || "",
    weakness: item.weakness || "",
    entryPoints: item.entryPoints || [],
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
  options?: { autoAccept?: boolean }
): {
  intel: CompetitorIntel;
  proposed: CompetitorIntelItem[];
  updatedIds: string[];
} {
  const autoAccept = options?.autoAccept ?? false;
  const intel: CompetitorIntel = {
    ...existing,
    competitors: existing.competitors.map((c) => ({ ...c })),
    updatedAt: new Date().toISOString(),
    lastResearchedAt: new Date().toISOString(),
  };

  if (discovery.brief) intel.brief = discovery.brief;
  if (discovery.wedge) intel.wedge = discovery.wedge;
  if (discovery.nextMoves?.length) intel.nextMoves = discovery.nextMoves;
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
        // Keep user dismissals and manual records intact; still surface as proposal if dismissed
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
        strength: raw.strength || current.strength,
        weakness: raw.weakness || current.weakness,
        entryPoints:
          raw.entryPoints?.length ? raw.entryPoints : current.entryPoints,
        confidence: normalizeConfidence(raw.confidence || current.confidence),
        isIranian: raw.isIranian ?? current.isIranian,
        scope: normalizeScope(raw.scope) || current.scope,
        ratings: normalizeRatings(raw.ratings) || current.ratings,
        position: raw.position
          ? { x: clamp01(raw.position.x), y: clamp01(raw.position.y) }
          : current.position,
        source: current.source === "plan" || current.source === "brand" ? "ai" : current.source,
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
    ...intel,
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

  const existing = (plan.competitors || [])
    .map((c) => c.name)
    .filter(Boolean)
    .slice(0, 8)
    .join("، ");

  return [
    `نوع پروژه: ${plan.projectType || "startup"}`,
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

export function buildCompetitorExportMarkdown(
  plan: BusinessPlan,
  intel: CompetitorIntel
): string {
  const active = getActiveIntelItems(intel);
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
  if (intel.nextMoves?.length) {
    lines.push("## قدم‌های بعدی");
    for (const m of intel.nextMoves) lines.push(`- ${m}`);
    lines.push("");
  }
  if (intel.whiteSpace?.length) {
    lines.push("## فضای سفید / شکاف بازار");
    for (const w of intel.whiteSpace) lines.push(`- ${w}`);
    lines.push("");
  }

  lines.push("## رقبا");
  for (const c of active) {
    lines.push(`### ${c.name}`);
    lines.push(`- کانال: ${c.channel || "—"}`);
    lines.push(`- حوزه: ${c.scope || "—"}`);
    lines.push(`- ایرانی: ${c.isIranian ? "بله" : "خیر"}`);
    lines.push(`- اعتماد به داده: ${c.confidence || "medium"}`);
    if (c.tagline) lines.push(`- موقعیت‌یابی: ${c.tagline}`);
    if (c.url) lines.push(`- وب‌سایت: ${c.url}`);
    lines.push(`- قوت: ${c.strength || "—"}`);
    lines.push(`- ضعف: ${c.weakness || "—"}`);
    if (c.entryPoints?.length) {
      lines.push(`- نقاط ورود شما: ${c.entryPoints.join("؛ ")}`);
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
    channel: partial?.channel || "وب‌سایت",
    url: partial?.url,
    tagline: partial?.tagline || "",
    strength: partial?.strength || "",
    weakness: partial?.weakness || "",
    entryPoints: partial?.entryPoints || [],
    confidence: partial?.confidence || "medium",
    ratings: partial?.ratings || {},
    position: partial?.position || { x: 0.5, y: 0.5 },
  };
}
