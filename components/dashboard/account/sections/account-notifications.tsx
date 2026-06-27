"use client";

import { useState } from "react";
import { AccountSectionHeader, SettingsCard, SettingsRow } from "@/components/dashboard/account/account-primitives";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Moon } from "lucide-react";
import { toast } from "sonner";
import type { AccountSectionProps } from "./section-props";
import type { NotificationSettings, NotificationChannel } from "@/lib/account/types";

const CATEGORY_LABELS: Record<string, string> = {
  aiInsights: "بینش‌های هوش مصنوعی",
  roadmap: "یادآوری نقشه راه",
  streaks: "نudges استریک",
  billing: "صورت‌حساب",
  product: "اخبار محصول",
};

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: "ایمیل",
  inApp: "داخل اپ",
  push: "پوش",
};

export function AccountNotifications({ bundle, refresh }: AccountSectionProps) {
  const n: NotificationSettings = bundle.settings?.notifications || {
    channels: { email: true, inApp: true, push: false },
    categories: {},
    quietHours: { enabled: false, start: "22:00", end: "07:00" },
    weeklyDigest: true,
    marketing: false,
  };

  const [state, setState] = useState<NotificationSettings>(n);
  const [saving, setSaving] = useState(false);

  const update = (patch: Partial<NotificationSettings>) => {
    setState((s) => ({ ...s, ...patch }));
  };

  const save = async (next?: NotificationSettings) => {
    setSaving(true);
    try {
      await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next || state),
      });
      await refresh();
      toast.success("ترجیحات اعلان ذخیره شد");
    } catch {
      toast.error("خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const toggleChannel = (ch: NotificationChannel) => {
    const channels = { ...state.channels, [ch]: !state.channels[ch] };
    update({ channels });
    save({ ...state, channels });
  };

  const toggleCategory = (cat: string, ch: NotificationChannel) => {
    const categories = {
      ...state.categories,
      [cat]: { ...(state.categories[cat] || {}), [ch]: !state.categories[cat]?.[ch] },
    };
    update({ categories });
    save({ ...state, categories });
  };

  return (
    <div className="space-y-6">
      <AccountSectionHeader
        title="اعلان‌ها"
        subtitle="کانال‌ها و دسته‌بندی اعلان‌ها را دقیقاً کنترل کنید."
        icon={Bell}
        accent="amber"
      />

      <SettingsCard title="کانال‌های دریافت" icon={Mail} accent="amber">
        <SettingsRow label="ایمیل" description="دریافت اعلان‌ها از طریق ایمیل">
          <Switch checked={state.channels.email} onCheckedChange={() => toggleChannel("email")} />
        </SettingsRow>
        <SettingsRow label="داخل اپ" description="اعلان‌های زنده در داشبورد">
          <Switch checked={state.channels.inApp} onCheckedChange={() => toggleChannel("inApp")} />
        </SettingsRow>
        <SettingsRow label="پوش (Push)" description="اعلان‌های مرورگر و موبایل">
          <Switch checked={state.channels.push} onCheckedChange={() => toggleChannel("push")} />
        </SettingsRow>
      </SettingsCard>

      <SettingsCard title="دسته‌بندی اعلان‌ها" icon={Bell} accent="amber">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs">
                <th className="text-start font-medium pb-3 pe-2">دسته</th>
                {(["email", "inApp", "push"] as NotificationChannel[]).map((ch) => (
                  <th key={ch} className="font-medium pb-3 px-2 text-center">{CHANNEL_LABELS[ch]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                <tr key={cat} className="border-t border-border/40">
                  <td className="py-3 pe-2 font-medium text-foreground">{label}</td>
                  {(["email", "inApp", "push"] as NotificationChannel[]).map((ch) => (
                    <td key={ch} className="py-3 px-2 text-center">
                      <Switch
                        checked={!!state.categories[cat]?.[ch]}
                        onCheckedChange={() => toggleCategory(cat, ch)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsCard>

      <SettingsCard title="ساعت‌های سکوت" icon={Moon} accent="amber">
        <SettingsRow label="فعال‌سازی ساعت‌های سکوت" description="در این بازه اعلان‌های غیرضروری متوقف می‌شوند">
          <Switch
            checked={state.quietHours.enabled}
            onCheckedChange={(v) => { update({ quietHours: { ...state.quietHours, enabled: v } }); save({ ...state, quietHours: { ...state.quietHours, enabled: v } }); }}
          />
        </SettingsRow>
        {state.quietHours.enabled && (
          <div className="flex items-center gap-4 p-5 border-t border-border/40">
            <div className="space-y-1.5">
              <Label>شروع</Label>
              <Input type="time" dir="ltr" value={state.quietHours.start} onChange={(e) => update({ quietHours: { ...state.quietHours, start: e.target.value } })} className="w-32" />
            </div>
            <div className="space-y-1.5">
              <Label>پایان</Label>
              <Input type="time" dir="ltr" value={state.quietHours.end} onChange={(e) => update({ quietHours: { ...state.quietHours, end: e.target.value } })} className="w-32" />
            </div>
            <button onClick={() => save()} disabled={saving} className="ms-auto text-xs bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold disabled:opacity-50">
              ذخیره
            </button>
          </div>
        )}
      </SettingsCard>

      <SettingsCard title="خلاصه هفتگی" icon={Mail} accent="amber">
        <SettingsRow label="خلاصه هفتگی" description="یک ایمیل خلاصه هر هفته">
          <Switch checked={state.weeklyDigest} onCheckedChange={(v) => { update({ weeklyDigest: v }); save({ ...state, weeklyDigest: v }); }} />
        </SettingsRow>
        <SettingsRow label="اخبار و بازاریابی" description="نکات، پیشنهادها و تخفیف‌ها" divider={false}>
          <Switch checked={state.marketing} onCheckedChange={(v) => { update({ marketing: v }); save({ ...state, marketing: v }); }} />
        </SettingsRow>
      </SettingsCard>
    </div>
  );
}
