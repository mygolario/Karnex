"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Calendar, Rocket, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { calculateProjectScore } from "@/lib/scoring";
import { FocusHero } from "@/components/dashboard/overview/focus-hero";
import { StatsStrip } from "@/components/dashboard/overview/stats-strip";
import { QuickAccessGrid } from "@/components/dashboard/overview/quick-access-grid";

// Helper to get step title
function getStepTitle(step: any): string {
  return typeof step === 'string' ? step : step?.title || '';
}

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function DashboardOverviewPage() {
  const { user, userProfile } = useAuth();
  const { activeProject: plan, loading } = useProject();
  const [greeting, setGreeting] = useState("سلام");
  const [actionStreak, setActionStreak] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) setGreeting("شب بخیر");
    else if (hour < 12) setGreeting("صبح بخیر");
    else if (hour < 17) setGreeting("روز بخیر");
    else setGreeting("عصر بخیر");
    
    // Mock streak
    setActionStreak(Math.floor(Math.random() * 10) + 1);
  }, []);

  // Empty state
  if (!loading && !plan) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[80vh] flex items-center justify-center"
      >
        <div className="text-center max-w-md relative p-8">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-50" />
            <div className="relative z-10 glass-panel p-10 rounded-[2.5rem] border border-white/20 shadow-2xl">
                 <div className="w-24 h-24 bg-gradient-to-tr from-primary to-violet-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30 rotate-3 hover:rotate-6 transition-transform">
                    <Rocket size={48} className="text-white" />
                 </div>
                 <h2 className="text-2xl font-black text-foreground mb-3">شروع یک ماجراجویی جدید</h2>
                 <p className="text-muted-foreground mb-8 text-base">اولین پروژه خود را بسازید و مسیر موفقیت را آغاز کنید.</p>
                 <Link href="/new-project">
                    <Button size="lg" className="w-full text-base h-12 rounded-xl font-bold">
                        <Plus size={20} className="ml-2" />
                        ساخت پروژه جدید
                    </Button>
                 </Link>
            </div>
        </div>
      </motion.div>
    );
  }

  // Loading skeleton
  if (loading) {
     return <div className="space-y-8 animate-pulse p-6">
        <div className="h-12 w-48 bg-muted rounded-xl mb-8" />
        <div className="h-[400px] w-full bg-muted/50 rounded-[2.5rem]" />
        <div className="h-32 w-full bg-muted/50 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4 h-40">
            {[1,2,3,4].map(i => <div key={i} className="bg-muted/30 rounded-2xl" />)}
        </div>
     </div>
  }

  // Calculate Stats
  const totalSteps = plan?.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 1;
  const completedCount = plan?.completedSteps?.length || 0;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);
  const scoreResult = plan ? calculateProjectScore(plan) : { total: 0, grade: 'N/A' };

  // Find next step
  const nextStep = plan?.roadmap?.flatMap((p: any) => p.steps).find((s: any) => {
    const name = typeof s === 'string' ? s : s.title;
    return !plan?.completedSteps?.includes(name);
  });
  const nextStepName = nextStep ? getStepTitle(nextStep) : "تبریک! تمام مراحل انجام شد 🎉";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10 pb-20 max-w-7xl mx-auto px-4 sm:px-6 pt-6"
    >
      {/* 1. Header & Greeting */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {new Date().toLocaleDateString('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' })}
           </div>
           <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
             {greeting}، <span className="text-primary">{userProfile?.full_name?.split(' ')[0] || "دوست عزیز"}</span>
           </h1>
        </div>
        
        {/* Project Context Pill */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border border-border/50">
           <span className="text-xs text-muted-foreground">پروژه فعال:</span>
           <span className="text-sm font-bold text-foreground">{plan?.projectName}</span>
        </div>
      </motion.div>

      {/* 2. Hero Section (Focus) */}
      <motion.div variants={itemVariants}>
         <FocusHero nextStepName={nextStepName} />
      </motion.div>

      {/* 3. Stats Strip */}
      <motion.div variants={itemVariants}>
         <StatsStrip 
            progress={progressPercent}
            score={scoreResult.grade}
            completedCount={completedCount}
            totalSteps={totalSteps}
            streak={actionStreak}
         />
      </motion.div>

      {/* 4. Quick Access Grid */}
      <motion.div variants={itemVariants}>
         <QuickAccessGrid projectType={plan?.projectType} />
      </motion.div>

    </motion.div>
  );
}
