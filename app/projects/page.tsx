"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { deleteProject } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverExplainer } from "@/components/ui/explainer";
import { LearnMore } from "@/components/ui/learn-more";
import { 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  MoreHorizontal,
  LayoutGrid,
  Lightbulb,
  TrendingUp,
  Trash2,
  AlertTriangle,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, activeProject, switchProject, loading, refreshProjects } = useProject();
  const router = useRouter();
  
  // Delete confirmation state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSelectProject = (projectId: string) => {
    switchProject(projectId);
    router.push("/dashboard/overview");
  };

  const handleDeleteClick = (e: React.MouseEvent, project: any) => {
    e.stopPropagation(); // Prevent card click
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !projectToDelete?.id) return;
    
    setDeleting(true);
    try {
      await deleteProject(user.id!, projectToDelete.id);
      
      // If we deleted the active project, clear it
      if (activeProject?.id === projectToDelete.id) {
        // Switch to first remaining project or null
        const remaining = projects.filter(p => p.id !== projectToDelete.id);
        if (remaining.length > 0) {
          switchProject(remaining[0].id!);
        }
      }
      
      // Refresh the projects list
      if (refreshProjects) {
        await refreshProjects();
      }
      
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Failed to delete project:", error);
    } finally {
      setDeleting(false);
    }
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
    <div className="min-h-screen bg-background p-6 lg:p-12 animate-fade-in-up" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 to-primary text-white shadow-2xl shadow-indigo-900/20 p-8 md:p-12">
           <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center" />
           <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
           
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <Link href="/" className="group">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
                     <LayoutGrid size={40} className="text-white" />
                  </div>
                </Link>
                <div>
                   <h1 className="text-4xl font-black mb-2 tracking-tight">پروژه‌های من</h1>
                   <p className="text-white/70 text-lg">همه استارتاپ‌های خود را در یک جا مدیریت کنید</p>
                </div>
              </div>

              <div className="flex gap-4">
                 <Link href="/dashboard/settings">
                    <Button variant="outline" className="h-12 border-white/20 hover:bg-white/10 text-white bg-transparent">
                      تنظیمات حساب
                    </Button>
                 </Link>
                 <Link href="/new-project">
                    <Button variant="default" size="lg" className="h-12 shadow-lg shadow-white/10 bg-white text-primary hover:bg-white/90 font-bold">
                        <Plus size={20} className="mr-2" />
                        ساخت پروژه جدید
                    </Button>
                 </Link>
              </div>
           </div>
        </div>

        {/* What is a Project Explanation */}
        <div className="grid md:grid-cols-3 gap-6">
           <div className="md:col-span-2">
              <LearnMore title="پروژه چیست؟" variant="muted" className="h-full bg-card/50 backdrop-blur-sm border-border/50">
                <p className="text-muted-foreground text-sm leading-7 mb-3">
                  هر پروژه یک ایده کسب‌وکار است که کارنکس برایش نقشه راه ساخته. می‌توانید چند پروژه مختلف داشته باشید و بین آن‌ها جابجا شوید.
                  شما می‌توانید برای هر ایده، یک بوم مدل کسب‌وکار، نقشه راه اجرایی و هویت بصری جداگانه داشته باشید.
                </p>
                <div className="flex items-center gap-2 text-xs text-primary font-medium mt-4 bg-primary/5 w-fit px-3 py-1.5 rounded-lg border border-primary/10">
                  <Lightbulb size={14} className="text-primary" />
                  نکته حرفه‌ای: روی هر پروژه کلیک کنید تا وارد داشبورد مدیریتی آن شوید!
                </div>
              </LearnMore>
           </div>
           
           <Card variant="glass" className="flex flex-col justify-center p-6 bg-gradient-to-br from-card to-muted/30">
              <span className="text-sm font-bold text-foreground mb-4 block">راهنمای وضعیت‌ها:</span>
              <div className="space-y-3">
                 {[
                    { icon: "💡", label: "ایده", tip: "هنوز شروع نکرده‌اید", color: "text-muted-foreground" },
                    { icon: "🚀", label: "شروع", tip: "کمتر از ۳۰٪ تکمیل شده", color: "text-blue-500" },
                    { icon: "📈", label: "در حال رشد", tip: "۳۰-۷۰٪ تکمیل شده", color: "text-purple-500" },
                    { icon: "✅", label: "کامل شده", tip: "همه تسک‌ها انجام شده!", color: "text-emerald-500" }
                 ].map((stage, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-background/50 p-2 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2">
                         <span className="text-base">{stage.icon}</span>
                         <span className={`font-medium ${stage.color}`}>{stage.label}</span>
                      </div>
                      <HoverExplainer text={stage.tip} />
                    </div>
                 ))}
              </div>
           </Card>
        </div>

        {projects.length === 0 ? (
            // Empty State
            <div className="relative overflow-hidden rounded-[3rem] border border-dashed border-border/60 bg-muted/20 p-12 text-center group hover:bg-muted/30 transition-colors">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
                <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
                    <div className="w-24 h-24 bg-gradient-to-tr from-primary/10 to-purple-500/10 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner animate-float">
                         <LayoutGrid size={48} className="text-primary/50" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-3">هنوز پروژه‌ای ندارید</h3>
                    <p className="text-muted-foreground text-lg mb-8 leading-8">
                        اولین قدم برای راه‌اندازی استارتاپ خود را بردارید. ایده خود را بنویسید و کارنکس نقشه راه کامل، بوم کسب‌وکار و استراتژی بازاریابی شما را ترسیم می‌کند.
                    </p>
                    <Link href="/new-project">
                        <Button variant="gradient" size="lg" className="h-14 px-8 text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                            شروع اولین پروژه
                            <ArrowLeft size={20} className="mr-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        ) : (
            // Projects Grid
            <div className="grid md:grid-cols-2 gap-6">
                {projects.map((project, idx) => {
                    const stage = getProjectStage(project);
                    const totalSteps = project.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 0;
                    const completedSteps = project.completedSteps?.length || 0;
                    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                    return (
                      <div 
                           key={project.id || idx}
                           onClick={() => handleSelectProject(project.id!)}
                           className="group relative"
                      >
                          {/* Glow Effect */}
                          <div className={`
                             absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-[2.1rem] opacity-0 
                             group-hover:opacity-30 blur-lg transition duration-500 group-hover:duration-200
                             ${activeProject?.id === project.id ? "opacity-40 animate-pulse-glow" : ""}
                          `} />
                          
                          <Card 
                              variant="glass" 
                              hover="lift"
                              className={`
                                  relative h-full flex flex-col justify-between overflow-hidden cursor-pointer border-2 !rounded-[2rem]
                                  ${activeProject?.id === project.id 
                                      ? "border-primary/50 bg-primary/5 dark:bg-primary/10" 
                                      : "border-transparent hover:border-primary/20"}
                              `}
                          >
                              {/* Background Pattern */}
                              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
                              
                              <div className="relative z-10 p-6 space-y-6">
                                  {/* Header area */}
                                  <div className="flex justify-between items-start">
                                      <div className="flex gap-4">
                                          <div className={`
                                              w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg
                                              ${activeProject?.id === project.id 
                                                  ? "bg-gradient-to-br from-primary to-purple-600 text-white shadow-primary/30" 
                                                  : "bg-muted text-foreground shadow-black/5"}
                                          `}>
                                              {project.projectName.charAt(0)}
                                          </div>
                                          <div>
                                              <div className="flex items-center gap-2 mb-1">
                                                  <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                                                      {project.projectName}
                                                  </h3>
                                                  {activeProject?.id === project.id && (
                                                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                                  )}
                                              </div>
                                              <div className="flex items-center gap-2">
                                                  <Badge variant={stage.color as any} size="sm" className="font-medium text-[10px] h-5">
                                                    {stage.icon} {stage.stage}
                                                  </Badge>
                                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                      <Clock size={10} />
                                                      {new Date(project.updatedAt || project.createdAt).toLocaleDateString('fa-IR')}
                                                  </span>
                                              </div>
                                          </div>
                                      </div>
                                      
                                      <button
                                        onClick={(e) => handleDeleteClick(e, project)}
                                        className="w-9 h-9 rounded-xl bg-background/50 hover:bg-destructive hover:text-white text-muted-foreground flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                        title="حذف پروژه"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                  </div>

                                  <div className="min-h-[3rem]">
                                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                                        {project.overview || "توضیحی ثبت نشده است. روی پروژه کلیک کنید تا وارد داشبورد شوید."}
                                    </p>
                                  </div>

                                  {/* Progress Section */}
                                  <div className="space-y-4 pt-4 border-t border-border/30">
                                      <div className="flex justify-between items-end mb-1">
                                          <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                              <div className="p-1 bg-primary/10 rounded-md">
                                                <TrendingUp size={12} className="text-primary" />
                                              </div>
                                              <span>{progress}٪ پیشرفت</span>
                                          </div>
                                          <span className="text-[10px] text-muted-foreground">{completedSteps} از {totalSteps} گام</span>
                                      </div>
                                      
                                      <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                                            style={{ width: `${progress}%` }}
                                          >
                                             <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </Card>
                      </div>
                    );
                })}
            </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && projectToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setDeleteModalOpen(false)}
        >
          <div 
            className="bg-card w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6 animate-bounce-gentle">
                <AlertTriangle size={40} className="text-destructive" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-2">مطمئن هستید؟</h3>
              <p className="text-muted-foreground text-lg">
                آیا می‌خواهید پروژه <strong className="text-foreground border-b-2 border-destructive/30 border-dashed">{projectToDelete.projectName}</strong> را حذف کنید؟
              </p>
            </div>

            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 mb-8 flex gap-3 text-destructive text-sm text-right">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <span>این عملیات غیرقابل بازگشت است و تمام داده‌های مربوط به این پروژه فوراً حذف خواهند شد.</span>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 h-14 text-lg rounded-2xl"
                disabled={deleting}
              >
                انصراف
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={handleConfirmDelete}
                className="flex-1 h-14 text-lg rounded-2xl shadow-xl shadow-destructive/20"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    در حال حذف...
                  </>
                ) : (
                  <>
                    حذف پروژه
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
