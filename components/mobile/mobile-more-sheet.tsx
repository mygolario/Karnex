"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Presentation, Calendar, Video, DollarSign,
  Settings, HelpCircle, Headphones, Shield,
  Activity, Wallet, Star, LucideIcon,
  Receipt, Target, FlaskConical,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useProject } from "@/contexts/project-context";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";
import { isLaunchNavRoute } from "@/lib/launch/config";
import type { ProjectType } from "@/app/new-project/genesis-constants";

interface MoreRoute {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface MobileMoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMoreSheet({ open, onOpenChange }: MobileMoreSheetProps) {
  const pathname = usePathname();
  const { activeProject: plan } = useProject();

  const isStartup = plan?.projectType === "startup";
  const isTraditional = plan?.projectType === "traditional";
  const isCreator = plan?.projectType === "creator";
  const projectType = (plan?.projectType || "startup") as ProjectType;

  const projectRoutes: MoreRoute[] = [
    ...(isStartup
      ? [
          { icon: Presentation, label: "پیچ‌دک", href: "/dashboard/pitch-deck" },
          { icon: FlaskConical, label: "اعتبارسنجی ایده", href: "/dashboard/validation" },
          { icon: Target, label: "تحلیل رقبا", href: "/dashboard/competitors" },
        ]
      : []),
    ...(isTraditional
      ? [
          { icon: Target, label: "تحلیل رقبا", href: "/dashboard/competitors" },
          { icon: Activity, label: "سلامت کسب‌وکار", href: "/dashboard/health" },
          { icon: Wallet, label: "سود و زیان", href: "/dashboard/finance" },
          { icon: Receipt, label: "هزینه‌ها", href: "/dashboard/expenses" },
          { icon: Star, label: "اهداف KPI", href: "/dashboard/goals" },
        ]
      : []),
    ...(isCreator
      ? [
          { icon: Calendar, label: "تقویم محتوا", href: "/dashboard/content-calendar" },
          { icon: Video, label: "اسکریپت‌نویسی", href: "/dashboard/scripts" },
          { icon: DollarSign, label: "تعرفه اسپانسری", href: "/dashboard/sponsor-rates" },
        ]
      : []),
  ].filter((route) => isLaunchNavRoute(route.href, projectType));

  const generalRoutes: MoreRoute[] = [
    { icon: Headphones, label: "پشتیبانی", href: "/dashboard/support" },
    { icon: HelpCircle, label: "راهنما", href: "/dashboard/help" },
    { icon: Settings, label: "حساب کاربری", href: "/dashboard/account" },
    { icon: Shield, label: "مدیریت", href: "/dashboard/admin" },
  ].filter((route) =>
    route.href === "/dashboard/admin"
      ? true
      : isLaunchNavRoute(route.href, projectType),
  );

  const renderLink = (route: MoreRoute) => {
    const isActive = pathname === route.href || pathname.startsWith(route.href + "/");
    return (
      <Link
        key={route.href}
        href={route.href}
        onClick={() => onOpenChange(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
          isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/80 text-foreground",
        )}
      >
        <route.icon size={20} className={isActive ? "text-primary" : "text-muted-foreground"} />
        <span className="font-medium text-sm">{route.label}</span>
      </Link>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-y-auto">
        <SheetHeader className="text-start mb-4">
          <SheetTitle>بیشتر</SheetTitle>
        </SheetHeader>
        {projectRoutes.length > 0 && (
          <div className="mb-4">
            <p className="px-4 mb-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
              ابزارهای تخصصی
            </p>
            <div className="space-y-1">{projectRoutes.map(renderLink)}</div>
          </div>
        )}
        <div>
          <p className="px-4 mb-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
            عمومی
          </p>
          <div className="space-y-1">{generalRoutes.map(renderLink)}</div>
          <div className="mt-4 px-4 py-3 flex items-center justify-between rounded-xl border border-border/60 bg-muted/30">
            <span className="text-sm font-medium text-foreground">ظاهر</span>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
