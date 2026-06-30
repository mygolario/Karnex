import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { promoteCanvasCardToRoadmapTask } from "@/lib/canvas/roadmap-sync";
import type { RoadmapPhase } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const body = await req.json();
    const { cardId, sectionId, itemId, taskTitle, phaseIndex = 0 } = body as {
      cardId: string;
      sectionId: string;
      itemId?: string;
      taskTitle: string;
      phaseIndex?: number;
    };

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
        OR: [
          { userId: session.user.id },
          { members: { some: { userId: session.user.id, role: { in: ["admin", "editor"] } } } },
        ],
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const data = (project.data ?? {}) as Record<string, unknown>;
    const roadmap = (data.roadmap ?? []) as RoadmapPhase[];

    const { roadmap: updatedRoadmap, stepId } = promoteCanvasCardToRoadmapTask(
      roadmap,
      taskTitle,
      phaseIndex,
      { canvasCardId: cardId, checklistItemId: itemId }
    );

    await prisma.project.update({
      where: { id: projectId },
      data: {
        data: {
          ...data,
          roadmap: updatedRoadmap,
        } as object,
      },
    });

    if (itemId && cardId) {
      const canvas = await prisma.canvas.findFirst({ where: { projectId } });
      if (canvas) {
        const card = await prisma.card.findFirst({ where: { id: cardId, canvasId: canvas.id } });
        if (card) {
          const meta = (card.metadata ?? {}) as Record<string, unknown>;
          const items = (meta.items as Array<Record<string, unknown>> | undefined) ?? [];
          const updatedItems = items.map((it) =>
            it.id === itemId ? { ...it, roadmapStepId: stepId } : it
          );
          await prisma.card.update({
            where: { id: cardId },
            data: { metadata: { ...meta, items: updatedItems } as object },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      task: { id: stepId, title: taskTitle },
      sectionId,
    });
  } catch (error) {
    console.error("Promote task error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
