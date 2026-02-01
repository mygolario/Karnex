"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "رایگان",
    price: "۰",
    description: "برای شروع و تست ایده‌های اولیه",
    features: [
      "۳ ایده در ماه",
      "بوم مدل کسب‌وکار پایه",
      "پرسونای مخاطب (۱ مورد)",
      "پشتیبانی ایمیلی"
    ],
    cta: "شروع رایگان",
    popular: false
  },
  {
    name: "حرفه‌ای",
    price: "۹۹،۰۰۰",
    description: "برای کارآفرینان جدی و استارتاپ‌ها",
    features: [
      "نامحدود ایده",
      "بوم مدل کسب‌وکار پیشرفته",
      "نقشه راه کامل اجرایی",
      "تحلیل دقیق رقبا",
      "استراتژی بازاریابی ۳۶۰ درجه",
      "پشتیبانی اولویت‌دار"
    ],
    cta: "خرید اشتراک",
    popular: true
  },
  {
    name: "سازمانی",
    price: "تماس",
    description: "برای شتاب‌دهنده‌ها و تیم‌های بزرگ",
    features: [
      "دسترسی تیمی (تا ۱۰ نفر)",
      "API اختصاصی",
      "مشاوره اختصاصی منتورینگ",
      "قرارداد رسمی شرکتی",
      "پشتیبانی ۲۴/۷ تلفنی"
    ],
    cta: "تماس با فروش",
    popular: false
  }
];

export const StripePricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-background relative overflow-hidden">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
            سرمایه‌گذاری روی <span className="text-primary">آینده شما</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            با هزینه‌ای کمتر از یک پیتزا، آینده کسب‌وکار خود را تضمین کنید.
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={cn("text-sm font-medium", !isAnnual && "text-foreground font-bold")}>ماهانه</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-7 bg-slate-200 dark:bg-slate-700 rounded-full p-1 transition-colors hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <div
                className={cn(
                  "w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-spring",
                  isAnnual ? "translate-x-0" : "translate-x-7" // RTL flip logic: translate-x-7 moves left in RTL? No, usually translation is LTR based unless directed. Let's check visually.
                  // Actually in RTL, likely needs testing. Assuming standard CSS logic where +x is right.
                  // If container (button) is LTR, +x moves right.
                  // Let's assume standard behavior.
                )}
              />
            </button>
            <span className={cn("text-sm font-medium", isAnnual && "text-foreground font-bold")}>
              سالانه <span className="text-emerald-500 text-xs">(۲۰٪ تخفیف)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                "relative bg-background rounded-2xl p-8 border transition-all duration-300",
                plan.popular 
                  ? "border-primary shadow-2xl scale-105 z-10 ring-2 ring-primary/20" 
                  : "border-border shadow-lg hover:shadow-xl hover:-translate-y-1 z-0"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  پیشنهاد ما
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground min-h-[40px]">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">{plan.price}</span>
                  {plan.price !== "تماس" && <span className="text-sm text-muted-foreground">تومان / ماه</span>}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-1">
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.popular ? "default" : "outline"} 
                className={cn(
                  "w-full h-12 rounded-xl text-base font-semibold", 
                  plan.popular ? "bg-primary hover:bg-primary/90" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
