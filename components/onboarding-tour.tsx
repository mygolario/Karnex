"use client";

import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ArrowLeft, ArrowRight, Sparkles, Map, LayoutGrid, Palette, Megaphone, HelpCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

interface TourStep {
  target: string; // CSS selector or element ID
  title: string;
  description: string;
  icon: React.ElementType;
  route?: string; // Navigate to this route first
  position?: "top" | "bottom" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    target: "[data-tour='karnex-score']",
    title: "امتیاز کارنکس",
    description: "امتیاز آمادگی پروژه شما برای اجرا. با تکمیل مراحل افزایش می‌یابد.",
    icon: Sparkles,
    route: "/dashboard/overview",
    position: "bottom"
  },
  {
    target: "[data-tour='daily-focus']",
    title: "تمرکز امروز",
    description: "مهم‌ترین کار امروز اینجاست. هر روز یک قدم جلوتر!",
    icon: Sparkles,
    route: "/dashboard/overview",
    position: "bottom"
  },
  {
    target: "[href='/dashboard/roadmap']",
    title: "نقشه راه",
    description: "مسیر گام به گام اجرای پروژه. تسک‌ها را یکی یکی تکمیل کنید.",
    icon: Map,
    position: "left"
  },
  {
    target: "[href='/dashboard/canvas']",
    title: "بوم کسب‌وکار",
    description: "مدل کسب‌وکار شما در یک نگاه: مشکل، راه‌حل، درآمد و...",
    icon: LayoutGrid,
    position: "left"
  },
  // {
  //   target: "[href='/dashboard/brand']",
  //   title: "هویت بصری",
  //   description: "رنگ‌ها، فونت و ایده‌های لوگو مخصوص برند شما.",
  //   icon: Palette,
  //   position: "left"
  // },
  {
    target: "[href='/dashboard/marketing']",
    title: "بازاریابی",
    description: "استراتژی‌های رشد و جذب مشتری برای موفقیت شما.",
    icon: Megaphone,
    position: "left"
  }
];

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error("useOnboarding must be within OnboardingProvider");
  return context;
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const seen = localStorage.getItem("karnex_tour_completed");
    if (!seen) {
      setHasSeenTour(false);
      // Auto-start tour after 2 seconds for new users
      const timer = setTimeout(() => setIsActive(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    // Navigate to first step route if specified
    const firstStep = tourSteps[0];
    if (firstStep.route && pathname !== firstStep.route) {
      router.push(firstStep.route);
    }
  }, [pathname, router]);

  const endTour = useCallback(() => {
    setIsActive(false);
    localStorage.setItem("karnex_tour_completed", "true");
    setHasSeenTour(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      const nextStepData = tourSteps[currentStep + 1];
      if (nextStepData.route && pathname !== nextStepData.route) {
        router.push(nextStepData.route);
      }
      setCurrentStep(currentStep + 1);
    } else {
      endTour();
    }
  }, [currentStep, pathname, router, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      const prevStepData = tourSteps[currentStep - 1];
      if (prevStepData.route && pathname !== prevStepData.route) {
        router.push(prevStepData.route);
      }
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, pathname, router]);

  return (
    <OnboardingContext.Provider value={{ isActive, currentStep, startTour, endTour, nextStep, prevStep }}>
      {children}
      {mounted && isActive && <TourOverlay step={tourSteps[currentStep]} stepNumber={currentStep} totalSteps={tourSteps.length} />}
    </OnboardingContext.Provider>
  );
}

// Spotlight highlight overlay
function TourOverlay({ step, stepNumber, totalSteps }: { step: TourStep; stepNumber: number; totalSteps: number }) {
  const { nextStep, prevStep, endTour } = useOnboarding();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const Icon = step.icon;

  // Find and highlight element
  useEffect(() => {
    const findElement = () => {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);

        // Calculate tooltip position based on step.position
        const padding = 16;
        let x = 0, y = 0;

        switch (step.position) {
          case "bottom":
            x = rect.left + rect.width / 2 - 160; // Center tooltip
            y = rect.bottom + padding;
            break;
          case "top":
            x = rect.left + rect.width / 2 - 160;
            y = rect.top - padding - 180;
            break;
          case "left":
            x = rect.left - 340;
            y = rect.top + rect.height / 2 - 80;
            break;
          case "right":
            x = rect.right + padding;
            y = rect.top + rect.height / 2 - 80;
            break;
          default:
            x = rect.left + rect.width / 2 - 160;
            y = rect.bottom + padding;
        }

        // Keep tooltip on screen
        x = Math.max(16, Math.min(window.innerWidth - 340, x));
        y = Math.max(16, Math.min(window.innerHeight - 200, y));

        setTooltipPosition({ x, y });

        // Scroll element into view if needed
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    findElement();
    // Retry after a short delay in case DOM is updating
    const timer = setTimeout(findElement, 300);

    return () => clearTimeout(timer);
  }, [step.target, step.position]);

  if (!targetRect) {
    // Fallback to centered modal if element not found
    return (
      <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
        <Card variant="default" className="max-w-md w-full relative animate-in zoom-in-95 p-8">
          <button onClick={endTour} className="absolute left-4 top-4 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Icon size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">{step.title}</h2>
            <p className="text-muted-foreground leading-7">{step.description}</p>
          </div>
          <div className="flex gap-3">
            {stepNumber > 0 && (
              <Button variant="outline" onClick={prevStep} className="flex-1 gap-2">
                <ArrowRight size={16} />
                قبلی
              </Button>
            )}
            <Button variant="gradient" onClick={nextStep} className="flex-1 gap-2">
              {stepNumber < totalSteps - 1 ? "بعدی" : "شروع کار!"}
              <ArrowLeft size={16} />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return createPortal(
    <>
      {/* Dark overlay with spotlight cutout */}
      <div className="fixed inset-0 z-[100] pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0" y="0"
            width="100%" height="100%"
            fill="rgba(0,0,0,0.7)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      </div>

      {/* Highlight ring around target */}
      <div
        className="fixed z-[101] pointer-events-none rounded-xl border-2 border-primary animate-pulse"
        style={{
          left: targetRect.left - 8,
          top: targetRect.top - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          boxShadow: "0 0 20px 4px rgba(99, 102, 241, 0.4)"
        }}
      />

      {/* Tooltip Card */}
      <Card
        variant="default"
        className="fixed z-[102] w-80 p-5 animate-in slide-in-from-bottom-4 fade-in shadow-2xl border-2 border-primary/20"
        style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
      >
        {/* Close button */}
        <button
          onClick={endTour}
          className="absolute left-3 top-3 text-muted-foreground hover:text-foreground z-10"
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div className="flex gap-4 items-start mb-4">
          <div className="w-11 h-11 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
            <Icon size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg mb-1">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-6">{step.description}</p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === stepNumber ? "bg-primary w-4" : "bg-muted w-1.5"
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          {stepNumber > 0 && (
            <Button variant="outline" size="sm" onClick={prevStep} className="flex-1 gap-1.5">
              <ArrowRight size={14} />
              قبلی
            </Button>
          )}
          <Button variant="gradient" size="sm" onClick={nextStep} className="flex-1 gap-1.5">
            {stepNumber < totalSteps - 1 ? (
              <>
                بعدی
                <ArrowLeft size={14} />
              </>
            ) : (
              "شروع کار!"
            )}
          </Button>
        </div>

        {/* Step counter */}
        <p className="text-center text-[10px] text-muted-foreground mt-3">
          {stepNumber + 1} از {totalSteps}
        </p>
      </Card>

      {/* Click blocker except on target */}
      <div
        className="fixed inset-0 z-[99]"
        onClick={(e) => {
          // Allow clicking on the target element
          const target = document.elementFromPoint(e.clientX, e.clientY);
          if (!target?.closest(step.target)) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      />
    </>,
    document.body
  );
}

// Help button to restart tour
export function TourHelpButton() {
  const { startTour, isActive } = useOnboarding();

  if (isActive) return null;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={startTour}
      className="text-muted-foreground hover:text-foreground"
      title="شروع تور راهنما"
    >
      <HelpCircle size={18} />
    </Button>
  );
}
