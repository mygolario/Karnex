
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardIcon } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle2, XCircle, Zap, Star, ShieldCheck, ArrowLeft } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      id: "starter",
      name: "رایگان",
      price: "۰",
      period: "برای همیشه",
      description: "برای تست و ساخت اولین پروژه",
      features: [
        { name: "ساخت ۱ پروژه کامل", included: true },
        { name: "بوم کسب‌وکار پایه", included: true },
        { name: "خروجی PDF ساده", included: true },
        { name: "هوش مصنوعی محدود", included: true },
        { name: "دسترسی به ابزارهای پیشرفته", included: false },
        { name: "مشاوره اختصاصی", included: false },
      ],
      cta: "شروع رایگان",
      ctaLink: "/new-project",
      variant: "outline",
      popular: false
    },
    {
      id: "pro",
      name: "حرفه‌ای",
      price: "۲۹۹,۰۰۰",
      period: "ماهانه",
      description: "برای استارتاپ‌ها و کارآفرینان جدی",
      features: [
        { name: "پروژه نامحدود", included: true },
        { name: "بوم کسب‌وکار پیشرفته (Miro-style)", included: true },
        { name: "خروجی PDF و Word حرفه‌ای", included: true },
        { name: "هوش مصنوعی GPT-4", included: true },
        { name: "تحلیل رقبا و بازار", included: true },
        { name: "پشتیبانی اولویت‌دار", included: true },
      ],
      cta: "خرید اشتراک",
      ctaLink: "/api/pay?planId=pro_monthly",
      variant: "gradient",
      popular: true
    },
    {
      id: "business",
      name: "تجاری",
      price: "۲,۹۹۰,۰۰۰",
      period: "سالانه (۲ ماه رایگان)",
      description: "برای شرکت‌ها و تیم‌های بزرگ",
      features: [
        { name: "همه امکانات پلن حرفه‌ای", included: true },
        { name: "دسترسی تیمی (تا ۵ نفر)", included: true },
        { name: "مشاور اختصاصی هوشمند", included: true },
        { name: "API اختصاصی", included: true },
        { name: "سفارشی‌سازی برندینگ", included: true },
        { name: "گارانتی بازگشت وجه ۳۰ روزه", included: true },
      ],
      cta: "خرید اشتراک سالانه",
      ctaLink: "/api/pay?planId=pro_yearly",
      variant: "default",
      popular: false
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background" dir="rtl">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="section-container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge variant="gradient" size="lg" className="mx-auto mb-4">
              <Zap size={14} className="mr-1" />
              تعرفه‌ها
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
              سرمایه‌گذاری روی <span className="text-gradient">آینده</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              با هزینه‌ای کمتر از یک شام، یک دستیار هوشمند و تمام وقت برای کسب‌وکارتان استخدام کنید.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {plans.map((plan) => (
              <div key={plan.id} className={`relative group ${plan.popular ? 'md:-mt-4' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center z-10">
                    <span className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Star size={12} className="fill-current" />
                      پیشنهاد ویژه
                    </span>
                  </div>
                )}
                
                <Card 
                  variant={plan.popular ? "gradient" : "default"} 
                  className={`relative p-8 h-full flex flex-col ${plan.popular ? 'border-primary shadow-2xl scale-105 z-10' : 'hover:border-primary/50'}`}
                >
                  <div className="mb-6">
                    <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-foreground'}`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black ${plan.popular ? 'text-white' : 'text-foreground'}`}>
                        {plan.price}
                      </span>
                      <span className={`text-sm ${plan.popular ? 'text-white/80' : 'text-muted-foreground'}`}>
                        تومان / {plan.period}
                      </span>
                    </div>
                    <p className={`mt-4 text-sm ${plan.popular ? 'text-white/90' : 'text-muted-foreground'}`}>
                      {plan.description}
                    </p>
                  </div>

                  <hr className={`border-t mb-6 ${plan.popular ? 'border-white/20' : 'border-border'}`} />

                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        {feature.included ? (
                          <CheckCircle2 size={18} className={`shrink-0 ${plan.popular ? 'text-white' : 'text-green-500'}`} />
                        ) : (
                          <XCircle size={18} className={`shrink-0 ${plan.popular ? 'text-white/30' : 'text-muted-foreground/30'}`} />
                        )}
                        <span className={plan.popular ? 'text-white/90' : (feature.included ? 'text-foreground' : 'text-muted-foreground/60')}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.ctaLink} className="block mt-auto">
                    <Button 
                      variant={plan.popular ? "white" : (plan.id === 'starter' ? "outline" : "default")} 
                      size="lg" 
                      className="w-full font-bold shadow-lg"
                    >
                      {plan.cta}
                      {plan.id !== 'starter' && <ArrowLeft size={18} />}
                    </Button>
                  </Link>
                </Card>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full text-sm text-muted-foreground">
              <ShieldCheck size={16} />
              کلیه پرداخت‌ها توسط شبکه شتاب و درگاه ایمن زرین‌بال/زیبال پردازش می‌شوند.
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
