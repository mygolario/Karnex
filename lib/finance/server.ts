import "server-only";
import prisma from "@/lib/prisma";
import type {
  BusinessTransaction,
  BusinessTxInput,
  BusinessTxType,
  PnLLine,
  PnLReport,
} from "./types";

function toTx(t: any): BusinessTransaction {
  return {
    id: t.id,
    projectId: t.projectId,
    type: t.type as BusinessTxType,
    category: t.category,
    amount: t.amount ?? 0,
    date: t.date instanceof Date ? t.date.toISOString() : String(t.date),
    note: t.note ?? null,
    metadata: t.metadata ?? null,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
  };
}

export async function listTransactions(
  projectId: string,
  opts: { from?: Date; to?: Date; type?: BusinessTxType } = {}
): Promise<BusinessTransaction[]> {
  const where: Record<string, unknown> = { projectId };
  if (opts.type) where.type = opts.type;
  if (opts.from || opts.to) {
    where.date = {};
    if (opts.from) (where.date as any).gte = opts.from;
    if (opts.to) (where.date as any).lte = opts.to;
  }
  const rows = await prisma.businessTransaction.findMany({
    where: where as any,
    orderBy: { date: "desc" },
    take: 500,
  });
  return rows.map(toTx);
}

export async function createTransaction(projectId: string, input: BusinessTxInput): Promise<BusinessTransaction> {
  if (!input.type || !["income", "expense", "cogs"].includes(input.type)) {
    throw new Error("نوع تراکنش نامعتبر است");
  }
  if (!input.category || !input.category.trim()) {
    throw new Error("دسته‌بندی الزامی است");
  }
  if (!input.amount || Number(input.amount) <= 0) {
    throw new Error("مبلغ باید بزرگ‌تر از صفر باشد");
  }
  const tx = await prisma.businessTransaction.create({
    data: {
      projectId,
      type: input.type,
      category: input.category.trim(),
      amount: Number(input.amount),
      date: input.date ? new Date(input.date) : new Date(),
      note: input.note ?? null,
      metadata: (input.metadata as any) ?? undefined,
    },
  });
  return toTx(tx);
}

export async function updateTransaction(
  projectId: string,
  txId: string,
  input: Partial<BusinessTxInput>
): Promise<BusinessTransaction> {
  const data: Record<string, unknown> = {};
  if (input.type !== undefined) data.type = input.type;
  if (input.category !== undefined) data.category = input.category.trim();
  if (input.amount !== undefined) data.amount = Number(input.amount);
  if (input.date !== undefined) data.date = new Date(input.date);
  if (input.note !== undefined) data.note = input.note;
  if (input.metadata !== undefined) data.metadata = input.metadata as any;

  const existing = await prisma.businessTransaction.findFirst({ where: { id: txId, projectId } });
  if (!existing) throw new Error("تراکنش یافت نشد");

  const tx = await prisma.businessTransaction.update({
    where: { id: txId },
    data,
  });
  return toTx(tx);
}

export async function deleteTransaction(projectId: string, txId: string): Promise<void> {
  const existing = await prisma.businessTransaction.findFirst({ where: { id: txId, projectId } });
  if (!existing) throw new Error("تراکنش یافت نشد");
  await prisma.businessTransaction.delete({ where: { id: txId } });
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function persianMonthLabel(year: number, month: number): string {
  // Approximate Jalali month names keyed by Gregorian month index for display.
  const names = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
  ];
  return names[month] ?? `${month + 1}`;
}

function aggregate(lines: { category: string; amount: number }[]): PnLLine[] {
  const map = new Map<string, number>();
  for (const l of lines) {
    map.set(l.category, (map.get(l.category) ?? 0) + l.amount);
  }
  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Builds a P&L report for the month containing `ref` (defaults to current month),
 * plus a 6-month trend (income / expenses / net) ending in that month.
 * Expenses here = type "expense" + "cogs".
 */
export async function getPnLReport(projectId: string, ref: Date = new Date()): Promise<PnLReport> {
  const monthStart = startOfMonth(ref);
  const monthEnd = endOfMonth(ref);

  const rows = await prisma.businessTransaction.findMany({
    where: { projectId, date: { gte: startOfMonth(new Date(ref.getFullYear(), ref.getMonth() - 5, 1)) } },
    orderBy: { date: "asc" },
  });

  const inMonth = rows.filter((r) => r.date >= monthStart && r.date <= monthEnd);
  const income = aggregate(inMonth.filter((r) => r.type === "income"));
  const expenses = aggregate(inMonth.filter((r) => r.type === "expense"));
  const cogs = aggregate(inMonth.filter((r) => r.type === "cogs"));

  const totalIncome = income.reduce((a, l) => a + l.amount, 0);
  const totalExpenses = expenses.reduce((a, l) => a + l.amount, 0);
  const totalCogs = cogs.reduce((a, l) => a + l.amount, 0);
  const grossProfit = totalIncome - totalCogs;
  const netProfit = totalIncome - totalExpenses - totalCogs;
  const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  // 6-month trend
  const trend: PnLReport["trend"] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    const s = startOfMonth(d);
    const e = endOfMonth(d);
    const monthRows = rows.filter((r) => r.date >= s && r.date <= e);
    const inc = monthRows.filter((r) => r.type === "income").reduce((a, r) => a + r.amount, 0);
    const exp = monthRows.filter((r) => r.type === "expense" || r.type === "cogs").reduce((a, r) => a + r.amount, 0);
    trend.push({ label: persianMonthLabel(d.getFullYear(), d.getMonth()), income: inc, expenses: exp, net: inc - exp });
  }

  return {
    period: {
      start: monthStart.toISOString(),
      end: monthEnd.toISOString(),
      label: `${persianMonthLabel(ref.getFullYear(), ref.getMonth())} ${ref.getFullYear()}`,
    },
    income,
    totalIncome,
    expenses,
    totalExpenses,
    cogs,
    totalCogs,
    grossProfit,
    netProfit,
    margin,
    trend,
  };
}
