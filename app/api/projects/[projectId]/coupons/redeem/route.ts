import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { redeemCoupon } from "@/lib/coupons/server";
import type { RedeemInput } from "@/lib/coupons/types";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as RedeemInput;
    const result = await redeemCoupon(projectId, body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Coupons redeem error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
