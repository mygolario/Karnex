import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { listAppointments, createAppointment } from "@/lib/appointments/server";
import type { AppointmentInput } from "@/lib/appointments/types";

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();

    const appointments = await listAppointments(projectId);
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Appointments GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as AppointmentInput;
    const appointment = await createAppointment(projectId, body);
    return NextResponse.json({ appointment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Appointments POST error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
