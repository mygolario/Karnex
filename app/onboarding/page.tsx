"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useOnboarding } from "@/components/onboarding/onboarding-context";
import { Loader2 } from "lucide-react";

export default function OnboardingIndexPage() {
  const { user, loading: authLoading } = useAuth();
  const { state, loading } = useOnboarding();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || loading) return;
    if (!user) {
      router.replace("/login?next=/onboarding");
      return;
    }

    const step = state?.user.currentStep;
    if (!state?.user.profileCompletedAt || state.user.needsReonboard) {
      router.replace("/onboarding/profile");
      return;
    }
    if (step === "genesis") {
      router.replace("/onboarding/genesis");
      return;
    }
    if (step === "reveal") {
      router.replace("/onboarding/reveal");
      return;
    }
    if (step === "missions") {
      router.replace("/onboarding/missions");
      return;
    }
    if (step === "complete") {
      router.replace("/dashboard/overview");
      return;
    }
    router.replace("/onboarding/profile");
  }, [user, authLoading, loading, state, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" role="status">
      <Loader2 className="animate-spin w-8 h-8 text-primary" />
    </div>
  );
}
