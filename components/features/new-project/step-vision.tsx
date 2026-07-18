"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn, toPersianDigits } from "@/lib/utils";
import { PILLARS } from "@/app/new-project/genesis-constants";
import { useGenesisWizard } from "./genesis-wizard-context";

const MIN_CHARS = 20;
const RECOMMENDED_CHARS = 80;

export function StepVision() {
  const { pillar, projectVision, setVision, advance, retreat } =
    useGenesisWizard();

  const p = PILLARS.find((x) => x.id === pillar);
  if (!p) return null;

  const charCount = projectVision.length;
  const isValid = charCount >= MIN_CHARS;
  const isRecommended = charCount >= RECOMMENDED_CHARS;

  const handleNext = () => {
    if (isValid) advance();
  };

  const handlePrev = () => retreat();

  const fillExample = (text: string) => {
    setVision(projectVision ? `${projectVision}\n${text}` : text);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 pb-20">
      <div className="mb-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-2"
        >
          چشم‌انداز شما را بنویسید
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground max-w-xl mx-auto"
        >
          {p.visionHint}
        </motion.p>
      </div>

      {/* Quick-start example chips */}
      <div className="mb-6">
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          نمونه‌های الهام‌بخش (برای پر کردن کلیک کنید):
        </p>
        <div className="flex flex-wrap gap-2">
          {p.visionExamples.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => fillExample(ex)}
              className="text-xs text-start rounded-full border border-border/60 bg-card/40 px-3 py-1.5 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-colors text-muted-foreground hover:text-foreground"
            >
              {ex.length > 60 ? `${ex.slice(0, 60)}...` : ex}
            </button>
          ))}
        </div>
      </div>

      <Label htmlFor="vision" className="sr-only">
        ایده، ارزش پیشنهادی و چشم‌انداز شما
      </Label>
      <Textarea
        id="vision"
        value={projectVision}
        onChange={(e) => setVision(e.target.value)}
        placeholder="توضیح دهید که کسب‌وکار شما چیست و چگونه قرار است ارزش خلق کند یا مشکل مشتریان را حل کند..."
        className="min-h-[180px] text-lg leading-relaxed bg-card/50 border-border/50 focus:border-brand-primary/50 resize-none p-4"
        autoFocus
      />

      {/* Character counter + guidance */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span
          className={cn(
            "transition-colors",
            !isValid
              ? "text-destructive"
              : isRecommended
                ? "text-brand-primary"
                : "text-muted-foreground"
          )}
        >
          {toPersianDigits(charCount)} کاراکتر
          {!isValid
            ? ` (حداقل ${toPersianDigits(MIN_CHARS)} کاراکتر)`
            : !isRecommended
              ? ` (پیشنهاد: ${toPersianDigits(RECOMMENDED_CHARS)}+ کاراکتر برای نتیجه بهتر)`
              : " — عالی!"}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-12 flex items-center justify-between pt-6 border-t border-border/50">
        <Button
          variant="ghost"
          onClick={handlePrev}
          className="text-muted-foreground hover:text-foreground h-12 px-6"
          type="button"
        >
          <ArrowRight className="ms-2 w-4 h-4" />
          مرحله قبل
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isValid}
          size="lg"
          className={cn(
            "h-14 px-8 text-lg font-bold rounded-xl transition-all duration-300",
            isValid
              ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              : "opacity-50 cursor-not-allowed"
          )}
          type="button"
        >
          ادامه به بازبینی
          <ChevronLeft className="me-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
