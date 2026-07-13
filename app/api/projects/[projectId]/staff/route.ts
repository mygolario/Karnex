import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { listStaff, createStaff, payrollSummary } from "@/lib/staff/server";
import type { StaffInput } from "@/lib/staff/types";

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();

    const [staff, payroll] = await Promise.all([
      listStaff(projectId),
      payrollSummary(projectId),
    ]);

    return NextResponse.json({ staff, payroll });
  } catch (error) {
    console.error("Staff GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as StaffInput;
    if (!body?.name || !body.name.trim()) {
      return NextResponse.json({ error: "نام پرسنل الزامی است" }, { status: 400 });
    }

    const staff = await createStaff(projectId, body);
    return NextResponse.json({ staff });
  } catch (error) {
    console.error("Staff POST error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
