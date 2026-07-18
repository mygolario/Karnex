"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { healthApi } from "@/lib/health/api";
import { financeApi } from "@/lib/finance/api";
import { inventoryApi } from "@/lib/inventory/api";
import type { HealthReport } from "@/lib/health/types";
import type { PnLReport } from "@/lib/finance/types";
import type { InventorySummary } from "@/lib/inventory/types";
import { toPersianDigits } from "@/lib/utils";

const fmt = (n: number) => toPersianDigits(Math.round(n).toLocaleString("fa-IR"));

interface MonthlyNarrative {
  summary?: string;
  highlights?: string[];
  risks?: string[];
  nextMonthFocus?: string[];
}

export default function MonthlyReviewPage() {
  const { activeProject: plan } = useProject();
  const projectId = plan?.id;

  const [health, setHealth] = useState<HealthReport | null>(null);
  const [pnl, setPnl] = useState<PnLReport | null>(null);
  const [inventory, setInventory] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [narrative, setNarrative] = useState<MonthlyNarrative | null>(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [h, f, inv] = await Promise.all([
        healthApi.get(projectId).catch(() => null),
        financeApi.list(projectId).catch(() => null),
        inventoryApi.list(projectId).catch(() => null),
      ]);
      if (h) setHealth(h.report);
      if (f) setPnl(f.pnl);
      if (inv) setInventory(inv.summary);
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری داده‌های ماهانه ناموفق بود");
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
          <FileText size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">مرور ماهانه برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت به داشبورد</Button></Link>
        </Card>
      </div>
    );
  }

  const runReview = async () => {
    const report = {
      health,
      pnl: pnl
        ? {
            period: pnl.period,
            totalIncome: pnl.totalIncome,
            totalExpenses: pnl.totalExpenses,
            totalCogs: pnl.totalCogs,
            netProfit: pnl.netProfit,
            margin: pnl.margin,
            trend: pnl.trend,
          }
        : null,
      inventory,
    };
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "monthly-review",
          report,
          activeProject: plan,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      setNarrative(data.narrative || data.review || data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در تولید مرور AI");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مرور ماهانه AI</h1>
            <p className="text-sm text-muted-foreground">سلامت + سود و زیان + موجودی در یک روایت</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading} className="gap-2">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> بروزرسانی
          </Button>
          <Button onClick={runReview} disabled={aiLoading || loading} className="gap-2">
            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            تولید مرور
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground mb-1">سلامت</p>
            <p className="text-2xl font-bold">
              {health ? toPersianDigits(String(health.score)) : "—"}
            </p>
            {health && <Badge className="mt-2" variant="secondary">{health.verdictLabel}</Badge>}
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground mb-1">سود خالص ماه</p>
            <p className="text-2xl font-bold">{pnl ? fmt(pnl.netProfit) : "—"}</p>
            {pnl && (
              <p className="text-xs text-muted-foreground mt-1">
                درآمد {fmt(pnl.totalIncome)} · حاشیه {toPersianDigits(String(Math.round(pnl.margin)))}٪
              </p>
            )}
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground mb-1">موجودی</p>
            <p className="text-2xl font-bold">
              {inventory ? toPersianDigits(String(inventory.totalProducts)) : "—"}
            </p>
            {inventory && (
              <p className="text-xs text-muted-foreground mt-1">
                کمبود: {toPersianDigits(String(inventory.lowStockCount))} · اتمام: {toPersianDigits(String(inventory.outOfStockCount))}
              </p>
            )}
          </Card>
        </div>
      )}

      {narrative && (
        <Card className="p-6 space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" /> روایت ماهانه
          </h2>
          {narrative.summary && (
            <p className="leading-relaxed text-foreground/90">{narrative.summary}</p>
          )}
          {narrative.highlights && narrative.highlights.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">نکات مثبت</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {narrative.highlights.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
          )}
          {narrative.risks && narrative.risks.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">ریسک‌ها</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {narrative.risks.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
          )}
          {narrative.nextMonthFocus && narrative.nextMonthFocus.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">تمرکز ماه بعد</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {narrative.nextMonthFocus.map((n) => <li key={n}>{n}</li>)}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
