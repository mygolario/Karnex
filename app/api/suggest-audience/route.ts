import { NextResponse } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { productIdea } = await req.json();

    if (!productIdea || productIdea.trim().length < 3) {
      return NextResponse.json({ suggestions: [] });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // Return fallback suggestions if no API key
      return NextResponse.json({
        audiences: ["جوانان", "خانواده‌ها", "متخصصان"],
        revenueModels: ["فروش مستقیم", "اشتراکی", "فریمیوم"]
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://karnex.ir",
        "X-Title": "Karnex Suggestion API"
      },
      body: JSON.stringify({
        // Using Google Gemini models only
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: `شما یک مشاور کسب‌وکار هستید. کاربر ایده محصولی را وارد می‌کند و شما باید:
1. ۴ مخاطب هدف مناسب پیشنهاد دهید (کوتاه، ۲-۳ کلمه)
2. ۳ مدل درآمدی مناسب پیشنهاد دهید

پاسخ را فقط به صورت JSON بدهید:
{"audiences": ["مخاطب۱", "مخاطب۲", "مخاطب۳", "مخاطب۴"], "revenueModels": ["مدل۱", "مدل۲", "مدل۳"]}`
          },
          {
            role: "user",
            content: `ایده محصول: ${productIdea}`
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error("AI API failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        audiences: parsed.audiences || [],
        revenueModels: parsed.revenueModels || []
      });
    }

    // Fallback
    return NextResponse.json({
      audiences: ["جوانان", "خانواده‌ها", "متخصصان", "کسب‌وکارها"],
      revenueModels: ["فروش مستقیم", "اشتراکی", "فریمیوم"]
    });

  } catch (error) {
    console.error("Suggestion API error:", error);
    return NextResponse.json({
      audiences: ["جوانان", "خانواده‌ها", "متخصصان", "کسب‌وکارها"],
      revenueModels: ["فروش مستقیم", "اشتراکی", "فریمیوم"]
    });
  }
}
