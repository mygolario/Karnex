"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AiAssistant } from "@/components/dashboard/ai-assistant";
import { InstallPwa } from "@/components/shared/install-pwa";
import { UpgradeModal } from "@/components/dashboard/upgrade-modal";
import { ThemeToggle } from "@/components/shared/theme-toggle";
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
  Scale, 
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Rocket,
  LogOut,
  Sparkles,
  Crown
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
    { icon: Palette, label: "هویت بصری", href: "/dashboard/brand" },
    { icon: Megaphone, label: "بازاریابی", href: "/dashboard/marketing" },
    { icon: Scale, label: "حقوقی و مجوز", href: "/dashboard/legal" },
  ];

  const bottomMenuItems = [
    { icon: HelpCircle, label: "راهنما", href: "/dashboard/help" },
    { icon: Settings, label: "تنظیمات", href: "/dashboard/settings" },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row" dir="rtl">
      
      {/* Mobile Header */}
      <div className="md:hidden glass-strong border-b border-border/50 p-4 flex justify-between items-center sticky top-0 z-20">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Rocket size={16} />
          </div>
          <span className="font-bold text-lg text-foreground">کارنکس</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)} 
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 right-0 z-30",
          "bg-card/80 backdrop-blur-xl border-l border-border/50",
          "transform transition-all duration-300 ease-out",
          "md:translate-x-0 md:sticky md:top-0 md:h-screen",
          sidebarOpen ? "translate-x-0" : "translate-x-full",
          sidebarCollapsed ? "md:w-20" : "md:w-72",
          "w-72"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className={cn(
            "h-16 flex items-center border-b border-border/50",
            sidebarCollapsed ? "justify-center px-2" : "justify-between px-5"
          )}>
            {!sidebarCollapsed && (
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Rocket size={18} />
                </div>
                <div>
                  <span className="text-lg font-black text-foreground tracking-tight">کارنکس</span>
                  <Badge variant="gradient" size="sm" className="mr-2">
                    <Sparkles size={10} />
                    BETA
                  </Badge>
                </div>
              </Link>
            )}
            
            {/* Collapse Toggle (Desktop only) */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex"
              title={sidebarCollapsed ? "گسترش منو" : "جمع کردن منو"}
            >
              {sidebarCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {/* Main Menu */}
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl transition-all duration-200 font-medium text-sm",
                      sidebarCollapsed ? "justify-center p-3" : "px-4 py-3",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon 
                      size={20} 
                      className={isActive ? "text-primary" : ""} 
                    />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>

            {/* Separator */}
            <div className="my-4 border-t border-border/50" />

            {/* Bottom Menu */}
            <div className="space-y-1">
              {bottomMenuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl transition-all duration-200 font-medium text-sm",
                      sidebarCollapsed ? "justify-center p-3" : "px-4 py-3",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon 
                      size={20} 
                      className={isActive ? "text-primary" : ""} 
                    />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Section */}
          <div className={cn(
            "p-3 border-t border-border/50 space-y-3",
            sidebarCollapsed && "flex flex-col items-center"
          )}>
            {/* Theme Toggle */}
            {!sidebarCollapsed ? (
              <ThemeToggle showLabel className="w-full justify-center" />
            ) : (
              <ThemeToggle />
            )}

            {/* PWA Install */}
            {!sidebarCollapsed && <InstallPwa />}

            {/* Upgrade Card */}
            {!sidebarCollapsed && (
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={16} className="text-accent" />
                  <span className="font-bold text-sm text-foreground">ارتقا به پرو</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  دسترسی به همه امکانات پیشرفته
                </p>
                <UpgradeModal />
              </div>
            )}
            
            {/* User Profile */}
            <div className={cn(
              "flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border/50",
              sidebarCollapsed && "justify-center p-2"
            )}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary shrink-0">
                <UserCircle size={20} />
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-foreground truncate">
                    {user?.email?.split('@')[0] || "کاربر عزیز"}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                    طرح رایگان
                  </div>
                </div>
              )}
            </div>

            {/* Logout */}
            {!sidebarCollapsed && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="w-full justify-start text-muted-foreground hover:text-destructive"
              >
                <LogOut size={16} />
                خروج از حساب
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* AI Assistant */}
      <AiAssistant />
    </div>
  );
}
