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
  const mpStart = Date.now();
  const draft = await callOpenRouter(userPrompt, {
    systemPrompt,
    maxTokens: options.maxTokens ?? 4000,
    temperature: options.temperature ?? 0.5,
    modelOverride: options.modelOverride,
  });

  if (!draft.success || !draft.content) {
    throw new Error(draft.error || "Draft generation failed");
  }
  // #region agent log
  fetch('http://127.0.0.1:7443/ingest/9ae0ee8b-1865-4481-b3b2-37ccf5719385',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'50a938'},body:JSON.stringify({sessionId:'50a938',location:'multi-pass.ts:draft-done',message:'multiPass draft done',data:{draftMs:Date.now()-mpStart,draftLen:draft.content?.length??0},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
  // #endregion

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
  // #region agent log
  fetch('http://127.0.0.1:7443/ingest/9ae0ee8b-1865-4481-b3b2-37ccf5719385',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'50a938'},body:JSON.stringify({sessionId:'50a938',location:'multi-pass.ts:refine-done',message:'multiPass refine done',data:{totalMpMs:Date.now()-mpStart,passes:refined.success?2:1},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  const reasoning =
    typeof parsed.reasoning === "string" ? parsed.reasoning : undefined;

  return { data: parsed, reasoning, passes: refined.success ? 2 : 1 };
}
