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
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-exp:free", // Or any other fast model
        "messages": [
          { "role": "system", "content": systemPrompt },
          { "role": "user", "content": message }
        ],
        "temperature": 0.7,
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "متاسفانه مشکلی پیش آمد. لطفا دوباره تلاش کنید.";

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
