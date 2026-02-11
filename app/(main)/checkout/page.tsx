"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck } from "lucide-react";
import { getPlanById } from "@/lib/payment/pricing";
import { formatPricePersian } from "@/lib/payment/gateways/zarinpal";
import { User } from "@supabase/supabase-js";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const planId = searchParams.get("plan");
  const cycle = searchParams.get("cycle") || "monthly";
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const plan = planId ? getPlanById(planId) : null;
  const isAnnual = cycle === "yearly";

  // Check auth
  useEffect(() => {
    const supabase = createClient();
    
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    };
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect if no plan selected
  useEffect(() => {
    if (!planId || !plan) {
      router.replace("/pricing");
    }
  }, [planId, plan, router]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      const returnUrl = encodeURIComponent(`/checkout?plan=${planId}&cycle=${cycle}`);
      router.push(`/auth?redirectTo=${returnUrl}`);
    }
  }, [authLoading, user, planId, cycle, router]);

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          billingCycle: cycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "خطا در ایجاد تراکنش");
      }

      if (data.url) {
        // Redirect to Zibal gateway
        window.location.href = data.url;
      } else {
        throw new Error("آدرس درگاه دریافت نشد");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "خطایی رخ داد. لطفاً مجددا تلاش کنید.");
      setLoading(false);
    }
  };

  if (authLoading || !plan) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate prices
  const monthlyPrice = plan.price.monthly;
  const yearlyPrice = plan.price.yearly;
  
  const finalPrice = isAnnual ? yearlyPrice * 12 : monthlyPrice;
  const originalPrice = isAnnual ? monthlyPrice * 12 : monthlyPrice;
  const savings = originalPrice - finalPrice;

  return (
    <div className="container max-w-lg py-20 px-4">
      <Card className="border-2 shadow-lg">
        <CardHeader className="text-center border-b bg-muted/30 pb-8 pt-8">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-black">تایید پرداخت</CardTitle>
          <p className="text-muted-foreground mt-2">
            شما در حال خرید اشتراک <span className="text-foreground font-bold">{plan.name}</span> هستید
          </p>
        </CardHeader>
        
        <CardContent className="pt-8 space-y-6">
          {/* Plan Details */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">طرح انتخابی:</span>
            <span className="font-bold">{plan.name}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">دوره پرداخت:</span>
            <span className="font-bold">{isAnnual ? "سالانه" : "ماهانه"}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">قیمت اصلی:</span>
            <span className={isAnnual ? "line-through text-muted-foreground/70" : ""}>
              {formatPricePersian(originalPrice)} تومان
            </span>
          </div>

          {isAnnual && (
            <div className="flex justify-between items-center text-sm text-green-600 font-medium">
              <span>تخفیف سالانه (۲۰٪):</span>
              <span>{formatPricePersian(savings)} - تومان</span>
            </div>
          )}

          <div className="h-px bg-border my-4" />

          <div className="flex justify-between items-center text-lg font-black">
            <span>مبلغ قابل پرداخت:</span>
            <span className="text-primary">{formatPricePersian(finalPrice)} تومان</span>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
              {error}
            </div>
          )}
        </CardContent>

        <CardFooter className="pb-8 pt-2 flex flex-col gap-4">
          <Button 
            size="lg" 
            className="w-full text-lg h-12 font-bold" 
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                در حال انتقال به درگاه...
              </>
            ) : (
              "پرداخت آنلاین"
            )}
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3 w-3" />
            <span>پرداخت امن با درگاه زیبال</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
