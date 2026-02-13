"use server";

import { callOpenRouter } from '@/lib/openrouter';
import { checkAILimit } from '@/lib/ai-limit-middleware';

export async function chatAction(message: string, planContext: any, generateFollowUps: boolean = false) {
  try {
    // === AI Usage Limit Check ===
    const { errorResponse } = await checkAILimit();
    if (errorResponse) return { error: "AI Limit Reached", status: 429 };

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
      return {
        reply: "متاسفانه سرویس در دسترس نیست. لطفا دقایقی دیگر تلاش کنید.",
        followUps: []
      };
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

    return { success: true, reply, followUps };

  } catch (error) {
    console.error("Chat Error:", error);
    return { error: 'Chat failed' };
  }
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface AdvisorChatResult {
  success?: boolean;
  reply?: string;
  followUps?: string[];
  model?: string;
  actions?: any[];
  xpReward?: number;
  error?: string;
  status?: number;
}

export async function advisorChatAction(message: string, projectContext: any, conversationHistory: Message[]): Promise<AdvisorChatResult> {
  try {
    // === AI Usage Limit Check ===
    const { errorResponse } = await checkAILimit();
    if (errorResponse) return { error: "AI Limit Reached", status: 429 };

    // Calculate project progress
    const totalSteps = projectContext?.roadmap?.reduce((acc: any, p: any) => acc + p.steps.length, 0) || 0;
    const completedCount = projectContext?.completedSteps?.length || 0;
    const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

    // Build comprehensive context from all project data
    const buildProjectSummary = () => {
      const parts: string[] = [];

      if (projectContext?.projectName) {
        parts.push(`نام پروژه: ${projectContext.projectName}`);
      }
      if (projectContext?.overview) {
        parts.push(`شرح: ${projectContext.overview}`);
      }
      if (projectContext?.audience) {
        parts.push(`مخاطب: ${projectContext.audience}`);
      }

      if (projectContext?.leanCanvas) {
        const canvas = projectContext.leanCanvas;
        if (canvas.problem) parts.push(`مشکل: ${canvas.problem}`);
        if (canvas.solution) parts.push(`راه‌حل: ${canvas.solution}`);
      }

      if (projectContext?.roadmap && projectContext.roadmap.length > 0) {
        parts.push(`پیشرفت: ${progressPercent}%`);
      }

      return parts.join(' | ');
    };

    const projectSummary = buildProjectSummary();

    // CRITICAL: Very explicit Persian-only system prompt
    const systemPrompt = `تو دستیار هوشمند کارنکس هستی.

قانون مهم: فقط به زبان فارسی پاسخ بده. هیچ کلمه انگلیسی یا زبان دیگر استفاده نکن.

پروژه کاربر: ${projectSummary}

وظایف:
- پاسخ کوتاه و مفید بده
- نکات عملی پیشنهاد کن
- در آخر ۲ سوال پیگیری بنویس

فرمت:
[پاسخ فارسی]

---FOLLOWUPS---
- سوال ۱
- سوال ۲`;

    // Build conversation context
    let fullPrompt = message;
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-4);
      const historyText = recentHistory
        .map(msg => `${msg.role === 'user' ? 'کاربر' : 'دستیار'}: ${msg.content}`)
        .join('\n');
      fullPrompt = `${historyText}\n\nکاربر: ${message}\n\nدستیار (فقط فارسی):`;
    } else {
      fullPrompt = `کاربر: ${message}\n\nدستیار (فقط فارسی):`;
    }

    const result = await callOpenRouter(fullPrompt, {
      systemPrompt,
      maxTokens: 1024,
      temperature: 0.5, // Lower temperature for more consistent output
    });

    if (!result.success) {
      return {
        reply: "متاسفانه در حال حاضر امکان پاسخگویی نیست. لطفا دقایقی دیگر تلاش کنید.",
        followUps: ["دوباره تلاش کن", "به صفحه اصلی برگرد"]
      };
    }

    let fullReply = result.content || "متاسفانه مشکلی پیش آمد.";

    // Parse follow-up questions
    let reply = fullReply;
    let followUps: string[] = [];

    if (fullReply.includes("---FOLLOWUPS---")) {
      const parts = fullReply.split("---FOLLOWUPS---");
      reply = parts[0].trim();

      if (parts[1]) {
        followUps = parts[1]
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.startsWith("-") || line.startsWith("•"))
          .map((line: string) => line.replace(/^[-•]\s*/, ""))
          .filter((q: string) => q.length > 0)
          .slice(0, 3);
      }
    }

    // Fallback follow-ups
    if (followUps.length === 0) {
      followUps = [
        "بیشتر توضیح بده",
        "قدم بعدی چیه؟"
      ];
    }

    return {
      success: true,
      reply,
      followUps,
      model: result.model,
      actions: [], // Placeholder
      xpReward: 0 // Placeholder
    };

  } catch (error) {
    console.error("Advisor Chat Error:", error);
    return { error: 'Advisor chat failed' };
  }
}
