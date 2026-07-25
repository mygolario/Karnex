"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutGrid, Map, Target, Bot, MoreHorizontal } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MobileMoreSheet } from "@/components/mobile/mobile-more-sheet";
import { useMobileContext } from "@/contexts/mobile-context";

const navItems = [
  { icon: LayoutGrid, label: "پیشخوان", href: "/dashboard/overview" },
  { icon: Map, label: "نقشه راه", href: "/dashboard/roadmap" },
  { icon: Target, label: "بوم", href: "/dashboard/canvas" },
  { icon: Bot, label: "دستیار", href: "/dashboard/copilot" },
];

/**
 * One shell for every viewport. The desktop sidebar and the mobile tab bar are
 * both always in the tree and swapped by CSS, so `children` mount exactly once —
 * no shell fork, no hydration flash, no remount on resize.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { immersiveMode } = useMobileContext();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive =
    !navItems.some(
      (item) =>
        pathname === item.href ||
        (item.href !== "/dashboard/overview" && pathname.startsWith(item.href))
    ) && pathname !== "/dashboard/overview";

  return (
    <div className="min-h-dvh bg-background relative" dir="rtl">
      {/* Ambient glow — desktop only; it is pure paint cost on a phone. */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden hidden md:block">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[150px]" />
      </div>

      <DashboardSidebar />

      <div className="md:ms-[280px]">
        <DashboardHeader />

        <main
          id="main-content"
          className={cn(
            "mobile-page min-h-[calc(100dvh-3.5rem)] md:min-h-[calc(100dvh-4rem)]",
            immersiveMode
              ? "mobile-immersive p-0"
              : "px-4 py-3 pb-[calc(var(--mobile-bottom-nav-offset)+0.75rem)] md:p-6"
          )}
        >
          <div className="max-w-7xl mx-auto md:animate-in md:fade-in md:slide-in-from-bottom-4 md:duration-500">
            {children}
          </div>
        </main>
      </div>

      {!immersiveMode && (
        <nav
          data-bottom-nav
          className="md:hidden fixed bottom-0 start-0 end-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg safe-bottom"
        >
          <div className="flex items-center justify-around h-16 px-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard/overview" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-0.5 py-2 px-2 rounded-xl transition-all min-w-[56px] min-h-[44px]",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <item.icon
                    size={22}
                    className={cn("transition-transform", isActive && "scale-110")}
                  />
                  <span className={cn("text-[10px] font-medium", isActive && "font-bold")}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute top-0 w-10 h-0.5 rounded-b-full bg-primary" />
                  )}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-2 px-2 rounded-xl transition-all min-w-[56px] min-h-[44px]",
                isMoreActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <MoreHorizontal size={22} />
              <span className={cn("text-[10px] font-medium", isMoreActive && "font-bold")}>
                بیشتر
              </span>
              {isMoreActive && (
                <div className="absolute top-0 w-10 h-0.5 rounded-b-full bg-primary" />
              )}
            </button>
          </div>
        </nav>
      )}

      <MobileMoreSheet open={moreOpen} onOpenChange={setMoreOpen} />
    </div>
  );
}
