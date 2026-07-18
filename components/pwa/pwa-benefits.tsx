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
    title: "همگام‌سازی آفلاین محدود",
    description: "تغییرات ساده نقشه راه در صف محلی ذخیره و با اتصال دوباره همگام می‌شود.",
  },
  {
    icon: Zap,
    title: "نصب سریع",
    description: "بدون اپ‌استور — یک‌بار نصب کنید و مثل اپلیکیشن باز کنید.",
  },
  {
    icon: Bell,
    title: "تجربه اپلیکیشن",
    description: "رابط کاربری تمام‌صفحه مخصوص موبایل با نوار پایین.",
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
