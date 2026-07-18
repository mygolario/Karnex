import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { listOrders, createOrder, dailyReport } from "@/lib/sales/server";
import type { OrderInput } from "@/lib/sales/types";

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();

    const [orders, report] = await Promise.all([listOrders(projectId), dailyReport(projectId)]);
    return NextResponse.json({ orders, report });
  } catch (error) {
    console.error("Sales GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as OrderInput;
    if (!body?.items?.length) {
      return NextResponse.json({ error: "حداقل یک آیتم برای فروش لازم است" }, { status: 400 });
    }

    const order = await createOrder(projectId, body);
    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Sales POST error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
