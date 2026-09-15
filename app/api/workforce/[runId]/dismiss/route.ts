import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { isMissingAgentRunTable, requireProjectAccess, toRunDTO } from "@/lib/workforce/store";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ runId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { runId } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const projectId = body.projectId as string | undefined;
    if (!projectId) {
      return NextResponse.json({ error: "projectId required" }, { status: 400 });
    }
    const project = await requireProjectAccess(projectId, session.user.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const row = await prisma.agentRun.findFirst({
      where: { id: runId, projectId },
    });
    if (!row) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }
    if (row.status === "applied") {
      return NextResponse.json({ error: "کار اعمال‌شده را نمی‌توان رد کرد" }, { status: 409 });
    }

    const updated = await prisma.agentRun.update({
      where: { id: runId },
      data: { status: "dismissed", dismissedAt: new Date() },
    });
    return NextResponse.json({ run: toRunDTO(updated) });
  } catch (error) {
    if (isMissingAgentRunTable(error)) {
      return NextResponse.json({ error: "جدول عامل‌ها در دسترس نیست" }, { status: 503 });
    }
    console.error("[WORKFORCE_DISMISS]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
