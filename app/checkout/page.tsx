"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  ShieldCheck, 
  CreditCard, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { getPlanById, formatPrice } from "@/lib/payment/pricing";
import { createGateway } from "@/lib/payment";
import { BillingCycle } from "@/lib/payment/types";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  const planId = searchParams.get("planId") || "";
  const cycle = (searchParams.get("cycle") || "monthly") as BillingCycle;
  const amount = parseInt(searchParams.get("amount") || "0", 10);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const plan = getPlanById(planId);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/checkout?planId=${planId}&cycle=${cycle}&amount=${amount}`);
    }
  }, [user, authLoading, router, planId, cycle, amount]);
  
  // Validate plan
  if (!plan && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">پلن نامعتبر</h2>
          <p className="text-muted-foreground mb-6">پلن انتخاب شده یافت نشد.</p>
          <Link href="/pricing">
            <Button variant="outline">
              <ArrowRight size={16} />
              بازگشت به تعرفه‌ها
            </Button>
          </Link>
        </Card>
      </div>
    );
  }
  
  const handleCheckout = async () => {
    if (!user || !plan) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const gateway = createGateway("mock"); // Use mock for now
      
      const session = await gateway.createSession({
        amount,
        currency: "IRR",
        planId: plan.id,
        userId: user.uid,
        userEmail: user.email || undefined,
        returnUrl: `${window.location.origin}/dashboard?upgrade=success`,
        callbackUrl: `${window.location.origin}/api/payment/callback`,
        description: `خرید پلن ${plan.name} - ${cycle === "monthly" ? "ماهانه" : "سالانه"}`,
        metadata: {
          cycle,
        },
      });
      
      // Redirect to payment gateway
      router.push(session.redirectUrl);
    } catch (err) {
      console.error("Checkout error:", err);
      setError("خطا در ایجاد جلسه پرداخت. لطفاً دوباره تلاش کنید.");
      setLoading(false);
    }
  };
  
  if (authLoading || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Link */}
        <Link 
          href="/pricing" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowRight size={16} />
          بازگشت به تعرفه‌ها
        </Link>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <h1 className="text-2xl font-bold text-foreground mb-6">تکمیل خرید</h1>
              
              {/* Plan Details */}
              <div className="bg-muted/50 rounded-xl p-5 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {cycle === "monthly" ? "اشتراک ماهانه" : "اشتراک سالانه"}
                    </Badge>
                    <h2 className="text-xl font-bold text-foreground">{plan.name}</h2>
                    <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-black text-foreground">
                      {formatPrice(amount, false)}
                    </div>
                    <div className="text-xs text-muted-foreground">تومان</div>
                  </div>
                </div>
              </div>
              
              {/* Features Summary */}
              <div className="space-y-3 mb-6">
                <h3 className="font-medium text-foreground">ویژگی‌های پلن:</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {plan.features.filter(f => f.included).slice(0, 6).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      {feature.name}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* User Info */}
              {user && (
                <div className="border-t border-border pt-6">
                  <h3 className="font-medium text-foreground mb-3">اطلاعات کاربر</h3>
                  <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">
                        {user.displayName?.[0] || user.email?.[0] || "U"}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{user.displayName || "کاربر"}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-lg flex items-center gap-3">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}
            </Card>
          </div>
          
          {/* Payment Summary */}
          <div>
            <Card className="p-6 sticky top-6">
              <h2 className="font-bold text-foreground mb-4">خلاصه سفارش</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">پلن {plan.name}</span>
                  <span className="text-foreground">{formatPrice(amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">مالیات</span>
                  <span className="text-foreground">۰ تومان</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-bold text-foreground">مجموع</span>
                  <span className="font-bold text-foreground">{formatPrice(amount)}</span>
                </div>
              </div>
              
              <Button 
                onClick={handleCheckout}
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    در حال پردازش...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    پرداخت امن
                  </>
                )}
              </Button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck size={14} className="text-emerald-500" />
                پرداخت امن با شاپرک
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
