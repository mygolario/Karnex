import type { ProjectType } from "@/app/new-project/genesis-constants";

export interface QualityScoreInput {
  pillar: ProjectType | null;
  projectName: string;
  projectVision: string;
  answers: Record<string, string>;
  audience: string;
  budget: string;
  profileComplete?: boolean;
}

export interface QualityScoreResult {
  score: number;
  gaps: QualityGap[];
  canGenerate: boolean;
}

export interface QualityGap {
  id: string;
  label: string;
  impact: number;
  field: string;
}

const PILLAR_REQUIRED: Record<ProjectType, string[]> = {
  startup: ["tech_stack", "stage"],
  traditional: ["location_type"],
  creator: ["platform"],
};

const PILLAR_RECOMMENDED: Record<ProjectType, { field: string; label: string; impact: number }[]> = {
  startup: [
    { field: "audience", label: "مخاطب هدف", impact: 12 },
    { field: "budget", label: "بودجه تقریبی", impact: 10 },
    { field: "revenue_model", label: "مدل درآمد", impact: 8 },
  ],
  traditional: [
    { field: "budget", label: "بودجه راه‌اندازی", impact: 15 },
    { field: "audience", label: "مشتری هدف", impact: 10 },
    { field: "geo", label: "موقعیت جغرافیایی", impact: 8 },
  ],
  creator: [
    { field: "audience", label: "مخاطب محتوا", impact: 15 },
    { field: "content_style", label: "سبک محتوا", impact: 8 },
    { field: "monetization", label: "مدل درآمد", impact: 10 },
  ],
};

function inferFromVision(vision: string, keywords: string[]): boolean {
  const lower = vision.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

export function computeQualityScore(input: QualityScoreInput): QualityScoreResult {
  const gaps: QualityGap[] = [];
  let score = 0;

  if (input.pillar) score += 10;
  else gaps.push({ id: "pillar", label: "انتخاب مسیر", impact: 10, field: "pillar" });

  if (input.projectName.trim().length >= 2) score += 10;
  else gaps.push({ id: "name", label: "نام پروژه", impact: 10, field: "projectName" });

  const visionLen = input.projectVision.trim().length;
  if (visionLen >= 80) score += 25;
  else if (visionLen >= 20) score += 15;
  else gaps.push({ id: "vision", label: "توضیح ایده (حداقل ۲۰ کاراکتر)", impact: 25, field: "projectVision" });

  if (input.pillar) {
    for (const qId of PILLAR_REQUIRED[input.pillar]) {
      if (input.answers[qId]) score += 8;
      else gaps.push({ id: qId, label: `پاسخ: ${qId}`, impact: 8, field: qId });
    }

    for (const rec of PILLAR_RECOMMENDED[input.pillar]) {
      const val =
        rec.field === "audience"
          ? input.audience
          : rec.field === "budget"
            ? input.budget
            : input.answers[rec.field];
      if (val && val.trim()) {
        score += rec.impact;
      } else if (rec.field === "audience" && inferFromVision(input.projectVision, ["مخاطب", "کاربر", "مشتری", "جوان", "زنان", "مردان"])) {
        score += Math.floor(rec.impact * 0.6);
      } else if (rec.field === "budget" && inferFromVision(input.projectVision, ["بودجه", "میلیون", "تومان", "سرمایه"])) {
        score += Math.floor(rec.impact * 0.6);
      } else {
        gaps.push({ id: rec.field, label: rec.label, impact: rec.impact, field: rec.field });
      }
    }
  }

  if (input.profileComplete) score += 10;

  score = Math.min(100, Math.round(score));

  const pillar = input.pillar;
  let canGenerate = Boolean(pillar && input.projectName.trim().length >= 2 && visionLen >= 20);
  if (pillar) {
    for (const qId of PILLAR_REQUIRED[pillar]) {
      if (!input.answers[qId]) canGenerate = false;
    }
  }

  return { score, gaps: gaps.sort((a, b) => b.impact - a.impact), canGenerate };
}

export function blueprintBlocksFromInput(input: QualityScoreInput): { id: string; label: string; filled: boolean }[] {
  const { score } = computeQualityScore(input);
  const blocks = [
    { id: "value", label: "ارزش پیشنهادی", filled: input.projectVision.length > 30 },
    { id: "customer", label: "مشتریان", filled: Boolean(input.audience.trim()) || inferFromVision(input.projectVision, ["مخاطب", "مشتری"]) },
    { id: "channels", label: "کانال‌ها", filled: Boolean(input.answers.platform || input.answers.location_type) },
    { id: "revenue", label: "درآمد", filled: Boolean(input.budget.trim() || input.answers.revenue_model || input.answers.monetization) },
    { id: "resources", label: "منابع کلیدی", filled: Boolean(input.answers.tech_stack || input.budget.trim()) },
    { id: "roadmap", label: "فاز ۱ نقشه راه", filled: score >= 40 || input.projectVision.length > 50 },
  ];
  return blocks;
}
