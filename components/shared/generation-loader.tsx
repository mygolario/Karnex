"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Server, BrainCircuit, PenTool, Rocket } from "lucide-react";

const STEPS = [
  { icon: Server, text: "برقراری ارتباط با سرورهای امن..." },
  { icon: BrainCircuit, text: "تحلیل ایده با هوش مصنوعی..." },
  { icon: PenTool, text: "طراحی بوم مدل کسب‌وکار..." },
  { icon: Rocket, text: "تدوین استراتژی‌های رشد..." },
  { icon: CheckCircle2, text: "نهایی‌سازی نقشه راه..." },
];

export function GenerationLoader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Simulate progress through the steps
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 2500); // Change step every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 max-w-md w-full relative overflow-hidden">
        
        {/* Animated Background Gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 animate-gradient"></div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 relative">
             <BrainCircuit size={32} className="animate-pulse" />
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-bounce"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">در حال ساخت امپراتوری شما</h2>
          <p className="text-slate-500 text-sm">لطفا صفحه را نبندید، این فرآیند حدود ۳۰ ثانیه زمان می‌برد.</p>
        </div>

        <div className="space-y-4 relative">
          {/* Connecting Line */}
          <div className="absolute right-[19px] top-4 bottom-4 w-0.5 bg-slate-100 -z-10"></div>

          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isPending = index > currentStep;

            return (
              <div 
                key={index} 
                className={`flex items-center gap-4 transition-all duration-500 ${
                  isPending ? 'opacity-40 grayscale' : 'opacity-100'
                }`}
              >
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isActive ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg shadow-blue-200' : ''}
                    ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                    ${isPending ? 'bg-white border-slate-200 text-slate-300' : ''}
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={20} />
                  ) : isActive ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <step.icon size={18} />
                  )}
                </div>
                
                <span className={`
                  text-sm font-medium transition-colors duration-300
                  ${isActive ? 'text-blue-700 font-bold' : 'text-slate-600'}
                  ${isCompleted ? 'text-emerald-600' : ''}
                `}>
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
