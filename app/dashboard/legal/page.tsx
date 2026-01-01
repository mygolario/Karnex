"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getPlanFromCloud, saveLegalAdvice, BusinessPlan } from "@/lib/db";
import { Scale, ShieldCheck, AlertCircle, FileText, Loader2, Info, Sparkles } from "lucide-react";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center animate-pulse">
          <Scale size={32} className="text-white" />
        </div>
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }
  if (!plan) return null;

  // 4. Loading State (The "Consulting" Animation)
  if (generating || !plan.legalAdvice) {
    return (
      <div className="p-12 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 animate-pulse">
          <Scale size={48} />
        </div>
        <h2 className="text-2xl font-black text-foreground">در حال مشاوره با وکیل هوشمند...</h2>
        <p className="text-muted-foreground">ما در حال بررسی قوانین و مجوزهای مورد نیاز برای ایده "{plan.projectName}" هستیم.</p>
        <div className="w-full max-w-xs mx-auto h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary animate-pulse w-2/3 rounded-full" />
        </div>
      </div>
    );
  }

  // 5. The Content UI
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
          <Scale size={28} />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-foreground">الزامات قانونی و حقوقی</h1>
            <Badge variant="gradient" size="sm">
              <Sparkles size={12} />
              AI
            </Badge>
          </div>
          <p className="text-muted-foreground">راهنمای شروع فعالیت قانونی برای {plan.projectName}</p>
        </div>
      </div>

      {/* Warning Box */}
      <Card variant="muted" className="border-l-4 border-l-accent flex gap-3">
        <Info className="shrink-0 text-accent" size={20} />
        <p className="text-muted-foreground text-sm">
          این اطلاعات توسط هوش مصنوعی و بر اساس قوانین کلی ایران تولید شده است. برای موارد حساس حتماً با یک وکیل مشورت کنید.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Column: Requirements */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CardIcon variant="secondary" className="w-10 h-10">
              <ShieldCheck size={20} />
            </CardIcon>
            <span className="font-bold text-sm uppercase tracking-wider">اقدامات ضروری</span>
          </div>
          
          <div className="space-y-4">
            {(plan.legalAdvice.requirements || []).map((req, i) => (
              <Card 
                key={i} 
                variant="default"
                hover="lift"
                className="relative overflow-hidden"
              >
                {/* Priority Bar */}
                <div className={`absolute top-0 bottom-0 right-0 w-1 ${
                  req.priority === 'High' ? 'bg-destructive' : 'bg-primary'
                }`} />
                
                <div className="pr-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-foreground text-lg">{req.title}</h4>
                    {req.priority === 'High' && (
                      <Badge variant="danger" size="sm">
                        الزامی
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {req.description}
                  </p>
                </div>
              </Card>
            ))}
            {(!plan.legalAdvice.requirements || plan.legalAdvice.requirements.length === 0) && (
              <p className="text-muted-foreground text-sm">الزامات خاصی شناسایی نشد.</p>
            )}
          </div>
        </div>

        {/* Side Column: Permits & Tips */}
        <div className="space-y-6">
          
          {/* Permits Box */}
          <Card variant="default">
            <div className="flex items-center gap-2 mb-4">
              <CardIcon variant="primary" className="w-8 h-8">
                <FileText size={16} />
              </CardIcon>
              <h3 className="font-bold text-foreground">مجوزهای احتمالی</h3>
            </div>
            <ul className="space-y-3">
              {(plan.legalAdvice.permits || []).map((permit, i) => (
                <li key={i} className="flex items-center gap-2 text-muted-foreground text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {permit}
                </li>
              ))}
              {(!plan.legalAdvice.permits || plan.legalAdvice.permits.length === 0) && (
                <li className="text-muted-foreground text-sm">مجوز خاصی شناسایی نشد.</li>
              )}
            </ul>
          </Card>

          {/* Expert Tips */}
          <Card variant="gradient" padding="lg" className="text-white relative overflow-hidden">
            {/* Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={20} className="text-accent" />
                <h3 className="font-bold">نکته وکیل</h3>
              </div>
              <ul className="space-y-4">
                {(plan.legalAdvice.tips || []).map((tip, i) => (
                  <li key={i} className="text-sm text-white/80 leading-6 border-b border-white/10 last:border-0 pb-3 last:pb-0">
                    {tip}
                  </li>
                ))}
                {(!plan.legalAdvice.tips || plan.legalAdvice.tips.length === 0) && (
                  <li className="text-white/60 text-sm">نکته‌ای موجود نیست.</li>
                )}
              </ul>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
