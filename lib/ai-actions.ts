"use server";

import { callOpenRouter, parseJsonFromAI, TEXT_MODELS } from "@/lib/openrouter";
import { checkAILimit } from "@/lib/ai-limit-middleware";
import { getPrompt } from "@/lib/prompts/registry";

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

    const result = await callOpenRouter(
      user,
      { systemPrompt: system, maxTokens: 800, temperature: 0.5, timeoutMs: 25000, responseFormat: { type: "json_object" } }
    );

    if (!result.success) {
      await rollback();
      return { 
        success: true, // Return fallback as success
        data: {
            audiences: ["جوانان", "خانواده‌ها", "متخصصان", "کسب‌وکارها"],
            revenueModels: ["فروش مستقیم", "اشتراکی", "فریمیوم"]
        }
      };
    }

    try {
      const parsed = parseJsonFromAI(result.content!);
      return {
        success: true,
        data: {
            audiences: parsed.audiences || [],
            revenueModels: parsed.revenueModels || []
        }
      };
    } catch {
       await rollback();
       return { 
        success: true, 
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

    const result = await callOpenRouter(
      user,
      { systemPrompt: system, maxTokens: 800, temperature: 0.7, timeoutMs: 20000, responseFormat: { type: "json_object" } }
    );

    if (!result.success) {
       await rollback();
       return { success: true, data: { names: generateFallbackNames(idea) } };
    }

    try {
      let content = result.content!;
      content = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(content);
      const names = Array.isArray(parsed) ? parsed : (parsed?.names || []);

      if (Array.isArray(names) && names.length > 0) {
        return { success: true, data: { names: names.slice(0, 6) } };
      }
    } catch {
       const matches = result.content!.match(/["']([^"']+)["']/g);
       if (matches && matches.length > 0) {
         const names = matches.map((m: string) => m.replace(/["']/g, "")).slice(0, 6);
         return { success: true, data: { names } };
       }
    }
    
    await rollback();
    return { success: true, data: { names: generateFallbackNames(idea) } };

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

    const result = await callOpenRouter(
      user,
      { systemPrompt: system, maxTokens: 800, temperature: 0.5, timeoutMs: 20000, responseFormat: { type: "json_object" } }
    );

    const fallback = [
        `تحقیق درباره ${taskName}`,
        `شروع اجرای ${taskName}`,
        `بررسی نتیجه`
    ];

    if (!result.success) {
      await rollback();
      return { success: true, data: { subTasks: fallback } };
    }

    try {
      const parsed = parseJsonFromAI(result.content!);
      return { success: true, data: { subTasks: parsed.subTasks || [] } };
    } catch {
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

export async function analyzeCompetitorsAction(data: { projectName: string, projectIdea: string, audience: string }): Promise<ActionResponse<any>> {
    let rollback = async () => {};
    try {
        const limitResult = await checkAILimit();
        if (limitResult.errorResponse) return { success: false, error: "AI_LIMIT_REACHED", isLimitError: true };
        rollback = limitResult.rollback;

        if (!process.env.OPENROUTER_API_KEY) {
            await rollback();
            return { success: true, data: getMockCompetitors() };
        }

        const { system, user } = getPrompt("analyzeCompetitors", {
            projectName: data.projectName,
            projectIdea: data.projectIdea,
            audience: data.audience
        });

        const result = await callOpenRouter(user, {
            systemPrompt: system,
            maxTokens: 2500,
            temperature: 0.7,
            timeoutMs: 45000,
            modelOverride: "google/gemini-2.5-pro",
            responseFormat: { type: "json_object" }
        });

        if (!result.success) {
            await rollback();
            return { success: true, data: getMockCompetitors() };
        }

        try {
            const parsed = parseJsonFromAI(result.content!);
            // Clean up reasoning field if present before sending to UI (optional, but clean)
            if (parsed && typeof parsed === 'object') {
                delete parsed.reasoning;
            }
            return { success: true, data: parsed };
        } catch {
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

export async function generatePitchDeckAction(data: { idea: string, wizardAnswers?: any }): Promise<ActionResponse<{ slides: any[] }>> {
    let rollback = async () => {};
    try {
        const limitResult = await checkAILimit();
        if (limitResult.errorResponse) return { success: false, error: "AI_LIMIT_REACHED", isLimitError: true };
        rollback = limitResult.rollback;

        const { idea, wizardAnswers } = data;
        const wizardAnswersBlock = wizardAnswers ? `اطلاعات تکمیلی:
        - تگ‌لاین: ${wizardAnswers.tagline || ''}
        - مشکل: ${wizardAnswers.problem || ''}
        - راهکار: ${wizardAnswers.solution || ''}
        - بازار هدف: ${wizardAnswers.market || ''}
        - مدل درآمدی: ${wizardAnswers.revenue || ''}
        - تیم: ${wizardAnswers.team || ''}` : '';

        const { system, user } = getPrompt("generatePitchDeck", { idea, wizardAnswersBlock });

        const result = await callOpenRouter(
            user,
            { systemPrompt: system, maxTokens: 4000, temperature: 0.7, timeoutMs: 50000, responseFormat: { type: "json_object" } }
        );

        if (!result.success) {
             await rollback();
             return { success: false, error: "Failed to generate deck" };
        }

        try {
            const content = result.content!.replace(/```json/g, "").replace(/```/g, "").trim();
            let slides = JSON.parse(content);
            
            // Ensure structure
            if (!Array.isArray(slides)) {
                // Try to find array in object
                 const values = Object.values(slides);
                 const foundArray = values.find(v => Array.isArray(v));
                 if(foundArray) slides = foundArray;
            }

            // Post-process to ensure IDs and types
            slides = slides.map((s: any, i: number) => ({
                id: s.id || `slide-${Date.now()}-${i}`,
                type: s.type || 'generic',
                title: s.title || 'بدون عنوان',
                bullets: Array.isArray(s.bullets) ? s.bullets : [s.content || ''],
                isHidden: false
            }));

            return { success: true, data: { slides } };

        } catch (e) {
            console.error("JSON Parse Error:", e);
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

        const result = await callOpenRouter(
            user,
            { systemPrompt: system, maxTokens: 3500, temperature: 0.7, timeoutMs: 45000, responseFormat: { type: "json_object" } }
        );

        if (!result.success) {
             await rollback();
             return { success: false, error: "Failed to generate canvas" };
        }

        try {
            const content = result.content!.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(content);
            if (parsed && typeof parsed === 'object') {
                delete parsed.reasoning;
            }
            return { success: true, data: parsed };
        } catch (e) {
            console.error("JSON Parse Error:", e);
            await rollback();
            return { success: false, error: "Invalid AI response format" };
        }

    } catch (error) {
        console.error("generateSmartCanvasAction error:", error);
        await rollback();
        return { success: false, error: "Failed to generate canvas" };
    }
}
