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
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { History } from "lucide-react";

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
  const [showLimitModal, setShowLimitModal] = useState(false);

  // -- Draft Recovery State --
  const [draftChecked, setDraftChecked] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [draftData, setDraftData] = useState<any>(null);

  // -- Hooks --
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signup");
    }
  }, [user, authLoading, router]);

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem("karnex_project_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedPillarId || parsed.projectName || parsed.projectVision || Object.keys(parsed.answers || {}).length > 0) {
          setDraftData(parsed);
          setShowResumeModal(true);
        } else {
          setDraftChecked(true);
        }
      } catch (e) {
        console.error("Failed to parse saved draft", e);
        setDraftChecked(true);
      }
    } else {
      setDraftChecked(true);
    }
  }, []);

  // Save draft on changes
  useEffect(() => {
    if (!draftChecked) return;
    const draft = {
      selectedPillarId,
      projectName,
      projectVision,
      answers,
      step
    };
    if (selectedPillarId || projectName || projectVision || Object.keys(answers).length > 0 || step > 0) {
      localStorage.setItem("karnex_project_draft", JSON.stringify(draft));
    } else {
      localStorage.removeItem("karnex_project_draft");
    }
  }, [selectedPillarId, projectName, projectVision, answers, step, draftChecked]);

  // -- Handlers --
  const handleRestoreDraft = () => {
    if (draftData) {
      setSelectedPillarId(draftData.selectedPillarId);
      setProjectName(draftData.projectName || "");
      setProjectVision(draftData.projectVision || "");
      setAnswers(draftData.answers || {});
      setStep(draftData.step || 0);
    }
    setShowResumeModal(false);
    setDraftChecked(true);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem("karnex_project_draft");
    setShowResumeModal(false);
    setDraftChecked(true);
  };

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
    
    try {
        const { generatePlanAction } = await import("@/lib/project-actions");
        
        const result = await generatePlanAction({
            projectType: selectedPillarId,
            idea: projectVision,
            projectName: projectName,
            genesisAnswers: answers,
            audience: "General", 
            budget: "Not specified" 
        });

        if (result.error) {
            throw new Error(result.error);
        }

        const data = result.plan;
        console.log("✅ AI plan received, preparing to save...");
        
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

        // Create project with a safety timeout
        console.log("🏗️ Creating project in Supabase...");
        const createPromise = createNewProject(completePlan);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Project creation timed out")), 30000)
        );
        
        await Promise.race([createPromise, timeoutPromise]);
        console.log("✅ Project created, redirecting to dashboard");
        localStorage.removeItem("karnex_project_draft");
        router.push("/dashboard");

    } catch (err: any) {
        console.error("❌ Failed to generate/create project:", err);
        console.log("DEBUG: Error message:", err.message); // Added debug log
        if (err.message?.includes("AI_LIMIT_REACHED") || err.message?.includes("Limit reached")) {
             setShowLimitModal(true);
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

         <LimitReachedModal 
            isOpen={showLimitModal} 
            onClose={() => setShowLimitModal(false)} 
         />

         <Dialog open={showResumeModal} onOpenChange={(open) => { if (!open) handleDiscardDraft(); }}>
            <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl" dir="rtl">
              <DialogHeader className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <History className="w-8 h-8 text-primary" />
                </div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  بازیابی پیش‌نویس قبلی
                </DialogTitle>
                <DialogDescription className="text-center text-muted-foreground leading-relaxed">
                  پیش‌نویس تکمیل‌نشده‌ای از مراحل ثبت پروژه قبلی شما پیدا شد. آیا مایلید آن را بازیابی کنید؟
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6 w-full">
                <Button 
                  onClick={handleRestoreDraft}
                  className="w-full sm:w-auto flex-1 gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/20"
                >
                  بله، بازیابی کن
                </Button>
                <Button variant="outline" onClick={handleDiscardDraft} className="w-full sm:w-auto">
                  خیر، شروع مجدد
                </Button>
              </DialogFooter>
            </DialogContent>
         </Dialog>
      </main>
    </div>
  );
}

