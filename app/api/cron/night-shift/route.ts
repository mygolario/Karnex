import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { dispatchWorkforceAgent } from "@/lib/workforce/dispatch";
import { isMissingAgentRunTable, readNightShiftEnabled } from "@/lib/workforce/store";

export const maxDuration = 120;

function authorize(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  return POST(req);
}

export async function POST(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const projects = await prisma.project.findMany({
      where: { deletedAt: null, updatedAt: { gte: since } },
      select: { id: true, userId: true, data: true },
      take: 50,
    });

    const eligible = projects.filter((p) => readNightShiftEnabled(p.data));
    const results: Array<{ projectId: string; runId?: string; skipped?: string }> = [];

    for (const project of eligible) {
      const recent = await prisma.agentRun.findFirst({
        where: {
          projectId: project.id,
          agentId: "night_shift",
          createdAt: { gte: new Date(Date.now() - 20 * 60 * 60 * 1000) },
        },
        select: { id: true },
      });
      if (recent) {
        results.push({ projectId: project.id, skipped: "already_ran" });
        continue;
      }
      const run = await dispatchWorkforceAgent({
        userId: project.userId,
        projectId: project.id,
        agentId: "night_shift",
        kind: "cron",
      });
      results.push({ projectId: project.id, runId: run.id });
    }

    return NextResponse.json({ scanned: projects.length, ran: results.filter((r) => r.runId).length, results });
  } catch (error) {
    if (isMissingAgentRunTable(error)) {
      return NextResponse.json({ scanned: 0, ran: 0, results: [] });
    }
    console.error("[CRON_NIGHT_SHIFT]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
