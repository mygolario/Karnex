import Link from "next/link";
import { auth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getUserProjectsAction } from "@/lib/project-actions";
import { ProjectsList } from "@/components/projects/projects-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HoverExplainer } from "@/components/ui/explainer";
import { LearnMore } from "@/components/ui/learn-more";
import { 
  Plus, 
  LayoutGrid,
  Lightbulb
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const res = await getUserProjectsAction();
  const projects = res.success ? (res.projects || []) : [];

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

        {/* Projects List Client Component wrapper */}
        <ProjectsList initialProjects={projects} />

      </div>
    </div>
  );
}
