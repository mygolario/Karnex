"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Rocket, Map, LayoutGrid, TrendingUp, Target, CheckCircle2, 
  Sparkles, Plus, Calendar, ChevronLeft, Activity, Award,
  Brain, Lightbulb, Loader2, Bell, AlertTriangle, Flame,
  ArrowUpRight, Clock, FileText, Bot, Zap, BarChart3
} from "lucide-react";
import { calculateProjectScore } from "@/lib/scoring";
import { ProgressRing } from "@/components/dashboard/progress-ring";

// Helper to get step title
function getStepTitle(step: any): string {
  return typeof step === 'string' ? step : step?.title || '';
}

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading } = useProject();
  const [greeting, setGreeting] = useState("سلام");
  
  // New state for features
  const [dailyBriefing, setDailyBriefing] = useState<string>("");
  const [isLoadingBriefing, setIsLoadingBriefing] = useState(false);
  const [smartAlerts, setSmartAlerts] = useState<{type: 'warning' | 'info' | 'success', message: string}[]>([]);
  const [actionStreak, setActionStreak] = useState(0);
  const [streakDays, setStreakDays] = useState<boolean[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("صبح بخیر");
    else if (hour < 18) setGreeting("ظهر بخیر");
    else setGreeting("شب بخیر");
  }, []);

  // Generate Daily Briefing
  const generateDailyBriefing = async () => {
    if (!plan) return;
    setIsLoadingBriefing(true);
    
    try {
      const totalSteps = plan.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 1;
      const completedCount = plan.completedSteps?.length || 0;
      const progressPercent = Math.round((completedCount / totalSteps) * 100);
      
      // Find next step
      const nextStep = plan.roadmap?.flatMap((p: any) => p.steps).find((s: any) => {
        const name = typeof s === 'string' ? s : s.title;
        return !plan.completedSteps?.includes(name);
      });
      const nextStepName = nextStep ? getStepTitle(nextStep) : null;

      const prompt = `You are a Persian startup coach. Create a personalized, motivating morning briefing (2-3 sentences) for:
Project: ${plan.projectName}
Progress: ${progressPercent}%
Today's Task: ${nextStepName || "All done!"}
Audience: ${plan.audience || "general"}

Be concise, friendly, and actionable. Persian only.`;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemPrompt: "Return ONLY the briefing text in Persian." })
      });
      const data = await response.json();
      if (data.success && data.content) {
        const briefingText = data.content.trim();
        setDailyBriefing(briefingText);
        
        // Save to localStorage with timestamp for daily caching
        const cacheKey = `briefing_${plan.id || 'default'}`;
        localStorage.setItem(cacheKey, JSON.stringify({
          content: briefingText,
          timestamp: Date.now()
        }));
      }
    } catch (err) { console.error(err); }
    finally { setIsLoadingBriefing(false); }
  };

  // Generate Smart Alerts
  useEffect(() => {
    if (!plan) return;
    
    const alerts: {type: 'warning' | 'info' | 'success', message: string}[] = [];
    const totalSteps = plan.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 1;
    const completedCount = plan.completedSteps?.length || 0;
    const progressPercent = Math.round((completedCount / totalSteps) * 100);
    
    // Low progress warning
    if (progressPercent < 20 && progressPercent > 0) {
      alerts.push({ type: 'warning', message: 'پیشرفت کند است. سعی کنید روزی یک تسک انجام دهید!' });
    }
    
    // Canvas empty
    if (!plan.leanCanvas || Object.keys(plan.leanCanvas).length === 0) {
      alerts.push({ type: 'info', message: 'بوم کسب‌وکار خالی است. آن را تکمیل کنید.' });
    }
    
    // Good progress
    if (progressPercent >= 50 && progressPercent < 100) {
      alerts.push({ type: 'success', message: 'عالی! بیش از نیمی از مسیر را طی کرده‌اید! 🎉' });
    }
    
    // Completed
    if (progressPercent === 100) {
      alerts.push({ type: 'success', message: 'تبریک! تمام مراحل تکمیل شد! 🏆' });
    }
    
    setSmartAlerts(alerts);
  }, [plan]);

  // Mock streak data
  useEffect(() => {
    const mockStreak = Math.floor(Math.random() * 10) + 1;
    setActionStreak(mockStreak);
    setStreakDays([true, true, true, false, true, true, true]);
  }, []);

  // Load cached briefing or show button to generate
  useEffect(() => {
    if (!plan) return;
    
    const cacheKey = `briefing_${plan.id || 'default'}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const { content, timestamp } = JSON.parse(cached);
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        // Use cached if less than 24 hours old
        if (now - timestamp < oneDayMs) {
          setDailyBriefing(content);
          return;
        }
      } catch (e) {
        console.error('Cache parse error:', e);
      }
    }
    
    // Don't auto-generate - user will click the button
    // This saves AI credits
  }, [plan]);

  // Empty state
  if (!loading && !plan) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[80vh] flex items-center justify-center"
      >
        <div className="text-center max-w-md relative">
          <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full opacity-60" />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 frosted-glass p-10 rounded-[2rem] shadow-2xl"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-28 h-28 bg-gradient-to-br from-primary to-purple-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/30"
            >
              <Rocket size={56} className="text-white" />
            </motion.div>
            <h2 className="text-3xl font-black text-foreground mb-4">هنوز پروژه‌ای نساخته‌اید</h2>
            <p className="text-muted-foreground mb-8 text-lg leading-8">ایده خود را توصیف کنید و بگذارید AI طرح کسب‌وکار بسازد.</p>
            <Link href="/new-project">
              <Button variant="shimmer" size="xl" className="w-full text-lg">
                <Plus size={22} className="ml-2" />ساخت پروژه جدید
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton skeleton-card h-48 rounded-[2rem]" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  // Calculate Stats
  const totalSteps = plan?.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 1;
  const completedCount = plan?.completedSteps?.length || 0;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);
  const scoreResult = plan ? calculateProjectScore(plan) : { total: 0, grade: 'D', breakdown: { foundation:0, strategy:0, market:0, execution:0 }, suggestions: [] };

  // Find next step
  const nextStep = plan?.roadmap?.flatMap((p: any) => p.steps).find((s: any) => {
    const name = typeof s === 'string' ? s : s.title;
    return !plan?.completedSteps?.includes(name);
  });
  const nextStepName = nextStep ? getStepTitle(nextStep) : null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-12"
    >
      {/* 1. Header with Greeting */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground">
            {greeting}، {user?.displayName?.split(' ')[0] || "دوست من"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            امروز چطور می‌تونم کمکت کنم؟
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar size={16} />
          {new Date().toLocaleDateString('fa-IR', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </motion.div>

      {/* 2. Daily Briefing Card (AI) */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-purple-500/5 border-primary/20">
          <div className="absolute top-0 right-0 w-60 h-60 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/30 shrink-0">
                <Brain size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-foreground">خلاصه روزانه</h3>
                  <Badge variant="outline" className="text-[10px]">AI</Badge>
                </div>
                {isLoadingBriefing ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 size={16} className="animate-spin" />
                    در حال تحلیل...
                  </div>
                ) : dailyBriefing ? (
                  <p className="text-foreground/80 leading-7">{dailyBriefing}</p>
                ) : (
                  <p className="text-muted-foreground">برای دریافت خلاصه روزانه کلیک کنید...</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateDailyBriefing}
                disabled={isLoadingBriefing}
              >
                <Sparkles size={16} />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 3. Smart Alerts + Action Streak Row */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-4">
        {/* Smart Alerts */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-amber-500" />
            <h3 className="font-bold text-foreground">هشدارهای هوشمند</h3>
          </div>
          <div className="space-y-3">
            {smartAlerts.length > 0 ? smartAlerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl ${
                  alert.type === 'warning' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                  alert.type === 'success' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                  'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                }`}
              >
                {alert.type === 'warning' && <AlertTriangle size={18} />}
                {alert.type === 'success' && <CheckCircle2 size={18} />}
                {alert.type === 'info' && <Lightbulb size={18} />}
                <span className="text-sm">{alert.message}</span>
              </div>
            )) : (
              <p className="text-muted-foreground text-sm">همه چیز عالی است! ✨</p>
            )}
          </div>
        </Card>

        {/* Action Streak */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={18} className="text-orange-500" />
            <h3 className="font-bold text-foreground">زنجیره فعالیت</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-black text-orange-500">{actionStreak}</div>
              <div className="text-xs text-muted-foreground">روز متوالی</div>
            </div>
            <div className="flex-1">
              <div className="flex gap-1 mb-2">
                {streakDays.map((active, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      active 
                        ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">هر روز حداقل یک تسک انجام دهید تا زنجیره نشکند!</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 4. Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp size={24} className="text-primary" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">{progressPercent}%</div>
            <div className="text-xs text-muted-foreground">پیشرفت کل</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 size={24} className="text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">{completedCount}/{totalSteps}</div>
            <div className="text-xs text-muted-foreground">تسک‌های انجام‌شده</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <ProgressRing progress={scoreResult.total} size={48} strokeWidth={5}>
            <span className={`text-sm font-black ${
              scoreResult.grade === 'S' ? 'text-purple-600' :
              scoreResult.grade === 'A' ? 'text-emerald-600' :
              scoreResult.grade === 'B' ? 'text-blue-600' :
              scoreResult.grade === 'C' ? 'text-amber-600' :
              'text-red-500'
            }`}>{scoreResult.grade}</span>
          </ProgressRing>
          <div>
            <div className="text-2xl font-black text-foreground">{scoreResult.total}</div>
            <div className="text-xs text-muted-foreground">امتیاز پروژه</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Award size={24} className="text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">۳</div>
            <div className="text-xs text-muted-foreground">نشان کسب‌شده</div>
          </div>
        </Card>
      </motion.div>

      {/* 5. Today's Mission */}
      {nextStepName && (
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <Target size={28} />
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">مأموریت امروز</span>
                  <p className="font-bold text-lg text-foreground mt-1">{nextStepName}</p>
                </div>
              </div>
              <Link href="/dashboard/roadmap">
                <Button variant="shimmer" className="gap-2">
                  شروع کن <ChevronLeft size={16} />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      )}

      {/* 6. Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="text-lg font-bold text-foreground">دسترسی سریع</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { href: "/dashboard/canvas", icon: LayoutGrid, label: "بوم", color: "bg-amber-500" },
            { href: "/dashboard/roadmap", icon: Map, label: "نقشه راه", color: "bg-blue-500" },
            { href: "/dashboard/validator", icon: Target, label: "اعتبارسنج", color: "bg-cyan-500", isNew: true },
            { href: "/dashboard/copilot", icon: Bot, label: "دستیار کارنکس", color: "bg-rose-500", badge: "AI" },
            { href: "/dashboard/growth", icon: BarChart3, label: "رشدنما", color: "bg-green-500", isNew: true },
            { href: "/dashboard/docs", icon: FileText, label: "مستندات", color: "bg-purple-500", isNew: true },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card hover="lift" className="p-4 flex flex-col items-center text-center group cursor-pointer">
                <div className={`w-12 h-12 rounded-xl ${item.color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg relative`}>
                  <item.icon size={24} />
                  {item.isNew && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[8px] font-bold bg-emerald-500 text-white rounded">جدید</span>
                  )}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[8px] font-bold bg-primary text-white rounded">{item.badge}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
