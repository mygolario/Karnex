import { NextResponse } from 'next/server';
import { callOpenRouter, parseJsonFromAI } from '@/lib/openrouter';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { productIdea } = await req.json();

    if (!productIdea || productIdea.trim().length < 3) {
      return NextResponse.json({ suggestions: [] });
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
      return NextResponse.json({
        audiences: ["جوانان", "خانواده‌ها", "متخصصان", "کسب‌وکارها"],
        revenueModels: ["فروش مستقیم", "اشتراکی", "فریمیوم"]
      });
    }

    try {
      const parsed = parseJsonFromAI(result.content!);
      return NextResponse.json({
        audiences: parsed.audiences || [],
        revenueModels: parsed.revenueModels || []
      });
    } catch {
      return NextResponse.json({
        audiences: ["جوانان", "خانواده‌ها", "متخصصان", "کسب‌وکارها"],
        revenueModels: ["فروش مستقیم", "اشتراکی", "فریمیوم"]
      });
    }

  } catch (error) {
    console.error("Suggestion API error:", error);
    return NextResponse.json({
      audiences: ["جوانان", "خانواده‌ها", "متخصصان", "کسب‌وکارها"],
      revenueModels: ["فروش مستقیم", "اشتراکی", "فریمیوم"]
    });
  }
}
