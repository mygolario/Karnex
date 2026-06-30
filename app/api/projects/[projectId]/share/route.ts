import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

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
    const { type } = body as { type: "canvas" | "pitch-deck" };

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const data = (project.data ?? {}) as Record<string, unknown>;
    const shareTokens = (data.shareTokens ?? {}) as Record<string, string>;
    const token = shareTokens[type] || crypto.randomBytes(16).toString("hex");

    shareTokens[type] = token;

    await prisma.project.update({
      where: { id: projectId },
      data: { data: { ...data, shareTokens } },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const path = type === "canvas" ? `/share/canvas/${token}` : `/share/pitch-deck/${token}`;

    return NextResponse.json({
      success: true,
      token,
      url: `${baseUrl}${path}`,
    });
  } catch (error) {
    console.error("Share token error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
