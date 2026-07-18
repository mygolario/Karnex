import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { listShifts, createShift } from "@/lib/staff/server";
import type { ShiftInput } from "@/lib/staff/types";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();

    const url = new URL(req.url);
    const weekStart = url.searchParams.get("weekStart") || undefined;
    const shifts = await listShifts(projectId, { weekStart });
    return NextResponse.json({ shifts });
  } catch (error) {
    console.error("Shifts GET error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as ShiftInput;
    if (!body?.staffId || !body?.startAt || !body?.endAt) {
      return NextResponse.json({ error: "پرسنل، شروع و پایان شیفت الزامی است" }, { status: 400 });
    }

    const shift = await createShift(projectId, body);
    return NextResponse.json({ shift });
  } catch (error) {
    console.error("Shifts POST error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
