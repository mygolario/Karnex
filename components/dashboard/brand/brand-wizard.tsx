"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  Heart, 
  Users, 
  Palette, 
  Crown, 
  Zap,
  Target,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ===== WIZARD CONFIGURATION =====

const INDUSTRIES = [
  { id: "tech", label: "فناوری", emoji: "💻", color: "from-blue-500 to-cyan-500" },
  { id: "food", label: "غذا و نوشیدنی", emoji: "🍕", color: "from-orange-500 to-red-500" },
  { id: "fashion", label: "مد و پوشاک", emoji: "👗", color: "from-pink-500 to-rose-500" },
  { id: "health", label: "سلامت و درمان", emoji: "🏥", color: "from-emerald-500 to-teal-500" },
  { id: "education", label: "آموزش", emoji: "📚", color: "from-purple-500 to-violet-500" },
  { id: "finance", label: "مالی و بانکداری", emoji: "💰", color: "from-yellow-500 to-amber-500" },
  { id: "travel", label: "سفر و گردشگری", emoji: "✈️", color: "from-sky-500 to-blue-500" },
  { id: "beauty", label: "زیبایی و آرایش", emoji: "💄", color: "from-fuchsia-500 to-pink-500" },
  { id: "sports", label: "ورزش و تناسب", emoji: "⚽", color: "from-green-500 to-emerald-500" },
  { id: "art", label: "هنر و خلاقیت", emoji: "🎨", color: "from-indigo-500 to-purple-500" },
  { id: "realestate", label: "املاک", emoji: "🏠", color: "from-slate-500 to-gray-500" },
  { id: "other", label: "سایر", emoji: "🌟", color: "from-gray-500 to-slate-500" },
];

const PERSONALITIES = [
  { id: "professional", label: "حرفه‌ای", emoji: "👔" },
  { id: "friendly", label: "دوستانه", emoji: "😊" },
  { id: "innovative", label: "نوآورانه", emoji: "💡" },
  { id: "luxury", label: "لوکس", emoji: "✨" },
  { id: "playful", label: "شاد و پویا", emoji: "🎉" },
  { id: "minimal", label: "مینیمال", emoji: "◻️" },
  { id: "bold", label: "جسورانه", emoji: "💪" },
  { id: "elegant", label: "شکیل", emoji: "🎩" },
  { id: "natural", label: "طبیعی", emoji: "🌿" },
  { id: "modern", label: "مدرن", emoji: "🔮" },
];

const LOGO_STYLES = [
  { id: "minimal", label: "مینیمال", description: "ساده و تمیز", image: "◯" },
  { id: "emblem", label: "نشان", description: "آرم و نماد", image: "🛡️" },
  { id: "wordmark", label: "وردمارک", description: "فقط متن", image: "Aa" },
  { id: "abstract", label: "انتزاعی", description: "اشکال هندسی", image: "△" },
  { id: "mascot", label: "ماسکوت", description: "شخصیت برند", image: "🐻" },
  { id: "combination", label: "ترکیبی", description: "آرم + متن", image: "★A" },
];

const FEELINGS = [
  { id: "trust", label: "اعتماد", emoji: "🤝", color: "from-blue-500 to-indigo-500" },
  { id: "excitement", label: "هیجان", emoji: "🚀", color: "from-orange-500 to-red-500" },
  { id: "calm", label: "آرامش", emoji: "🌊", color: "from-teal-500 to-cyan-500" },
  { id: "luxury", label: "لوکس", emoji: "👑", color: "from-amber-500 to-yellow-500" },
  { id: "innovation", label: "نوآوری", emoji: "💡", color: "from-purple-500 to-violet-500" },
  { id: "nature", label: "طبیعت", emoji: "🌿", color: "from-green-500 to-emerald-500" },
];

const COLOR_PALETTES = [
  { id: "blue", colors: ["#3B82F6", "#60A5FA", "#93C5FD"], label: "آبی" },
  { id: "green", colors: ["#10B981", "#34D399", "#6EE7B7"], label: "سبز" },
  { id: "purple", colors: ["#8B5CF6", "#A78BFA", "#C4B5FD"], label: "بنفش" },
  { id: "orange", colors: ["#F97316", "#FB923C", "#FDBA74"], label: "نارنجی" },
  { id: "red", colors: ["#EF4444", "#F87171", "#FCA5A5"], label: "قرمز" },
  { id: "pink", colors: ["#EC4899", "#F472B6", "#F9A8D4"], label: "صورتی" },
  { id: "teal", colors: ["#14B8A6", "#2DD4BF", "#5EEAD4"], label: "سبزآبی" },
  { id: "amber", colors: ["#F59E0B", "#FBBF24", "#FCD34D"], label: "کهربایی" },
  { id: "slate", colors: ["#475569", "#64748B", "#94A3B8"], label: "خاکستری" },
  { id: "black", colors: ["#000000", "#1F2937", "#374151"], label: "مشکی" },
];

// ===== WIZARD PROPS =====

interface BrandWizardProps {
  projectName: string;
  ideaInput: string;
  onComplete: (wizardData: WizardData) => void;
  onSkip?: () => void;
}

export interface WizardData {
  industry: string;
  brandPersonality: string[];
  targetAudience: string;
  preferredColors: string[];
  logoStyle: string;
  desiredFeeling: string;
  competitors: string[];
}

// ===== WIZARD COMPONENT =====

export function BrandWizard({ projectName, ideaInput, onComplete, onSkip }: BrandWizardProps) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Wizard state
  const [industry, setIndustry] = useState<string>("");
  const [brandPersonality, setBrandPersonality] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState("");
  const [preferredColors, setPreferredColors] = useState<string[]>([]);
  const [logoStyle, setLogoStyle] = useState("");
  const [desiredFeeling, setDesiredFeeling] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);

  const totalSteps = 7;
  const progress = (step / totalSteps) * 100;

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return industry !== "";
      case 2: return brandPersonality.length > 0;
      case 3: return targetAudience.trim().length > 0;
      case 4: return preferredColors.length > 0;
      case 5: return logoStyle !== "";
      case 6: return desiredFeeling !== "";
      case 7: return true; // Competitors optional
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === totalSteps) {
      handleComplete();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    setIsGenerating(true);
    
    const wizardData: WizardData = {
      industry,
      brandPersonality,
      targetAudience,
      preferredColors,
      logoStyle,
      desiredFeeling,
      competitors,
    };

    // Simulate AI generation time, then call onComplete
    setTimeout(() => {
      onComplete(wizardData);
    }, 100);
  };

  const togglePersonality = (id: string) => {
    setBrandPersonality(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const toggleColor = (id: string) => {
    setPreferredColors(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : prev.length < 2 ? [...prev, id] : prev
    );
  };

  // Loading state
  if (isGenerating) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center gap-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/30">
            <Sparkles size={56} className="text-white animate-pulse" />
          </div>
          <motion.div 
            className="absolute inset-0 rounded-3xl border-4 border-primary/30"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <div className="text-center">
          <h2 className="text-2xl font-black mb-2">در حال ساخت هویت بصری...</h2>
          <p className="text-muted-foreground">کارنکس در حال طراحی برند منحصر به فرد شماست</p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-primary"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  const stepConfig = [
    { title: "صنعت کسب‌وکار", subtitle: "در چه حوزه‌ای فعالیت می‌کنید؟", icon: Building2 },
    { title: "شخصیت برند", subtitle: "برندتان چه ویژگی‌هایی دارد؟", icon: Heart },
    { title: "مخاطب هدف", subtitle: "مشتریان شما چه کسانی هستند؟", icon: Users },
    { title: "پالت رنگی", subtitle: "چه رنگ‌هایی را ترجیح می‌دهید؟", icon: Palette },
    { title: "سبک لوگو", subtitle: "لوگوی شما چه شکلی باشد؟", icon: Crown },
    { title: "احساس برند", subtitle: "چه حسی می‌خواهید منتقل کنید؟", icon: Zap },
    { title: "رقبا", subtitle: "رقبای اصلی شما کی‌ها هستند؟", icon: Target },
  ];

  const currentStep = stepConfig[step - 1];
  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-[600px] flex flex-col" dir="rtl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            مرحله {step} از {totalSteps}
          </span>
          {onSkip && (
            <button 
              onClick={onSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              رد شدن
            </button>
          )}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Header */}
      <div className="text-center mb-8">
        <motion.div 
          key={step}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4"
        >
          <StepIcon size={32} className="text-white" />
        </motion.div>
        <h2 className="text-2xl font-black text-foreground mb-1">{currentStep.title}</h2>
        <p className="text-muted-foreground">{currentStep.subtitle}</p>
      </div>

      {/* Step Content */}
      <div className="flex-1 mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Industry */}
            {step === 1 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {INDUSTRIES.map(ind => (
                  <button
                    key={ind.id}
                    onClick={() => setIndustry(ind.id)}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all text-center",
                      industry === ind.id
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-3xl mb-2 block">{ind.emoji}</span>
                    <span className="text-sm font-medium">{ind.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Brand Personality */}
            {step === 2 && (
              <div>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  حداکثر ۳ مورد انتخاب کنید
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {PERSONALITIES.map(p => (
                    <button
                      key={p.id}
                      onClick={() => togglePersonality(p.id)}
                      className={cn(
                        "px-4 py-3 rounded-full border-2 transition-all flex items-center gap-2",
                        brandPersonality.includes(p.id)
                          ? "border-primary bg-primary text-white"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span>{p.emoji}</span>
                      <span className="font-medium">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Target Audience */}
            {step === 3 && (
              <div className="max-w-md mx-auto">
                <textarea
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="مثال: جوانان ۱۸ تا ۳۵ ساله، خانواده‌های شهری، کسب‌وکارهای کوچک..."
                  className="w-full p-4 rounded-2xl border-2 border-border focus:border-primary outline-none resize-none h-32 text-right"
                />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  هرچه دقیق‌تر توضیح دهید، نتیجه بهتری می‌گیرید
                </p>
              </div>
            )}

            {/* Step 4: Color Palette */}
            {step === 4 && (
              <div>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  حداکثر ۲ پالت انتخاب کنید
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {COLOR_PALETTES.map(palette => (
                    <button
                      key={palette.id}
                      onClick={() => toggleColor(palette.id)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all",
                        preferredColors.includes(palette.id)
                          ? "border-primary shadow-lg"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex gap-1 mb-2">
                        {palette.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{palette.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Logo Style */}
            {step === 5 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {LOGO_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setLogoStyle(style.id)}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all text-center",
                      logoStyle === style.id
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="text-4xl mb-3">{style.image}</div>
                    <div className="font-bold mb-1">{style.label}</div>
                    <div className="text-sm text-muted-foreground">{style.description}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 6: Desired Feeling */}
            {step === 6 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {FEELINGS.map(feeling => (
                  <button
                    key={feeling.id}
                    onClick={() => setDesiredFeeling(feeling.id)}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all text-center",
                      desiredFeeling === feeling.id
                        ? "border-primary shadow-lg"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl bg-gradient-to-br",
                      feeling.color
                    )}>
                      {feeling.emoji}
                    </div>
                    <div className="font-bold">{feeling.label}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 7: Competitors */}
            {step === 7 && (
              <div className="max-w-md mx-auto text-center">
                <p className="text-muted-foreground mb-4">
                  این مرحله اختیاری است اما کمک می‌کند برندتان متمایز باشد
                </p>
                <textarea
                  value={competitors.join("\n")}
                  onChange={(e) => setCompetitors(e.target.value.split("\n").filter(c => c.trim()))}
                  placeholder="هر رقیب در یک خط&#10;مثال:&#10;دیجی‌کالا&#10;باسلام&#10;ترب"
                  className="w-full p-4 rounded-2xl border-2 border-border focus:border-primary outline-none resize-none h-32 text-right"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        {step > 1 && (
          <Button variant="outline" size="lg" onClick={handleBack} className="flex-1">
            <ArrowRight className="ml-2" size={18} />
            قبلی
          </Button>
        )}
        <Button 
          variant="gradient" 
          size="lg" 
          onClick={handleNext}
          disabled={!canProceed()}
          className="flex-1"
        >
          {step === totalSteps ? (
            <>
              <Sparkles className="ml-2" size={18} />
              ساخت هویت بصری
            </>
          ) : (
            <>
              بعدی
              <ArrowLeft className="mr-2" size={18} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
