import {
  ANSWER_KEY_LABELS,
  resolveOptionLabel,
  getFieldDef,
  GENESIS_ASSIST_CREDIT,
  GENESIS_CORE_CREDITS,
  GENESIS_ROADMAP_CREDITS,
} from "@/lib/genesis/intake-constants";
import {
  UNKNOWN_ANSWER,
  type GenesisConfidence,
  type GenesisCreditEstimate,
} from "@/lib/genesis/types";

function isFilled(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim();
  return v.length > 0 && v !== UNKNOWN_ANSWER;
}

/** Persian-labeled map for prompts and project.data.genesisAnswers */
export function labeledGenesisAnswers(
  answers: Record<string, string>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, raw] of Object.entries(answers)) {
    if (!raw?.trim()) continue;
    const field = getFieldDef(key);
    const label = ANSWER_KEY_LABELS[key] || key;
    const value =
      field?.kind === "text" || key === "geo_detail"
        ? raw.trim()
        : resolveOptionLabel(key, raw);
    out[label] = value;
  }
  return out;
}

/** Multiline block for AI prompts */
export function formatGenesisAnswersForPrompt(
  answers: Record<string, string>
): string {
  const labeled = labeledGenesisAnswers(answers);
  const lines = Object.entries(labeled).map(([k, v]) => `- ${k}: ${v}`);
  return lines.length ? lines.join("\n") : "None provided";
}

/** Compose idea string from structured fields + optional polish */
export function buildIdeaFromAnswers(
  answers: Record<string, string>,
  projectVision: string
): string {
  const parts: string[] = [];
  if (isFilled(answers.problem)) parts.push(`مشکل: ${answers.problem.trim()}`);
  if (isFilled(answers.solution))
    parts.push(`راه‌حل: ${answers.solution.trim()}`);
  if (isFilled(answers.audience_who))
    parts.push(`مخاطب: ${answers.audience_who.trim()}`);
  if (isFilled(answers.industry)) {
    parts.push(`حوزه: ${resolveOptionLabel("industry", answers.industry)}`);
  }
  const polish = projectVision.trim();
  if (polish) parts.push(`توضیح تکمیلی: ${polish}`);
  if (parts.length === 0) return polish || "ایده هنوز کامل نیست";
  return parts.join("\n");
}

export function resolveAudience(answers: Record<string, string>): string {
  if (isFilled(answers.audience_who)) return answers.audience_who.trim();
  return "";
}

export function resolveBudget(answers: Record<string, string>): string {
  if (!isFilled(answers.budget)) return "";
  return resolveOptionLabel("budget", answers.budget);
}

export function resolveGeoSummary(answers: Record<string, string>): string {
  if (!isFilled(answers.geo)) return "";
  const base = resolveOptionLabel("geo", answers.geo);
  if (answers.geo === "city" && isFilled(answers.geo_detail)) {
    return `${base} — ${answers.geo_detail.trim()}`;
  }
  return base;
}

export function estimateGenesisCredits(
  assistUses: number
): GenesisCreditEstimate {
  const assists = Math.max(0, assistUses) * GENESIS_ASSIST_CREDIT;
  return {
    core: GENESIS_CORE_CREDITS,
    roadmap: GENESIS_ROADMAP_CREDITS,
    assistsUsed: assistUses,
    assistUnit: GENESIS_ASSIST_CREDIT,
    total: GENESIS_CORE_CREDITS + GENESIS_ROADMAP_CREDITS + assists,
  };
}

export function scoreGenesisConfidence(
  answers: Record<string, string>,
  projectVision: string,
  projectName: string
): GenesisConfidence {
  let score = 0;
  const tips: string[] = [];

  if (isFilled(answers.problem) && answers.problem.trim().length >= 20) {
    score += 22;
  } else if (isFilled(answers.problem)) {
    score += 12;
    tips.push("مشکل را با یک مثال روزمره کمی کامل‌تر کن.");
  } else {
    tips.push("یک جمله درباره مشکلی که حل می‌کنی بنویس.");
  }

  if (isFilled(answers.solution) && answers.solution.trim().length >= 20) {
    score += 22;
  } else if (isFilled(answers.solution)) {
    score += 12;
    tips.push("راه‌حل را کمی مشخص‌تر کن (چه می‌سازی؟).");
  } else {
    tips.push("بنویس محصول یا خدمتت تقریباً چیست.");
  }

  if (isFilled(answers.audience_who) && answers.audience_who.trim().length >= 8) {
    score += 18;
  } else {
    tips.push("مخاطب را مشخص کن — مثلاً شغل، سن یا شهر.");
  }

  if (isFilled(answers.stage)) score += 10;
  if (isFilled(answers.budget)) score += 8;
  if (isFilled(answers.geo) || isFilled(answers.geo_detail)) score += 8;
  if (isFilled(answers.goal) || isFilled(answers.team)) score += 6;
  if (projectName.trim().length >= 2) score += 6;
  if (projectVision.trim().length >= 40) score += 6;

  score = Math.min(100, score);

  const level: GenesisConfidence["level"] =
    score >= 70 ? "strong" : score >= 40 ? "ok" : "weak";

  if (level === "strong" && tips.length > 2) tips.length = 1;
  if (level !== "weak") {
    return { score, level, tips: tips.slice(0, 2) };
  }
  return { score, level, tips: tips.slice(0, 3) };
}

/** Personalization blurb for living brief */
export function buildPersonalizationPreview(
  answers: Record<string, string>
): string {
  const stage = isFilled(answers.stage)
    ? resolveOptionLabel("stage", answers.stage)
    : null;
  const goal = isFilled(answers.goal)
    ? resolveOptionLabel("goal", answers.goal)
    : null;
  const audience = isFilled(answers.audience_who)
    ? answers.audience_who.trim()
    : null;

  const bits: string[] = [];
  if (stage) bits.push(`مرحله «${stage}»`);
  if (goal) bits.push(`هدف «${goal}»`);
  if (audience) bits.push(`مخاطب «${audience}»`);

  if (bits.length === 0) {
    return "بر اساس جواب‌هایت، یک بوم و نقشه راه ۱۶ هفته‌ای می‌سازیم.";
  }
  return `بر اساس ${bits.join("، ")}، نقشه راه و بوم را شخصی‌سازی می‌کنیم.`;
}
