import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { projectName, projectIdea, audience } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      // Fallback response if no API key
      return NextResponse.json({
        competitors: [
          {
            name: "رقیب نمونه ۱",
            channel: "وب‌سایت",
            strength: "برند شناخته‌شده",
            weakness: "قیمت بالا",
            isIranian: true
          },
          {
            name: "رقیب نمونه ۲",
            channel: "اینستاگرام",
            strength: "محتوای خوب",
            weakness: "پشتیبانی ضعیف",
            isIranian: true
          },
          {
            name: "Competitor Example",
            channel: "App",
            strength: "UX عالی",
            weakness: "فارسی ندارد",
            isIranian: false
          }
        ],
        swot: {
          strengths: ["ایده نوآورانه", "هزینه شروع پایین", "تیم چابک"],
          weaknesses: ["برند ناشناخته", "منابع محدود", "بدون مشتری فعلی"],
          opportunities: ["بازار رو به رشد", "شکاف در بازار", "نیاز مشتری"],
          threats: ["ورود رقبای بزرگ", "تغییر قوانین", "نوسانات اقتصادی"]
        }
      });
    }

    const prompt = `
    You are an Iranian market research expert. Analyze competitors for this startup idea:
    
    Project: ${projectName}
    Idea: ${projectIdea}
    Target Audience: ${audience}

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

    // Using only Google Gemini models from OpenRouter
    const models = [
      "google/gemini-2.0-flash-exp:free",
      "google/gemini-2.0-flash-001",
      "google/gemini-pro-1.5",
    ];

    let response;
    for (const model of models) {
      try {
        console.log(`Competitor analysis using: ${model}`);
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
      throw new Error("All models failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return NextResponse.json(JSON.parse(jsonMatch[0]));
      }
      throw new Error("Invalid JSON response");
    }

  } catch (error) {
    console.error("Competitor analysis error:", error);
    // Return fallback data
    return NextResponse.json({
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
    });
  }
}
