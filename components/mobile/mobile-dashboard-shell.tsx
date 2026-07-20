"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutGrid, Map, Target, Bot, MoreHorizontal,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { CommandMenu } from "@/components/dashboard/command-menu";
import { MobileMoreSheet } from "@/components/mobile/mobile-more-sheet";
import { useMobileContext } from "@/contexts/mobile-context";
import { useAuth } from "@/contexts/auth-context";

const routeLabels: Record<string, string> = {
  "/dashboard/overview": "پیشخوان",
  "/dashboard/roadmap": "نقشه راه",
  "/dashboard/canvas": "بوم",
  "/dashboard/copilot": "دستیار کارنکس",
  "/dashboard/pitch-deck": "پیچ‌دک",
  "/dashboard/competitors": "تحلیل رقبا",
  "/dashboard/health": "سلامت کسب‌وکار",
  "/dashboard/finance": "سود و زیان",
  "/dashboard/cashflow": "جریان نقدی",
  "/dashboard/expenses": "هزینه‌ها",
  "/dashboard/tax": "برآورد مالیات",
  "/dashboard/inventory": "موجودی و انبار",
  "/dashboard/staff": "کارکنان و شیفت",
  "/dashboard/loyalty": "باشگاه مشتریان",
  "/dashboard/broadcast": "پیام گروهی",
  "/dashboard/referral": "معرفی دوستان",
  "/dashboard/coupons": "کوپن و QR",
  "/dashboard/appointments": "نوبت‌دهی",
  "/dashboard/monthly-review": "مرور ماهانه",
  "/dashboard/goals": "اهداف KPI",
  "/dashboard/sales": "صندوق فروش",
  "/dashboard/promotions": "تخفیف و کمپین",
  "/dashboard/reviews": "نظرات مشتریان",
  "/dashboard/pricing": "قیمت‌گذاری",
  "/dashboard/content-calendar": "تقویم محتوا",
  "/dashboard/scripts": "اسکریپت‌نویسی",
  "/dashboard/sponsor-rates": "تعرفه اسپانسری",
  "/dashboard/settings": "تنظیمات",
  "/dashboard/profile": "پروفایل",
  "/dashboard/analytics": "آنالیتیکس",
  "/dashboard/ideas": "ایده‌ها",
  "/dashboard/help": "راهنما",
  "/dashboard/support": "پشتیبانی",
};

const navItems = [
  { icon: LayoutGrid, label: "پیشخوان", href: "/dashboard/overview" },
  { icon: Map, label: "نقشه راه", href: "/dashboard/roadmap" },
  { icon: Target, label: "بوم", href: "/dashboard/canvas" },
  { icon: Bot, label: "دستیار", href: "/dashboard/copilot" },
];

export function MobileDashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { immersiveMode } = useMobileContext();
  const { userProfile, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const currentLabel = routeLabels[pathname] || "داشبورد";
  const isMoreActive = !navItems.some(
    (item) => pathname === item.href || (item.href !== "/dashboard/overview" && pathname.startsWith(item.href))
  ) && pathname !== "/dashboard/overview";

  return (
    <div className="min-h-dvh bg-background relative" dir="rtl">
      {/* Compact mobile header */}
      <header className="sticky top-0 z-40 h-14 px-3 flex items-center justify-between bg-background/95 backdrop-blur-xl border-b border-border/50 safe-top">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10">
                <LayoutGrid className="h-5 w-5" />
                <span className="sr-only">منو</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-e border-border bg-card w-[300px]">
              <DashboardSidebar variant="mobile" />
            </SheetContent>
          </Sheet>
          <h1 className="font-bold text-sm truncate">{currentLabel}</h1>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <CommandMenu mobile />
          <NotificationBell />
          <Link href="/dashboard/profile" className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold ms-0.5">
            {(userProfile?.avatar_url || user?.image) ? (
              <img src={userProfile?.avatar_url || user?.image || ""} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              (userProfile?.full_name?.[0] || user?.name?.[0] || "U")
            )}
          </Link>
        </div>
      </header>

      {/* Main content — full bleed on mobile */}
      <main
        id="main-content"
        className={cn(
          "mobile-page min-h-[calc(100dvh-3.5rem)]",
          !immersiveMode && "pb-[var(--mobile-bottom-nav-offset)]",
          immersiveMode && "mobile-immersive"
        )}
      >
        {children}
      </main>

      {/* Bottom navigation */}
      {!immersiveMode && (
        <nav className="fixed bottom-0 start-0 end-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg safe-bottom">
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
                  <item.icon size={22} className={cn("transition-transform", isActive && "scale-110")} />
                  <span className={cn("text-[10px] font-medium", isActive && "font-bold")}>{item.label}</span>
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
              <span className={cn("text-[10px] font-medium", isMoreActive && "font-bold")}>بیشتر</span>
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
