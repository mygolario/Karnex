import { NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { message, planContext, generateFollowUps } = await req.json();

    // Simple, explicit Persian-only system prompt
    const systemPrompt = `تو دستیار کارنکس هستی.

قانون مهم: همه پاسخ‌ها فقط به زبان فارسی باشد.

پروژه: ${planContext?.projectName || 'نامشخص'}
ایده: ${planContext?.overview || 'نامشخص'}

وظیفه: پاسخ کوتاه و مفید به سوال کاربر بده.
${generateFollowUps ? '\nدر آخر ۳ سوال پیگیری بنویس با فرمت:\n---FOLLOWUPS---\n- سوال ۱\n- سوال ۲\n- سوال ۳' : ''}`;

    const result = await callOpenRouter(`${message}\n\n(پاسخ فارسی بده)`, {
      systemPrompt,
      maxTokens: 800,
      temperature: 0.5,
    });

    if (!result.success) {
      return NextResponse.json({
        reply: "متاسفانه سرویس در دسترس نیست. لطفا دقایقی دیگر تلاش کنید.",
        followUps: []
      });
    }

    let fullReply = result.content || "متاسفانه مشکلی پیش آمد.";

    // Parse follow-up questions
    let reply = fullReply;
    let followUps: string[] = [];

    if (generateFollowUps && fullReply.includes("---FOLLOWUPS---")) {
      const parts = fullReply.split("---FOLLOWUPS---");
      reply = parts[0].trim();

      if (parts[1]) {
        followUps = parts[1]
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.startsWith("-"))
          .map((line: string) => line.replace(/^-\s*/, ""))
          .filter((q: string) => q.length > 0)
          .slice(0, 3);
      }
    }

    // Fallback follow-ups
    if (generateFollowUps && followUps.length === 0) {
      followUps = ["بیشتر توضیح بده", "یه مثال بزن", "قدم بعدی چیه؟"];
    }

    return NextResponse.json({ reply, followUps });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
