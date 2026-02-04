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
  CheckCircle2,
  ChevronRight,
  Loader2,
  Zap,
  Layout
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Import Genesis Constants
import { PILLARS, TEMPLATES, GENESIS_STEPS, ProjectType } from "./genesis-constants";

export default function NewProjectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { createNewProject } = useProject();
  
  // -- State --
  const [step, setStep] = useState(0);
  const [selectedPillarId, setSelectedPillarId] = useState<ProjectType | null>(null);
  
  // Dynamic Answers
  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  // Specific Fields
  const [projectName, setProjectName] = useState("");
  const [projectVision, setProjectVision] = useState("");
  
  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [error, setError] = useState("");

  // Refs for auto-focus
  const visionRef = useRef<HTMLTextAreaElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // -- Hooks --
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signup");
    }
  }, [user, authLoading, router]);

  // Auto-focus logic
  useEffect(() => {
    if (step === 2 && nameRef.current) setTimeout(() => nameRef.current?.focus(), 400);
    if (step === 3 && visionRef.current) setTimeout(() => visionRef.current?.focus(), 400);
  }, [step]);

  // -- Derived --
  const selectedPillar = PILLARS.find(p => p.id === selectedPillarId);
  
  // Filter core questions based on pillar
  const coreQuestions = selectedPillar?.questions || [];

  // -- Handlers --

  const handlePillarSelect = (id: ProjectType) => {
    setSelectedPillarId(id);
    setStep(1);
    // Reset answers when switching pillars
    setAnswers({});
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = async () => {
    setError("");

    // Validation
    if (step === 1) {
        // Check if all core questions are answered
        const allAnswered = coreQuestions.every(q => answers[q.id]);
        if (!allAnswered) {
            setError("لطفاً همه گزینه‌ها را انتخاب کنید.");
            return;
        }
    }
    if (step === 2 && !projectName.trim()) {
        setError("انتخاب نام پروژه الزامی است.");
        return;
    }
    if (step === 3 && !projectVision.trim()) {
        setError("توضیح ایده الزامی است.");
        return;
    }

    if (step === 3) {
        await handleGenerate();
    } else {
        setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError("");
    if (step > 0) setStep(prev => prev - 1);
  };

  const handleGenerate = async () => {
    if (!user || !selectedPillarId) return;
    
    setIsGenerating(true);
    
    try {
        const res = await fetch("/api/generate-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                projectType: selectedPillarId,
                idea: projectVision,
                projectName: projectName,
                genesisAnswers: answers,
                // Defaults for now, can be added to steps later if needed
                audience: "General", 
                budget: "Not specified" 
            }),
        });

        if (!res.ok) throw new Error("Failed to generate plan");

        const data = await res.json();
        
        // Create the project directly
        const completePlan = {
            ...data,
            projectName,
            projectType: selectedPillarId,
            ideaInput: projectVision,
            genesisAnswers: answers,
        };

        await createNewProject(completePlan);
        router.push("/dashboard");

    } catch (err) {
        console.error("Failed to generate", err);
        setError("خطا در تولید استراتژی. لطفاً دوباره تلاش کنید.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleContinueToDashboard = async () => {
     if (generatedPlan) {
        setIsCreatingProject(true);
        // Call actual context
        try {
            await createNewProject({
                ...generatedPlan,
                projectType: selectedPillarId,
                ideaInput: projectVision
            });
            router.push("/dashboard/overview");
        } catch(e) {
            console.error(e);
            setIsCreatingProject(false);
            setError("خطا در ساخت پروژه.");
        }
     }
  };

  // -- Render Helpers --
  
  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  if (showSnapshot && generatedPlan) {
      return <StrategySnapshot plan={generatedPlan} onContinue={handleContinueToDashboard} />;
  }

  if (isGenerating || isCreatingProject) {
      return (
        <div className="h-screen w-full bg-background flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-hero opacity-50" />
            <GenerationLoader 
                isLoading={true} 
                title={isCreatingProject ? "در حال ساخت امپراطوری شما..." : "هوش مصنوعی در حال طراحی استراتژی..."} 
            />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 font-sans overflow-x-hidden" dir="rtl">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-glow" />
         <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-secondary/15 rounded-full blur-[120px] mix-blend-screen animate-pulse-glow" style={{ animationDelay: '1s' }} />
         <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
      </div>

      {/* Header */}
      <header className="relative z-50 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
         <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 group-hover:scale-105 transition-transform">
                <Image 
                    src="/logo.png" 
                    alt="Karnex Logo" 
                    fill 
                    className="object-contain"
                />
            </div>
            <span className="font-bold text-xl tracking-tight">کارنکس</span>
         </Link>

         <div className="flex items-center gap-4">
             {step === 0 && (
                <Link href="/">
                    <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                        <ArrowRight className="w-5 h-5 ml-2" />
                        بازگشت
                    </Button>
                </Link>
             )}
             {step > 0 && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    {GENESIS_STEPS.map((s, i) => (
                        <div key={s.number} className="flex items-center">
                            <div className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                step >= s.number ? "bg-primary scale-125" : "bg-white/20"
                            )} />
                            {i < GENESIS_STEPS.length - 1 && (
                                <div className="w-8 h-[1px] mx-2 bg-white/10" />
                            )}
                        </div>
                    ))}
                </div>
             )}
         </div>
      </header>

      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col min-h-[calc(100vh-100px)]">
         <AnimatePresence mode="wait">
            
            {/* Step 0: The Pillar */}
            {step === 0 && (
                <motion.div 
                    key="step0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 flex flex-col justify-center"
                >
                    <div className="text-center mb-16 space-y-4">
                         <h1 className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                            مسیر خود را انتخاب کنید
                         </h1>
                         <p className="text-xl text-white/60 max-w-2xl mx-auto">
                            یکی از مسیرهای زیر را انتخاب کنید. هوش مصنوعی کارنکس تمام داشبورد و ابزارها را بر اساس سفر شما شخصی‌سازی می‌کند.
                         </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {PILLARS.map((pillar) => (
                            <button
                                key={pillar.id}
                                onClick={() => handlePillarSelect(pillar.id as ProjectType)}
                                className="group relative h-[420px] rounded-3xl overflow-hidden text-right transition-all duration-500 hover:scale-[1.02]"
                            >
                                {/* Card Background */}
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-b opacity-10 group-hover:opacity-20 transition-opacity duration-500",
                                    pillar.gradient
                                )} />
                                <div className="absolute inset-0 backdrop-blur-[2px] bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors" />
                                
                                {/* Content */}
                                <div className="relative h-full flex flex-col p-8 z-20">
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br mb-8 shadow-2xl",
                                        pillar.color
                                    )}>
                                        <pillar.icon className="w-8 h-8 text-white" />
                                    </div>
                                    
                                    <h3 className="text-3xl font-bold text-white mb-2">{pillar.title}</h3>
                                    <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white/80 mb-6 w-fit">
                                        {pillar.subtitle}
                                    </div>
                                    
                                    <p className="text-white/60 leading-relaxed">
                                        {pillar.description}
                                    </p>

                                    <div className="mt-auto flex items-center text-primary font-bold opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                        <span>شروع مسیر</span>
                                        <ArrowLeft className="mr-2 w-5 h-5" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Step 1: The Core (Divergent) */}
            {step === 1 && selectedPillar && (
                <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full"
                >
                    <div className="mb-12">
                        <div className="flex items-center gap-3 text-primary mb-4">
                            <selectedPillar.icon className="w-6 h-6" />
                            <span className="font-bold">پیکربندی {selectedPillar.title}</span>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4">بیایید فضای کار شما را تنظیم کنیم.</h2>
                        <p className="text-white/60 text-lg">
                            پاسخ به این سوالات به ما کمک می‌کند تا ابزارهای مناسب را برای روز اول بارگذاری کنیم.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {coreQuestions.map((q, idx) => (
                            <div key={q.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                <h3 className="text-xl font-semibold text-white mb-4">{q.question}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {q.options.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleAnswer(q.id, opt.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-300",
                                                answers[q.id] === opt.id
                                                    ? "bg-primary/20 border-primary shadow-[0_0_30px_rgba(236,72,153,0.2)]"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                            )}
                                        >
                                            <opt.icon className={cn(
                                                "w-8 h-8 mb-2",
                                                answers[q.id] === opt.id ? "text-primary" : "text-white/50"
                                            )} />
                                            <span className={cn(
                                                "font-medium",
                                                answers[q.id] === opt.id ? "text-white" : "text-white/70"
                                            )}>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 flex items-center justify-between">
                        <Button 
                            variant="ghost" 
                            onClick={handleBack} 
                            className="text-white/60 hover:text-white hover:bg-white/5 text-lg h-14 px-6 rounded-xl transition-all"
                        >
                            <ArrowRight className="ml-2 w-5 h-5" />
                            بازگشت
                        </Button>
                        <Button 
                            onClick={handleNext}
                            size="lg" 
                            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6 rounded-xl h-auto font-bold shadow-2xl shadow-white/10"
                        >
                            ادامه <ChevronRight className="mr-2 w-5 h-5 rtl:rotate-180" />
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Step 2: The Identity */}
            {step === 2 && (
                <motion.div
                    key="step2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full text-center"
                >
                     <div className="mb-8">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-6 shadow-glow">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-2">نام‌گذاری پروژه</h2>
                        <p className="text-white/60">هر میراث بزرگی با یک نام شروع می‌شود.</p>
                     </div>

                     <div className="relative group">
                         <Input
                            ref={nameRef}
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="نام پروژه..."
                            className="text-4xl md:text-6xl font-black text-center h-32 bg-transparent border-b-2 border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 placeholder:text-white/10 transition-colors"
                         />
                         <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                     </div>

                     <div className="mt-12 flex items-center justify-between">
                        <Button 
                            variant="ghost" 
                            onClick={handleBack} 
                            className="text-white/60 hover:text-white hover:bg-white/5 text-lg h-14 px-6 rounded-xl transition-all"
                        >
                             <ArrowRight className="ml-2 w-5 h-5" />
                             بازگشت
                        </Button>
                        <Button 
                            onClick={handleNext}
                            disabled={!projectName.trim()}
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl h-auto text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                             مرحله بعد
                             <ChevronRight className="mr-2 w-5 h-5 rtl:rotate-180" />
                        </Button>
                     </div>
                </motion.div>
            )}

            {/* Step 3: The Vision */}
            {step === 3 && (
                <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full"
                >
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">چشم‌انداز خود را شرح دهید</h2>
                    
                    <div className="w-full relative bg-white/5 border border-white/10 rounded-3xl p-2 backdrop-blur-xl">
                        <Textarea 
                            ref={visionRef}
                            value={projectVision}
                            onChange={(e) => setProjectVision(e.target.value)}
                            placeholder="من می‌خواهم پلتفرمی بسازم که..."
                            className="min-h-[250px] bg-transparent border-none focus-visible:ring-0 text-xl leading-relaxed resize-none p-6 text-white placeholder:text-white/20"
                        />
                        
                        <div className="absolute bottom-4 left-4 flex gap-2">
                             <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 text-xs text-white/40 flex items-center gap-2">
                                <Zap className="w-3 h-3 text-yellow-500" />
                                هوش مصنوعی گوش می‌دهد
                             </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between w-full px-2">
                         <Button 
                            variant="ghost" 
                            onClick={handleBack} 
                            className="text-white/60 hover:text-white hover:bg-white/5 text-lg h-14 px-6 rounded-xl transition-all"
                         >
                             <ArrowRight className="ml-2 w-5 h-5" />
                             بازگشت
                         </Button>
                         <Button
                            onClick={handleNext}
                            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-10 py-6 rounded-xl h-auto text-lg font-bold shadow-[0_0_40px_rgba(236,72,153,0.4)] animate-pulse-glow"
                         >
                            <Sparkles className="w-5 h-5 mr-2" />
                             تولید استراتژی
                         </Button>
                    </div>
                </motion.div>
            )}

             {/* Step 4: Review (The Blueprint) - Optional - We skip directly to Generate for speed as per "Hybrid" plan */}
         </AnimatePresence>

         {/* Error Toast */}
         {error && (
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/50 text-red-500 px-6 py-3 rounded-xl backdrop-blur-md"
             >
                {error}
             </motion.div>
         )}
      </main>
    </div>
  );
}
