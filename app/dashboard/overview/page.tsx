"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { KarnexScore } from "@/components/dashboard/karnex-score";
import {
  Rocket, Map, Palette, LayoutGrid, Megaphone,
  TrendingUp, Target, CheckCircle2, Sparkles, Zap, Plus,
  Calendar, ChevronLeft, Activity, Award, Wand2, Loader2,
  Brain, Lightbulb, RefreshCw, ArrowUpRight
} from "lucide-react";

// Helper to get step title whether it's a string or object
function getStepTitle(step: any): string {
  return typeof step === 'string' ? step : step?.title || '';
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }
  }
};

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const }
  }
};

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading } = useProject();
  const [greeting, setGreeting] = useState("سلام");
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [insightsLoaded, setInsightsLoaded] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("صبح بخیر");
    else if (hour < 18) setGreeting("ظهر بخیر");
    else setGreeting("شب بخیر");
  }, []);

  const handleGenerateInsights = async () => {
    if (!plan) return;
    setGeneratingInsights(true);
    try {
      const totalSteps = plan.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 1;
      const completedCount = plan.completedSteps?.length || 0;
      const progressPercent = Math.round((completedCount / totalSteps) * 100);

      const prompt = `You are a startup advisor. Provide 3 actionable Persian insights for:
Project: ${plan.projectName} | Progress: ${progressPercent}% | Audience: ${plan.audience}
Return ONLY a JSON array of 3 Persian strings.`;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemPrompt: "Return ONLY valid JSON array in Persian." })
      });
      const data = await response.json();
      if (data.success && data.content) {
        const insights = JSON.parse(data.content.replace(/```json|```/g, "").trim());
        if (Array.isArray(insights)) {
          setAiInsights(insights);
          setInsightsLoaded(true);
        }
      }
    } catch (err) { console.error(err); }
    finally { setGeneratingInsights(false); }
  };

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
        <div className="skeleton skeleton-card h-72 rounded-[2rem]" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 skeleton h-64 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const totalSteps = plan?.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 1;
  const completedCount = plan?.completedSteps?.length || 0;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);
  const nextStep = plan?.roadmap?.flatMap((p: any) => p.steps).find((s: any) => !plan?.completedSteps?.includes(getStepTitle(s)));

  const toolCards = [
    { href: "/dashboard/roadmap", icon: Map, title: "نقشه راه", desc: "مسیر اجرای گام‌به‌گام", gradient: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/20" },
    { href: "/dashboard/canvas", icon: LayoutGrid, title: "بوم کسب‌وکار", desc: "مدل و استراتژی بیزینس", gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20" },
    // { href: "/dashboard/brand", icon: Palette, title: "هویت بصری", desc: "لوگو، رنگ و فونت", gradient: "from-purple-500 to-pink-500", shadow: "shadow-purple-500/20", ai: true }, // Temporarily disabled
    { href: "/dashboard/marketing", icon: Megaphone, title: "بازاریابی", desc: "استراتژی جذب مشتری", gradient: "from-rose-500 to-red-500", shadow: "shadow-rose-500/20" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      {/* Hero Section - Bento Style */}
      <motion.div variants={itemVariants} className="bento-grid">
        {/* Main Hero Card */}
        <div className="bento-item span-3 row-2 relative overflow-hidden bg-gradient-to-br from-primary via-purple-600 to-indigo-700 text-white p-0 border-0">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/20 blur-[100px] rounded-full animate-float" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-secondary/30 blur-[100px] rounded-full animate-float" style={{ animationDelay: "-3s" }} />

          <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-between">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.3 }}
                  className="glass-strong px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium border-white/30"
                >
                  <Calendar size={14} />
                  {new Date().toLocaleDateString('fa-IR')}
                </motion.div>
              </div>
              {progressPercent === 100 && (
                <Badge className="bg-yellow-400 text-yellow-900 border-0 animate-pulse">
                  <Sparkles size={12} className="ml-1" /> تکمیل شده!
                </Badge>
              )}
            </div>

            {/* Greeting */}
            <div className="my-8">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-black mb-4 leading-tight"
              >
                {greeting}، {user?.displayName?.split(' ')[0] || "دوست من"}!
                <motion.span
                  animate={{ rotate: [0, 20, 0] }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="inline-block mr-2"
                >
                  👋
                </motion.span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-white/80 max-w-xl"
              >
                امروز روی رشد <strong className="text-white">{plan?.projectName}</strong> تمرکز کنیم.
              </motion.p>
            </div>

            {/* Mission Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="glass-strong rounded-2xl p-5 border border-white/20 max-w-lg"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl bg-white text-primary flex items-center justify-center shrink-0 shadow-lg">
                  <Target size={28} />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-white/70 uppercase tracking-wider">مأموریت امروز</span>
                  <p className="font-bold text-lg mt-1 leading-relaxed">
                    {nextStep ? getStepTitle(nextStep) : "تمام مراحل انجام شده! 🎉"}
                  </p>
                  {nextStep && (
                    <Link href="/dashboard/roadmap">
                      <Button variant="glass" size="sm" className="mt-3 text-white border-white/20 hover:bg-white/20">
                        شروع <ChevronLeft size={16} className="mr-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Karnex Score Card */}
        <motion.div
          variants={scaleVariants}
          className="bento-item row-2 flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
          <div className="relative z-10 w-full">
            <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">امتیاز کارنکس</h3>
            <div className="scale-125 mb-6">
              <KarnexScore compact />
            </div>
            <Link href="/dashboard/analytics" className="w-full">
              <Button variant="soft" className="w-full">
                تحلیل کامل <ArrowUpRight size={16} className="mr-1" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="پیشرفت کل"
          value={`${progressPercent}%`}
          icon={TrendingUp}
          trend="up"
          trendValue="+12%"
          variant="primary"
          className="card-floating"
        />
        <StatsCard
          title="فاز فعلی"
          value={plan?.roadmap?.find((p: any) => p.steps.some((s: any) => !plan.completedSteps?.includes(getStepTitle(s))))?.phase.split(':')[0] || "تکمیل"}
          icon={Map}
          variant="accent"
          className="card-floating"
        />
        <StatsCard
          title="مراحل باقیمانده"
          value={totalSteps - completedCount}
          icon={CheckCircle2}
          variant="secondary"
          className="card-floating"
        />
        <StatsCard
          title="دستاوردها"
          value="۳"
          icon={Award}
          variant="glass"
          trend="neutral"
          trendLabel="۱ نشان جدید"
          className="card-floating"
        />
      </motion.div>

      {/* AI Insights */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 p-8"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-xl shadow-primary/30"
              >
                <Brain size={28} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-black text-foreground">توصیه‌های هوشمند</h2>
                <p className="text-muted-foreground">پیشنهادات AI برای رشد سریع‌تر</p>
              </div>
            </div>
            <Button
              variant={insightsLoaded ? "outline" : "shimmer"}
              onClick={handleGenerateInsights}
              disabled={generatingInsights}
              className="gap-2"
            >
              {generatingInsights ? (
                <><Loader2 size={18} className="animate-spin" /> در حال تحلیل...</>
              ) : insightsLoaded ? (
                <><RefreshCw size={18} /> بروزرسانی</>
              ) : (
                <><Wand2 size={18} /> دریافت توصیه</>
              )}
            </Button>
          </div>

          {aiInsights.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="show"
              variants={containerVariants}
              className="grid md:grid-cols-3 gap-5"
            >
              {aiInsights.map((insight, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="card-spotlight p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                      <Lightbulb size={20} />
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">توصیه {i + 1}</span>
                  </div>
                  <p className="text-foreground leading-8">{insight}</p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Brain size={56} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">روی "دریافت توصیه" کلیک کنید تا AI پیشنهاداتی برای شما بسازد.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Tools */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-secondary rounded-full" />
          <h2 className="text-2xl font-black text-foreground">ابزارهای کلیدی</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {toolCards.map((item, i) => (
            <motion.div
              key={i}
              variants={scaleVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href={item.href}>
                <div className={`card-floating group h-full p-6 flex flex-col items-center text-center cursor-pointer relative ${item.shadow}`}>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <item.icon size={28} />
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Activity & Tips */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <Card variant="spotlight" padding="none" className="lg:col-span-2 overflow-hidden">
          <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/30">
            <h3 className="font-bold text-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity size={20} className="text-primary" />
              </div>
              فعالیت‌های اخیر
            </h3>
          </div>
          <div className="p-6">
            <ActivityFeed maxItems={5} />
          </div>
        </Card>

        {/* Smart Tips */}
        <Card variant="gradient" className="relative overflow-hidden border-0 p-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-[80px]" />

          <div className="relative z-10 p-6 text-white h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Sparkles size={22} />
              </div>
              <h3 className="font-bold text-lg">نکات طلایی</h3>
            </div>

            <div className="space-y-4 flex-1">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  اجرای سریع‌تر
                </h4>
                <p className="text-sm text-white/70 leading-7">با تکمیل نقشه راه، هر مرحله را به ترتیب انجام دهید.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  تحلیل هوشمند
                </h4>
                <p className="text-sm text-white/70 leading-7">از قابلیت AI برای شناسایی نقاط ضعف استفاده کنید.</p>
              </div>
            </div>

            <Link href="/dashboard/help" className="mt-4">
              <Button variant="glass" className="w-full justify-between text-white border-white/20 hover:bg-white/10">
                مشاهده راهنما
                <ChevronLeft size={18} />
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
