"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GenerationLoader } from "@/components/shared/generation-loader";
import Image from "next/image";
import { 
  Rocket, 
  ArrowLeft, 
  ArrowRight,
  Lightbulb,
  FileText,
  Sparkles,
  CheckCircle2,
  Loader2,
  Users,
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

export default function NewProjectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { createNewProject } = useProject();
  
  const [step, setStep] = useState<Step>(0); // Start at Step 0 (Genesis)
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectIdea, setProjectIdea] = useState("");
  const [selectedAudience, setSelectedAudience] = useState<string>("everyone");
  const [selectedBudget, setSelectedBudget] = useState<string>("low");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signup");
    }
  }, [user, authLoading, router]);

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

  const handlePrevStep = () => {
    setError("");
    setStep((prev) => (prev - 1) as Step);
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

      await createNewProject(data);
      router.push("/dashboard/overview");
    } catch (err) {
      console.error(err);
      setError("خطا در تولید طرح. لطفاً دوباره تلاش کنید.");
      setIsGenerating(false);
      setStep(4);
    }
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image 
              src="/logo-icon-dark.png" 
              alt="Karnex Logo" 
              width={40} 
              height={40} 
              className="rounded-xl shadow-lg dark:invert-0 invert"
            />
            <span className="text-xl font-black text-foreground">کارنکس</span>
          </Link>
          
          {/* Live Preview */}
          {projectName && step >= 2 && (
            <div className="hidden md:flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-xl">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {projectName.charAt(0)}
              </div>
              <span className="font-bold text-foreground">{projectName}</span>
            </div>
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
          </div>
        </main>
      </div>
    </div>
  );
}
