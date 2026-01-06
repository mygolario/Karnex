import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { message, planContext, generateFollowUps } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
    }

    // Contextual System Prompt
    const systemPrompt = `
      You are Karnex AI, a smart business consultant for the Iranian market.
      
      CONTEXT - USER'S CURRENT PROJECT:
      Project Name: ${planContext?.projectName || 'Unknown'}
      Business Idea: ${planContext?.overview || 'Unknown'}
      Target Audience: ${planContext?.audience || 'Unknown'}
      Current Budget: ${planContext?.budget || 'Unknown'}
      
      INSTRUCTIONS:
      1. Answer the user's question specifically for *their* project. Don't give generic advice.
      2. Keep answers concise (max 3-4 sentences) unless asked for more.
      3. Use a friendly, encouraging, and professional tone.
      4. Reply in PERSIAN (Farsi).
      ${generateFollowUps ? `
      5. After your answer, add a line with "---FOLLOWUPS---" and then list exactly 3 short follow-up questions the user might ask next.
      Format: Each question on its own line, starting with "- ".
      Example:
      ---FOLLOWUPS---
      - چطور این کار را شروع کنم؟
      - چقدر زمان می‌برد؟
      - هزینه‌اش چقدره؟
      ` : ''}
    `;

    // Call OpenRouter
    let response;
    // Using only Google Gemini models from OpenRouter
    const models = [
      "google/gemini-2.0-flash-exp:free",
      "google/gemini-2.0-flash-001",
      "google/gemini-pro-1.5",
      "google/gemini-pro",
    ];

    for (const model of models) {
      try {
        console.log(`Chat attempts: ${model}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 40000);

        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://karnex.ir",
            "X-Title": "Karnex"
          },
          body: JSON.stringify({
            "model": model,
            "messages": [
              { "role": "system", "content": systemPrompt },
              { "role": "user", "content": message }
            ],
            "temperature": 0.7,
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) break;
        console.warn(`Chat model ${model} failed: ${response.status}`);
      } catch (e: any) {
        console.warn(`Chat model ${model} error:`, e.name || e.message);
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json({ 
        reply: "متاسفانه سرویس هوش مصنوعی در حال حاضر پاسخگو نیست. لطفا دقایقی دیگر تلاش کنید.",
        followUps: []
      });
    }

    const data = await response.json();
    let fullReply = data.choices?.[0]?.message?.content || "متاسفانه مشکلی پیش آمد.";

    // Parse follow-up questions if present
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

    // Fallback follow-ups if none generated
    if (generateFollowUps && followUps.length === 0) {
      followUps = [
        "بیشتر توضیح بده",
        "یه مثال بزن",
        "قدم بعدی چیه؟"
      ];
    }

    return NextResponse.json({ reply, followUps });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
