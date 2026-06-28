"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { MentorProvider } from "@/components/dashboard/mentor-context";
import { TourProvider } from "@/components/tour/tour-provider";
import { TourRoot } from "@/components/tour/tour-root";
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { MobileProvider } from "@/contexts/mobile-context";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { DesktopDashboardShell } from "@/components/dashboard/desktop-dashboard-shell";
import { MobileDashboardShell } from "@/components/mobile/mobile-dashboard-shell";
import { PwaInstallBanner } from "@/components/pwa/pwa-install-banner";
import { PwaOnboardingModal } from "@/components/pwa/pwa-onboarding-modal";
import { PwaWelcomeToast } from "@/components/pwa/pwa-welcome-toast";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <span className="sr-only">در حال بارگذاری داشبورد</span>
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  return (
    <MobileProvider>
      <MentorProvider>
        <TourProvider>
          <OnboardingGuard>
            <TourRoot />
            {isMobile ? (
              <MobileDashboardShell>{children}</MobileDashboardShell>
            ) : (
              <DesktopDashboardShell>{children}</DesktopDashboardShell>
            )}
            <PwaInstallBanner />
            <PwaOnboardingModal deferUntilMission />
            <Suspense fallback={null}>
              <PwaWelcomeToast />
            </Suspense>
          </OnboardingGuard>
        </TourProvider>
      </MentorProvider>
    </MobileProvider>
  );
}
