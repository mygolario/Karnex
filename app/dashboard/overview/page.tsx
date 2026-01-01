"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { getPlanFromCloud, BusinessPlan } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardIcon, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverExplainer } from "@/components/ui/explainer";
import { LearnMore, FeatureGuide } from "@/components/ui/learn-more";
import { featureExplanations } from "@/lib/knowledge-base";
import { 
  Rocket, 
  Map, 
  Palette, 
  LayoutGrid, 
  Megaphone,
  ArrowLeft,
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  Sparkles,
  Zap,
  FileText,
  Plus,
  Lightbulb,
  HelpCircle,
  Scale,
  BookOpen
} from "lucide-react";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading } = useProject();
  const [showWelcome, setShowWelcome] = useState(false);

  // Show welcome guide for first visit
  useEffect(() => {
    if (plan && !localStorage.getItem('karnex_welcomed')) {
      setShowWelcome(true);
    }
  }, [plan]);

  const dismissWelcome = () => {
    localStorage.setItem('karnex_welcomed', 'true');
    setShowWelcome(false);
  };

  const quickActions = [
    { 
      icon: Map, 
      label: "نقشه راه", 
      href: "/dashboard/roadmap", 
      color: "primary",
      description: featureExplanations.roadmap.description
    },
    { 
      icon: LayoutGrid, 
      label: "بوم کسب‌وکار", 
      href: "/dashboard/canvas", 
      color: "accent",
      description: featureExplanations.canvas.description
    },
    { 
      icon: Palette, 
      label: "هویت بصری", 
      href: "/dashboard/brand", 
      color: "secondary",
      description: featureExplanations.brand.description
    },
    { 
      icon: Megaphone, 
      label: "بازاریابی", 
      href: "/dashboard/marketing", 
      color: "primary",
      description: featureExplanations.marketing.description
    },
  ];

  const stats = [
    { label: "مراحل کل", value: plan?.roadmap?.length || 0, icon: Target, tip: "تعداد فازهای اصلی نقشه راه شما" },
    { label: "تسک‌ها", value: plan?.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 0, icon: CheckCircle2, tip: "مجموع کارهایی که باید انجام دهید" },
    { label: "پیشرفت", value: plan?.completedSteps && plan?.roadmap ? Math.round((plan.completedSteps.length / (plan.roadmap.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 1)) * 100) + "٪" : "۰٪", icon: TrendingUp, tip: "درصد تسک‌هایی که تکمیل کرده‌اید" },
  ];

  // Empty State
  if (!loading && !plan) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Rocket size={40} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            هنوز پروژه‌ای نساخته‌اید
          </h2>
          <p className="text-muted-foreground mb-6">
            برای شروع، یک ایده را توصیف کنید و بگذارید هوش مصنوعی طرح کسب‌وکار کامل بسازد.
          </p>
          <Link href="/new-project">
            <Button variant="gradient" size="lg" rounded="full">
              <Plus size={18} />
              ساخت پروژه جدید
              <ArrowLeft size={16} />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-2xl" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-2xl" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Welcome Guide Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <Card variant="default" padding="xl" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-foreground mb-2">به کارنکس خوش آمدید! 🎉</h2>
              <p className="text-muted-foreground">اینجا همه چیز درباره اجرای ایده شما آماده است</p>
            </div>

            <div className="space-y-4 mb-6">
              <FeatureGuide
                icon={<Map size={20} />}
                title="نقشه راه"
                description="قدم به قدم بهتون میگه چیکار کنید. هر قدم رو انجام بدید و تیک بزنید!"
                variant="primary"
              />
              <FeatureGuide
                icon={<LayoutGrid size={20} />}
                title="بوم کسب‌وکار"
                description="خلاصه کل کسب‌وکارتون در یک نگاه: مشکل، راه‌حل، و درآمد"
                variant="accent"
              />
              <FeatureGuide
                icon={<Sparkles size={20} />}
                title="دستیار هوشمند"
                description="هر سوالی داشتید، روی دکمه گوشه پایین کلیک کنید!"
                variant="secondary"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="gradient" className="flex-1" onClick={dismissWelcome}>
                فهمیدم، بزن بریم!
                <ArrowLeft size={16} />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-secondary p-8 text-white">
        <div className="absolute inset-0 pattern-dots opacity-10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20 mb-4">
            <Sparkles size={12} />
            داشبورد
          </Badge>
          
          <h1 className="text-3xl font-black mb-2">
            سلام، خوش آمدید! 👋
          </h1>
          <p className="text-white/80 text-lg mb-6">
            پروژه <span className="font-bold text-white">{plan?.projectName || "شما"}</span> آماده توسعه است
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/roadmap">
              <Button className="bg-white text-primary hover:bg-white/90">
                <Map size={16} />
                مشاهده نقشه راه
              </Button>
            </Link>
            <Link href="/new-project">
              <Button variant="ghost" className="text-white border-white/20 hover:bg-white/10">
                <Plus size={16} />
                پروژه جدید
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="text-white border-white/20 hover:bg-white/10"
              onClick={() => setShowWelcome(true)}
            >
              <HelpCircle size={16} />
              راهنما
            </Button>
          </div>
        </div>
      </div>

      {/* Stats with Tooltips */}
      <div className="grid md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} variant="default" hover="lift" className="flex items-center gap-4">
            <CardIcon variant={i === 0 ? "primary" : i === 1 ? "accent" : "secondary"}>
              <stat.icon size={20} />
            </CardIcon>
            <div className="flex-1">
              <div className="text-2xl font-black text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                {stat.label}
                <HoverExplainer text={stat.tip} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Getting Started Guide */}
      <LearnMore title="چطور شروع کنم؟" variant="accent" defaultOpen={true}>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm leading-7 mb-4">
            از نقشه راه شروع کنید! هر مرحله را بخوانید، انجام دهید و تیک بزنید. نگران نباشید - هر قدم توضیحات کامل دارد.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold">۱</div>
              <span className="text-sm text-foreground">نقشه راه را ببینید</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold">۲</div>
              <span className="text-sm text-foreground">اولین تسک را انجام دهید</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold">۳</div>
              <span className="text-sm text-foreground">تیک بزنید و ادامه دهید!</span>
            </div>
          </div>
        </div>
      </LearnMore>

      {/* Quick Actions with Descriptions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-bold text-foreground">دسترسی سریع</h2>
          <HoverExplainer text="اینجا همه ابزارهای مهم داشبورد را می‌بینید" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href}>
              <Card 
                variant="default" 
                hover="lift"
                className="flex flex-col items-center text-center py-6 h-full"
              >
                <CardIcon variant={action.color as any} className="mb-3 h-14 w-14">
                  <action.icon size={24} />
                </CardIcon>
                <span className="font-bold text-foreground mb-2">{action.label}</span>
                <span className="text-xs text-muted-foreground line-clamp-2 px-2">
                  {action.description}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Project Summary */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Idea Summary */}
        <Card variant="default" padding="lg">
          <div className="flex items-start gap-4 mb-4">
            <CardIcon variant="primary">
              <FileText size={20} />
            </CardIcon>
            <div>
              <CardTitle>خلاصه ایده</CardTitle>
              <CardDescription>توضیحات اولیه پروژه شما</CardDescription>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed line-clamp-4">
            {plan?.overview || "توضیحاتی برای این پروژه ثبت نشده است."}
          </p>
        </Card>

        {/* Next Steps */}
        <Card variant="default" padding="lg">
          <div className="flex items-start gap-4 mb-4">
            <CardIcon variant="secondary">
              <Zap size={20} />
            </CardIcon>
            <div>
              <CardTitle>قدم‌های بعدی</CardTitle>
              <CardDescription>اولین کارهایی که باید انجام دهید</CardDescription>
            </div>
          </div>
          <div className="space-y-3">
            {plan?.roadmap?.[0]?.steps?.slice(0, 3).map((task: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                  <CheckCircle2 size={14} />
                </div>
                <span className="text-sm text-muted-foreground">{task}</span>
              </div>
            )) || (
              <p className="text-muted-foreground text-sm">
                هنوز تسکی تعریف نشده است.
              </p>
            )}
          </div>
          <Link href="/dashboard/roadmap" className="block mt-4">
            <Button variant="outline" size="sm" className="w-full">
              مشاهده همه مراحل
              <ArrowLeft size={14} />
            </Button>
          </Link>
        </Card>
      </div>

      {/* Tips */}
      <Card variant="muted" className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
          <Sparkles size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground mb-1">نکته روز</h3>
          <p className="text-sm text-muted-foreground">
            با کلیک روی دستیار هوشمند در گوشه پایین صفحه، می‌توانید در مورد هر بخش از پروژه سوال بپرسید!
          </p>
        </div>
        <Link href="/dashboard/help">
          <Button variant="ghost" size="sm">
            <BookOpen size={14} />
            مرکز راهنما
          </Button>
        </Link>
      </Card>
    </div>
  );
}
