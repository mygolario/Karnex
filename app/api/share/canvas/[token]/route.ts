import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { dbCardsToState, parseCanvasLayout } from "@/lib/canvas/persistence";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token || token.length < 8) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Indexed JSON path lookup — avoids full-table scan
    const project = await prisma.project.findFirst({
      where: {
        deletedAt: null,
        data: {
          path: ["shareTokens", "canvas"],
          equals: token,
        },
      },
      select: { id: true, projectName: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const canvas = await prisma.canvas.findFirst({
      where: { projectId: project.id },
      include: { cards: { orderBy: [{ section: "asc" }, { order: "asc" }] } },
    });

    if (!canvas) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    const layout = parseCanvasLayout(canvas.layout);
    return NextResponse.json({
      projectName: project.projectName,
      canvasType: canvas.type,
      state: dbCardsToState(canvas.cards),
      connections: layout.connections ?? [],
      viewMode: layout.viewMode ?? "grid",
    });
  } catch (error) {
    console.error("Share canvas GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
