"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, History } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  GenesisWizardProvider,
  useGenesisWizard,
} from "@/components/features/new-project/genesis-wizard-context";
import { GenesisWizardShell } from "@/components/features/new-project/genesis-wizard-shell";
import { StepWelcome } from "@/components/features/new-project/step-welcome";
import { StepPillar } from "@/components/features/new-project/step-pillar";
import { StepInterview } from "@/components/features/new-project/step-interview";
import { StepContext } from "@/components/features/new-project/step-context";
import { StepBrief } from "@/components/features/new-project/step-brief";
import { StepBuild } from "@/components/features/new-project/step-build";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function NewProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-background">
          <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
      }
    >
      <GenesisWizardProvider>
        <NewProjectInner />
      </GenesisWizardProvider>
    </Suspense>
  );
}

function NewProjectInner() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    activeStep,
    currentPhase,
    showLimitModal,
    limitModalKind,
    limitModalMessage,
    closeLimitModal,
    hasResumableDraft,
    dismissResume,
  } = useGenesisWizard();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <GenesisWizardShell>
        {activeStep === 0 && <StepWelcome />}
        {activeStep === 1 && <StepPillar />}
        {activeStep === 2 && <StepInterview />}
        {activeStep === 3 && <StepContext />}
        {activeStep === 4 && <StepBrief />}
        {activeStep === 5 && <StepBuild />}
      </GenesisWizardShell>

      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={closeLimitModal}
        kind={limitModalKind}
        message={limitModalMessage || undefined}
      />

      <Dialog
        open={hasResumableDraft}
        onOpenChange={(open) => {
          if (!open) dismissResume(false);
        }}
      >
        <DialogContent
          className="sm:max-w-md bg-card border-border shadow-2xl"
          dir="rtl"
        >
          <DialogHeader className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-2">
              <History className="w-8 h-8 text-brand-primary" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              بازیابی پیش‌نویس قبلی
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground leading-relaxed">
              پیش‌نویس تکمیل‌نشده‌ای پیدا شد
              {currentPhase ? ` (مرحله: ${currentPhase})` : ""}. بازیابی می‌کنی؟
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6 w-full">
            <Button
              onClick={() => dismissResume(true)}
              className="w-full sm:w-auto flex-1 gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white shadow-lg shadow-primary/20"
            >
              بله، بازیابی کن
            </Button>
            <Button
              variant="outline"
              onClick={() => dismissResume(false)}
              className="w-full sm:w-auto"
            >
              خیر، شروع مجدد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
