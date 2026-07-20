"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, Shield, RefreshCw, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import {
  PRICING_PLANS,
  formatPrice,
  getYearlySavingsPercent,
} from "@/lib/payment/pricing";
import { toPersianDigits } from "@/lib/utils";

const trustSignals = [
  { icon: Shield, text: "پرداخت امن از طریق درگاه زیبال" },
  { icon: RefreshCw, text: "لغو در هر زمان" },
  { icon: Headphones, text: "پشتیبانی از طریق ایمیل و تیکت" },
];

export const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="container relative z-10 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6">
            پلن مناسب{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              خودت رو انتخاب کن
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            شروع رایگان — بدون پرداخت تا وقتی آماده ارتقا باشی
          </p>

          <div className="inline-flex items-center gap-4 p-1.5 rounded-full bg-muted">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2.5 rounded-full font-bold transition-all ${
                !isYearly ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              ماهانه
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 ${
                isYearly ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              سالانه
              <span className="text-xs bg-gradient-to-r from-primary to-secondary text-white px-2 py-0.5 rounded-full">
                ۲۰٪ تخفیف
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan, index) => {
            const monthly = plan.price.monthly;
            const yearlyPerMonth =
              monthly === 0 ? 0 : Math.round(plan.price.yearly / 12);
            const displayPrice = isYearly ? yearlyPerMonth : monthly;
            const popular = Boolean(plan.highlighted);
            const checkoutHref =
              monthly === 0
                ? "/signup"
                : `/checkout?plan=${plan.id}&cycle=${isYearly ? "yearly" : "monthly"}`;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative group ${popular ? "lg:-mt-4 lg:mb-4" : ""}`}
              >
                {popular && (
                  <div className="absolute -top-4 start-1/2 -translate-x-1/2 z-20">
                    <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold shadow-lg">
                      <Sparkles className="w-4 h-4" />
                      {plan.badge ?? "محبوب‌ترین"}
                    </div>
                  </div>
                )}

                <div
                  className={`h-full rounded-3xl border p-8 transition-all duration-300 ${
                    popular
                      ? "border-primary bg-card shadow-xl shadow-primary/10"
                      : "border-border bg-card/50 hover:border-primary/30 hover:shadow-lg"
                  }`}
                >
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

                  <div className="mb-6">
                    {isYearly && monthly > 0 && (
                      <div className="text-lg text-muted-foreground line-through mb-1">
                        {formatPrice(monthly, false)}
                      </div>
                    )}
                    <span className="text-4xl font-black text-foreground">
                      {formatPrice(displayPrice, false)}
                    </span>
                    <span className="text-muted-foreground me-2"> تومان/ماه</span>
                    {isYearly && monthly > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        معادل سالانه {formatPrice(plan.price.yearly)} (
                        {toPersianDigits(String(getYearlySavingsPercent(plan)))}٪
                        صرفه‌جویی)
                      </p>
                    )}
                  </div>

                  <Link href={checkoutHref} className="block mb-8">
                    <Button
                      className={`w-full h-12 rounded-xl font-bold ${
                        popular
                          ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                          : ""
                      }`}
                      variant={popular ? "default" : "outline"}
                    >
                      {monthly === 0 ? "شروع رایگان" : `خرید ${plan.name}`}
                    </Button>
                  </Link>

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.name} className="flex items-start gap-3 text-sm">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mb-10 max-w-2xl mx-auto">
          واحد اعتبار AI: سبک ۱، استاندارد ۲، سنگین (مثل ساخت کامل نقشه راه) ۵، کوپایلوت با ابزار ۳،
          و تحقیق بازار عمیق ۸ واحد. تحقیق زنده وب در پرو و بالاتر؛ تحقیق عمیق فقط در تیم.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          {trustSignals.map((signal) => (
            <div key={signal.text} className="flex items-center gap-2">
              <signal.icon className="w-4 h-4 text-primary" />
              <span>{signal.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
