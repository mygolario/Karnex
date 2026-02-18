"use server";

import { callOpenRouter, parseJsonFromAI, TEXT_MODELS } from "@/lib/openrouter";
import { checkAILimit } from "@/lib/ai-limit-middleware";

// === Shared Types ===
interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  isLimitError?: boolean;
}

// === Suggest Audience ===

export async function suggestAudienceAction(productIdea: string): Promise<ActionResponse<{ audiences: string[], revenueModels: string[] }>> {
  try {
    const { errorResponse } = await checkAILimit();
    if (errorResponse) return { success: false, error: "AI_LIMIT_REACHED", isLimitError: true };

    if (!productIdea || productIdea.trim().length < 3) {
      return { success: true, data: { audiences: [], revenueModels: [] } };
    }

    const systemPrompt = `تو مشاور کسب‌وکار هستی.
قانون: فقط فارسی پاسخ بده.
۴ مخاطب هدف و ۳ مدل درآمدی پیشنهاد کن.
فقط JSON خروجی بده:
{"audiences": ["مخاطب۱", "مخاطب۲", "مخاطب۳", "مخاطب۴"], "revenueModels": ["مدل۱", "مدل۲", "مدل۳"]}`;

    const result = await callOpenRouter(
      `ایده: ${productIdea}`,
      { systemPrompt, maxTokens: 200, temperature: 0.5, timeoutMs: 15000 }
    );

    if (!result.success) {
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
    return { success: false, error: "Failed to suggest audience" };
  }
}

// === Suggest Project Name ===

export async function suggestProjectNameAction(idea: string): Promise<ActionResponse<{ names: string[] }>> {
  try {
    const { errorResponse } = await checkAILimit();
    if (errorResponse) return { success: false, error: "AI_LIMIT_REACHED", isLimitError: true };

    if (!idea) return { success: true, data: { names: [] } };

    const systemPrompt = `تو متخصص برندسازی ایرانی هستی.
قانون: فقط فارسی پاسخ بده.
۶ اسم خلاقانه فارسی برای این کسب‌وکار پیشنهاد کن.
فقط JSON آرایه خروجی بده:
["نام ۱", "نام ۲", "نام ۳", "نام ۴", "نام ۵", "نام ۶"]`;

    const result = await callOpenRouter(
      `ایده: ${idea}`,
      { systemPrompt, maxTokens: 200, temperature: 0.7, timeoutMs: 15000 }
    );

    if (!result.success) {
       return { success: true, data: { names: generateFallbackNames(idea) } };
    }

    try {
      let content = result.content!;
      content = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const names = JSON.parse(content);

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
    
    return { success: true, data: { names: generateFallbackNames(idea) } };

  } catch (error) {
    console.error("suggestProjectNameAction error:", error);
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
  try {
    const { errorResponse } = await checkAILimit();
    if (errorResponse) return { success: false, error: "AI_LIMIT_REACHED", isLimitError: true };

    if (!taskName) return { success: false, error: 'Task name required' };

    const systemPrompt = `تو مشاور کسب‌وکار هستی.
قانون: فقط فارسی پاسخ بده.
این کار را به ۳ گام کوچک تقسیم کن.
فقط JSON خروجی بده:
{"subTasks": ["گام ۱", "گام ۲", "گام ۳"]}`;

    const result = await callOpenRouter(
      `کار: "${taskName}" - به ۳ گام فارسی تقسیم کن`,
      { systemPrompt, maxTokens: 200, temperature: 0.5, timeoutMs: 20000 }
    );

    const fallback = [
        `تحقیق درباره ${taskName}`,
        `شروع اجرای ${taskName}`,
        `بررسی نتیجه`
    ];

    if (!result.success) {
      return { success: true, data: { subTasks: fallback } };
    }

    try {
      const parsed = parseJsonFromAI(result.content!);
      return { success: true, data: { subTasks: parsed.subTasks || [] } };
    } catch {
      return { success: true, data: { subTasks: fallback } };
    }

  } catch (error) {
    console.error("breakTaskAction error:", error);
    return { success: false, error: "Failed to break task" };
  }
}

// === Analyze Competitors ===

export async function analyzeCompetitorsAction(data: { projectName: string, projectIdea: string, audience: string }): Promise<ActionResponse<any>> {
    try {
        const { errorResponse } = await checkAILimit();
        if (errorResponse) return { success: false, error: "AI_LIMIT_REACHED", isLimitError: true };

        if (!process.env.OPENROUTER_API_KEY) {
            return { success: true, data: getMockCompetitors() };
        }

        const prompt = `
        You are an Iranian market research expert. Analyze competitors for this startup idea:
        
        Project: ${data.projectName}
        Idea: ${data.projectIdea}
        Target Audience: ${data.audience}
    
        Find 5 real competitors (3 Iranian + 2 international). For each:
        - name: company/product name
        - channel: main platform (وب‌سایت, اینستاگرام, اپ, etc.)
        - strength: one key strength in Persian
        - weakness: one key weakness in Persian
        - isIranian: boolean
    
        Also generate a SWOT analysis specifically for this new startup entering this market:
        - strengths: 3 items (what advantages they have as a newcomer)
        - weaknesses: 3 items (what challenges they face)
        - opportunities: 3 items (market opportunities)
        - threats: 3 items (potential threats)
    
        All text must be in Persian (فارسی).
    
        Return ONLY valid JSON:
        {
          "competitors": [...],
          "swot": {
            "strengths": [],
            "weaknesses": [],
            "opportunities": [],
            "threats": []
          }
        }
        `;

        const models = TEXT_MODELS;
        let response;
        
        for (const model of models) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 45000);

                response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://karnex.ir",
                        "X-Title": "Karnex"
                    },
                    body: JSON.stringify({
                        model,
                        messages: [
                            { role: "system", content: "You are a market research analyst. Always respond with valid JSON only." },
                            { role: "user", content: prompt }
                        ],
                        temperature: 0.7,
                        response_format: { type: "json_object" }
                    }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (response.ok) break;
            } catch (e: any) {
                console.warn(`Model ${model} error:`, e.message);
            }
        }

        if (!response?.ok) {
            return { success: true, data: getMockCompetitors() };
        }

        const responseData = await response.json();
        const content = responseData.choices?.[0]?.message?.content || "{}";

        try {
            const parsed = JSON.parse(content);
            return { success: true, data: parsed };
        } catch {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return { success: true, data: JSON.parse(jsonMatch[0]) };
            }
            return { success: true, data: getMockCompetitors() };
        }

    } catch (error) {
        console.error("analyzeCompetitorsAction error:", error);
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
    try {
        const { errorResponse } = await checkAILimit();
        if (errorResponse) return { success: false, error: "AI_LIMIT_REACHED", isLimitError: true };

        const { idea, wizardAnswers } = data;
        const systemPrompt = `تو یک مشاور استارتاپ حرفه‌ای و متخصص جذب سرمایه هستی.
        قانون: فقط فارسی پاسخ بده.
        برای ایده استارتاپی زیر یک پیچ‌دک (Pitch Deck) کامل و حرفه‌ای ۱۰ اسلایدی بنویس.
        
        ${wizardAnswers ? `اطلاعات تکمیلی:
        - تگ‌لاین: ${wizardAnswers.tagline}
        - مشکل: ${wizardAnswers.problem}
        - راهکار: ${wizardAnswers.solution}
        - بازار هدف: ${wizardAnswers.market}
        - مدل درآمدی: ${wizardAnswers.revenue}
        - تیم: ${wizardAnswers.team}` : ''}

        خروجی باید دقیقاً یک آرایه JSON از اسلایدها باشد با ساختار زیر:
        [
            {
                "id": "unique_id",
                "type": "generic", 
                "title": "عنوان اسلاید",
                "bullets": ["نکته ۱", "نکته ۲", "نکته ۳"]
            }
        ]

        اسلایدهای مورد نیاز:
        1. عنوان (Title)
        2. مشکل (Problem)
        3. راهکار (Solution)
        4. چرا الان؟ (Why Now)
        5. اندازه بازار (Market Size)
        6. محصول (Product)
        7. مدل درآمدی (Business Model)
        8. رقبا (Competition)
        9. تیم (Team)
        10. درخواست سرمایه (Ask)

        تیترها جذاب و کوتاه باشند. بولت‌پوینت‌ها عمیق و قانع‌کننده باشند.`;

        const result = await callOpenRouter(
            `ایده: ${idea}`,
            { systemPrompt, maxTokens: 2000, temperature: 0.7, timeoutMs: 40000 }
        );

        if (!result.success) {
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
             return { success: false, error: "Invalid AI response format" };
        }

    } catch (error) {
        console.error("generatePitchDeckAction error:", error);
        return { success: false, error: "Failed to generate deck" };
    }
}

// === Generate Smart Canvas ===

export async function generateSmartCanvasAction(data: { idea: string, answers: Record<string, string>, type: 'lean' | 'brand' }): Promise<ActionResponse<Record<string, string[]>>> {
    try {
        const { errorResponse } = await checkAILimit();
        if (errorResponse) return { success: false, error: "AI_LIMIT_REACHED", isLimitError: true };

        const { idea, answers, type } = data;
        
        const isBrand = type === 'brand';
        const sectionKeys = isBrand 
            ? ['identity', 'promise', 'audience', 'contentStrategy', 'channels', 'monetization', 'resources', 'collaborators', 'investment']
            : ['customerSegments', 'valueProposition', 'channels', 'customerRelations', 'revenueStream', 'keyResources', 'keyActivities', 'keyPartners', 'costStructure'];

        const systemPrompt = `تو مشاور ارشد کسب‌وکار و استراتژیست ${isBrand ? 'برند شخصی' : 'مدل کسب‌وکارهای نوپا'} هستی.
        قانون: فقط فارسی پاسخ بده.
        وظایف:
        ۱. ورودی‌های کاربر برای هر بخش بوم را تحلیل کن.
        ۲. برای هر بخش، دقیقاً ۲ کارت (Card) مختصر، مفید و حرفه‌ای پیشنهاد بده.
        ۳. این کارت‌ها باید بر اساس ایده کلی (${idea}) و ورودی خاص کاربر برای آن بخش باشند.

        ورودی‌های کاربر:
        ${Object.entries(answers).map(([key, val]) => `- ${key}: ${val}`).join('\n')}

        خروجی باید دقیقاً یک آبجکت JSON باشد که کلیدهای آن نام بخش‌ها و مقادیر آن آرایه‌ای از ۲ رشته متنی باشد:
        {
            "${sectionKeys[0]}": ["پیشنهاد ۱", "پیشنهاد ۲"],
            "${sectionKeys[1]}": ["...", "..."],
            ...
        }`;

        const result = await callOpenRouter(
            `ایده اصلی: ${idea}\nلطفاً بوم را تکمیل کن.`,
            { systemPrompt, maxTokens: 2500, temperature: 0.7, timeoutMs: 45000 }
        );

        if (!result.success) {
             return { success: false, error: "Failed to generate canvas" };
        }

        try {
            const content = result.content!.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(content);
            return { success: true, data: parsed };
        } catch (e) {
            console.error("JSON Parse Error:", e);
             return { success: false, error: "Invalid AI response format" };
        }

    } catch (error) {
        console.error("generateSmartCanvasAction error:", error);
        return { success: false, error: "Failed to generate canvas" };
    }
}
