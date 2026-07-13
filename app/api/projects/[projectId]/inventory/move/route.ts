import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { recordStockMovement } from "@/lib/inventory/server";
import type { StockMovementInput } from "@/lib/inventory/types";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as StockMovementInput;
    if (!body?.productId) {
      return NextResponse.json({ error: "productId الزامی است" }, { status: 400 });
    }
    if (!body?.type || !["in", "out", "adjust"].includes(body.type)) {
      return NextResponse.json({ error: "type نامعتبر است" }, { status: 400 });
    }

    const result = await recordStockMovement(projectId, body);
    return NextResponse.json({ product: result.product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Inventory move error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
