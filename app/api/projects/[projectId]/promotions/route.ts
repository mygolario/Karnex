import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { listPromotions, createPromotion } from "@/lib/promotions/server";
import type { PromotionInput } from "@/lib/promotions/types";

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();

    const promotions = await listPromotions(projectId);
    return NextResponse.json({ promotions });
  } catch (error) {
    console.error("Promotions GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as PromotionInput;
    if (!body?.title?.trim()) {
      return NextResponse.json({ error: "عنوان کمپین الزامی است" }, { status: 400 });
    }

    const promotion = await createPromotion(projectId, body);
    return NextResponse.json({ promotion });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Promotions POST error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
