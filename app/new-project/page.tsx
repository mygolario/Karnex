"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { savePlanToCloud } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GenerationLoader } from "@/components/shared/generation-loader";
import { 
  Rocket, 
  ArrowLeft, 
  ArrowRight,
  Lightbulb,
  FileText,
  Sparkles,
  CheckCircle2,
  Loader2
} from "lucide-react";
import Link from "next/link";

type Step = 1 | 2 | 3;

export default function NewProjectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [projectName, setProjectName] = useState("");
  const [projectIdea, setProjectIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signup");
    }
  }, [user, authLoading, router]);

  const steps = [
    { number: 1, title: "نام پروژه", icon: FileText },
    { number: 2, title: "توضیح ایده", icon: Lightbulb },
    { number: 3, title: "تولید طرح", icon: Sparkles },
  ];

  const handleNextStep = () => {
    if (step === 1 && !projectName.trim()) {
      setError("لطفاً نام پروژه را وارد کنید");
      return;
    }
    if (step === 2 && !projectIdea.trim()) {
      setError("لطفاً ایده خود را توضیح دهید");
      return;
    }
    setError("");
    
    if (step === 2) {
      handleGenerate();
    } else {
      setStep((prev) => (prev + 1) as Step);
    }
  };

  const handlePrevStep = () => {
    setError("");
    setStep((prev) => (prev - 1) as Step);
  };

  const { createNewProject } = useProject(); // New hook usage

  const handleGenerate = async () => {
    if (!user) return;
    
    setStep(3);
    setIsGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Fix: Send 'idea' instead of 'projectIdea' to match API expectation
        body: JSON.stringify({
          idea: projectIdea,
          projectName: projectName, 
          // Add default audience/budget if not collected yet to avoid undefined in prompt
          audience: "عموم مردم",
          budget: "کم‌هزینه"
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate plan");
      }

      const data = await res.json();
      
      // Fix: Force the project name to match what the user typed
      // (The AI often renames it, but we should respect the user's choice)
      data.projectName = projectName;

      // Create new project via context (generates new ID)
      await createNewProject(data);
      
      // Redirect to dashboard (activeProject is now set)
      router.push("/dashboard/overview");
    } catch (err) {
      console.error(err);
      setError("خطا در تولید طرح. لطفاً دوباره تلاش کنید.");
      setIsGenerating(false);
      setStep(2);
    }
  };

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
        <header className="p-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg">
              <Rocket size={20} />
            </div>
            <span className="text-xl font-black text-foreground">کارنکس</span>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-12">
              {steps.map((s, i) => (
                <div key={s.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                        ${step >= s.number 
                          ? "bg-gradient-primary text-white shadow-lg shadow-primary/25" 
                          : "bg-muted text-muted-foreground"}
                      `}
                    >
                      {step > s.number ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <s.icon size={20} />
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${step >= s.number ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.title}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`
                        w-16 h-0.5 mx-2 rounded-full transition-all duration-300
                        ${step > s.number ? "bg-primary" : "bg-border"}
                      `}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            {step === 3 && isGenerating ? (
              <GenerationLoader projectName={projectName} />
            ) : (
              <Card variant="glass" padding="xl" className="animate-fade-in-up">
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Badge variant="info" size="lg" className="mb-4">
                        مرحله ۱ از ۳
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

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Badge variant="info" size="lg" className="mb-4">
                        مرحله ۲ از ۳
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
                        placeholder="مثال: یک اپلیکیشن موبایل که به افراد کمک می‌کند کتاب‌های مورد علاقه خود را پیدا کنند، با دوستان به اشتراک بگذارند و از تخفیفات ویژه کتابفروشی‌های محلی استفاده کنند..."
                        className="input-premium min-h-[200px] resize-none"
                        autoFocus
                      />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lightbulb size={16} className="text-accent" />
                      <span>
                        نگران نباشید! هوش مصنوعی به شما کمک می‌کند ایده را کامل کنید.
                      </span>
                    </div>

                    {error && (
                      <p className="text-destructive text-sm text-center">{error}</p>
                    )}

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        onClick={handlePrevStep}
                      >
                        <ArrowRight size={18} />
                        مرحله قبل
                      </Button>
                      <Button
                        variant="gradient"
                        size="lg"
                        className="flex-1"
                        onClick={handleNextStep}
                      >
                        <Sparkles size={18} />
                        تولید طرح کسب‌وکار
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Hints */}
            {step !== 3 && (
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
