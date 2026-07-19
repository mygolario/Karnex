"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { AccountSectionHeader, SettingsCard, SettingsRow } from "@/components/dashboard/account/account-primitives";
import { Sliders, Moon, Sun, Monitor, Type, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import type { AccountSectionProps } from "./section-props";
import { ACCENT_LABELS, type AccentColor, type DefaultLanding } from "@/lib/account/types";
import { PwaSettingsCard } from "@/components/pwa/pwa-settings-card";

export function AccountPreferences({ bundle, refresh }: AccountSectionProps) {
  const { setTheme } = useTheme();
  const s = bundle.settings || {};
  const [state, setState] = useState({
    theme: s.theme || "system",
    accent: s.accent || "pink",
    density: s.density || "comfortable",
    fontSize: s.fontSize || "md",
    language: s.language || "fa",
    dateFormat: s.dateFormat || "jalali",
    defaultLanding: s.defaultLanding || "overview",
  });

  const patch = async (p: Partial<typeof state>) => {
    const next = { ...state, ...p };
    setState(next);
    try {
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: p }),
      });
      await refresh();
      toast.success("ترجیحات ذخیره شد");
    } catch {
      toast.error("خطا در ذخیره");
    }
  };

  const setThemeAndPersist = (t: "light" | "dark" | "system") => {
    setTheme(t);
    patch({ theme: t });
  };

  return (
    <div className="space-y-6">
      <AccountSectionHeader
        title="ترجیحات"
        subtitle="ظاهر، رنگ، چیدمان و رفتار پیش‌فرض برنامه را شخصی‌سازی کنید."
        icon={Sliders}
        accent="primary"
      />

      <SettingsCard title="پوسته" icon={Moon} accent="primary">
        <SettingsRow label="حالت پوسته" description="روشن، تاریک یا هماهنگ با سیستم">
          <div className="flex bg-muted/40 rounded-xl p-1">
            <SegBtn active={state.theme === "light"} onClick={() => setThemeAndPersist("light")} icon={Sun}>روشن</SegBtn>
            <SegBtn active={state.theme === "dark"} onClick={() => setThemeAndPersist("dark")} icon={Moon}>تاریک</SegBtn>
            <SegBtn active={state.theme === "system"} onClick={() => setThemeAndPersist("system")} icon={Monitor}>سیستم</SegBtn>
          </div>
        </SettingsRow>
        <SettingsRow label="رنگ تأکیدی" description="رنگ اصلی برند در سراسر برنامه">
          <select
            value={state.accent}
            onChange={(e) => patch({ accent: e.target.value as AccentColor })}
            className="h-9 px-3 rounded-lg bg-background border border-border text-sm"
          >
            {Object.entries(ACCENT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </SettingsRow>
        <SettingsRow label="تراکم" description="فاصله‌گذاری عناصر" divider={false}>
          <div className="flex bg-muted/40 rounded-xl p-1">
            <SegBtn active={state.density === "comfortable"} onClick={() => patch({ density: "comfortable" })}>راحت</SegBtn>
            <SegBtn active={state.density === "compact"} onClick={() => patch({ density: "compact" })}>فشرده</SegBtn>
          </div>
        </SettingsRow>
      </SettingsCard>

      <SettingsCard title="نمایش" icon={Type} accent="primary">
        <SettingsRow label="اندازه فونت" description="اندازه متن برنامه">
          <div className="flex bg-muted/40 rounded-xl p-1">
            <SegBtn active={state.fontSize === "sm"} onClick={() => patch({ fontSize: "sm" })}>کوچک</SegBtn>
            <SegBtn active={state.fontSize === "md"} onClick={() => patch({ fontSize: "md" })}>متوسط</SegBtn>
            <SegBtn active={state.fontSize === "lg"} onClick={() => patch({ fontSize: "lg" })}>بزرگ</SegBtn>
          </div>
        </SettingsRow>
        <SettingsRow label="زبان" description="زبان رابط کاربری">
          <div className="flex bg-muted/40 rounded-xl p-1">
            <SegBtn active={state.language === "fa"} onClick={() => patch({ language: "fa" })}>فارسی</SegBtn>
            <SegBtn active={state.language === "en"} onClick={() => patch({ language: "en" })}>English</SegBtn>
          </div>
        </SettingsRow>
        <SettingsRow label="فرمت تاریخ" description="نمایش تاریخ‌ها" divider={false}>
          <div className="flex bg-muted/40 rounded-xl p-1">
            <SegBtn active={state.dateFormat === "jalali"} onClick={() => patch({ dateFormat: "jalali" })}>جلالی</SegBtn>
            <SegBtn active={state.dateFormat === "gregorian"} onClick={() => patch({ dateFormat: "gregorian" })}>میلادی</SegBtn>
          </div>
        </SettingsRow>
      </SettingsCard>

      <SettingsCard title="رفتار پیش‌فرض" icon={Rocket} accent="primary">
        <SettingsRow label="صفحه ورود پس از لاگین" description="کجا پس از ورود باز شود" divider={false}>
          <select
            value={state.defaultLanding}
            onChange={(e) => patch({ defaultLanding: e.target.value as DefaultLanding })}
            className="h-9 px-3 rounded-lg bg-background border border-border text-sm"
          >
            <option value="overview">پیشخوان</option>
            <option value="roadmap">نقشه راه</option>
            <option value="copilot">دستیار هوشمند</option>
            <option value="last-project">آخرین پروژه</option>
          </select>
        </SettingsRow>
      </SettingsCard>

      <PwaSettingsCard />
    </div>
  );
}

function SegBtn({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon?: LucideIcon; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
        active ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {Icon && <Icon size={13} />}
      {children}
    </button>
  );
}
