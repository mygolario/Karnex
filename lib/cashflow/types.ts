export interface CashFlowReport {
  periodDays: number;
  period: { start: string; end: string };
  totalIncome: number;
  totalExpenses: number;
  net: number;
  avgDailyNet: number;
  avgDailyBurn: number;
  cashBalance: number;
  runwayDays: number | null;
  projection: {
    days30: number;
    days60: number;
    days90: number;
  };
}
