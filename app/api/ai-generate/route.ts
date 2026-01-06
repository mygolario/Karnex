import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Using only Google Gemini models from OpenRouter - updated Jan 2026
const TEXT_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "google/gemini-2.0-flash-001",
  "google/gemini-pro-1.5",
  "google/gemini-pro",
];

// Canvas generation prompt template
const CANVAS_GENERATION_PROMPT = `تو یک متخصص مدل کسب‌وکار هستی. بر اساس ایده کسب‌وکار زیر، یک بوم مدل کسب‌وکار (Business Model Canvas) کامل ۹ بخشی به فارسی بنویس.

ایده کسب‌وکار: {businessIdea}
نام پروژه: {projectName}

لطفاً خروجی را دقیقاً به این فرمت JSON بده (بدون هیچ توضیح اضافی):
{{
  "keyPartners": "• شریک ۱\\n• شریک ۲\\n• شریک ۳",
  "keyActivities": "• فعالیت ۱\\n• فعالیت ۲\\n• فعالیت ۳",
  "keyResources": "• منبع ۱\\n• منبع ۲\\n• منبع ۳",
  "uniqueValue": "• ارزش ۱\\n• ارزش ۲\\n• ارزش ۳",
  "problem": "• مشکل ۱\\n• مشکل ۲\\n• مشکل ۳",
  "solution": "• راه‌حل ۱\\n• راه‌حل ۲\\n• راه‌حل ۳",
  "customerSegments": "• گروه مشتری ۱\\n• گروه مشتری ۲\\n• گروه مشتری ۳",
  "costStructure": "• هزینه ۱\\n• هزینه ۲\\n• هزینه ۳",
  "revenueStream": "• درآمد ۱\\n• درآمد ۲\\n• درآمد ۳"
}}

برای هر بخش حداقل ۳ آیتم مرتبط و خلاقانه بنویس. همه آیتم‌ها باید به فارسی و مرتبط با کسب‌وکار باشند.`;

async function callAI(prompt: string, systemPrompt?: string, maxTokens: number = 2000) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API Key missing');
  }

  let lastError = null;

  for (const model of TEXT_MODELS) {
    console.log(`DEBUG: Attempting AI text with model: ${model}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const messages = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Karnex AI"
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: maxTokens,
          temperature: 0.7
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Model ${model} failed. Status: ${response.status}. Msg: ${errorText}`);
        lastError = `Status ${response.status} on ${model}`;
        continue;
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0]?.message?.content) {
        console.log(`SUCCESS: Text generated using ${model}`);
        return {
          success: true,
          model: model,
          content: data.choices[0].message.content
        };
      } else {
        console.warn(`Model ${model} returned empty response.`);
        continue;
      }

    } catch (networkError: any) {
      if (networkError.name === 'AbortError') {
        console.warn(`Model ${model} timed out (45s limit).`);
        lastError = "Timeout (45s)";
      } else {
        console.error(`Network exception for model ${model}:`, networkError.message);
        lastError = networkError.message;
      }
    }
  }

  throw new Error(`All models failed. Last error: ${lastError}`);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, prompt, systemPrompt, maxTokens = 2000, businessIdea, projectName } = body;

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OpenRouter API Key missing' }, { status: 500 });
    }

    // Handle full canvas generation
    if (action === 'generate-full-canvas') {
      if (!businessIdea) {
        return NextResponse.json({ error: 'Business idea is required' }, { status: 400 });
      }

      const canvasPrompt = CANVAS_GENERATION_PROMPT
        .replace('{businessIdea}', businessIdea)
        .replace('{projectName}', projectName || 'پروژه جدید');

      try {
        const result = await callAI(canvasPrompt, 'تو یک متخصص کسب‌وکار و استارتاپ هستی که به فارسی پاسخ می‌دهی. فقط JSON خروجی بده.', 3000);
        
        // Parse the JSON from the response
        let canvas;
        try {
          // Extract JSON from the response (handle markdown code blocks)
          let jsonStr = result.content;
          
          // Remove markdown code blocks if present
          const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) {
            jsonStr = jsonMatch[1];
          }
          
          // Clean up the string
          jsonStr = jsonStr.trim();
          
          canvas = JSON.parse(jsonStr);
        } catch (parseError) {
          console.error('Failed to parse canvas JSON:', parseError);
          console.log('Raw response:', result.content);
          
          // Return raw content as fallback
          return NextResponse.json({
            success: false,
            error: 'Failed to parse canvas response',
            rawContent: result.content
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          model: result.model,
          canvas: canvas
        });

      } catch (error: any) {
        console.error('Canvas generation error:', error);
        return NextResponse.json({ 
          error: 'Canvas generation failed', 
          details: error.message 
        }, { status: 503 });
      }
    }

    // Handle regular text generation (legacy)
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    try {
      const result = await callAI(prompt, systemPrompt, maxTokens);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error("ALL TEXT MODELS FAILED:", error.message);
      return NextResponse.json({ 
        error: 'Text generation failed on all models', 
        lastError: error.message 
      }, { status: 503 });
    }

  } catch (error) {
    console.error("AI Text Generation Critical Error:", error);
    return NextResponse.json({ error: 'Failed to generate text' }, { status: 500 });
  }
}
