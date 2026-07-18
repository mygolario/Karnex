import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { listAccounts, createAccount, summary } from "@/lib/loyalty/server";
import type { LoyaltyAccountInput } from "@/lib/loyalty/types";

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();

    const [accounts, loyaltySummary] = await Promise.all([
      listAccounts(projectId),
      summary(projectId),
    ]);

    return NextResponse.json({ accounts, summary: loyaltySummary });
  } catch (error) {
    console.error("Loyalty GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as LoyaltyAccountInput;
    if (!body?.customerId || !body.customerId.trim()) {
      return NextResponse.json({ error: "شناسه مشتری الزامی است" }, { status: 400 });
    }

    const account = await createAccount(projectId, body);
    return NextResponse.json({ account });
  } catch (error) {
    console.error("Loyalty POST error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("قبلاً") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
