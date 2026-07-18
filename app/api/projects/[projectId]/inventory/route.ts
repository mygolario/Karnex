import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { listProducts, listSuppliers, getInventorySummary, createProduct } from "@/lib/inventory/server";
import type { ProductInput } from "@/lib/inventory/types";

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();

    const [products, suppliers, summary] = await Promise.all([
      listProducts(projectId),
      listSuppliers(projectId),
      getInventorySummary(projectId),
    ]);

    return NextResponse.json({ products, suppliers, summary });
  } catch (error) {
    console.error("Inventory GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as ProductInput;
    if (!body?.name || !body.name.trim()) {
      return NextResponse.json({ error: "نام محصول الزامی است" }, { status: 400 });
    }

    const product = await createProduct(projectId, body);
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Inventory POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
