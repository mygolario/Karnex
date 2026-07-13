import "server-only";
import prisma from "@/lib/prisma";

/**
 * Proactive insights engine.
 *
 * Rule-based generator that inspects a project's data + relational state and
 * upserts `AiInsight` rows. Keeps cost predictable (no LLM per run) and is
 * safe to call on-demand (overview load, Copilot open) or via a scheduled job.
 */

export type InsightType =
  | "gap"
  | "competitor"
  | "streak"
  | "decision"
  | "summary";

export interface GeneratedInsight {
  type: InsightType;
  priority: "info" | "warning" | "urgent";
  title: string;
  body: string;
  payload?: Record<string, any>;
  actionPayload?: {
    type: "open_copilot" | "open_page";
    label: string;
    href?: string;
    prefill?: string;
  };
}

/** Stable dedup key so re-running the engine updates existing rows instead of spamming. */
function insightKey(projectId: string, type: string, title: string) {
  return `${projectId}::${type}::${title}`;
}

export async function generateInsightsForProject(
  projectId: string,
  userId: string
): Promise<GeneratedInsight[]> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true, data: true, createdAt: true },
  });
  if (!project) return [];

  const data: Record<string, any> = (project.data as any) || {};
  const projectType: string = (data.projectType as string) || "startup";

  const insights: GeneratedInsight[] = [];

  // --- Canvas gaps (all) ---
  const canvas = projectType === "creator" ? data.brandCanvas : data.leanCanvas;
  const canvasLabel = projectType === "creator" ? "بوم برند" : "بوم مدل کسب‌وکار";
  if (canvas && typeof canvas === "object") {
    const total = Object.keys(canvas).length;
    const filled = Object.keys(canvas).filter((k) => {
      const v = (canvas as any)[k];
      if (Array.isArray(v)) return v.length > 0;
      return v && String(v).trim().length > 0;
    }).length;
    const empty = total - filled;
    if (total > 0 && empty >= 3) {
      insights.push({
        type: "gap",
        priority: empty >= 6 ? "warning" : "info",
        title: `${canvasLabel} ناقص است`,
        body: `${empty} بخش از ${canvasLabel} شما خالی است. تکمیل آن‌ها تصویر کلی کسب‌وکارت رو شفاف‌تر می‌کنه.`,
        actionPayload: {
          type: "open_page",
          label: "تکمیل بوم",
          href: "/dashboard/canvas",
        },
      });
    }
  } else if (projectType !== "creator") {
    insights.push({
      type: "gap",
      priority: "warning",
      title: "بوم مدل کسب‌وکار شروع نشده",
      body: "هنوز بوم مدل کسب‌وکارت رو پر نکردی. شروع از بوم، پایه‌ی همه تصمیم‌های بعدیه.",
      actionPayload: {
        type: "open_page",
        label: "شروع بوم",
        href: "/dashboard/canvas",
      },
    });
  }

  // --- Roadmap stalled (all) ---
  const roadmap: any[] = Array.isArray(data.roadmap) ? data.roadmap : [];
  const completed: string[] = Array.isArray(data.completedSteps)
    ? data.completedSteps
    : [];
  if (roadmap.length > 0) {
    let currentStepTitle: string | null = null;
    for (const phase of roadmap) {
      const steps = Array.isArray(phase?.steps) ? phase.steps : [];
      for (const s of steps) {
        const step = typeof s === "string" ? { title: s } : s;
        const id = step.id || step.title;
        const status = step.status || (completed.includes(id) ? "done" : "todo");
        if (status !== "done") {
          currentStepTitle = step.title || null;
          break;
        }
      }
      if (currentStepTitle) break;
    }
    if (currentStepTitle) {
      const progress = Math.round((completed.length / Math.max(countSteps(roadmap), 1)) * 100);
      insights.push({
        type: "gap",
        priority: "info",
        title: "گام بعدی نقشه راه",
        body: `گام فعلی نقشه‌راهت «${currentStepTitle}» است. پیشرفت کلی ${progress}٪. می‌خوای با هم این گام رو جلو ببریم؟`,
        payload: { currentStep: currentStepTitle, progress },
        actionPayload: {
          type: "open_copilot",
          label: "بپرس از دستیار",
          prefill: `بیا روی گام «${currentStepTitle}» از نقشه راه تمرکز کنیم.`,
        },
      });
    }
  } else {
    insights.push({
      type: "gap",
      priority: "warning",
      title: "نقشه راه تعریف نشده",
      body: "بدون نقشه راه، اولویت‌بندی کارها سخت می‌شه. می‌تونیم با هم یه نقشه راه برای پروژه‌ت بسازیم.",
      actionPayload: {
        type: "open_copilot",
        label: "ساخت نقشه راه",
        prefill: "برام یه نقشه راه مرحله‌به‌مرحله برای پروژه‌م بساز.",
      },
    });
  }

  // --- Startup specifics ---
  if (projectType === "startup") {
    const pitchCount = Array.isArray(data.pitchDeck) ? data.pitchDeck.length : 0;
    if (pitchCount === 0) {
      insights.push({
        type: "gap",
        priority: "info",
        title: "پیچ‌دک آماده ساخت است",
        body: "با داده‌های فعلی پروژه می‌تونیم یه پیچ‌دک حرفه‌ای برات بسازیم که آماده ارائه به سرمایه‌گذار بشه.",
        actionPayload: {
          type: "open_copilot",
          label: "ساخت پیچ‌دک",
          prefill: "برام یه پیچ‌دک جذب سرمایه بساز.",
        },
      });
    } else if (pitchCount > 0 && pitchCount < 7) {
      insights.push({
        type: "gap",
        priority: "info",
        title: "پیچ‌دک کامل نیست",
        body: `الان ${pitchCount} اسلاید داری. یه پیچ‌دک استاندارد معمولاً ۱۰–۱۲ اسلایده. بقیه رو تکمیل کنیم؟`,
        actionPayload: {
          type: "open_copilot",
          label: "تکمیل پیچ‌دک",
          prefill: "اسلایدهای ناقص پیچ‌دکم رو تکمیل کن.",
        },
      });
    }

    if (!data.swotAnalysis) {
      insights.push({
        type: "decision",
        priority: "info",
        title: "تحلیل SWOT نداری",
        body: "تحلیل SWOT بهت کمک می‌کنه نقاط قوت و ضعف و فرصت‌ها و تهدیدها رو شفاف کنی.",
        actionPayload: {
          type: "open_copilot",
          label: "ساخت SWOT",
          prefill: "برام یه تحلیل SWOT برای پروژه‌م بنویس.",
        },
      });
    }
  }

  // --- Competitor workspace (startup + traditional) ---
  if (projectType === "startup" || projectType === "traditional") {
    const activeFromIntel = Array.isArray(data.competitorIntel?.competitors)
      ? data.competitorIntel.competitors.filter((c: { status?: string }) => c.status === "active")
      : [];
    const competitors: unknown[] = activeFromIntel.length
      ? activeFromIntel
      : Array.isArray(data.competitors)
        ? data.competitors
        : Array.isArray(data.competitorAnalysis)
          ? data.competitorAnalysis
          : [];

    if (competitors.length === 0) {
      insights.push({
        type: "competitor",
        priority: "warning",
        title: "تحلیل رقبا شروع نشده",
        body: "هنوز رقیب فعالی در فضای تحلیل رقبا نداری. شناخت رقبا کلید تمایز و قیمت‌گذاریه.",
        actionPayload: {
          type: "open_page",
          label: "باز کردن تحلیل رقبا",
          href: "/dashboard/competitors",
        },
      });
    } else if (!data.competitorIntel?.wedge && !data.competitorIntel?.brief) {
      insights.push({
        type: "competitor",
        priority: "info",
        title: `${competitors.length} رقیب داری؛ جایگاه هنوز مبهم است`,
        body: "فهرست رقبا هست، ولی زاویه تمایز و خلاصه جایگاه را کامل کن تا تصمیم‌گیری راحت‌تر شود.",
        actionPayload: {
          type: "open_page",
          label: "تکمیل جایگاه",
          href: "/dashboard/competitors",
        },
      });
    }
  }

  // --- Creator specifics ---
  if (projectType === "creator") {
    const posts: any[] = Array.isArray(data.contentCalendar)
      ? data.contentCalendar
      : [];
    const now = Date.now();
    const overdue = posts.filter((p) => {
      if (!p.dueDate) return false;
      if (p.status === "published" || p.status === "done") return false;
      const due = new Date(p.dueDate).getTime();
      return !isNaN(due) && due < now;
    });
    if (overdue.length > 0) {
      insights.push({
        type: "streak",
        priority: overdue.length >= 3 ? "urgent" : "warning",
        title: `${overdue.length} پست محتوا عقب‌افتاده`,
        body: `${overdue.length} پست در تقویم محتوا سررسیدشده و منتظرن. برای حفظ استریک اولویت‌بندی‌شون کن.`,
        payload: { count: overdue.length, titles: overdue.slice(0, 5).map((p) => p.title) },
        actionPayload: {
          type: "open_copilot",
          label: "اولویت‌بندی",
          prefill: `${overdue.length} پست محتوام عقب‌افتاده. بیا اولویت‌بندیشون کنیم.`,
        },
      });
    }

    const streak = data.contentStreak;
    if (streak && typeof streak.current === "number" && streak.current >= 3) {
      const lastPostDate = posts
        .filter((p) => p.status === "published" || p.status === "done")
        .map((p) => (p.publishedAt ? new Date(p.publishedAt).getTime() : 0))
        .sort((a, b) => b - a)[0];
      if (lastPostDate) {
        const daysSince = Math.floor((now - lastPostDate) / 86400000);
        if (daysSince >= 2) {
          insights.push({
            type: "streak",
            priority: daysSince >= 4 ? "warning" : "info",
            title: "ریسک از دست دادن استریک",
            body: `${daysSince} روز از آخرین پستت می‌گذره و استریک ${streak.current} روزه‌ت در خطره. امروز یه پست کوتاه منتشر کن.`,
            actionPayload: {
              type: "open_copilot",
              label: "ایده پست سریع",
              prefill: "برای حفظ استریکم یه ایده پست سریع و ساده بده.",
            },
          });
        }
      }
    }

    if (posts.length === 0) {
      insights.push({
        type: "gap",
        priority: "info",
        title: "تقویم محتوا خالی است",
        body: "هیچ پست برنامه‌ریزی‌شده‌ای نداری. یه تقویم محتوای ۲ هفته‌ای برات بسازیم؟",
        actionPayload: {
          type: "open_copilot",
          label: "ساخت تقویم",
          prefill: "برام یه تقویم محتوای ۲ هفته‌ای پیشنهاد بده.",
        },
      });
    }
  }

  // --- Traditional specifics ---
  if (projectType === "traditional") {
    const permits: any[] = Array.isArray(data.permits) ? data.permits : [];
    if (permits.length > 0) {
      const pending = permits.filter(
        (p) => p.status !== "done" && p.status !== "approved"
      );
      if (pending.length > 0) {
        insights.push({
          type: "decision",
          priority: pending.length >= 2 ? "warning" : "info",
          title: `${pending.length} مجوز در انتظار`,
          body: `${pending.length} مجوز هنوز تکمیل نشده. تأخیر در مجوزها می‌تونه افتتاح رو عقب بندازه.`,
          payload: { count: pending.length, titles: pending.slice(0, 5).map((p) => p.name || p.title) },
        });
      }
    }
    insights.push({
      type: "gap",
      priority: "info",
      title: "سلامت کسب‌وکار را چک کن",
      body: "امتیاز زنده از مالی، موجودی و نقشه راه در داشبورد سلامت کسب‌وکار در دسترس است.",
      actionPayload: {
        type: "open_page",
        label: "سلامت کسب‌وکار",
        href: "/dashboard/health",
      },
    });
  }

  await persistInsights(projectId, userId, insights);

  const projectName = (data.projectName as string) || "پروژه";
  const { enrichInsightsWithLLM } = await import("./insights-llm");
  return enrichInsightsWithLLM(insights, projectName, projectType);
}

async function persistInsights(
  projectId: string,
  userId: string,
  insights: GeneratedInsight[]
): Promise<void> {
  if (insights.length === 0) return;
  for (const ins of insights) {
    const key = insightKey(projectId, ins.type, ins.title);
    await prisma.aiInsight.upsert({
      where: { id: key },
      create: {
        id: key,
        userId,
        projectId,
        type: ins.type,
        priority: ins.priority,
        title: ins.title,
        body: ins.body,
        payload: (ins.payload as any) ?? undefined,
        actionPayload: (ins.actionPayload as any) ?? undefined,
        status: "unread",
      },
      update: {
        priority: ins.priority,
        body: ins.body,
        payload: (ins.payload as any) ?? undefined,
        actionPayload: (ins.actionPayload as any) ?? undefined,
        // keep status as-is (don't re-notify on dismissed/read)
      },
    });
  }
}

function countSteps(roadmap: any[]): number {
  let n = 0;
  for (const phase of roadmap) {
    const steps = Array.isArray(phase?.steps) ? phase.steps : [];
    n += steps.length;
  }
  return n;
}

export async function listInsightsForProject(
  projectId: string,
  userId: string,
  includeRead = false
) {
  const where: any = { userId, projectId };
  if (!includeRead) where.status = "unread";
  return prisma.aiInsight.findMany({
    where,
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: 50,
  });
}

export async function listInsightsForUser(userId: string, includeRead = false) {
  const where: any = { userId };
  if (!includeRead) where.status = "unread";
  return prisma.aiInsight.findMany({
    where,
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
}

export async function countUnreadInsights(userId: string): Promise<number> {
  return prisma.aiInsight.count({
    where: { userId, status: "unread" },
  });
}

export async function markInsightRead(id: string, userId: string) {
  return prisma.aiInsight.updateMany({
    where: { id, userId },
    data: { status: "read" },
  });
}

export async function dismissInsight(id: string, userId: string) {
  return prisma.aiInsight.updateMany({
    where: { id, userId },
    data: { status: "dismissed" },
  });
}
