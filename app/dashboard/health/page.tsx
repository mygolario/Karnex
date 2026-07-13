"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity, Loader2, Sparkles, AlertTriangle, CheckCircle2,
  Package, Wallet, Map as MapIcon, Users, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { healthApi } from "@/lib/health/api";
import type { HealthReport } from "@/lib/health/types";
import { toPersianDigits } from "@/lib/utils";
import { cn } from "@/lib/utils";

const DIM_ICONS: Record<string, typeof Activity> = {
  profitability: Wallet,
  revenue_trend: TrendingUp,
  inventory: Package,
  execution: MapIcon,
  customers: Users,
};

export default function HealthPage() {
  const { activeProject: plan } = useProject();
  const projectId = plan?.id;

  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<{
    diagnosis?: string;
    topRisks?: string[];
    recommendations?: string[];
  } | null>(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await healthApi.get(projectId);
      setReport(data.report);
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری سلامت کسب‌وکار ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  if (plan?.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Activity size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">سلامت کسب‌وکار برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت به داشبورد</Button></Link>
        </Card>
      </div>
    );
  }

  const runDiagnosis = async () => {
    if (!report) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "health-diagnosis",
          report,
          activeProject: plan,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      setDiagnosis(data.diagnosis);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در تشخیص AI");
    } finally {
      setAiLoading(false);
    }
  };

  const verdictStyles: Record<string, string> = {
    healthy: "from-emerald-500 to-teal-600",
    warning: "from-amber-500 to-orange-600",
    critical: "from-red-500 to-rose-600",
    neutral: "from-slate-400 to-slate-600",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">سلامت کسب‌وکار</h1>
            <p className="text-muted-foreground">امتیاز زنده از مالی، موجودی، نقشه راه و مشتریان</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>بروزرسانی</Button>
          <Button onClick={runDiagnosis} disabled={aiLoading || !report} className="gap-2 bg-gradient-to-r from-primary to-secondary">
            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            تشخیص AI
          </Button>
        </div>
      </div>

      {loading || !report ? (
        <div className="p-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <Card className={cn("p-8 text-white overflow-hidden relative bg-gradient-to-br", verdictStyles[report.verdict])}>
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              <div className="text-center md:text-start">
                <p className="text-white/80 text-sm font-medium mb-1">امتیاز سلامت</p>
                <div className="flex items-baseline gap-3 justify-center md:justify-start">
                  <span className="text-6xl font-black">{toPersianDigits(report.score)}</span>
                  <span className="text-2xl font-bold opacity-80">/ ۱۰۰</span>
                </div>
                <div className="mt-3 flex items-center gap-2 justify-center md:justify-start">
                  <Badge className="bg-white/20 text-white border-0 text-sm px-3 py-1">
                    رتبه {report.grade}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0 text-sm px-3 py-1">
                    {report.verdictLabel}
                  </Badge>
                </div>
              </div>
              <div className="max-w-md space-y-2">
                {report.highlights.slice(0, 2).map((h, i) => (
                  <p key={i} className="text-sm text-white/90 flex items-start gap-2">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> {h}
                  </p>
                ))}
                {report.recommendations.slice(0, 2).map((r, i) => (
                  <p key={i} className="text-sm text-white/90 flex items-start gap-2">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {r}
                  </p>
                ))}
              </div>
            </div>
          </Card>

          {diagnosis && (
            <Card className="p-5 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-3">
                  <p className="font-medium">{diagnosis.diagnosis}</p>
                  {diagnosis.topRisks && diagnosis.topRisks.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-muted-foreground mb-1">ریسک‌های اصلی</p>
                      <ul className="text-sm list-disc list-inside space-y-1">
                        {diagnosis.topRisks.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                  {diagnosis.recommendations && diagnosis.recommendations.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-muted-foreground mb-1">اقدامات پیشنهادی</p>
                      <ul className="text-sm list-disc list-inside space-y-1">
                        {diagnosis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.dimensions.map((d) => {
              const Icon = DIM_ICONS[d.key] || Activity;
              const barColor =
                d.status === "good" ? "bg-emerald-500" :
                d.status === "ok" ? "bg-amber-500" :
                d.status === "bad" ? "bg-red-500" : "bg-muted-foreground/30";
              return (
                <Card key={d.key} className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Icon size={20} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm">{d.label}</h4>
                        <span className="text-sm font-black">{toPersianDigits(d.score)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${d.score}%` }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{d.detail}</p>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/dashboard/finance">
              <Card className="p-4 hover:border-primary/30 transition-colors cursor-pointer">
                <Wallet className="w-5 h-5 text-amber-500 mb-2" />
                <p className="font-bold text-sm">ثبت درآمد/هزینه</p>
                <p className="text-xs text-muted-foreground">بهبود امتیاز سودآوری</p>
              </Card>
            </Link>
            <Link href="/dashboard/inventory">
              <Card className="p-4 hover:border-primary/30 transition-colors cursor-pointer">
                <Package className="w-5 h-5 text-emerald-500 mb-2" />
                <p className="font-bold text-sm">مدیریت موجودی</p>
                <p className="text-xs text-muted-foreground">کاهش هشدار کم‌موجودی</p>
              </Card>
            </Link>
            <Link href="/dashboard/roadmap">
              <Card className="p-4 hover:border-primary/30 transition-colors cursor-pointer">
                <MapIcon className="w-5 h-5 text-blue-500 mb-2" />
                <p className="font-bold text-sm">نقشه راه</p>
                <p className="text-xs text-muted-foreground">پیشبرد گام‌های اجرایی</p>
              </Card>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
