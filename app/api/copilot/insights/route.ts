import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import {
  listInsightsForProject,
  listInsightsForUser,
  generateInsightsForProject,
  countUnreadInsights,
} from "@/lib/copilot/insights";

function isMissingTableError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    ((error as { code: string }).code === "P2021" ||
      (error as { code: string }).code === "P2022")
  );
}

/** GET /api/copilot/insights?projectId=...&includeRead=1&unread=1 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const projectId = req.nextUrl.searchParams.get("projectId");
    const includeRead = req.nextUrl.searchParams.get("includeRead") === "1";
    const unreadOnly = req.nextUrl.searchParams.get("unread") === "1";

    if (unreadOnly) {
      const count = await countUnreadInsights(userId);
      return NextResponse.json({ unread: count });
    }

    let insights;
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, OR: [{ userId }, { members: { some: { userId } } }] },
        select: { id: true },
      });
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
      insights = await listInsightsForProject(projectId, userId, includeRead);
    } else {
      insights = await listInsightsForUser(userId, includeRead);
    }

    return NextResponse.json({ insights });
  } catch (error) {
    if (isMissingTableError(error)) {
      console.warn("[COPILOT_INSIGHTS_GET] insights table unavailable, returning empty");
      const unreadOnly = req.nextUrl.searchParams.get("unread") === "1";
      return NextResponse.json(unreadOnly ? { unread: 0 } : { insights: [] });
    }
    console.error("[COPILOT_INSIGHTS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/** POST /api/copilot/insights { projectId } — regenerate insights for a project */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json().catch(() => ({}));
    const projectId = body.projectId;
    if (!projectId) {
      return NextResponse.json({ error: "projectId required" }, { status: 400 });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, OR: [{ userId }, { members: { some: { userId } } }] },
      select: { id: true },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const generated = await generateInsightsForProject(projectId, userId);
    return NextResponse.json({ generated: generated.length, insights: generated });
  } catch (error) {
    if (isMissingTableError(error)) {
      console.warn("[COPILOT_INSIGHTS_POST] insights table unavailable");
      return NextResponse.json({ generated: 0, insights: [] });
    }
    console.error("[COPILOT_INSIGHTS_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
