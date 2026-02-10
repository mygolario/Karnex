"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { GenerationLoader } from "@/components/shared/generation-loader";
import { StrategySnapshot } from "@/components/shared/strategy-snapshot";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectTypeSelection } from "@/components/features/new-project/project-type-selection";
import { ProjectDetailsForm } from "@/components/features/new-project/project-details-form";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { ProjectType } from "./genesis-constants";

export default function NewProjectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { createNewProject } = useProject();
  
  // -- State --
  const [step, setStep] = useState(0); // 0: Selection, 1: Details
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

  // -- Hooks --
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signup");
    }
  }, [user, authLoading, router]);

  // -- Handlers --

  const handlePillarSelect = (id: ProjectType) => {
    setSelectedPillarId(id);
    setAnswers({}); // Reset answers
    setStep(1); // Move to Details
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleBack = () => {
    setError("");
    if (step === 1) {
        setStep(0);
        setSelectedPillarId(null);
    } else {
        router.push("/");
    }
  };

  const handleGenerate = async () => {
    if (!user || !selectedPillarId) return;
    
    setIsGenerating(true);
    setError("");
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
        const res = await fetch("/api/generate-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                projectType: selectedPillarId,
                idea: projectVision,
                projectName: projectName,
                genesisAnswers: answers,
                audience: "General", 
                budget: "Not specified" 
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to generate plan");
        }

        const data = await res.json();
        
        // Use generated plan
        const completePlan = {
            ...data,
            projectName,
            projectType: selectedPillarId,
            ideaInput: projectVision,
            genesisAnswers: answers,
        };

        // Switch to "Building Empire" state
        setIsGenerating(false);
        setIsCreatingProject(true);

        // Directly create project and redirect
        await createNewProject(completePlan);
        router.push("/dashboard");

    } catch (err: any) {
        console.error("Failed to generate", err);
        if (err.name === 'AbortError') {
            setError("زمان انتظار به پایان رسید. لطفاً دوباره تلاش کنید.");
        } else {
            setError(err.message || "خطا در تولید استراتژی. لطفاً دوباره تلاش کنید.");
        }
        setIsGenerating(false);
        setIsCreatingProject(false); 
    }
  };

  // -- Render Helpers --
  
  if (authLoading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  if (isGenerating || isCreatingProject) {
      return (
        <div className="h-screen w-full bg-background flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50" />
            <GenerationLoader 
                isLoading={true} 
                title={isCreatingProject ? "در حال ساخت امپراطوری شما..." : "کارنکس در حال طراحی استراتژی..."} 
            />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 font-sans overflow-x-hidden" dir="rtl">
      {/* Background Ambience - Simplified and Premium */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] mix-blend-screen" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen" />
         <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]" />
      </div>

      {/* Header */}
      <header className="relative z-50 p-6 md:p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
         <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
                <Image 
                    src="/logo.png" 
                    alt="Karnex Logo" 
                    fill 
                    className="object-contain"
                />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">کارنکس</span>
         </Link>

         {step === 0 && (
            <Link href="/">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    <ArrowRight className="w-4 h-4 ml-2" />
                    بازگشت
                </Button>
            </Link>
         )}
      </header>

      <main className="relative z-10 w-full mx-auto pb-12 flex flex-col min-h-[calc(100vh-100px)]">
         {/* Error Toast */}
         {error && (
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-destructive/10 border border-destructive/50 text-destructive px-6 py-3 rounded-xl backdrop-blur-md z-50 font-medium"
             >
                {error}
             </motion.div>
         )}

         <AnimatePresence mode="wait">
            
            {/* Step 0: Selection */}
            {step === 0 && (
                <motion.div 
                    key="step0"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                    transition={{ duration: 0.4 }}
                    className="flex-1 flex flex-col justify-center"
                >
                    <ProjectTypeSelection 
                        selectedId={selectedPillarId}
                        onSelect={handlePillarSelect}
                    />
                </motion.div>
            )}

            {/* Step 1: Details */}
            {step === 1 && selectedPillarId && (
                <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex-1 pt-10"
                >
                    <ProjectDetailsForm 
                        selectedType={selectedPillarId}
                        projectName={projectName}
                        projectVision={projectVision}
                        answers={answers}
                        onNameChange={setProjectName}
                        onVisionChange={setProjectVision}
                        onAnswerChange={handleAnswer}
                        onSubmit={handleGenerate}
                        onBack={handleBack}
                        isGenerating={isGenerating}
                    />
                </motion.div>
            )}

         </AnimatePresence>
      </main>
    </div>
  );
}

