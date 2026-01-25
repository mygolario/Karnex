"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Brain, 
  FileText, 
  Palette, 
  Map,
  Target,
  Megaphone,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerationLoaderProps {
  projectName?: string;
}

export function GenerationLoader({ projectName }: GenerationLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Brain, label: "تحلیل ایده شما", color: "from-primary to-purple-600" },
    { icon: Target, label: "بررسی بازار و رقبا", color: "from-purple-600 to-pink-500" },
    { icon: FileText, label: "تولید بوم کسب‌وکار", color: "from-pink-500 to-rose-500" },
    { icon: Map, label: "طراحی نقشه راه", color: "from-rose-500 to-orange-500" },
    { icon: Palette, label: "ساخت هویت بصری", color: "from-orange-500 to-amber-500" },
    { icon: Megaphone, label: "استراتژی بازاریابی", color: "from-amber-500 to-secondary" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Main Animation */}
      <div className="relative mb-12">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-3xl opacity-20 scale-150 animate-pulse" />
        
        {/* Circle Background */}
        <div className={cn(
          "relative w-32 h-32 rounded-3xl flex items-center justify-center",
          "bg-gradient-to-br",
          steps[currentStep].color,
          "shadow-2xl transition-all duration-500"
        )}>
          {/* Inner Icon */}
          <div className="text-white">
            {(() => {
              const Icon = steps[currentStep].icon;
              return <Icon size={48} className="animate-pulse" />;
            })()}
          </div>
          
          {/* Spinning Ring */}
          <div className="absolute inset-0 rounded-3xl border-4 border-white/20 animate-spin-slow" 
            style={{ 
              borderTopColor: 'transparent', 
              borderRightColor: 'white',
              animationDuration: '3s' 
            }} 
          />
        </div>
        
        {/* Floating Particles */}
        <div className="absolute -top-4 -left-4 w-6 h-6 bg-primary/30 rounded-full blur-sm animate-float" />
        <div className="absolute -bottom-4 -right-4 w-4 h-4 bg-secondary/30 rounded-full blur-sm animate-float" style={{ animationDelay: "-1s" }} />
        <div className="absolute top-1/2 -right-8 w-3 h-3 bg-accent/30 rounded-full blur-sm animate-float" style={{ animationDelay: "-2s" }} />
      </div>

      {/* Project Name */}
      {projectName && (
        <h2 className="text-2xl font-black text-foreground mb-3">
          {projectName}
        </h2>
      )}

      {/* Current Step */}
      <p className="text-lg text-muted-foreground mb-8">
        در حال <span className="text-foreground font-bold">{steps[currentStep].label}</span>...
      </p>

      {/* Progress Steps */}
      <div className="w-full max-w-md space-y-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all duration-500",
              i < currentStep && "opacity-50",
              i === currentStep && "bg-muted/50"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500",
                i <= currentStep
                  ? `bg-gradient-to-br ${step.color} text-white shadow-lg`
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i < currentStep ? (
                <CheckCircle2 size={16} />
              ) : (
                <step.icon size={16} />
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                i <= currentStep ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
            {i === currentStep && (
              <div className="mr-auto flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tip */}
      <p className="mt-8 text-sm text-muted-foreground flex items-center gap-2">
        <Sparkles size={14} className="text-accent" />
        این فرایند معمولاً ۳۰ تا ۶۰ ثانیه طول می‌کشد
      </p>
    </div>
  );
}
