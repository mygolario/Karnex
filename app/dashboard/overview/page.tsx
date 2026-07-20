"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Rocket, Plus, Map, LayoutTemplate, Bot, Presentation, FlaskConical, Swords, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FocusHero } from "@/components/dashboard/overview/focus-hero";
import { SetupChecklist } from "@/components/tour/setup-checklist";
import { UpcomingTasks } from "@/components/dashboard/overview/upcoming-tasks";
import { needsRoadmapRepair } from "@/lib/roadmap/quality";
import { cn } from "@/lib/utils";

function getStepTitle(step: unknown): string {
  if (typeof step === "string") return step;
  if (step && typeof step === "object" && "title" in step) {
    return (step as { title: string }).title || "";
  }
  return "";
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const QUICK_LINKS = [
  {
    href: "/dashboard/roadmap",
    label: "نقشه راه",
    desc: "گام بعدی را انجام بده",
    icon: Map,
  },
  {
    href: "/dashboard/canvas",
    label: "بوم کسب‌وکار",
    desc: "مدل کسب‌وکارت را بساز",
    icon: LayoutTemplate,
  },
  {
    href: "/dashboard/copilot",
    label: "دستیار کارنکس",
    desc: "با AI جلو برو",
    icon: Bot,
  },
  {
    href: "/dashboard/pitch-deck",
    label: "پیچ‌دک",
    desc: "ارائه برای سرمایه‌گذار",
    icon: Presentation,
    startupOnly: true,
  },
  {
    href: "/dashboard/validation",
    label: "اعتبارسنجی",
    desc: "فرض‌های خطرناک را بیازما",
    icon: FlaskConical,
    startupOnly: true,
  },
  {
    href: "/dashboard/competitors",
    label: "تحلیل رقبا",
    desc: "رقبای بازار را بشناس",
    icon: Swords,
    startupOnly: true,
  },
] as const;

export default function DashboardOverviewPage() {
  const { userProfile } = useAuth();
  const { activeProject: plan, loading } = useProject();
  const [greeting, setGreeting] = useState("سلام");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) setGreeting("شب بخیر");
    else if (hour < 12) setGreeting("صبح بخیر");
    else if (hour < 17) setGreeting("روز بخیر");
    else setGreeting("عصر بخیر");
  }, []);

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
            <div className="w-24 h-24 bg-gradient-to-tr from-primary to-violet-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30">
              <Rocket size={48} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-3">اولین پروژه‌ات را بساز</h2>
            <p className="text-muted-foreground mb-8 text-base">
              با نقشه راه و هم‌بنیان‌گذار هوشمند کارنکس شروع کن.
            </p>
            <Link href="/new-project">
              <Button size="lg" className="w-full text-base h-12 rounded-xl font-bold">
                <Plus size={20} className="ms-2" />
                ساخت پروژه جدید
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-6">
        <div className="h-12 w-48 bg-muted rounded-xl mb-8" />
        <div className="h-[280px] w-full bg-muted/50 rounded-[2.5rem]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-32">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-muted/30 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const roadmap = plan?.roadmap as unknown as
    | Array<{ steps: unknown[]; phase?: string; title?: string }>
    | undefined;

  const nextStep = roadmap?.flatMap((p) => p.steps || []).find((s) => {
    const name = getStepTitle(s);
    return !plan?.completedSteps?.includes(name);
  });
  const nextStepName = nextStep ? getStepTitle(nextStep) : null;
  const roadmapIncomplete =
    !!plan &&
    (plan.roadmapStatus === "generating" ||
      plan.roadmapStatus === "failed" ||
      needsRoadmapRepair(plan) ||
      !plan.roadmap?.length);

  const links = QUICK_LINKS.filter(
    (l) => !("startupOnly" in l && l.startupOnly) || plan?.projectType === "startup",
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-20 max-w-5xl mx-auto px-4 sm:px-6 pt-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {new Date().toLocaleDateString("fa-IR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            {greeting}،{" "}
            <span className="text-primary">
              {userProfile?.full_name?.split(" ")[0] || "دوست عزیز"}
            </span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border border-border/50">
          <span className="text-xs text-muted-foreground">پروژه:</span>
          <span className="text-sm font-bold text-foreground">{plan?.projectName}</span>
        </div>
      </motion.div>

      {plan?.roadmapStatus === "generating" && (
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
          <span className="text-foreground">
            نقشه راه در حال تکمیل است — کمی صبر کنید.
          </span>
          <Link
            href="/dashboard/roadmap"
            className="ms-auto shrink-0 text-primary hover:underline font-medium"
          >
            مشاهده
          </Link>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <FocusHero
          nextStepName={roadmapIncomplete ? null : nextStepName}
          roadmapIncomplete={roadmapIncomplete}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <SetupChecklist />
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-sm font-bold text-muted-foreground mb-3 px-1">دسترسی سریع</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group rounded-2xl border border-border/60 bg-card p-4 transition-all",
                "hover:border-primary/40 hover:shadow-md",
              )}
            >
              <link.icon className="w-5 h-5 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-sm text-foreground">{link.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <UpcomingTasks plan={plan} />
      </motion.div>
    </motion.div>
  );
}
