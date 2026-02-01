"use client";

import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { CapTableManager } from "@/components/features/operations/cap-table";
import { InventoryTracker } from "@/components/features/operations/inventory-tracker";
import { ContentCalendar } from "@/components/features/operations/content-calendar";
import { Briefcase, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function OperationsPage() {
  const { activeProject: plan, loading } = useProject();

  if (loading || !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-muted-foreground">در حال بارگذاری ابزارهای عملیاتی...</p>
      </div>
    );
  }

  // Determine which tool to show based on project type
  const renderOperationalTool = () => {
    switch (plan.projectType) {
        case 'traditional':
            return <InventoryTracker />;
        case 'creator':
            return <ContentCalendar />;
        case 'startup':
        default:
            return <CapTableManager />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Briefcase size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-black text-foreground">مدیریت عملیات</h1>
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                        {plan.projectType === 'creator' ? 'تولید محتوا' : plan.projectType === 'traditional' ? 'انبارداری' : 'سهام‌داران'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                        ابزار اختصاصی {plan.projectType === 'startup' ? 'استارتاپ‌ها' : 
                              plan.projectType === 'creator' ? 'کریتورها' : 'کسب‌وکارهای سنتی'}
                    </span>
                </div>
            </div>
        </div>

        {/* Content */}
        {renderOperationalTool()}
    </div>
  );
}
