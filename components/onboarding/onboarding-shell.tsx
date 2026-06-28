"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { OnboardingPhaseStepper } from "./onboarding-phase-stepper";
import type { UserOnboardingStep } from "@/lib/onboarding/types";
import { cn } from "@/lib/utils";

interface Props {
  phase: UserOnboardingStep;
  title: string;
  subtitle?: string;
  children: ReactNode;
  sidebar?: ReactNode;
  showStepper?: boolean;
}

export function OnboardingShell({
  phase,
  title,
  subtitle,
  children,
  sidebar,
  showStepper = true,
}: Props) {
  return (
    <div dir="rtl" className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none bg-mesh-gradient">
        <div className="absolute top-[-15%] start-[-10%] w-[45vw] h-[45vw] rounded-full blur-[120px] opacity-40 bg-brand-primary/20" />
        <div className="absolute bottom-[-15%] end-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-40 bg-brand-secondary/20" />
      </div>

      <header className="relative z-10 border-b border-border/40 bg-background/70 backdrop-blur-md">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="font-black text-lg text-foreground shrink-0">
            کارنکس
          </Link>
          {showStepper && (
            <div className="flex-1 max-w-xl hidden sm:block">
              <OnboardingPhaseStepper current={phase} />
            </div>
          )}
        </div>
        {showStepper && (
          <div className="sm:hidden px-4 pb-3">
            <OnboardingPhaseStepper current={phase} />
          </div>
        )}
      </header>

      <main className="relative z-10 container max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-black text-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-muted-foreground text-base lg:text-lg">{subtitle}</p>
          )}
        </div>

        <div
          className={cn(
            "grid gap-8",
            sidebar ? "lg:grid-cols-[1fr_340px]" : "max-w-2xl mx-auto"
          )}
        >
          <div className="min-w-0">{children}</div>
          {sidebar && (
            <div className="lg:sticky lg:top-24 h-fit order-first lg:order-last">{sidebar}</div>
          )}
        </div>
      </main>
    </div>
  );
}
