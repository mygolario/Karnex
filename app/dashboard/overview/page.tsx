"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { getPlanFromCloud, BusinessPlan } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardIcon, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Plus
} from "lucide-react";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading } = useProject(); // Use context

  const quickActions = [
    { icon: Map, label: "نقشه راه", href: "/dashboard/roadmap", color: "primary" },
    { icon: LayoutGrid, label: "بوم کسب‌وکار", href: "/dashboard/canvas", color: "accent" },
    { icon: Palette, label: "هویت بصری", href: "/dashboard/brand", color: "secondary" },
    { icon: Megaphone, label: "بازاریابی", href: "/dashboard/marketing", color: "primary" },
  ];

  const stats = [
    { label: "مراحل کل", value: plan?.roadmap?.length || 0, icon: Target },
    { label: "تسک‌ها", value: plan?.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 0, icon: CheckCircle2 },
    { label: "پیشرفت", value: plan?.completedSteps && plan?.roadmap ? Math.round((plan.completedSteps.length / (plan.roadmap.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 1)) * 100) + "٪" : "۰٪", icon: TrendingUp },
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
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-secondary p-8 text-white">
        {/* Background Pattern */}
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
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} variant="default" hover="lift" className="flex items-center gap-4">
            <CardIcon variant={i === 0 ? "primary" : i === 1 ? "accent" : "secondary"}>
              <stat.icon size={20} />
            </CardIcon>
            <div>
              <div className="text-2xl font-black text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">دسترسی سریع</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href}>
              <Card 
                variant="default" 
                hover="lift"
                className="flex flex-col items-center text-center py-8"
              >
                <CardIcon variant={action.color as any} className="mb-3 h-14 w-14">
                  <action.icon size={24} />
                </CardIcon>
                <span className="font-bold text-foreground">{action.label}</span>
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
      </Card>
    </div>
  );
}
