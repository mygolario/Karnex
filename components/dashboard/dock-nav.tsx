"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Map,
  Store,
  Video,
  Scale,
  Megaphone,
  LayoutGrid,
  Palette,
  Crown,
  Presentation,
  HelpCircle,
  Settings,
  Sparkles,
  UserCircle
} from "lucide-react";
import { useProject } from "@/contexts/project-context";
import { HoverExplainer } from "@/components/ui/explainer";

export function DockNavigation() {
  const pathname = usePathname();
  const { activeProject } = useProject();
  
  const type = activeProject?.projectType || 'startup';

  // Define Menu Items based on Project Type (Same logic as Layout)
  const common = [
    { icon: LayoutDashboard, label: "داشبورد", href: "/dashboard/overview" },
  ];

  let mainItems = [];
  
  switch (type) {
      case 'traditional':
        mainItems = [
          ...common,
          { icon: Map, label: "مراحل", href: "/dashboard/roadmap" },
          { icon: Store, label: "طرح", href: "/dashboard/canvas" },
          { icon: Scale, label: "مالی", href: "/dashboard/financial" },
          { icon: Megaphone, label: "انبار", href: "/dashboard/operations" }, 
        ];
        break;
      case 'creator':
        mainItems = [
          ...common,
          { icon: Video, label: "رشد", href: "/dashboard/roadmap" },
          { icon: Palette, label: "برند", href: "/dashboard/brand" },
          { icon: Megaphone, label: "مدیا کیت", href: "/dashboard/marketing" },
          { icon: Crown, label: "تعرفه", href: "/dashboard/financial" },
        ];
        break;
      case 'startup':
      default:
        mainItems = [
          ...common,
          { icon: Map, label: "نقشه راه", href: "/dashboard/roadmap" },
          { icon: LayoutGrid, label: "بوم ناب", href: "/dashboard/canvas" },
          { icon: Presentation, label: "پیچ دک", href: "/dashboard/marketing" },
          { icon: Scale, label: "بودجه", href: "/dashboard/financial" },
        ];
        break;
  }

  const systemItems = [
      { icon: UserCircle, label: "پروفایل", href: "/dashboard/profile" },
      { icon: Settings, label: "تنظیمات", href: "/dashboard/settings" },
  ];


  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div 
        layoutId="dock"
        className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full shadow-2xl ring-1 ring-black/5 dark:bg-black/20 dark:border-white/10"
      >
        {/* Main Items */}
        {mainItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="relative group">
                {isActive && (
                    <motion.div 
                        layoutId="active-pill"
                        className="absolute inset-0 bg-white/20 rounded-xl"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
                <div className={cn(
                    "relative p-3 rounded-xl transition-all duration-200 hover:bg-white/10",
                    isActive ? "text-white" : "text-white/70 hover:text-white"
                )}>
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        {item.label}
                    </div>
                </div>
            </Link>
          );
        })}

        {/* Separator */}
        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* System Items */}
        {systemItems.map((item) => {
             const isActive = pathname === item.href;
             return (
               <Link key={item.href} href={item.href} className="relative group">
                   <div className={cn(
                       "relative p-3 rounded-xl transition-all duration-200 hover:bg-white/10",
                       isActive ? "text-white" : "text-white/60 hover:text-white"
                   )}>
                       <item.icon size={22} />
                       {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            {item.label}
                        </div>
                   </div>
               </Link>
             );
        })}

      </motion.div>
    </div>
  );
}
