"use client";

import { Suspense, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { MentorProvider } from "@/components/dashboard/mentor-context";
import { TourProvider } from "@/components/tour/tour-provider";
import { TourRoot } from "@/components/tour/tour-root";
import { TourReengagementNudge } from "@/components/tour/tour-reengagement-nudge";
import { TourRepersonalizePrompt } from "@/components/tour/tour-repersonalize-prompt";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PwaInstallBanner } from "@/components/pwa/pwa-install-banner";
import { PwaOnboardingModal } from "@/components/pwa/pwa-onboarding-modal";
import { PwaWelcomeToast } from "@/components/pwa/pwa-welcome-toast";
import { RoadmapBackgroundGenerator } from "@/components/dashboard/roadmap-background-generator";
import { GenesisFirstRunCoach } from "@/components/dashboard/genesis-first-run-coach";
import { FeedbackWidget } from "@/components/feedback-widget";
import { Loader2 } from "lucide-react";

export function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // launch overrides hydrated by LaunchConfigProvider in root layout

  if (loading || !user) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center bg-background"
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
    <MentorProvider>
      <TourProvider>
        <TourRoot />
        <TourReengagementNudge />
        <TourRepersonalizePrompt />
        <RoadmapBackgroundGenerator />
        <DashboardShell>{children}</DashboardShell>
        <PwaInstallBanner />
        <PwaOnboardingModal />
        <Suspense fallback={null}>
          <PwaWelcomeToast />
        </Suspense>
        <Suspense fallback={null}>
          <GenesisFirstRunCoach />
        </Suspense>
        <FeedbackWidget />
      </TourProvider>
    </MentorProvider>
  );
}
