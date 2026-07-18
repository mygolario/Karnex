import { z } from "zod";

export const VALIDATION_EVIDENCE_LEVELS = [
  "none",
  "talks",
  "waitlist",
  "revenue",
] as const;

export type ValidationEvidenceLevel = (typeof VALIDATION_EVIDENCE_LEVELS)[number];

export const VALIDATION_VERDICTS = [
  "go",
  "conditional_go",
  "pivot",
  "kill",
] as const;

export type ValidationVerdict = (typeof VALIDATION_VERDICTS)[number];

export const ASSUMPTION_RISKS = ["critical", "major", "minor"] as const;

export type AssumptionRisk = (typeof ASSUMPTION_RISKS)[number];

export const DIMENSION_KEYS = [
  "problem_severity",
  "willingness_to_pay",
  "market_timing",
  "differentiation",
  "execution_feasibility",
  "iran_local_fit",
] as const;

export type DimensionKey = (typeof DIMENSION_KEYS)[number];

export interface ValidationBrief {
  problem: string;
  whoSuffers: string;
  currentSolution: string;
  unfairAdvantage: string;
  evidenceLevel: ValidationEvidenceLevel;
}

export const ValidationBriefSchema = z.object({
  problem: z.string().default(""),
  whoSuffers: z.string().default(""),
  currentSolution: z.string().default(""),
  unfairAdvantage: z.string().default(""),
  evidenceLevel: z.enum(VALIDATION_EVIDENCE_LEVELS).default("none"),
});

export const ValidationDimensionSchema = z.object({
  key: z.string(),
  label: z.string(),
  score: z.number().min(0).max(100),
  note: z.string().default(""),
});

export const ValidationAssumptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  risk: z.enum(ASSUMPTION_RISKS).default("major"),
  experimentId: z.string().optional().default(""),
});

export const ValidationExperimentSchema = z.object({
  id: z.string(),
  title: z.string(),
  steps: z.string().default(""),
  metric: z.string().default(""),
  estimatedCost: z.string().default(""),
  estimatedTime: z.string().default(""),
  isPrimary: z.boolean().optional().default(false),
});

export const ValidationComparableSchema = z.object({
  name: z.string(),
  similarity: z.string().default(""),
  lesson: z.string().default(""),
});

export const ValidationNextActionSchema = z.object({
  label: z.string(),
  target: z.enum(["copilot", "canvas", "roadmap", "experiment"]).default("copilot"),
  detail: z.string().default(""),
});

export const ValidationEvidenceItemSchema = z.object({
  label: z.string(),
  status: z.enum(["have", "missing", "weak"]).default("missing"),
});

export const IdeaValidationReportSchema = z.object({
  reasoning: z.string().default(""),
  verdict: z.enum(VALIDATION_VERDICTS),
  verdictRationale: z.string().default(""),
  overallScore: z.number().min(0).max(100),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
  critique: z.object({
    summary: z.string().default(""),
    strengths: z.array(z.string()).default([]),
    weaknesses: z.array(z.string()).default([]),
  }),
  dimensions: z.array(ValidationDimensionSchema).default([]),
  assumptions: z.array(ValidationAssumptionSchema).default([]),
  experiments: z.array(ValidationExperimentSchema).default([]),
  comparableStartups: z.array(ValidationComparableSchema).default([]),
  evidenceChecklist: z.array(ValidationEvidenceItemSchema).default([]),
  nextActions: z.array(ValidationNextActionSchema).default([]),
  thisWeekExperimentId: z.string().optional().default(""),
});

export type IdeaValidationReport = z.infer<typeof IdeaValidationReportSchema>;
export type ValidationAssumption = z.infer<typeof ValidationAssumptionSchema>;
export type ValidationExperiment = z.infer<typeof ValidationExperimentSchema>;
export type ValidationDimension = z.infer<typeof ValidationDimensionSchema>;
export type ValidationComparable = z.infer<typeof ValidationComparableSchema>;
export type ValidationNextAction = z.infer<typeof ValidationNextActionSchema>;
export type ValidationEvidenceItem = z.infer<typeof ValidationEvidenceItemSchema>;

export interface IdeaValidationRecord {
  id: string;
  createdAt: string;
  brief: ValidationBrief;
  report: IdeaValidationReport;
  projectName?: string;
}

export const EVIDENCE_LABELS: Record<ValidationEvidenceLevel, string> = {
  none: "هنوز مدرکی ندارم",
  talks: "چند گفتگو با مشتری بالقوه",
  waitlist: "لیست انتظار / پیش‌ثبت‌نام",
  revenue: "فروش یا درآمد واقعی",
};

export const VERDICT_LABELS: Record<ValidationVerdict, string> = {
  go: "برو جلو",
  conditional_go: "برو، با شرط",
  pivot: "پیوت کن",
  kill: "فعلاً متوقف کن",
};

export const VERDICT_DESCRIPTIONS: Record<ValidationVerdict, string> = {
  go: "فرض‌های اصلی قابل دفاع‌اند؛ برو روی آزمایش‌های رشد.",
  conditional_go: "ایده امیدوارکننده است، ولی چند فرض خطرناک باید اول کشته شوند.",
  pivot: "مسئله یا مخاطب را عوض کن؛ مسیر فعلی ضعیف است.",
  kill: "شواهد و منطق فعلی برای ادامه کافی نیست.",
};

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  problem_severity: "شدت مسئله",
  willingness_to_pay: "تمایل به پرداخت",
  market_timing: "زمان‌بندی بازار",
  differentiation: "تمایز",
  execution_feasibility: "قابلیت اجرا",
  iran_local_fit: "تناسب با ایران",
};

export function emptyValidationBrief(): ValidationBrief {
  return {
    problem: "",
    whoSuffers: "",
    currentSolution: "",
    unfairAdvantage: "",
    evidenceLevel: "none",
  };
}

export function briefFromProject(plan: {
  overview?: string;
  tagline?: string;
  ideaInput?: string;
  audience?: string;
  leanCanvas?: unknown;
}): ValidationBrief {
  const canvas =
    plan.leanCanvas && typeof plan.leanCanvas === "object"
      ? (plan.leanCanvas as {
          problem?: unknown;
          solution?: unknown;
          uniqueValue?: unknown;
          customerSegments?: unknown;
          unfairAdvantage?: unknown;
        })
      : undefined;

  const canvasText = (v: unknown): string => {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (Array.isArray(v)) {
      return v
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object" && "content" in item) {
            return String((item as { content?: string }).content || "");
          }
          return "";
        })
        .filter(Boolean)
        .join("؛ ");
    }
    return "";
  };

  return {
    problem:
      canvasText(canvas?.problem) ||
      plan.ideaInput ||
      plan.overview ||
      plan.tagline ||
      "",
    whoSuffers: canvasText(canvas?.customerSegments) || plan.audience || "",
    currentSolution: canvasText(canvas?.solution) || "",
    unfairAdvantage:
      canvasText(canvas?.unfairAdvantage) ||
      canvasText(canvas?.uniqueValue) ||
      "",
    evidenceLevel: "none",
  };
}

export function isBriefReady(brief: ValidationBrief): boolean {
  return brief.problem.trim().length >= 8 && brief.whoSuffers.trim().length >= 3;
}

export function formatBriefForPrompt(brief: ValidationBrief): string {
  return [
    `مسئله: ${brief.problem || "—"}`,
    `چه کسانی رنج می‌برند: ${brief.whoSuffers || "—"}`,
    `راه‌حل فعلی بازار: ${brief.currentSolution || "—"}`,
    `مزیت ناعادلانه / بینش: ${brief.unfairAdvantage || "—"}`,
    `سطح شواهد: ${EVIDENCE_LABELS[brief.evidenceLevel]}`,
  ].join("\n");
}

export function validationReportToMarkdown(
  report: IdeaValidationReport,
  projectName?: string
): string {
  const lines: string[] = [];
  if (projectName) lines.push(`# اعتبارسنجی ایده — ${projectName}`, "");
  lines.push(
    `## حکم: ${VERDICT_LABELS[report.verdict]}`,
    report.verdictRationale,
    "",
    `امتیاز کلی: ${report.overallScore}/100 (اطمینان: ${report.confidence})`,
    "",
    "## خلاصه",
    report.critique.summary,
    "",
    "### نقاط قوت",
    ...report.critique.strengths.map((s) => `- ${s}`),
    "",
    "### نقاط ضعف",
    ...report.critique.weaknesses.map((s) => `- ${s}`),
    "",
    "## ابعاد",
    ...report.dimensions.map((d) => `- ${d.label}: ${d.score}/100 — ${d.note}`),
    "",
    "## فرض‌ها",
    ...report.assumptions.map(
      (a) => `- [${a.risk}] ${a.text}${a.experimentId ? ` (آزمایش: ${a.experimentId})` : ""}`
    ),
    "",
    "## آزمایش‌ها",
    ...report.experiments.map(
      (e) =>
        `### ${e.title}${e.isPrimary ? " (این هفته)" : ""}\n${e.steps}\nمعیار: ${e.metric}\nهزینه: ${e.estimatedCost} | زمان: ${e.estimatedTime}`
    ),
    "",
    "## نمونه‌های مشابه",
    ...report.comparableStartups.map(
      (c) => `- **${c.name}** — شباهت: ${c.similarity}\n  درس: ${c.lesson}`
    ),
    "",
    "## اقدام بعدی",
    ...report.nextActions.map((a) => `- ${a.label}: ${a.detail}`),
  );
  if (report.reasoning) {
    lines.push("", "## استدلال", report.reasoning);
  }
  return lines.join("\n");
}

/** Normalize legacy / partial AI payloads into the new schema shape. */
export function preprocessValidationPayload(parsed: unknown): unknown {
  if (!parsed || typeof parsed !== "object") return parsed;
  const raw = parsed as Record<string, unknown>;
  const critique = (raw.critique as Record<string, unknown>) || {};

  const overallScore =
    typeof raw.overallScore === "number"
      ? raw.overallScore
      : typeof critique.score === "number"
        ? critique.score
        : 50;

  let verdict = raw.verdict;
  if (
    typeof verdict !== "string" ||
    !VALIDATION_VERDICTS.includes(verdict as ValidationVerdict)
  ) {
    if (overallScore >= 75) verdict = "go";
    else if (overallScore >= 55) verdict = "conditional_go";
    else if (overallScore >= 35) verdict = "pivot";
    else verdict = "kill";
  }

  const experiments = Array.isArray(raw.experiments)
    ? (raw.experiments as Record<string, unknown>[]).map((e, i) => ({
        id: String(e.id || `exp-${i + 1}`),
        title: String(e.title || `آزمایش ${i + 1}`),
        steps: String(e.steps || ""),
        metric: String(e.metric || ""),
        estimatedCost: String(e.estimatedCost || ""),
        estimatedTime: String(e.estimatedTime || ""),
        isPrimary: Boolean(e.isPrimary) || i === 0,
      }))
    : [];

  const assumptions = Array.isArray(raw.assumptions)
    ? (raw.assumptions as Record<string, unknown>[]).map((a, i) => {
        const riskRaw = String(a.risk || "major");
        const risk: AssumptionRisk =
          riskRaw === "critical" || riskRaw === "minor" ? riskRaw : "major";
        return {
          id: String(a.id || `asm-${i + 1}`),
          text: String(a.text || ""),
          risk,
          experimentId: String(a.experimentId || experiments[0]?.id || ""),
        };
      })
    : [];

  return {
    ...raw,
    verdict,
    verdictRationale:
      String(raw.verdictRationale || critique.summary || raw.reasoning || ""),
    overallScore,
    confidence: raw.confidence || "medium",
    critique: {
      summary: String(critique.summary || ""),
      strengths: Array.isArray(critique.strengths) ? critique.strengths : [],
      weaknesses: Array.isArray(critique.weaknesses) ? critique.weaknesses : [],
    },
    dimensions: Array.isArray(raw.dimensions) ? raw.dimensions : [],
    assumptions,
    experiments,
    comparableStartups: Array.isArray(raw.comparableStartups)
      ? raw.comparableStartups
      : [],
    evidenceChecklist: Array.isArray(raw.evidenceChecklist)
      ? raw.evidenceChecklist
      : [],
    nextActions: Array.isArray(raw.nextActions) ? raw.nextActions : [],
    thisWeekExperimentId:
      String(raw.thisWeekExperimentId || experiments.find((e) => e.isPrimary)?.id || experiments[0]?.id || ""),
    reasoning: String(raw.reasoning || ""),
  };
}
