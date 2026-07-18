"use client";

import { useState } from "react";
import { AccountSectionHeader, SettingsCard, SettingsRow } from "@/components/dashboard/account/account-primitives";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Database, Download, History, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AccountSectionProps } from "./section-props";

export function AccountData({}: AccountSectionProps) {
  const [exporting, setExporting] = useState(false);
  const [analyticsOptOut, setAnalyticsOptOut] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/user/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ format: "json" }) });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `karnex-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("خروجی دانلود شد");
    } catch {
      toast.error("خطا در تولید خروجی");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AccountSectionHeader
        title="داده و حریم خصوصی"
        subtitle="داده‌های خود را صادر کنید و حریم خصوصی را کنترل کنید."
        icon={Database}
        accent="emerald"
      />

      <SettingsCard title="صادرات داده" description="تمام داده‌های حساب شما (پروفایل، پروژه‌ها، گفتگوها، مصرف) در یک فایل JSON." icon={Download} accent="emerald">
        <Button onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 size={16} className="animate-spin me-2" /> : <Download size={16} className="me-2" />}
          دانلود خروجی کامل
        </Button>
      </SettingsCard>

      <SettingsCard title="حریم خصوصی" icon={Eye} accent="emerald">
        <SettingsRow label="بهبود هوش مصنوعی" description="به کارنکس اجازه دهید از تعاملات شما برای بهبود پاسخ‌ها یاد بگیرد">
          <Switch checked={!analyticsOptOut} onCheckedChange={(v) => { setAnalyticsOptOut(!v); toast.success("ذخیره شد"); }} />
        </SettingsRow>
        <SettingsRow label="نمایش پروفایل به همکاران" description="نام و تصویر شما برای همکاران پروژه قابل‌مشاهده باشد" divider={false}>
          <Switch defaultChecked onCheckedChange={() => toast.success("ذخیره شد")} />
        </SettingsRow>
      </SettingsCard>

      <SettingsCard title="لاگ فعالیت" description="تاریخچه تغییرات حساب شما — به‌زودی." icon={History} accent="emerald">
        <p className="text-sm text-muted-foreground text-center py-6">لاگ فعالیت در نسخه بعدی فعال خواهد شد.</p>
      </SettingsCard>
    </div>
  );
}
