import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { idea, audience } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
    }

    const systemPrompt = `
      You are an expert Business Lawyer in Iran.
      Your goal is to advise a startup founder on the MINIMUM legal requirements to start.
      
      Context:
      - Business Idea: ${idea}
      - Audience: ${audience}

      Instructions:
      1. Focus on Iranian laws (Enamad, Tax, Company Registration, Guild Unions/Senf).
      2. Be realistic: Tell them what they can ignore for now (MVP stage) and what is strictly necessary.
      3. Reply in Persian (Farsi).
      4. Output strict JSON.

      JSON Structure:
      {
        "requirements": [
          { "title": "Requirement Name (e.g. Enamad)", "description": "Why they need it", "priority": "High/Medium/Low" }
        ],
        "permits": ["List of specific licenses names if applicable"],
        "tips": ["Practical legal hack or tip"]
      }
    `;

    let response;
    // Using only Google Gemini models from OpenRouter (January 2026)
    const models = [
        "google/gemini-2.0-flash-exp:free",      // Best free Gemini
        "google/gemini-2.0-flash-001",           // Gemini Flash
        "google/gemini-pro-1.5",                 // Gemini Pro 1.5
        "google/gemini-pro",                     // Gemini Pro
    ];

    // let response; // Removed duplicate
    const errors = [];
    for (const model of models) {
        try {
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
                  { "role": "system", "content": systemPrompt }
                ],
                // Only send response_format for models that support it well (like Claude/GPT) to avoid 400s on Free models
                "response_format": model.includes("claude") || model.includes("gpt") ? { "type": "json_object" } : undefined 
              }),
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) break;
            
            const errText = await response.text();
            errors.push(`${model}: Status ${response.status} - ${errText}`);
            console.warn(`Legal model ${model} failed: ${response.status} - ${errText}`);

        } catch (e: any) {
            console.warn(`Legal model ${model} error:`, e.name || e.message);
            errors.push(`${model}: ${e.name || e.message}`);
        }
    }

    if (!response || !response.ok) {
        throw new Error(`All legal models failed. Details: ${errors.join(" | ")}`);
    }

    const data = await response.json();
    let rawContent = data.choices[0].message.content;
    rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return NextResponse.json(JSON.parse(rawContent));

  } catch (error) {
    console.error("Legal AI Error:", error);
    return NextResponse.json(
      { error: `Legal Gen Failed: ${error instanceof Error ? error.message : String(error)}` }, 
      { status: 500 }
    );
  }
}
