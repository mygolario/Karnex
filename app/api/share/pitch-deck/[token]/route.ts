import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { PitchDeckSlide } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const projects = await prisma.project.findMany({
      where: { deletedAt: null },
      select: { id: true, projectName: true, data: true },
    });

    const project = projects.find((p) => {
      const data = (p.data ?? {}) as Record<string, unknown>;
      const shareTokens = (data.shareTokens ?? {}) as Record<string, string>;
      return shareTokens["pitch-deck"] === token;
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
