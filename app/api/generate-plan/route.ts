import { NextResponse } from 'next/server';
import { callOpenRouter, parseJsonFromAI } from '@/lib/openrouter';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Types for the new detailed roadmap
interface RoadmapStep {
  title: string;
  description: string;
  estimatedHours: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  resources?: string[];
}

interface RoadmapPhase {
  phase: string;
  weekNumber: number;
  theme: string;
  steps: RoadmapStep[];
}

export async function POST(req: Request) {
  try {
    const { idea, audience, budget, projectType } = await req.json();

<<<<<<< HEAD
    console.log("🚀 POST /api/generate-plan called");

    // Optimized 8-week roadmap system prompt for better reliability
    const systemPrompt = `تو کارنکس هستی، مشاور کسب‌وکار برای بازار ایران.
=======
    console.log("DEBUG: POST /api/generate-plan called");
    console.log("DEBUG: Project Type:", projectType);

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OpenRouter API Key missing' }, { status: 500 });
    }

    const systemPrompt = `
      You are Karnex, an expert business consultant specializing in the Iranian market.
      Your Goal: Create a highly tailored execution plan based on the user's specific business type: ${projectType}.
      
      User Context:
      - Type: ${projectType} (startup = Scalable Tech, traditional = SME/Shop, creator = Content/Brand)
      - Idea: ${idea}
      - Target Audience: ${audience}
      - Budget Constraint: ${budget}

      INSTRUCTIONS:
      1. Think deeply about the needs of a "${projectType}" business.
         - If 'traditional': Focus on location, permits, physical assets, and local marketing.
         - If 'startup': Focus on MVP, product-market fit, scalability, and investor appeal.
         - If 'creator': Focus on content strategy, personal branding, platforms, and audience growth.
      2. You MUST reply in PERSIAN (Farsi).
      3. You MUST output ONLY valid JSON.
      
      JSON STRUCTURE REQUIRED:
      {
        "projectName": "Short catchy name in Persian",
        "tagline": "A punchy slogan",
        "overview": "2 sentences describing the business",
        "leanCanvas": {
          "problem": "What pain point are they solving?",
          "solution": "How they solve it simply",
          "uniqueValue": "Why them?",
          "revenueStream": "How they make money (e.g. Subscription, Ads)"
        },
        "brandKit": {
          "primaryColorHex": "#HEXCODE",
          "secondaryColorHex": "#HEXCODE",
          "colorPsychology": "Why these colors?",
          "suggestedFont": "Vazirmatn",
          "logoConcepts": [
            { "conceptName": "Concept 1", "description": "Description 1" },
            { "conceptName": "Concept 2", "description": "Description 2" },
            { "conceptName": "Concept 3", "description": "Description 3" }
          ]
        },
        "roadmap": [
           { "phase": "Week 1: Validation", "steps": ["Step 1", "Step 2"] },
           { "phase": "Week 2: MVP Build", "steps": ["Step 1", "Step 2"] },
           { "phase": "Week 3: Launch", "steps": ["Step 1", "Step 2"] }
        ],
        "marketingStrategy": [
           "Specific tactic 1",
           "Specific tactic 2",
           "Specific tactic 3",
           "Specific tactic 4"
        ],
        "competitors": [
          { 
            "name": "Name of ACTUAL competitor company in Iran (e.g. Digikala, Snapp, Torob, Basalam, Tap30)", 
            "strength": "Their main advantage", 
            "weakness": "Their main weakness you can exploit", 
            "channel": "Where they sell (Website/App/Instagram/Physical)" 
          },
          { 
            "name": "Another REAL Iranian competitor company name", 
            "strength": "Their main advantage", 
            "weakness": "Their main weakness", 
            "channel": "Their main channel" 
          },
          { 
            "name": "Third REAL competitor (can be international if relevant)", 
            "strength": "Their advantage", 
            "weakness": "Their weakness", 
            "channel": "Their channel" 
          }
        ]
      }
    `;

    // --- MOCK PLAN FALLBACK ---
    const mockPlan = {
      projectName: "عسل ارگانیک کوهستان",
      tagline: "طعم واقعی طبیعت در سفره شما",
      overview: "تولید و عرضه مستقیم عسل ارگانیک از کندوهای کوهستانی بدون واسطه، با تمرکز بر کیفیت و سلامت.",
      leanCanvas: {
        problem: "وجود عسل‌های تقلبی و شکرک‌زده در بازار و عدم اعتماد مشتریان",
        solution: "عرضه مستقیم عسل با برگه آزمایش و ضمانت بازگشت وجه",
        uniqueValue: "تضمین اصالت کالا و شفافیت کامل در فرآیند تولید",
        revenueStream: "فروش مستقیم آنلاین و اشتراک ماهانه مصرف"
      },
      brandKit: {
        primaryColorHex: "#F59E0B",
        secondaryColorHex: "#1F2937",
        colorPsychology: "زرد برای انرژی و طبیعت، تیره برای اعتماد و سنگینی",
        suggestedFont: "Vazirmatn",
        logoConcepts: [
          { conceptName: "زنبور طلایی", description: "طرح انتزاعی از زنبور با خطوط طلایی" },
          { conceptName: "کوه و کندو", description: "ترکیب نماد کوهستان و فرم شش ضلعی" },
          { conceptName: "قطره عسل", description: "تایپوگرافی اسم برند درون یک قطره عسل" }
        ]
      },
      roadmap: [
        { phase: "هفته ۱: اعتبارسنجی", steps: ["تحقیق بازار محلی", "ساخت صفحه اینستاگرام"] },
        { phase: "هفته ۲: محصول اولیه", steps: ["بسته‌بندی نمونه‌ها", "عکاسی از محصول"] },
        { phase: "هفته ۳: فروش آزمایشی", steps: ["ارسال نمونه برای اینفلوئنسرها", "تبلیغات محلی"] }
      ],
      marketingStrategy: [
        "تولید محتوا درباره تشخیص عسل طبیعی",
        "همکاری با بلاگرهای سلامت",
        "تخفیف ویژه برای خرید اول",
        "مسابقه اینستاگرامی با جایزه"
      ],
      competitors: [
        { 
          name: "دیجی‌کالا فرش", 
          strength: "تنوع بالا و ارسال سریع", 
          weakness: "عدم تضمین اصالت محصولات محلی", 
          channel: "وبسایت/اپلیکیشن" 
        },
        { 
          name: "باسلام", 
          strength: "پشتیبانی از تولیدکنندگان محلی", 
          weakness: "قیمت‌گذاری بالاتر", 
          channel: "اپلیکیشن" 
        },
        { 
          name: "اینستاشاپ‌های عسل فروشی", 
          strength: "ارتباط مستقیم با مشتری", 
          weakness: "عدم اعتماد و تضمین کیفیت", 
          channel: "اینستاگرام" 
        }
      ]
    };

    console.log("DEBUG: Calling OpenRouter...");
>>>>>>> Karnex-Completion
    
    قانون مهم: همه محتوا فقط به فارسی باشد.
    
    ایده: ${idea}
    مخاطب: ${audience}
    بودجه: ${budget}
    
    یک طرح کسب‌وکار ۸ هفته‌ای (۲ ماهه) برای شروع سریع (Launch Plan) تولید کن.
    
    ساختار JSON:
    {
      "projectName": "نام فارسی",
      "tagline": "شعار فارسی",
      "overview": "توضیح فارسی ۲-۳ جمله",
      "leanCanvas": {
        "problem": "مشکل",
        "solution": "راه‌حل",
        "uniqueValue": "ارزش منحصربه‌فرد",
        "revenueStream": "مدل درآمد",
        "customerSegments": "مشتریان هدف",
        "keyActivities": "فعالیت‌های کلیدی",
        "keyResources": "منابع کلیدی",
        "keyPartners": "شرکای کلیدی",
        "costStructure": "ساختار هزینه"
      },
      "brandKit": {
        "primaryColorHex": "#رنگ",
        "secondaryColorHex": "#رنگ",
        "colorPsychology": "توضیح رنگ",
        "suggestedFont": "Vazirmatn",
        "logoConcepts": [{"conceptName": "نام", "description": "توضیح"}]
      },
      "roadmap": [
        {
          "phase": "هفته ۱: تحقیق",
          "weekNumber": 1,
          "theme": "تحقیق",
          "steps": [
            {
              "title": "عنوان کار",
              "description": "توضیح",
              "estimatedHours": 4,
              "priority": "high",
              "category": "تحقیق"
            }
          ]
        }
      ],
      "marketingStrategy": ["تاکتیک ۱", "تاکتیک ۲"],
      "competitors": [{"name": "نام", "strength": "قوت", "weakness": "ضعف", "channel": "کانال"}]
    }
    
    نقشه راه باید شامل ۸ هفته باشد (هفته ۱ تا ۸).
    هر هفته فقط ۳ تا ۴ کار مهم داشته باشد (برای جلوگیری از طولانی شدن).
    تمرکز روی راه‌اندازی سریع (MVP) باشد.`;

    // Simplified system prompt for reliability
    // (Prompt remains the same, just removing the huge mockPlan object)

    const result = await callOpenRouter(
      `طرح کسب‌وکار ۸ هفته‌ای JSON فارسی برای: ${idea}`,
      {
        systemPrompt,
        maxTokens: 4000,
        temperature: 0.5,
        timeoutMs: 55000,
      }
    );

    if (!result.success) {
      console.warn("AI failed", result.error);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 503 });
    }

    try {
      const structuredPlan = parseJsonFromAI(result.content!);
      console.log(`✅ 12-week plan generated using ${result.model}`);
      return NextResponse.json(structuredPlan);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

  } catch (error) {
    console.error("Generate Plan Error:", error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}
