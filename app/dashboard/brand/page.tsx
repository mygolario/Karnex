"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Copy, Check, Palette, Type, Image as ImageIcon, Sparkles, Lightbulb, Smartphone, Info } from "lucide-react";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HoverExplainer } from "@/components/ui/explainer";
import { LearnMore } from "@/components/ui/learn-more";
import { brandKitExplanations, featureExplanations } from "@/lib/knowledge-base";
import { BrandVisualizer } from "@/components/dashboard/brand-visualizer";

export default function BrandKitPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading } = useProject();
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading || !plan) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-secondary to-pink-500 flex items-center justify-center animate-pulse shadow-xl shadow-secondary/20">
          <Palette size={40} className="text-white" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">در حال استخراج هویت برند...</p>
      </div>
    );
  }

  const primaryHex = plan.brandKit.primaryColorHex;
  const secondaryHex = plan.brandKit.secondaryColorHex;
  const colors = [primaryHex, secondaryHex];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <div className="text-center md:text-right flex flex-col md:flex-row items-center justify-between gap-6 bg-card border border-border p-8 rounded-3xl">
        <div>
          <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
            <h1 className="text-3xl font-black text-foreground">هویت بصری برند</h1>
            <Badge variant="gradient" size="sm" className="hidden md:flex">
              <Sparkles size={12} />
              هوش مصنوعی
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg max-w-xl">
             یک هویت بصری یکپارچه برای <span className="text-foreground font-bold">{plan.projectName}</span>، 
             طراحی شده بر اساس روانشناسی مخاطب: <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md text-sm">{plan.audience}</span>
          </p>
        </div>
        <div className="hidden md:block">
           <div className="flex -space-x-4 space-x-reverse">
              <div className="w-12 h-12 rounded-full border-4 border-white shadow-lg" style={{ backgroundColor: primaryHex }} />
              <div className="w-12 h-12 rounded-full border-4 border-white shadow-lg z-10" style={{ backgroundColor: secondaryHex }} />
           </div>
        </div>
      </div>

      {/* 1. Live Visualizer */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Smartphone size={20} />
          </div>
          <h2 className="text-xl font-bold text-foreground">پیش‌نمایش زنده</h2>
        </div>
        <BrandVisualizer colors={colors} projectName={plan.projectName} fontName="Vazirmatn" />
      </section>

      {/* 2. Colors */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Palette size={20} />
          </div>
          <h2 className="text-xl font-bold text-foreground">پالت رنگی</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { label: "رنگ اصلی", hex: primaryHex, gradient: "from-primary to-purple-600", usage: "دکمه‌های اصلی، لوگو، تیترهای مهم" },
            { label: "رنگ مکمل", hex: secondaryHex, gradient: "from-secondary to-emerald-600", usage: "پس‌زمینه‌ها، آیکون‌ها، حاشیه‌ها" }
          ].map((color, idx) => (
            <div key={idx} className="group relative bg-card border border-border rounded-[2rem] p-2 hover:shadow-xl transition-shadow duration-300">
               {/* Color Preview */}
               <div 
                 className="h-48 w-full rounded-[1.5rem] shadow-inner relative overflow-hidden group-hover:scale-[0.98] transition-all duration-500" 
                 style={{ backgroundColor: color.hex }}
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                 
                 {/* Hex Overlay */}
                 <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-black font-mono font-bold shadow-lg flex items-center gap-3 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                   {color.hex}
                   <button onClick={() => copyToClipboard(color.hex)} className="hover:text-primary transition-colors">
                     {copied === color.hex ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                   </button>
                 </div>
               </div>

               {/* Meta */}
               <div className="p-6">
                 <h3 className="font-bold text-xl text-foreground mb-2 flex items-center justify-between">
                   {color.label}
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.hex }} />
                 </h3>
                 <p className="text-muted-foreground text-sm flex items-start gap-2 leading-6">
                   <Info size={16} className="text-primary mt-0.5 shrink-0" />
                   {color.usage}
                 </p>
               </div>
            </div>
          ))}
        </div>

        {/* Psychology Note */}
        <div className="mt-8 bg-muted/50 rounded-2xl p-6 border-r-4 border-r-primary">
          <span className="font-bold text-foreground mb-2 flex items-center gap-2">
            <Lightbulb size={18} className="text-amber-500" />
            فلسفه رنگ‌ها
          </span>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            {plan.brandKit.colorPsychology}
          </p>
        </div>
      </section>

      {/* 3. Typography */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Type size={20} />
          </div>
          <h2 className="text-xl font-bold text-foreground">تایپوگرافی</h2>
        </div>
        
        <Card variant="glass" className="overflow-hidden border border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-border pb-6">
            <div>
              <h3 className="text-3xl font-black text-foreground mb-1">وزیرمتن</h3>
              <p className="text-muted-foreground">Vazirmatn - فونت استاندارد وب فارسی</p>
            </div>
            <Badge variant="secondary" className="font-mono text-xs px-3 py-1 bg-secondary/10 text-secondary border-none">
              font-family: 'Vazirmatn';
            </Badge>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
               <div className="space-y-2">
                 <span className="text-xs text-muted-foreground font-mono">Heading 1 / Black / 48px</span>
                 <h1 className="text-5xl font-black text-foreground leading-tight">خلاقیت مرز ندارد</h1>
               </div>
               <div className="space-y-2">
                 <span className="text-xs text-muted-foreground font-mono">Heading 2 / Bold / 30px</span>
                 <h2 className="text-3xl font-bold text-foreground">برای آینده طراحی کنید</h2>
               </div>
               <div className="space-y-2">
                 <span className="text-xs text-muted-foreground font-mono">Body / Regular / 16px</span>
                 <p className="text-base text-muted-foreground leading-8 text-justify">
                   لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است.
                 </p>
               </div>
            </div>
            
            <div className="bg-foreground text-background p-8 rounded-3xl flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <div className="relative z-10">
                 <span className="text-6xl font-black block mb-4">Aa</span>
                 <div className="flex gap-4 justify-center font-mono text-sm opacity-60">
                    <span>Regular</span>
                    <span>Medium</span>
                    <span>Bold</span>
                    <span>Black</span>
                 </div>
                 <div className="mt-8 pt-8 border-t border-white/20 w-full">
                    <span className="text-4xl font-bold tracking-widest">۱۲۳۴۵۶۷۸۹۰</span>
                 </div>
               </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 4. Logo Concepts */}
      <section className="pb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
            <ImageIcon size={20} />
          </div>
          <h2 className="text-xl font-bold text-foreground">ایده‌های لوگو</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plan.brandKit.logoConcepts?.map((logo: any, i: number) => (
            <Card 
              key={i} 
              variant="default"
              hover="lift"
              className="group p-6 text-center border-2 border-transparent hover:border-primary/20"
            >
              <div className="w-16 h-16 bg-gradient-to-tr from-muted to-muted/50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <span className="font-black text-2xl text-muted-foreground/50 group-hover:text-primary transition-colors">{i + 1}</span>
              </div>
              
              <h3 className="font-bold text-lg text-foreground mb-3">{logo.conceptName}</h3>
              <p className="text-muted-foreground text-sm leading-7 text-justify">
                {logo.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
}
