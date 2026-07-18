import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { listTransactions, createTransaction, getPnLReport } from "@/lib/finance/server";
import type { BusinessTxInput } from "@/lib/finance/types";

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();

    const [transactions, pnl] = await Promise.all([
      listTransactions(projectId),
      getPnLReport(projectId),
    ]);

    return NextResponse.json({ transactions, pnl });
  } catch (error) {
    console.error("Finance GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as BusinessTxInput;
    const transaction = await createTransaction(projectId, body);
    return NextResponse.json({ transaction });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Finance POST error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
