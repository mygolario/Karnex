/**
 * Pure roadmap payload normalization (no server / OpenRouter deps).
 * Used as preprocess before Zod validation and for merging chunked AI output.
 */

function asStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === "string" && val.trim()) return [val];
  return [];
}

function normalizeStep(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const title = typeof s.title === "string" ? s.title.trim() : "";
  if (!title) return null;
  return {
    title,
    description: typeof s.description === "string" ? s.description : "",
    estimatedHours: Number(s.estimatedHours) || 0,
    priority: typeof s.priority === "string" && s.priority ? s.priority : "medium",
    category: typeof s.category === "string" && s.category ? s.category : "general",
    status: typeof s.status === "string" && s.status ? s.status : "todo",
    checklist: asStringArray(s.checklist),
    tips: asStringArray(s.tips),
    resources: asStringArray(s.resources),
    dependsOn: asStringArray(s.dependsOn),
  };
}

export interface NormalizeRoadmapOptions {
  /** Desired phase count after pad/slice (default 16). */
  targetLength?: number;
  /** Inclusive week number range to keep / assign (default 1..16). */
  weekStart?: number;
  weekEnd?: number;
}

/**
 * Coerce AI roadmap payloads into a stable shape before Zod:
 * - coerce weekNumber, drop invalid steps, pad/slice to target length
 * - reassign weekNumbers within [weekStart, weekEnd] by index when needed
 */
export function normalizeRoadmapOnly(
  parsed: unknown,
  options: NormalizeRoadmapOptions = {}
): { roadmap: Array<Record<string, unknown>> } {
  const targetLength = options.targetLength ?? 16;
  const weekStart = options.weekStart ?? 1;
  const weekEnd = options.weekEnd ?? 16;

  const source =
    parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {};
  const rawList = Array.isArray(source.roadmap) ? (source.roadmap as unknown[]) : [];

  const byWeek = new Map<number, Record<string, unknown>>();
  const unordered: Array<Record<string, unknown>> = [];

  for (const item of rawList) {
    if (!item || typeof item !== "object") continue;
    const p = item as Record<string, unknown>;
    const weekNumber = Number(p.weekNumber);
    const stepsRaw = Array.isArray(p.steps) ? p.steps : [];
    const steps = stepsRaw
      .map(normalizeStep)
      .filter((s): s is Record<string, unknown> => s !== null);

    const phase: Record<string, unknown> = {
      phase:
        typeof p.phase === "string" && p.phase.trim()
          ? p.phase
          : `هفته ${Number.isFinite(weekNumber) ? weekNumber : "?"}: فاز`,
      weekNumber: Number.isFinite(weekNumber) ? weekNumber : NaN,
      theme: typeof p.theme === "string" ? p.theme : "",
      icon: typeof p.icon === "string" ? p.icon : "",
      steps,
    };

    if (
      Number.isFinite(weekNumber) &&
      weekNumber >= weekStart &&
      weekNumber <= weekEnd &&
      !byWeek.has(weekNumber)
    ) {
      byWeek.set(weekNumber, phase);
    } else {
      unordered.push(phase);
    }
  }

  const roadmap: Array<Record<string, unknown>> = [];
  let unorderedIdx = 0;
  for (let week = weekStart; week <= weekEnd && roadmap.length < targetLength; week++) {
    const existing = byWeek.get(week);
    if (existing) {
      existing.weekNumber = week;
      if (
        typeof existing.phase !== "string" ||
        !String(existing.phase).trim() ||
        String(existing.phase).includes("?")
      ) {
        existing.phase = `هفته ${week}: فاز`;
      }
      roadmap.push(existing);
      continue;
    }

    const fallback = unordered[unorderedIdx++];
    if (fallback) {
      fallback.weekNumber = week;
      fallback.phase =
        typeof fallback.phase === "string" &&
        fallback.phase.trim() &&
        !String(fallback.phase).includes("?")
          ? fallback.phase
          : `هفته ${week}: فاز`;
      roadmap.push(fallback);
      continue;
    }

    roadmap.push({
      phase: `هفته ${week}: فاز جدید`,
      weekNumber: week,
      theme: "",
      icon: "",
      steps: [],
    });
  }

  while (roadmap.length < targetLength) {
    const week = weekStart + roadmap.length;
    roadmap.push({
      phase: `هفته ${week}: فاز جدید`,
      weekNumber: week,
      theme: "",
      icon: "",
      steps: [],
    });
  }

  return { roadmap: roadmap.slice(0, targetLength) };
}

/** Preprocess for an 8-week chunk (weeks 1–8). */
export function normalizeRoadmapChunk1to8(parsed: unknown) {
  return normalizeRoadmapOnly(parsed, {
    targetLength: 8,
    weekStart: 1,
    weekEnd: 8,
  });
}

/** Preprocess for an 8-week chunk (weeks 9–16). */
export function normalizeRoadmapChunk9to16(parsed: unknown) {
  return normalizeRoadmapOnly(parsed, {
    targetLength: 8,
    weekStart: 9,
    weekEnd: 16,
  });
}
