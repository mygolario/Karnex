"use client";

import { Zap, Wifi, Home, Bell } from "lucide-react";

const benefits = [
  {
    icon: Home,
    title: "دسترسی سریع",
    description: "کارنکس را مستقیم از صفحه اصلی موبایل باز کنید — بدون نیاز به مرورگر.",
  },
  {
    icon: Wifi,
    title: "کار آفلاین",
    description: "تغییرات نقشه راه حتی بدون اینترنت ذخیره و بعداً همگام می‌شود.",
  },
  {
    icon: Zap,
    title: "سرعت بالاتر",
    description: "بارگذاری سریع‌تر صفحات با کش هوشمند PWA.",
  },
  {
    icon: Bell,
    title: "تجربه اپلیکیشن",
    description: "رابط کاربری تمام‌صفحه مخصوص موبایل با نوار پایین و ژست‌های لمسی.",
  },
];

export function PwaBenefits() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {benefits.map((b) => (
        <div
          key={b.title}
          className="p-4 rounded-2xl border border-border bg-card/50 hover:bg-card transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
            <b.icon size={20} />
          </div>
          <h3 className="font-bold text-sm mb-1">{b.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{b.description}</p>
        </div>
      ))}
    </div>
  );
}
