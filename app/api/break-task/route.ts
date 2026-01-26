import { NextResponse } from 'next/server';
import { callOpenRouter, parseJsonFromAI } from '@/lib/openrouter';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { taskName, projectContext } = await req.json();

    if (!taskName) {
      return NextResponse.json({ error: 'Task name required' }, { status: 400 });
    }

    const systemPrompt = `تو مشاور کسب‌وکار هستی.

قانون: فقط فارسی پاسخ بده.

این کار را به ۳ گام کوچک تقسیم کن.
فقط JSON خروجی بده:
{"subTasks": ["گام ۱", "گام ۲", "گام ۳"]}`;

    const result = await callOpenRouter(
      `کار: "${taskName}" - به ۳ گام فارسی تقسیم کن`,
      { systemPrompt, maxTokens: 200, temperature: 0.5, timeoutMs: 20000 }
    );

    if (!result.success) {
      return NextResponse.json({
        subTasks: [
          `تحقیق درباره ${taskName}`,
          `شروع اجرای ${taskName}`,
          `بررسی نتیجه`
        ]
      });
    }

    try {
      const parsed = parseJsonFromAI(result.content!);
      return NextResponse.json({ subTasks: parsed.subTasks || [] });
    } catch {
      return NextResponse.json({
        subTasks: [
          `تحقیق درباره ${taskName}`,
          `شروع اجرای ${taskName}`,
          `بررسی نتیجه`
        ]
      });
    }

  } catch (error) {
    console.error("Break task error:", error);
    return NextResponse.json({
      subTasks: ["قدم اول", "اجرا", "بررسی"]
    });
  }
}
