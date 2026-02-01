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
  Presentation,
  Rocket,
  FileText,
  Lightbulb,
  Users,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Mic,
  MicOff,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export default function NewProjectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { createNewProject } = useProject();
  
  const [step, setStep] = useState<Step>(0); // Start at Step 0 (Genesis)
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectIdea, setProjectIdea] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signup");
    }
  }, [user, authLoading, router]);

  // Focus input on step change
  useEffect(() => {
    if (step === 3 && ideaInputRef.current) {
        setTimeout(() => ideaInputRef.current?.focus(), 300);
    }
  }, [step]);

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
    }
  };

  const handleBack = () => {
    setError("");
    if (step > 0) {
        setStep((prev) => (prev - 1) as Step);
    }
  };

  const handleGenerate = async () => {
    if (!user || !projectType) return;
    
    setStep(5);
    setIsGenerating(true);
    setError("");

    const audienceLabel = audienceOptions.find(a => a.id === selectedAudience)?.label || "عموم مردم";
    const budgetLabel = budgetOptions.find(b => b.id === selectedBudget)?.label || "کم‌هزینه";
    const templateItm = templates.find(t => t.id === selectedTemplate);
    const templateLabel = templateItm?.label || "";

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType, // The Trinity
          idea: `${projectIdea} (حوزه: ${templateLabel})`,
          projectName: projectName,
          audience: audienceLabel,
          budget: budgetLabel
        }),
      });

      if (!res.ok) throw new Error("Failed to generate plan");

      const data = await res.json();
      
      // Force correct data
      data.projectName = projectName;
      data.ideaInput = projectIdea;
      data.audience = audienceLabel;
      data.budget = budgetLabel;
      data.projectType = projectType; // Save the type to DB

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
      setProjectIdea(prev => (prev + " " + transcript).trim());
    };

    recognition.start();
  };

  // Get current tips based on template
  const currentTips = selectedTemplate ? (smartTips[selectedTemplate] || smartTips.other) : smartTips.other;

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

          {step > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight size={18} />
              برگشت
            </button>
          )}
        </header>

         {/* Main Content */}
         <main className="flex-1 flex items-center justify-center p-6">
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
               <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
                <GenerationLoader
                  isLoading={true}
                  title={isCreatingProject ? "در حال آماده‌سازی داشبورد..." : `در حال ساخت طرح ${projectName || "پروژه"}...`}
                />
              </div>
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
                          className={cn(
                            "relative overflow-hidden rounded-2xl p-6 text-right transition-all duration-300 border-2",
                            projectType === type.id
                              ? `border-primary bg-gradient-to-br ${type.color} text-white shadow-xl scale-105`
                              : "border-border bg-card hover:border-primary/50 hover:shadow-lg translate-y-0"
                          )}
                        >
                           <type.icon size={32} className="mb-4" />
                           <h3 className="font-bold text-lg mb-2">{type.title}</h3>
                           <p className={cn("text-sm", projectType === type.id ? "text-white/80" : "text-muted-foreground")}>
                             {type.desc}
                           </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1: Industry/Category */}
                {step === 1 && (
                    <div className="space-y-6">
                         <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">در چه حوزه‌ای فعالیت می‌کنید؟</h2>
                            <p className="text-muted-foreground">انتخاب حوزه به هوش مصنوعی کمک می‌کند پیشنهادات دقیق‌تری بدهد.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredTemplates.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTemplate(t.id)}
                                    className={cn(
                                        "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 text-center",
                                        selectedTemplate === t.id
                                            ? "border-primary bg-primary/5 shadow-md"
                                            : "border-border hover:border-primary/50 hover:bg-muted"
                                    )}
                                >
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br", t.color)}>
                                        <t.icon size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{t.label}</div>
                                        <div className="text-xs text-muted-foreground mt-1">{t.example}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Step 2: Project Name */}
                {step === 2 && (
                    <div className="max-w-md mx-auto space-y-6 text-center">
                         <h2 className="text-2xl font-bold">اسم پروژه‌ات چیه؟</h2>
                         <div className="relative">
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="نام برند یا کسب‌وکار..."
                                className="input-premium text-2xl text-center font-bold h-16"
                                autoFocus
                            />
                         </div>
                         <p className="text-sm text-muted-foreground">
                             هنوز اسم نداری؟ نگران نباش، بعداً می‌تونی تغییرش بدی.
                         </p>
                    </div>
                )}

                {/* Step 3: Idea Description */}
                {step === 3 && (
                     <div className="space-y-6">
                        <div className="text-center mb-4">
                             <h2 className="text-2xl font-bold">ایده‌ات رو توضیح بده</h2>
                             <p className="text-muted-foreground">هر چقدر جزئیات بیشتر باشه، نتیجه بهتری می‌گیری.</p>
                        </div>
                        
                        <div className="relative">
                            <textarea
                                ref={ideaInputRef}
                                value={projectIdea}
                                onChange={(e) => setProjectIdea(e.target.value)}
                                placeholder="مثال: می‌خوام یک پلتفرم آموزش آنلاین زبان انگلیسی برای کودکان راه بندازم که با بازی و سرگرمی یاد بگیرن..."
                                className="input-premium min-h-[180px] text-lg leading-relaxed p-6 resize-none"
                            />
                             <button
                                onClick={handleVoiceInput}
                                className={cn(
                                    "absolute left-4 bottom-4 p-3 rounded-full transition-all shadow-md",
                                    isRecording
                                    ? "bg-red-500 text-white animate-pulse"
                                    : "bg-background border hover:bg-muted text-foreground"
                                )}
                                title="تایپ صوتی"
                            >
                                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                        </div>

                        {/* Tips */}
                        <div className="bg-muted/50 rounded-xl p-4">
                             <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                                <Sparkles size={14} className="text-amber-500" />
                                راهنمای هوشمند:
                             </h4>
                             <ul className="space-y-1">
                                {currentTips.map((tip, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                        {tip}
                                    </li>
                                ))}
                             </ul>
                        </div>
                     </div>
                )}

                {/* Step 4: Details (Audience & Budget) */}
                {step === 4 && (
                    <div className="space-y-8">
                        {/* Audience */}
                        <div className="space-y-4">
                             <h3 className="font-bold flex items-center gap-2">
                                <Users size={18} className="text-primary" />
                                مخاطب هدف
                             </h3>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {audienceOptions.map((a) => (
                                    <button
                                        key={a.id}
                                        onClick={() => setSelectedAudience(a.id)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                                            selectedAudience === a.id
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:bg-muted"
                                        )}
                                    >
                                        <span className="text-2xl">{a.icon}</span>
                                        <span className="text-sm font-medium">{a.label}</span>
                                    </button>
                                ))}
                             </div>
                        </div>

                        <div className="h-px bg-border" />

                         {/* Budget */}
                         <div className="space-y-4">
                             <h3 className="font-bold flex items-center gap-2">
                                <Wallet size={18} className="text-primary" />
                                بودجه اولیه
                             </h3>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {budgetOptions.map((b) => (
                                    <button
                                        key={b.id}
                                        onClick={() => setSelectedBudget(b.id)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                                            selectedBudget === b.id
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:bg-muted"
                                        )}
                                    >
                                        <span className="text-2xl">{b.icon}</span>
                                        <div className="text-center">
                                            <span className="text-sm font-medium block">{b.label}</span>
                                            <span className="text-[10px] text-muted-foreground block">{b.sublabel}</span>
                                        </div>
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>
                )}

                {/* Footer / Navigation */}
                <div className="mt-8 flex items-center justify-between pt-6 border-t border-border">
                    <button
                        onClick={handleBack}
                        className={cn(
                            "text-muted-foreground hover:text-foreground transition-colors",
                            step === 0 && "invisible"
                        )}
                    >
                        بازگشت
                    </button>
                    
                    <Button
                        onClick={handleNextStep}
                        variant="gradient"
                        size="lg"
                        className="px-8"
                    >
                        {step === 4 ? (
                            <>
                                <Sparkles size={18} className="ml-2" />
                                ساخت استراتژی
                            </>
                        ) : (
                            <>
                                مرحله بعد
                                <ArrowLeft size={18} className="mr-2" />
                            </>
                        )}
                    </Button>
                </div>

                {error && (
                  <p className="text-destructive text-sm text-center mt-4">{error}</p>
                )}
              </Card>
            )}
           </div>
         </main>
      </div>
    </div>
  );
}
