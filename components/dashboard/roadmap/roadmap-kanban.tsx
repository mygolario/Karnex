"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoadmapStepObject, RoadmapPhase } from "@/hooks/use-roadmap";

interface RoadmapKanbanProps {
  phase: RoadmapPhase | undefined;
  completedSteps: string[];
  onToggleStep: (step: string | RoadmapStepObject) => void;
  getStepTitle: (step: string | RoadmapStepObject) => string;
}

export function RoadmapKanban({
  phase,
  completedSteps,
  onToggleStep,
  getStepTitle,
}: RoadmapKanbanProps) {
  if (!phase) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        فازی برای نمایش وجود ندارد.
      </div>
    );
  }

  const steps = phase.steps;
  
  // Logic: 
  // Done = in filtered completed list
  // In Progress = First uncompleted step
  // To Do = Rest of uncompleted steps
  
  const doneSteps = steps.filter(s => completedSteps.includes(getStepTitle(s)));
  const uncompletedSteps = steps.filter(s => !completedSteps.includes(getStepTitle(s)));
  
  const inProgressStep = uncompletedSteps.length > 0 ? uncompletedSteps[0] : null;
  const todoSteps = uncompletedSteps.length > 0 ? uncompletedSteps.slice(1) : [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[500px]">
      {/* Todo Column */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-muted-foreground text-sm flex items-center gap-2">
            <Circle size={14} /> آینده
          </h3>
          <Badge variant="secondary" className="text-xs">{todoSteps.length}</Badge>
        </div>
        
        <div className="bg-muted/30 rounded-2xl p-4 h-full border-2 border-dashed border-muted/50">
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {todoSteps.map((step, idx) => (
              <motion.div variants={item} key={getStepTitle(step)}>
                <div className="bg-card p-4 rounded-xl border shadow-sm opacity-70 hover:opacity-100 transition-opacity">
                   <h4 className="font-medium text-sm">{getStepTitle(step)}</h4>
                   {typeof step !== 'string' && step.description && (
                     <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{step.description}</p>
                   )}
                </div>
              </motion.div>
            ))}
            {todoSteps.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground">
                موردی در انتظار نیست
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* In Progress Column (Highlighted) */}
      <div className="flex flex-col gap-4">
         <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-primary text-sm flex items-center gap-2">
            <Clock size={14} className="animate-pulse" /> در حال انجام
          </h3>
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 text-xs">
            {inProgressStep ? 1 : 0}
          </Badge>
        </div>
        
        <div className="bg-gradient-to-b from-primary/5 to-transparent rounded-2xl p-4 h-full border border-primary/20 relative overflow-hidden">
          {inProgressStep ? (
             <div className="relative z-10">
               <div className="bg-card p-6 rounded-xl border-2 border-primary shadow-lg shadow-primary/10">
                 <div className="mb-4">
                   <Badge variant="outline" className="mb-2 text-[10px] border-primary/30 text-primary">
                     تسک فعلی شما
                   </Badge>
                   <h2 className="text-xl font-black">{getStepTitle(inProgressStep)}</h2>
                 </div>
                 
                 {typeof inProgressStep !== 'string' && inProgressStep.description && (
                   <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                     {inProgressStep.description}
                   </p>
                 )}

                 <Button 
                   onClick={() => onToggleStep(inProgressStep)} 
                   className="w-full gap-2 shadow-lg shadow-primary/20 mb-3" 
                   size="lg"
                   variant="gradient"
                 >
                   <CheckCircle2 size={18} />
                   تکمیل تسک
                 </Button>
               </div>
               
               <div className="mt-8 text-center text-sm text-muted-foreground px-4">
                 <p>روی این تسک تمرکز کنید. پس از تکمیل، تسک بعدی از لیست "آینده" به اینجا منتقل می‌شود.</p>
               </div>
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-muted-foreground/50" />
              </div>
              <p>هیچ تسک فعالی وجود ندارد.</p>
            </div>
          )}
        </div>
      </div>

      {/* Done Column */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-emerald-600 text-sm flex items-center gap-2">
            <CheckCircle2 size={14} /> تکمیل شده
          </h3>
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs">
            {doneSteps.length}
          </Badge>
        </div>
        
        <div className="bg-emerald-500/5 rounded-2xl p-4 h-full border border-emerald-500/10">
          <div className="space-y-3">
            {doneSteps.map((step, idx) => (
              <div key={getStepTitle(step)} className="bg-card/50 p-3 rounded-xl border border-emerald-500/10 group hover:bg-card transition-colors">
                 <div className="flex items-start gap-3">
                   <CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" />
                   <div>
                     <h4 className="font-medium text-sm text-muted-foreground line-through decoration-emerald-500/50">
                       {getStepTitle(step)}
                     </h4>
                     <button 
                       onClick={() => onToggleStep(step)}
                       className="text-[10px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1 hover:underline"
                     >
                       بازگردانی به انجام نشده
                     </button>
                   </div>
                 </div>
              </div>
            ))}
            {doneSteps.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground">
                هنوز موردی تکمیل نشده است
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
