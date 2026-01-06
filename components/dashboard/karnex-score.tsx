"use client";

import { useState, useEffect } from "react";
import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { 
  Trophy, 
  Target, 
  Zap, 
  Rocket, 
  Star, 
  Award,
  TrendingUp,
  Shield,
  Lightbulb,
  CheckCircle2,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  unlocked: boolean;
  progress?: number;
}

interface KarnexScoreProps {
  className?: string;
  compact?: boolean;
}

export function KarnexScore({ className, compact = false }: KarnexScoreProps) {
  const { activeProject: plan } = useProject();
  const [animatedScore, setAnimatedScore] = useState(0);

  // Calculate comprehensive Karnex Score
  const calculateScore = () => {
    if (!plan) return { score: 0, breakdown: {} };

    let score = 0;
    const breakdown: Record<string, number> = {};

    // 1. Roadmap Progress (up to 40 points)
    const totalSteps = plan.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 1;
    const completedSteps = plan.completedSteps?.length || 0;
    const roadmapProgress = Math.round((completedSteps / totalSteps) * 40);
    breakdown.roadmap = roadmapProgress;
    score += roadmapProgress;

    // 2. Business Canvas Completeness (up to 20 points)
    const canvas = plan.leanCanvas as Record<string, any> | undefined;
    const canvasFields = ['problem', 'solution', 'uniqueValue', 'channels', 'customerSegments', 'costStructure', 'revenueStreams'];
    const filledCanvas = canvas ? canvasFields.filter(f => canvas[f] && String(canvas[f]).length > 3).length : 0;
    const canvasScore = Math.round((filledCanvas / canvasFields.length) * 20);
    breakdown.canvas = canvasScore;
    score += canvasScore;

    // 3. Brand Kit (up to 15 points)
    let brandScore = 0;
    const brandKit = plan.brandKit as Record<string, any> | undefined;
    if (brandKit?.palette?.length > 0) brandScore += 5;
    if (brandKit?.font) brandScore += 5;
    if (brandKit?.logoConcepts?.length > 0) brandScore += 5;
    breakdown.brand = brandScore;
    score += brandScore;

    // 4. Marketing Strategy (up to 15 points)
    let marketingScore = 0;
    const planAny = plan as Record<string, any>;
    if (planAny.growthHacks?.length > 0) marketingScore += 8;
    if (planAny.competitors?.length > 0) marketingScore += 7;
    breakdown.marketing = marketingScore;
    score += marketingScore;

    // 5. Base completion bonus (10 points for having a plan)
    if (plan.projectName) {
      breakdown.base = 10;
      score += 10;
    }

    return { score: Math.min(100, score), breakdown };
  };

  const { score, breakdown } = calculateScore();

  // Animate score on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  // Investment readiness percentage
  const investmentReadiness = Math.min(100, Math.round(score * 0.85 + 10));

  // Define achievements
  const achievements: Achievement[] = [
    {
      id: "first_step",
      name: "قدم اول",
      description: "اولین تسک نقشه راه را کامل کن",
      icon: Rocket,
      color: "bg-blue-500",
      unlocked: (plan?.completedSteps?.length || 0) >= 1
    },
    {
      id: "halfway",
      name: "نیمه راه",
      description: "۵۰٪ نقشه راه را تکمیل کن",
      icon: Target,
      color: "bg-amber-500",
      unlocked: score >= 50,
      progress: score < 50 ? Math.round(score * 2) : 100
    },
    {
      id: "canvas_master",
      name: "استاد بوم",
      description: "بوم کسب‌وکار را کامل کن",
      icon: Lightbulb,
      color: "bg-purple-500",
      unlocked: (breakdown.canvas || 0) >= 18
    },
    {
      id: "brand_builder",
      name: "سازنده برند",
      description: "هویت بصری کامل داشته باش",
      icon: Star,
      color: "bg-pink-500",
      unlocked: (breakdown.brand || 0) >= 12
    },
    {
      id: "growth_hacker",
      name: "هکر رشد",
      description: "استراتژی بازاریابی را کامل کن",
      icon: Zap,
      color: "bg-emerald-500",
      unlocked: (breakdown.marketing || 0) >= 12
    },
    {
      id: "ready_investor",
      name: "آماده سرمایه‌گذاری",
      description: "امتیاز ۸۵ یا بالاتر بگیر",
      icon: Trophy,
      color: "bg-gradient-to-br from-yellow-400 to-amber-600",
      unlocked: score >= 85
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <ProgressRing progress={animatedScore} size={80} strokeWidth={8}>
          <span className="text-xl font-black">{animatedScore}</span>
        </ProgressRing>
        <div>
          <div className="text-sm font-bold text-foreground">امتیاز کارنکس</div>
          <div className="text-xs text-muted-foreground">
            {investmentReadiness}% آماده سرمایه‌گذاری
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Score Card */}
      <Card variant="gradient" className="relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-6">
          {/* Score Ring */}
          <div className="relative">
            <ProgressRing progress={animatedScore} size={140} strokeWidth={10}>
              <div className="text-center">
                <span className="text-4xl font-black block">{animatedScore}</span>
                <span className="text-xs opacity-80">از ۱۰۰</span>
              </div>
            </ProgressRing>
            
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl -z-10 scale-75" />
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-right">
            <h3 className="text-2xl font-black mb-2">امتیاز کارنکس</h3>
            <p className="text-white/80 mb-4 text-sm">
              نمایانگر آمادگی پروژه شما برای اجرا و سرمایه‌گذاری
            </p>
            
            {/* Investment Readiness */}
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 inline-flex items-center gap-3">
              <Shield size={20} className="text-emerald-300" />
              <div className="text-right">
                <div className="text-xs opacity-80">آمادگی سرمایه‌گذاری</div>
                <div className="font-bold text-lg">{investmentReadiness}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="relative z-10 border-t border-white/10 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          <div>
            <div className="text-2xl font-bold">{breakdown.roadmap || 0}</div>
            <div className="text-xs opacity-70">نقشه راه</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{breakdown.canvas || 0}</div>
            <div className="text-xs opacity-70">بوم کسب‌وکار</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{breakdown.brand || 0}</div>
            <div className="text-xs opacity-70">هویت برند</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{breakdown.marketing || 0}</div>
            <div className="text-xs opacity-70">بازاریابی</div>
          </div>
        </div>
      </Card>

      {/* Achievements Section */}
      <Card variant="default" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Award size={18} className="text-amber-500" />
            دستاوردها
          </h3>
          <Badge variant="secondary">
            {unlockedCount} از {achievements.length}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                "relative p-4 rounded-xl border transition-all",
                achievement.unlocked
                  ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 dark:from-amber-950/30 dark:to-orange-950/30"
                  : "bg-muted/50 border-border opacity-60 grayscale"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-2",
                achievement.unlocked ? achievement.color : "bg-muted"
              )}>
                {achievement.unlocked ? (
                  <achievement.icon size={20} className="text-white" />
                ) : (
                  <Lock size={16} className="text-muted-foreground" />
                )}
              </div>
              
              <h4 className="font-bold text-sm text-foreground mb-0.5">{achievement.name}</h4>
              <p className="text-[10px] text-muted-foreground line-clamp-2">{achievement.description}</p>
              
              {/* Progress bar for locked achievements */}
              {!achievement.unlocked && achievement.progress !== undefined && (
                <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 transition-all" 
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
              )}
              
              {achievement.unlocked && (
                <div className="absolute top-2 left-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* CTA for low score */}
      {score < 50 && (
        <Card variant="muted" className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp size={24} className="text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-foreground text-sm">امتیازت رو افزایش بده!</h4>
            <p className="text-xs text-muted-foreground">با تکمیل تسک‌های نقشه راه، امتیاز کارنکست رو بالا ببر.</p>
          </div>
          <Link href="/dashboard/roadmap">
            <Button variant="gradient" size="sm">شروع</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
