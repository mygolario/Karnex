"use client";

import { motion } from "framer-motion";
import { PILLARS, ProjectType } from "@/app/new-project/genesis-constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles, Zap, ChevronLeft } from "lucide-react";

interface ProjectDetailsFormProps {
  selectedType: ProjectType;
  projectName: string;
  projectVision: string;
  answers: Record<string, any>;
  onNameChange: (val: string) => void;
  onVisionChange: (val: string) => void;
  onAnswerChange: (qId: string, optId: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isGenerating: boolean;
}

export function ProjectDetailsForm({
  selectedType,
  projectName,
  projectVision,
  answers,
  onNameChange,
  onVisionChange,
  onAnswerChange,
  onSubmit,
  onBack,
  isGenerating
}: ProjectDetailsFormProps) {
  const pillar = PILLARS.find(p => p.id === selectedType);
  if (!pillar) return null;

  const coreQuestions = pillar.questions || [];
  const isFormValid = projectName.trim().length > 0 && 
                      projectVision.trim().length > 0 &&
                      coreQuestions.every(q => answers[q.id]);

  return (
    <div className="w-full max-w-3xl mx-auto px-6 pb-20">
      <div className="mb-10 text-center">
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
                "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-2xl bg-gradient-to-br text-white",
                pillar.color
            )}
        >
            <pillar.icon className="w-8 h-8" />
        </motion.div>
        <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-2"
        >
            تنظیمات {pillar.title}
        </motion.h2>
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground"
        >
            اطلاعات پایه را وارد کنید تا کارنکس استراتژی شما را بچیند.
        </motion.p>
      </div>

      <div className="space-y-8">
        {/* Project Name */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
        >
            <Label htmlFor="projectName" className="text-lg font-semibold">نام پروژه</Label>
            <Input
                id="projectName"
                value={projectName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder={(pillar as any).projectPlaceholder || "مثلاً: دیجی‌کالا، اسنپ، ..."}
                className="h-14 text-lg bg-card/50 border-border/50 focus:border-primary/50 transition-all font-medium"
                autoFocus
            />
        </motion.div>

        {/* Dynamic Questions */}
        {coreQuestions.map((q, idx) => (
            <motion.div 
                key={q.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
                className="space-y-4"
            >
                <Label className="text-lg font-semibold">{q.question}</Label>
                <div className="grid sm:grid-cols-3 gap-4">
                    {q.options.map((opt) => {
                        const isSelected = answers[q.id] === opt.id;
                        return (
                            <button
                                key={opt.id}
                                onClick={() => onAnswerChange(q.id, opt.id)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-300",
                                    isSelected 
                                        ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10" 
                                        : "bg-card/30 border-border/50 hover:bg-card/60 hover:border-border"
                                )}
                            >
                                <opt.icon className={cn("w-6 h-6", isSelected && "text-primary")} />
                                <span className="font-medium text-sm">{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
            </motion.div>
        ))}

        {/* Vision */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
        >
            <div className="flex items-center justify-between">
                <Label htmlFor="vision" className="text-lg font-semibold">ایده و چشم‌انداز</Label>
            </div>
            <Textarea
                id="vision"
                value={projectVision}
                onChange={(e) => onVisionChange(e.target.value)}
                placeholder="توضیح دهید که می‌خواهید چه کاری انجام دهید..."
                className="min-h-[150px] text-lg leading-relaxed bg-card/50 border-border/50 focus:border-primary/50 resize-none p-4"
            />
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 flex items-center justify-between pt-6 border-t border-border/50"
      >
        <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground h-12 px-6"
        >
            <ArrowRight className="ml-2 w-4 h-4" />
            انتخاب مسیر دیگر
        </Button>

        <Button 
            onClick={onSubmit}
            disabled={!isFormValid || isGenerating}
            size="lg"
            className={cn(
                "h-14 px-8 text-lg font-bold rounded-xl transition-all duration-500",
                isFormValid 
                    ? "bg-gradient-to-r from-primary to-purple-600 shadow-[0_0_30px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.5)] hover:scale-[1.02]"
                    : "opacity-50 cursor-not-allowed"
            )}
        >
            {isGenerating ? (
                <>
                    <span className="loading loading-spinner loading-md ml-2"></span>
                    در حال ساخت...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 w-5 h-5 fill-white/20" />
                    شروع قدرتمند
                    <ChevronLeft className="mr-2 w-5 h-5" />
                </>
            )}
        </Button>
      </motion.div>
    </div>
  );
}
