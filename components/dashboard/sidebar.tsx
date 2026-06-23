"use client";

import { cn, toPersianDigits } from "@/lib/utils";
import { 
  // Common
  LayoutGrid, Map, Bot,
  // Startup
  Presentation, Target, Rocket,
  // Traditional
  MapPin, 
  // Creator
  Calendar, Video, BarChart2, DollarSign, Share2, UserCheck, 
  // UI
  Crown, LogOut, LucideIcon
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

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
  const { activeProject: plan } = useProject();
  const [usage, setUsage] = useState<any>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

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

  // Project Types Configuration
  const isStartup = plan?.projectType === "startup"; 
  const isTraditional = plan?.projectType === "traditional";
  const isCreator = plan?.projectType === "creator";

  // --- 1. Common Routes (The "Hybrid" Core) ---
  const commonRoutes: Route[] = [
    { icon: LayoutGrid, label: "پیشخوان", href: "/dashboard/overview" },
    { icon: Map, label: "نقشه راه (Roadmap)", href: "/dashboard/roadmap" },
    { icon: Target, label: "تحلیل کسب و کار", href: "/dashboard/canvas" }, // Moved here
    { icon: Bot, label: "دستیار کارنکس", href: "/dashboard/copilot", badge: "AI" },
  ];

  // --- 2. Startup Routes ---
  const startupRoutes: Route[] = [
    { icon: Presentation, label: "پیچ دک (Pitch Deck)", href: "/dashboard/pitch-deck" },
    // { icon: Target, label: "تحلیل کسب و کار", href: "/dashboard/canvas" }, // Moved to common
  ];

  // --- 3. Traditional Routes ---
  const traditionalRoutes: Route[] = [
    // { icon: Target, label: "تحلیل کسب و کار", href: "/dashboard/canvas" }, // Moved to common
    { icon: MapPin, label: "تحلیل موقعیت مکانی", href: "/dashboard/location" },
  ];

  // --- 4. Creator Routes ---
  const creatorRoutes: Route[] = [
    // { icon: Target, label: "بوم برند شخصی", href: "/dashboard/canvas" }, // Removed
    // { icon: UserCheck, label: "مدیا کیت (Media Kit)", href: "/dashboard/media-kit" }, // Disabled by user request
    { icon: Calendar, label: "تقویم محتوا", href: "/dashboard/content-calendar" },
    { icon: Video, label: "مدیریت اسکریپت", href: "/dashboard/scripts" },
    { icon: Share2, label: "توزیع محتوا", href: "/dashboard/repurpose", hidden: true }, // Disabled
    { icon: DollarSign, label: "تعرفه اسپانسری", href: "/dashboard/sponsor-rates" },
  ];

  // Combine Routes based on Project Type
  const routes = [
    ...commonRoutes,
    ...(isStartup ? startupRoutes : []),
    ...(isTraditional ? traditionalRoutes : []),
    ...(isCreator ? creatorRoutes : []),
  ].filter(route => !route.hidden);

  // Base Styling
  const baseClasses = "flex flex-col h-full bg-card border-l border-border";
  const positionClasses = variant === "desktop" 
    ? "fixed inset-y-0 end-0 z-50 w-[280px] hidden md:flex" 
    : "flex w-full"; // Mobile is handled by Sheet Wrapper

  return (
    <div className={cn(baseClasses, positionClasses, className)} data-tour-id="sidebar-nav">
      {/* Header / Logo */}
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

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
         <div className="space-y-1.5">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                  pathname === route.href
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <route.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", 
                   pathname === route.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="truncate">{route.label}</span>

                {route.badge && (
                  <span className={cn(
                    "me-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                    pathname === route.href 
                      ? "bg-white/20 text-white" 
                      : "bg-primary/10 text-primary"
                  )}>
                    {route.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
       </div>

      {/* Usage Metering Component */}
      {!loadingUsage && usage && (
        <div className="mt-auto px-4 pb-6 pt-2 border-t border-border/40 shrink-0">
          {(() => {
            const limit = usage.ai?.limit;
            const used = usage.ai?.used || 0;
            const isUnlimited = limit === 'unlimited';
            
            if (isUnlimited) {
              return (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 text-center">
                  <div className="text-xs text-primary font-bold flex items-center justify-center gap-1.5">
                    <Crown className="w-4 h-4 fill-primary/10" />
                    <span>پلن {toPersianDigits(usage.tier === 'pro' ? 'حرفه‌ای' : usage.tier === 'plus' ? 'پلاس' : 'رایگان')} — نامحدود</span>
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
                <div className="bg-destructive/5 border border-destructive/30 rounded-2xl p-4">
                  <div className="text-xs text-destructive font-bold mb-2 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 fill-destructive/10 animate-pulse" />
                    <span>اعتبار هوش مصنوعی تمام شده</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                    برای دسترسی مجدد به تحلیل‌ها و دستیار، اشتراک خود را ارتقا دهید.
                  </p>
                  <Link href="/dashboard/settings" className="w-full block">
                    <Button variant="destructive" size="sm" className="w-full text-xs font-bold h-8 rounded-lg shadow-sm">
                      ارتقای اشتراک
                    </Button>
                  </Link>
                </div>
              );
            }

            if (isLow) {
              return (
                <div className="bg-amber-500/5 border border-amber-500/30 rounded-2xl p-4">
                  <div className="flex justify-between items-center text-xs text-amber-600 mb-2 font-medium">
                    <span className="flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 fill-amber-500/10" />
                      رو به اتمام
                    </span>
                    <span className="font-bold">{toPersianDigits(remaining)} از {toPersianDigits(limit)} باقیمانده</span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <Link href="/dashboard/settings" className="w-full block">
                    <Button variant="outline" size="sm" className="w-full text-xs text-amber-600 hover:text-amber-700 border-amber-500/30 hover:border-amber-500/5 bg-transparent hover:bg-amber-500/5 h-8 font-bold rounded-lg">
                      ارتقای سریع
                    </Button>
                  </Link>
                </div>
              );
            }

            return (
              <div className="bg-muted/30 border border-border/50 rounded-2xl p-4">
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-2 font-medium">
                  <span>اعتبار هوش مصنوعی</span>
                  <span className="font-bold text-foreground">{toPersianDigits(remaining)} از {toPersianDigits(limit)} باقیمانده</span>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            );
          })()}
        </div>
      )}

     </div>
  );
}
