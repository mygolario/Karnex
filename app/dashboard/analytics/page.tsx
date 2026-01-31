"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { BarChart3, TrendingUp, CheckCircle2, Sparkles, Calendar, Target, ArrowUp, Activity, Brain, Wand2, Loader2, RefreshCw, Lightbulb } from "lucide-react";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { SimpleLineChart, SimpleBarChart } from "@/components/ui/charts";

// Helper to get step title whether it's a string or object
function getStepTitle(step: any): string {
  return typeof step === 'string' ? step : step?.title || '';
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading } = useProject();
  const [stats, setStats] = useState({ totalSteps: 0, completedSteps: 0, progressPercent: 0, daysActive: 0, aiUsageCount: 0 });

  // AI States
  const [aiAnalysis, setAiAnalysis] = useState<string[]>([]);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);

  useEffect(() => {
    if (plan) {
      const totalSteps = plan.roadmap.reduce((acc, phase) => acc + phase.steps.length, 0);
      const completedSteps = plan.completedSteps?.length || 0;
      const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      const created = new Date(plan.createdAt);
      const daysActive = Math.floor((new Date().getTime() - created.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const aiUsageCount = parseInt(localStorage.getItem(`karnex_ai_usage_${plan.id}`) || "0");
      setStats({ totalSteps, completedSteps, progressPercent, daysActive, aiUsageCount });
    }
  }, [plan]);

  // AI: Generate Analysis
  const handleGenerateAnalysis = async () => {
    if (!plan) return;
    setGeneratingAnalysis(true);
    try {
      const prompt = `Analyze this project progress and provide 3 Persian insights:
Project: ${plan.projectName}
Progress: ${stats.progressPercent}%
Completed: ${stats.completedSteps}/${stats.totalSteps} steps
Days Active: ${stats.daysActive}

Return ONLY JSON array of 3 strings in Persian with analysis insights.`;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemPrompt: "You are a business analyst. Return ONLY valid JSON array in Persian." })
      });
      const data = await response.json();
      if (data.success && data.content) {
        const analysis = JSON.parse(data.content.replace(/```json|```/g, "").trim());
        if (Array.isArray(analysis)) setAiAnalysis(analysis);
      }
    } catch (err) { console.error(err); }
    finally { setGeneratingAnalysis(false); }
  };

  if (loading || !plan) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse shadow-lg">
          <BarChart3 size={40} className="text-white" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">در حال بارگذاری تحلیل‌ها...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20 animate-fade-in-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-2xl shadow-indigo-500/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-white shadow-inner border border-white/20 animate-pulse-glow">
              <BarChart3 size={36} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">تحلیل پیشرفت</h1>
              <p className="text-white/80 text-lg font-medium">
                آمار و تحلیل پروژه <span className="text-white font-extrabold bg-white/20 px-2 py-0.5 rounded-lg">{plan.projectName}</span>
              </p>
            </div>
          </div>
          <div className="glass px-6 py-3 rounded-2xl border-white/10 flex items-center gap-3">
            <Calendar size={20} className="text-white/80" />
            <div className="flex flex-col">
              <span className="text-xs text-white/60 font-bold uppercase tracking-wider">مدت فعالیت</span>
              <span className="text-xl font-black">{stats.daysActive} روز</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="relative overflow-hidden rounded-[2rem] border border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-background to-fuchsia-500/5 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white shadow-lg"><Brain size={24} /></div>
              <div><h2 className="text-xl font-black text-foreground">تحلیل هوشمند AI</h2><p className="text-sm text-muted-foreground">پیش‌بینی و توصیه‌ها</p></div>
            </div>
            <Button variant={aiAnalysis.length > 0 ? "outline" : "gradient"} onClick={handleGenerateAnalysis} disabled={generatingAnalysis} className="gap-2">
              {generatingAnalysis ? <><Loader2 size={16} className="animate-spin" /> در حال تحلیل...</> : aiAnalysis.length > 0 ? <><RefreshCw size={16} /> بروزرسانی</> : <><Wand2 size={16} /> تحلیل با AI</>}
            </Button>
          </div>
          {aiAnalysis.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {aiAnalysis.map((item, i) => (
                <div key={i} className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 border border-border/50 hover:border-violet-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500"><Lightbulb size={16} /></div><span className="text-xs font-bold text-muted-foreground">تحلیل {i + 1}</span></div>
                  <p className="text-sm text-foreground leading-7">{item}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground"><Brain size={48} className="mx-auto mb-4 opacity-20" /><p>روی "تحلیل با AI" کلیک کنید تا تحلیل هوشمند دریافت کنید.</p></div>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="glass" className="text-center p-6 lg:p-8 flex flex-col items-center justify-center group hover:bg-card/50">
          <div className="mb-6 relative">
            <ProgressRing progress={stats.progressPercent} size={100} strokeWidth={10}>
              <span className="text-2xl font-black">{stats.progressPercent}%</span>
            </ProgressRing>
          </div>
          <div className="text-base text-muted-foreground font-medium">پیشرفت کل پروژه</div>
        </Card>

        <Card variant="default" hover="lift" className="p-6 lg:p-8 flex flex-col justify-between overflow-hidden relative group">
          <CardIcon variant="accent" className="mb-4 w-12 h-12 bg-emerald-500/10 text-emerald-500"><CheckCircle2 size={24} /></CardIcon>
          <div><div className="text-4xl font-black text-foreground mb-1">{stats.completedSteps}</div><div className="text-sm text-muted-foreground">مرحله تکمیل شده</div></div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 w-fit px-2 py-1 rounded-lg"><ArrowUp size={12} />در حال پیشرفت</div>
        </Card>

        <Card variant="default" hover="lift" className="p-6 lg:p-8 flex flex-col justify-between overflow-hidden relative group">
          <CardIcon variant="primary" className="mb-4 w-12 h-12"><Sparkles size={24} /></CardIcon>
          <div><div className="text-4xl font-black text-foreground mb-1">{stats.aiUsageCount || "۵"}</div><div className="text-sm text-muted-foreground">کمک از AI</div></div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 w-fit px-2 py-1 rounded-lg"><TrendingUp size={12} />دستیار فعال</div>
        </Card>

        <Card variant="default" hover="lift" className="p-6 lg:p-8 flex flex-col justify-between overflow-hidden relative group">
          <CardIcon variant="secondary" className="mb-4 w-12 h-12"><Target size={24} /></CardIcon>
          <div><div className="text-4xl font-black text-foreground mb-1">{plan.roadmap.length}</div><div className="text-sm text-muted-foreground">فاز عملیاتی</div></div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-500/10 w-fit px-2 py-1 rounded-lg"><Calendar size={12} />نقشه راه</div>
        </Card>
      </div>

      {/* Phase Progress */}
      <Card variant="glass" className="p-8">
        <h2 className="text-2xl font-black text-foreground mb-8 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary"><TrendingUp size={24} /></div>
          پیشرفت فازها
        </h2>
        <div className="space-y-6">
          {plan.roadmap.map((phase, idx) => {
            const phaseTotal = phase.steps.length;
            const phaseCompleted = phase.steps.filter((s: any) => plan.completedSteps?.includes(getStepTitle(s))).length;
            const phasePercent = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
            return (
              <div key={idx} className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-foreground text-lg">{phase.phase}</span>
                  <Badge variant="secondary" className="font-mono text-xs">{phaseCompleted}/{phaseTotal}</Badge>
                </div>
                <div className="h-4 bg-muted/50 rounded-full overflow-hidden p-[2px]">
                  <div className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${phasePercent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card variant="glass" className="p-8">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2"><Activity size={24} className="text-blue-500" />فعالیت هفتگی</h2>
          <div className="h-[200px] w-full"><SimpleLineChart data={[3, 5, 2, 8, 4, 7, 6]} height={200} color="#3B82F6" /></div>
        </Card>
        <Card variant="glass" className="p-8">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2"><BarChart3 size={24} className="text-purple-500" />تکمیل مراحل</h2>
          <div className="h-[200px] w-full">
            <SimpleBarChart data={plan.roadmap.map(phase => phase.steps.filter((s: any) => plan.completedSteps?.includes(getStepTitle(s))).length)} labels={plan.roadmap.map((_, i) => `فاز ${i + 1}`)} height={200} color="bg-gradient-to-t from-primary to-purple-600" />
          </div>
        </Card>
      </div>
    </div>
  );
}
