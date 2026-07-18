"use server";

import { callOpenRouter, TIER_DEFAULT } from '@/lib/openrouter';
import { checkAILimit } from '@/lib/ai-limit-middleware';
import { runWithAiUsage } from '@/lib/ai-usage-context';
import { getPrompt } from '@/lib/prompts/registry';
import { CHAT_PERSONAS } from '@/lib/prompts/persona-packs';
import type { ProjectType } from '@/lib/account/types';

export async function chatAction(message: string, planContext: any, generateFollowUps: boolean = false) {
  let rollback = async () => {};
  try {
    // === AI Usage Limit Check ===
    const limitResult = await checkAILimit('chat-action');
    if (limitResult.errorResponse) return { error: "AI_LIMIT_REACHED", status: 429 };
    rollback = limitResult.rollback;

    // Contextual System Prompt
    const projectType = (planContext?.projectType || 'startup') as ProjectType;
    
    const personaInstructions = CHAT_PERSONAS[projectType] || CHAT_PERSONAS.startup;

    const projectName = planContext?.projectName || 'Unknown';
    const overview = planContext?.overview || 'Unknown';
    const audience = planContext?.audience || 'Unknown';
    const budget = planContext?.budget || 'Unknown';
    const followUpBlock = generateFollowUps ? '\nدر آخر ۳ سوال پیگیری بنویس با فرمت:\n---FOLLOWUPS---\n- سوال ۱\n- سوال ۲\n- سوال ۳' : '';

    const { system, user } = getPrompt("chatAction", {
      projectName,
      overview,
      audience,
      budget,
      projectType,
      personaInstructions,
      message,
      followUpBlock
    });

    const result = await runWithAiUsage(
      { userId: limitResult.user?.id || "anonymous", feature: "chatAction" },
      () => callOpenRouter(user, {
        systemPrompt: system,
        maxTokens: 800,
        temperature: 0.5,
        modelOverride: TIER_DEFAULT
      })
    );

    if (!result.success) {
      await rollback();
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
    await rollback();
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
  let rollback = async () => {};
  try {
    // === AI Usage Limit Check ===
    const limitResult = await checkAILimit('advisor-chat');
    if (limitResult.errorResponse) return { error: "AI_LIMIT_REACHED", status: 429 };
    rollback = limitResult.rollback;

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

    const { system, user: userTemplate } = getPrompt("advisorChat", { projectSummary });

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

    const result = await runWithAiUsage(
      { userId: limitResult.user?.id || "anonymous", feature: "advisorChat" },
      () => callOpenRouter(fullPrompt, {
        systemPrompt: system,
        maxTokens: 1024,
        temperature: 0.5, // Lower temperature for more consistent output
      })
    );

    if (!result.success) {
      await rollback();
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
    await rollback();
    return { error: 'Advisor chat failed' };
  }
}
