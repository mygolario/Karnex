"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverExplainer } from "@/components/ui/explainer";
import { LearnMore } from "@/components/ui/learn-more";
import { 
  Rocket, 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  MoreHorizontal,
  LayoutGrid,
  Lightbulb,
  TrendingUp,
  HelpCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, activeProject, switchProject, loading } = useProject();
  const router = useRouter();

  const handleSelectProject = (projectId: string) => {
    switchProject(projectId);
    router.push("/dashboard/overview");
  };

  // Calculate project stage
  const getProjectStage = (project: any) => {
    const totalSteps = project.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 0;
    const completedSteps = project.completedSteps?.length || 0;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    
    if (progress === 0) return { stage: "ایده", color: "muted", icon: "💡" };
    if (progress < 30) return { stage: "شروع", color: "info", icon: "🚀" };
    if (progress < 70) return { stage: "در حال رشد", color: "accent", icon: "📈" };
    if (progress < 100) return { stage: "نزدیک به هدف", color: "success", icon: "🎯" };
    return { stage: "کامل شده", color: "success", icon: "✅" };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 bg-muted rounded-xl mb-4" />
            <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-12" dir="rtl">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                <Rocket size={20} />
             </div>
             <span className="font-black text-xl text-foreground">کارنکس</span>
          </Link>
          
          <div className="flex items-center gap-3">
             <Link href="/dashboard/settings">
                <Button variant="ghost">تنظیمات حساب</Button>
             </Link>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-black text-foreground mb-2">پروژه‌های من</h1>
                <p className="text-muted-foreground">همه استارتاپ‌های خود را در یک جا مدیریت کنید</p>
            </div>
            <Link href="/new-project">
                <Button variant="gradient" size="lg" className="shadow-lg shadow-primary/20">
                    <Plus size={18} />
                    ساخت پروژه جدید
                </Button>
            </Link>
        </div>

        {/* What is a Project Explanation */}
        <LearnMore title="پروژه چیست؟" variant="muted" className="mb-8">
          <p className="text-muted-foreground text-sm leading-7 mb-3">
            هر پروژه یک ایده کسب‌وکار است که هوش مصنوعی برایش نقشه راه ساخته. می‌توانید چند پروژه مختلف داشته باشید و بین آن‌ها جابجا شوید.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lightbulb size={14} className="text-accent" />
            نکته: روی هر پروژه کلیک کنید تا وارد داشبورد آن شوید!
          </div>
        </LearnMore>

        {/* Project Stages Legend */}
        <div className="flex flex-wrap gap-3 mb-6">
          <span className="text-sm text-muted-foreground">مراحل پروژه:</span>
          {[
            { icon: "💡", label: "ایده", tip: "هنوز شروع نکرده‌اید" },
            { icon: "🚀", label: "شروع", tip: "کمتر از ۳۰٪ تکمیل شده" },
            { icon: "📈", label: "در حال رشد", tip: "۳۰-۷۰٪ تکمیل شده" },
            { icon: "🎯", label: "نزدیک به هدف", tip: "بیش از ۷۰٪ تکمیل شده" },
            { icon: "✅", label: "کامل شده", tip: "همه تسک‌ها انجام شده!" }
          ].map((stage, i) => (
            <div key={i} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-lg">
              <span>{stage.icon}</span>
              <span className="text-muted-foreground">{stage.label}</span>
              <HoverExplainer text={stage.tip} />
            </div>
          ))}
        </div>

        {projects.length === 0 ? (
            // Empty State
            <Card variant="default" padding="xl" className="text-center py-20">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <LayoutGrid size={40} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">هنوز پروژه‌ای ندارید</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    اولین قدم را بردارید. ایده خود را بنویسید و هوش مصنوعی نقشه راه شما را ترسیم می‌کند.
                </p>
                <div className="bg-muted/50 rounded-xl p-4 max-w-md mx-auto mb-8">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lightbulb size={14} className="text-accent" />
                    <span>فقط کافیست ایده‌تان را توضیح دهید، بقیه کارها با ماست!</span>
                  </div>
                </div>
                <Link href="/new-project">
                    <Button variant="default" size="lg">
                        شروع اولین پروژه
                        <ArrowLeft size={18} />
                    </Button>
                </Link>
            </Card>
        ) : (
            // Projects Grid
            <div className="grid md:grid-cols-2 gap-4">
                {projects.map((project) => {
                    const stage = getProjectStage(project);
                    const totalSteps = project.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 0;
                    const completedSteps = project.completedSteps?.length || 0;
                    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                    return (
                      <Card 
                          key={project.id || 'current'} 
                          variant="default" 
                          hover="lift"
                          className={`group relative overflow-hidden cursor-pointer border-2 transition-all ${
                              activeProject?.id === project.id 
                                  ? "border-primary bg-primary/5" 
                                  : "border-transparent hover:border-primary/20"
                          }`}
                          onClick={() => handleSelectProject(project.id!)}
                      >
                          {/* Status Badges */}
                          <div className="absolute top-4 left-4 z-10 flex gap-2">
                            {activeProject?.id === project.id && (
                                <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                    <CheckCircle2 size={12} className="mr-1" />
                                    فعال
                                </Badge>
                            )}
                            <Badge variant={stage.color as any}>
                              {stage.icon} {stage.stage}
                            </Badge>
                          </div>

                          <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold
                                       ${activeProject?.id === project.id ? "bg-primary text-white" : "bg-muted text-foreground"}
                                  `}>
                                      {project.projectName.charAt(0)}
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                                          {project.projectName}
                                      </h3>
                                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                          <Clock size={12} />
                                          آخرین تغییر: {new Date(project.updatedAt || project.createdAt).toLocaleDateString('fa-IR')}
                                      </p>
                                  </div>
                              </div>
                          </div>
                          
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
                              {project.overview || "بدون توضیحات"}
                          </p>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>پیشرفت</span>
                              <span>{progress}٪</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-border/50">
                              <div className="flex items-center gap-2">
                                <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md flex items-center gap-1">
                                    <TrendingUp size={12} />
                                    {completedSteps} از {totalSteps} تسک
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="text-primary group-hover:bg-primary/10">
                                  مدیریت پروژه
                                  <ArrowLeft size={16} />
                              </Button>
                          </div>
                      </Card>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
}
