"use client";

import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  X, 
  Check, 
  Sparkles,
  Zap,
  Shield,
  Users,
  Infinity,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UpgradeModalProps {
  children?: ReactNode;
}

export function UpgradeModal({ children }: UpgradeModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const features = [
    { icon: Infinity, label: "نسل‌های نامحدود" },
    { icon: Zap, label: "دسترسی به مدل‌های پیشرفته" },
    { icon: Shield, label: "پشتیبانی اولویت‌دار" },
    { icon: Users, label: "همکاری تیمی" },
  ];

  return (
    <>
      {/* Trigger: either children or default button */}
      {children ? (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <Button
          variant="gradient"
          size="sm"
          className="w-full"
          onClick={() => setIsOpen(true)}
        >
          <Crown size={14} />
          ارتقا به پرو
        </Button>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <div 
            className="relative w-full max-w-lg animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <Card variant="default" padding="none" className="overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-primary via-purple-600 to-secondary p-8 text-white text-center">
                {/* Background Pattern */}
                <div className="absolute inset-0 pattern-dots opacity-10" />
                
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 left-4 text-white/80 hover:text-white hover:bg-white/10"
                >
                  <X size={18} />
                </Button>
                
                {/* Icon */}
                <div className="relative inline-flex mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Crown size={32} />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Badge variant="gradient" size="sm" className="bg-accent text-accent-foreground">
                      <Sparkles size={10} />
                      ویژه
                    </Badge>
                  </div>
                </div>
                
                <h2 className="text-2xl font-black mb-2">ارتقا به نسخه پرو</h2>
                <p className="text-white/80">دسترسی کامل به همه امکانات</p>
              </div>

              {/* Features */}
              <div className="p-6 space-y-4">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <feature.icon size={20} />
                    </div>
                    <span className="font-medium text-foreground">{feature.label}</span>
                    <Check size={18} className="mr-auto text-secondary" />
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="px-6 pb-6">
                <div className="bg-muted/50 rounded-2xl p-6 text-center mb-4">
                  <div className="text-sm text-muted-foreground mb-1">فقط با</div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black text-foreground">۹۹,۰۰۰</span>
                    <span className="text-muted-foreground">تومان/ماه</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    با خرید سالانه ۲۰٪ تخفیف بگیرید
                  </div>
                </div>

                <Button
                  variant="gradient"
                  size="xl"
                  className="w-full"
                  onClick={() => alert("به زودی!")}
                >
                  شروع دوره آزمایشی رایگان
                  <ArrowLeft size={18} />
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  ۷ روز استفاده رایگان • لغو در هر زمان
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
