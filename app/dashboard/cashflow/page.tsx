"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Waves, Loader2, TrendingUp, TrendingDown, Hourglass } from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { cashflowApi } from "@/lib/cashflow/api";
import type { CashFlowReport } from "@/lib/cashflow/types";
import { toPersianDigits } from "@/lib/utils";

const fmt = (n: number) => toPersianDigits(Math.round(n).toLocaleString("fa-IR"));

export default function CashflowPage() {
  const { activeProject: plan } = useProject();
  const projectId = plan?.id;
  const [report, setReport] = useState<CashFlowReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await cashflowApi.get(projectId);
      setReport(data.report);
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری جریان نقدی ناموفق بود");
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
          <Waves size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">جریان نقدی برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت به داشبورد</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
          <Waves className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">جریان نقدی</h1>
          <p className="text-sm text-muted-foreground">۳۰ روز گذشته و پیش‌بینی ۳۰ / ۶۰ / ۹۰ روز</p>
        </div>
      </div>

      {loading || !report ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-5">
              <p className="text-sm text-muted-foreground mb-1">درآمد ۳۰ روز</p>
              <p className="text-2xl font-bold text-emerald-600">{fmt(report.totalIncome)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground mb-1">هزینه ۳۰ روز</p>
              <p className="text-2xl font-bold text-rose-600">{fmt(report.totalExpenses)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground mb-1">خالص</p>
              <p className={`text-2xl font-bold flex items-center gap-2 ${report.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {report.net >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                {fmt(report.net)}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Hourglass size={14} /> روزهای باقی‌مانده</p>
              <p className="text-2xl font-bold">
                {report.runwayDays == null
                  ? "—"
                  : toPersianDigits(String(report.runwayDays))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {report.avgDailyBurn > 0 ? `سوخت روزانه: ${fmt(report.avgDailyBurn)}` : "بدون سوخت نقدی"}
              </p>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="font-bold mb-4">پیش‌بینی خالص بر اساس میانگین روزانه</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "۳۰ روز", value: report.projection.days30 },
                { label: "۶۰ روز", value: report.projection.days60 },
                { label: "۹۰ روز", value: report.projection.days90 },
              ].map((p) => (
                <div key={p.label} className="rounded-xl border border-border p-4 text-center">
                  <Badge variant="secondary" className="mb-2">{p.label}</Badge>
                  <p className={`text-xl font-bold ${p.value >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {fmt(p.value)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">تومان</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              موجودی تقریبی (تجمعی): {fmt(report.cashBalance)} تومان · میانگین روزانه خالص: {fmt(report.avgDailyNet)}
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
