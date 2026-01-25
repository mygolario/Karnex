import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query, industry, region } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Use AI to generate realistic competitor data based on the query
    const prompt = `
      کاربر یک استارتاپ در حوزه "${query}" در صنعت "${industry || 'عمومی'}" در منطقه "${region || 'ایران'}" دارد.
      
      ۳ رقیب واقعی و شناخته‌شده ایرانی در این حوزه را معرفی کن.
      
      برای هر رقیب این اطلاعات را بده:
      - name: نام شرکت یا برند (واقعی)
      - website: آدرس وب‌سایت (اگر ندارد، داخل اینستاگرام یا یک URL ساختگی منطقی)
      - strength: نقطه قوت اصلی (یک جمله کوتاه)
      - weakness: نقطه ضعف یا جای خالی که می‌تواند فرصت باشد (یک جمله کوتاه)
      - channel: کانال اصلی فعالیت (اینستاگرام، وبسایت، اپلیکیشن، فروشگاه فیزیکی)
      - marketShare: تخمین سهم بازار (high, medium, low)
      
      فقط JSON خالص برگردان، بدون markdown یا توضیح اضافه.
      فرمت دقیق:
      [
        {"name": "...", "website": "...", "strength": "...", "weakness": "...", "channel": "...", "marketShare": "..."},
        ...
      ]
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://karnex.ir",
        "X-Title": "Karnex Competitor Search"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: "تو یک متخصص تحلیل بازار ایران هستی. فقط JSON خالص برگردان." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*?\]/);
    const competitors = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ 
      competitors,
      source: "ai_generated",
      query,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Competitor search error:", error);
    
    // Fallback mock data
    return NextResponse.json({
      competitors: [
        { name: "رقیب نمونه ۱", website: "https://example.com", strength: "برند شناخته‌شده", weakness: "قیمت بالا", channel: "وبسایت", marketShare: "high" },
        { name: "رقیب نمونه ۲", website: "https://example.com", strength: "تنوع محصول", weakness: "خدمات پس از فروش ضعیف", channel: "اینستاگرام", marketShare: "medium" },
        { name: "رقیب نمونه ۳", website: "https://example.com", strength: "قیمت رقابتی", weakness: "کیفیت متوسط", channel: "اپلیکیشن", marketShare: "low" }
      ],
      source: "fallback",
      error: error.message
    });
  }
}
