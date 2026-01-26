import { NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';

export const maxDuration = 60;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ProjectContext {
  projectName?: string;
  tagline?: string;
  overview?: string;
  audience?: string;
  budget?: string;
  leanCanvas?: {
    problem?: string;
    solution?: string;
    uniqueValue?: string;
    revenueStream?: string;
    customerSegments?: string;
    keyActivities?: string;
    keyResources?: string;
    keyPartners?: string;
    costStructure?: string;
  };
  brandKit?: {
    primaryColorHex?: string;
    secondaryColorHex?: string;
    colorPsychology?: string;
    suggestedFont?: string;
  };
  roadmap?: { phase: string; steps: string[] }[];
  completedSteps?: string[];
  marketingStrategy?: string[];
  competitors?: { name: string; strength: string; weakness: string }[];
  legalAdvice?: {
    requirements?: { title: string; description: string }[];
    permits?: string[];
    tips?: string[];
  };
}

export async function POST(req: Request) {
  try {
    const { message, projectContext, conversationHistory } = await req.json() as {
      message: string;
      projectContext: ProjectContext;
      conversationHistory?: Message[];
    };

    // Calculate project progress
    const totalSteps = projectContext?.roadmap?.reduce((acc, p) => acc + p.steps.length, 0) || 0;
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
      return NextResponse.json({
        reply: "متاسفانه در حال حاضر امکان پاسخگویی نیست. لطفا دقایقی دیگر تلاش کنید.",
        followUps: ["دوباره تلاش کن", "به صفحه اصلی برگرد"]
      });
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

    return NextResponse.json({
      reply,
      followUps,
      model: result.model
    });

  } catch (error) {
    console.error("Advisor Chat Error:", error);
    return NextResponse.json({ error: 'Advisor chat failed' }, { status: 500 });
  }
}
