import { NextResponse } from 'next/server';
import { callOpenRouter, parseJsonFromAI } from '@/lib/openrouter';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Types for the new detailed roadmap
interface RoadmapStep {
  title: string;
  description: string;
  estimatedHours: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  resources?: string[];
}

interface RoadmapPhase {
  phase: string;
  weekNumber: number;
  theme: string;
  steps: RoadmapStep[];
}

export async function POST(req: Request) {
  try {
    const { idea, audience, budget, projectType } = await req.json();

    console.log("DEBUG: POST /api/generate-plan called");
    console.log("DEBUG: Project Type:", projectType);

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OpenRouter API Key missing' }, { status: 500 });
    }

    const systemPrompt = `
      You are Karnex, an expert business consultant specializing in the Iranian market.
      Your Goal: Create a highly tailored execution plan based on the user's specific business type: ${projectType}.
      
      User Context:
      - Type: ${projectType} (startup = Scalable Tech, traditional = SME/Shop, creator = Content/Brand)
      - Idea: ${idea}
      - Target Audience: ${audience}
      - Budget Constraint: ${budget}

      INSTRUCTIONS:
      1. Think deeply about the needs of a "${projectType}" business.
         - If 'traditional': Focus on location, permits, physical assets, and local marketing.
         - If 'startup': Focus on MVP, product-market fit, scalability, and investor appeal.
         - If 'creator': Focus on content strategy, personal branding, platforms, and audience growth.
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
            "name": "Name of ACTUAL competitor company in Iran (e.g. Digikala, Snapp, Torob, Basalam, Tap30)", 
            "strength": "Their main advantage", 
            "weakness": "Their main weakness you can exploit", 
            "channel": "Where they sell (Website/App/Instagram/Physical)" 
          },
          { 
            "name": "Another REAL Iranian competitor company name", 
            "strength": "Their main advantage", 
            "weakness": "Their main weakness", 
            "channel": "Their main channel" 
          },
          { 
            "name": "Third REAL competitor (can be international if relevant)", 
            "strength": "Their advantage", 
            "weakness": "Their weakness", 
            "channel": "Their channel" 
          }
        ]
      }
    `;

    // Mock plan removed for brevity in this fix, relying on AI generation.

    console.log("DEBUG: Calling OpenRouter...");
    
    const result = await callOpenRouter(
      `طرح کسب‌وکار ۸ هفته‌ای JSON فارسی برای: ${idea}`,
      {
        systemPrompt,
        maxTokens: 4000,
        temperature: 0.5,
        timeoutMs: 55000,
      }
    );

    if (!result.success) {
      console.warn("AI failed", result.error);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 503 });
    }

    try {
      const structuredPlan = parseJsonFromAI(result.content!);
      console.log(`✅ 12-week plan generated using ${result.model}`);
      return NextResponse.json(structuredPlan);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

  } catch (error) {
    console.error("Generate Plan Error:", error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}
