"use client";

import { cn, toPersianDigits } from "@/lib/utils";
import {
  LayoutGrid, Map, Bot,
  Presentation, Target, Rocket,
  Calendar, Video, DollarSign,
  Crown, LucideIcon,
  ChevronDown, FolderKanban, Check,
  Activity, Wallet, Receipt,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTourStore } from "@/lib/tour/store";
import { TOUR_VERSION } from "@/lib/tour/registry";
import { isLaunchNavRoute } from "@/lib/launch/config";
import type { ProjectType } from "@/app/new-project/genesis-constants";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "desktop" | "mobile";
}

interface Route {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string;
  hidden?: boolean;
}

export function DashboardSidebar({ className, variant = "desktop" }: SidebarProps) {
  const pathname = usePathname();
  const { activeProject: plan, projects, switchProject } = useProject();
  const [usage, setUsage] = useState<{ ai?: { limit: number | 'unlimited'; used: number }; tier?: string } | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);
  const lastSeenWhatsNew = useTourStore((s) => s.persisted.lastSeenWhatsNewVersion);
  const showWhatsNewBadge = lastSeenWhatsNew !== TOUR_VERSION;

  useEffect(() => {
    async function fetchUsage() {
      try {
        const { getMyUsageSummaryAction } = await import("@/lib/usage-tracker");
        const res = await getMyUsageSummaryAction();
        if (res.success && res.summary) {
          setUsage(res.summary);
        }
      } catch (err) {
        console.error("Failed to fetch usage:", err);
      } finally {
        setLoadingUsage(false);
      }
    }
    fetchUsage();
  }, []);

  const isStartup = plan?.projectType === "startup";
  const isTraditional = plan?.projectType === "traditional";
  const isCreator = plan?.projectType === "creator";

  // --- Common Routes ---
  const commonRoutes: Route[] = [
    { icon: LayoutGrid, label: "پیشخوان", href: "/dashboard/overview", badge: showWhatsNewBadge ? "جدید" : undefined },
    { icon: Map, label: "نقشه راه", href: "/dashboard/roadmap" },
    { icon: Target, label: "تحلیل کسب‌وکار", href: "/dashboard/canvas" },
  ];

  // --- Project-Specific Routes (launch-scoped) ---
  const startupRoutes: Route[] = [
    { icon: Presentation, label: "پیچ‌دک", href: "/dashboard/pitch-deck" },
    { icon: Target, label: "اعتبارسنجی", href: "/dashboard/validation" },
    { icon: Target, label: "تحلیل رقبا", href: "/dashboard/competitors" },
  ];
  const traditionalRoutes: Route[] = [
    { icon: Target, label: "تحلیل رقبا", href: "/dashboard/competitors" },
    { icon: Activity, label: "سلامت کسب‌وکار", href: "/dashboard/health" },
    { icon: Wallet, label: "سود و زیان", href: "/dashboard/finance" },
    { icon: Receipt, label: "هزینه‌ها", href: "/dashboard/expenses" },
    { icon: Target, label: "اهداف KPI", href: "/dashboard/goals" },
  ];
  const creatorRoutes: Route[] = [
    { icon: Calendar, label: "تقویم محتوا", href: "/dashboard/content-calendar" },
    { icon: Video, label: "اسکریپت‌نویسی", href: "/dashboard/scripts" },
    { icon: DollarSign, label: "تعرفه اسپانسری", href: "/dashboard/sponsor-rates" },
  ];

  const projectType = (plan?.projectType || "startup") as ProjectType;

  const specializedRoutes = [
    ...(isStartup ? startupRoutes : []),
    ...(isTraditional ? traditionalRoutes : []),
    ...(isCreator ? creatorRoutes : []),
  ].filter(
    (route) =>
      !route.hidden && isLaunchNavRoute(route.href, projectType),
  );

  const visibleCommonRoutes = commonRoutes.filter((route) =>
    isLaunchNavRoute(route.href, projectType),
  );

  const baseClasses = "flex flex-col h-full bg-card border-l border-border";
  const positionClasses = variant === "desktop"
    ? "fixed inset-y-0 start-0 z-50 w-[280px] hidden md:flex"
    : "flex w-full";

  const getProjectTypeLabel = (type?: string) => {
    switch (type) {
      case "startup": return "استارتاپ";
      case "traditional": return "سنتی";
      case "creator": return "محتوا";
      default: return "—";
    }
  };

  const getProjectTypeColor = (type?: string) => {
    switch (type) {
      case "startup": return "bg-startup";
      case "traditional": return "bg-traditional";
      case "creator": return "bg-creator";
      default: return "bg-muted-foreground";
    }
  };

  return (
    <div className={cn(baseClasses, positionClasses, className)} data-tour-id="sidebar-nav">
      {/* ═══ Logo ═══ */}
      <div className="h-16 flex items-center px-6 border-b border-border/50 shrink-0">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt="Karnex"
            width={36}
            height={36}
            className="rounded-xl shadow-lg shadow-primary/20"
          />
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            کارنکس
          </span>
        </Link>
      </div>

      {/* ═══ Project Switcher ═══ */}
      <div className="px-3 pt-4 pb-2 border-b border-border/30">
        <button
          onClick={() => { if (projects.length > 1) setShowProjectSwitcher(!showProjectSwitcher); }}
          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
            projects.length > 1
              ? "hover:bg-muted/50 border-border/50 cursor-pointer"
              : "border-border/30 cursor-default"
          }`}
        >
          <div className={`w-9 h-9 rounded-lg ${getProjectTypeColor(plan?.projectType)} flex items-center justify-center shrink-0`}>
            <FolderKanban className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-start min-w-0">
            <p className="text-sm font-bold text-foreground truncate">
              {plan?.projectName || "پروژه‌ای انتخاب نشده"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {getProjectTypeLabel(plan?.projectType)}
            </p>
          </div>
          {projects.length > 1 && (
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform shrink-0",
                showProjectSwitcher && "rotate-180"
              )}
            />
          )}
        </button>

        {/* Project Switcher Dropdown */}
        <AnimatePresence>
          {showProjectSwitcher && projects.length > 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-2"
            >
              <div className="space-y-1 p-1 bg-muted/30 rounded-xl border border-border/30">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchProject(p.id || "");
                      setShowProjectSwitcher(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-lg text-start transition-colors",
                      p.id === plan?.id
                        ? "bg-primary/10 text-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className={`w-2 h-2 rounded-full ${getProjectTypeColor(p.projectType)} shrink-0`} />
                    <span className="text-xs font-medium truncate flex-1">{p.projectName}</span>
                    {p.id === plan?.id && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </button>
                ))}
                <Link
                  href="/new-project"
                  onClick={() => setShowProjectSwitcher(false)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-start hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Rocket className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-medium">پروژه جدید</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Navigation ═══ */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        {/* Common Section */}
        <div className="mb-1">
          <p className="px-3 mb-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
            مسیر اصلی
          </p>
          <div className="space-y-1">
            {visibleCommonRoutes.map((route) => (
              <SidebarLink key={route.href} route={route} pathname={pathname} />
            ))}
          </div>
        </div>

        {/* Specialized Section */}
        {specializedRoutes.length > 0 && (
          <div className="mt-4 mb-1">
            <p className="px-3 mb-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
              ابزارهای تخصصی
            </p>
            <div className="space-y-1">
              {specializedRoutes.map((route) => (
                <SidebarLink key={route.href} route={route} pathname={pathname} />
              ))}
            </div>
          </div>
        )}

        {/* AI Assistant — Always Visible */}
        <div className="mt-4">
          <p className="px-3 mb-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
            دستیار هوشمند
          </p>
          <Link
            href="/dashboard/copilot"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
              pathname.startsWith("/dashboard/copilot")
                ? "bg-gradient-to-r from-ai to-purple-600 text-white shadow-md shadow-ai/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Bot className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span>دستیار کارنکس</span>
            <span className={cn(
              "me-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold",
              pathname.startsWith("/dashboard/copilot")
                ? "bg-white/20 text-white"
                : "bg-ai/10 text-ai"
            )}>
              AI
            </span>
          </Link>
        </div>
      </div>

      {/* ═══ Usage Meter ═══ */}
      {!loadingUsage && usage && (
        <div className="px-3 pb-3 pt-2 border-t border-border/40 shrink-0">
          {(() => {
            if (!usage) return null;
            const limit = usage.ai?.limit;
            const used = usage.ai?.used || 0;
            const isUnlimited = limit === "unlimited";

            if (isUnlimited) {
              return (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
                  <div className="text-xs text-primary font-bold flex items-center justify-center gap-1.5">
                    <Crown className="w-4 h-4 fill-primary/10" />
                    <span>پلن {toPersianDigits(usage.tier === 'pro' ? 'تیم' : usage.tier === 'plus' ? 'پرو' : 'رایگان')} — نامحدود</span>
                  </div>
                </div>
              );
            }

            const remaining = Math.max(0, (limit as number) - used);
            const isDepleted = remaining <= 0;
            const isLow = !isDepleted && (remaining / (limit as number)) < 0.20;
            const progressPercent = Math.max(0, Math.min(100, (remaining / (limit as number)) * 100));

            if (isDepleted) {
              return (
                <div className="bg-destructive/5 border border-destructive/30 rounded-xl p-3">
                  <div className="text-xs text-destructive font-bold mb-2 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 fill-destructive/10 animate-pulse" />
                    <span>اعتبار تمام شده</span>
                  </div>
                  <Link href="/dashboard/account?section=billing" className="w-full block">
                    <Button variant="destructive" size="sm" className="w-full text-xs font-bold h-8 rounded-lg">
                      ارتقای اشتراک
                    </Button>
                  </Link>
                </div>
              );
            }

            if (isLow) {
              return (
                <div className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-3">
                  <div className="flex justify-between items-center text-xs text-amber-600 mb-2 font-medium">
                    <span className="flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" />
                      رو به اتمام
                    </span>
                    <span className="font-bold">{toPersianDigits(remaining)}/{toPersianDigits(limit || 0)}</span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <Link href="/dashboard/account?section=billing" className="w-full block">
                    <Button variant="outline" size="sm" className="w-full text-xs text-amber-600 border-amber-500/30 hover:bg-amber-500/5 h-8 font-bold rounded-lg">
                      ارتقای سریع
                    </Button>
                  </Link>
                </div>
              );
            }

            return (
              <div className="bg-muted/30 border border-border/50 rounded-xl p-3">
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-2 font-medium">
                  <span>اعتبار AI</span>
                  <span className="font-bold text-foreground">{toPersianDigits(remaining)}/{toPersianDigits(limit || 0)}</span>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ═══ Quick AI Button ═══ */}
      <div className="px-3 pb-4 shrink-0">
        <Link href="/dashboard/copilot">
          <Button
            variant="gradient"
            className="w-full font-bold gap-2 shadow-lg shadow-ai/20 hover:shadow-ai/30 hover:scale-[1.02] transition-all"
          >
            <Bot className="w-4 h-4" />
            پرسش از دستیار
          </Button>
        </Link>
      </div>
    </div>
  );
}

/* ── Reusable sidebar link ── */
function SidebarLink({ route, pathname }: { route: Route; pathname: string }) {
  const isActive = pathname === route.href;
  return (
    <Link
      href={route.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
        isActive
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <route.icon className={cn(
        "w-5 h-5 transition-transform group-hover:scale-110",
        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
      )} />
      <span className="truncate">{route.label}</span>
      {route.badge && (
        <span className={cn(
          "me-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold",
          isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
        )}>
          {route.badge}
        </span>
      )}
    </Link>
  );
}
