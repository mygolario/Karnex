"use client";

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
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
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
