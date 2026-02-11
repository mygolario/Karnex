import { NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';
import { checkAILimit } from '@/lib/ai-limit-middleware';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // === AI Usage Limit Check ===
    const { errorResponse } = await checkAILimit();
    if (errorResponse) return errorResponse;

    const { message, planContext, generateFollowUps } = await req.json();

    // Contextual System Prompt
    // We inject the user's plan details directly into the AI's instructions.
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
      ${generateFollowUps ? '\nدر آخر ۳ سوال پیگیری بنویس با فرمت:\n---FOLLOWUPS---\n- سوال ۱\n- سوال ۲\n- سوال ۳' : ''}
    `;

    const result = await callOpenRouter(`${message}\n\n(پاسخ فارسی بده)`, {
      systemPrompt,
      maxTokens: 800,
      temperature: 0.5,
      // User request: Use gpt-4o-mini specifically for Assistant
      modelOverride: "openai/gpt-4o-mini"
    });

    if (!result.success) {
      return NextResponse.json({
        reply: "متاسفانه سرویس در دسترس نیست. لطفا دقایقی دیگر تلاش کنید.",
        followUps: []
      });
    }

    let fullReply = result.content || "متاسفانه مشکلی پیش آمد.";

    // Parse follow-up questions
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

    // Fallback follow-ups
    if (generateFollowUps && followUps.length === 0) {
      followUps = ["بیشتر توضیح بده", "یه مثال بزن", "قدم بعدی چیه؟"];
    }

    return NextResponse.json({ reply, followUps });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
