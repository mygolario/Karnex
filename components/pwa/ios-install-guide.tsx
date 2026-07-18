"use client";

import { Share, Plus, Smartphone } from "lucide-react";

const steps = [
  {
    icon: Share,
    title: "دکمه اشتراک‌گذاری",
    description: "در Safari پایین صفحه، روی آیکون «Share» (مربع با فلش) بزنید.",
  },
  {
    icon: Plus,
    title: "افزودن به صفحه اصلی",
    description: "گزینه «Add to Home Screen» یا «افزودن به صفحه اصلی» را انتخاب کنید.",
  },
  {
    icon: Smartphone,
    title: "باز کردن از صفحه اصلی",
    description: "آیکون کارنکس روی صفحه اصلی ظاهر می‌شود — مثل یک اپ واقعی باز کنید.",
  },
];

export function IosInstallGuide() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <Smartphone size={20} />
        <p className="text-sm font-medium">راهنمای نصب در iOS (Safari)</p>
      </div>
      <ol className="space-y-4">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
              {i + 1}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <step.icon size={16} className="text-muted-foreground" />
                <h4 className="font-bold text-sm">{step.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
