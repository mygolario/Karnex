import "server-only";
import { businessGlossary } from "@/lib/knowledge-base";
import {
  getPillarGlossary,
  formatGlossaryBlock,
} from "@/lib/prompts/pillar-glossaries";
import {
  EXPERTISE_INSTRUCTIONS,
  TONE_INSTRUCTIONS,
  PERSONA_PACKS,
} from "@/lib/prompts/persona-packs";
import type { ProjectType } from "@/lib/account/types";

export interface PromptContextInput {
  projectType?: ProjectType | string;
  projectName?: string;
  projectDescription?: string;
  projectAudience?: string;
  projectData?: Record<string, unknown>;
  userProfile?: {
    preferredTone?: string;
    expertiseLevel?: string;
    role?: string;
    industry?: string;
    businessStage?: string;
    goals?: string[];
  };
  memory?: {
    decisions?: string[];
    risks?: string[];
    openQuestions?: string[];
    keyFacts?: string[];
  };
}

export interface BuiltPromptContext {
  preferredToneInstruction: string;
  expertiseInstruction: string;
  liveContextSection: string;
  userProfileSection: string;
  memoryHighlightsSection: string;
  businessGlossary: string;
  personaSection: string;
  completedStepsSummary: string;
}

function buildLiveContext(
  data: Record<string, unknown> | undefined,
  projectType: string,
  projectName?: string,
  projectDescription?: string,
  projectAudience?: string
): string {
  const lines: string[] = [];
  if (projectName) lines.push(`- نام پروژه: ${projectName}`);
  if (projectDescription) lines.push(`- توضیح: ${projectDescription}`);
  if (projectAudience) lines.push(`- مخاطب: ${projectAudience}`);
  lines.push(`- نوع پروژه: ${projectType}`);

  if (!data) return lines.join("\n");

  const canvas =
    projectType === "creator" ? data.brandCanvas : data.leanCanvas;
  if (canvas && typeof canvas === "object") {
    const keys = Object.keys(canvas as object);
    const filled = keys.filter((k) => {
      const v = (canvas as Record<string, unknown>)[k];
      if (Array.isArray(v)) return v.length > 0;
      return v && String(v).trim().length > 0;
    }).length;
    lines.push(`- بوم: ${filled}/${keys.length} بخش پر شده`);
  }

  const roadmap = Array.isArray(data.roadmap) ? data.roadmap : [];
  const completed = Array.isArray(data.completedSteps)
    ? data.completedSteps
    : [];
  if (roadmap.length > 0) {
    lines.push(
      `- نقشه راه: ${completed.length} گام انجام‌شده از ${roadmap.reduce((n, p: { steps?: unknown[] }) => n + (p.steps?.length ?? 0), 0)}`
    );
  }

  if (projectType === "creator") {
    const calendar = Array.isArray(data.contentCalendar)
      ? data.contentCalendar
      : [];
    lines.push(`- تقویم محتوا: ${calendar.length} پست`);
    if (typeof data.contentStreak === "number") {
      lines.push(`- استریک محتوا: ${data.contentStreak} روز`);
    }
  }

  if (projectType === "traditional") {
    const permits = Array.isArray(data.permits) ? data.permits : [];
    const pending = permits.filter(
      (p: { status?: string }) => p.status !== "done"
    ).length;
    if (permits.length > 0) lines.push(`- مجوزها: ${pending} در انتظار`);
    if (data.locationAnalysis) lines.push("- تحلیل مکان: موجود");
  }

  if (projectType === "startup") {
    const deck = Array.isArray(data.pitchDeck) ? data.pitchDeck : [];
    lines.push(`- پیچ‌دک: ${deck.length} اسلاید`);
  }

  return lines.join("\n");
}

function buildUserProfileSection(
  profile: PromptContextInput["userProfile"]
): string {
  if (!profile) return "";
  const lines: string[] = ["## پروفایل کاربر"];
  if (profile.role) lines.push(`- نقش: ${profile.role}`);
  if (profile.industry) lines.push(`- صنعت: ${profile.industry}`);
  if (profile.businessStage) lines.push(`- مرحله: ${profile.businessStage}`);
  if (profile.goals?.length) {
    lines.push(`- اهداف: ${profile.goals.join("، ")}`);
  }
  return lines.length > 1 ? lines.join("\n") : "";
}

function buildMemorySection(memory: PromptContextInput["memory"]): string {
  if (!memory) return "";
  const parts: string[] = [];
  if (memory.decisions?.length) {
    parts.push(`تصمیمات: ${memory.decisions.slice(0, 5).join(" | ")}`);
  }
  if (memory.risks?.length) {
    parts.push(`ریسک‌ها: ${memory.risks.slice(0, 5).join(" | ")}`);
  }
  if (memory.keyFacts?.length) {
    parts.push(`حقایق: ${memory.keyFacts.slice(0, 5).join(" | ")}`);
  }
  if (!parts.length) return "";
  return `## حافظه پروژه\n${parts.join("\n")}`;
}

export function buildPromptContext(
  input: PromptContextInput
): BuiltPromptContext {
  const projectType = (input.projectType || "startup") as ProjectType;
  const tone = input.userProfile?.preferredTone || "balanced";
  const expertise = input.userProfile?.expertiseLevel || "beginner";

  const baseGlossary = Object.entries(businessGlossary)
    .slice(0, 8)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  const pillarGlossary = formatGlossaryBlock(getPillarGlossary(projectType));

  const completed = Array.isArray(input.projectData?.completedSteps)
    ? (input.projectData!.completedSteps as string[])
    : [];

  return {
    preferredToneInstruction:
      TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.balanced,
    expertiseInstruction:
      EXPERTISE_INSTRUCTIONS[expertise] || EXPERTISE_INSTRUCTIONS.beginner,
    liveContextSection: buildLiveContext(
      input.projectData,
      projectType,
      input.projectName,
      input.projectDescription,
      input.projectAudience
    ),
    userProfileSection: buildUserProfileSection(input.userProfile),
    memoryHighlightsSection: buildMemorySection(input.memory),
    businessGlossary: `${baseGlossary}\n${pillarGlossary}`,
    personaSection: PERSONA_PACKS[projectType] || PERSONA_PACKS.startup,
    completedStepsSummary:
      completed.length > 0 ? completed.slice(-5).join("، ") : "هنوز گامی انجام نشده",
  };
}
