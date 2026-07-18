"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { financeApi } from "@/lib/finance/api";
import { toPersianDigits } from "@/lib/utils";

const fmt = (n: number) => toPersianDigits(Math.round(n).toLocaleString("fa-IR"));

interface KpiTargets {
  revenue: number;
  newCustomers: number;
  rating: number;
}

interface KpiActuals {
  revenue: number | null;
  newCustomers: number | null;
  rating: number | null;
}

const DEFAULT_TARGETS: KpiTargets = { revenue: 0, newCustomers: 0, rating: 4.5 };

function storageKey(projectId: string) {
  return `karnex_kpi_targets_${projectId}`;
}

function readLocalTargets(projectId: string): KpiTargets | null {
  try {
    const raw = localStorage.getItem(storageKey(projectId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<KpiTargets>;
    return {
      revenue: Number(parsed.revenue) || 0,
      newCustomers: Number(parsed.newCustomers) || 0,
      rating: Number(parsed.rating) || 0,
    };
  } catch {
    return null;
  }
}

export default function GoalsPage() {
  const { activeProject: plan, updateActiveProject } = useProject();
  const projectId = plan?.id;

  const [targets, setTargets] = useState<KpiTargets>(DEFAULT_TARGETS);
  const [actuals, setActuals] = useState<KpiActuals>({
    revenue: null,
    newCustomers: null,
    rating: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!projectId || !plan) return;
    setLoading(true);
    try {
      const planData = plan as unknown as Record<string, unknown>;
      const fromPlan = planData.kpiTargets as Partial<KpiTargets> | undefined;
      const fromLocal = readLocalTargets(projectId);
      setTargets({
        revenue: Number(fromPlan?.revenue ?? fromLocal?.revenue ?? 0),
        newCustomers: Number(fromPlan?.newCustomers ?? fromLocal?.newCustomers ?? 0),
        rating: Number(fromPlan?.rating ?? fromLocal?.rating ?? 4.5),
      });

      const customers = Array.isArray(planData.customers)
        ? (planData.customers as unknown[]).length
        : null;

      const financeRes = await financeApi.list(projectId).catch(() => null);

      let rating: number | null = null;
      const embedded = planData.avgRating;
      if (typeof embedded === "number") rating = embedded;

      try {
        const r = await fetch(`/api/projects/${projectId}/reviews`);
        if (r.ok) {
          const data = await r.json();
          const list = (data.reviews || data) as { rating?: number }[];
          if (Array.isArray(list) && list.length > 0) {
            const sum = list.reduce((a, x) => a + (Number(x.rating) || 0), 0);
            rating = sum / list.length;
          }
        }
      } catch {
        // optional reviews API
      }

      let newCustomers: number | null = customers;
      try {
        const l = await fetch(`/api/projects/${projectId}/loyalty`);
        if (l.ok) {
          const data = await l.json();
          const accounts = data.accounts || data.loyalty || [];
          if (Array.isArray(accounts)) newCustomers = accounts.length;
        }
      } catch {
        // optional loyalty API
      }

      setActuals({
        revenue: financeRes?.pnl?.totalIncome ?? null,
        newCustomers,
        rating,
      });
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری اهداف ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, [projectId, plan]);

  useEffect(() => {
    load();
  }, [load]);

  if (plan?.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Target size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">اهداف KPI برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت به داشبورد</Button></Link>
        </Card>
      </div>
    );
  }

  const save = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      localStorage.setItem(storageKey(projectId), JSON.stringify(targets));
      try {
        await updateActiveProject({ kpiTargets: targets } as never);
      } catch {
        // cloud save optional — localStorage already written
      }
      toast.success("اهداف ذخیره شد");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const progress = (actual: number | null, target: number) => {
    if (actual == null || target <= 0) return null;
    return Math.min(100, Math.round((actual / target) * 100));
  };

  const rows: { key: keyof KpiTargets; label: string; actual: number | null; suffix?: string }[] = [
    { key: "revenue", label: "درآمد ماهانه (تومان)", actual: actuals.revenue },
    { key: "newCustomers", label: "مشتریان جدید", actual: actuals.newCustomers },
    { key: "rating", label: "امتیاز رضایت", actual: actuals.rating, suffix: "/۵" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ردیاب اهداف KPI</h1>
            <p className="text-sm text-muted-foreground">هدف در برابر واقعیت از مالی / مشتریان / نظرات</p>
          </div>
        </div>
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          ذخیره اهداف
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const pct = progress(row.actual, targets[row.key]);
            return (
              <Card key={row.key} className="p-5 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">{row.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      واقعیت:{" "}
                      {row.actual == null
                        ? "—"
                        : row.key === "revenue"
                          ? fmt(row.actual)
                          : `${toPersianDigits(String(Math.round(row.actual * 10) / 10))}${row.suffix || ""}`}
                    </p>
                  </div>
                  <input
                    type="number"
                    step={row.key === "rating" ? 0.1 : 1}
                    className="w-full md:w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={targets[row.key]}
                    onChange={(e) =>
                      setTargets({ ...targets, [row.key]: Number(e.target.value) })
                    }
                  />
                </div>
                {pct != null && (
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>پیشرفت</span>
                      <span>{toPersianDigits(String(pct))}٪</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
