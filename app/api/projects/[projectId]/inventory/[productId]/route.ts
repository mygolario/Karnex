import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { updateProduct, deleteProduct } from "@/lib/inventory/server";
import type { ProductInput } from "@/lib/inventory/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; productId: string }> }
) {
  try {
    const { projectId, productId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as Partial<ProductInput>;
    const product = await updateProduct(projectId, productId, body);
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Inventory PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string; productId: string }> }
) {
  try {
    const { projectId, productId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    await deleteProduct(projectId, productId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inventory DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
