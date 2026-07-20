"use client";

import { Check, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn, toPersianDigits } from "@/lib/utils";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  PRICING_PLANS,
  formatPrice,
  getYearlySavingsPercent,
} from "@/lib/payment/pricing";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (planId: string, monthlyPrice: number) => {
    if (monthlyPrice === 0) {
      router.push("/signup");
      return;
    }

    setLoading(planId);
    try {
      const res = await fetch("/api/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          billingCycle: isAnnual ? "yearly" : "monthly",
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("خطا در اتصال به درگاه پرداخت");
      }
    } catch {
      toast.error("خطا در پردازش درخواست");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />

      <main className="pt-32 pb-24">
        <section className="relative z-10 container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium mb-6"
            >
              <Star className="w-4 h-4 fill-emerald-600" />
              سرمایه‌گذاری هوشمندانه
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
            >
              پلن مناسب <span className="text-primary">خودت رو انتخاب کن</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8"
            >
              شروع رایگان — بدون پرداخت تا وقتی آماده ارتقا باشی
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-4 p-1.5 rounded-full bg-muted border border-border"
            >
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "px-6 py-2.5 rounded-full font-bold transition-all",
                  !isAnnual
                    ? "bg-white dark:bg-slate-800 shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                ماهانه
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 relative",
                  isAnnual
                    ? "bg-white dark:bg-slate-800 shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                سالانه
                <span className="text-xs bg-gradient-to-r from-primary to-secondary text-white px-2 py-0.5 rounded-full shadow-sm">
                  ۲۰٪ تخفیف
                </span>
              </button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {PRICING_PLANS.map((plan, index) => {
              const monthly = plan.price.monthly;
              const yearlyPerMonth =
                monthly === 0 ? 0 : Math.round(plan.price.yearly / 12);
              const displayPrice = isAnnual ? yearlyPerMonth : monthly;
              const popular = Boolean(plan.highlighted);

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className={cn(
                    "relative bg-card rounded-3xl p-6 border transition-all duration-300 flex flex-col h-full",
                    popular
                      ? "border-primary shadow-2xl scale-105 z-10 ring-2 ring-primary/20 lg:-mt-4 lg:mb-4"
                      : "border-border shadow-lg hover:shadow-xl hover:-translate-y-1 z-0",
                  )}
                >
                  {popular && (
                    <div className="absolute -top-4 start-1/2 -translate-x-1/2 z-20">
                      <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold shadow-lg whitespace-nowrap">
                        <Sparkles className="w-3 h-3" />
                        {plan.badge ?? "محبوب‌ترین"}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-black mb-2">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground min-h-[40px] leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    {isAnnual && monthly > 0 && (
                      <span className="text-sm text-muted-foreground line-through mb-1 opacity-70 block">
                        {formatPrice(monthly, false)}
                      </span>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-foreground">
                        {formatPrice(displayPrice, false)}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        تومان/ماه
                      </span>
                    </div>
                    {isAnnual && monthly > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        سالانه {formatPrice(plan.price.yearly)} (
                        {toPersianDigits(String(getYearlySavingsPercent(plan)))}٪
                        صرفه‌جویی)
                      </p>
                    )}
                  </div>

                  <div className="mb-6">
                    <Button
                      onClick={() => handlePurchase(plan.id, monthly)}
                      disabled={loading === plan.id}
                      variant={popular ? "default" : "outline"}
                      className={cn(
                        "w-full h-12 rounded-xl text-sm font-bold transition-all shadow-sm",
                        popular
                          ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-primary/25"
                          : "border-border hover:bg-muted hover:border-primary/50",
                      )}
                    >
                      {loading === plan.id
                        ? "در حال پردازش..."
                        : monthly === 0
                          ? "شروع رایگان"
                          : `خرید ${plan.name}`}
                    </Button>
                  </div>

                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground mb-4 opacity-80">شامل:</p>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature.name}
                          className="flex items-start gap-2 text-xs font-medium"
                        >
                          <div
                            className={cn(
                              "mt-0.5 rounded-full p-0.5 shrink-0",
                              popular
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            <Check className="h-3 w-3" />
                          </div>
                          <span className="text-foreground/80 leading-snug">
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-10 max-w-2xl mx-auto">
            واحد اعتبار AI: سبک ۱، استاندارد ۲، سنگین ۵، کوپایلوت با ابزار ۳، تحقیق عمیق ۸.
            تحقیق زنده وب در پرو و بالاتر؛ تحقیق عمیق فقط در تیم.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
