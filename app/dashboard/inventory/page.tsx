"use client";

import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Boxes, Download, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { InventoryProvider } from "@/components/dashboard/inventory/inventory-context";
import { InventoryStats } from "@/components/dashboard/inventory/inventory-stats";
import { InventoryTable } from "@/components/dashboard/inventory/inventory-table";
import { LowStockAlert } from "@/components/dashboard/inventory/low-stock-alert";
import { AddItemModal } from "@/components/dashboard/inventory/add-item-modal";
import { useState } from "react";
import { toast } from "sonner";

export default function InventoryPage() {
  const { activeProject: plan, loading } = useProject();

  if (loading || !plan) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
  }

  // Check project type - Traditional Only
  if (plan.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md bg-muted/20 border-dashed">
          <Boxes size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">مدیریت موجودی برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            ماژول انبارداری اختصاصاً برای کسب‌وکارهای فیزیکی و سنتی طراحی شده است. پروژه شما از نوع دیگری است.
          </p>
          <Link href="/dashboard/overview">
            <Button variant="outline" className="w-full">بازگشت به داشبورد</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <InventoryProvider>
        <InventoryPageContent />
    </InventoryProvider>
  );
}

function InventoryPageContent() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleExportExcel = () => {
        toast.success("در حال آماده‌سازی گزارش...");
        // TODO: Access items from context if needed for export
        setTimeout(() => toast.success("فایل اکسل دانلود شد"), 1000);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Boxes className="w-6 h-6 text-white" />
                    </div>
                    <div>
                    <h1 className="text-2xl font-black text-foreground">مدیریت هوشمند موجودی</h1>
                    <p className="text-muted-foreground text-sm">سیستم جامع انبارداری با قابلیت پیش‌بینی هوشمند</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto">
                    <Button variant="outline" className="gap-2 flex-1 lg:flex-none border-dashed" onClick={handleExportExcel}>
                        <Download size={16} />
                        خروجی اکسل
                    </Button>
                    <Button 
                        className="gap-2 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25 flex-1 lg:flex-none"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus size={18} />
                        کالای جدید
                    </Button>
                </div>
            </div>

            {/* AI Alerts */}
            <LowStockAlert />

            {/* Stats Overview */}
            <InventoryStats />

            {/* Main Table */}
            <InventoryTable />

            {/* Add Item Modal */}
            <AddItemModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
            />
        </div>
    );
}
