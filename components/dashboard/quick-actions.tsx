"use client";

import Link from "next/link";
import { LucideIcon, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bgColor: string;
}

interface QuickActionsBarProps {
  actions: QuickAction[];
  className?: string;
  variant?: "horizontal" | "grid";
}

export function QuickActionsBar({
  actions,
  className,
  variant = "horizontal"
}: QuickActionsBarProps) {
  if (variant === "grid") {
    return (
      <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-3", className)}>
        {actions.map((action) => (
          <Link key={action.id} href={action.href}>
            <div className="group p-4 bg-card border border-border rounded-xl hover:border-primary/20 hover:shadow-md transition-all cursor-pointer">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                action.bgColor,
                action.color
              )}>
                <action.icon size={20} />
              </div>
              <h4 className="font-bold text-foreground text-sm mb-0.5">{action.label}</h4>
              {action.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">{action.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2 scrollbar-hide", className)}>
      {actions.map((action) => (
        <Link key={action.id} href={action.href}>
          <div className="group flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl hover:border-primary/20 hover:shadow-md transition-all cursor-pointer whitespace-nowrap">
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
              action.bgColor,
              action.color
            )}>
              <action.icon size={18} />
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm">{action.label}</h4>
              {action.description && (
                <p className="text-xs text-muted-foreground">{action.description}</p>
              )}
            </div>
            <ChevronLeft size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  );
}

// Pre-built action presets for common dashboard actions
export const DASHBOARD_QUICK_ACTIONS: QuickAction[] = [
  {
    id: "roadmap",
    label: "نقشه راه",
    description: "ادامه مراحل",
    icon: require("lucide-react").Map,
    href: "/dashboard/roadmap",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "canvas",
    label: "بوم کسب‌وکار",
    description: "ویرایش مدل",
    icon: require("lucide-react").LayoutGrid,
    href: "/dashboard/canvas",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
  // {
  //   id: "brand",
  //   label: "هویت بصری",
  //   description: "مشاهده برند",
  //   icon: require("lucide-react").Palette,
  //   href: "/dashboard/brand",
  //   color: "text-purple-600",
  //   bgColor: "bg-purple-500/10",
  // },
  {
    id: "marketing",
    label: "بازاریابی",
    description: "تولید محتوا",
    icon: require("lucide-react").Megaphone,
    href: "/dashboard/marketing",
    color: "text-rose-600",
    bgColor: "bg-rose-500/10",
  },
];
