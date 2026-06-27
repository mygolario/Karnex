import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

async function verifyWriteAccess(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
      OR: [
        { userId },
        { members: { some: { userId, role: { in: ["admin", "editor"] } } } },
      ],
    },
    select: { id: true },
  });
  return !!project;
}

async function verifyReadAccess(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
      OR: [
        { userId },
        { members: { some: { userId } } },
      ],
    },
    select: { id: true },
  });
  return !!project;
}

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

    if (!(await verifyReadAccess(projectId, session.user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const cards = await prisma.card.findMany({
      where: { canvasId },
      orderBy: [{ section: "asc" }, { order: "asc" }],
    });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("Cards GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
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

    if (!(await verifyWriteAccess(projectId, session.user.id))) {
      return NextResponse.json({ error: "No write access" }, { status: 403 });
    }

    const card = await prisma.card.create({
      data: {
        canvasId,
        section: body.section,
        content: body.content || "",
        cardType: body.cardType || "NOTE",
        color: body.color || "blue",
        order: body.order ?? 0,
        x: body.x,
        y: body.y,
        width: body.width,
        height: body.height,
        metadata: body.metadata,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ card });
  } catch (error) {
    console.error("Card POST error:", error);
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
    const { cards } = body as { cards: Array<{ id: string; section?: string; content?: string; color?: string; cardType?: string; order?: number; x?: number; y?: number; metadata?: unknown }> };

    if (!(await verifyWriteAccess(projectId, session.user.id))) {
      return NextResponse.json({ error: "No write access" }, { status: 403 });
    }

    const updatePromises = cards.map((c) =>
      prisma.card.update({
        where: { id: c.id, canvasId },
        data: {
          ...(c.section !== undefined && { section: c.section }),
          ...(c.content !== undefined && { content: c.content }),
          ...(c.color !== undefined && { color: c.color }),
          ...(c.cardType !== undefined && { cardType: c.cardType }),
          ...(c.order !== undefined && { order: c.order }),
          ...(c.x !== undefined && { x: c.x }),
          ...(c.y !== undefined && { y: c.y }),
          ...(c.metadata !== undefined && { metadata: c.metadata as object }),
          updatedBy: session.user!.id,
        },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true, updated: cards.length });
  } catch (error) {
    console.error("Cards PATCH error:", error);
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
    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get("cardId");

    if (!(await verifyWriteAccess(projectId, session.user.id))) {
      return NextResponse.json({ error: "No write access" }, { status: 403 });
    }

    if (cardId) {
      await prisma.card.delete({
        where: { id: cardId, canvasId },
      });
      return NextResponse.json({ success: true });
    }

    const body = await req.json().catch(() => ({}));
    const { cardIds } = body as { cardIds?: string[] };

    if (cardIds && cardIds.length > 0) {
      await prisma.card.deleteMany({
        where: { id: { in: cardIds }, canvasId },
      });
      return NextResponse.json({ success: true, deleted: cardIds.length });
    }

    return NextResponse.json({ error: "cardId or cardIds required" }, { status: 400 });
  } catch (error) {
    console.error("Card DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
