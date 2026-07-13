import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { updateStaff, deleteStaff } from "@/lib/staff/server";
import type { StaffInput } from "@/lib/staff/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; staffId: string }> }
) {
  try {
    const { projectId, staffId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as Partial<StaffInput>;
    const staff = await updateStaff(projectId, staffId, body);
    return NextResponse.json({ staff });
  } catch (error) {
    console.error("Staff PATCH error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("یافت نشد") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string; staffId: string }> }
) {
  try {
    const { projectId, staffId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    await deleteStaff(projectId, staffId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Staff DELETE error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("یافت نشد") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
