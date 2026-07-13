import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { applyPointsDelta } from "@/lib/loyalty/server";
import type { PointsInput } from "@/lib/loyalty/types";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as PointsInput;
    if (!body?.accountId || body.delta == null || Number(body.delta) === 0) {
      return NextResponse.json(
        { error: "accountId و delta غیرصفر الزامی است" },
        { status: 400 }
      );
    }

    const result = await applyPointsDelta(projectId, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Loyalty points POST error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("یافت نشد")
      ? 404
      : message.includes("کافی")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
