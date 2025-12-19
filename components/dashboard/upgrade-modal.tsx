"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export function UpgradeModal({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleUpgrade = () => {
    router.push("/pay/mock?planId=pro_monthly");
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md">
            <Zap className="ml-2 h-4 w-4" />
            ارتقا به نسخه حرفه‌ای
          </Button>
        )}
      </SheetTrigger>
      {/* Side "bottom" for mobile, "left" or "right" for desktop depending on RTL. 
          Given it's Global RTL, "right" in code (sheet default) appears on right? 
          Actually Sheet default is right. In RTL it might mean left visually if not handled.
          I'll just let it be default or set side specifically if needed. 
          ClaimAccountModal used side="bottom" then sm:side-right. 
          I'll use similar styling. */}
      <SheetContent className="sm:max-w-[425px] text-right" side="left">
        <SheetHeader className="text-right">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2 justify-end">
             <span>کارنکس</span>
             <span className="text-purple-600">نسخه حرفه‌ای</span>
          </SheetTitle>
        </SheetHeader>
        <div className="py-8 space-y-6">
          <p className="text-slate-600 leading-7">
            با ارتقا به نسخه حرفه‌ای، به تمام امکانات دسترسی داشته باشید:
          </p>
          <ul className="space-y-4">
            {[
              "دسترسی نامحدود به هوش مصنوعی",
              "خروجی PDF بدون واترمارک",
              "تحلیل‌های پیشرفته بازار",
              "پشتیبانی اختصاصی"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <div className="bg-green-100 text-green-600 rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-end justify-between">
            <div>
                <span className="text-3xl font-black text-slate-900">299,000</span>
                <span className="text-xs text-slate-500 mr-1">تومان / ماهانه</span>
            </div>
            <div className="line-through text-slate-400 text-sm mb-1">450,000</div>
          </div>
          
          <Button 
            onClick={handleUpgrade} 
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg shadow-lg shadow-purple-200"
          >
            پرداخت و ارتقا
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
