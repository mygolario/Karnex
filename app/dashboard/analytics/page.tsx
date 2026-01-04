"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { BarChart3, TrendingUp, CheckCircle2, Sparkles, Calendar, Target, ArrowUp, ArrowDown, Activity } from "lucide-react";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { SimpleLineChart, SimpleBarChart } from "@/components/ui/charts";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading } = useProject();
  const [stats, setStats] = useState({
    totalSteps: 0,
    completedSteps: 0,
    progressPercent: 0,
    daysActive: 0,
    aiUsageCount: 0
  });

  useEffect(() => {
    if (plan) {
      const totalSteps = plan.roadmap.reduce((acc, phase) => acc + phase.steps.length, 0);
      const completedSteps = plan.completedSteps?.length || 0;
      const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      
      // Calculate days since project creation
      const created = new Date(plan.createdAt);
      const now = new Date();
      const daysActive = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // AI usage (mock - would come from actual tracking)
      const aiUsageCount = parseInt(localStorage.getItem(`karnex_ai_usage_${plan.id}`) || "0");
      
      setStats({ totalSteps, completedSteps, progressPercent, daysActive, aiUsageCount });
    }
  }, [plan]);

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
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
            <BarChart3 size={28} className="text-primary" />
            تحلیل پیشرفت
          </h1>
          <p className="text-muted-foreground mt-1">
            آمار و تحلیل پروژه <span className="font-bold text-foreground">{plan.projectName}</span>
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          <Calendar size={12} className="mr-1" />
          {stats.daysActive} روز فعالیت
        </Badge>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="default" className="text-center p-6">
          <div className="mb-4 flex justify-center">
            <ProgressRing progress={stats.progressPercent} size={80} strokeWidth={8}>
              <span className="text-lg font-black">{stats.progressPercent}%</span>
            </ProgressRing>
          </div>
          <div className="text-sm text-muted-foreground">پیشرفت کل</div>
        </Card>

        <Card variant="default" className="p-6">
          <CardIcon variant="accent" className="mb-3">
            <CheckCircle2 size={20} />
          </CardIcon>
          <div className="text-3xl font-black text-foreground">{stats.completedSteps}</div>
          <div className="text-sm text-muted-foreground">از {stats.totalSteps} مرحله</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
            <ArrowUp size={12} />
            تکمیل شده
          </div>
        </Card>

        <Card variant="default" className="p-6">
          <CardIcon variant="primary" className="mb-3">
            <Sparkles size={20} />
          </CardIcon>
          <div className="text-3xl font-black text-foreground">{stats.aiUsageCount || "۵"}</div>
          <div className="text-sm text-muted-foreground">استفاده از AI</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-primary">
            <TrendingUp size={12} />
            دستیار هوشمند
          </div>
        </Card>

        <Card variant="default" className="p-6">
          <CardIcon variant="secondary" className="mb-3">
            <Target size={20} />
          </CardIcon>
          <div className="text-3xl font-black text-foreground">{plan.roadmap.length}</div>
          <div className="text-sm text-muted-foreground">فاز اجرایی</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-secondary">
            <Calendar size={12} />
            نقشه راه
          </div>
        </Card>
      </div>

      {/* Phase Progress */}
      <Card variant="default" className="p-6">
        <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          پیشرفت فازها
        </h2>
        <div className="space-y-4">
          {plan.roadmap.map((phase, idx) => {
            const phaseTotal = phase.steps.length;
            const phaseCompleted = phase.steps.filter((s: string) => plan.completedSteps?.includes(s)).length;
            const phasePercent = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
            
            return (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">{phase.phase}</span>
                  <span className="text-sm text-muted-foreground">{phaseCompleted}/{phaseTotal}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${phasePercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Timeline (Visual representation) */}
      <Card variant="muted" className="p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">زمان‌بندی پیشنهادی</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {plan.roadmap.map((phase, idx) => (
            <div key={idx} className="flex items-center">
              <div className={`
                shrink-0 px-4 py-2 rounded-full text-sm font-medium
                ${idx === 0 ? 'bg-primary text-white' : 'bg-muted-foreground/10 text-muted-foreground'}
              `}>
                {phase.phase.split(' ').slice(0, 2).join(' ')}
              </div>
              {idx < plan.roadmap.length - 1 && (
                <div className="w-8 h-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          هر فاز تقریباً ۲-۴ هفته زمان می‌برد. سرعت شما بستگی به زمانی دارد که صرف می‌کنید.
        </p>
      </Card>

      {/* Weekly Activity Chart */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              فعالیت هفتگی
            </h2>
            <Badge variant="outline" className="text-xs">آخرین ۷ روز</Badge>
          </div>
          <SimpleLineChart 
            data={[3, 5, 2, 8, 4, 7, 6]} 
            height={120}
            color="#3B82F6"
          />
          <div className="flex justify-between mt-4 text-xs text-muted-foreground">
            <span>شنبه</span>
            <span>یکشنبه</span>
            <span>دوشنبه</span>
            <span>سه‌شنبه</span>
            <span>چهارشنبه</span>
            <span>پنج‌شنبه</span>
            <span>جمعه</span>
          </div>
        </Card>

        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BarChart3 size={20} className="text-purple-600" />
              تکمیل مراحل
            </h2>
            <Badge variant="outline" className="text-xs">به تفکیک فاز</Badge>
          </div>
          <SimpleBarChart 
            data={plan.roadmap.map(phase => {
              const completed = phase.steps.filter((s: string) => plan.completedSteps?.includes(s)).length;
              return completed;
            })} 
            labels={plan.roadmap.map((_, i) => `فاز ${i + 1}`)}
            height={120}
            color="bg-gradient-to-t from-primary to-purple-500"
          />
        </Card>
      </div>
    </div>
  );
}
