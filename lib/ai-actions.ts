"use server";

import { callOpenRouter, parseJsonFromAI, TEXT_MODELS, TIER_DEFAULT, TIER_GROUNDED } from "@/lib/openrouter";
import { checkAILimit } from "@/lib/ai-limit-middleware";
import { runWithAiUsage } from "@/lib/ai-usage-context";
import { getPrompt } from "@/lib/prompts/registry";
import {
  callAIWithValidation,
  SuggestAudienceSchema,
  SuggestNameSchema,
  BreakTaskSchema,
  SwotCompetitorsSchema,
  PitchDeckSchema,
  SmartCanvasSchema
} from "@/lib/ai-validation";

// === Shared Types ===
interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  isLimitError?: boolean;
}

// === Suggest Audience ===

export async function suggestAudienceAction(productIdea: string): Promise<ActionResponse<{ audiences: string[], revenueModels: string[] }>> {
  let rollback = async () => {};
  try {
    const limitResult = await checkAILimit();
    if (limitResult.errorResponse) return { success: false, error: "AI_LIMIT_REACHED", isLimitError: true };
    rollback = limitResult.rollback;

    if (!productIdea || productIdea.trim().length < 3) {
      return { success: true, data: { audiences: [], revenueModels: [] } };
    }

    const { system, user } = getPrompt("suggestAudience", { productIdea });

    try {
      const parsed = await runWithAiUsage(
        { userId: limitResult.user?.id || "anonymous", feature: "suggestAudience" },
        () => callAIWithValidation(
          user,
          { systemPrompt: system, maxTokens: 800, temperature: 0.5, timeoutMs: 25000 },
          SuggestAudienceSchema,
          1
        )
      );
      return {
        success: true,
        data: parsed
      };
    } catch (err) {
      console.warn("AI Validation failed for suggestAudienceAction, using fallback:", err);
      await rollback();
      return { 
        success: true, // Return fallback as success
        data: {
            audiences: ["جوانان", "خانواده‌ها", "متخصصان", "کسب‌وکارها"],
            revenueModels: ["فروش مستقیم", "اشتراکی", "فریمیوم"]
        }
      };
    }
  } catch (error) {
    console.error("suggestAudienceAction error:", error);
    await rollback();
    return { success: false, error: "Failed to suggest audience" };
  }
}

// === Suggest Project Name ===

export async function suggestProjectNameAction(idea: string): Promise<ActionResponse<{ names: string[] }>> {
  let rollback = async () => {};
  try {
    const limitResult = await checkAILimit();
    if (limitResult.errorResponse) return { success: false, error: "AI_LIMIT_REACHED", isLimitError: true };
    rollback = limitResult.rollback;

    if (!idea) return { success: true, data: { names: [] } };

    const { system, user } = getPrompt("suggestName", { idea });

    try {
      const parsed = await runWithAiUsage(
        { userId: limitResult.user?.id || "anonymous", feature: "suggestName" },
        () => callAIWithValidation(
          user,
          { systemPrompt: system, maxTokens: 800, temperature: 0.7, timeoutMs: 20000 },
          SuggestNameSchema,
          2
        )
      );
      const names = (parsed.names || []).map((n) => n.trim()).filter(Boolean).slice(0, 6);
      if (names.length < 3) {
        throw new Error(`AI returned insufficient names (${names.length})`);
      }
      return {
        success: true,
        data: { names }
      };
    } catch (err) {
      console.warn("AI Validation failed for suggestProjectNameAction, using fallback:", err);
      await rollback();
      const fallbackNames = generateFallbackNames(idea);
      return { success: true, data: { names: fallbackNames } };
    }

  } catch (error) {
    console.error("suggestProjectNameAction error:", error);
    await rollback();
    return { success: false, error: "Failed to suggest name" };
  }
}

function extractContextLine(idea: string, prefix: string): string {
  const line = idea.split("\n").find((l) => l.startsWith(prefix));
  if (!line) return "";
  return line.slice(prefix.length).replace(/^:\s*/, "").trim();
}

const GENERIC_STOP_WORDS = new Set([
  "کسب‌وکار", "سنتی", "استارتاپ", "تولید", "محتوا", "دسته", "شرح",
  "جزئیات", "سبک", "مرجع", "فعلی", "کاربر", "پروژه", "چشم‌انداز",
  "مثلاً", "ارزش", "واقعی", "دنیای", "تمرکز", "ساخت", "برند", "نام",
]);

function generateFallbackNames(idea: string): string[] {
  const userName = extractContextLine(idea, "نام فعلی کاربر");
  const vision = extractContextLine(idea, "چشم‌انداز پروژه");
  const details = extractContextLine(idea, "جزئیات");

  const suggestions: string[] = [];
  const seen = new Set<string>();

  const add = (name: string) => {
    const cleaned = name.trim().replace(/\s+/g, " ");
    if (cleaned.length >= 2 && !seen.has(cleaned)) {
      seen.add(cleaned);
      suggestions.push(cleaned);
    }
  };

  if (userName) {
    const words = userName.split(/\s+/).filter(Boolean);
    const [w1, w2] = words;
    add(userName);
    if (w1 && w2) {
      add(`${w2} ${w1}`);
      add(`${w1}‌${w2}`);
      add(`${w1}${w2}`);
      add(`نو ${w1}`);
      add(`${w1}ی`);
      add(`${w2}ی`);
    } else if (w1) {
      add(`${w1}ی`);
      add(`نو ${w1}`);
      add(`${w1}‌پلاس`);
      add(`${w1}کده`);
      add(`${w1}‌ک`);
      add(`${w1}‌گاه`);
    }
  }

  const textPool = [vision, details].filter(Boolean).join(" ");
  const keywords = textPool
    .split(/[\s\n،.:]+/)
    .map((w) => w.replace(/[^\p{L}\p{N}‌]/gu, ""))
    .filter((w) => w.length > 2 && !GENERIC_STOP_WORDS.has(w));

  for (const kw of keywords.slice(0, 4)) {
    add(`${kw}ی`);
    add(`نو ${kw}`);
  }

  if (suggestions.length < 3) {
    const seed = keywords[0] || "برند";
    add(`${seed}ی`);
    add(`نو ${seed}`);
    add(`${seed}‌پلاس`);
    add(`${seed}کده`);
    add(`${seed}‌ک`);
    add(`${seed}‌گاه`);
  }

  const result = suggestions.slice(0, 6);
  return result;
}

// === Break Task ===

export async function breakTaskAction(taskName: string): Promise<ActionResponse<{ subTasks: string[] }>> {
  let rollback = async () => {};
  try {
    const limitResult = await checkAILimit();
    if (limitResult.errorResponse) return { success: false, error: "AI_LIMIT_REACHED", isLimitError: true };
    rollback = limitResult.rollback;

    if (!taskName) return { success: false, error: 'Task name required' };

    const { system, user } = getPrompt("breakTask", { taskName });

    const fallback = [
        `تحقیق درباره ${taskName}`,
        `شروع اجرای ${taskName}`,
        `بررسی نتیجه`
    ];

    try {
      const parsed = await runWithAiUsage(
        { userId: limitResult.user?.id || "anonymous", feature: "breakTask" },
        () => callAIWithValidation(
          user,
          { systemPrompt: system, maxTokens: 800, temperature: 0.5, timeoutMs: 20000 },
          BreakTaskSchema,
          1
        )
      );
      return { success: true, data: parsed };
    } catch (err) {
      console.warn("AI Validation failed for breakTaskAction, using fallback:", err);
      await rollback();
      return { success: true, data: { subTasks: fallback } };
    }

  } catch (error) {
    console.error("breakTaskAction error:", error);
    await rollback();
    return { success: false, error: "Failed to break task" };
  }
}

// === Analyze Competitors ===

export async function analyzeCompetitorsAction(data: { projectName: string, projectIdea: string, audience: string }, options?: { skipLimitCheck?: boolean }): Promise<ActionResponse<any>> {
    let rollback = async () => {};
    let usageUserId: string | undefined;
    try {
        // When invoked from the Copilot agent loop, the outer request already
        // incremented the monthly quota and records usage aggregated there —
        // skip a second charge and a second usage record to avoid double counting.
        if (!options?.skipLimitCheck) {
            const limitResult = await checkAILimit();
            if (limitResult.errorResponse) return { success: false, error: "AI_LIMIT_REACHED", isLimitError: true };
            rollback = limitResult.rollback;
            usageUserId = limitResult.user?.id;
        }

        if (!process.env.OPENROUTER_API_KEY) {
            await rollback();
            return { success: true, data: getMockCompetitors() };
        }

        const { system, user } = getPrompt("analyzeCompetitors", {
            projectName: data.projectName,
            projectIdea: data.projectIdea,
            audience: data.audience
        });

        try {
            const runValidation = () => callAIWithValidation(
                user,
                {
                    systemPrompt: system,
                    maxTokens: 2000,
                    temperature: 0.7,
                    timeoutMs: 30000,
                    // Grounded via Perplexity Sonar (built-in live web search) instead
                    // of LLM hallucination. Mock remains a last-resort degraded mode.
                    modelOverride: TIER_GROUNDED,
                },
                SwotCompetitorsSchema,
                1
            );
            // Only record per-call usage on the direct (non-Copilot) path.
            const parsed = usageUserId
                ? await runWithAiUsage({ userId: usageUserId, feature: "analyzeCompetitors" }, runValidation)
                : await runValidation();
            // Keep reasoning for UI display
            return { success: true, data: parsed };
        } catch (err) {
            console.warn("AI Validation failed for analyzeCompetitorsAction, using mock:", err);
            await rollback();
            return { success: true, data: getMockCompetitors() };
        }

    } catch (error) {
        console.error("analyzeCompetitorsAction error:", error);
        await rollback();
        return { success: true, data: getMockCompetitors() };
    }
}

function getMockCompetitors() {
    return {
        competitors: [
          { name: "رقیب ایرانی ۱", channel: "وب‌سایت", strength: "برند قوی", weakness: "قیمت بالا", isIranian: true },
          { name: "رقیب ایرانی ۲", channel: "اینستاگرام", strength: "فعال در شبکه اجتماعی", weakness: "کیفیت ناپایدار", isIranian: true },
          { name: "رقیب ایرانی ۳", channel: "اپ موبایل", strength: "تجربه کاربری خوب", weakness: "بدون وب‌سایت", isIranian: true },
          { name: "Global Competitor", channel: "Website", strength: "تکنولوژی پیشرفته", weakness: "فارسی ندارد", isIranian: false },
          { name: "International Player", channel: "App", strength: "سرمایه‌گذاری بالا", weakness: "درک بازار ایران ندارد", isIranian: false }
        ],
        swot: {
          strengths: ["چابکی و سرعت تصمیم‌گیری", "درک عمیق بازار ایران", "هزینه‌های پایین"],
          weaknesses: ["برند ناشناخته", "منابع مالی محدود", "تیم کوچک"],
          opportunities: ["شکاف در بازار موجود", "رشد دیجیتالی ایران", "نیاز برآورده نشده مشتریان"],
          threats: ["ورود رقبای بزرگ", "تغییرات اقتصادی", "تغییر رفتار مصرف‌کننده"]
        }
    };
}
// === Generate Pitch Deck ===

export async function generatePitchDeckAction(data: { idea: string, wizardAnswers?: any, projectContext?: any }): Promise<ActionResponse<{ slides: any[] }>> {
    let rollback = async () => {};
    try {
        const limitResult = await checkAILimit();
        if (limitResult.errorResponse) return { success: false, error: "AI_LIMIT_REACHED", isLimitError: true };
        rollback = limitResult.rollback;

        const { idea, wizardAnswers, projectContext } = data;
        const wizardAnswersBlock = wizardAnswers ? `اطلاعات تکمیلی از ویزارد داستان:
        - کهن‌الگوی روایت: ${wizardAnswers.archetype || 'classic_seed'}
        - مرحله: ${wizardAnswers.stage || ''}
        - تگ‌لاین: ${wizardAnswers.tagline || ''}
        - مشکل: ${wizardAnswers.problem || ''}
        - راهکار: ${wizardAnswers.solution || ''}
        - بازار هدف: ${wizardAnswers.market || ''}
        - مدل درآمدی: ${wizardAnswers.revenue || ''}
        - مبلغ جذب سرمایه: ${wizardAnswers.raiseSize || wizardAnswers.ask || ''}
        - تیم: ${wizardAnswers.team || ''}
        - لحن: ${wizardAnswers.voice || 'حرفه‌ای'}` : '';

        let projectContextBlock = '';
        if (projectContext) {
            const runway = projectContext.financials?.runway;
            projectContextBlock = `اطلاعات پروژه‌ای فعلی در سیستم (اولویت با داده واقعی پروژه؛ اعداد ساختگی را با برچسب تخمینی مشخص کن):
- نام پروژه: ${projectContext.projectName || ''}
- بودجه/Ask: ${projectContext.budget || ''}
- مخاطب: ${projectContext.audience || ''}
- بوم ناب (Lean Canvas):
  * مشکل: ${JSON.stringify(projectContext.leanCanvas?.problem || '')}
  * راهکار: ${JSON.stringify(projectContext.leanCanvas?.solution || '')}
  * ارزش پیشنهادی: ${projectContext.leanCanvas?.uniqueValue || ''}
  * بخش مشتریان: ${JSON.stringify(projectContext.leanCanvas?.customerSegments || '')}
  * کانال‌ها: ${JSON.stringify(projectContext.leanCanvas?.channels || '')}
  * مدل درآمدی: ${JSON.stringify(projectContext.leanCanvas?.revenueStream || '')}
  * ساختار هزینه‌ها: ${JSON.stringify(projectContext.leanCanvas?.costStructure || '')}
- لیست رقبا: ${Array.isArray(projectContext.competitors) ? projectContext.competitors.map((c: any) => `${c.name} (قوت: ${c.strength || ''} / ضعف: ${c.weakness || ''})`).join('، ') : ''}
- نقشه راه فازها: ${Array.isArray(projectContext.roadmap) ? projectContext.roadmap.map((r: any) => `${r.title}`).join('، ') : ''}
- استراتژی بازاریابی: ${Array.isArray(projectContext.marketingStrategy) ? projectContext.marketingStrategy.join('، ') : ''}
- Runway: ${runway ? `${runway.runwayMonths} ماه / burn ${runway.monthlyBurn}` : 'نامشخص'}
- اعتبارسنجی: ${JSON.stringify(projectContext.validation || projectContext.ideaValidation || {})}
- رشد: ${JSON.stringify(projectContext.growth || projectContext.growthPlan || {})}`;
        }

        const projectName = projectContext?.projectName || 'پروژه استارتاپی';

        const { system, user } = getPrompt("generatePitchDeck", { 
            projectName, 
            idea, 
            projectContextBlock, 
            wizardAnswersBlock 
        });

        try {
            const { multiPassGenerate } = await import("@/lib/ai/multi-pass");
            const { normalizeSlide } = await import("@/lib/pitch-deck/migrate");

            const parsed = await runWithAiUsage(
                { userId: limitResult.user?.id || "anonymous", feature: "generatePitchDeck" },
                async () => {
                    try {
                        const multi = await multiPassGenerate<{ slides?: any[]; reasoning?: string }>(
                            user,
                            system,
                            {
                                maxTokens: 4000,
                                temperature: 0.55,
                                critiqueInstruction:
                                    "نقد سرمایه‌گذارانه: آیا داستان قانع‌کننده، داده‌ها واقع‌بینانه، Ask شفاف، و اسلایدها به فارسی و کامل‌اند؟ اعداد بدون منبع را در claims با status=estimate نگه دار. JSON اصلاح‌شده را برگردان.",
                            }
                        );
                        const validated = PitchDeckSchema.safeParse(multi.data);
                        if (validated.success) return validated.data;
                        // Fallback single-pass validation
                        return callAIWithValidation(
                            user,
                            { systemPrompt: system, maxTokens: 4000, temperature: 0.55, timeoutMs: 45000 },
                            PitchDeckSchema,
                            1
                        );
                    } catch {
                        return callAIWithValidation(
                            user,
                            { systemPrompt: system, maxTokens: 4000, temperature: 0.55, timeoutMs: 45000 },
                            PitchDeckSchema,
                            1
                        );
                    }
                }
            );
            
            let slides = (parsed.slides || []).map((s: any, i: number) => normalizeSlide(s, i));

            return { success: true, data: { slides } };
        } catch (err) {
            console.error("AI Validation failed for generatePitchDeckAction:", err);
            await rollback();
            return { success: false, error: "Invalid AI response format" };
        }

    } catch (error) {
        console.error("generatePitchDeckAction error:", error);
        await rollback();
        return { success: false, error: "Failed to generate deck" };
    }
}

// === Generate Smart Canvas ===

export async function generateSmartCanvasAction(data: { idea: string, answers: Record<string, string>, type: 'lean' | 'brand' }): Promise<ActionResponse<Record<string, string[]>>> {
    let rollback = async () => {};
    try {
        const limitResult = await checkAILimit();
        if (limitResult.errorResponse) return { success: false, error: "AI_LIMIT_REACHED", isLimitError: true };
        rollback = limitResult.rollback;

        const { idea, answers, type } = data;
        const answersBlock = Object.entries(answers).map(([key, val]) => `- ${key}: ${val}`).join('\n');

        const { system, user } = getPrompt("generateSmartCanvas", { idea, type, answersBlock });

        try {
            const parsed = await runWithAiUsage(
                { userId: limitResult.user?.id || "anonymous", feature: "generateSmartCanvas" },
                () => callAIWithValidation(
                    user,
                    { systemPrompt: system, maxTokens: 2500, temperature: 0.7, timeoutMs: 30000 },
                    SmartCanvasSchema,
                    1
                )
            );
            return { success: true, data: parsed as any };
        } catch (err) {
            console.error("AI Validation failed for generateSmartCanvasAction:", err);
            await rollback();
            return { success: false, error: "Invalid AI response format" };
        }

    } catch (error) {
        console.error("generateSmartCanvasAction error:", error);
        await rollback();
        return { success: false, error: "Failed to generate canvas" };
    }
}
