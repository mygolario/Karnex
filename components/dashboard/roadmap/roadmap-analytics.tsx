"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { TrendingUp, Clock, Target, AlertTriangle, AlertCircle, Sparkles, Milestone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, toPersianDigits } from "@/lib/utils";
import type { RoadmapPhase, RoadmapStep, SubTask } from "@/lib/db";
import {
  StepStatus,
  STATUS_CONFIG,
  getCategoryConfig,
} from "@/lib/roadmap/constants";

interface RoadmapAnalyticsProps {
  roadmap: RoadmapPhase[];
  completedSteps: string[];
  stepStatuses: Record<string, { status?: string; actualHours?: number; startedAt?: string }>;
  totalSteps: number;
  velocity: { perWeek: number; totalDone: number; estimatedRemaining: number };
  subTasks?: SubTask[];
}

const STATUS_CHART_COLORS: Record<StepStatus, string> = {
  todo: "#94a3b8",
  "in-progress": "#3b82f6",
  blocked: "#ef4444",
  done: "#10b981",
  skipped: "#64748b",
};

export function RoadmapAnalytics({
  roadmap,
  completedSteps,
  stepStatuses,
  totalSteps,
  velocity,
  subTasks,
}: RoadmapAnalyticsProps) {
  // Status distribution
  const statusData = useMemo(() => {
    const counts: Record<StepStatus, number> = {
      todo: 0,
      "in-progress": 0,
      blocked: 0,
      done: 0,
      skipped: 0,
    };
    for (const phase of roadmap) {
      for (const s of phase.steps) {
        const step = typeof s === "string" ? { title: s } : (s as RoadmapStep);
        const title = step.title;
        if (completedSteps.includes(title)) {
          counts.done++;
        } else {
          const meta = stepStatuses[title];
          const statusKey: StepStatus = (meta?.status as StepStatus) || "todo";
          counts[statusKey]++;
        }
      }
    }
    return (Object.keys(counts) as StepStatus[])
      .filter((k) => counts[k] > 0)
      .map((k) => ({
        name: STATUS_CONFIG[k].label,
        value: counts[k],
        color: STATUS_CHART_COLORS[k],
      }));
  }, [roadmap, completedSteps, stepStatuses]);

  // Category distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const phase of roadmap) {
      for (const s of phase.steps) {
        const step = typeof s === "string" ? { title: s } : (s as RoadmapStep);
        const cat = step.category || "uncategorized";
        counts[cat] = (counts[cat] || 0) + 1;
      }
    }
    return Object.entries(counts).map(([key, value]) => ({
      name: getCategoryConfig(key)?.label || key,
      value,
      color: getCategoryConfig(key)?.color || "#94a3b8",
    }));
  }, [roadmap]);

  // Phase progress
  const phaseData = useMemo(() => {
    return roadmap.map((phase, i) => {
      const total = phase.steps.length;
      const done = phase.steps.filter((s) => {
        const t = typeof s === "string" ? s : (s as RoadmapStep).title;
        return completedSteps.includes(t);
      }).length;
      return {
        name: phase.phase.substring(0, 15) + (phase.phase.length > 15 ? "..." : ""),
        done,
        remaining: total - done,
        total,
        progress: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    });
  }, [roadmap, completedSteps]);

  // Bottleneck Detection: Steps blocked or in-progress for too long
  const bottlenecks = useMemo(() => {
    const list: { title: string; status: StepStatus; durationDays: number }[] = [];
    const now = new Date();

    Object.entries(stepStatuses).forEach(([title, meta]) => {
      if (meta.startedAt && (meta.status === "in-progress" || meta.status === "blocked")) {
        const start = new Date(meta.startedAt);
        const diffMs = now.getTime() - start.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays >= 3) {
          list.push({
            title,
            status: meta.status as StepStatus,
            durationDays: diffDays,
          });
        }
      }
    });

    return list.sort((a, b) => b.durationDays - a.durationDays).slice(0, 3);
  }, [stepStatuses]);

  // Predictive S-Curve / Burn-up chart data simulation
  const burnUpData = useMemo(() => {
    const list = [];
    const doneCount = completedSteps.length;
    // Current completed progress over past weeks
    let currentDone = 0;
    const weeksCount = Math.max(velocity.estimatedRemaining + 3, 6);

    for (let i = 0; i <= weeksCount; i++) {
      const actualProgress = i <= 2 ? Math.round(doneCount * (i / 2)) : doneCount;
      const projection = Math.min(
        totalSteps,
        Math.round(doneCount + (velocity.perWeek || 1.5) * Math.max(0, i - 2))
      );

      list.push({
        name: `هفته ${toPersianDigits(i)}`,
        تکمیل: i <= 2 ? actualProgress : null,
        هدف: Math.min(totalSteps, Math.round(totalSteps * (i / weeksCount))),
        پیش‌بینی: i >= 2 ? projection : null,
      });
    }
    return list;
  }, [completedSteps, totalSteps, velocity]);

  // Estimated vs actual hours
  const hoursData = useMemo(() => {
    let estimated = 0;
    let actual = 0;
    for (const phase of roadmap) {
      for (const s of phase.steps) {
        const step = typeof s === "string" ? { title: s } : (s as RoadmapStep);
        if (step.estimatedHours) {
          const h = Number(step.estimatedHours) || 0;
          estimated += h;
          if (completedSteps.includes(step.title)) {
            const meta = stepStatuses[step.title];
            actual += meta?.actualHours || h;
          }
        }
      }
    }
    return { estimated, actual, ratio: estimated > 0 ? actual / estimated : 0 };
  }, [roadmap, completedSteps, stepStatuses]);

  const blockedCount = statusData.find((s) => s.name === "مسدود")?.value || 0;

  return (
    <div className="space-y-6">
      {/* Top metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Target size={18} />}
          label="سرعت هفتگی شما"
          value={`${toPersianDigits(velocity.perWeek || 1.5)} گام/هفته`}
          color="text-amber-500"
        />
        <MetricCard
          icon={<Clock size={18} />}
          label="زمان پیش‌بینی اتمام"
          value={
            velocity.estimatedRemaining > 0
              ? `${toPersianDigits(velocity.estimatedRemaining)} هفته دگر`
              : "برنامه‌ریزی نشده"
          }
          color="text-blue-500"
        />
        <MetricCard
          icon={<TrendingUp size={18} />}
          label="ساعات کار تخمینی"
          value={`${toPersianDigits(hoursData.estimated)} ساعت`}
          color="text-purple-500"
        />
        <MetricCard
          icon={<Milestone size={18} />}
          label="کل گام‌های پروژه"
          value={toPersianDigits(totalSteps)}
          color="text-teal-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Main charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Predictive Burn-up curve */}
          <Card padding="default">
            <h3 className="text-sm font-black mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              نمودار پیش‌بینی اتمام نقشه راه (S-Curve)
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={burnUpData} margin={{ left: 0, right: 16, top: 10 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => toPersianDigits(v)} />
                <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area
                  type="monotone"
                  dataKey="تکمیل"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                />
                <Area
                  type="monotone"
                  dataKey="پیش‌بینی"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorProjected)"
                />
                <Area type="monotone" dataKey="هدف" stroke="#e2e8f0" strokeWidth={1} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Phase progress list */}
          <Card padding="default">
            <h3 className="text-sm font-black mb-4">پیشرفت فصل‌های نقشه راه</h3>
            <div className="space-y-4">
              {phaseData.map((phase) => (
                <div key={phase.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">{phase.name}</span>
                    <span className="text-muted-foreground font-bold">
                      {toPersianDigits(phase.done)} از {toPersianDigits(phase.total)} گام (
                      {toPersianDigits(phase.progress)}٪)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        phase.progress === 100 ? "bg-emerald-500" : "bg-primary"
                      )}
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Column 3: Sidebar metrics, bottlenecks & distribution */}
        <div className="space-y-6">
          {/* Bottlenecks Panel */}
          <Card padding="default" className="border-red-500/10 bg-gradient-to-br from-card to-red-500/5">
            <h3 className="text-sm font-black text-red-600 mb-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              شناسایی گلوگاه‌ها (گیر کرده)
            </h3>
            {bottlenecks.length > 0 ? (
              <div className="space-y-3">
                {bottlenecks.map((b) => (
                  <div key={b.title} className="p-3 bg-background border border-red-500/15 rounded-xl space-y-1.5 text-start">
                    <div className="text-xs font-bold text-foreground line-clamp-1">{b.title}</div>
                    <div className="flex justify-between items-center text-[10px]">
                      <Badge variant="danger" size="sm" className="px-1 text-[9px]">
                        {b.status === "blocked" ? "مسدود شده" : "در حال انجام"}
                      </Badge>
                      <span className="text-red-600 font-black">
                        {toPersianDigits(b.durationDays)} روز معطل
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground leading-relaxed">
                عالی! هیچ گامی در پروژه شما بیش از ۳ روز متوقف یا مسدود باقی نمانده است.
              </p>
            )}
          </Card>

          {/* Status distribution Pie */}
          <Card padding="default">
            <h3 className="text-sm font-bold mb-4">توزیع وضعیت گام‌ها</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any) => [toPersianDigits(value), name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground mt-2">
              {statusData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 justify-start">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="truncate">{d.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Category breakdown bar chart */}
          <Card padding="default">
            <h3 className="text-sm font-bold mb-4">توزیع موضوعی تسک‌ها</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={categoryData} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} strokeOpacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => toPersianDigits(v)} />
                <Tooltip formatter={(value: any) => [toPersianDigits(value), "تعداد"]} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Card variant="muted" padding="sm" className="flex flex-col gap-1 text-start">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className={color}>{icon}</span>
        {label}
      </div>
      <div className={cn("text-lg font-black", color)}>{value}</div>
    </Card>
  );
}
