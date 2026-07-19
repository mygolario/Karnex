import "server-only";
import { callOpenRouter, parseJsonFromAI } from "@/lib/openrouter";

/**
 * Draft → critique → refine for high-stakes structured outputs.
 * Prefer draft on Flash (`modelOverride` / default) and refine on Claude
 * (`refineModelOverride`) for quality without paying frontier cost on both passes.
 */
export async function multiPassGenerate<T extends Record<string, unknown>>(
  userPrompt: string,
  systemPrompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
    /** Draft-pass model (defaults to TEXT_MODELS chain when omitted) */
    modelOverride?: string;
    /** Refine-pass model; falls back to modelOverride when omitted */
    refineModelOverride?: string;
    critiqueInstruction?: string;
  } = {}
): Promise<{ data: T; reasoning?: string; passes: number }> {
  const draftModel = options.modelOverride;
  const refineModel = options.refineModelOverride ?? options.modelOverride;

  const draft = await callOpenRouter(userPrompt, {
    systemPrompt,
    maxTokens: options.maxTokens ?? 4000,
    temperature: options.temperature ?? 0.5,
    modelOverride: draftModel,
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
    modelOverride: refineModel,
  });

  const content = refined.success && refined.content ? refined.content : draft.content;
  const parsed = parseJsonFromAI(content) as T;
  const reasoning =
    typeof parsed.reasoning === "string" ? parsed.reasoning : undefined;

  return { data: parsed, reasoning, passes: refined.success ? 2 : 1 };
}
