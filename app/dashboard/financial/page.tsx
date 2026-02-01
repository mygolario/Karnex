"use client";

import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { RunwayCalculator } from "@/components/features/financial/runway-calculator";
import { BreakEvenCalculator } from "@/components/features/financial/breakeven-calculator";
import { RateCardCalculator } from "@/components/features/financial/rate-card";
import { Coins, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FinancialPage() {
  const { activeProject: plan, loading } = useProject();

  if (loading || !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-muted-foreground">در حال بارگذاری ابزارهای مالی...</p>
      </div>
    );
  }

  // Determine which tool to show based on project type
  const renderFinancialTool = () => {
    switch (plan.projectType) {
        case 'traditional':
            return <BreakEvenCalculator />;
        case 'creator':
            return <RateCardCalculator />;
        case 'startup':
        default:
            return <RunwayCalculator />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Coins size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-black text-foreground">مدیریت مالی</h1>
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                        {plan.projectType === 'creator' ? 'ابزار درآمدی' : 'ابزار محاسباتی'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                        ویژه {plan.projectType === 'startup' ? 'استارتاپ‌ها' : 
                              plan.projectType === 'creator' ? 'کریتورها' : 'کسب‌وکارهای سنتی'}
                    </span>
                </div>
            </div>
        </div>

        {/* Content */}
        {renderFinancialTool()}
    </div>
  );
}
