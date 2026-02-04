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
  "customerRelations": "• رابطه ۱\\n• رابطه ۲\\n• رابطه ۳",
  "channels": "• کانال ۱\\n• کانال ۲\\n• کانال ۳",
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

    // Handle Pitch Deck Generation
    if (action === 'generate-pitch-deck') {
      const pitchPrompt = `
      Create a 10-slide startup pitch deck structure based on:
      Project Name: ${projectName}
      Business Idea: ${businessIdea}

      Slides to generate:
      1. Title Slide (Tagline)
      2. Problem (The Pain)
      3. Solution (The Product)
      4. Why Now? (Timing)
      5. Market Size (TAM/SAM/SOM)
      6. Competition (Unfair Advantage)
      7. Business Model (Revenue)
      8. Go-to-Market (Strategy)
      9. Team (Founders)
      10. Ask (Funding/Requirements)

      For each slide, provide:
      - title: Persian title
      - type: slide type id
      - bullets: Array of 3 short, punchy Persian bullet points.

      Return ONLY valid JSON array of objects:
      [
        { "type": "title", "title": "عنوان", "bullets": ["..."] },
        ...
      ]
      `;

      const result = await callOpenRouter(pitchPrompt, {
        systemPrompt: 'You are a Pitch Deck Expert. Return only valid JSON array.',
        maxTokens: 3000,
        temperature: 0.7,
      });

      if (!result.success) return NextResponse.json({ error: result.error }, { status: 503 });

      try {
        let content = result.content!;
        // Ensure we parse array correctly
        if (content.includes("```json")) {
           content = content.split("```json")[1].split("```")[0].trim();
        }
        const slides = JSON.parse(content);
        return NextResponse.json({ success: true, slides });
      } catch (e) {
        return NextResponse.json({ error: 'Failed to parse slides' }, { status: 500 });
      }
    }

    // Handle Idea Validation (Roast & Experiments)
    if (action === 'validate-idea') {
      const validationPrompt = `
      Act as a brutal Y Combinator partner. Critically analyze this startup idea:
      Project: ${projectName}
      Description: ${businessIdea}

      1. ROAST: Give a brutal but constructive critique in Persian. Identify the biggest weakness.
      2. ASSUMPTIONS: List 6 core assumptions this business is making in Persian.
      3. EXPERIMENTS: Suggest 3 cheap, fast ways to test the riskiest assumption in Persian.

      Return ONLY valid JSON:
      {
        "critique": {
          "score": 65,
          "summary": "Brutal one-line summary in Persian.",
          "strengths": ["Strength 1 in Persian"],
          "weaknesses": ["Weakness 1 in Persian", "Weakness 2 in Persian"]
        },
        "assumptions": [
          { "id": "1", "text": "Assumption 1 in Persian", "risk": "critical" },
          { "id": "2", "text": "Assumption 2 in Persian", "risk": "critical" },
          { "id": "3", "text": "Assumption 3 in Persian", "risk": "minor" },
          { "id": "4", "text": "Assumption 4 in Persian", "risk": "minor" }
        ],
        "experiments": [
          { "title": "Experiment Title in Persian", "steps": "Step 1, Step 2 in Persian...", "metric": "Success metric in Persian" },
          ...
        ]
      }
      `;

      const result = await callOpenRouter(validationPrompt, {
         systemPrompt: 'You are a cynical VC. Return ONLY JSON. ALL TEXT VALUES MUST BE IN PERSIAN (FARSI).',
         temperature: 0.8,
         maxTokens: 2000
      });

      if (!result.success) return NextResponse.json({ error: result.error }, { status: 503 });
      
      try {
         let content = result.content!;
         if (content.includes("```json")) {
            content = content.split("```json")[1].split("```")[0].trim();
         }
         const validationData = JSON.parse(content);
         return NextResponse.json({ success: true, validation: validationData });
      } catch (e) {
         return NextResponse.json({ error: 'Failed to parse validation data' }, { status: 500 });
      }
    }
    
    // Handle Growth Planning (Roshdnama 2.0)
    if (action === 'generate-growth-plan') {
       const { planType, stage } = body; // planType: 'north-star' | 'experiments'
       
       let growthPrompt = "";
       
       if (planType === 'north-star') {
          growthPrompt = `
          Analyze this startup to find its North Star Metric (NSM):
          Project: ${projectName}
          Description: ${businessIdea}

          Return ONLY valid JSON in Persian:
          {
            "northStarMetric": "The single key metric (e.g., Weekly Active Paid Users)",
            "why": "One sentence explanation",
            "inputMetrics": [
               { "name": "Input 1 (e.g., New Signups)", "target": "Target value" },
               { "name": "Input 2 (e.g., Retention %)", "target": "Target value" },
               { "name": "Input 3", "target": "Target value" }
            ]
          }`;
       } else if (planType === 'experiments') {
          growthPrompt = `
          Suggest 3 Growth Hacking experiments for the "${stage || 'Acquisition'}" stage of the AAARRR funnel.
          Project: ${projectName}
          Description: ${businessIdea}

          Return ONLY valid JSON in Persian:
          [
            {
              "title": "Experiment Title (e.g., LinkedIn Viral Loop)",
              "description": "Short execution plan",
              "ice_score": 8,
              "difficulty": "Easy/Medium/Hard"
            },
            ...
          ]
          `;
       }

       const result = await callOpenRouter(growthPrompt, {
         systemPrompt: 'You are a Growth Hacker like Sean Ellis. Return ONLY JSON in Persian.',
         temperature: 0.8,
         maxTokens: 1500
      });

      if (!result.success) return NextResponse.json({ error: result.error }, { status: 503 });

      try {
        let content = result.content!;
        if (content.includes("```json")) {
           content = content.split("```json")[1].split("```")[0].trim();
        }
        const growthData = JSON.parse(content);
        return NextResponse.json({ success: true, data: growthData });
      } catch (e) {
        return NextResponse.json({ error: 'Failed to parse growth data' }, { status: 500 });
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
