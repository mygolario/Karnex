"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Search, Bell, Settings, LogOut, User, Crown, 
  ChevronDown, CreditCard, Sparkles, X
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { CommandMenu } from "@/components/dashboard/command-menu";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const { user } = useAuth();
  const { activeProject } = useProject();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
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
        {/* Command Menu Trigger - Improved Design */}
        <CommandMenu />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications - Enhanced */}
        <div className="relative" ref={notifRef}>
          <motion.button 
            whileHover={{ scale: 1.05, rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-muted/40 hover:bg-muted transition-all duration-200"
          >
            <Bell size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 top-full mt-3 w-80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black/5"
              >
                <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Bell size={14} className="text-primary" />
                    اعلانات
                  </h3>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={14} className="text-muted-foreground" />
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground/50 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                         <Bell size={20} className="opacity-40" />
                      </div>
                      <p className="text-xs font-medium">همه چی آرومه!</p>
                      <p className="text-[10px] mt-1">هیچ اعلان جدیدی ندارید</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id}
                        className={cn(
                          "p-4 hover:bg-muted/40 transition-all cursor-pointer border-b border-border/40 last:border-0 relative group",
                          !notif.read ? "bg-primary/5 hover:bg-primary/10" : ""
                        )}
                      >
                         {!notif.read && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary transform scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />
                         )}
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                            !notif.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          )}>
                             <Sparkles size={14} />
                          </div>
                          <div className="flex-1">
                            <p className={cn("text-xs font-medium text-foreground leading-relaxed", !notif.read && "font-bold")}>{notif.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                {notif.time}
                            </p>
                          </div>
                          {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0 shadow-sm" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-border/50 bg-muted/20">
                     <button className="w-full py-2 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        مشاهده همه اعلانات
                     </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar & Dropdown - Premium Design */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-muted/80 transition-all duration-200 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/20">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full rounded-xl object-cover" />
              ) : (
                user?.displayName?.[0] || "U"
              )}
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {user?.displayName || "کاربر"}
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
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-full h-full rounded-2xl object-cover" />
                      ) : (
                        user?.displayName?.[0] || "U"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">
                        {user?.displayName || "کاربر"}
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

