import "server-only";
import prisma from "@/lib/prisma";
import type { CashFlowReport } from "./types";

const LOOKBACK_DAYS = 30;

/**
 * Computes cash-flow from BusinessTransaction for the last 30 days,
 * projects net for 30/60/90 days from average daily net, and runway when burning.
 */
export async function getCashFlowReport(projectId: string): Promise<CashFlowReport> {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - LOOKBACK_DAYS);
  start.setHours(0, 0, 0, 0);

  const [periodRows, allRows] = await Promise.all([
    prisma.businessTransaction.findMany({
      where: { projectId, date: { gte: start, lte: end } },
      select: { type: true, amount: true },
    }),
    prisma.businessTransaction.findMany({
      where: { projectId },
      select: { type: true, amount: true },
    }),
  ]);

  const sumBy = (rows: { type: string; amount: number }[], types: string[]) =>
    rows.filter((r) => types.includes(r.type)).reduce((a, r) => a + (r.amount ?? 0), 0);

  const totalIncome = sumBy(periodRows, ["income"]);
  const totalExpenses = sumBy(periodRows, ["expense", "cogs"]);
  const net = totalIncome - totalExpenses;
  const avgDailyNet = net / LOOKBACK_DAYS;
  const avgDailyBurn = avgDailyNet < 0 ? Math.abs(avgDailyNet) : 0;

  const allIncome = sumBy(allRows, ["income"]);
  const allExpenses = sumBy(allRows, ["expense", "cogs"]);
  const cashBalance = allIncome - allExpenses;

  let runwayDays: number | null = null;
  if (avgDailyBurn > 0) {
    runwayDays = cashBalance > 0 ? Math.floor(cashBalance / avgDailyBurn) : 0;
  }

  return {
    periodDays: LOOKBACK_DAYS,
    period: { start: start.toISOString(), end: end.toISOString() },
    totalIncome,
    totalExpenses,
    net,
    avgDailyNet,
    avgDailyBurn,
    cashBalance,
    runwayDays,
    projection: {
      days30: avgDailyNet * 30,
      days60: avgDailyNet * 60,
      days90: avgDailyNet * 90,
    },
  };
}
