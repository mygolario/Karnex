"use client";

import { OnboardingProvider } from "@/components/onboarding/onboarding-context";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}
