"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Map,
  LayoutGrid,
  FlaskConical,
  Bot,
  TrendingUp,
  FileText,
  Settings,
  User,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "داشبورد", href: "/dashboard/overview" },
  { icon: LayoutGrid, label: "تحلیل", href: "/dashboard/canvas" },
  { icon: Map, label: "نقشه راه", href: "/dashboard/roadmap" },
  { icon: FlaskConical, label: "اعتبارسنج", href: "/dashboard/validator" },
  { icon: Bot, label: "دستیار کارنکس", href: "/dashboard/copilot" },
  { icon: TrendingUp, label: "رشدنما", href: "/dashboard/growth" },
  { icon: FileText, label: "مستندات", href: "/dashboard/docs" },
  { icon: Settings, label: "تنظیمات", href: "/dashboard/settings" },
  { icon: User, label: "پروفایل", href: "/dashboard/profile" },
];

export function DockNavigation() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-1 px-4 py-3 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="dock-active"
                    className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={20} className="relative z-10" />
                <span className="text-[10px] mt-1 relative z-10 font-medium">
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
