import { NextResponse } from 'next/server';

export const maxDuration = 60;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ProjectContext {
  projectName?: string;
  tagline?: string;
  overview?: string;
  audience?: string;
  budget?: string;
  leanCanvas?: {
    problem?: string;
    solution?: string;
    uniqueValue?: string;
    revenueStream?: string;
    customerSegments?: string;
    keyActivities?: string;
    keyResources?: string;
    keyPartners?: string;
    costStructure?: string;
  };
  brandKit?: {
    primaryColorHex?: string;
    secondaryColorHex?: string;
    colorPsychology?: string;
    suggestedFont?: string;
  };
  roadmap?: { phase: string; steps: string[] }[];
  completedSteps?: string[];
  marketingStrategy?: string[];
  competitors?: { name: string; strength: string; weakness: string }[];
  legalAdvice?: {
    requirements?: { title: string; description: string }[];
    permits?: string[];
    tips?: string[];
  };
}

export async function POST(req: Request) {
  try {
    const { message, projectContext, conversationHistory } = await req.json() as {
      message: string;
      projectContext: ProjectContext;
      conversationHistory?: Message[];
    };

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
    }

    // Calculate project progress
    const totalSteps = projectContext?.roadmap?.reduce((acc, p) => acc + p.steps.length, 0) || 0;
    const completedCount = projectContext?.completedSteps?.length || 0;
    const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

    // Build comprehensive context from all project data
    const buildProjectSummary = () => {
      const parts: string[] = [];
      
      if (projectContext?.projectName) {
        parts.push(`📌 نام پروژه: ${projectContext.projectName}`);
      }
      if (projectContext?.tagline) {
        parts.push(`💬 شعار: ${projectContext.tagline}`);
      }
      if (projectContext?.overview) {
        parts.push(`📋 شرح پروژه: ${projectContext.overview}`);
      }
      if (projectContext?.audience) {
        parts.push(`🎯 مخاطب هدف: ${projectContext.audience}`);
      }
      if (projectContext?.budget) {
        parts.push(`💰 بودجه: ${projectContext.budget}`);
      }
      
      // Canvas data
      if (projectContext?.leanCanvas) {
        const canvas = projectContext.leanCanvas;
        parts.push(`\n--- بوم کسب‌وکار ---`);
        if (canvas.problem) parts.push(`مشکل: ${canvas.problem}`);
        if (canvas.solution) parts.push(`راه‌حل: ${canvas.solution}`);
        if (canvas.uniqueValue) parts.push(`ارزش پیشنهادی: ${canvas.uniqueValue}`);
        if (canvas.customerSegments) parts.push(`بخش مشتریان: ${canvas.customerSegments}`);
        if (canvas.revenueStream) parts.push(`جریان درآمد: ${canvas.revenueStream}`);
        if (canvas.keyActivities) parts.push(`فعالیت‌های کلیدی: ${canvas.keyActivities}`);
        if (canvas.keyResources) parts.push(`منابع کلیدی: ${canvas.keyResources}`);
        if (canvas.keyPartners) parts.push(`شرکای کلیدی: ${canvas.keyPartners}`);
        if (canvas.costStructure) parts.push(`ساختار هزینه: ${canvas.costStructure}`);
      }

      // Brand Kit
      if (projectContext?.brandKit) {
        const brand = projectContext.brandKit;
        parts.push(`\n--- هویت برند ---`);
        if (brand.primaryColorHex) parts.push(`رنگ اصلی: ${brand.primaryColorHex}`);
        if (brand.secondaryColorHex) parts.push(`رنگ ثانویه: ${brand.secondaryColorHex}`);
        if (brand.suggestedFont) parts.push(`فونت پیشنهادی: ${brand.suggestedFont}`);
        if (brand.colorPsychology) parts.push(`روانشناسی رنگ: ${brand.colorPsychology}`);
      }

      // Roadmap Progress
      if (projectContext?.roadmap && projectContext.roadmap.length > 0) {
        parts.push(`\n--- نقشه راه ---`);
        parts.push(`پیشرفت: ${progressPercent}% (${completedCount} از ${totalSteps} مرحله)`);
        
        // Current phase
        const currentPhase = projectContext.roadmap.find(p => 
          p.steps.some(s => !projectContext.completedSteps?.includes(s))
        );
        if (currentPhase) {
          parts.push(`فاز فعلی: ${currentPhase.phase}`);
        }
      }

      // Marketing
      if (projectContext?.marketingStrategy && projectContext.marketingStrategy.length > 0) {
        parts.push(`\n--- استراتژی بازاریابی ---`);
        parts.push(projectContext.marketingStrategy.slice(0, 5).join(' | '));
      }

      // Competitors
      if (projectContext?.competitors && projectContext.competitors.length > 0) {
        parts.push(`\n--- رقبا ---`);
        projectContext.competitors.slice(0, 3).forEach(c => {
          parts.push(`• ${c.name}: قوت(${c.strength}) - ضعف(${c.weakness})`);
        });
      }

      // Legal
      if (projectContext?.legalAdvice) {
        const legal = projectContext.legalAdvice;
        if (legal.permits && legal.permits.length > 0) {
          parts.push(`\n--- مجوزهای مورد نیاز ---`);
          parts.push(legal.permits.slice(0, 3).join('، '));
        }
      }

      return parts.join('\n');
    };

    const projectSummary = buildProjectSummary();

    // Enhanced Business Advisor System Prompt
    const systemPrompt = `
تو "دستیار کارنکس" هستی - یک مشاور کسب‌وکار حرفه‌ای و هوشمند که به کارآفرینان ایرانی کمک می‌کنی استارتاپ‌های موفق بسازند.

🎯 نقش تو:
- مشاور استراتژیک کسب‌وکار
- راهنمای رشد و توسعه
- تحلیلگر بازار و رقبا
- مربی کارآفرینی

📊 اطلاعات کامل پروژه کاربر:
${projectSummary}

📋 دستورالعمل‌های مهم:
1. همیشه بر اساس داده‌های واقعی پروژه کاربر پاسخ بده - نه عمومی
2. پیشنهادهای عملی و قابل اجرا بده با قدم‌های مشخص
3. از اختصارات و لحن دوستانه اما حرفه‌ای استفاده کن
4. اگر اطلاعات کافی نداری، سوالات هدفمند بپرس
5. در پایان هر پاسخ، ۲-۳ سوال پیگیری پیشنهاد بده (با فرمت: ---FOLLOWUPS---)
6. همه چیز را به فارسی بنویس
7. پاسخ‌ها را ساختارمند و خوانا بنویس (از ایموجی و بولت پوینت استفاده کن)
8. برای مسائل پیچیده، موضوع را به بخش‌های کوچکتر تقسیم کن

💡 تخصص‌های اصلی:
- استراتژی رشد استارتاپ
- تحلیل مدل کسب‌وکار
- بازاریابی دیجیتال
- جذب سرمایه و بودجه‌بندی
- مسائل حقوقی کسب‌وکار در ایران
- تحلیل رقبا و بازار

فرمت پیشنهادات پیگیری:
---FOLLOWUPS---
- سوال ۱
- سوال ۲
- سوال ۳
`;

    // Build conversation messages
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      // Limit to last 10 messages to avoid token limits
      const recentHistory = conversationHistory.slice(-10);
      recentHistory.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
      });
    }

    // Add current user message
    messages.push({ role: 'user', content: message });

    // Call OpenRouter with multiple model fallbacks
    let response;
    const models = [
      "google/gemini-2.0-flash-exp:free",
      "google/gemini-2.0-flash-001",
      "google/gemini-pro-1.5",
      "google/gemini-pro",
    ];

    for (const model of models) {
      try {
        console.log(`Advisor chat attempting: ${model}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://karnex.ir",
            "X-Title": "Karnex Assistant"
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 2048,
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) break;
        console.warn(`Advisor model ${model} failed: ${response.status}`);
      } catch (e: any) {
        console.warn(`Advisor model ${model} error:`, e.name || e.message);
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json({ 
        reply: "متاسفانه در حال حاضر امکان پاسخگویی نیست. لطفا دقایقی دیگر تلاش کنید.",
        followUps: ["دوباره تلاش کن", "به صفحه اصلی برگرد"]
      });
    }

    const data = await response.json();
    let fullReply = data.choices?.[0]?.message?.content || "متاسفانه مشکلی پیش آمد.";

    // Parse follow-up questions
    let reply = fullReply;
    let followUps: string[] = [];

    if (fullReply.includes("---FOLLOWUPS---")) {
      const parts = fullReply.split("---FOLLOWUPS---");
      reply = parts[0].trim();
      
      if (parts[1]) {
        followUps = parts[1]
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.startsWith("-") || line.startsWith("•"))
          .map((line: string) => line.replace(/^[-•]\s*/, ""))
          .filter((q: string) => q.length > 0)
          .slice(0, 3);
      }
    }

    // Fallback follow-ups if none generated
    if (followUps.length === 0) {
      followUps = [
        "بیشتر توضیح بده",
        "قدم بعدی چیه؟",
        "یه مثال عملی بزن"
      ];
    }

    return NextResponse.json({ 
      reply, 
      followUps,
      tokensUsed: data.usage?.total_tokens || 0
    });

  } catch (error) {
    console.error("Advisor Chat Error:", error);
    return NextResponse.json({ error: 'Advisor chat failed' }, { status: 500 });
  }
}
