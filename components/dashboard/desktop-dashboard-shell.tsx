"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export function DesktopDashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative" dir="rtl">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/5 rounded-full blur-[100px] md:blur-[200px]" />
        <div className="absolute bottom-0 left-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-secondary/5 rounded-full blur-[80px] md:blur-[150px]" />
      </div>

      <DashboardSidebar />

      <div className="ms-0 md:ms-[280px] transition-all duration-300">
        <DashboardHeader />
        <main id="main-content" className="p-6 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
