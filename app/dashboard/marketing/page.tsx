"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getPlanFromCloud, BusinessPlan } from "@/lib/db";
import { Megaphone, CheckCircle2, TrendingUp, Users, Instagram, Globe, MapPin } from "lucide-react";

export default function MarketingPage() {
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<BusinessPlan | null>(null);

  useEffect(() => {
    if (user && !authLoading) {
      getPlanFromCloud(user.uid).then(setPlan);
    }
  }, [user, authLoading]);

  if (!plan) return <div className="p-12 text-center text-slate-400">در حال تدوین استراتژی...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">بازاریابی و رشد</h1>
        <p className="text-slate-500">موتور جذب مشتری برای: <span className="font-bold text-slate-700">{plan.projectName}</span></p>
      </div>

      {/* 1. Growth Tactics */}
      <section>
        <div className="flex items-center gap-2 mb-6 text-slate-400 uppercase tracking-wider font-bold text-sm">
          <TrendingUp size={18} />
          استراتژی‌های رشد (Growth Hacking)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plan.marketingStrategy.map((tactic: string, i: number) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors flex gap-4">
              <div className="mt-1">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-2">تکتیک شماره {i + 1}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{tactic}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Competitors (Dynamic) */}
      <section>
        <div className="flex items-center gap-2 mb-6 text-slate-400 uppercase tracking-wider font-bold text-sm">
          <Users size={18} />
          تحلیل رقبا (Dynamic)
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <tr>
                <th className="p-4 font-medium">نوع رقیب</th>
                <th className="p-4 font-medium">نقاط قوت</th>
                <th className="p-4 font-medium">نقاط ضعف</th>
                <th className="p-4 font-medium">کانال اصلی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plan.competitors?.map((comp, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-700">{comp.name}</td>
                  <td className="p-4 text-emerald-600 text-sm">{comp.strength}</td>
                  <td className="p-4 text-rose-500 text-sm">{comp.weakness}</td>
                  <td className="p-4 text-slate-500 text-sm flex items-center gap-1">
                    {/* Basic icon logic based on text content */}
                    {comp.channel.includes('اینستا') ? <Instagram size={14} /> :
                     comp.channel.includes('سایت') || comp.channel.includes('اپلیکیشن') ? <Globe size={14} /> :
                     <MapPin size={14} />}
                    {comp.channel}
                  </td>
                </tr>
              ))}

              {/* Fallback if no competitors found (Legacy Plans) */}
              {(!plan.competitors || plan.competitors.length === 0) && (
                 <tr>
                   <td colSpan={4} className="p-8 text-center text-slate-400 text-sm">
                     داده‌های رقبا برای این پروژه موجود نیست. (پروژه قدیمی)
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
