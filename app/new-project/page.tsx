"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { GenerationLoader } from "@/components/shared/generation-loader";
import { StrategySnapshot } from "@/components/shared/strategy-snapshot";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  Lightbulb,
  Users,
  Tag,
  Mic,
  MicOff
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function NewProjectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { createNewProject } = useProject();

  // Simple 3-step state
  const [step, setStep] = useState(1);
  const [businessIdea, setBusinessIdea] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("");
  const [projectName, setProjectName] = useState("");

  // AI suggestions
  const [audienceSuggestions, setAudienceSuggestions] = useState<string[]>([]);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [loadingAudience, setLoadingAudience] = useState(false);
  const [loadingNames, setLoadingNames] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState("");

  // Voice input
  const [isRecording, setIsRecording] = useState(false);

  // Refs
  const ideaInputRef = useRef<HTMLTextAreaElement>(null);

  const totalSteps = 3;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signup");
    }
  }, [user, authLoading, router]);

  // Focus input on step change
  useEffect(() => {
    if (step === 1 && ideaInputRef.current) {
      setTimeout(() => ideaInputRef.current?.focus(), 300);
    }
  }, [step]);

  // Fetch audience suggestions when idea changes
  useEffect(() => {
    const fetchAudience = async () => {
      if (businessIdea.length < 10) return;
      setLoadingAudience(true);
      try {
        const res = await fetch("/api/suggest-audience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIdea: businessIdea })
        });
        const data = await res.json();
        setAudienceSuggestions(data.audiences?.slice(0, 4) || []);
      } catch {
        setAudienceSuggestions([]);
      } finally {
        setLoadingAudience(false);
      }
    };

    const debounce = setTimeout(fetchAudience, 1000);
    return () => clearTimeout(debounce);
  }, [businessIdea]);

  // Fetch name suggestions when moving to step 3
  useEffect(() => {
    const fetchNames = async () => {
      if (step !== 3 || !businessIdea) return;
      setLoadingNames(true);
      try {
        const res = await fetch("/api/suggest-project-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea: businessIdea })
        });
        const data = await res.json();
        setNameSuggestions(data.names?.slice(0, 6) || []);
      } catch {
        setNameSuggestions([]);
      } finally {
        setLoadingNames(false);
      }
    };
    fetchNames();
  }, [step, businessIdea]);

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return businessIdea.trim().length >= 5;
      case 2: return selectedAudience.trim().length > 0;
      case 3: return projectName.trim().length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    setError("");
    if (!canProceed()) {
      const errors: Record<number, string> = {
        1: "لطفاً ایده‌ات رو توضیح بده (حداقل ۵ حرف)",
        2: "مخاطب هدفت رو مشخص کن",
        3: "یک اسم برای پروژه انتخاب کن",
      };
      setError(errors[step] || "");
      return;
    }

    if (step === totalSteps) {
      handleGenerate();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const handleGenerate = async () => {
    if (!user) return;

    setIsGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: businessIdea,
          audience: selectedAudience,
          budget: "متوسط", // Default
        }),
      });

      if (!res.ok) throw new Error("Failed to generate plan");

      const data = await res.json();

      // Override with user's project name
      data.projectName = projectName;
      data.ideaInput = businessIdea;
      data.audience = selectedAudience;

      setGeneratedPlan(data);
      setShowConfetti(true);

      setTimeout(() => {
        setShowSnapshot(true);
      }, 1500);

    } catch (err) {
      console.error(err);
      setError("خطا در تولید طرح. لطفاً دوباره تلاش کن.");
      setIsGenerating(false);
    }
  };

  const handleContinueToDashboard = async () => {
    if (generatedPlan) {
      setIsCreatingProject(true);
      await createNewProject(generatedPlan);
      router.push("/dashboard/overview");
    }
  };

  // Voice input handler
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("مرورگر شما از ضبط صدا پشتیبانی نمی‌کند");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fa-IR';
    recognition.continuous = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setBusinessIdea(prev => (prev + " " + transcript).trim());
    };

    recognition.start();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show confetti celebration
  if (showConfetti && !showSnapshot && !isCreatingProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center">
            <Sparkles size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-2">تبریک! 🎉</h2>
          <p className="text-muted-foreground">طرح کسب‌وکارت آماده شد!</p>
        </motion.div>
      </div>
    );
  }

  // Show strategy snapshot
  if (showSnapshot && generatedPlan) {
    return (
      <StrategySnapshot
        plan={generatedPlan}
        onContinue={handleContinueToDashboard}
      />
    );
  }

  // Show generation loader
  if (isGenerating || isCreatingProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
        <GenerationLoader
          isLoading={true}
          title={isCreatingProject ? "در حال آماده‌سازی داشبورد..." : `در حال ساخت طرح ${projectName || "پروژه"}...`}
        />
      </div>
    );
  }

  const stepConfigs = [
    {
      icon: Lightbulb,
      title: "ایده‌ات چیه؟",
      subtitle: "در یکی دو جمله توضیح بده",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: Users,
      title: "مخاطبت کیه؟",
      subtitle: "محصولت برای چه کسانی هست؟",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Tag,
      title: "اسم پروژه‌ات",
      subtitle: "یک اسم به‌یادماندنی انتخاب کن",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const currentConfig = stepConfigs[step - 1];
  const StepIcon = currentConfig.icon;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/logo-icon-dark.png"
              alt="کارنکس"
              width={40}
              height={40}
              className="rounded-xl shadow-lg dark:invert-0 invert"
            />
            <span className="text-xl font-black text-foreground">کارنکس</span>
          </Link>

          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight size={18} />
              برگشت
            </button>
          )}
        </header>

        {/* Progress */}
        <div className="px-6">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
              <span>مرحله {step} از {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Step Header */}
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "w-20 h-20 bg-gradient-to-br rounded-3xl flex items-center justify-center mx-auto shadow-xl",
                      currentConfig.gradient
                    )}
                  >
                    <StepIcon size={40} className="text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black text-foreground">
                      {currentConfig.title}
                    </h1>
                    <p className="text-muted-foreground text-lg mt-2">
                      {currentConfig.subtitle}
                    </p>
                  </div>
                </div>

                {/* Step Content */}
                <div className="space-y-4">
                  {/* Step 1: Business Idea */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="relative">
                        <textarea
                          ref={ideaInputRef}
                          value={businessIdea}
                          onChange={(e) => setBusinessIdea(e.target.value)}
                          placeholder="مثال: فروش عسل ارگانیک به صورت آنلاین با تضمین اصالت..."
                          className="input-premium min-h-[140px] resize-none text-lg pr-5 pl-14"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && canProceed()) {
                              e.preventDefault();
                              handleNext();
                            }
                          }}
                        />
                        <button
                          onClick={handleVoiceInput}
                          className={cn(
                            "absolute left-3 top-3 p-2 rounded-xl transition-all",
                            isRecording
                              ? "bg-red-500 text-white animate-pulse"
                              : "bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary"
                          )}
                        >
                          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>
                      </div>
                      <p className="text-center text-sm text-muted-foreground">
                        هر چقدر بیشتر توضیح بدی، طرح بهتری می‌سازم 💡
                      </p>
                    </div>
                  )}

                  {/* Step 2: Audience */}
                  {step === 2 && (
                    <div className="space-y-4">
                      {/* AI Suggestions */}
                      {loadingAudience ? (
                        <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                          <Loader2 size={16} className="animate-spin" />
                          در حال یافتن مخاطبان...
                        </div>
                      ) : audienceSuggestions.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Sparkles size={14} className="text-primary" />
                            پیشنهاد هوشمند:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {audienceSuggestions.map((audience, i) => (
                              <button
                                key={i}
                                onClick={() => setSelectedAudience(audience)}
                                className={cn(
                                  "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                                  selectedAudience === audience
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "bg-muted hover:bg-primary/10 text-foreground border border-transparent hover:border-primary/20"
                                )}
                              >
                                {audience}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="relative">
                        <p className="text-sm text-muted-foreground mb-2">یا خودت بنویس:</p>
                        <input
                          type="text"
                          value={selectedAudience}
                          onChange={(e) => setSelectedAudience(e.target.value)}
                          placeholder="مثال: خانواده‌های علاقه‌مند به سلامت..."
                          className="input-premium text-lg"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && canProceed()) {
                              e.preventDefault();
                              handleNext();
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Project Name */}
                  {step === 3 && (
                    <div className="space-y-4">
                      {/* AI Name Suggestions */}
                      {loadingNames ? (
                        <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                          <Loader2 size={16} className="animate-spin" />
                          در حال ساخت اسم‌های خلاقانه...
                        </div>
                      ) : nameSuggestions.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Sparkles size={14} className="text-primary" />
                            پیشنهاد کارنکس:
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {nameSuggestions.map((name, i) => (
                              <button
                                key={i}
                                onClick={() => setProjectName(name)}
                                className={cn(
                                  "px-4 py-3 rounded-xl text-sm font-bold transition-all text-center",
                                  projectName === name
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "bg-muted hover:bg-primary/10 text-foreground border border-transparent hover:border-primary/20"
                                )}
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="relative pt-2">
                        <p className="text-sm text-muted-foreground mb-2">یا اسم دلخواهت:</p>
                        <input
                          type="text"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          placeholder="نام برند یا کسب‌وکار..."
                          className="input-premium text-lg text-center font-bold"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && canProceed()) {
                              e.preventDefault();
                              handleNext();
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-destructive text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Action Button */}
                <Button
                  variant="gradient"
                  size="xl"
                  className="w-full"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  {step === totalSteps ? (
                    <>
                      <Sparkles size={20} />
                      بساز طرح کسب‌وکار من!
                    </>
                  ) : (
                    <>
                      ادامه
                      <ArrowLeft size={20} />
                    </>
                  )}
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
