"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";


import { MentorProvider } from "@/components/dashboard/mentor-context";

import { TourProvider } from "@/components/features/onboarding/tour-context";
import { TourOverlay } from "@/components/features/onboarding/tour-overlay";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null; // Middleware handles redirect; this is a fallback
  }


  return (
    <MentorProvider>
      <TourProvider>
          <TourOverlay />
          <div className="min-h-screen bg-background relative" dir="rtl">
          {/* Background Effects */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/5 rounded-full blur-[100px] md:blur-[200px]" />
            <div className="absolute bottom-0 left-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-secondary/5 rounded-full blur-[80px] md:blur-[150px]" />
          </div>

          {/* Sidebar */}
          <DashboardSidebar />

          {/* Main Content Area */}
          <div className="mr-0 md:mr-[280px] transition-all duration-300">
            {/* Header */}
            <DashboardHeader />

            {/* Page Content */}
            <main className="p-6 min-h-[calc(100vh-4rem)]">
              <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
              </div>
            </main>
          </div>

          {/* Global Widgets: Upgrade Removed */}
          </div>
      </TourProvider>
    </MentorProvider>
  );
}
