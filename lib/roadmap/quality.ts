/** Genesis roadmap / canvas readiness checks — never ship empty shells. */

const BMC_FIELDS = [
  "keyPartners",
  "keyActivities",
  "keyResources",
  "uniqueValue",
  "customerRelations",
  "channels",
  "customerSegments",
  "costStructure",
  "revenueStream",
] as const;

export type CanvasLike = Partial<Record<(typeof BMC_FIELDS)[number], unknown>>;

function fieldText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "string" ? v.trim() : String(v ?? "").trim()))
      .filter(Boolean)
      .join("؛ ");
  }
  return "";
}

/** Coerce BMC field values (string | string[]) into a single Persian-friendly string. */
export function coerceCanvasField(value: unknown): string {
  return fieldText(value);
}

export function coerceBusinessModelCanvas(
  canvas: CanvasLike | null | undefined
): Record<(typeof BMC_FIELDS)[number], string> | null {
  if (!canvas || typeof canvas !== "object") return null;
  const out = {} as Record<(typeof BMC_FIELDS)[number], string>;
  for (const key of BMC_FIELDS) {
    out[key] = coerceCanvasField(canvas[key]);
  }
  return out;
}

/** True when all 9 BMC fields have non-empty content. */
export function isMeaningfulCanvas(
  canvas: CanvasLike | null | undefined
): boolean {
  const coerced = coerceBusinessModelCanvas(canvas);
  if (!coerced) return false;
  return BMC_FIELDS.every((key) => coerced[key].length > 0);
}

export function getCanvasFromPlan(plan: {
  businessModelCanvas?: CanvasLike | null;
  leanCanvas?: CanvasLike | null;
}): CanvasLike | null {
  return plan.businessModelCanvas || plan.leanCanvas || null;
}

/** Short grounding block for roadmap prompts (not the full core blob). */
export function buildCanvasSummaryForRoadmap(plan: {
  businessModelCanvas?: CanvasLike | null;
  leanCanvas?: CanvasLike | null;
}): string {
  const canvas = coerceBusinessModelCanvas(getCanvasFromPlan(plan));
  if (!canvas) return "خلاصه بوم در دسترس نیست.";
  return [
    `- ارزش پیشنهادی: ${canvas.uniqueValue || "—"}`,
    `- بخش مشتریان: ${canvas.customerSegments || "—"}`,
    `- کانال‌ها: ${canvas.channels || "—"}`,
    `- جریان درآمد: ${canvas.revenueStream || "—"}`,
  ].join("\n");
}

type StepLike = string | { title?: string; steps?: unknown };
type PhaseLike = {
  weekNumber?: number;
  phase?: string;
  steps?: StepLike[];
};

function phaseStepCount(phase: PhaseLike | null | undefined): number {
  if (!phase || !Array.isArray(phase.steps)) return 0;
  return phase.steps.filter((s) => {
    if (typeof s === "string") return s.trim().length > 0;
    if (s && typeof s === "object" && "title" in s) {
      return String((s as { title?: string }).title || "").trim().length > 0;
    }
    return false;
  }).length;
}

/**
 * A roadmap is ready when it has 16 weeks and enough real steps.
 * Prefer ≥2 titled steps per week; allow a few thinner weeks so
 * review/launch weeks don't fail the whole plan. Empty padded shells fail.
 */
export function isMeaningfulRoadmap(
  roadmap: PhaseLike[] | null | undefined
): boolean {
  if (!Array.isArray(roadmap) || roadmap.length !== 16) return false;

  let weeksWithAny = 0;
  let weeksWithEnough = 0;
  for (let i = 0; i < 16; i++) {
    const count = phaseStepCount(roadmap[i]);
    if (count >= 1) weeksWithAny += 1;
    if (count >= 2) weeksWithEnough += 1;
  }

  return weeksWithAny >= 14 && weeksWithEnough >= 12;
}

/** Mostly-empty 16-week pad from the progressive-unlock bug. */
export function isEmptyRoadmapShell(
  roadmap: PhaseLike[] | null | undefined
): boolean {
  if (!Array.isArray(roadmap) || roadmap.length === 0) return true;
  const withSteps = roadmap.filter((p) => phaseStepCount(p) >= 1).length;
  return withSteps < 4;
}

/** Pending repair: generating status OR padded empty shells. */
export function needsRoadmapRepair(plan: {
  roadmapStatus?: string | null;
  roadmap?: PhaseLike[] | null;
}): boolean {
  if (plan.roadmapStatus === "generating") return true;
  if (plan.roadmapStatus === "failed") return false;
  if (isMeaningfulRoadmap(plan.roadmap)) return false;
  return isEmptyRoadmapShell(plan.roadmap);
}
