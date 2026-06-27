"use client";

import { useState, useEffect } from "react";
import { AccountSectionHeader, SettingsCard, SettingsRow } from "@/components/dashboard/account/account-primitives";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Monitor, LogIn, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import type { AccountSectionProps } from "./section-props";
import type { SecuritySummary, SessionListItem, LoginEventItem } from "@/lib/account/api-types";

export function AccountSecurity({ bundle, refresh }: AccountSectionProps) {
  const [security, setSecurity] = useState<SecuritySummary | null>(null);
  const [sessions, setSessions] = useState<SessionListItem[]>(bundle.sessions || []);
  const [loginEvents, setLoginEvents] = useState<LoginEventItem[]>([]);
  const [toggling2fa, setToggling2fa] = useState(false);

  useEffect(() => {
    fetch("/api/user/security").then((r) => r.json()).then((d: SecuritySummary) => setSecurity(d)).catch(() => {});
    fetch("/api/user/sessions").then((r) => r.json()).then((d: { sessions: SessionListItem[]; loginEvents: LoginEventItem[] }) => { setSessions(d.sessions || []); setLoginEvents(d.loginEvents || []); }).catch(() => {});
  }, []);

  const toggle2fa = async (enable: boolean) => {
    setToggling2fa(true);
    try {
      await fetch("/api/user/security", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enableTwoFactor: enable }),
      });
      await refresh();
      toast.success(enable ? "تأیید دو مرحله‌ای فعال شد" : "تأیید دو مرحله‌ای غیرفعال شد");
    } catch {
      toast.error("خطا");
    } finally {
      setToggling2fa(false);
    }
  };

  const revokeSession = async (id: string) => {
    await fetch(`/api/user/sessions?id=${id}`, { method: "DELETE" });
    setSessions((s) => s.filter((x) => x.id !== id));
    toast.success("نشست قطع شد");
  };

  const revokeAll = async () => {
    if (!confirm("همه نشست‌ها به‌جز این دستگاه قطع شوند؟")) return;
    await fetch("/api/user/sessions?id=all", { method: "DELETE" });
    setSessions([]);
    toast.success("سایر نشست‌ها قطع شدند");
  };

  const passwordSet = !!security?.passwordSet;
  const twoFa = !!bundle.account?.twoFactorEnabled;

  return (
    <div className="space-y-6">
      <AccountSectionHeader
        title="امنیت"
        subtitle="رمز عبور، تأیید دو مرحله‌ای، نشست‌ها و تاریخچه ورود."
        icon={Shield}
        accent="primary"
      />

      {/* Account health */}
      <SettingsCard title="سلامت حساب" icon={ShieldCheck} accent="primary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <HealthItem ok={passwordSet} label="رمز عبور" />
          <HealthItem ok={twoFa} label="تأیید دو مرحله‌ای" />
          <HealthItem ok={(security?.connectedAccounts?.length || 0) > 0} label="حساب متصل (OAuth)" />
        </div>
      </SettingsCard>

      <SettingsCard title="رمز عبور و احراز هویت" icon={Lock} accent="primary">
        <SettingsRow label="رمز عبور" description={passwordSet ? "یک رمز عبور تنظیم شده است" : "حساب از طریق OAuth وارد می‌شود"}>
          <Button variant="outline" size="sm" onClick={() => toast.info("تغییر رمز از طریق صفحه ورود کارنکس انجام می‌شود")}>
            تغییر رمز
          </Button>
        </SettingsRow>
        <SettingsRow label="تأیید دو مرحله‌ای (2FA)" description="لایه امنیتی اضافی برای ورود" divider={false}>
          <Switch checked={!!twoFa} disabled={toggling2fa} onCheckedChange={(v) => toggle2fa(v)} />
        </SettingsRow>
      </SettingsCard>

      <SettingsCard
        title="نشست‌های فعال"
        icon={Monitor}
        accent="primary"
        action={<Button variant="ghost" size="sm" onClick={revokeAll} className="text-destructive hover:text-destructive">قطع همه</Button>}
      >
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">نشست فعالی ثبت نشده است.</p>
        ) : (
          <div className="divide-y divide-border/40">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Monitor size={18} className="text-muted-foreground" />
                  <div>
                    <div className="font-bold text-sm">{s.device || "دستگاه ناشناخته"}</div>
                    <div className="text-xs text-muted-foreground">{s.location || s.ip || ""} • آخرین فعالیت: {new Date(s.lastActive).toLocaleDateString("fa-IR")}</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => revokeSession(s.id)} className="text-destructive hover:text-destructive">قطع</Button>
              </div>
            ))}
          </div>
        )}
      </SettingsCard>

      <SettingsCard title="تاریخچه ورود" icon={LogIn} accent="primary">
        {loginEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">رویداد ورودی ثبت نشده است.</p>
        ) : (
          <div className="divide-y divide-border/40">
            {loginEvents.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-3 text-sm">
                <div className="flex items-center gap-3">
                  {e.status === "success" ? <ShieldCheck size={16} className="text-emerald-500" /> : <ShieldAlert size={16} className="text-red-500" />}
                  <span className="font-medium">{e.status === "success" ? "ورود موفق" : "ورود ناموفق"}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {e.ip || "—"} • {new Date(e.createdAt).toLocaleString("fa-IR")}
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsCard>
    </div>
  );
}

function HealthItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`p-4 rounded-xl border ${ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
      <div className={`flex items-center gap-2 ${ok ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
        {ok ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
        <span className="font-bold text-sm">{label}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{ok ? "فعال" : "غیرفعال — توصیه می‌شود فعال کنید"}</p>
    </div>
  );
}
