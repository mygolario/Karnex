import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { idea, audience, budget } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OpenRouter API Key missing' }, { status: 500 });
    }

    const systemPrompt = `
      You are Karnex, an expert startup consultant for the Iranian market.
      Your Goal: Take a user's business idea and create a detailed execution plan focused on ZERO BUDGET ($0) or low cost.
      
      User Context:
      - Idea: ${idea}
      - Target Audience: ${audience}
      - Budget Constraint: ${budget}

      INSTRUCTIONS:
      1. Think deeply about how to solve this specific problem in Iran.
      2. You MUST reply in PERSIAN (Farsi).
      3. You MUST output ONLY valid JSON.
      
      JSON STRUCTURE REQUIRED:
      {
        "projectName": "Short catchy name in Persian",
        "tagline": "A punchy slogan",
        "overview": "2 sentences describing the business",
        "leanCanvas": {
          "problem": "What pain point are they solving?",
          "solution": "How they solve it simply",
          "uniqueValue": "Why them?",
          "revenueStream": "How they make money (e.g. Subscription, Ads)"
        },
        "brandKit": {
          "primaryColorHex": "#HEXCODE",
          "secondaryColorHex": "#HEXCODE",
          "colorPsychology": "Why these colors?",
          "suggestedFont": "Vazirmatn",
          "logoConcepts": [
            { "conceptName": "Concept 1", "description": "Description 1" },
            { "conceptName": "Concept 2", "description": "Description 2" },
            { "conceptName": "Concept 3", "description": "Description 3" }
          ]
        },
        "roadmap": [
           { "phase": "Week 1: Validation", "steps": ["Step 1", "Step 2"] },
           { "phase": "Week 2: MVP Build", "steps": ["Step 1", "Step 2"] },
           { "phase": "Week 3: Launch", "steps": ["Step 1", "Step 2"] }
        ],
        "marketingStrategy": [
           "Specific tactic 1",
           "Specific tactic 2",
           "Specific tactic 3",
           "Specific tactic 4"
        ],
        "competitors": [
          { 
            "name": "Name of competitor type (e.g. Traditional Bazaar)", 
            "strength": "Their main advantage", 
            "weakness": "Their main weakness you can exploit", 
            "channel": "Where they sell (e.g. Offline, Instagram)" 
          },
          { 
            "name": "Name of competitor type (e.g. Digikala/Snapp)", 
            "strength": "Their main advantage", 
            "weakness": "Their main weakness", 
            "channel": "Web/App" 
          }
        ]
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
        "temperature": 0.7,
        "response_format": { "type": "json_object" }
      })
    });

    const data = await response.json();
    let rawContent = data.choices[0].message.content;
    rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const structuredPlan = JSON.parse(rawContent);

    return NextResponse.json(structuredPlan);

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}
