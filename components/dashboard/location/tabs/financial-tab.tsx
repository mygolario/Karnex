"use client";

import { FinancialLab } from "../financial-lab";

interface FinancialTabProps {
  initialRent?: number;
}

export function FinancialTab({ initialRent }: FinancialTabProps) {
  return <FinancialLab initialRent={initialRent} />;
}
