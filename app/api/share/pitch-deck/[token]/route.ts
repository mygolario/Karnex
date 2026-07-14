import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { PitchDeckSlide } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token || token.length < 8) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const project = await prisma.project.findFirst({
      where: {
        deletedAt: null,
        data: {
          path: ["shareTokens", "pitch-deck"],
          equals: token,
        },
      },
      select: { id: true, projectName: true, data: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = (project.data ?? {}) as Record<string, unknown>;
    const slides = (data.pitchDeck ?? []) as PitchDeckSlide[];

    return NextResponse.json({
      projectName: project.projectName,
      slides,
    });
  } catch (error) {
    console.error("Share pitch deck GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
