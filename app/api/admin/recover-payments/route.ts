import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminResult } from "@/lib/admin/require-admin";
import { writeAdminAudit } from "@/lib/admin/audit";
import { verifyPaymentAction } from "@/lib/payment-actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Admin-only: re-verify pending/failed Zibal transactions and activate subscriptions.
 * POST body: { trackId?: string } — omit to recover pending/failed plus txs with trackId
 */
export async function POST(req: Request) {
  const gate = await requireAdminResult();
  if (!gate.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const trackIdFilter = body.trackId as string | undefined;

  const transactions = await prisma.transaction.findMany({
    where: trackIdFilter
      ? { trackId: trackIdFilter }
      : {
          planId: "plus",
          status: { in: ["pending", "failed"] },
          trackId: { not: null },
        },
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const results = [];

  for (const tx of transactions) {
    if (!tx.trackId) continue;

    if (tx.status === "failed") {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { status: "pending" },
      });
    }

    const result = await verifyPaymentAction(tx.trackId);
    results.push({
      transactionId: tx.id,
      email: tx.user?.email,
      trackId: tx.trackId,
      ...result,
    });
  }

  await writeAdminAudit({
    actorId: gate.user.id,
    action: "recover_payments",
    targetType: "Transaction",
    targetId: trackIdFilter ?? null,
    meta: { recovered: results.length, trackIdFilter: trackIdFilter ?? null },
  });

  return NextResponse.json({ recovered: results.length, results });
}
