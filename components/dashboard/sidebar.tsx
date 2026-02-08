"use client";

import { cn } from "@/lib/utils";
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
    ? "fixed inset-y-0 right-0 z-50 w-[280px] hidden md:flex" 
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


    </div>
  );
}
