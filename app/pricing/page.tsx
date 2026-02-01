"use client";

<<<<<<< HEAD
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Check, 
  X, 
  Sparkles, 
  Zap, 
  Users, 
  Crown,
  ArrowLeft,
  HelpCircle
} from "lucide-react";
import { 
  PRICING_PLANS, 
  formatPrice, 
  getYearlySavingsPercent 
} from "@/lib/payment/pricing";
import { PricingPlan, BillingCycle } from "@/lib/payment/types";

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const handleSelectPlan = (plan: PricingPlan) => {
    if (plan.tier === "free") {
      // Free plan - just redirect to signup/dashboard
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/signup");
      }
      return;
    }

    // Paid plan - go to checkout
    const price = billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly;
    router.push(`/checkout?planId=${plan.id}&cycle=${billingCycle}&amount=${price}`);
  };

  const tierIcons = {
    free: Zap,
    pro: Sparkles,
    team: Users,
    enterprise: Crown,
=======
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
>>>>>>> Karnex-Completion
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
<<<<<<< HEAD
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg">
              <img src="/logo.png" alt="کارنکس" className="w-8 h-8 object-cover" />
            </div>
            <span className="font-bold text-xl">کارنکس</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  داشبورد
                  <ArrowLeft size={16} />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">ورود</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" size="sm">ثبت‌نام رایگان</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <Badge variant="outline" className="mb-6">
            <Sparkles size={12} className="ml-1" />
            تعرفه‌های ساده و شفاف
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-6">
            پلنی که متناسب با نیازتان است
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            با هر بودجه‌ای می‌توانید شروع کنید. بدون قرارداد بلندمدت، هر وقت خواستید لغو کنید.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 bg-muted rounded-full">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ماهانه
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              سالانه
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none text-xs">
                ۲ ماه رایگان
              </Badge>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan) => {
              const TierIcon = tierIcons[plan.tier];
              const price = billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly;
              const savingsPercent = getYearlySavingsPercent(plan);

              return (
                <Card
                  key={plan.id}
                  variant={plan.highlighted ? "gradient" : "default"}
                  className={`relative p-6 flex flex-col ${
                    plan.highlighted 
                      ? "text-white border-2 border-primary/20 scale-105 shadow-2xl shadow-primary/20" 
                      : "border-2 border-transparent hover:border-primary/10"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <Badge 
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 ${
                        plan.highlighted 
                          ? "bg-white text-primary" 
                          : "bg-primary text-white"
                      }`}
                    >
                      {plan.badge}
                    </Badge>
                  )}

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      plan.highlighted 
                        ? "bg-white/20" 
                        : "bg-primary/10"
                    }`}>
                      <TierIcon size={24} className={plan.highlighted ? "text-white" : "text-primary"} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${plan.highlighted ? "text-white" : "text-foreground"}`}>
                        {plan.name}
                      </h3>
                      <p className={`text-sm ${plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black ${plan.highlighted ? "text-white" : "text-foreground"}`}>
                        {price === 0 ? "رایگان" : formatPrice(price, false)}
                      </span>
                      {price > 0 && (
                        <span className={`text-sm ${plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>
                          تومان / {billingCycle === "monthly" ? "ماه" : "سال"}
                        </span>
                      )}
                    </div>
                    {billingCycle === "yearly" && savingsPercent > 0 && (
                      <p className={`text-sm mt-1 ${plan.highlighted ? "text-emerald-300" : "text-emerald-600"}`}>
                        {savingsPercent}% صرفه‌جویی
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    variant={plan.highlighted ? "secondary" : plan.tier === "free" ? "outline" : "default"}
                    size="lg"
                    className={`w-full mb-6 ${
                      plan.highlighted 
                        ? "bg-white text-primary hover:bg-white/90" 
                        : ""
                    }`}
                  >
                    {plan.tier === "free" ? "شروع رایگان" : "انتخاب پلن"}
                    <ArrowLeft size={16} />
                  </Button>

                  {/* Features */}
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          feature.included 
                            ? plan.highlighted 
                              ? "bg-white/20 text-white" 
                              : "bg-emerald-500/10 text-emerald-600"
                            : plan.highlighted
                              ? "bg-white/10 text-white/40"
                              : "bg-muted text-muted-foreground"
                        }`}>
                          {feature.included ? <Check size={12} /> : <X size={12} />}
                        </div>
                        <span className={`text-sm ${
                          feature.included 
                            ? plan.highlighted ? "text-white" : "text-foreground"
                            : plan.highlighted ? "text-white/50" : "text-muted-foreground"
                        }`}>
                          {feature.name}
                          {feature.limit && (
                            <span className={`mr-1 ${plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>
                              ({feature.limit})
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">سوالات متداول</h2>
            <p className="text-muted-foreground">پاسخ سوالات رایج درباره تعرفه‌ها</p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => (
              <Card key={idx} variant="default" className="p-5">
                <div className="flex items-start gap-3">
                  <HelpCircle size={20} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-foreground mb-2">{item.question}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-emerald-500" />
              پرداخت امن
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-emerald-500" />
              بدون قرارداد بلندمدت
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-emerald-500" />
              لغو هر زمان
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-emerald-500" />
              پشتیبانی ۲۴/۷
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const FAQ_ITEMS = [
  {
    question: "آیا می‌توانم پلن را تغییر دهم؟",
    answer: "بله، هر زمان می‌توانید پلن خود را ارتقا یا تغییر دهید. در صورت ارتقا، تفاوت هزینه به صورت تناسبی محاسبه می‌شود."
  },
  {
    question: "روش‌های پرداخت چیست؟",
    answer: "تمام کارت‌های بانکی عضو شبکه شتاب پشتیبانی می‌شوند. پرداخت از طریق درگاه امن بانکی انجام می‌شود."
  },
  {
    question: "آیا امکان بازگشت وجه وجود دارد؟",
    answer: "در صورت عدم رضایت، تا ۷ روز پس از خرید می‌توانید درخواست بازگشت وجه بدهید."
  },
  {
    question: "محدودیت استفاده از AI چگونه است؟",
    answer: "هر پلن تعداد مشخصی درخواست AI در ماه دارد. پس از اتمام، می‌توانید ارتقا دهید یا منتظر ماه بعد باشید."
  },
];
=======
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
>>>>>>> Karnex-Completion
