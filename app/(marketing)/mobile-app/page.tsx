"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { PwaBenefits } from "@/components/pwa/pwa-benefits";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";
import { IosInstallGuide } from "@/components/pwa/ios-install-guide";
import { usePwa } from "@/hooks/use-pwa";
import {
  Smartphone, Map, Bot, Target, ArrowLeft, CheckCircle2,
} from "lucide-react";

const features = [
  { icon: Target, label: "بوم کسب‌وکار", desc: "طراحی و ویرایش بوم در موبایل" },
  { icon: Map, label: "نقشه راه", desc: "پیگیری مراحل با همگام‌سازی محدود آفلاین" },
  { icon: Bot, label: "دستیار AI", desc: "پرسش از دستیار هوشمند کارنکس" },
];

export default function MobileAppPage() {
  const { user } = useAuth();
  const { isInstalled, isIOS } = usePwa();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container px-4 md:px-6 max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Smartphone size={16} />
            نسخه موبایل کارنکس
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
            کارنکس را روی موبایل
            <span className="text-primary"> نصب کنید</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            بدون نیاز به اپ‌استور — کارنکس را به صفحه اصلی موبایل اضافه کنید و
            مثل یک اپلیکیشن واقعی از آن استفاده کنید.
          </p>

          {isInstalled ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 size={20} />
              اپلیکیشن نصب شده است
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
              <PwaInstallButton className="text-base px-8 py-4" showFallback />
              {isIOS && (
                <p className="text-sm text-muted-foreground">
                  در iOS از راهنمای پایین صفحه استفاده کنید
                </p>
              )}
            </div>
          )}

          <Link
            href={user ? "/dashboard/overview" : "/login"}
            className="inline-flex items-center gap-2 mt-6 text-primary font-medium hover:underline"
          >
            {user ? "رفتن به داشبورد" : "ورود و شروع"}
            <ArrowLeft size={16} />
          </Link>
        </section>

        {/* Phone mockup placeholder */}
        <section className="container px-4 mb-16">
          <div className="max-w-xs mx-auto relative">
            <div className="aspect-[9/19] rounded-[2.5rem] border-4 border-border bg-card shadow-2xl overflow-hidden">
              <div className="h-8 bg-muted flex items-center justify-center">
                <div className="w-16 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="p-4 space-y-3">
                <div className="h-8 rounded-lg bg-primary/20" />
                <div className="grid grid-cols-2 gap-2">
                  {features.map((f) => (
                    <div key={f.label} className="p-3 rounded-xl bg-muted/50 text-center">
                      <f.icon size={20} className="mx-auto mb-1 text-primary" />
                      <p className="text-[10px] font-bold">{f.label}</p>
                    </div>
                  ))}
                </div>
                <div className="h-24 rounded-xl bg-muted/30" />
                <div className="absolute bottom-4 start-4 end-4 h-12 rounded-xl bg-card border border-border flex items-center justify-around px-2">
                  {[Target, Map, Bot].map((Icon, i) => (
                    <Icon key={i} size={18} className="text-muted-foreground" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="container px-4 md:px-6 max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-black text-center mb-8">چرا نسخه موبایل؟</h2>
          <PwaBenefits />
        </section>

        {/* Install guides */}
        <section className="container px-4 md:px-6 max-w-2xl mx-auto space-y-8">
          <h2 className="text-2xl font-black text-center">راهنمای نصب</h2>

          {!isIOS && (
            <div className="p-6 rounded-2xl border border-border bg-card">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Smartphone size={18} className="text-primary" />
                Android / Chrome
              </h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li>1. این صفحه را در Chrome موبایل باز کنید</li>
                <li>
                  2. اگر دکمه «نصب اپلیکیشن کارنکس» را می‌بینید روی آن بزنید؛ در غیر
                  این صورت از منوی ⋮ گزینه Install app / Add to Home screen را انتخاب کنید
                </li>
                <li>3. در پنجره تأیید، «نصب» را انتخاب کنید</li>
              </ol>
              <div className="mt-4">
                <PwaInstallButton variant="banner" showFallback />
              </div>
            </div>
          )}

          <div className="p-6 rounded-2xl border border-border bg-card">
            <IosInstallGuide />
          </div>
        </section>

        {/* Feature preview */}
        <section className="container px-4 md:px-6 max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-black text-center mb-8">امکانات موبایل</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.label} className="p-5 rounded-2xl border border-border text-center">
                <f.icon size={28} className="mx-auto mb-3 text-primary" />
                <h3 className="font-bold mb-1">{f.label}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
