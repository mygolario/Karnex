import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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
