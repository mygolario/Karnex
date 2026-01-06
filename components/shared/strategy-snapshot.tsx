"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Sparkles,
  Calendar,
  Gauge,
  Target,
  Rocket,
  CheckCircle2,
  Copy,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StrategySnapshotProps {
  plan: {
    projectName: string;
    ideaInput?: string;
    audience?: string;
    tagline?: string;
    roadmap?: Array<{ phase: string; steps: string[] }>;
  };
  onContinue: () => void;
}

export function StrategySnapshot({ plan, onContinue }: StrategySnapshotProps) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate estimated launch days based on roadmap
  const totalSteps = plan.roadmap?.reduce((acc, p) => acc + p.steps.length, 0) || 10;
  const estimatedDays = Math.round(totalSteps * 2.5); // 2.5 days per step average
  
  // Calculate difficulty
  const difficulty = totalSteps > 15 ? "بالا" : totalSteps > 8 ? "متوسط" : "آسان";
  const difficultyColor = totalSteps > 15 ? "text-red-500" : totalSteps > 8 ? "text-amber-500" : "text-emerald-500";

  // Generate a motivational AI message
  const motivationalMessages = [
    `ایده‌ات عالیه! بازار ${plan.audience || "هدف"} منتظر یه راه‌حل خوب مثل تو هست.`,
    `شروع کردن قدم اوله — و تو الان برداشتیش! 🚀`,
    `این می‌تونه یه داستان موفقیت باشه. بزن بریم!`,
  ];
  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  const handleCopy = async () => {
    const shareText = `
🚀 ${plan.projectName}
${plan.tagline || plan.ideaInput}

📅 زمان راه‌اندازی: ${estimatedDays} روز
🎯 سطح سختی: ${difficulty}

ساخته شده با کارنکس ✨
    `.trim();

    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    setIsLoading(true);
    onContinue();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "-2s" }} />

      <div className="relative z-10 w-full max-w-lg animate-fade-in-up">
        
        {/* Success Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full text-sm font-bold">
            <CheckCircle2 size={16} />
            طرح کسب‌وکارت آماده شد!
          </div>
        </div>

        {/* Strategy Card */}
        <Card variant="glass" className="overflow-hidden">
          {/* Gradient Header */}
          <div className="bg-gradient-primary p-8 text-white text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4 text-4xl font-black">
              {plan.projectName.charAt(0)}
            </div>
            <h1 className="text-3xl font-black mb-2">{plan.projectName}</h1>
            <p className="text-white/80 text-sm leading-relaxed max-w-xs mx-auto">
              {plan.tagline || plan.ideaInput}
            </p>
          </div>

          {/* Stats */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <Calendar size={24} className="mx-auto mb-2 text-primary" />
                <p className="text-2xl font-black text-foreground">{estimatedDays}</p>
                <p className="text-xs text-muted-foreground">روز تا راه‌اندازی</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <Gauge size={24} className={cn("mx-auto mb-2", difficultyColor)} />
                <p className={cn("text-2xl font-black", difficultyColor)}>{difficulty}</p>
                <p className="text-xs text-muted-foreground">سطح پیچیدگی</p>
              </div>
            </div>

            {/* Target Audience */}
            {plan.audience && (
              <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Target size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">مخاطب هدف</p>
                  <p className="font-bold text-foreground">{plan.audience}</p>
                </div>
              </div>
            )}

            {/* Motivational Message */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/10">
              <p className="text-sm font-medium text-foreground flex items-start gap-2">
                <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
                {randomMessage}
              </p>
            </div>

            {/* First 3 Steps Preview */}
            {plan.roadmap && plan.roadmap[0] && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Rocket size={14} className="text-primary" />
                  اولین قدم‌هات:
                </p>
                <div className="space-y-2">
                  {plan.roadmap[0].steps.slice(0, 3).map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 space-y-3">
            <Button
              variant="gradient"
              size="xl"
              className="w-full"
              onClick={handleContinue}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  در حال رفتن به داشبورد...
                </>
              ) : (
                <>
                  بریم داشبورد!
                  <ArrowLeft size={18} />
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-emerald-500" />
                    کپی شد!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    کپی خلاصه
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: plan.projectName,
                      text: `${plan.projectName} - ${plan.tagline || plan.ideaInput}`,
                      url: window.location.origin
                    });
                  }
                }}
              >
                <Share2 size={16} />
                اشتراک
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          ساخته شده با ❤️ توسط کارنکس
        </p>
      </div>
    </div>
  );
}
