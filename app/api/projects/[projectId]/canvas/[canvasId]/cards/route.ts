import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { dbCardsToState, stateToSyncPayload } from "@/lib/canvas/persistence";
import type { CanvasState } from "@/lib/canvas/types";

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

export async function PUT(
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
    const {
      state,
      layout,
    } = body as {
      state: CanvasState;
      layout?: { connections?: unknown[]; viewMode?: string };
    };

    if (!(await verifyWriteAccess(projectId, session.user.id))) {
      return NextResponse.json({ error: "No write access" }, { status: 403 });
    }

    const canvas = await prisma.canvas.findFirst({
      where: { id: canvasId, projectId },
      select: { id: true },
    });
    if (!canvas) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    const syncCards = stateToSyncPayload(state);
    const incomingIds = new Set(syncCards.map((c) => c.id));

    const existing = await prisma.card.findMany({
      where: { canvasId },
      select: { id: true },
    });
    const toDelete = existing.filter((e) => !incomingIds.has(e.id)).map((e) => e.id);

    await prisma.$transaction(async (tx) => {
      if (toDelete.length > 0) {
        await tx.card.deleteMany({ where: { id: { in: toDelete }, canvasId } });
      }

      for (const card of syncCards) {
        await tx.card.upsert({
          where: { id: card.id },
          create: {
            id: card.id,
            canvasId,
            section: card.section,
            content: card.content,
            cardType: card.cardType,
            color: card.color,
            order: card.order,
            x: card.x,
            y: card.y,
            width: card.width,
            height: card.height,
            metadata: card.metadata ? (card.metadata as object) : undefined,
            createdBy: session.user!.id,
            updatedBy: session.user!.id,
          },
          update: {
            section: card.section,
            content: card.content,
            cardType: card.cardType,
            color: card.color,
            order: card.order,
            x: card.x,
            y: card.y,
            width: card.width,
            height: card.height,
            metadata: card.metadata ? (card.metadata as object) : undefined,
            updatedBy: session.user!.id,
          },
        });
      }

      if (layout !== undefined) {
        await tx.canvas.update({
          where: { id: canvasId },
          data: { layout: layout as object },
        });
      }
    });

    return NextResponse.json({ success: true, synced: syncCards.length, deleted: toDelete.length });
  } catch (error) {
    console.error("Cards PUT sync error:", error);
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
