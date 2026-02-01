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
<<<<<<< HEAD
  Tag,
  Mic,
  MicOff
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
=======
  Wallet,
  ShoppingCart,
  Smartphone,
  Briefcase,
  BookOpen,
  Utensils,
  Heart,
  Gamepad2,
  Car,
  Home,
  Zap,
  Target,
  TrendingUp,
  Store,
  Video,
  Presentation
} from "lucide-react";
import Link from "next/link";

type ProjectType = 'startup' | 'traditional' | 'creator';
type Step = 0 | 1 | 2 | 3 | 4 | 5;

// Industry templates with categories
const templates = [
  // Traditional
  { id: "food", icon: Utensils, label: "غذا و رستوران", category: "traditional", color: "from-red-500 to-orange-500", description: "رستوران، کافه، کترینگ", example: "کافه دنج، رستوران سنتی" },
  { id: "shop", icon: Store, label: "فروشگاه فیزیکی", category: "traditional", color: "from-blue-500 to-cyan-500", description: "بوتیک، سوپرمارکت، گالری", example: "بوتیک لباس، ابزار فروشی" },
  { id: "service_local", icon: Briefcase, label: "خدمات محلی", category: "traditional", color: "from-emerald-500 to-teal-500", description: "آرایشگاه، تعمیرات، مشاوره", example: "سالن زیبایی، دفتر بیمه" },
  
  // Startup
  { id: "app", icon: Smartphone, label: "اپلیکیشن / SaaS", category: "startup", color: "from-primary to-purple-600", description: "نرم‌افزار، اپلیکیشن، پلتفرم", example: "اپ تاکسی، مدیریت پروژه" },
  { id: "ecommerce", icon: ShoppingCart, label: "فروشگاه آنلاین", category: "startup", color: "from-orange-500 to-amber-500", description: "ای‌کامرس مقیاس‌پذیر", example: "مارکت‌پلیس، شاپ آنلاین" },
  { id: "fintech", icon: Wallet, label: "فین‌تک / کریپتو", category: "startup", color: "from-indigo-500 to-blue-600", description: "تکنولوژی مالی", example: "کیف پول دیجیتال، پرداخت" },
  
  // Creator
  { id: "content", icon: Video, label: "تولید محتوا", category: "creator", color: "from-pink-500 to-rose-500", description: "یوتیوب، اینستاگرام، استریم", example: "چنل گیمینگ، پیج آموزشی" },
  { id: "education", icon: BookOpen, label: "آموزش آنلاین", category: "creator", color: "from-violet-500 to-fuchsia-500", description: "دوره آموزشی، منتورینگ", example: "پکیج آموزش زبان" },
  { id: "freelance", icon: Briefcase, label: "فریلنسر / شخصی", category: "creator", color: "from-sky-500 to-blue-500", description: "برند شخصی، خدمات دورکاری", example: "طراح گرافیک، نویسنده" },
  
  // Universal
  { id: "other", icon: Zap, label: "سایر", category: "all", color: "from-gray-500 to-gray-600", description: "ایده‌ای متفاوت", example: "خلاقانه و جدید" },
];

const projectTypes = [
  {
    id: 'startup',
    title: 'استارتاپ مدرن',
    icon: Rocket,
    desc: 'ساخت اپلیکیشن، پلتفرم یا محصول مقیاس‌پذیر با هدف رشد سریع و جذب سرمایه.',
    color: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'traditional',
    title: 'کسب‌وکار سنتی',
    icon: Store,
    desc: 'راه‌اندازی فروشگاه، کافه، رستوران یا خدمات محلی با تمرکز بر درآمد و مکان فیزیکی.',
    color: 'from-emerald-600 to-teal-600'
  },
  {
    id: 'creator',
    title: 'تولید محتوا / شخصی',
    icon: Video,
    desc: 'ساخت برند شخصی، فریلنسری، یوتیوب یا آموزش آنلاین.',
    color: 'from-pink-600 to-rose-600'
  }
];

// Audience options
const audienceOptions = [
  { id: "youth", label: "جوانان (۱۸-۳۰)", icon: "🧑‍🎤" },
  { id: "families", label: "خانواده‌ها", icon: "👨‍👩‍👧" },
  { id: "professionals", label: "متخصصان", icon: "👔" },
  { id: "students", label: "دانشجویان", icon: "🎓" },
  { id: "businesses", label: "کسب‌وکارها (B2B)", icon: "🏢" },
  { id: "everyone", label: "عموم مردم", icon: "🌍" },
];

// Budget options
const budgetOptions = [
  { id: "free", label: "رایگان", sublabel: "بدون سرمایه اولیه", icon: "💸", color: "text-secondary" },
  { id: "low", label: "کم‌هزینه", sublabel: "تا ۵۰ میلیون تومان", icon: "💰", color: "text-amber-500" },
  { id: "medium", label: "متوسط", sublabel: "۵۰ تا ۵۰۰ میلیون", icon: "💎", color: "text-primary" },
  { id: "high", label: "بالا", sublabel: "بیش از ۵۰۰ میلیون", icon: "🏆", color: "text-purple-500" },
];

// Smart tips based on template
const smartTips: Record<string, string[]> = {
  // ... (Keep existing tips if needed or expand)
  other: [
    "💡 ایده‌ات رو واضح توضیح بده",
    "🎯 چه مشکلی رو حل می‌کنی؟",
    "👥 مشتری هدفت کیه؟"
  ]
};
>>>>>>> Karnex-Completion

export default function NewProjectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { createNewProject } = useProject();
<<<<<<< HEAD

  // Simple 3-step state
  const [step, setStep] = useState(1);
  const [businessIdea, setBusinessIdea] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("");
=======
  
  const [step, setStep] = useState<Step>(0); // Start at Step 0 (Genesis)
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
>>>>>>> Karnex-Completion
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

<<<<<<< HEAD
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
=======
  const steps = [
    { number: 0, title: "نوع مسیر", icon: Target },
    { number: 1, title: "حوزه فعالیت", icon: Briefcase },
    { number: 2, title: "نام پروژه", icon: FileText },
    { number: 3, title: "شرح ایده", icon: Lightbulb },
    { number: 4, title: "جزئیات", icon: Users },
    { number: 5, title: "ساخت", icon: Sparkles },
  ];

  // Filter templates based on project type
  const filteredTemplates = templates.filter(t => 
    t.category === 'all' || t.category === projectType
  );

  const handleNextStep = () => {
    setError("");
    
    if (step === 0 && !projectType) {
        setError("لطفاً یک مسیر را انتخاب کنید");
        return;
    }
    if (step === 1 && !selectedTemplate) {
      setError("لطفاً حوزه فعالیت را انتخاب کنید");
      return;
    }
    if (step === 2 && !projectName.trim()) {
      setError("لطفاً نام پروژه را وارد کنید");
      return;
    }
    if (step === 3 && !projectIdea.trim()) {
      setError("لطفاً ایده خود را توضیح دهید");
      return;
    }
    
    if (step === 4) {
      handleGenerate();
    } else {
      setStep((prev) => (prev + 1) as Step);
>>>>>>> Karnex-Completion
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
<<<<<<< HEAD
    if (!user) return;

    setIsGenerating(true);
    setError("");

=======
    if (!user || !projectType) return;
    
    setStep(5);
    setIsGenerating(true);
    setError("");

    const audienceLabel = audienceOptions.find(a => a.id === selectedAudience)?.label || "عموم مردم";
    const budgetLabel = budgetOptions.find(b => b.id === selectedBudget)?.label || "کم‌هزینه";
    const templateItm = templates.find(t => t.id === selectedTemplate);
    const templateLabel = templateItm?.label || "";

>>>>>>> Karnex-Completion
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
<<<<<<< HEAD
          idea: businessIdea,
          audience: selectedAudience,
          budget: "متوسط", // Default
=======
          projectType, // The Trinity
          idea: `${projectIdea} (حوزه: ${templateLabel})`,
          projectName: projectName,
          audience: audienceLabel,
          budget: budgetLabel
>>>>>>> Karnex-Completion
        }),
      });

      if (!res.ok) throw new Error("Failed to generate plan");

      const data = await res.json();
<<<<<<< HEAD
=======
      
      // Force correct data
      data.projectName = projectName;
      data.ideaInput = projectIdea;
      data.audience = audienceLabel;
      data.budget = budgetLabel;
      data.projectType = projectType; // Save the type to DB
>>>>>>> Karnex-Completion

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

<<<<<<< HEAD
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
=======
  // Get current tips based on template
  const currentTips = selectedTemplate ? (smartTips[selectedTemplate] || smartTips.other) : smartTips.other;
>>>>>>> Karnex-Completion

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
<<<<<<< HEAD
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
=======
          <div className="w-full max-w-4xl">
            {/* Step Indicator */}
            {step < 5 && (
                <div className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
                {steps.map((s, i) => (
                    <div key={s.number} className="flex items-center shrink-0">
                    <div className="flex flex-col items-center">
                        <div
                        className={`
                            w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                            ${step >= s.number 
                            ? "bg-gradient-primary text-white shadow-lg shadow-primary/25" 
                            : "bg-muted text-muted-foreground"}
                        `}
                        >
                        {step > s.number ? (
                            <CheckCircle2 size={18} />
                        ) : (
                            <s.icon size={18} />
                        )}
                        </div>
                        <span className={`text-xs mt-1 font-medium hidden md:block ${step >= s.number ? "text-foreground" : "text-muted-foreground"}`}>
                        {s.title}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div
                        className={`w-8 md:w-16 h-0.5 mx-1 rounded-full transition-all duration-300 ${step > s.number ? "bg-primary" : "bg-border"}`}
                        />
                    )}
                    </div>
                ))}
                </div>
            )}

            {/* Step Content */}
            {step === 5 && isGenerating ? (
              <GenerationLoader projectName={projectName} />
            ) : (
              <Card variant="glass" padding="xl" className="animate-fade-in-up">
                
                {/* Step 0: Genesis (The Trinity) */}
                {step === 0 && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <Badge variant="gradient" size="lg" className="mb-4">
                        نقطه شروع
                      </Badge>
                      <h2 className="text-3xl font-black text-foreground mb-4">
                        چه رویایی در سر دارید؟
                      </h2>
                      <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        مسیر موفقیت خود را انتخاب کنید تا کارنکس ابزارهای مناسب را در اختیار شما قرار دهد.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      {projectTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setProjectType(type.id as ProjectType)}
                          className={`
                            relative overflow-hidden rounded-2xl border-2 p-6 text-right transition-all duration-300 group
                            ${projectType === type.id 
                                ? "border-primary bg-primary/5 shadow-xl scale-105" 
                                : "border-border hover:border-primary/50 hover:bg-muted/50"}
                          `}
                        >
                          <div className={`
                            w-14 h-14 rounded-2xl bg-gradient-to-br ${type.color} 
                            flex items-center justify-center text-white mb-6 shadow-lg
                            group-hover:scale-110 transition-transform duration-500
                          `}>
                            <type.icon size={28} />
                          </div>
                          
                          <h3 className="text-xl font-bold text-foreground mb-3">
                            {type.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {type.desc}
                          </p>
                          
                          {projectType === type.id && (
                            <div className="absolute top-4 left-4 text-primary">
                                <CheckCircle2 size={24} className="animate-in zoom-in" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-center pt-4">
                        <Button
                            variant="gradient"
                            size="xl"
                            className={`w-full max-w-sm transition-all duration-500 ${!projectType ? "opacity-50 grayscale cursor-not-allowed" : "shadow-xl shadow-primary/20 hover:scale-105"}`}
                            onClick={handleNextStep}
                            disabled={!projectType}
                        >
                            شروع مسیر
                            <ArrowLeft size={20} />
                        </Button>
                    </div>
                  </div>
                )}

                {/* Step 1: Template Selection (Filtered) */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Badge variant="info" size="lg" className="mb-4">
                        مرحله ۱ از ۵
                      </Badge>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        حوزه فعالیت شما چیست؟
                      </h2>
                      <p className="text-muted-foreground">
                        مناسب‌ترین دسته‌بندی را برای {projectTypes.find(p => p.id === projectType)?.title} انتخاب کنید
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {filteredTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-center group hover:scale-[1.02] ${
                            selectedTemplate === template.id 
                              ? "border-primary bg-primary/5 shadow-lg" 
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${template.color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <template.icon size={24} />
                          </div>
                          <p className="font-bold text-foreground text-sm">{template.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{template.description}</p>
                        </button>
                      ))}
                    </div>

                    {error && (
                      <p className="text-destructive text-sm text-center">{error}</p>
                    )}

                    <div className="flex gap-4">
                      <Button variant="outline" size="lg" className="flex-1" onClick={handlePrevStep}>
                        <ArrowRight size={18} />
                        تغییر مسیر
                      </Button>
                      <Button variant="gradient" size="lg" className="flex-1" onClick={handleNextStep}>
                        مرحله بعد
                        <ArrowLeft size={18} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Project Name */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Badge variant="info" size="lg" className="mb-4">
                        مرحله ۲ از ۵
                      </Badge>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        پروژه خود را نام‌گذاری کنید
                      </h2>
                      <p className="text-muted-foreground">
                        یک نام کوتاه و به‌یادماندنی برای پروژه انتخاب کنید
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        نام پروژه
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="مثال: کتاب‌یار، فودهاب، سلام‌تراپی"
                        className="input-premium text-lg py-4"
                        autoFocus
                      />
                    </div>

                    {/* Live Preview */}
                    {projectName && (
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
                          {projectName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{projectName}</p>
                          <p className="text-sm text-muted-foreground">پیش‌نمایش برند شما</p>
                        </div>
                      </div>
                    )}

                    {error && (
                      <p className="text-destructive text-sm text-center">{error}</p>
                    )}

                    <div className="flex gap-4">
                      <Button variant="outline" size="lg" className="flex-1" onClick={handlePrevStep}>
                        <ArrowRight size={18} />
                        مرحله قبل
                      </Button>
                      <Button variant="gradient" size="lg" className="flex-1" onClick={handleNextStep}>
                        مرحله بعد
                        <ArrowLeft size={18} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Idea Description */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Badge variant="info" size="lg" className="mb-4">
                        مرحله ۳ از ۵
                      </Badge>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        ایده خود را شرح دهید
                      </h2>
                      <p className="text-muted-foreground">
                        هرچه جزئیات بیشتری بدهید، طرح دقیق‌تری دریافت می‌کنید
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        توضیح ایده
                      </label>
                      <textarea
                        value={projectIdea}
                        onChange={(e) => setProjectIdea(e.target.value)}
                        placeholder="ایده‌تان را در چند جمله توضیح دهید. چه مشکلی حل می‌کنید؟ محصول یا خدمات شما چیست؟"
                        className="input-premium min-h-[150px] resize-none"
                        autoFocus
                      />
                    </div>

                    {/* Smart Tips */}
                    <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                      <p className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Lightbulb size={16} className="text-accent" />
                        نکات هوشمند:
                      </p>
                      {currentTips.map((tip, i) => (
                        <p key={i} className="text-sm text-muted-foreground">{tip}</p>
                      ))}
                    </div>

                    {error && (
                      <p className="text-destructive text-sm text-center">{error}</p>
                    )}

                    <div className="flex gap-4">
                      <Button variant="outline" size="lg" className="flex-1" onClick={handlePrevStep}>
                        <ArrowRight size={18} />
                        مرحله قبل
                      </Button>
                      <Button variant="gradient" size="lg" className="flex-1" onClick={handleNextStep}>
                        مرحله بعد
                        <ArrowLeft size={18} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Audience & Budget */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Badge variant="info" size="lg" className="mb-4">
                        مرحله ۴ از ۵
                      </Badge>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        جزئیات بیشتر
                      </h2>
                      <p className="text-muted-foreground">
                        این اطلاعات به AI کمک می‌کند طرح دقیق‌تری بسازد
                      </p>
                    </div>

                    {/* Audience Selection */}
                    <div>
                      <label className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <Users size={16} />
                        مخاطب هدف
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {audienceOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setSelectedAudience(option.id)}
                            className={`p-3 rounded-xl border-2 transition-all text-right flex items-center gap-3 ${
                              selectedAudience === option.id 
                                ? "border-primary bg-primary/5" 
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <span className="text-xl">{option.icon}</span>
                            <span className="text-sm font-medium text-foreground">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget Selection */}
                    <div>
                      <label className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <Wallet size={16} />
                        بودجه اولیه
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {budgetOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setSelectedBudget(option.id)}
                            className={`p-4 rounded-xl border-2 transition-all text-right ${
                              selectedBudget === option.id 
                                ? "border-primary bg-primary/5" 
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{option.icon}</span>
                              <div>
                                <p className={`font-bold ${option.color}`}>{option.label}</p>
                                <p className="text-xs text-muted-foreground">{option.sublabel}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Summary Preview */}
                    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4">
                      <p className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                        <TrendingUp size={16} className="text-primary" />
                        خلاصه پروژه:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">{projectName}</strong> - 
                        {templates.find(t => t.id === selectedTemplate)?.label} ({projectTypes.find(p => p.id === projectType)?.title})
                      </p>
                    </div>

                    {error && (
                      <p className="text-destructive text-sm text-center">{error}</p>
                    )}

                    <div className="flex gap-4">
                      <Button variant="outline" size="lg" className="flex-1" onClick={handlePrevStep}>
                        <ArrowRight size={18} />
                        مرحله قبل
                      </Button>
                      <Button variant="gradient" size="lg" className="flex-1" onClick={handleNextStep}>
                        <Sparkles size={18} />
                        تولید طرح کسب‌وکار
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Bottom Hints */}
            {step !== 5 && (
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  نیاز به الهام دارید؟{" "}
                  <span className="text-primary font-bold">
                    یک ایده ساده کافیست!
                  </span>
                </p>
              </div>
            )}
>>>>>>> Karnex-Completion
          </div>
        </main>
      </div>
    </div>
  );
}
