import "server-only";
import { callOpenRouter, parseJsonFromAI } from "@/lib/openrouter";

/**
 * Draft → critique → refine for high-stakes structured outputs
 */
export async function multiPassGenerate<T extends Record<string, unknown>>(
  userPrompt: string,
  systemPrompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
    modelOverride?: string;
    critiqueInstruction?: string;
  } = {}
): Promise<{ data: T; reasoning?: string; passes: number }> {
  const draft = await callOpenRouter(userPrompt, {
    systemPrompt,
    maxTokens: options.maxTokens ?? 4000,
    temperature: options.temperature ?? 0.5,
    modelOverride: options.modelOverride,
  });

  if (!draft.success || !draft.content) {
    throw new Error(draft.error || "Draft generation failed");
  }

  const critiquePrompt = `
${options.critiqueInstruction || "نقد کن: آیا خروجی شخصی‌سازی شده، واقع‌بینانه و کامل است؟"}

خروجی قبلی:
${draft.content}

فقط JSON اصلاح‌شده را برگردان — همان ساختار، با بهبود کیفیت.
`;

  const refined = await callOpenRouter(critiquePrompt, {
    systemPrompt: systemPrompt + "\n\nاین پاس دوم است — خروجی را بهبود بده.",
    maxTokens: options.maxTokens ?? 4000,
    temperature: 0.3,
    modelOverride: options.modelOverride,
  });

  const content = refined.success && refined.content ? refined.content : draft.content;
  const parsed = parseJsonFromAI(content) as T;
  const reasoning =
    typeof parsed.reasoning === "string" ? parsed.reasoning : undefined;

  return { data: parsed, reasoning, passes: refined.success ? 2 : 1 };
}
