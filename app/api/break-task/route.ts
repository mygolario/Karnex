import { NextResponse } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { taskName, projectContext } = await req.json();

    if (!taskName) {
      return NextResponse.json({ error: 'Task name required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // Return fallback if no API key
      return NextResponse.json({
        subTasks: [
          `اول ${taskName} رو تحقیق کن`,
          `یه نمونه کوچیک از ${taskName} بساز`,
          `نتیجه‌اش رو تست کن و بهبود بده`
        ]
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://karnex.ir",
        "X-Title": "Karnex Task Breakdown"
      },
      body: JSON.stringify({
        // Using Google Gemini models only
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: `شما یک مشاور کسب‌وکار هستید. یک تسک بزرگ به شما داده می‌شود.
این تسک را به ۳ گام کوچکتر و قابل اجرا تقسیم کنید.

قوانین:
1. هر گام باید ساده و مشخص باشد
2. گام‌ها باید به ترتیب اجرا شوند
3. هر گام را با فعل شروع کنید
4. پاسخ فقط JSON باشد: {"subTasks": ["گام ۱", "گام ۲", "گام ۳"]}

زمینه پروژه: ${projectContext || 'استارتاپ'}`
          },
          {
            role: "user",
            content: `این تسک را به ۳ گام کوچکتر تقسیم کن: "${taskName}"`
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
        subTasks: parsed.subTasks || []
      });
    }

    // Fallback
    return NextResponse.json({
      subTasks: [
        `تحقیق درباره ${taskName}`,
        `شروع اجرای ${taskName}`,
        `بررسی و بهبود نتیجه`
      ]
    });

  } catch (error) {
    console.error("Break task API error:", error);
    return NextResponse.json({
      subTasks: [
        "قدم اول را مشخص کن",
        "آن را اجرا کن", 
        "نتیجه را بررسی کن"
      ]
    });
  }
}
