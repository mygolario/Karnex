import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { defaultCanvasTypeForProject } from "@/lib/canvas/persistence";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
        OR: [
          { userId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
      select: { id: true, userId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const canvases = await prisma.canvas.findMany({
      where: { projectId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { cards: true, comments: true },
        },
      },
    });

    return NextResponse.json({ canvases });
  } catch (error) {
    console.error("Canvas GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const body = await req.json();
    const { name, type } = body;

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
      return NextResponse.json({ error: "Project not found or no write access" }, { status: 403 });
    }

    const canvas = await prisma.canvas.create({
      data: {
        projectId,
        name: name || "بوم کسب‌وکار",
        type: type || "BMC",
      },
    });

    return NextResponse.json({ canvas });
  } catch (error) {
    console.error("Canvas POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** Get or create the primary canvas for a project */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const body = await req.json().catch(() => ({}));
    const { projectType, name, type } = body as {
      projectType?: string;
      name?: string;
      type?: string;
    };

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

    let canvas = await prisma.canvas.findFirst({
      where: { projectId },
      orderBy: { createdAt: "asc" },
      include: {
        cards: { orderBy: [{ section: "asc" }, { order: "asc" }] },
        comments: { where: { parentId: null }, orderBy: { createdAt: "desc" } },
        versions: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!canvas) {
      const canvasType = type || defaultCanvasTypeForProject(projectType);
      canvas = await prisma.canvas.create({
        data: {
          projectId,
          name: name || "بوم کسب‌وکار",
          type: canvasType,
        },
        include: {
          cards: { orderBy: [{ section: "asc" }, { order: "asc" }] },
          comments: { where: { parentId: null }, orderBy: { createdAt: "desc" } },
          versions: { orderBy: { createdAt: "desc" }, take: 20 },
        },
      });
      return NextResponse.json({ canvas, created: true });
    }

    return NextResponse.json({ canvas, created: false });
  } catch (error) {
    console.error("Canvas ensure PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
