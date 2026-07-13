"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { taxApi } from "@/lib/tax/api";
import type { TaxEstimate } from "@/lib/tax/types";
import { toPersianDigits } from "@/lib/utils";

const fmt = (n: number) => toPersianDigits(Math.round(n).toLocaleString("fa-IR"));

export default function TaxPage() {
  const { activeProject: plan } = useProject();
  const projectId = plan?.id;
  const [estimate, setEstimate] = useState<TaxEstimate | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await taxApi.get(projectId);
      setEstimate(data.estimate);
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری برآورد مالیات ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  if (plan?.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Receipt size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">برآورد مالیات برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت به داشبورد</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
          <Receipt className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">برآورد مالیات (VAT)</h1>
          <p className="text-sm text-muted-foreground">نرخ تقریبی ۱۰٪ روی درآمد فصل جاری</p>
        </div>
      </div>

      {loading || !estimate ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5">
              <p className="text-sm text-muted-foreground mb-1">دوره</p>
              <p className="text-xl font-bold">{toPersianDigits(estimate.period.label)}</p>
              <Badge variant="secondary" className="mt-2">
                نرخ {toPersianDigits(String(Math.round(estimate.vatRate * 100)))}٪
              </Badge>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground mb-1">درآمد مشمول</p>
              <p className="text-2xl font-bold">{fmt(estimate.taxableIncome)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {toPersianDigits(String(estimate.transactionCount))} تراکنش درآمد
              </p>
            </Card>
            <Card className="p-5 bg-violet-500/5 border-violet-500/20">
              <p className="text-sm text-muted-foreground mb-1">مالیات برآوردی</p>
              <p className="text-2xl font-bold text-violet-600">{fmt(estimate.estimatedVat)}</p>
              <p className="text-xs text-muted-foreground mt-1">تومان</p>
            </Card>
          </div>

          <Card className="p-5 flex gap-3 items-start">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">{estimate.note}</p>
          </Card>
        </>
      )}
    </div>
  );
}
