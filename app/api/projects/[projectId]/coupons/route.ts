import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { listCoupons, createCoupon } from "@/lib/coupons/server";
import type { CouponInput } from "@/lib/coupons/types";

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();

    const coupons = await listCoupons(projectId);
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Coupons GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as CouponInput;
    const coupon = await createCoupon(projectId, body);
    return NextResponse.json({ coupon });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Coupons POST error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
