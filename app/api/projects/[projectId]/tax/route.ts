import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse } from "@/lib/traditional/access";
import { estimateTax } from "@/lib/tax/server";

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();

    const estimate = await estimateTax(projectId);
    return NextResponse.json({ estimate });
  } catch (error) {
    console.error("Tax GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
