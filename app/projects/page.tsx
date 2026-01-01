"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  MoreHorizontal,
  LayoutGrid
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

        {projects.length === 0 ? (
            // Empty State
            <Card variant="default" padding="xl" className="text-center py-20">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <LayoutGrid size={40} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">هنوز پروژه‌ای ندارید</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    اولین قدم را بردارید. ایده خود را بنویسید و هوش مصنوعی نقشه راه شما را ترسیم می‌کند.
                </p>
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
                {projects.map((project) => (
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
                        {activeProject?.id === project.id && (
                            <div className="absolute top-4 left-4 z-10">
                                <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                    <CheckCircle2 size={12} className="mr-1" />
                                    فعال
                                </Badge>
                            </div>
                        )}

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

                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <div className="flex -space-x-2 space-x-reverse">
                                {/* Avatars placeholder or stats */}
                                <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                    {project.completedSteps?.length || 0} تسک انجام شده
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary group-hover:bg-primary/10">
                                مدیریت پروژه
                                <ArrowLeft size={16} />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
