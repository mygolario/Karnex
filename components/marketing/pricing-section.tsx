"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, Phone, Shield, RefreshCw, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

const plans = [
  {
    name: "رایگان",
    monthlyPrice: "۰",
    yearlyPrice: "۰",
    period: "تومان/ماه",
    description: "شروع کنید و امتحان کنید",
    features: [
      "۱ پروژه فعال",
      "۲۰ درخواست AI در ماه",
      "دسترسی به تمام امکانات",
      "تمام حالت‌های داشبورد",
    ],
    cta: "شروع رایگان",
    popular: false,
  },
  {
    name: "پلاس",
    monthlyPrice: "۲۹۹,۰۰۰",
    originalYearlyPrice: "۲۹۹,۰۰۰",
    yearlyPrice: "۲۳۹,۰۰۰",
    period: "تومان/ماه",
    description: "برای کارآفرینان جدی",
    features: [
      "۵ پروژه فعال",
      "۱۰۰ درخواست AI در ماه",
      "دسترسی به تمام امکانات",
      "تمام حالت‌های داشبورد",
    ],
    cta: "خرید پلاس",
    popular: false,
  },
  {
    name: "پرو",
    monthlyPrice: "۶۹۹,۰۰۰",
    originalYearlyPrice: "۶۹۹,۰۰۰",
    yearlyPrice: "۵۵۹,۰۰۰",
    period: "تومان/ماه",
    description: "محبوب‌ترین انتخاب",
    features: [
      "۱۵ پروژه فعال",
      "۵۰۰ درخواست AI در ماه",
      "دسترسی به تمام امکانات",
      "تمام حالت‌های داشبورد",
      "پشتیبانی اولویت‌دار",
    ],
    cta: "خرید پرو",
    popular: true,
  },
  {
    name: "اولترا",
    monthlyPrice: "۱,۴۹۰,۰۰۰",
    originalYearlyPrice: "۱,۴۹۰,۰۰۰",
    yearlyPrice: "۱,۱۹۲,۰۰۰",
    period: "تومان/ماه",
    description: "بدون محدودیت",
    features: [
      "پروژه نامحدود",
      "۲,۰۰۰ درخواست AI در ماه",
      "دسترسی به تمام امکانات",
      "تمام حالت‌های داشبورد",
      "پشتیبانی اولویت‌دار",
      "مشاوره اختصاصی",
    ],
    cta: "خرید اولترا",
    popular: false,
    contactSales: true,
  },
];

const trustSignals = [
  { icon: Shield, text: "پرداخت امن از طریق درگاه زیبال" },
  { icon: RefreshCw, text: "لغو در هر زمان" },
  { icon: Headphones, text: "پشتیبانی ۲۴/۷" },
];

export const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="container relative z-10 px-4 md:px-6">
        {/* Header */}
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
            بدون نیاز به کارت اعتباری برای شروع
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 rounded-full bg-muted">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2.5 rounded-full font-bold transition-all ${
                !isYearly ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              ماهانه
            </button>
            <button
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

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative group ${plan.popular ? "lg:-mt-4 lg:mb-4" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 start-1/2 -translate-x-1/2 z-20">
                  <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    محبوب‌ترین
                  </div>
                </div>
              )}

              <div className={`h-full rounded-3xl border p-8 transition-all duration-300 ${
                plan.popular
                  ? "border-primary bg-card shadow-xl shadow-primary/10"
                  : "border-border bg-card/50 hover:border-primary/30 hover:shadow-lg"
              }`}>
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  {isYearly && plan.originalYearlyPrice ? (
                    <>
                      <div className="text-lg text-muted-foreground line-through mb-1">
                        {plan.originalYearlyPrice}
                      </div>
                      <span className="text-4xl font-black text-foreground">
                        {plan.yearlyPrice}
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-black text-foreground">
                      {plan.monthlyPrice}
                    </span>
                  )}
                  <span className="text-muted-foreground me-2"> {plan.period}</span>
                </div>

                {/* CTA */}
                <Link
                  href={plan.monthlyPrice === "۰"
                    ? "/signup"
                    : plan.contactSales
                    ? "/contact?subject=اشتراک اولترا"
                    : `/checkout?plan=${plan.name === "پلاس" ? "plus" : plan.name === "پرو" ? "pro" : "ultra"}&cycle=${isYearly ? "yearly" : "monthly"}`
                  }
                  className="block mb-8"
                >
                  <Button
                    className={`w-full h-12 rounded-xl font-bold ${
                      plan.popular
                        ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.contactSales && <Phone className="w-4 h-4 ms-2" />}
                    {plan.contactSales ? "تماس با فروش" : plan.cta}
                  </Button>
                </Link>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className={`w-5 h-5 shrink-0 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-6 lg:gap-12"
        >
          {trustSignals.map((signal) => (
            <div key={signal.text} className="flex items-center gap-2 text-sm text-muted-foreground">
              <signal.icon className="w-5 h-5 text-primary" />
              {signal.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
