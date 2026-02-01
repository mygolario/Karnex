"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AiAssistant } from "@/components/dashboard/ai-assistant";
import { FeedbackWidget } from "@/components/feedback-widget";
import { UpgradeModal } from "@/components/dashboard/upgrade-modal";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { DockNavigation } from "@/components/dashboard/dock-nav"; // New
import { CommandMenu } from "@/components/dashboard/command-menu"; // New


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background relative" dir="rtl">
      
      {/* 1. Header (Minimal) */}
      <header className="fixed top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-40 bg-background/50 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo-official.png" alt="Karnex" width={28} height={28} className="rounded-lg shadow-sm" />
                <span className="font-bold text-lg text-foreground tracking-tight hidden sm:block">کارنکس</span>
              </Link>
              <Badge variant="gradient" size="sm" className="hidden sm:flex">
                  <Sparkles size={10} className="mr-1" />
                  BETA 2.0
              </Badge>
          </div>

          <div className="flex items-center gap-3">
              <CommandMenu />
              <ThemeToggle />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary text-xs font-bold ring-2 ring-background">
                  {user?.displayName?.[0] || "U"}
              </div>
          </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="pt-20 pb-32 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
             {children}
          </div>
      </main>

      {/* 3. Dock Navigation (Floating) */}
      <DockNavigation />

      {/* 4. Global Widgets */}
      <AiAssistant />
      <FeedbackWidget />
      <UpgradeModal />
    </div>
  );
}
