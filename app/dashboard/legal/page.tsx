"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getPlanFromCloud, saveLegalAdvice, BusinessPlan } from "@/lib/db";
import { Scale, ShieldCheck, AlertCircle, FileText, Loader2, Info } from "lucide-react";

export default function LegalPage() {
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // 1. Load Plan
  useEffect(() => {
    if (user && !authLoading) {
      getPlanFromCloud(user.uid).then((data) => {
        setPlan(data);
        setLoading(false);
        
        // 2. If plan exists but NO legal advice, generate it automatically
        if (data && !data.legalAdvice) {
          generateLegalData(data.overview, data.audience);
        }
      });
    }
  }, [user, authLoading]);

  // 3. The Generator Function
  const generateLegalData = async (idea: string, audience: string) => {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-legal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idea, audience })
      });
      const legalData = await res.json();
      
      if (user) {
        // Save to DB so we don't generate again
        await saveLegalAdvice(user.uid, legalData);
        // Update Local State
        setPlan(prev => prev ? ({ ...prev, legalAdvice: legalData }) : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">در حال بارگذاری...</div>;
  if (!plan) return null;

  // 4. Loading State (The "Consulting" Animation)
  if (generating || !plan.legalAdvice) {
    return (
      <div className="p-12 max-w-2xl mx-auto text-center space-y-6 animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Scale size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">در حال مشاوره با وکیل هوشمند...</h2>
        <p className="text-slate-500">ما در حال بررسی قوانین و مجوزهای مورد نیاز برای ایده "{plan.projectName}" هستیم.</p>
        <div className="w-full max-w-xs mx-auto h-2 bg-slate-100 rounded-full overflow-hidden">
           <div className="h-full bg-blue-600 animate-[loading_2s_ease-in-out_infinite] w-1/2"></div>
        </div>
      </div>
    );
  }

  // 5. The Content UI
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200">
          <Scale size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الزامات قانونی و حقوقی</h1>
          <p className="text-slate-500">راهنمای شروع فعالیت قانونی برای {plan.projectName}</p>
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
        <Info className="shrink-0" size={20} />
        <p>
          این اطلاعات توسط هوش مصنوعی و بر اساس قوانین کلی ایران تولید شده است. برای موارد حساس حتماً با یک وکیل مشورت کنید.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Column: Requirements */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-600" />
            اقدامات ضروری
          </h3>
          
          <div className="space-y-4">
            {(plan.legalAdvice.requirements || []).map((req, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
                <div className={`
                  w-1 shrink-0 rounded-full my-1
                  ${req.priority === 'High' ? 'bg-rose-500' : 'bg-blue-400'}
                `}></div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-slate-800 text-lg">{req.title}</h4>
                    {req.priority === 'High' && (
                      <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                        الزامی
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {req.description}
                  </p>
                </div>
              </div>
            ))}                {(!plan.legalAdvice.requirements || plan.legalAdvice.requirements.length === 0) && (
              <p className="text-slate-400 text-sm">الزامات خاصی شناسایی نشد.</p>
            )}
          </div>
        </div>

        {/* Side Column: Permits & Tips */}
        <div className="space-y-6">
          
          {/* Permits Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              مجوزهای احتمالی
            </h3>
            <ul className="space-y-3">
              {(plan.legalAdvice.permits || []).map((permit, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-600 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  {permit}
                </li>
              ))}
              {(!plan.legalAdvice.permits || plan.legalAdvice.permits.length === 0) && (
                <li className="text-slate-400 text-sm">مجوز خاصی شناسایی نشد.</li>
              )}
            </ul>
          </div>

          {/* Expert Tips */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-400" />
              نکته وکیل
            </h3>
            <ul className="space-y-4">
              {(plan.legalAdvice.tips || []).map((tip, i) => (
                <li key={i} className="text-sm text-slate-300 leading-6 border-b border-white/10 last:border-0 pb-3 last:pb-0">
                  {tip}
                </li>
              ))}
              {(!plan.legalAdvice.tips || plan.legalAdvice.tips.length === 0) && (
                <li className="text-slate-400 text-sm">نکته‌ای موجود نیست.</li>
              )}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
