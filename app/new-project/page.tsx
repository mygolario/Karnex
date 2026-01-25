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
  TrendingUp
} from "lucide-react";
import Link from "next/link";

type Step = 1 | 2 | 3 | 4 | 5;

// Industry templates
const templates = [
  { 
    id: "ecommerce", 
    icon: ShoppingCart, 
    label: "فروشگاه آنلاین",
    color: "from-orange-500 to-amber-500",
    description: "فروش محصولات فیزیکی یا دیجیتال",
    example: "فروشگاه لباس، لوازم خانگی، کتاب"
  },
  { 
    id: "app", 
    icon: Smartphone, 
    label: "اپلیکیشن موبایل",
    color: "from-primary to-purple-600",
    description: "اپلیکیشن iOS یا اندروید",
    example: "اپ تاکسی، اپ سلامت، اپ آموزش"
  },
  { 
    id: "service", 
    icon: Briefcase, 
    label: "خدمات فریلنسری",
    color: "from-secondary to-emerald-600",
    description: "ارائه خدمات تخصصی",
    example: "طراحی، برنامه‌نویسی، مشاوره"
  },
  { 
    id: "content", 
    icon: BookOpen, 
    label: "محتوا و آموزش",
    color: "from-pink-500 to-rose-500",
    description: "تولید محتوا یا آموزش آنلاین",
    example: "دوره آنلاین، پادکست، یوتیوب"
  },
  { 
    id: "food", 
    icon: Utensils, 
    label: "غذا و رستوران",
    color: "from-red-500 to-orange-500",
    description: "کسب‌وکار غذایی",
    example: "رستوران، کترینگ، سفارش آنلاین"
  },
  { 
    id: "health", 
    icon: Heart, 
    label: "سلامت و زیبایی",
    color: "from-rose-400 to-pink-500",
    description: "خدمات بهداشتی و زیبایی",
    example: "کلینیک، سالن زیبایی، مشاوره"
  },
  { 
    id: "gaming", 
    icon: Gamepad2, 
    label: "گیمینگ و سرگرمی",
    color: "from-violet-500 to-purple-600",
    description: "بازی و محصولات سرگرمی",
    example: "بازی موبایل، استریم، ایونت"
  },
  { 
    id: "other", 
    icon: Zap, 
    label: "سایر",
    color: "from-gray-500 to-gray-600",
    description: "یک ایده کاملاً جدید",
    example: "ایده‌ای متفاوت و خلاقانه"
  },
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
  { id: "low", label: "کم‌هزینه", sublabel: "تا ۵ میلیون تومان", icon: "💰", color: "text-amber-500" },
  { id: "medium", label: "متوسط", sublabel: "۵ تا ۵۰ میلیون", icon: "💎", color: "text-primary" },
  { id: "high", label: "بالا", sublabel: "بیش از ۵۰ میلیون", icon: "🏆", color: "text-purple-500" },
];

// Smart tips based on template
const smartTips: Record<string, string[]> = {
  ecommerce: [
    "📦 محصول خاصی در ذهن داری؟ (لباس، لوازم، کتاب...)",
    "🛒 فروش در اینستاگرام شروع خوبیه!",
    "💡 نیچ (تخصصی) بودن بهتر از عمومی بودنه"
  ],
  app: [
    "📱 چه مشکلی رو حل می‌کنی؟",
    "🎯 یک ویژگی کلیدی کافیه برای MVP",
    "💡 اول نسخه وب بساز، بعد اپ!"
  ],
  service: [
    "💼 مهارت اصلیت چیه؟",
    "🌐 نمونه‌کار داشتن خیلی مهمه",
    "💰 شروع با قیمت پایین، بعد افزایش"
  ],
  content: [
    "🎬 چه موضوعی رو خوب بلدی؟",
    "📱 از اینستاگرام یا یوتیوب شروع کن",
    "💡 ثبات در تولید محتوا کلیده"
  ],
  food: [
    "🍕 غذای خانگی یا رستوران؟",
    "📍 منطقه جغرافیایی مهمه",
    "📸 عکس‌های خوب از غذا = فروش بیشتر"
  ],
  health: [
    "💊 نیاز به مجوز داری؟ (برای خدمات پزشکی)",
    "🎯 تخصصی شو! (مثلاً فقط پوست)",
    "💡 اعتمادسازی اول، فروش بعد"
  ],
  gaming: [
    "🎮 بازی موبایل یا PC؟",
    "📺 استریم و محتوا هم فکر کن",
    "🌍 بازار جهانی رو هدف بگیر"
  ],
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
  
  const [step, setStep] = useState<Step>(1);
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
    { number: 1, title: "نوع کسب‌وکار", icon: Target },
    { number: 2, title: "نام پروژه", icon: FileText },
    { number: 3, title: "توضیح ایده", icon: Lightbulb },
    { number: 4, title: "جزئیات", icon: Users },
    { number: 5, title: "تولید طرح", icon: Sparkles },
  ];

  const handleNextStep = () => {
    setError("");
    
    if (step === 1 && !selectedTemplate) {
      setError("لطفاً نوع کسب‌وکار را انتخاب کنید");
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
    if (!user) return;
    
    setStep(5);
    setIsGenerating(true);
    setError("");

    const audienceLabel = audienceOptions.find(a => a.id === selectedAudience)?.label || "عموم مردم";
    const budgetLabel = budgetOptions.find(b => b.id === selectedBudget)?.label || "کم‌هزینه";
    const templateLabel = templates.find(t => t.id === selectedTemplate)?.label || "";

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: `${projectIdea} (نوع کسب‌وکار: ${templateLabel})`,
          projectName: projectName,
          audience: audienceLabel,
          budget: budgetLabel
        }),
      });

      if (!res.ok) throw new Error("Failed to generate plan");

      const data = await res.json();
      
      // Force the project name to match what the user typed
      data.projectName = projectName;
      data.ideaInput = projectIdea;
      data.audience = audienceLabel;
      data.budget = budgetLabel;

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
  const currentTips = selectedTemplate ? smartTips[selectedTemplate] : smartTips.other;

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
          <div className="w-full max-w-3xl">
            {/* Step Indicator */}
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
                      className={`w-8 md:w-12 h-0.5 mx-1 rounded-full transition-all duration-300 ${step > s.number ? "bg-primary" : "bg-border"}`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            {step === 5 && isGenerating ? (
              <GenerationLoader projectName={projectName} />
            ) : (
              <Card variant="glass" padding="xl" className="animate-fade-in-up">
                
                {/* Step 1: Template Selection */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Badge variant="info" size="lg" className="mb-4">
                        مرحله ۱ از ۵
                      </Badge>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        چه نوع کسب‌وکاری می‌خواهید؟
                      </h2>
                      <p className="text-muted-foreground">
                        یک دسته‌بندی انتخاب کنید تا پیشنهادات بهتری دریافت کنید
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {templates.map((template) => (
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
                          <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                        </button>
                      ))}
                    </div>

                    {error && (
                      <p className="text-destructive text-sm text-center">{error}</p>
                    )}

                    <Button
                      variant="gradient"
                      size="xl"
                      className="w-full"
                      onClick={handleNextStep}
                    >
                      مرحله بعد
                      <ArrowLeft size={18} />
                    </Button>
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
                        {templates.find(t => t.id === selectedTemplate)?.label} برای {audienceOptions.find(a => a.id === selectedAudience)?.label} با بودجه {budgetOptions.find(b => b.id === selectedBudget)?.label}
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
