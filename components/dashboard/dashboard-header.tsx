"use client";

import { useState, useRef, useEffect } from "react";
import {
  Settings, LogOut, User, Crown,
  ChevronDown, Sparkles, ChevronLeft,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { CommandMenu } from "@/components/dashboard/command-menu";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { cn } from "@/lib/utils";
import { TourLauncher } from "@/components/tour/tour-launcher";
import { getPlanForDisplay } from "@/lib/payment/pricing";

/* ── Breadcrumb map ── */
const routeLabels: Record<string, string> = {
  "/dashboard/overview": "پیشخوان",
  "/dashboard/roadmap": "نقشه راه",
  "/dashboard/canvas": "بوم",
  "/dashboard/copilot": "دستیار کارنکس",
  "/dashboard/pitch-deck": "پیچ‌دک",
  "/dashboard/health": "سلامت کسب‌وکار",
  "/dashboard/finance": "سود و زیان",
  "/dashboard/cashflow": "جریان نقدی",
  "/dashboard/expenses": "هزینه‌ها",
  "/dashboard/tax": "برآورد مالیات",
  "/dashboard/inventory": "موجودی و انبار",
  "/dashboard/sales": "صندوق فروش",
  "/dashboard/staff": "کارکنان و شیفت",
  "/dashboard/loyalty": "باشگاه مشتریان",
  "/dashboard/promotions": "تخفیف و کمپین",
  "/dashboard/broadcast": "پیام گروهی",
  "/dashboard/referral": "معرفی دوستان",
  "/dashboard/coupons": "کوپن و QR",
  "/dashboard/appointments": "نوبت‌دهی",
  "/dashboard/reviews": "نظرات مشتریان",
  "/dashboard/pricing": "قیمت‌گذاری",
  "/dashboard/monthly-review": "مرور ماهانه",
  "/dashboard/goals": "اهداف KPI",
  "/dashboard/content-calendar": "تقویم محتوا",
  "/dashboard/scripts": "اسکریپت‌نویسی",
  "/dashboard/sponsor-rates": "تعرفه اسپانسری",
  "/dashboard/account": "حساب کاربری",
  "/dashboard/media-kit": "مدیاکیت",
  "/dashboard/analytics": "آنالیتیکس",
  "/dashboard/ideas": "ایده‌ها",
  "/dashboard/validation": "اعتبارسنجی ایده",
  "/dashboard/assistant": "دستیار",
  "/dashboard/support": "پشتیبانی",
  "/dashboard/help": "راهنما",
  "/dashboard/followup": "پیگیری",
  "/dashboard/customer-bot": "ربات مشتری",
  "/dashboard/repurpose": "توزیع محتوا",
  "/dashboard/menu": "منو",
  "/dashboard/admin": "مدیریت",
};

export function DashboardHeader() {
  const { user, signOut, userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Build breadcrumb
  const currentLabel = routeLabels[pathname] || "داشبورد";
  const planId = userProfile?.subscription?.planId || "free";
  const planDisplayName = getPlanForDisplay(planId)?.name ?? "رایگان";
  const isPaidPlan = planId === "pro" || planId === "plus" || planId === "ultra";

  return (
    <header className="sticky top-0 z-40 h-16 px-4 md:px-6 flex items-center justify-between bg-background/80 backdrop-blur-xl border-b border-border/50">
      {/* Left: Mobile Nav + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <MobileNav />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground hidden md:inline">داشبورد</span>
          <ChevronLeft className="w-4 h-4 text-muted-foreground/50 hidden md:inline" />
          <span className="font-bold text-foreground">{currentLabel}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Command Menu (desktop) */}
        <div className="hidden md:block">
          <CommandMenu />
        </div>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Tour Launcher */}
        <TourLauncher />

        {/* User Avatar & Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pe-3 rounded-xl hover:bg-muted/80 transition-all duration-200 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/20">
              {(userProfile?.avatar_url || user?.image) ? (
                <img src={userProfile?.avatar_url || user?.image || ""} alt="" className="w-full h-full rounded-xl object-cover" />
              ) : (
                (userProfile?.full_name?.[0] || user?.name?.[0] || "U")
              )}
            </div>
            <div className="hidden md:block text-end">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {userProfile?.full_name || user?.name || "کاربر"}
              </p>
              <div className="flex items-center gap-1">
                <Crown size={10} className={cn(
                  "text-yellow-500",
                  isPaidPlan && "text-purple-500"
                )} />
                <span className="text-[10px] text-muted-foreground">
                  {planDisplayName}
                </span>
              </div>
            </div>
            <ChevronDown size={16} className="text-muted-foreground group-hover:text-foreground transition-colors hidden md:block" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute end-0 top-full mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden"
              >
                {/* User Info Header */}
                <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-primary/20">
                      {(userProfile?.avatar_url || user?.image) ? (
                        <img src={userProfile?.avatar_url || user?.image || ""} alt="" className="w-full h-full rounded-2xl object-cover" />
                      ) : (
                        (userProfile?.full_name?.[0] || user?.name?.[0] || "U")
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">
                        {userProfile?.full_name || user?.name || "کاربر"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email || "ایمیل ثبت نشده"}
                      </p>
                    </div>
                    <div className={cn("px-2 py-1 rounded-lg border",
                      isPaidPlan
                        ? "bg-purple-500/10 border-purple-500/20"
                        : "bg-yellow-500/10 border-yellow-500/20"
                    )}>
                      <div className="flex items-center gap-1">
                        <Crown size={12} className={cn(
                          isPaidPlan ? "text-purple-500" : "text-yellow-500"
                        )} />
                        <span className={cn("text-[10px] font-bold",
                          isPaidPlan
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        )}>
                          {planDisplayName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <Link
                    href="/dashboard/account"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/80 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <User size={16} />
                    </div>
                    <span className="text-sm font-medium text-foreground">حساب کاربری و تنظیمات</span>
                  </Link>

                  <Link
                    href="/dashboard/account?section=integrations"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/80 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-500">
                      <Settings size={16} />
                    </div>
                    <span className="text-sm font-medium text-foreground">شخصی‌سازی و یکپارچه‌سازی</span>
                  </Link>

                  <Link
                    href="/pricing"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/80 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary">
                      <Sparkles size={16} />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">ارتقا به پلن ویژه</span>
                      <p className="text-[10px] text-muted-foreground">پروژه‌ها و اعتبار AI بیشتر</p>
                    </div>
                  </Link>
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-border">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                      <LogOut size={16} />
                    </div>
                    <span className="text-sm font-medium text-red-500">خروج</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
