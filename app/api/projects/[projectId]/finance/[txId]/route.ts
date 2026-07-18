import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { updateTransaction, deleteTransaction } from "@/lib/finance/server";
import type { BusinessTxInput } from "@/lib/finance/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; txId: string }> }
) {
  try {
    const { projectId, txId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as Partial<BusinessTxInput>;
    const transaction = await updateTransaction(projectId, txId, body);
    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Finance PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string; txId: string }> }
) {
  try {
    const { projectId, txId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    await deleteTransaction(projectId, txId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Finance DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
