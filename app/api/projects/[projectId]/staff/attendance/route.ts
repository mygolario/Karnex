import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { checkIn, checkOut } from "@/lib/staff/server";
import type { AttendanceInput } from "@/lib/staff/types";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as AttendanceInput;
    if (!body?.staffId || (body.action !== "in" && body.action !== "out")) {
      return NextResponse.json(
        { error: "staffId و action (in|out) الزامی است" },
        { status: 400 }
      );
    }

    const entry =
      body.action === "in"
        ? await checkIn(projectId, body)
        : await checkOut(projectId, body);

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Attendance POST error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
