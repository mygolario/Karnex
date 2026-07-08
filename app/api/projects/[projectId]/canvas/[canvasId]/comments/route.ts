import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

async function verifyAccess(projectId: string, userId: string, requireWrite: boolean) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
      OR: requireWrite
        ? [
            { userId },
            { members: { some: { userId, role: { in: ["admin", "editor"] } } } },
          ]
        : [
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

    if (!(await verifyAccess(projectId, session.user.id, false))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { canvasId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Comments GET error:", error);
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

    if (!(await verifyAccess(projectId, session.user.id, true))) {
      return NextResponse.json({ error: "No write access" }, { status: 403 });
    }

    const comment = await prisma.comment.create({
      data: {
        canvasId,
        cardId: body.cardId || null,
        authorId: session.user.id,
        authorName: session.user.name || "کاربر",
        authorAvatar: session.user.image || null,
        body: body.body,
        parentId: body.parentId || null,
      },
    });

    // Notify project/canvas owner and/or parent comment author
    try {
      const canvasObj = await prisma.canvas.findUnique({
        where: { id: canvasId },
        select: {
          name: true,
          project: {
            select: {
              userId: true,
              projectName: true,
            }
          }
        }
      });

      const { createNotification } = await import("@/lib/notifications");

      // 1. Notify parent comment author if it is a reply
      if (body.parentId) {
        const parentComment = await prisma.comment.findUnique({
          where: { id: body.parentId },
          select: { authorId: true }
        });
        if (parentComment?.authorId && parentComment.authorId !== session.user.id) {
          await createNotification(parentComment.authorId, {
            type: "info",
            title: "پاسخ به دیدگاه شما 💬",
            message: `همکار شما «${session.user.name || "کاربر کارنکس"}» به دیدگاه شما در بوم «${canvasObj?.name || "بوم کسب‌وکار"}» پاسخ داد.`,
            action: { label: "مشاهده بوم", href: `/dashboard/canvas?id=${canvasId}` },
            category: "roadmap"
          });
        }
      }

      // 2. Notify the canvas owner (if they are not the author of this comment)
      if (canvasObj?.project?.userId && canvasObj.project.userId !== session.user.id) {
        await createNotification(canvasObj.project.userId, {
          type: "info",
          title: "دیدگاه جدید روی بوم 💬",
          message: `همکار شما «${session.user.name || "کاربر کارنکس"}» دیدگاهی روی بوم «${canvasObj.name}» پروژه «${canvasObj.project.projectName}» ثبت کرد.`,
          action: { label: "مشاهده بوم", href: `/dashboard/canvas?id=${canvasId}` },
          category: "roadmap"
        });
      }
    } catch (inAppErr) {
      console.error("Failed to trigger in-app notification for comment:", inAppErr);
    }

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Comment POST error:", error);
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
    const { commentId, resolved, body: newBody } = body;

    if (!(await verifyAccess(projectId, session.user.id, true))) {
      return NextResponse.json({ error: "No write access" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (resolved !== undefined) updateData.resolved = resolved;
    if (newBody !== undefined) updateData.body = newBody;

    const comment = await prisma.comment.update({
      where: { id: commentId, canvasId },
      data: updateData,
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Comment PATCH error:", error);
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
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json({ error: "commentId required" }, { status: 400 });
    }

    if (!(await verifyAccess(projectId, session.user.id, true))) {
      return NextResponse.json({ error: "No write access" }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id: commentId, canvasId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comment DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
