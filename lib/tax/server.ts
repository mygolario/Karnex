import "server-only";
import prisma from "@/lib/prisma";
import type { TaxEstimate } from "./types";

/** Iran VAT-style flat rate used for local estimates (not official filing). */
export const VAT_RATE = 0.1;

function quarterBounds(ref: Date = new Date()): { start: Date; end: Date; label: string } {
  const q = Math.floor(ref.getMonth() / 3);
  const start = new Date(ref.getFullYear(), q * 3, 1);
  const end = new Date(ref.getFullYear(), q * 3 + 3, 0, 23, 59, 59, 999);
  const labels = ["Q1", "Q2", "Q3", "Q4"];
  return {
    start,
    end,
    label: `${labels[q]} ${ref.getFullYear()}`,
  };
}

/**
 * Estimates VAT (۱۰٪) from income BusinessTransactions in the current Gregorian quarter.
 */
export async function estimateTax(projectId: string, ref: Date = new Date()): Promise<TaxEstimate> {
  const { start, end, label } = quarterBounds(ref);

  const rows = await prisma.businessTransaction.findMany({
    where: {
      projectId,
      type: "income",
      date: { gte: start, lte: end },
    },
    select: { amount: true },
  });

  const taxableIncome = rows.reduce((a, r) => a + (r.amount ?? 0), 0);
  const estimatedVat = Math.round(taxableIncome * VAT_RATE);

  return {
    vatRate: VAT_RATE,
    period: { start: start.toISOString(), end: end.toISOString(), label },
    taxableIncome,
    estimatedVat,
    transactionCount: rows.length,
    note: "برآورد تقریبی مالیات بر ارزش افزوده ۱۰٪ بر اساس درآمد ثبت‌شده در این فصل. جایگزین اظهارنامه رسمی نیست.",
  };
}
