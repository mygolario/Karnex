import "server-only";
import prisma from "@/lib/prisma";
import { getInventorySummary } from "@/lib/inventory/server";
import { getPnLReport } from "@/lib/finance/server";
import type { HealthDimension, HealthReport, HealthVerdict } from "./types";

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function gradeFor(score: number): string {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 30) return "D";
  return "—";
}

function statusFor(score: number): HealthDimension["status"] {
  if (score <= 0) return "none";
  if (score >= 70) return "good";
  if (score >= 45) return "ok";
  return "bad";
}

function verdictFor(score: number, hasData: boolean): { verdict: HealthVerdict; label: string } {
  if (!hasData) return { verdict: "neutral", label: "داده کافی نیست" };
  if (score >= 70) return { verdict: "healthy", label: "سالم" };
  if (score >= 45) return { verdict: "warning", label: "نیاز به توجه" };
  return { verdict: "critical", label: "بحرانی" };
}

/**
 * Composite Business Health score (0-100) from live data across:
 *  - Profitability (net profit + margin from P&L) — 30
 *  - Revenue trend (3-month direction) — 20
 *  - Inventory health (low/out-of-stock ratio) — 20
 *  - Execution (roadmap progress) — 20
 *  - Customer base (CRM size) — 10
 *
 * Defensive: returns a "neutral" report when there is no data yet so the
 * dashboard never looks broken for a brand-new business.
 */
export async function computeHealth(projectId: string): Promise<HealthReport> {
  const project = await prisma.project.findFirst({
    where: { id: projectId },
    select: { id: true, data: true },
  });

  const [inventory, pnl] = await Promise.all([
    getInventorySummary(projectId).catch(() => null),
    getPnLReport(projectId).catch(() => null),
  ]);

  const data = (project?.data as Record<string, any>) || {};
  const hasInventory = !!inventory && inventory.totalProducts > 0;
  const hasFinance = !!pnl && pnl.totalIncome > 0;
  const hasRoadmap = Array.isArray(data.roadmap) && data.roadmap.length > 0;
  const hasCustomers = Array.isArray(data.customers) && data.customers.length > 0;
  const hasData = hasInventory || hasFinance || hasRoadmap || hasCustomers;

  const dimensions: HealthDimension[] = [];

  // 1. Profitability (30)
  let profitScore = 0;
  let profitDetail = "هنوز تراکنش مالی ثبت نشده است.";
  if (hasFinance && pnl) {
    const net = pnl.netProfit;
    const margin = pnl.margin;
    if (net > 0) {
      profitScore = clamp(50 + margin * 0.5);
      profitDetail = `سود خالص ماه ${Math.round(net).toLocaleString("fa-IR")} تومان، حاشیه ${margin.toFixed(1)}٪.`;
    } else if (net === 0) {
      profitScore = 40;
      profitDetail = "این ماه تراز بوده است — درآمد و هزینه برابرند.";
    } else {
      profitScore = clamp(30 + margin * 0.3, 5, 30);
      profitDetail = `این ماه زیان ${Math.round(Math.abs(net)).toLocaleString("fa-IR")} تومان ثبت شده است.`;
    }
  }
  dimensions.push({ key: "profitability", label: "سودآوری", score: profitScore, status: statusFor(profitScore), detail: profitDetail });

  // 2. Revenue trend (20)
  let trendScore = 0;
  let trendDetail = "روند درآمد هنوز قابل محاسبه نیست.";
  if (hasFinance && pnl && pnl.trend.length >= 2) {
    const t = pnl.trend;
    const last = t[t.length - 1].income;
    const prev = t[t.length - 2].income;
    if (last > 0 && prev > 0) {
      const growth = (last - prev) / prev;
      trendScore = clamp(60 + growth * 100);
      trendDetail = growth >= 0
        ? `رشد درآمد ${(growth * 100).toFixed(0)}٪ نسبت به ماه قبل.`
        : `کاهش درآمد ${Math.abs(growth * 100).toFixed(0)}٪ نسبت به ماه قبل.`;
    } else if (last > 0) {
      trendScore = 55;
      trendDetail = "درآمد این ماه مثبت است؛ ماه‌های بعدی روند را مشخص می‌کنند.";
    }
  }
  dimensions.push({ key: "revenue_trend", label: "روند درآمد", score: trendScore, status: statusFor(trendScore), detail: trendDetail });

  // 3. Inventory health (20)
  let invScore = 0;
  let invDetail = "هنوز محصولی ثبت نشده است.";
  if (hasInventory && inventory) {
    const total = inventory.totalProducts;
    const problem = inventory.lowStockCount + inventory.outOfStockCount;
    const ratio = total > 0 ? problem / total : 0;
    invScore = clamp(100 - ratio * 100);
    if (problem === 0) invDetail = `${total.toLocaleString("fa-IR")} محصول همگی موجودی سالم دارند.`;
    else invDetail = `${problem.toLocaleString("fa-IR")} از ${total.toLocaleString("fa-IR")} محصول کم‌موجودی یا ناموجود است.`;
  }
  dimensions.push({ key: "inventory", label: "سلامت موجودی", score: invScore, status: statusFor(invScore), detail: invDetail });

  // 4. Execution / roadmap (20)
  let execScore = 0;
  let execDetail = "نقشه راه شروع نشده است.";
  if (hasRoadmap) {
    const phases: any[] = data.roadmap;
    const totalSteps = phases.reduce((acc, p) => acc + (Array.isArray(p?.steps) ? p.steps.length : 0), 0);
    const completed: string[] = Array.isArray(data.completedSteps) ? data.completedSteps : [];
    const ratio = totalSteps > 0 ? Math.min(1, completed.length / totalSteps) : 0;
    execScore = clamp(ratio * 100);
    execDetail = `${completed.length.toLocaleString("fa-IR")} از ${totalSteps.toLocaleString("fa-IR")} گام نقشه راه تکمیل شده.`;
  }
  dimensions.push({ key: "execution", label: "پیشرفت اجرایی", score: execScore, status: statusFor(execScore), detail: execDetail });

  // 5. Customer base (10)
  let custScore = 0;
  let custDetail = "هنوز مشتری ثبت نشده است.";
  if (hasCustomers) {
    const count: number = data.customers.length;
    custScore = clamp(Math.min(100, count * 10));
    custDetail = `${count.toLocaleString("fa-IR")} مشتری در دفتر مشتریان.`;
  }
  dimensions.push({ key: "customers", label: "پایه مشتری", score: custScore, status: statusFor(custScore), detail: custDetail });

  // Weighted composite
  const weights: Record<string, number> = {
    profitability: 0.3,
    revenue_trend: 0.2,
    inventory: 0.2,
    execution: 0.2,
    customers: 0.1,
  };
  const composite = hasData
    ? clamp(dimensions.reduce((acc, d) => acc + d.score * (weights[d.key] ?? 0), 0))
    : 0;

  const { verdict, label } = verdictFor(composite, hasData);

  const highlights: string[] = [];
  const recommendations: string[] = [];
  for (const d of dimensions) {
    if (d.status === "good") highlights.push(`${d.label}: ${d.detail}`);
    if (d.status === "bad" || d.status === "none") recommendations.push(`${d.label} — ${d.detail}`);
  }
  if (recommendations.length === 0 && hasData) {
    recommendations.push("وضعیت کلی خوب است؛ به ثبت داده‌های منظم ادامه بده.");
  }
  if (!hasData) {
    recommendations.push("برای دیدن امتیاز سلامت، اول تراکنش‌های مالی یا محصولاتت را ثبت کن.");
  }

  return {
    score: Math.round(composite),
    grade: hasData ? gradeFor(composite) : "—",
    verdict,
    verdictLabel: label,
    dimensions,
    highlights,
    recommendations,
    asOf: new Date().toISOString(),
  };
}
