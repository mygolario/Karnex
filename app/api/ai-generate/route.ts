import { NextResponse } from 'next/server';
import { callOpenRouter, parseJsonFromAI } from '@/lib/openrouter';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Canvas generation prompt template - explicit Persian
const CANVAS_GENERATION_PROMPT = `ایده: {businessIdea}
نام: {projectName}

یک بوم کسب‌وکار ۹ بخشی به فارسی بنویس.
فقط JSON خروجی بده، بدون توضیح:

{{
  "keyPartners": "• شریک ۱\\n• شریک ۲\\n• شریک ۳",
  "keyActivities": "• فعالیت ۱\\n• فعالیت ۲\\n• فعالیت ۳",
  "keyResources": "• منبع ۱\\n• منبع ۲\\n• منبع ۳",
  "uniqueValue": "• ارزش ۱\\n• ارزش ۲\\n• ارزش ۳",
  "problem": "• مشکل ۱\\n• مشکل ۲\\n• مشکل ۳",
  "solution": "• راه‌حل ۱\\n• راه‌حل ۲\\n• راه‌حل ۳",
  "customerSegments": "• مشتری ۱\\n• مشتری ۲\\n• مشتری ۳",
  "costStructure": "• هزینه ۱\\n• هزینه ۲\\n• هزینه ۳",
  "revenueStream": "• درآمد ۱\\n• درآمد ۲\\n• درآمد ۳"
}}`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, prompt, systemPrompt, maxTokens = 2000, businessIdea, projectName } = body;

    // Handle full canvas generation
    if (action === 'generate-full-canvas') {
      if (!businessIdea) {
        return NextResponse.json({ error: 'Business idea is required' }, { status: 400 });
      }

      const canvasPrompt = CANVAS_GENERATION_PROMPT
        .replace('{businessIdea}', businessIdea)
        .replace('{projectName}', projectName || 'پروژه جدید');

      const result = await callOpenRouter(canvasPrompt, {
        systemPrompt: 'تو متخصص کسب‌وکار هستی. فقط JSON فارسی خروجی بده.',
        maxTokens: 2000,
        temperature: 0.5,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 503 });
      }

      try {
        const canvas = parseJsonFromAI(result.content!);
        return NextResponse.json({
          success: true,
          model: result.model,
          canvas,
        });
      } catch (parseError) {
        console.error('Failed to parse canvas JSON:', parseError);
        return NextResponse.json({
          success: false,
          error: 'Failed to parse canvas response',
          rawContent: result.content,
        }, { status: 500 });
      }
    }

    // Handle regular text generation
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await callOpenRouter(`${prompt}\n\n(پاسخ فارسی بده)`, {
      systemPrompt: systemPrompt || 'فقط به فارسی پاسخ بده.',
      maxTokens,
      temperature: 0.5,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      model: result.model,
      content: result.content,
    });

  } catch (error) {
    console.error("AI Generate Error:", error);
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
  }
}
