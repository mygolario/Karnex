import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/session";

/** GET /api/copilot/memory?projectId=... — read a project's long-term memory */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId required" }, { status: 400 });
    }

    // RLS: user must own or be a member of the project.
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ userId }, { members: { some: { userId } } }],
      },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    const memory = await prisma.projectMemory.findUnique({ where: { projectId } });
    return NextResponse.json({
      memory: memory
        ? {
            decisions: memory.decisions,
            openQuestions: memory.openQuestions,
            risks: memory.risks,
            keyFacts: memory.keyFacts,
            updatedAt: memory.updatedAt.getTime(),
          }
        : null,
    });
  } catch (error: any) {
    console.error("Get memory error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
