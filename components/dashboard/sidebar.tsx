"use client";

import { cn } from "@/lib/utils";
import { 
  // Common
  LayoutGrid, Map, FlaskConical, Bot, TrendingUp, FileText,
  // Startup
  Presentation, Target, Rocket,
  // Traditional
  Store, Users, Package, MapPin, Lightbulb, MessageSquare,
  // Creator
  Calendar, Video, BarChart2, DollarSign, Share2, UserCheck, 
  // UI
  Crown, LogOut, LucideIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "desktop" | "mobile";
}

interface Route {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string;
}

export function DashboardSidebar({ className, variant = "desktop" }: SidebarProps) {
  const pathname = usePathname();
  const { activeProject: plan } = useProject();

  // Project Types Configuration
  const isStartup = plan?.projectType === "startup"; 
  const isTraditional = plan?.projectType === "traditional";
  const isCreator = plan?.projectType === "creator";

  // --- 1. Common Routes (The "Hybrid" Core) ---
  const commonRoutes: Route[] = [
    { icon: LayoutGrid, label: "پیشخوان", href: "/dashboard/overview" },
    { icon: Bot, label: "دستیار هوشمند", href: "/dashboard/copilot", badge: "AI" },
    { icon: FileText, label: "مستندات", href: "/dashboard/docs" },
  ];

  // --- 2. Startup Routes ---
  const startupRoutes: Route[] = [
    { icon: Presentation, label: "پیچ دک (Pitch Deck)", href: "/dashboard/pitch-deck" },
    { icon: FlaskConical, label: "اعتبارسنجی ایده", href: "/dashboard/validator" },
    { icon: Target, label: "بوم ناب (Lean Canvas)", href: "/dashboard/canvas" },
    { icon: Map, label: "نقشه راه محصول", href: "/dashboard/roadmap" },
  ];

  // --- 3. Traditional Routes ---
  const traditionalRoutes: Route[] = [
    { icon: Store, label: "فروشگاه ساز", href: "/dashboard/storefront" },
    { icon: Users, label: "مدیریت مشتریان (CRM)", href: "/dashboard/followup" },
    { icon: Package, label: "انبارداری", href: "/dashboard/inventory" },
    { icon: MapPin, label: "تحلیل موقعیت مکانی", href: "/dashboard/location" },
  ];

  // --- 4. Creator Routes ---
  const creatorRoutes: Route[] = [
    { icon: UserCheck, label: "مدیا کیت (Media Kit)", href: "/dashboard/media-kit" },
    { icon: Calendar, label: "تقویم محتوا", href: "/dashboard/content-calendar" },
    { icon: Video, label: "مدیریت اسکریپت", href: "/dashboard/scripts" },
    { icon: Share2, label: "توذیع محتوا", href: "/dashboard/repurpose" },
    { icon: DollarSign, label: "تعرفه اسپانسری", href: "/dashboard/sponsor-rates" },
  ];

  // Combine Routes based on Project Type
  const routes = [
    ...commonRoutes,
    ...(isStartup ? startupRoutes : []),
    ...(isTraditional ? traditionalRoutes : []),
    ...(isCreator ? creatorRoutes : []),
  ];

  // Base Styling
  const baseClasses = "flex flex-col h-full bg-card border-l border-border";
  const positionClasses = variant === "desktop" 
    ? "fixed inset-y-0 right-0 z-50 w-[280px] hidden md:flex" 
    : "flex w-full"; // Mobile is handled by Sheet Wrapper

  return (
    <div className={cn(baseClasses, positionClasses, className)}>
      {/* Header / Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border/50 shrink-0">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="font-black text-white text-xl">K</span>
          </div>
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
                    "mr-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold",
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

      {/* Footer / CTA (Desktop Only or if needed) */}
      <div className="p-4 border-t border-border mt-auto shrink-0">
         <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 p-4">
            <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Crown size={18} className="text-primary" />
               </div>
               <div>
                  <p className="font-bold text-sm text-foreground">طرح رایگان</p>
                  <p className="text-[10px] text-muted-foreground">ارتقا برای امکانات بیشتر</p>
               </div>
            </div>
            <Button size="sm" className="w-full text-xs font-bold" variant="default">
              ارتقا به حرفه‌ای
            </Button>
         </div>
      </div>
    </div>
  );
}
