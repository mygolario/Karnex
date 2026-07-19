"use client";

import { useState, useEffect } from "react";
import { AccountSectionHeader, SettingsCard, UsageRing, UsageBar } from "@/components/dashboard/account/account-primitives";
import { Gauge, Zap, Coins, Activity, CalendarClock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AccountSectionProps } from "./section-props";
import type { UsageResponse, UsageByDayItem, UsageByFeatureItem } from "@/lib/account/api-types";

const FEATURE_LABELS: Record<string, string> = {
  copilot_chat: "دستیار",
  ai_generate: "تولید محتوا",
  tool_call: "ابزارها",
  customer_bot: "ربات مشتری",
  other: "سایر",
};

export function AccountUsage({}: AccountSectionProps) {
  const [data, setData] = useState<UsageResponse | null>(null);
  const [range, setRange] = useState<"month" | "90d">("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/user/usage?range=${range}`)
      .then((r) => r.json())
      .then((d: UsageResponse) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [range]);

  const ai = data?.quota?.ai;
  const projects = data?.quota?.projects;
  const totals = data?.totals;
  const resetDate = data?.resetDate ? new Date(data.resetDate) : null;
  const daysToReset = resetDate ? Math.max(0, Math.ceil((resetDate.getTime() - Date.now()) / 86400000)) : null;

  const maxDayRequests = data?.byDay?.length
    ? Math.max(...data.byDay.map((d: UsageByDayItem) => d.requests))
    : 0;

  return (
    <div className="space-y-6">
      <AccountSectionHeader
        title="مصرف و اعتبار"
        subtitle="مصرف هوش مصنوعی، توکن و هزینه‌ها در این ماه — همه در یک پنل."
        icon={Gauge}
        accent="emerald"
        action={
          <div className="flex bg-muted/40 rounded-xl p-1">
            <button onClick={() => setRange("month")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${range === "month" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>این ماه</button>
            <button onClick={() => setRange("90d")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${range === "90d" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>۹۰ روز</button>
          </div>
        }
      />

      {/* Quota rings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SettingsCard accent="emerald" className="flex flex-col items-center text-center">
          <UsageRing used={ai?.used || 0} total={ai?.limit || 0} label="اعتبار AI" />
          <div className="mt-3 text-sm text-muted-foreground">
            {ai?.remaining === "unlimited" ? "نامحدود" : `${ai?.remaining ?? 0} واحد باقی‌مانده`}
          </div>
        </SettingsCard>

        <SettingsCard accent="emerald" className="flex flex-col items-center text-center">
          <UsageRing used={projects?.used || 0} total={projects?.limit || 0} label="پروژه" />
          <div className="mt-3 text-sm text-muted-foreground">
            {projects?.remaining === "unlimited" ? "نامحدود" : `${projects?.remaining ?? 0} پروژه باقی‌مانده`}
          </div>
        </SettingsCard>

        <SettingsCard accent="emerald" className="flex flex-col items-center justify-center text-center">
          <CalendarClock size={40} className="text-emerald-500 mb-2" />
          <div className="text-3xl font-black text-foreground tabular-nums">{daysToReset ?? "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">روز تا تمدید سهمیه</div>
        </SettingsCard>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Zap} label="درخواست کل" value={totals?.requests?.toLocaleString("fa-IR") || "۰"} />
        <StatCard icon={Activity} label="توکن کل" value={totals?.tokens?.toLocaleString("fa-IR") || "۰"} />
        <StatCard icon={Coins} label="هزینه (USD)" value={`$${(totals?.costUsd || 0).toFixed(3)}`} />
        <StatCard icon={Activity} label="درخواست ناموفق" value={(totals?.failed || 0).toLocaleString("fa-IR")} />
      </div>

      {/* Daily chart */}
      <SettingsCard title="مصرف روزانه" icon={Activity} accent="emerald">
        {loading ? (
          <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">در حال بارگذاری...</div>
        ) : data?.byDay?.length ? (
          <div className="flex items-end gap-1 h-40 pt-4">
            {data.byDay.map((d: UsageByDayItem) => {
              const h = maxDayRequests > 0 ? (d.requests / maxDayRequests) * 100 : 0;
              return (
                <div key={d.date} className="flex-1 group flex flex-col items-center justify-end h-full" title={`${d.date}: ${d.requests}`}>
                  <div className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-md transition-all group-hover:opacity-80" style={{ height: `${Math.max(h, 2)}%` }} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">مصرفی در این بازه ثبت نشده است.</div>
        )}
      </SettingsCard>

      {/* By feature */}
      <SettingsCard title="مصرف به تفکیک قابلیت" icon={Gauge} accent="emerald">
        {data?.byFeature?.length ? (
          <div className="space-y-4">
            {data.byFeature.map((f: UsageByFeatureItem) => (
              <UsageBar
                key={f.feature}
                used={f.requests}
                total={totals?.requests || 1}
                label={FEATURE_LABELS[f.feature] || f.feature}
                showNumbers={false}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground text-sm">داده‌ای موجود نیست.</div>
        )}
      </SettingsCard>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4">
      <Icon size={18} className="text-emerald-500 mb-2" />
      <div className="text-2xl font-black text-foreground tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
