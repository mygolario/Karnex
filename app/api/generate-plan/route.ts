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
    const { idea, audience, budget } = await req.json();

    console.log("🚀 POST /api/generate-plan called");

    // Optimized 8-week roadmap system prompt for better reliability
    const systemPrompt = `تو کارنکس هستی، مشاور کسب‌وکار برای بازار ایران.
    
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
