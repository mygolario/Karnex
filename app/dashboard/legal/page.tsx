"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { getPlanFromCloud, saveLegalAdvice, BusinessPlan } from "@/lib/db";
import { Scale, ShieldCheck, AlertCircle, FileText, Loader2, Info, Sparkles, Lightbulb, HelpCircle, ExternalLink } from "lucide-react";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverExplainer } from "@/components/ui/explainer";
import { LearnMore } from "@/components/ui/learn-more";
import { DocumentGenerator } from "@/components/dashboard/document-generator";
import { featureExplanations, legalExplanations } from "@/lib/knowledge-base";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export default function LegalPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading } = useProject();
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (plan && !plan.legalAdvice && !generating && !loading) {
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
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20 animate-fade-in-up">
      
      {/* Feature Explanation Banner - Hidden for cleaner look, or redesigned */}
      {/* Integrated into Header for simplicity */}

      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-2xl shadow-emerald-500/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-start gap-6">
             <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-white shadow-inner border border-white/20 animate-scale-in">
               <Scale size={40} />
             </div>
             <div>
               <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-4xl md:text-5xl font-black tracking-tight">الزامات قانونی</h1>
                 <Badge variant="outline" className="border-white/20 text-white bg-white/10 backdrop-blur-sm px-3 py-1 gap-1">
                   <Sparkles size={12} />
                   AI Advisor
                 </Badge>
               </div>
               <p className="text-white/80 text-lg max-w-xl leading-relaxed font-medium">
                 راهنمای هوشمند شروع فعالیت قانونی برای <span className="text-white font-bold decoration-2 underline decoration-white/30 underline-offset-4">{plan.projectName}</span>.
                 <br/>
                 <span className="text-sm opacity-70 font-light mt-1 block">این اطلاعات جایگزین وکیل نیست، اما برای شروع عالی است.</span>
               </p>
             </div>
           </div>
           
           <div className="hidden lg:block glass px-6 py-4 rounded-2xl border-white/10 max-w-xs">
              <div className="flex items-start gap-3">
                <Info className="shrink-0 text-white mt-1" size={20} />
                <p className="text-sm text-white/90 leading-6">
                  <strong>نکته مهم:</strong> بیشتر کسب‌وکارهای نوپا می‌توانند بدون مجوز شروع کنند و بعداً رسمی شوند. نگذارید بوروکراسی مانع شروع شما شود!
                </p>
              </div>
           </div>
        </div>
      </div>

      {/* Document Generator Section - Full Width */}
      <div className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
        <DocumentGenerator />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column: Requirements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 text-foreground mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <ShieldCheck size={24} />
            </div>
            <div>
               <h3 className="font-black text-2xl tracking-tight">اقدامات ضروری</h3>
               <p className="text-sm text-muted-foreground">لیست کارهایی که باید انجام دهید</p>
            </div>
          </div>
          
          <div className="space-y-5">
            {(plan.legalAdvice.requirements || []).map((req, i) => {
              const explanation = getLegalExplanation(req.title);
              
              return (
                <Card 
                  key={i} 
                  variant="default"
                  hover="lift"
                  className="relative overflow-hidden group border transition-all duration-300 hover:border-primary/20"
                >
                  {/* Priority Bar */}
                  <div className={`absolute top-0 bottom-0 right-0 w-2 ${
                    req.priority === 'High' ? 'bg-rose-500' : 'bg-emerald-500'
                  }`} />
                  
                  <div className="pr-6 p-2">
                    <div className="flex items-center gap-4 mb-3">
                      <h4 className="font-extrabold text-foreground text-xl tracking-tight">{req.title}</h4>
                      {req.priority === 'High' ? (
                        <Badge variant="danger" size="sm" className="shadow-sm">الزامی و فوری</Badge>
                      ) : (
                        <Badge variant="muted" size="sm">بعداً انجام دهید</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground leading-9 text-lg mb-5 pl-4">
                      {req.description}
                    </p>

                    {/* Simple Explanation */}
                    {explanation && (
                      <div className="bg-muted/40 rounded-xl p-4 text-base border border-border/50 group-hover:bg-muted/60 transition-colors">
                        <div className="flex items-start gap-3 text-foreground/80">
                          <Lightbulb size={20} className="text-amber-500 shrink-0 mt-0.5" />
                          <span className="leading-7"><strong>به زبان ساده:</strong> {explanation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
            {(!plan.legalAdvice.requirements || plan.legalAdvice.requirements.length === 0) && (
              <div className="text-center p-12 bg-muted/20 rounded-3xl border border-dashed border-border">
                <p className="text-muted-foreground text-lg">الزامات خاصی برای این پروژه پیدا نشد.</p>
              </div>
            )}
          </div>
        </div>

        {/* Side Column: Permits & Tips */}
        <div className="space-y-6">
          
          {/* Permits Box */}
          <Card variant="default" className="card-glass border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <FileText size={20} />
              </div>
              <h3 className="font-bold text-xl text-foreground">مجوزهای احتمالی</h3>
            </div>
            <ul className="space-y-4">
              {(plan.legalAdvice.permits || []).map((permit, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground/80 text-base leading-7 bg-muted/30 p-3 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                  {permit}
                </li>
              ))}
              {(!plan.legalAdvice.permits || plan.legalAdvice.permits.length === 0) && (
                <li className="text-muted-foreground text-sm">مجوز خاصی شناسایی نشد. عالی است! 🎉</li>
              )}
            </ul>
          </Card>

          {/* Expert Tips */}
          <Card variant="gradient" className="text-white relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border-0 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="relative z-10 p-2">
              <div className="flex items-center gap-2 mb-6 text-emerald-400">
                <Sparkles size={20} />
                <h3 className="font-bold text-lg">نکات طلایی وکیل</h3>
              </div>
              <ul className="space-y-5">
                {(plan.legalAdvice.tips || []).map((tip, i) => (
                  <li key={i} className="text-base text-gray-200 leading-8 border-b border-white/10 last:border-0 pb-4 last:pb-0">
                    <span className="text-emerald-400 font-bold mr-1">✓</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Helpful Links */}
          <Card variant="default" className="card-glass">
            <h3 className="font-bold text-foreground mb-4 text-lg">لینک‌های کاربردی</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://enamad.ir" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-primary/5 hover:text-primary transition-all group"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <ExternalLink size={16} />
                    سامانه ای‌نماد
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-primary/70">enamad.ir</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://tax.gov.ir" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-primary/5 hover:text-primary transition-all group"
                >
                   <span className="flex items-center gap-2 font-medium">
                    <ExternalLink size={16} />
                    سامانه مالیات
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-primary/70">tax.gov.ir</span>
                </a>
              </li>
            </ul>
          </Card>

        </div>
      </div>
    </div>
  );
}
