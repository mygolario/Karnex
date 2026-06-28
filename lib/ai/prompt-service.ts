import "server-only";
import { assemblePrompt, type AssemblePromptOptions } from "@/lib/prompts/assembler";
import {
  loadUserProfile,
  loadProjectMemory,
} from "@/lib/copilot/memory";
import type { PromptContextInput } from "@/lib/prompts/context-builder";

export const SCRIPT_TEMPLATE_INSTRUCTIONS: Record<string, string> = {
  "viral-hook":
    "ساختار: Hook ۳ ثانیه‌ای → ارزش اصلی → CTA. برای Reels/Shorts بهینه.",
  educational:
    "ساختار: معرفی موضوع → ۳ نکته آموزشی → جمع‌بندی. برای YouTube.",
  storytelling:
    "ساختار: داستان شخصی → درس → دعوت به اقدام. احساسی و صمیمی.",
  sales:
    "ساختار: مشکل → راه‌حل → اثبات اجتماعی → پیشنهاد. برای فروش.",
};

export interface ResolvedPromptInput extends Omit<AssemblePromptOptions, "userProfile" | "memory"> {
  userId?: string;
  projectId?: string;
  projectData?: Record<string, unknown>;
}

/** Load profile + memory and assemble layered prompt */
export async function resolveAssembledPrompt(
  input: ResolvedPromptInput
) {
  let userProfile: PromptContextInput["userProfile"];
  let memory: PromptContextInput["memory"];

  if (input.userId) {
    const profile = await loadUserProfile(input.userId);
    if (profile) {
      userProfile = {
        preferredTone: profile.preferredTone ?? undefined,
        expertiseLevel: profile.expertiseLevel ?? undefined,
        role: profile.role ?? undefined,
        industry: profile.industry ?? undefined,
        businessStage: profile.businessStage ?? undefined,
        goals: Array.isArray(profile.goals)
          ? (profile.goals as string[])
          : undefined,
      };
    }
  }

  if (input.projectId) {
    const mem = await loadProjectMemory(input.projectId);
    if (mem) {
      const asStr = (arr: unknown) =>
        Array.isArray(arr)
          ? (arr as { content?: string; question?: string; value?: string; key?: string }[])
              .map((x) => x.content || x.question || x.value || x.key || "")
              .filter(Boolean)
          : [];
      memory = {
        decisions: asStr(mem.decisions),
        risks: asStr(mem.risks),
        openQuestions: asStr(mem.openQuestions),
        keyFacts: asStr(mem.keyFacts),
      };
    }
  }

  return assemblePrompt({
    ...input,
    projectData: input.projectData,
    userProfile,
    memory,
  });
}
