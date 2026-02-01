"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { getPlanFromCloud, saveLegalAdvice, BusinessPlan } from "@/lib/db";
import { Scale, ShieldCheck, AlertCircle, FileText, Loader2, Info, Sparkles, Lightbulb, HelpCircle, ExternalLink } from "lucide-react";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverExplainer } from "@/components/ui/explainer";
import { LearnMore } from "@/components/ui/learn-more";
import { featureExplanations, legalExplanations } from "@/lib/knowledge-base";

import { PermitManager } from "@/components/features/permits/permit-manager";

export default function LegalPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading } = useProject();
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Only generate for startup/creator if missing. 
    // Traditional uses the checklist which is static/manual for now.
    if (plan && plan.projectType !== 'traditional' && !plan.legalAdvice && !generating && !loading) {
      generateLegalData(plan.overview, plan.audience);
    }
  }, [plan, loading]);

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
      
      if (user && plan) {
        await saveLegalAdvice(user.uid, legalData, plan.id || 'current');
        window.location.reload(); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // Get explanation for legal term if available
  const getLegalExplanation = (title: string) => {
    const lowerTitle = title.toLowerCase();
    for (const [key, explanation] of Object.entries(legalExplanations)) {
      if (lowerTitle.includes(key)) {
        return explanation;
      }
    }
    return null;
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

  // TRINITY: Traditional Business View
  if (plan.projectType === 'traditional') {
      return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
                    <FileText size={28} />
                </div>
                <div>
                   <h1 className="text-2xl font-black text-foreground">مجوزها و مراحل قانونی</h1>
                   <p className="text-muted-foreground">چک‌لیست قدم‌به‌قدم برای راه‌اندازی قانونی {plan.projectName}</p>
                </div>
            </div>
            
            <PermitManager />
        </div>
      );
  }

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

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      
      {/* Feature Explanation Banner */}
      <LearnMore title="الزامات قانونی چیست؟" variant="primary">
        <p className="text-muted-foreground text-sm leading-7 mb-3">
          {featureExplanations.legal.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lightbulb size={14} className="text-primary" />
          نکته: همه این موارد در روز اول لازم نیست! ابتدا شروع کنید و با رشد کسب‌وکار، رسمی‌تر شوید.
        </div>
      </LearnMore>

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
            <HoverExplainer text="این اطلاعات توسط هوش مصنوعی و بر اساس قوانین کلی ایران تولید شده است" />
          </div>
          <p className="text-muted-foreground">راهنمای شروع فعالیت قانونی برای {plan.projectName}</p>
        </div>
      </div>

      {/* Warning Box - Simplified */}
      <Card variant="muted" className="border-l-4 border-l-accent flex gap-3">
        <Info className="shrink-0 text-accent" size={20} />
        <div>
          <p className="text-muted-foreground text-sm mb-2">
            این اطلاعات راهنمای کلی است، نه مشاوره حقوقی رسمی. برای موارد حساس با یک وکیل مشورت کنید.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Lightbulb size={12} className="text-accent" />
            <strong>نکته مهم:</strong> بیشتر کسب‌وکارهای کوچک می‌توانند بدون مجوز شروع کنند و بعداً رسمی شوند!
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Column: Requirements */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CardIcon variant="secondary" className="w-10 h-10">
              <ShieldCheck size={20} />
            </CardIcon>
            <span className="font-bold text-sm uppercase tracking-wider">اقدامات ضروری</span>
            <HoverExplainer text="مواردی که باید انجام دهید (بعضی فوری و بعضی بعداً)" />
          </div>
          
          <div className="space-y-4">
            {(plan.legalAdvice.requirements || []).map((req, i) => {
              const explanation = getLegalExplanation(req.title);
              
              return (
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
                      {req.priority === 'High' ? (
                        <Badge variant="danger" size="sm">الزامی</Badge>
                      ) : (
                        <Badge variant="muted" size="sm">بعداً کافی است</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-3">
                      {req.description}
                    </p>

                    {/* Simple Explanation */}
                    {explanation && (
                      <div className="bg-muted/50 rounded-lg p-3 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Lightbulb size={12} className="text-accent shrink-0" />
                          <span><strong>یعنی چی؟</strong> {explanation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
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
              <HoverExplainer text="مجوزهایی که ممکن است در آینده نیاز داشته باشید" />
            </div>
            <ul className="space-y-3">
              {(plan.legalAdvice.permits || []).map((permit, i) => (
                <li key={i} className="flex items-center gap-2 text-muted-foreground text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {permit}
                </li>
              ))}
              {(!plan.legalAdvice.permits || plan.legalAdvice.permits.length === 0) && (
                <li className="text-muted-foreground text-sm">مجوز خاصی شناسایی نشد. عالی است! 🎉</li>
              )}
            </ul>
          </Card>

          {/* Expert Tips */}
          <Card variant="gradient" padding="lg" className="text-white relative overflow-hidden">
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

          {/* Helpful Links */}
          <Card variant="default">
            <h3 className="font-bold text-foreground mb-4">لینک‌های مفید</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://enamad.ir" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  <ExternalLink size={14} />
                  سامانه ای‌نماد
                </a>
              </li>
              <li>
                <a 
                  href="https://tax.gov.ir" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  <ExternalLink size={14} />
                  سامانه مالیات
                </a>
              </li>
            </ul>
          </Card>

        </div>
      </div>
    </div>
  );
}
