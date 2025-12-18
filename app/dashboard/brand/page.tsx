"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getPlanFromCloud, BusinessPlan } from "@/lib/db";
import { Copy, Check, Palette, Type, Image as ImageIcon } from "lucide-react";

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

  if (!plan) return <div className="p-12 text-center text-slate-400">در حال بارگذاری هویت بصری...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">هویت بصری برند</h1>
        <p className="text-slate-500 text-lg">
          طراحی شده بر اساس روانشناسی مخاطب: <span className="text-slate-800 font-bold">{plan.audience}</span>
        </p>
      </div>

      {/* 1. Colors */}
      <section>
        <div className="flex items-center gap-2 mb-6 text-slate-400 uppercase tracking-wider font-bold text-sm">
          <Palette size={18} />
          پالت رنگی اختصاصی
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { label: "رنگ اصلی", hex: plan.brandKit.primaryColorHex },
            { label: "رنگ مکمل", hex: plan.brandKit.secondaryColorHex }
          ].map((color, idx) => (
            <div key={idx} className="group relative bg-white p-2 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all">
              <div 
                className="h-40 w-full rounded-2xl shadow-inner transition-transform group-hover:scale-[1.02]" 
                style={{ backgroundColor: color.hex }}
              />
              <div className="p-4 flex justify-between items-center">
                <div>
                  <div className="text-slate-400 text-sm mb-1">{color.label}</div>
                  <div className="text-2xl font-mono font-bold text-slate-800">{color.hex}</div>
                </div>
                <button 
                  onClick={() => copyToClipboard(color.hex)}
                  className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  {copied === color.hex ? <Check size={20} className="text-emerald-600" /> : <Copy size={20} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Psychology Note */}
        <div className="mt-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-800 block mb-2">چرا این رنگ‌ها؟</span>
          {plan.brandKit.colorPsychology}
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* 2. Typography */}
      <section>
        <div className="flex items-center gap-2 mb-6 text-slate-400 uppercase tracking-wider font-bold text-sm">
          <Type size={18} />
          تایپوگرافی
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">وزیرمتن (Vazirmatn)</h3>
              <p className="text-slate-400">استاندارد وب فارسی</p>
            </div>
            <div className="px-4 py-2 bg-slate-100 rounded-lg font-mono text-sm text-slate-500">
              font-family: 'Vazirmatn', sans-serif;
            </div>
          </div>
          
          <div className="space-y-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h1 className="text-4xl font-bold text-slate-900">تیترهای جذاب و خوانا</h1>
            <h2 className="text-2xl font-semibold text-slate-800">زیرتیترها با وزن متوسط</h2>
            <p className="text-slate-600 leading-8">
              این یک نمونه متن پاراگراف است. فونت وزیرمتن به دلیل خوانایی بالا و ساختار هندسی مدرن، حس اعتماد و حرفه‌ای بودن را به کاربران شما منتقل می‌کند. اعداد در این فونت کاملا فارسی هستند: ۱۲۳۴۵۶
            </p>
          </div>
        </div>
      </section>

      {/* 3. Logo Concepts */}
      <section className="pb-12">
        <div className="flex items-center gap-2 mb-6 text-slate-400 uppercase tracking-wider font-bold text-sm">
          <ImageIcon size={18} />
          ایده‌های لوگو
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plan.brandKit.logoConcepts?.map((logo: any, i: number) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <span className="font-bold text-xl">{i + 1}</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{logo.conceptName}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {logo.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
