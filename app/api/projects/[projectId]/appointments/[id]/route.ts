import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { updateAppointment } from "@/lib/appointments/server";
import type { AppointmentInput } from "@/lib/appointments/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; id: string }> }
) {
  try {
    const { projectId, id } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as Partial<AppointmentInput>;
    const appointment = await updateAppointment(projectId, id, body);
    return NextResponse.json({ appointment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Appointments PATCH error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
