"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getPlanFromCloud, BusinessPlan } from "@/lib/db";
import { Copy, Check, Palette, Type, Image as ImageIcon, Sparkles } from "lucide-react";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BrandKitPage() {
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (user && !authLoading) {
      getPlanFromCloud(user.uid).then(setPlan);
    }
  }, [user, authLoading]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!plan) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center animate-pulse">
          <Palette size={32} className="text-white" />
        </div>
        <p className="text-muted-foreground">در حال بارگذاری هویت بصری...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-foreground">هویت بصری برند</h1>
            <Badge variant="gradient" size="sm">
              <Sparkles size={12} />
              هوش مصنوعی
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">
            طراحی شده بر اساس روانشناسی مخاطب: <span className="text-foreground font-bold">{plan.audience}</span>
          </p>
        </div>
      </div>

      {/* 1. Colors */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CardIcon variant="accent" className="w-10 h-10">
            <Palette size={20} />
          </CardIcon>
          <span className="font-bold text-sm uppercase tracking-wider">پالت رنگی اختصاصی</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { label: "رنگ اصلی", hex: plan.brandKit.primaryColorHex, gradient: "from-primary to-purple-600" },
            { label: "رنگ مکمل", hex: plan.brandKit.secondaryColorHex, gradient: "from-secondary to-emerald-600" }
          ].map((color, idx) => (
            <Card 
              key={idx} 
              variant="glass" 
              hover="lift"
              padding="sm"
              className="overflow-hidden"
            >
              <div 
                className="h-40 w-full rounded-xl shadow-inner transition-transform hover:scale-[1.02] relative overflow-hidden" 
                style={{ backgroundColor: color.hex }}
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              </div>
              <div className="p-4 flex justify-between items-center">
                <div>
                  <div className="text-muted-foreground text-sm mb-1">{color.label}</div>
                  <div className="text-2xl font-mono font-bold text-foreground">{color.hex}</div>
                </div>
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(color.hex)}
                  className="hover:bg-muted"
                >
                  {copied === color.hex ? (
                    <Check size={20} className="text-secondary" />
                  ) : (
                    <Copy size={20} />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Psychology Note */}
        <Card variant="muted" className="border-l-4 border-l-accent">
          <span className="font-bold text-foreground block mb-2">چرا این رنگ‌ها؟</span>
          <p className="text-muted-foreground leading-relaxed">
            {plan.brandKit.colorPsychology}
          </p>
        </Card>
      </section>

      <hr className="border-border" />

      {/* 2. Typography */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CardIcon variant="primary" className="w-10 h-10">
            <Type size={20} />
          </CardIcon>
          <span className="font-bold text-sm uppercase tracking-wider">تایپوگرافی</span>
        </div>
        
        <Card variant="default" hover="glow" className="overflow-hidden">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-bold text-foreground">وزیرمتن (Vazirmatn)</h3>
              <p className="text-muted-foreground">استاندارد وب فارسی</p>
            </div>
            <Badge variant="muted" className="font-mono text-xs">
              font-family: 'Vazirmatn', sans-serif;
            </Badge>
          </div>
          
          <div className="space-y-6 p-6 bg-muted/50 rounded-2xl">
            <h1 className="text-4xl font-bold text-foreground">تیترهای جذاب و خوانا</h1>
            <h2 className="text-2xl font-semibold text-foreground/80">زیرتیترها با وزن متوسط</h2>
            <p className="text-muted-foreground leading-8">
              این یک نمونه متن پاراگراف است. فونت وزیرمتن به دلیل خوانایی بالا و ساختار هندسی مدرن، حس اعتماد و حرفه‌ای بودن را به کاربران شما منتقل می‌کند. اعداد در این فونت کاملا فارسی هستند: ۱۲۳۴۵۶
            </p>
          </div>
        </Card>
      </section>

      {/* 3. Logo Concepts */}
      <section className="space-y-6 pb-12">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CardIcon variant="secondary" className="w-10 h-10">
            <ImageIcon size={20} />
          </CardIcon>
          <span className="font-bold text-sm uppercase tracking-wider">ایده‌های لوگو</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plan.brandKit.logoConcepts?.map((logo: any, i: number) => (
            <Card 
              key={i} 
              variant="default"
              hover="lift"
              className="text-center"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="font-black text-xl">{i + 1}</span>
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">{logo.conceptName}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {logo.description}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
