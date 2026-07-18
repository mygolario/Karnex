export type BusinessTxType = "income" | "expense" | "cogs";

export interface BusinessTransaction {
  id: string;
  projectId: string;
  type: BusinessTxType;
  category: string;
  amount: number;
  date: string;
  note: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface BusinessTxInput {
  type: BusinessTxType;
  category: string;
  amount: number;
  date?: string;
  note?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface PnLLine {
  category: string;
  amount: number;
}

export interface PnLReport {
  period: { start: string; end: string; label: string };
  income: PnLLine[];
  totalIncome: number;
  expenses: PnLLine[];
  totalExpenses: number;
  cogs: PnLLine[];
  totalCogs: number;
  grossProfit: number;
  netProfit: number;
  margin: number;
  trend: { label: string; income: number; expenses: number; net: number }[];
}

export const DEFAULT_EXPENSE_CATEGORIES = [
  "اجاره",
  "حقوق و دستمزد",
  "قبوض",
  "تأمین کالا",
  "بازاریابی",
  "نگهداری و تعمیرات",
  "مالیات",
  "سایر",
];

export const DEFAULT_INCOME_CATEGORIES = [
  "فروش محصول",
  "فروش خدمات",
  "فروش آنلاین",
  "سایر درآمد",
];
