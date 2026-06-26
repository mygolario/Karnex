/**
 * Recover pending or failed Plus payments by re-verifying with Zibal.
 *
 * Usage (requires DATABASE_URL + ZIBAL_MERCHANT in env):
 *   npx tsx scripts/recover-pending-payments.ts
 *   npx tsx scripts/recover-pending-payments.ts --trackId=4647029998
 */

import "dotenv/config";
import prisma from "../lib/prisma";
import { verifyPaymentAction } from "../lib/payment-actions";

async function main() {
  const trackIdArg = process.argv.find((a) => a.startsWith("--trackId="))?.split("=")[1];

  const where = trackIdArg
    ? { trackId: trackIdArg }
    : {
        planId: "plus",
        status: { in: ["pending", "failed"] as string[] },
        trackId: { not: null },
      };

  const transactions = await prisma.transaction.findMany({
    where,
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (transactions.length === 0) {
    console.log("No recoverable transactions found.");
    return;
  }

  console.log(`Found ${transactions.length} transaction(s) to recover.\n`);

  for (const tx of transactions) {
    if (!tx.trackId) continue;

    console.log(`--- ${tx.id} (${tx.user?.email}) trackId=${tx.trackId} status=${tx.status}`);

    if (tx.status === "failed") {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { status: "pending" },
      });
      console.log("  Reset failed → pending");
    }

    const result = await verifyPaymentAction(tx.trackId);
    if (result.success) {
      console.log(`  ✅ Activated: ${result.planName} (receipt: ${result.transactionId})`);
    } else {
      console.log(`  ❌ Failed: ${result.message}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
