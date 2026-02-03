"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

const plans = [
  {
    name: "رایگان",
    monthlyPrice: "۰",
    period: "برای همیشه",
    description: "شروع کنید و امتحان کنید",
    features: [
      "۱ پروژه",
      "۱۰ درخواست AI",
      "نقشه راه پایه",
      "بوم کسب‌وکار",
    ],
    cta: "شروع رایگان",
    popular: false,
  },
  {
    name: "پلاس",
    monthlyPrice: "۲۹۹,۰۰۰",
    originalYearlyPrice: "۲۹۹,۰۰۰", // Original monthly price shown crossed
    yearlyPrice: "۲۳۹,۰۰۰", // Discounted monthly equivalent
    period: "تومان/ماه",
    description: "برای کارآفرینان جدی",
    features: [
      "۳ پروژه",
      "۵۰ درخواست AI",
      "نقشه راه کامل",
      "پیچ دک حرفه‌ای",
      "۲ عضو تیم",
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
      "۱۰ پروژه",
      "۲۰۰ درخواست AI",
      "تمام ابزارها",
      "تحلیل رقبا",
      "۵ عضو تیم",
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
      "۱۰۰۰ درخواست AI",
      "تمام ابزارها",
      "تیم نامحدود",
      "دسترسی API",
      "مشاوره اختصاصی",
    ],
    cta: "خرید اولترا",
    popular: false,
  },
];

export const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
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
              <span className="text-xs bg-gradient-to-r from-primary to-secondary text-white px-2 py-0.5 rounded-full">۲۰٪ تخفیف</span>
            </button>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative group ${plan.popular ? "lg:-mt-4 lg:mb-4" : ""}`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
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
                {/* Plan name */}
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                
                {/* Price */}
                <div className="mb-6">
                  {isYearly && plan.originalYearlyPrice ? (
                    <>
                      {/* Show crossed original price */}
                      <div className="text-lg text-muted-foreground line-through mb-1">
                        {plan.originalYearlyPrice}
                      </div>
                      {/* Show discounted price */}
                      <span className="text-4xl font-black text-foreground">
                        {plan.yearlyPrice}
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-black text-foreground">
                      {plan.monthlyPrice}
                    </span>
                  )}
                  <span className="text-muted-foreground mr-2">{plan.period}</span>
                </div>
                
                {/* CTA */}
                <Link href="/signup" className="block mb-8">
                  <Button 
                    className={`w-full h-12 rounded-xl font-bold ${
                      plan.popular 
                        ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white" 
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
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
      </div>
    </section>
  );
};
