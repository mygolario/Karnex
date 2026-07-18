import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse } from "@/lib/traditional/access";
import { computeHealth } from "@/lib/health/server";

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();

    const report = await computeHealth(projectId);
    return NextResponse.json({ report });
  } catch (error) {
    console.error("Health GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
