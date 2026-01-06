"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  HelpCircle,
  Rocket,
  Send,
  SkipForward,
  Users,
  Building2,
  Tag
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Import wizard components
import {
  WizardModeToggle,
  IndustrySelector,
  BudgetSelector,
  VoiceInputButton,
  CompetitorInput,
  QuickTemplates,
  ProgressGamification,
  ConfettiCelebration,
  ChatInterface,
  ProjectNameSelector,
  industries,
  budgetOptions,
} from "@/components/wizard";
import type { Template } from "@/components/wizard";

// Status options for the current stage step
const statusOptions = [
  { 
    id: "idea", 
    emoji: "🐣", 
    label: "فقط یه ایده",
    sublabel: "بدون سرمایه و تیم",
    color: "from-amber-400 to-orange-500"
  },
  { 
    id: "building", 
    emoji: "🔨", 
    label: "در حال ساخت",
    sublabel: "یک نمونه اولیه دارم",
    color: "from-blue-400 to-indigo-500"
  },
  { 
    id: "launch", 
    emoji: "🚀", 
    label: "آماده راه‌اندازی",
    sublabel: "نیاز به بازاریابی دارم",
    color: "from-emerald-400 to-teal-500"
  },
];

// Local storage key for draft
const DRAFT_KEY = "karnex_wizard_draft";

interface WizardData {
  mode: "chat" | "wizard";
  industry: string | null;
  businessIdea: string;
  projectName: string;
  problemSolving: string;
  selectedAudience: string | null;
  competitors: string[];
  currentStatus: string | null;
  budget: string | null;
}

const initialData: WizardData = {
  mode: "wizard",
  industry: null,
  businessIdea: "",
  projectName: "",
  problemSolving: "",
  selectedAudience: null,
  competitors: [],
  currentStatus: null,
  budget: null,
};

export default function NewProjectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { createNewProject } = useProject();
  
  // Mode: chat or wizard
  const [mode, setMode] = useState<"chat" | "wizard">("wizard");
  
  // Wizard state
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState<string | null>(null);
  const [businessIdea, setBusinessIdea] = useState("");
  const [projectName, setProjectName] = useState("");
  const [problemSolving, setProblemSolving] = useState("");
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  
  // AI suggestions
  const [audienceSuggestions, setAudienceSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  
  // XP tracking
  const [xpEarned, setXpEarned] = useState(0);

  // Refs for animation
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const totalSteps = 7;
  const progress = (step / totalSteps) * 100;

  // Load draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const data: WizardData = JSON.parse(saved);
        setMode(data.mode);
        setIndustry(data.industry);
        setBusinessIdea(data.businessIdea);
        setProjectName(data.projectName || "");
        setProblemSolving(data.problemSolving);
        setSelectedAudience(data.selectedAudience);
        setCompetitors(data.competitors);
        setCurrentStatus(data.currentStatus);
        setBudget(data.budget);
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, []);

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    const data: WizardData = {
      mode,
      industry,
      businessIdea,
      projectName,
      problemSolving,
      selectedAudience,
      competitors,
      currentStatus,
      budget,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  }, [mode, industry, businessIdea, problemSolving, selectedAudience, competitors, currentStatus, budget]);

  useEffect(() => {
    const timeout = setTimeout(saveDraft, 500);
    return () => clearTimeout(timeout);
  }, [saveDraft]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signup");
    }
  }, [user, authLoading, router]);

  // Focus input on step change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 2 && inputRef.current) {
        inputRef.current.focus();
      } else if (step === 3 && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [step]);

  // Fetch AI suggestions when idea changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (businessIdea.length < 5) {
        setAudienceSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const res = await fetch("/api/suggest-audience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIdea: businessIdea })
        });
        const data = await res.json();
        setAudienceSuggestions(data.audiences || []);
      } catch {
        setAudienceSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 800);
    return () => clearTimeout(debounce);
  }, [businessIdea]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        if (step === 2 && businessIdea.trim()) {
          e.preventDefault();
          handleNext();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, businessIdea]);

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return industry !== null;
      case 2: return businessIdea.trim().length > 0;
      case 3: return projectName.trim().length > 0;
      case 4: return problemSolving.trim().length > 0;
      case 5: return true; // Audience & competitors are optional
      case 6: return currentStatus !== null;
      case 7: return budget !== null;
      default: return false;
    }
  };

  const handleNext = () => {
    setError("");
    
    if (!canProceed()) {
      const errors: Record<number, string> = {
        1: "لطفاً یک صنعت انتخاب کنید",
        2: "لطفاً ایده خود را وارد کنید",
        3: "لطفاً نام پروژه را وارد کنید",
        4: "لطفاً مشکلی که حل می‌کنید را توضیح دهید",
        6: "لطفاً وضعیت فعلی خود را انتخاب کنید",
        7: "لطفاً مقیاس کسب‌وکار را انتخاب کنید",
      };
      setError(errors[step] || "");
      return;
    }

    // Award XP
    setXpEarned(prev => prev + 20);

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

  const handleSkip = () => {
    setError("");
    setXpEarned(prev => prev + 10);
    setStep(step + 1);
  };

  const handleTemplateSelect = (template: Template) => {
    setIndustry(template.industry);
    setBusinessIdea(template.idea);
    setProblemSolving(template.problem);
    setStep(4); // Jump to audience step
    setXpEarned(prev => prev + 50);
  };

  const handleVoiceInput = (text: string, field: "idea" | "problem") => {
    if (field === "idea") {
      setBusinessIdea(prev => (prev + " " + text).trim());
    } else {
      setProblemSolving(prev => (prev + " " + text).trim());
    }
  };

  const handleChatComplete = (data: any) => {
    // Extract data from chat and generate
    if (data.idea) setBusinessIdea(data.idea);
    if (data.problem) setProblemSolving(data.problem);
    if (data.audience) setSelectedAudience(data.audience);
    handleGenerate();
  };

  const handleGenerate = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    setError("");

    // Use user's project name or fallback
    const finalProjectName = projectName.trim() || businessIdea.split(" ").slice(0, 2).join(" ") || "پروژه من";

    const selectedIndustry = industries.find(i => i.id === industry);
    const selectedStatus = statusOptions.find(s => s.id === currentStatus);
    const selectedBudget = budgetOptions.find(b => b.id === budget);

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: businessIdea,
          projectName: finalProjectName,
          problem: problemSolving,
          audience: selectedAudience || "عموم مردم",
          industry: selectedIndustry?.label || "نامشخص",
          competitors: competitors,
          status: selectedStatus?.label || "فقط یه ایده",
          budget: selectedBudget?.label || "کم‌هزینه"
        }),
      });

      if (!res.ok) throw new Error("Failed to generate plan");

      const data = await res.json();
      
      // Force the project name
      data.projectName = finalProjectName;
      data.ideaInput = businessIdea;
      data.audience = selectedAudience || "عموم مردم";
      
      setGeneratedPlan(data);
      
      // Show confetti!
      setShowConfetti(true);
      
      // Clear draft
      localStorage.removeItem(DRAFT_KEY);
      
      // Show strategy snapshot after confetti
      setTimeout(() => {
        setShowSnapshot(true);
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setError("خطا در تولید طرح. لطفاً دوباره تلاش کنید.");
      setIsGenerating(false);
    }
  };

  const handleContinueToDashboard = async () => {
    if (generatedPlan) {
      await createNewProject(generatedPlan);
      router.push("/dashboard/overview");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show confetti celebration
  if (showConfetti && !showSnapshot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <ConfettiCelebration isActive={showConfetti} onComplete={() => {}} />
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

  // Show strategy snapshot after generation
  if (showSnapshot && generatedPlan) {
    return (
      <StrategySnapshot 
        plan={generatedPlan}
        onContinue={handleContinueToDashboard}
      />
    );
  }

  // Show generation loader
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
        <GenerationLoader projectName={businessIdea.split(" ").slice(0, 2).join(" ")} />
      </div>
    );
  }

  // Step content configurations
  const stepConfig = [
    {
      icon: Building2,
      title: "صنعت کسب‌وکارت",
      subtitle: "چی می‌خوای بسازی؟",
      description: "یک حوزه انتخاب کن تا پیشنهادات دقیق‌تری بدم",
      gradient: "from-primary to-purple-600",
    },
    {
      icon: Lightbulb,
      title: "ایده‌ات چیه؟",
      subtitle: "در یک جمله بگو",
      description: "ایده‌ات رو ساده توضیح بده — هوش مصنوعی بقیه‌اش رو می‌فهمه",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: Tag,
      title: "نام پروژه",
      subtitle: "اسم کسب‌وکارت چیه؟",
      description: "یک اسم به‌یادماندنی انتخاب کن — ما هم پیشنهاد می‌دیم!",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: HelpCircle,
      title: "چه مشکلی رو حل می‌کنی؟",
      subtitle: "چرا مشتری باید بخره؟",
      description: "چه دردی رو دوا می‌کنی؟ چرا راه‌حل فعلی بد هست؟",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "مخاطب و رقبا",
      subtitle: "کی‌ها مشتریت هستن؟",
      description: "این بخش اختیاریه ولی به دقت طرح کمک می‌کنه",
      gradient: "from-blue-500 to-cyan-500",
      optional: true,
    },
    {
      icon: Rocket,
      title: "الان کجای مسیر هستی؟",
      subtitle: "وضعیت فعلیت",
      description: "این کمک می‌کنه قدم‌های اول رو درست مشخص کنیم",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Sparkles,
      title: "مقیاس کسب‌وکار",
      subtitle: "چقدر بزرگ فکر می‌کنی؟",
      description: "این کمک می‌کنه استراتژی مناسب بچینیم",
      gradient: "from-rose-500 to-red-500",
    },
  ];

  const currentStepConfig = stepConfig[step - 1];
  const StepIcon = currentStepConfig.icon;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
      
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
          
          <div className="flex items-center gap-4">
            {/* Mode Toggle */}
            <WizardModeToggle mode={mode} onChange={setMode} />
            
            {mode === "wizard" && step > 1 && (
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowRight size={18} />
                برگشت
              </button>
            )}
          </div>
        </header>

        {/* Chat Mode */}
        {mode === "chat" ? (
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
              <ChatInterface onComplete={handleChatComplete} />
            </div>
          </main>
        ) : (
          /* Wizard Mode */
          <>
            {/* Progress & Gamification */}
            <div className="px-6">
              <div className="max-w-2xl mx-auto">
                <ProgressGamification 
                  currentStep={step} 
                  totalSteps={totalSteps} 
                  xpEarned={xpEarned}
                />
                
                {/* Progress Bar */}
                <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-2xl">
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
                          currentStepConfig.gradient
                        )}
                      >
                        <StepIcon size={40} className="text-white" />
                      </motion.div>
                      <h1 className="text-3xl md:text-4xl font-black text-foreground">
                        {currentStepConfig.subtitle}
                        <br />
                        <span className={cn("bg-gradient-to-l bg-clip-text text-transparent", currentStepConfig.gradient)}>
                          {currentStepConfig.title}
                        </span>
                      </h1>
                      <p className="text-muted-foreground text-lg">
                        {currentStepConfig.description}
                      </p>
                    </div>

                    {/* Step Content */}
                    <div className="space-y-4">
                      {/* Step 1: Industry Selector */}
                      {step === 1 && (
                        <>
                          <IndustrySelector selected={industry} onSelect={setIndustry} />
                          <QuickTemplates onSelect={handleTemplateSelect} />
                        </>
                      )}

                      {/* Step 2: Business Idea */}
                      {step === 2 && (
                        <>
                          <div className="relative">
                            <input
                              ref={inputRef}
                              type="text"
                              value={businessIdea}
                              onChange={(e) => setBusinessIdea(e.target.value)}
                              placeholder="مثال: فروش عسل ارگانیک، اپلیکیشن یادگیری زبان..."
                              className="input-premium text-lg py-5 pr-5 pl-28"
                            />
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                              <VoiceInputButton onTranscript={(t) => handleVoiceInput(t, "idea")} />
                              {isLoadingSuggestions ? (
                                <Loader2 size={20} className="animate-spin text-muted-foreground" />
                              ) : (
                                <Send size={20} className="text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          
                          <p className="text-center text-sm text-muted-foreground">
                            ⏎ Enter برای ادامه
                          </p>
                        </>
                      )}

                      {/* Step 3: Project Name */}
                      {step === 3 && (
                        <ProjectNameSelector
                          idea={businessIdea}
                          selectedName={projectName}
                          onNameChange={setProjectName}
                        />
                      )}

                      {/* Step 4: Problem Solving */}
                      {step === 4 && (
                        <>
                          <div className="relative">
                            <textarea
                              ref={textareaRef}
                              value={problemSolving}
                              onChange={(e) => setProblemSolving(e.target.value)}
                              placeholder="مثال: پیدا کردن عسل طبیعی سخته و اکثر عسل‌ها تقلبی هستند..."
                              className="input-premium min-h-[120px] resize-none text-lg pr-5 pl-16"
                            />
                            <div className="absolute left-3 top-4">
                              <VoiceInputButton onTranscript={(t) => handleVoiceInput(t, "problem")} />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Step 5: Audience & Competitors */}
                      {step === 5 && (
                        <div className="space-y-6">
                          {/* Audience Suggestions */}
                          {audienceSuggestions.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                                <Sparkles size={14} className="text-primary" />
                                مخاطبان پیشنهادی:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {audienceSuggestions.map((audience, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setSelectedAudience(audience)}
                                    className={cn(
                                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                                      selectedAudience === audience
                                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                                        : "bg-muted hover:bg-primary/10 text-foreground"
                                    )}
                                  >
                                    {audience}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Custom audience input */}
                          <input
                            type="text"
                            value={selectedAudience || ""}
                            onChange={(e) => setSelectedAudience(e.target.value)}
                            placeholder="یا مخاطب خودت رو بنویس..."
                            className="input-premium"
                          />

                          {/* Competitors */}
                          <div className="pt-4 border-t border-border">
                            <p className="text-sm font-medium text-foreground mb-3">
                              رقیب‌هات کی‌ان؟ (اختیاری)
                            </p>
                            <CompetitorInput 
                              competitors={competitors}
                              onChange={setCompetitors}
                              placeholder="مثال: دیجی‌کالا، باسلام..."
                            />
                          </div>
                        </div>
                      )}

                      {/* Step 6: Current Status */}
                      {step === 6 && (
                        <div className="grid gap-4">
                          {statusOptions.map((option, index) => (
                            <motion.button
                              key={option.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              onClick={() => setCurrentStatus(option.id)}
                              className={cn(
                                "p-6 rounded-2xl border-2 transition-all text-right flex items-center gap-5 group",
                                currentStatus === option.id
                                  ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                                  : "border-border hover:border-primary/30 hover:shadow-lg"
                              )}
                            >
                              <div className={cn(
                                "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl shrink-0 transition-transform group-hover:scale-110",
                                option.color
                              )}>
                                {option.emoji}
                              </div>
                              <div>
                                <p className="font-bold text-lg text-foreground">{option.label}</p>
                                <p className="text-muted-foreground">{option.sublabel}</p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {/* Step 7: Budget */}
                      {step === 7 && (
                        <>
                          <BudgetSelector selected={budget} onSelect={setBudget} />
                          
                          {/* Summary */}
                          {businessIdea && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-muted/50 rounded-xl p-4 text-sm"
                            >
                              <p className="text-muted-foreground">
                                <strong className="text-foreground">{businessIdea}</strong>
                                {selectedAudience && <> برای <strong className="text-foreground">{selectedAudience}</strong></>}
                                {problemSolving && <> — چون <strong className="text-foreground">{problemSolving}</strong></>}
                              </p>
                            </motion.div>
                          )}
                        </>
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

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button
                        variant="gradient"
                        size="xl"
                        className="w-full"
                        onClick={handleNext}
                        disabled={!canProceed() && !currentStepConfig.optional}
                      >
                        {step === totalSteps ? (
                          <>
                            <Sparkles size={18} />
                            بساز طرح کسب‌وکار من!
                          </>
                        ) : (
                          <>
                            ادامه
                            <ArrowLeft size={18} />
                          </>
                        )}
                      </Button>

                      {/* Skip for optional steps */}
                      {currentStepConfig.optional && (
                        <button
                          onClick={handleSkip}
                          className="w-full flex items-center justify-center gap-2 py-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <SkipForward size={16} />
                          رد شو
                        </button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
}
