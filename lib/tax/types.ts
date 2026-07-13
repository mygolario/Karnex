export interface TaxEstimate {
  vatRate: number;
  period: { start: string; end: string; label: string };
  taxableIncome: number;
  estimatedVat: number;
  transactionCount: number;
  note: string;
}
