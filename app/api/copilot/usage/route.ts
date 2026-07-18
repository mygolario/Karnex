import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

/** GET /api/copilot/usage?projectId=... — aggregate AI usage for current month */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const projectId = req.nextUrl.searchParams.get("projectId") || undefined;

  // Current calendar-month bounds (UTC)
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const where: any = {
    userId,
    createdAt: { gte: startOfMonth, lt: endOfMonth },
  };
  if (projectId) where.projectId = projectId;

  const rows = await prisma.aiUsage.findMany({
    where,
    select: {
      feature: true,
      model: true,
      promptTokens: true,
      completionTokens: true,
      totalTokens: true,
      costUsd: true,
      success: true,
    },
  });

  const totals = {
    requests: rows.length,
    promptTokens: rows.reduce((s, r) => s + r.promptTokens, 0),
    completionTokens: rows.reduce((s, r) => s + r.completionTokens, 0),
    totalTokens: rows.reduce((s, r) => s + r.totalTokens, 0),
    costUsd: rows.reduce((s, r) => s + (r.costUsd || 0), 0),
    failed: rows.filter((r) => !r.success).length,
  };

  const byFeature: Record<string, { requests: number; costUsd: number; tokens: number }> = {};
  for (const r of rows) {
    const k = r.feature || "other";
    if (!byFeature[k]) byFeature[k] = { requests: 0, costUsd: 0, tokens: 0 };
    byFeature[k].requests += 1;
    byFeature[k].costUsd += r.costUsd || 0;
    byFeature[k].tokens += r.totalTokens;
  }

  return NextResponse.json({
    period: { start: startOfMonth.toISOString(), end: endOfMonth.toISOString() },
    totals,
    byFeature,
  });
}
