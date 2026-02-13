"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Settings, LogOut, User, Crown, 
  ChevronDown, CreditCard, Sparkles, CircleHelp
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
// import { CommandMenu } from "@/components/dashboard/command-menu";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const { user, signOut, userProfile } = useAuth();
  const { activeProject } = useProject();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
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

  const getProjectTypeLabel = () => {
    switch (activeProject?.projectType) {
      case "startup": return "استارتاپ مدرن";
      case "traditional": return "کسب‌وکار سنتی";
      case "creator": return "تولید محتوا";
      default: return "یک پروژه جدید بسازید";
    }
  };

  // Mock notifications
  const notifications = [
    { id: 1, title: "بوم کسب‌وکار شما تکمیل شد", time: "۲ ساعت پیش", read: false },
    { id: 2, title: "نقشه راه جدید آماده است", time: "دیروز", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 h-16 px-6 flex items-center justify-between bg-background/80 backdrop-blur-xl border-b border-border/50">
      {/* Left: Project Info (RTL: Right Side) */}
      <div className="flex items-center gap-4">
        <MobileNav />
        <div>
          <h1 className="text-lg font-bold text-foreground">
            {activeProject?.projectName || "داشبورد کارنکس"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {getProjectTypeLabel()}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Help / Restart Tour Button */}
        <button
           onClick={() => window.dispatchEvent(new Event('restart-tour'))}
           className="p-2 rounded-xl hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
           title="راهنما و شروع مجدد تور"
           data-tour-id="help-button"
        >
           <CircleHelp size={20} />
        </button>

        {/* User Avatar & Dropdown - Premium Design */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-muted/80 transition-all duration-200 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/20">
              {(userProfile?.avatar_url || user?.image) ? (
                <img src={userProfile?.avatar_url || user?.image || ""} alt="" className="w-full h-full rounded-xl object-cover" />
              ) : (
                (userProfile?.full_name?.[0] || user?.name?.[0] || "U")
              )}
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {userProfile?.full_name || user?.name || "کاربر"}
              </p>
              <div className="flex items-center gap-1">
                <Crown size={10} className="text-yellow-500" />
                <span className="text-[10px] text-muted-foreground">رایگان</span>
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
                className="absolute left-0 top-full mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden"
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
                    <div className="px-2 py-1 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <div className="flex items-center gap-1">
                        <Crown size={12} className="text-yellow-500" />
                        <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400">رایگان</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/80 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <User size={16} />
                    </div>
                    <span className="text-sm font-medium text-foreground">حساب کاربری</span>
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/80 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-500">
                      <Settings size={16} />
                    </div>
                    <span className="text-sm font-medium text-foreground">تنظیمات</span>
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
                      <p className="text-[10px] text-muted-foreground">دسترسی نامحدود به همه امکانات</p>
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

