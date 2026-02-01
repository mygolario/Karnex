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
    // Contextual System Prompt
    const projectType = planContext?.projectType || 'startup';
    
    let personaInstructions = "";

    if (projectType === 'startup') {
      personaInstructions = `
        ROLE: You are an expert Venture Capitalist (VC) and Startup Mentor.
        TONE: Professional, insightful, slightly critical but constructive. Push for growth and scalability.
        FOCUS:
        - Ask about "Unfair Advantage", "CAC/LTV", and "Product-Market Fit".
        - Focus on scalability and high growth.
        - Encourage testing assumptions (Lean Startup methodology).
      `;
    } else if (projectType === 'traditional') {
      personaInstructions = `
        ROLE: You are a Senior Business Consultant for Brick-and-Mortar/Service Businesses.
        TONE: Experienced, risk-averse, practical, and rigorous.
        FOCUS:
        - Focus on "Profitability", "Cash Flow", and "Operational Efficiency".
        - Warn against unnecessary risks.
        - Advise on permits, location, and solid unit economics.
      `;
    } else if (projectType === 'creator') {
      personaInstructions = `
        ROLE: You are a Top Talent Manager and Personal Brand Strategist.
        TONE: Energetic, hype-focused, trend-savvy, and motivational.
        FOCUS:
        - Focus on "Audience Engagement", "Personal Brand", and "Content Strategy".
        - Differentiate between "Vanity Metrics" and real influence.
        - Advise on monetization (sponsorships, digital products).
      `;
    }

    const systemPrompt = `
      ${personaInstructions}
      
      CONTEXT - USER'S CURRENT PROJECT:
      Project Name: ${planContext?.projectName || 'Unknown'}
      Business Idea: ${planContext?.overview || 'Unknown'}
      Target Audience: ${planContext?.audience || 'Unknown'}
      Current Budget: ${planContext?.budget || 'Unknown'}
      Project Type: ${projectType}
      
      GENERAL INSTRUCTIONS:
      1. Answer the user's question specifically for *their* project type. Don't give generic advice.
      2. Keep answers concise (max 3-4 sentences) unless asked for more.
      3. Reply in PERSIAN (Farsi).
      
      User Question: ${message}
    `;

    // Call OpenRouter (Using fast, free models)
    let response;
    // Best FREE models on OpenRouter (January 2026)
    const models = [
        "google/gemini-2.0-flash-exp:free",      // 1. Best: Fast, smart, free
        "qwen/qwen-2.5-72b-instruct:free",       // 2. Qwen 2.5 72B free
        "deepseek/deepseek-chat:free",           // 3. DeepSeek free tier
        "meta-llama/llama-3.3-70b-instruct:free", // 4. Llama 3.3 70B
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
