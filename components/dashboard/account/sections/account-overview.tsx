"use client";

import { useState, useEffect } from "react";
import { AccountSectionHeader, SettingsCard, ProfileAvatar, PlanBadge, UsageRing } from "@/components/dashboard/account/account-primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sparkles, TrendingUp, ShieldCheck, ShieldAlert, ArrowLeft, Crown, Download, Gauge, Flame, Trophy,
} from "lucide-react";
import Link from "next/link";
import type { AccountSectionProps } from "./section-props";
import type { AccountSectionId } from "@/components/dashboard/account/sections";
import type { UsageResponse, GamificationSummary } from "@/lib/account/api-types";

export function AccountOverview({ bundle, onNavigate }: AccountSectionProps & { onNavigate: (id: AccountSectionId) => void }) {
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [gamification, setGamification] = useState<GamificationSummary | null>(null);

  useEffect(() => {
    fetch("/api/user/usage").then((r) => r.json()).then((d: UsageResponse) => setUsage(d)).catch(() => {});
    fetch("/api/user/gamification").then((r) => r.json()).then((d: { gamification: GamificationSummary }) => setGamification(d.gamification)).catch(() => {});
  }, []);

  const planId = bundle.subscription?.planId || "free";
  const ai = usage?.quota?.ai;
  const projects = usage?.quota?.projects;
  const g = gamification;

  // Account health checklist
  const checks = [
    { label: "پروفایل کامل", ok: !!(bundle.account.firstName && bundle.account.bio), target: "profile" as AccountSectionId },
    { label: "رمز عبور / ورود امن", ok: true, target: "security" as AccountSectionId },
    { label: "شخصی‌سازی دستیار", ok: !!bundle.copilotProfile?.preferredTone, target: "ai" as AccountSectionId },
  ];
  const healthPct = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);

  const quickActions = [
    { label: "ارتقا طرح", icon: Crown, section: "billing" as AccountSectionId, accent: "from-amber-500 to-orange-600" },
    { label: "ویرایش پروفایل", icon: Sparkles, section: "profile" as AccountSectionId, accent: "from-primary to-brand-secondary" },
    { label: "لحن دستیار", icon: Sparkles, section: "ai" as AccountSectionId, accent: "from-violet-500 to-purple-600" },
    { label: "صادرات داده", icon: Download, section: "data" as AccountSectionId, accent: "from-emerald-500 to-teal-600" },
    { label: "بررسی امنیت", icon: ShieldCheck, section: "security" as AccountSectionId, accent: "from-blue-500 to-cyan-600" },
    { label: "مصرف", icon: Gauge, section: "usage" as AccountSectionId, accent: "from-pink-500 to-rose-600" },
  ];

  return (
    <div className="space-y-6">
      <AccountSectionHeader
        title="نمای کلی حساب"
        subtitle="خلاصه‌ای از حساب، مصرف، پیشرفت و سلامت شما."
        icon={Sparkles}
      />

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
        {/* Profile hero card */}
        <Card variant="gradient" className="md:col-span-2 lg:col-span-2 row-span-1">
          <div className="relative z-10 p-6 flex items-center gap-5">
            <ProfileAvatar
              name={bundle.account.firstName || bundle.account.name || "U"}
              src={bundle.account.image}
              size={80}
              className="ring-white/30"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-black text-white truncate">
                  {bundle.account.firstName && bundle.account.lastName
                    ? `${bundle.account.firstName} ${bundle.account.lastName}`
                    : bundle.account.name || bundle.account.email}
                </h3>
                <PlanBadge planId={planId} />
              </div>
              <p className="text-white/80 text-sm mt-1" dir="ltr">{bundle.account.email}</p>
              <p className="text-white/60 text-xs mt-2">
                عضو کارنکس از {new Date(bundle.account.createdAt).toLocaleDateString("fa-IR")}
              </p>
            </div>
            <Link href="/dashboard/overview" className="hidden md:inline-flex text-white/80 hover:text-white">
              <ArrowLeft size={20} />
            </Link>
          </div>
        </Card>

        {/* AI usage ring */}
        <SettingsCard accent="emerald" className="flex flex-col items-center justify-center text-center">
          <UsageRing used={ai?.used || 0} total={ai?.limit || 0} label="اعتبار AI" size={110} />
          <div className="text-xs text-muted-foreground mt-2">این ماه</div>
        </SettingsCard>

        {/* Gamification */}
        <SettingsCard title="پیشرفت شما" icon={Trophy} accent="primary">
          {g ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-orange-500" />
                  <span className="font-black text-foreground">سطح {g.level}</span>
                </div>
                <Badge variant="gradient" size="sm">{g.rank}</Badge>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{g.xp} XP</span>
                  <span>{g.xpIntoLevel}/{g.xpForNextLevel}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-brand-secondary" style={{ width: `${(g.xpIntoLevel / g.xpForNextLevel) * 100}%` }} />
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>مرحله‌های کامل: {g.completedSteps}/{g.totalSteps}</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">در حال بارگذاری...</div>
          )}
        </SettingsCard>

        {/* AI insight strip */}
        <Card className="md:col-span-2 lg:col-span-2 bg-card border border-violet-500/30">
          <div className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-foreground mb-1">بینش دستیار</div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {ai && ai.limit !== "unlimited" && ai.used / ai.limit > 0.75
                  ? `شما این ماه از ${Math.round((ai.used / ai.limit) * 100)}٪ سهمیه AI خود استفاده کرده‌اید. ارتقا به طرح بالاتر سهمیه بیشتری می‌دهد.`
                  : g && g.completedSteps === 0
                  ? "هنوز مرحله‌ای از نقشه راه تکمیل نکرده‌اید. با یک قدم کوچک شروع کنید!"
                  : "همه‌چیز خوب پیش می‌رود. برای دیدن پیشنهادهای دستیار، نقشه راه را باز کنید."}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate("billing")}>ارتقا</Button>
          </div>
        </Card>

        {/* Account health */}
        <SettingsCard title="سلامت حساب" icon={healthPct === 100 ? ShieldCheck : ShieldAlert} accent={healthPct === 100 ? "emerald" : "amber"}>
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{healthPct}٪ تکمیل</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full ${healthPct === 100 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${healthPct}%` }} />
            </div>
          </div>
          <div className="space-y-1.5">
            {checks.map((c) => (
              <button
                key={c.label}
                onClick={() => onNavigate(c.target)}
                className="flex items-center justify-between w-full text-start text-xs py-1 hover:text-primary transition-colors"
              >
                <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
                {c.ok ? <ShieldCheck size={14} className="text-emerald-500" /> : <ShieldAlert size={14} className="text-amber-500" />}
              </button>
            ))}
          </div>
        </SettingsCard>

        {/* Projects */}
        <SettingsCard title="پروژه‌ها" icon={TrendingUp} accent="primary">
          <UsageRing used={projects?.used || 0} total={projects?.limit || 0} label="پروژه فعال" size={110} />
        </SettingsCard>
      </div>

      {/* Quick actions */}
      <SettingsCard title="اقدامات سریع" accent="primary">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => onNavigate(a.section)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/50 hover:border-primary/40 hover:bg-muted/30 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.accent} text-white flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <a.icon size={18} />
              </div>
              <span className="text-xs font-bold text-foreground">{a.label}</span>
            </button>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}
