import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { getUsageSummary } from "@/lib/usage-tracker";
import { DEFAULT_FEATURES } from "@/lib/payment/types";

/** GET /api/user/usage?range=month|90d — unified usage dashboard data. */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "month";

    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const rangeStart =
      range === "90d"
        ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1))
        : startOfMonth;

    const [summary, aiRows, projectCount] = await Promise.all([
      getUsageSummary(userId),
      prisma.aiUsage.findMany({
        where: { userId, createdAt: { gte: rangeStart, lt: endOfMonth } },
        select: {
          feature: true,
          model: true,
          promptTokens: true,
          completionTokens: true,
          totalTokens: true,
          costUsd: true,
          success: true,
          createdAt: true,
          projectId: true,
        },
      }),
      prisma.project.count({ where: { userId, deletedAt: null } }),
    ]);

    const tier = summary.tier;
    const limits = DEFAULT_FEATURES[tier];
    const aiLimit = limits.aiRequestsPerMonth;
    const projectLimit = limits.projectLimit;

    // Daily series for charts (YYYY-MM-DD -> totals)
    const byDay: Record<string, { requests: number; tokens: number; costUsd: number }> = {};
    const byFeature: Record<string, { requests: number; tokens: number; costUsd: number }> = {};
    const byProject: Record<string, { requests: number; tokens: number; costUsd: number }> = {};

    for (const r of aiRows) {
      const day = r.createdAt.toISOString().slice(0, 10);
      byDay[day] = byDay[day] || { requests: 0, tokens: 0, costUsd: 0 };
      byDay[day].requests += 1;
      byDay[day].tokens += r.totalTokens;
      byDay[day].costUsd += r.costUsd || 0;

      const f = r.feature || "other";
      byFeature[f] = byFeature[f] || { requests: 0, tokens: 0, costUsd: 0 };
      byFeature[f].requests += 1;
      byFeature[f].tokens += r.totalTokens;
      byFeature[f].costUsd += r.costUsd || 0;

      if (r.projectId) {
        byProject[r.projectId] = byProject[r.projectId] || { requests: 0, tokens: 0, costUsd: 0 };
        byProject[r.projectId].requests += 1;
        byProject[r.projectId].tokens += r.totalTokens;
        byProject[r.projectId].costUsd += r.costUsd || 0;
      }
    }

    const totals = {
      requests: aiRows.length,
      tokens: aiRows.reduce((s, r) => s + r.totalTokens, 0),
      costUsd: aiRows.reduce((s, r) => s + (r.costUsd || 0), 0),
      failed: aiRows.filter((r) => !r.success).length,
    };

    // Reset date = start of next month
    const resetDate = endOfMonth.toISOString();

    return NextResponse.json({
      tier,
      quota: {
        ai: { used: summary.ai.used, limit: aiLimit, remaining: summary.ai.remaining },
        projects: { used: projectCount, limit: projectLimit, remaining: summary.projects.remaining },
      },
      totals,
      byDay: Object.entries(byDay)
        .map(([date, v]) => ({ date, ...v }))
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
      byFeature: Object.entries(byFeature).map(([feature, v]) => ({ feature, ...v })),
      byProject: Object.entries(byProject).map(([projectId, v]) => ({ projectId, ...v })),
      resetDate,
    });
  } catch (error) {
    console.error("[USAGE_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
