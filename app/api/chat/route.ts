import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow enough time for thinking

export async function POST(req: Request) {
  try {
    const { message, planContext } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
    }

    // Contextual System Prompt
    // We inject the user's plan details directly into the AI's instructions.
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
      
      User Question: ${message}
    `;

    // Call OpenRouter (Using a fast, free/cheap model)
    let response;
    // List of models to try
    // List of models to try
    const models = [
        "google/gemini-2.0-flash-exp:free", // User Requested Strict Single Model
    ];

    let successfulModel = '';
    let lastError = '';

    for (const model of models) {
        try {
            console.log(`Chat attempts: ${model}`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 40000); // 40s Limit

            response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
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

            if (response.ok) {
                successfulModel = model;
                break; // Success!
            }
            const errText = await response.text();
            lastError = `${model}: ${response.status} - ${errText}`;
            console.warn(`Chat model ${model} failed: ${response.status} - ${errText}`);
        } catch (e: any) {
            lastError = `${model}: ${e.name || e.message}`;
            console.warn(`Chat model ${model} error:`, e.name || e.message);
        }
    }

    if (!response || !response.ok) {
        return NextResponse.json({ reply: "متاسفانه سرویس هوش مصنوعی در حال حاضر پاسخگو نیست. لطفا دقایقی دیگر تلاش کنید." });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "متاسفانه مشکلی پیش آمد. لطفا دوباره تلاش کنید.";

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
