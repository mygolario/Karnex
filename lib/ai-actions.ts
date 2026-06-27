"use server";

import { callOpenRouter, parseJsonFromAI, TEXT_MODELS } from "@/lib/openrouter";
import { checkAILimit } from "@/lib/ai-limit-middleware";
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
      const parsed = await callAIWithValidation(
        user,
        { systemPrompt: system, maxTokens: 800, temperature: 0.5, timeoutMs: 25000 },
        SuggestAudienceSchema,
        1
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
      const parsed = await callAIWithValidation(
        user,
        { systemPrompt: system, maxTokens: 800, temperature: 0.7, timeoutMs: 20000 },
        SuggestNameSchema,
        1
      );
      return {
        success: true,
        data: { names: (parsed.names || []).slice(0, 6) }
      };
    } catch (err) {
      console.warn("AI Validation failed for suggestProjectNameAction, using fallback:", err);
      await rollback();
      return { success: true, data: { names: generateFallbackNames(idea) } };
    }

  } catch (error) {
    console.error("suggestProjectNameAction error:", error);
    await rollback();
    return { success: false, error: "Failed to suggest name" };
  }
}

function generateFallbackNames(idea: string): string[] {
  const words = idea.split(/\s+/).filter(w => w.length > 2);
  const baseWord = words[0] || "پروژه";
  const suffixes = ["پلاس", "نو", "یار", "لند", "باز", "مارکت"];
  return suffixes.map((suffix, i) =>
    i < 3 ? `${baseWord} ${suffix}` : `${baseWord}${suffix}`
  );
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
      const parsed = await callAIWithValidation(
        user,
        { systemPrompt: system, maxTokens: 800, temperature: 0.5, timeoutMs: 20000 },
        BreakTaskSchema,
        1
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
    try {
        // When invoked from the Copilot agent loop, the outer request already
        // incremented the monthly quota — skip a second charge to avoid
        // double-counting a single user message.
        if (!options?.skipLimitCheck) {
            const limitResult = await checkAILimit();
            if (limitResult.errorResponse) return { success: false, error: "AI_LIMIT_REACHED", isLimitError: true };
            rollback = limitResult.rollback;
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
            const parsed = await callAIWithValidation(
                user,
                {
                    systemPrompt: system,
                    maxTokens: 2000,
                    temperature: 0.7,
                    timeoutMs: 30000,
                    modelOverride: "google/gemini-3.5-flash",
                },
                SwotCompetitorsSchema,
                1
            );
            if (parsed && typeof parsed === 'object') {
                delete (parsed as any).reasoning;
            }
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
        const wizardAnswersBlock = wizardAnswers ? `اطلاعات تکمیلی از فرم دستیار:
        - تگ‌لاین: ${wizardAnswers.tagline || ''}
        - مشکل: ${wizardAnswers.problem || ''}
        - راهکار: ${wizardAnswers.solution || ''}
        - بازار هدف: ${wizardAnswers.market || ''}
        - مدل درآمدی: ${wizardAnswers.revenue || ''}
        - تیم: ${wizardAnswers.team || ''}` : '';

        let projectContextBlock = '';
        if (projectContext) {
            projectContextBlock = `اطلاعات پروژه‌ای فعلی در سیستم (از این اطلاعات برای شخصی‌سازی ارائه استفاده کن):
- نام پروژه: ${projectContext.projectName || ''}
- بوم ناب (Lean Canvas):
  * ارزش پیشنهادی: ${projectContext.leanCanvas?.uniqueValue || ''}
  * بخش مشتریان: ${projectContext.leanCanvas?.customerSegments || ''}
  * مدل درآمدی: ${projectContext.leanCanvas?.revenueStream || ''}
  * ساختار هزینه‌ها: ${projectContext.leanCanvas?.costStructure || ''}
- لیست رقبا: ${Array.isArray(projectContext.competitors) ? projectContext.competitors.map((c: any) => `${c.name} (${c.strength || ''})`).join('، ') : ''}
- نقشه راه فازها: ${Array.isArray(projectContext.roadmap) ? projectContext.roadmap.map((r: any) => `${r.title}`).join('، ') : ''}`;
        }

        const projectName = projectContext?.projectName || 'پروژه استارتاپی';

        const { system, user } = getPrompt("generatePitchDeck", { 
            projectName, 
            idea, 
            projectContextBlock, 
            wizardAnswersBlock 
        });

        try {
            const parsed = await callAIWithValidation(
                user,
                { systemPrompt: system, maxTokens: 3000, temperature: 0.7, timeoutMs: 30000 },
                PitchDeckSchema,
                1
            );
            
            let slides = parsed.slides || [];
            // Post-process to ensure IDs, types, and metadata are intact
            slides = slides.map((s: any, i: number) => ({
                id: s.id || `slide-${Date.now()}-${i}`,
                type: s.type || 'generic',
                title: s.title || 'بدون عنوان',
                bullets: Array.isArray(s.bullets) ? s.bullets : [],
                isHidden: s.isHidden || false,
                metadata: s.metadata || {}
            }));

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
            const parsed = await callAIWithValidation(
                user,
                { systemPrompt: system, maxTokens: 2500, temperature: 0.7, timeoutMs: 30000 },
                SmartCanvasSchema,
                1
            );
            if (parsed && typeof parsed === 'object') {
                delete (parsed as any).reasoning;
            }
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
