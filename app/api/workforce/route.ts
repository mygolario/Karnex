import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import {
  isMissingAgentRunTable,
  listAgentRuns,
  readNightShiftEnabled,
  requireProjectAccess,
} from "@/lib/workforce/store";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const projectId = req.nextUrl.searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId required" }, { status: 400 });
    }

    const project = await requireProjectAccess(projectId, session.user.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const runs = await listAgentRuns(projectId);
    const pendingCount = runs.filter((r) => r.status === "needs_approval").length;
    return NextResponse.json({
      runs,
      pendingCount,
      nightShiftEnabled: readNightShiftEnabled(project.data),
    });
  } catch (error) {
    if (isMissingAgentRunTable(error)) {
      return NextResponse.json({ runs: [], pendingCount: 0, nightShiftEnabled: false });
    }
    console.error("[WORKFORCE_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const projectId = body.projectId as string | undefined;
    if (!projectId || typeof body.nightShiftEnabled !== "boolean") {
      return NextResponse.json({ error: "projectId and nightShiftEnabled required" }, { status: 400 });
    }
    const project = await requireProjectAccess(projectId, session.user.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const data = (project.data as Record<string, unknown>) || {};
    const workforce = {
      ...((data.workforce as Record<string, unknown>) || {}),
      nightShiftEnabled: body.nightShiftEnabled,
      updatedAt: new Date().toISOString(),
    };
    await prisma.project.update({
      where: { id: projectId },
      data: { data: { ...data, workforce } },
    });
    return NextResponse.json({ nightShiftEnabled: body.nightShiftEnabled });
  } catch (error) {
    console.error("[WORKFORCE_PATCH]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
