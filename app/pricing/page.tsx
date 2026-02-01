"use client";

import { Check, ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const plans = [
  {
    id: "free",
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
    popular: false,
    priceNum: 0
  },
  {
    id: "pro",
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
    popular: true,
    priceNum: 99000
  },
  {
    id: "enterprise",
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
    popular: false,
    priceNum: 0
  }
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (plan: typeof plans[0]) => {
    if (plan.priceNum === 0) {
      if (plan.id === "enterprise") {
        router.push("/contact");
        return;
      }
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
          amount: plan.priceNum,
          isAnnual
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
                <div className="text-center max-w-3xl mx-auto mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium mb-6">
                    <Star className="w-4 h-4 fill-emerald-600" />
                    سرمایه‌گذاری هوشمندانه
                </div>
                <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                    انتخاب پلن مناسب برای <span className="text-primary">مسیر موفقیت</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    از نسخه رایگان برای تست استفاده کنید و هر زمان آماده بودید، قدرت کامل کارنکس را آزاد کنید.
                </p>

                <div className="flex items-center justify-center gap-4 mb-8 bg-muted/30 p-2 rounded-full w-fit mx-auto border border-border">
                    <button
                        onClick={() => setIsAnnual(false)}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-bold transition-all",
                            !isAnnual ? "bg-white dark:bg-slate-800 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        ماهانه
                    </button>
                    <button
                        onClick={() => setIsAnnual(true)}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-bold transition-all relative",
                            isAnnual ? "bg-white dark:bg-slate-800 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        سالانه
                        <span className="absolute -top-3 -left-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                            ۲۰٪ تخفیف
                        </span>
                    </button>
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
                {plans.map((plan) => (
                    <div
                    key={plan.id}
                    className={cn(
                        "relative bg-card rounded-3xl p-8 border transition-all duration-300 flex flex-col",
                        plan.popular 
                        ? "border-primary shadow-2xl scale-105 z-10 ring-2 ring-primary/20" 
                        : "border-border shadow-lg hover:shadow-xl hover:-translate-y-1 z-0"
                    )}
                    >
                    {plan.popular && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-lg">
                        محبوب‌ترین
                        </div>
                    )}
                    
                    <div className="mb-6">
                        <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground min-h-[40px] leading-relaxed">{plan.description}</p>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-foreground">{plan.price}</span>
                        {plan.price !== "تماس" && <span className="text-sm font-medium text-muted-foreground">تومان / ماه</span>}
                        </div>
                    </div>

                    <div className="flex-1">
                        <ul className="space-y-4 mb-8">
                            {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3 text-sm font-medium">
                                <div className="mt-0.5 rounded-full bg-emerald-500/10 p-1 shrink-0">
                                <Check className="h-3 w-3 text-emerald-600" />
                                </div>
                                <span className="text-foreground/80">{feature}</span>
                            </li>
                            ))}
                        </ul>
                    </div>

                    <Button 
                        onClick={() => handlePurchase(plan)}
                        disabled={loading === plan.id}
                        variant={plan.popular ? "default" : "outline"} 
                        className={cn(
                        "w-full h-14 rounded-2xl text-base font-bold transition-all shadow-sm", 
                        plan.popular 
                            ? "bg-primary hover:bg-primary/90 hover:scale-[1.02] shadow-primary/25" 
                            : "border-border hover:bg-muted hover:border-primary/50"
                        )}
                    >
                        {loading === plan.id ? "در حال پردازش..." : plan.cta}
                        {plan.popular && !loading && <ArrowLeft className="mr-2 h-4 w-4" />}
                    </Button>
                    </div>
                ))}
                </div>
            </section>
        </main>
        
        <Footer />
    </div>
  );
}
