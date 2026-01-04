"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { HoverExplainer } from "@/components/ui/explainer";
import { 
  Rocket, 
  Map, 
  Palette, 
  LayoutGrid, 
  Megaphone,
  ArrowLeft,
  TrendingUp,
  Target,
  CheckCircle2,
  Sparkles,
  Zap,
  Plus,
  Calendar,
  ChevronLeft,
  Activity,
  Award
} from "lucide-react";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading } = useProject();
  const [greeting, setGreeting] = useState("سلام");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("صبح بخیر");
    else if (hour < 18) setGreeting("ظهر بخیر");
    else setGreeting("شب بخیر");
  }, []);

  // Show welcome if empty project
  if (!loading && !plan) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Rocket size={48} className="text-primary" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4">
            هنوز پروژه‌ای نساخته‌اید
          </h2>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            برای شروع، یک ایده را توصیف کنید و بگذارید هوش مصنوعی طرح کسب‌وکار کامل بسازد.
          </p>
          <Link href="/new-project">
            <Button variant="gradient" size="xl" rounded="full" className="px-8 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105">
              <Plus size={20} />
              ساخت پروژه جدید
              <ArrowLeft size={20} />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return ( // Skeleton
      <div className="space-y-8 animate-pulse">
        <div className="h-40 bg-muted/50 rounded-3xl" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted/50 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  // Calculate Stats
  const totalSteps = plan?.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 1;
  const completedCount = plan?.completedSteps?.length || 0;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);
  
  // Calculate Health Score (Mock logic for now + progress)
  const healthScore = Math.min(100, Math.round(progressPercent * 0.8 + 20)); // Base 20 + progress factor

  // Find next actionable step
  const nextStep = plan?.roadmap?.flatMap((p: any) => p.steps).find((s: string) => !plan?.completedSteps?.includes(s));

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Hero Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Welcome & Daily Focus */}
        <Card variant="gradient" className="lg:col-span-2 relative overflow-hidden text-white flex flex-col justify-between min-h-[240px]">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-white/20 text-white border-white/20 hover:bg-white/30 backdrop-blur-md">
                <Calendar size={12} className="mr-1" />
                {new Date().toLocaleDateString('fa-IR')}
              </Badge>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-100 border-none">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                وضعیت: فعال
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black mb-2">
              {greeting}، {user?.displayName || "دوست من"}! 👋
            </h1>
            <p className="text-lg text-white/80 max-w-xl">
              امروز روی رشد <strong className="text-white border-b-2 border-white/30">{plan?.projectName}</strong> تمرکز کنیم.
            </p>
          </div>

          {/* Daily Focus Box */}
          <div className="relative z-10 mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center font-bold shrink-0 shadow-lg">
                <Target size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-white/60 uppercase tracking-wider">تمرکز امروز</span>
                <p className="font-bold text-lg md:text-xl mt-1 line-clamp-1">
                  {nextStep || "تبریک! تمام مراحل انجام شده است 🎉"}
                </p>
                {nextStep && (
                  <Link href="/dashboard/roadmap" className="inline-flex items-center gap-1 text-sm mt-2 hover:underline opacity-90">
                    انجام تسک <ChevronLeft size={14} />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        </Card>

        {/* Project Health Score */}
        <Card variant="default" className="flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/20 pointer-events-none" />
          
          <h3 className="font-bold text-muted-foreground mb-6 flex items-center gap-2">
            <Activity size={18} className="text-primary" />
            سلامت پروژه
          </h3>
          
          <div className="relative mb-6">
            <ProgressRing progress={healthScore} size={160} strokeWidth={12}>
              <div className="text-center">
                <span className="text-4xl font-black text-foreground block">{healthScore}</span>
                <span className="text-xs text-muted-foreground font-medium uppercase">امتیاز</span>
              </div>
            </ProgressRing>
          </div>

          <div className="flex gap-2">
            <Link href="/dashboard/roadmap">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                بهبود امتیاز
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="پیشرفت کل" 
          value={`${progressPercent}%`} 
          icon={TrendingUp} 
          trend="up" 
          trendValue="+12%" 
          trendLabel="نسبت به هفته قبل"
          variant="primary"
        />
        <StatsCard 
          title="فاز فعلی" 
          value={plan?.roadmap?.find((p:any) => p.steps.some((s: string) => !plan.completedSteps?.includes(s)))?.phase.split(':')[0] || "تکمیل"} 
          icon={Map} 
          variant="accent"
        />
         <StatsCard 
          title="مراحل باقیمانده" 
          value={totalSteps - completedCount} 
          icon={CheckCircle2} 
          variant="secondary"
        />
        <StatsCard 
          title="دستاوردهای کسب‌شده" 
          value="۳" 
          icon={Award} 
          variant="glass"
          trend="neutral"
          trendLabel="۱ نشان جدید در انتظار"
        />
      </div>

      {/* 3. Quick Actions */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="text-xl font-bold text-foreground">دسترسی سریع</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
           {/* Roadmap */}
           <Link href="/dashboard/roadmap">
            <Card variant="default" hover="glow" className="group h-full flex flex-col items-center text-center p-6 border-2 border-transparent hover:border-primary/10 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Map size={28} />
              </div>
              <h3 className="font-bold text-foreground mb-1">نقشه راه</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">مسیر قدم به قدم اجرا</p>
            </Card>
          </Link>

          {/* Canvas */}
          <Link href="/dashboard/canvas">
            <Card variant="default" hover="glow" className="group h-full flex flex-col items-center text-center p-6 border-2 border-transparent hover:border-amber-500/10 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <LayoutGrid size={28} />
              </div>
              <h3 className="font-bold text-foreground mb-1">بوم کسب‌وکار</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">مدل بیزینس و درآمد</p>
            </Card>
          </Link>

          {/* Brand */}
          <Link href="/dashboard/brand">
            <Card variant="default" hover="glow" className="group h-full flex flex-col items-center text-center p-6 border-2 border-transparent hover:border-purple-500/10 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Palette size={28} />
              </div>
              <h3 className="font-bold text-foreground mb-1">هویت بصری</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">رنگ‌ها و لوگو</p>
            </Card>
          </Link>

          {/* Marketing */}
          <Link href="/dashboard/marketing">
            <Card variant="default" hover="glow" className="group h-full flex flex-col items-center text-center p-6 border-2 border-transparent hover:border-rose-500/10 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Megaphone size={28} />
              </div>
              <h3 className="font-bold text-foreground mb-1">بازاریابی</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">استراتژی رشد و تبلیغات</p>
            </Card>
          </Link>
        </div>
      </div>

      {/* 4. Activity Feed Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <Card variant="default" className="p-6">
            <ActivityFeed maxItems={5} />
          </Card>
        </div>

        {/* Tips & Pro Features */}
        <Card variant="muted" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-primary" />
            <h3 className="font-bold text-foreground">نکات امروز</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl border border-primary/10">
              <h4 className="font-bold text-foreground text-sm mb-2">💡 اجرای سریع‌تر</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                با تکمیل نقشه راه، هر مرحله را به ترتیب انجام دهید. این روش باعث می‌شود پیشرفت شما قابل ردیابی باشد.
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-xl border border-amber-500/10">
              <h4 className="font-bold text-foreground text-sm mb-2">📊 تحلیل هوشمند</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                از قابلیت تحلیل AI استفاده کنید تا نقاط ضعف استراتژی خود را شناسایی کنید.
              </p>
            </div>
            <Link href="/dashboard/help" className="block">
              <Button variant="outline" size="sm" className="w-full">
                مشاهده راهنما
                <ChevronLeft size={14} />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
