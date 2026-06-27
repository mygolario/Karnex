import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string; canvasId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, canvasId } = await params;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
        OR: [
          { userId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const canvas = await prisma.canvas.findFirst({
      where: { id: canvasId, projectId },
      include: {
        cards: { orderBy: { order: "asc" } },
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: "desc" },
        },
        versions: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!canvas) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    return NextResponse.json({ canvas });
  } catch (error) {
    console.error("Canvas detail GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; canvasId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, canvasId } = await params;
    const body = await req.json();
    const { name, type, viewport } = body;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
        OR: [
          { userId: session.user.id },
          { members: { some: { userId: session.user.id, role: { in: ["admin", "editor"] } } } },
        ],
      },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: "No write access" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (viewport !== undefined) updateData.viewport = viewport;

    const canvas = await prisma.canvas.update({
      where: { id: canvasId, projectId },
      data: updateData,
    });

    return NextResponse.json({ canvas });
  } catch (error) {
    console.error("Canvas PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string; canvasId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, canvasId } = await params;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
        OR: [
          { userId: session.user.id },
          { members: { some: { userId: session.user.id, role: "admin" } } },
        ],
      },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: "No delete access" }, { status: 403 });
    }

    await prisma.canvas.delete({
      where: { id: canvasId, projectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Canvas DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
