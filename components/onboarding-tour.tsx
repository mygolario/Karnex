"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { X, ArrowLeft, ArrowRight, Sparkles, Map, LayoutGrid, Palette, Megaphone, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TourStep {
  target: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const tourSteps: TourStep[] = [
  {
    target: "overview",
    title: "مرکز فرماندهی",
    description: "اینجا خلاصه‌ای از پروژه و قدم بعدی شما نمایش داده می‌شود.",
    icon: Sparkles
  },
  {
    target: "roadmap",
    title: "نقشه راه",
    description: "مراحل اجرایی پروژه را دنبال کنید و پیشرفت خود را ببینید.",
    icon: Map
  },
  {
    target: "canvas",
    title: "بوم کسب‌وکار",
    description: "مدل کسب‌وکار خود را به صورت بصری مشاهده و ویرایش کنید.",
    icon: LayoutGrid
  },
  {
    target: "brand",
    title: "هویت برند",
    description: "رنگ‌ها، فونت و ایده‌های لوگو مخصوص برند شما.",
    icon: Palette
  },
  {
    target: "marketing",
    title: "بازاریابی",
    description: "استراتژی‌های رشد و تحلیل رقبا برای موفقیت شما.",
    icon: Megaphone
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
  const [hasSeenTour, setHasSeenTour] = useState(true); // Default true to prevent flash

  useEffect(() => {
    const seen = localStorage.getItem("karnex_tour_completed");
    if (!seen) {
      setHasSeenTour(false);
      // Auto-start tour after 2 seconds for new users
      const timer = setTimeout(() => setIsActive(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const endTour = () => {
    setIsActive(false);
    localStorage.setItem("karnex_tour_completed", "true");
    setHasSeenTour(true);
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <OnboardingContext.Provider value={{ isActive, currentStep, startTour, endTour, nextStep, prevStep }}>
      {children}
      {isActive && <TourOverlay step={tourSteps[currentStep]} stepNumber={currentStep} totalSteps={tourSteps.length} />}
    </OnboardingContext.Provider>
  );
}

function TourOverlay({ step, stepNumber, totalSteps }: { step: TourStep; stepNumber: number; totalSteps: number }) {
  const { nextStep, prevStep, endTour } = useOnboarding();
  const Icon = step.icon;

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

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === stepNumber ? "bg-primary w-6" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {stepNumber > 0 && (
            <Button variant="outline" onClick={prevStep} className="flex-1 gap-2">
              <ArrowRight size={16} />
              قبلی
            </Button>
          )}
          <Button 
            variant="gradient" 
            onClick={nextStep} 
            className="flex-1 gap-2"
          >
            {stepNumber < totalSteps - 1 ? (
              <>
                بعدی
                <ArrowLeft size={16} />
              </>
            ) : (
              "شروع کار!"
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          مرحله {stepNumber + 1} از {totalSteps}
        </p>
      </Card>
    </div>
  );
}
