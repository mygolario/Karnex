"use client";

import { Check, ArrowLeft, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const plans = [
  {
    id: "free",
    name: "رایگان",
    monthlyPrice: 0,
    priceLabel: "۰",
    period: "برای همیشه",
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
    id: "plus",
    name: "پلاس",
    monthlyPrice: 299000,
    priceLabel: "۲۹۹,۰۰۰",
    originalYearlyPrice: "۲۹۹,۰۰۰",
    yearlyPriceLabel: "۲۳۹,۰۰۰",
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
    id: "pro",
    name: "پرو",
    monthlyPrice: 699000,
    priceLabel: "۶۹۹,۰۰۰",
    originalYearlyPrice: "۶۹۹,۰۰۰",
    yearlyPriceLabel: "۵۵۹,۰۰۰",
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
    id: "ultra",
    name: "اولترا",
    monthlyPrice: 1490000,
    priceLabel: "۱,۴۹۰,۰۰۰",
    originalYearlyPrice: "۱,۴۹۰,۰۰۰",
    yearlyPriceLabel: "۱,۱۹۲,۰۰۰",
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
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) {
      router.push("/signup");
      return;
    }

    setLoading(plan.id);
    try {
      const res = await fetch("/api/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle: isAnnual ? 'yearly' : 'monthly'
        }),
      });

      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("خطا در اتصال به درگاه پرداخت");
      }
    } catch (error) {
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
                
                {/* Header */}
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
                        بدون نیاز به کارت اعتباری برای شروع
                    </motion.p>

                    {/* Toggle */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-4 p-1.5 rounded-full bg-muted border border-border"
                    >
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={cn(
                                "px-6 py-2.5 rounded-full font-bold transition-all",
                                !isAnnual ? "bg-white dark:bg-slate-800 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            ماهانه
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={cn(
                                "px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 relative",
                                isAnnual ? "bg-white dark:bg-slate-800 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            سالانه
                            <span className="text-xs bg-gradient-to-r from-primary to-secondary text-white px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                ۲۰٪ تخفیف
                            </span>
                        </button>
                    </motion.div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-start">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.4 }}
                            className={cn(
                                "relative bg-card rounded-3xl p-6 border transition-all duration-300 flex flex-col h-full",
                                plan.popular 
                                ? "border-primary shadow-2xl scale-105 z-10 ring-2 ring-primary/20 lg:-mt-4 lg:mb-4" 
                                : "border-border shadow-lg hover:shadow-xl hover:-translate-y-1 z-0"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                    <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold shadow-lg whitespace-nowrap">
                                        <Sparkles className="w-3 h-3" />
                                        محبوب‌ترین
                                    </div>
                                </div>
                            )}
                            
                            <div className="mb-6">
                                <h3 className="text-xl font-black mb-2">{plan.name}</h3>
                                <p className="text-xs text-muted-foreground min-h-[40px] leading-relaxed">{plan.description}</p>
                            </div>

                            <div className="mb-6">
                                <div className="flex flex-col">
                                    {isAnnual && plan.originalYearlyPrice ? (
                                        <>
                                            <span className="text-sm text-muted-foreground line-through mb-1 opacity-70">
                                                {plan.originalYearlyPrice}
                                            </span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-foreground">{plan.yearlyPriceLabel}</span>
                                                <span className="text-xs font-medium text-muted-foreground">{plan.period}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-foreground">{plan.priceLabel}</span>
                                            <span className="text-xs font-medium text-muted-foreground">{plan.period}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6">
                                <Button 
                                    onClick={() => handlePurchase(plan)}
                                    disabled={loading === plan.id}
                                    variant={plan.popular ? "default" : "outline"} 
                                    className={cn(
                                        "w-full h-12 rounded-xl text-sm font-bold transition-all shadow-sm", 
                                        plan.popular 
                                            ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-primary/25" 
                                            : "border-border hover:bg-muted hover:border-primary/50"
                                    )}
                                >
                                    {loading === plan.id ? "در حال پردازش..." : plan.cta}
                                </Button>
                            </div>

                            <div className="flex-1">
                                <p className="text-xs font-bold text-foreground mb-4 opacity-80">شامل:</p>
                                <ul className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-xs font-medium">
                                            <div className={cn(
                                                "mt-0.5 rounded-full p-0.5 shrink-0",
                                                plan.popular ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                            )}>
                                                <Check className="h-3 w-3" />
                                            </div>
                                            <span className="text-foreground/80 leading-snug">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </main>
        
        <Footer />
    </div>
  );
}
