import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { updatePromotion, deletePromotion } from "@/lib/promotions/server";
import type { PromotionInput } from "@/lib/promotions/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; promoId: string }> }
) {
  try {
    const { projectId, promoId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as Partial<PromotionInput>;
    const promotion = await updatePromotion(projectId, promoId, body);
    return NextResponse.json({ promotion });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Promotions PATCH error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string; promoId: string }> }
) {
  try {
    const { projectId, promoId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    await deletePromotion(projectId, promoId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Promotions DELETE error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
