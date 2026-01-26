"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AiAssistant } from "@/components/dashboard/ai-assistant";
import { MentorProvider } from "@/components/dashboard/step-guide";
import {
  TourHelpButton,
  OnboardingProvider,
} from "@/components/onboarding-tour";
import { InstallPwa } from "@/components/shared/install-pwa";
import { FeedbackWidget } from "@/components/feedback-widget";
import { UpgradeModal } from "@/components/dashboard/upgrade-modal";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { CommandPalette } from "@/components/shared/command-palette";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Map,
  Palette,
  LayoutGrid,
  Megaphone,
  Settings,
  Menu,
  X,
  UserCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Sparkles,
  Crown,
  Bot,
  Zap,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "نمای کلی", href: "/dashboard/overview" },
    { icon: Map, label: "نقشه راه", href: "/dashboard/roadmap" },
    { icon: LayoutGrid, label: "بوم کسب‌وکار", href: "/dashboard/canvas" },
    // { icon: Palette, label: "هویت بصری", href: "/dashboard/brand" }, // Temporarily disabled
    { icon: Megaphone, label: "بازاریابی", href: "/dashboard/marketing" },
  ];

  // AI Assistant - Featured Item
  const aiAssistantItem = {
    icon: Bot,
    label: "دستیار کارنکس",
    href: "/dashboard/assistant",
    badge: "AI"
  };

  const bottomMenuItems = [
    { icon: LayoutGrid, label: "پروژه‌ها", href: "/projects" },
    { icon: HelpCircle, label: "راهنما", href: "/dashboard/help" },
    { icon: Settings, label: "تنظیمات", href: "/dashboard/settings" },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <OnboardingProvider>
      <MentorProvider>
        <div
          className="min-h-screen bg-background relative selection:bg-primary/20"
          dir="rtl"
        >
          {/* Background Ambience */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] opacity-70 animate-float" />
            <div
              className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px] opacity-70 animate-float"
              style={{ animationDelay: "-2s" }}
            />
          </div>

          {/* Mobile Header */}
          <div className="md:hidden glass-strong sticky top-0 z-30 border-b border-border/40 px-4 py-3 flex justify-between items-center transition-all duration-300">
            <Link
              href="/"
              className="flex items-center gap-3 active:scale-95 transition-transform"
            >
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
                <Image
                  src="/logo.png"
                  alt="کارنکس"
                  width={36}
                  height={36}
                  className="w-9 h-9 object-cover rounded-xl relative z-10 shadow-sm"
                />
              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">
                کارنکس
              </span>
            </Link>
            <div className="flex items-center gap-1.5">
              <TourHelpButton />
              <NotificationBell />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>

          <div className="flex container mx-auto md:px-4 md:py-4 h-[calc(100vh-0px)] gap-4">
            {/* Sidebar Desktop */}
            <aside
              className={cn(
                "hidden md:flex flex-col z-20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                sidebarCollapsed ? "w-20" : "w-72",
                "h-full rounded-2xl border border-border/40 bg-card/50 backdrop-blur-xl shadow-xl shadow-primary/5"
              )}
            >
              {/* Sidebar Header */}
              <div
                className={cn(
                  "h-20 flex items-center border-b border-border/40",
                  sidebarCollapsed
                    ? "justify-center px-2"
                    : "justify-between px-6"
                )}
              >
                {!sidebarCollapsed && (
                  <Link
                    href="/"
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-10 h-10 rounded-xl shadow-lg shadow-primary/20 overflow-hidden ring-2 ring-background">
                      <Image
                        src="/logo.png"
                        alt="کارنکس"
                        width={40}
                        height={40}
                        className="w-10 h-10 object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-foreground tracking-tight leading-none">
                        کارنکس
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground mt-1 tracking-wide uppercase">
                        Dashboard
                      </span>
                    </div>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={cn(
                    "hidden md:flex hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground",
                    sidebarCollapsed && "w-10 h-10"
                  )}
                >
                  {sidebarCollapsed ? (
                    <ChevronLeft size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </Button>
              </div>

              {/* Navigation Items */}
              <nav
                className={cn(
                  "flex-1 overflow-y-auto py-6 space-y-2 no-scrollbar",
                  sidebarCollapsed ? "px-2" : "px-4"
                )}
              >
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={cn(
                        "group flex items-center gap-3.5 rounded-xl transition-all duration-300 relative overflow-hidden",
                        sidebarCollapsed ? "justify-center p-3" : "px-4 py-3.5",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-x-[-2px]"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:translate-x-[-2px]"
                      )}
                    >
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}

                      <item.icon
                        size={22}
                        className={cn(
                          "transition-all duration-300",
                          isActive
                            ? "scale-110"
                            : "group-hover:scale-110 group-hover:text-primary"
                        )}
                      />

                      {!sidebarCollapsed && (
                        <span className="font-medium tracking-wide">
                          {item.label}
                        </span>
                      )}

                      {isActive && !sidebarCollapsed && (
                        <div className="absolute left-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </Link>
                  );
                })}

                <div className="my-6 border-t border-border/40 mx-2" />

                {/* AI Assistant - Featured Item */}
                {(() => {
                  const isActive = pathname === aiAssistantItem.href;
                  return (
                    <Link
                      href={aiAssistantItem.href}
                      title={sidebarCollapsed ? aiAssistantItem.label : undefined}
                      className={cn(
                        "group flex items-center gap-3.5 rounded-xl transition-all duration-300 relative overflow-hidden",
                        sidebarCollapsed ? "justify-center p-3" : "px-4 py-3.5",
                        isActive
                          ? "bg-gradient-to-l from-primary to-purple-600 text-white shadow-lg shadow-primary/30"
                          : "bg-gradient-to-l from-primary/10 to-purple-500/10 text-primary border border-primary/20 hover:from-primary/20 hover:to-purple-500/20"
                      )}
                    >
                      <aiAssistantItem.icon
                        size={22}
                        className={cn(
                          "transition-all duration-300",
                          isActive ? "scale-110" : "group-hover:scale-110"
                        )}
                      />
                      {!sidebarCollapsed && (
                        <span className="font-bold tracking-wide flex-1">
                          {aiAssistantItem.label}
                        </span>
                      )}
                      {!sidebarCollapsed && aiAssistantItem.badge && (
                        <Badge
                          variant={isActive ? "secondary" : "accent"}
                          className={cn(
                            "text-[9px] px-1.5 py-0 h-4 gap-0.5",
                            isActive && "bg-white/20 text-white border-white/30"
                          )}
                        >
                          <Zap size={8} />
                          {aiAssistantItem.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })()}

                <div className="my-6 border-t border-border/40 mx-2" />

                {bottomMenuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={cn(
                        "group flex items-center gap-3.5 rounded-xl transition-all duration-300 relative overflow-hidden",
                        sidebarCollapsed ? "justify-center p-3" : "px-4 py-3.5",
                        isActive
                          ? "bg-muted text-foreground font-semibold"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      <item.icon
                        size={22}
                        className={cn(
                          "transition-all duration-300",
                          isActive ? "text-primary" : "group-hover:text-primary"
                        )}
                      />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>

              {/* User Profile Footer */}
              <div
                className={cn(
                  "p-4 border-t border-border/40 bg-muted/20 mt-auto backdrop-blur-sm m-2 rounded-xl",
                  sidebarCollapsed
                    ? "flex flex-col items-center gap-4"
                    : "flex items-center gap-3"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0 ring-2 ring-background">
                  <span className="text-sm font-bold">
                    {user?.email?.charAt(0).toUpperCase() || "K"}
                  </span>
                </div>

                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user?.email?.split("@")[0] || "User"}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-0.5">
                      <Badge
                        variant="secondary"
                        className="px-1.5 py-0 h-4 text-[9px] bg-primary/10 text-primary border-primary/20"
                      >
                        PRO
                      </Badge>
                      <span>طرح حرفه‌ای</span>
                    </div>
                  </div>
                )}

                <div
                  className={cn(
                    "flex items-center",
                    sidebarCollapsed ? "flex-col gap-2" : "gap-1"
                  )}
                >
                  {!sidebarCollapsed && <ThemeToggle />}
                  {sidebarCollapsed && (
                    <div className="scale-75">
                      <ThemeToggle />
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size={sidebarCollapsed ? "icon-sm" : "icon"}
                    onClick={handleLogout}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors rounded-lg"
                    title="خروج"
                  >
                    <LogOut size={18} />
                  </Button>
                </div>
              </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <div
              className={cn(
                "fixed inset-0 bg-background/80 backdrop-blur-md z-40 transition-all duration-300 md:hidden",
                sidebarOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              )}
              onClick={() => setSidebarOpen(false)}
            />

            {/* Mobile Sidebar Drawer */}
            <aside
              className={cn(
                "fixed inset-y-0 right-0 z-50 w-72 bg-card border-l border-border/40 shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden p-4 flex flex-col gap-4",
                sidebarOpen ? "translate-x-0" : "translate-x-full"
              )}
            >
              <div className="flex items-center justify-between pb-4 border-b border-border/40">
                <Link href="/" className="flex items-center gap-2">
                  <Image
                    src="/logo.png"
                    alt="Karnex"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <span className="font-bold text-lg">کارنکس</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X size={20} />
                </Button>
              </div>

              <nav className="flex-1 overflow-y-auto space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon
                        size={20}
                        className={isActive ? "text-primary" : ""}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {/* AI Assistant - Featured Mobile */}
                <div className="py-2">
                  <Link
                    href={aiAssistantItem.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-bold",
                      pathname === aiAssistantItem.href
                        ? "bg-gradient-to-l from-primary to-purple-600 text-white"
                        : "bg-gradient-to-l from-primary/10 to-purple-500/10 text-primary border border-primary/20"
                    )}
                  >
                    <aiAssistantItem.icon size={20} />
                    <span className="flex-1">{aiAssistantItem.label}</span>
                    <Badge variant="accent" className="text-[9px] px-1.5 py-0 h-4 gap-0.5">
                      <Zap size={8} />
                      {aiAssistantItem.badge}
                    </Badge>
                  </Link>
                </div>

                {bottomMenuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon
                        size={20}
                        className={isActive ? "text-primary" : ""}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-dashed border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                خروج از حساب
              </Button>
            </aside>

            {/* Main Content Area */}
            <main
              className={cn(
                "flex-1 overflow-x-hidden relative h-full rounded-2xl md:border md:border-border/40 md:bg-card/30 md:backdrop-blur-sm transition-all duration-300",
                "no-scrollbar overflow-y-auto"
              )}
            >
              <div className="p-4 md:p-8 min-h-full">{children}</div>
            </main>
          </div>

          <AiAssistant />
          <FeedbackWidget />
          <CommandPalette />
        </div>
      </MentorProvider>
    </OnboardingProvider>
  );
}
