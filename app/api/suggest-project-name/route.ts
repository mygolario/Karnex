import { NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';
import { checkAILimit } from '@/lib/ai-limit-middleware';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // === AI Usage Limit Check ===
    const { errorResponse } = await checkAILimit();
    if (errorResponse) return errorResponse;

    const { idea } = await req.json();

    if (!idea) {
      return NextResponse.json({ names: [] });
    }

    const systemPrompt = `تو متخصص برندسازی ایرانی هستی.

قانون: فقط فارسی پاسخ بده.

۶ اسم خلاقانه فارسی برای این کسب‌وکار پیشنهاد کن.
فقط JSON آرایه خروجی بده:
["نام ۱", "نام ۲", "نام ۳", "نام ۴", "نام ۵", "نام ۶"]`;

    const result = await callOpenRouter(
      `ایده: ${idea}`,
      { systemPrompt, maxTokens: 200, temperature: 0.7, timeoutMs: 15000 }
    );

    if (!result.success) {
      const fallbackNames = generateFallbackNames(idea);
      return NextResponse.json({ names: fallbackNames });
    }

    try {
      let content = result.content!;
      content = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const names = JSON.parse(content);

      if (Array.isArray(names) && names.length > 0) {
        return NextResponse.json({ names: names.slice(0, 6) });
      }
    } catch {
      // Try to extract names from text
      const matches = result.content!.match(/["']([^"']+)["']/g);
      if (matches && matches.length > 0) {
        const names = matches.map((m: string) => m.replace(/["']/g, "")).slice(0, 6);
        return NextResponse.json({ names });
      }
    }

    const fallbackNames = generateFallbackNames(idea);
    return NextResponse.json({ names: fallbackNames });

  } catch (error) {
    console.error("Name suggestion error:", error);
    return NextResponse.json({ names: [] });
  }
}

function generateFallbackNames(idea: string): string[] {
  const words = idea.split(/\s+/).filter(w => w.length > 2);
  const baseWord = words[0] || "پروژه";

  const suffixes = ["پلاس", "نو", "یار", "لند", "باز", "مارکت"];

  return suffixes.map((suffix, i) =>
    i < 3 ? `${baseWord} ${suffix}` : `${baseWord}${suffix}`
  );
}
