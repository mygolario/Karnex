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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-exp:free",
        "messages": [
          { "role": "system", "content": systemPrompt }
        ],
        "response_format": { "type": "json_object" }
      })
    });

    const data = await response.json();
    let rawContent = data.choices[0].message.content;
    rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return NextResponse.json(JSON.parse(rawContent));

  } catch (error) {
    console.error("Legal AI Error:", error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
