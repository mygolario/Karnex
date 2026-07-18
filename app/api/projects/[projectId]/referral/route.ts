import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { listReferrals, createReferral } from "@/lib/referral/server";
import type { ReferralInput } from "@/lib/referral/types";

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();

    const referrals = await listReferrals(projectId);
    return NextResponse.json({ referrals });
  } catch (error) {
    console.error("Referral GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json().catch(() => ({}))) as ReferralInput;
    const referral = await createReferral(projectId, body);
    return NextResponse.json({ referral });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Referral POST error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
