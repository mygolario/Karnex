"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  Circle, 
  Lock, 
  MapPin, 
  Flag, 
  Star,
  ChevronRight,
  Trophy
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RoadmapPhase, RoadmapStepObject } from "@/hooks/use-roadmap";

interface RoadmapJourneyProps {
  roadmap: RoadmapPhase[];
  completedSteps: string[];
  onToggleStep: (step: string | RoadmapStepObject) => void;
  onOpenStepDetail: (step: string | RoadmapStepObject, phase?: RoadmapPhase) => void;
  getStepTitle: (step: string | RoadmapStepObject) => string;
}

export function RoadmapJourney({
  roadmap,
  completedSteps,
  onToggleStep,
  onOpenStepDetail,
  getStepTitle,
}: RoadmapJourneyProps) {
  
  // Helper to determine step state
  const getStepState = (step: string | RoadmapStepObject, index: number, allSteps: (string | RoadmapStepObject)[]) => {
    const title = getStepTitle(step);
    const isCompleted = completedSteps.includes(title);
    
    // Check if previous step is completed (to unlock current)
    // For the very first step of the very first phase, it's always unlocked
    // We need to flatten roadmap to check global index, or just check if this step is completed
    // Simply: if completed -> done. If not completed but previous is -> current. Else -> locked.
    
    if (isCompleted) return "completed";
    
    // Find absolute index of this step in the entire roadmap
    let flatIndex = 0;
    let found = false;
    for (const phase of roadmap) {
       for (const s of phase.steps) {
          if (getStepTitle(s) === title) {
             found = true;
             break;
          }
          flatIndex++;
       }
       if (found) break;
    }

    // Determine if unlocked
    // If it's the first step overall, it's unlocked (current)
    if (flatIndex === 0) return "current";

    // Check if the step immediately preceding this one is completed
    // We need to find the step at flatIndex - 1
    let seekIndex = 0;
    let prevStepTitle = "";
    for (const phase of roadmap) {
       for (const s of phase.steps) {
          if (seekIndex === flatIndex - 1) {
             prevStepTitle = getStepTitle(s);
          }
          seekIndex++;
       }
    }
    
    if (completedSteps.includes(prevStepTitle)) return "current";
    
    return "locked";
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto py-12 px-4">
      {/* Central Path Line (The "Journey") */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 -translate-x-1/2 hidden md:block" />
      
      {/* Mobile Path Line */}
      <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 md:hidden" />

      {/* Start Point */}
      <div className="relative z-10 flex justify-center mb-16 md:mb-24">
         <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold shadow-lg shadow-primary/20 flex items-center gap-2 border-4 border-background"
         >
            <Flag size={20} className="fill-current" />
            <span>شروع سفر</span>
         </motion.div>
      </div>

      <div className="space-y-24">
        {roadmap.map((phase, phaseIndex) => (
          <div key={phaseIndex} className="relative">
            
            {/* Phase Marker */}
            <div className="sticky top-24 z-20 flex justify-center mb-12 pointer-events-none">
                <span className="bg-background/80 backdrop-blur border border-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                   فصل {phaseIndex + 1}: {phase.phase}
                </span>
            </div>

            <div className="space-y-12">
               {phase.steps.map((step, stepIndex) => {
                  const title = getStepTitle(step);
                  const state = getStepState(step, stepIndex, phase.steps); // Note: localized index, but logic handles global
                  const isLeft = stepIndex % 2 === 0;

                  return (
                     <motion.div
                        key={title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className={cn(
                           "relative flex items-center md:gap-12",
                           // Mobile: always left aligned content (timeline on left)
                           "md:flex-row flex-col-reverse items-start md:items-center pl-16 md:pl-0"
                        )}
                     >
                        {/* Desktop: Alternating Layout */}
                        {/* Left Side Content (for Left items) */}
                        <div className={cn(
                           "hidden md:block flex-1 text-left pr-8",
                           !isLeft && "order-3 pl-8 text-right pr-0" // Swap for Right items
                        )}>
                           {isLeft ? (
                              <StepCard 
                                 step={step} 
                                 state={state} 
                                 onClick={() => onOpenStepDetail(step, phase)}
                              />
                           ) : (
                               <div className="opacity-50 text-sm font-mono text-muted-foreground dir-ltr">
                                 گام ماموریت شماره {stepIndex + 1 + (phaseIndex * 5)} 
                               </div>
                           )}
                        </div>

                        {/* Center Node (The Milestone) */}
                        <div className={cn(
                           "absolute md:static left-5 md:left-auto md:order-2 flex-shrink-0 z-10 w-6 h-6 rounded-full border-4 border-background shadow-sm transition-all duration-500",
                           state === "completed" ? "bg-emerald-500 scale-125 shadow-emerald-500/30" :
                           state === "current" ? "bg-blue-500 scale-150 animate-pulse shadow-blue-500/30" :
                           "bg-muted-foreground/30 scale-100"
                        )}>
                           {state === "completed" && <CheckCircle2 size={14} className="text-white absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 animate-in fade-in slide-in-from-bottom-2" />}
                        </div>

                        {/* Right Side Content (for Left items, empty/meta) */}
                         <div className={cn(
                           "hidden md:block flex-1 pl-8",
                           !isLeft && "order-1 pr-8 pl-0 text-left" // Swap for Right items
                        )}>
                           {isLeft ? (
                              <div className="opacity-50 text-sm font-mono text-muted-foreground">
                                 گام ماموریت شماره {stepIndex + 1 + (phaseIndex * 5)}
                              </div>
                           ) : (
                              <StepCard 
                                 step={step} 
                                 state={state} 
                                 onClick={() => onOpenStepDetail(step, phase)}
                              />
                           )}
                        </div>

                        {/* Mobile Content (Always visible) */}
                        <div className="md:hidden w-full">
                           <StepCard 
                                 step={step} 
                                 state={state} 
                                 onClick={() => onOpenStepDetail(step, phase)}
                              />
                        </div>

                     </motion.div>
                  );
               })}
            </div>
          </div>
        ))}
      </div>

      {/* Final Trophy */}
      <div className="relative z-10 flex justify-center mt-24">
         <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
             viewport={{ once: true }}
            className="bg-gradient-to-br from-yellow-400 to-amber-600 text-white p-6 rounded-full shadow-2xl shadow-amber-500/40 border-8 border-background relative"
         >
            <Trophy size={48} className="fill-current" />
            <div className="absolute inset-0 bg-white/30 blur-xl rounded-full animate-pulse" />
         </motion.div>
      </div>
      <div className="text-center mt-6">
         <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-600">
            پیروزی نهایی
         </h3>
         <p className="text-muted-foreground mt-2">مقصد نهایی سفر کارآفرینی شما</p>
      </div>

    </div>
  );
}

function StepCard({ 
   step, 
   state,
   onClick
}: { 
   step: string | RoadmapStepObject; 
   state: "locked" | "current" | "completed";
   onClick: () => void;
}) {
   const title = typeof step === 'string' ? step : step.title;
   const desc = typeof step !== 'string' ? step.description : null;
   const category = typeof step !== 'string' ? step.category : null;

   return (
      <Card 
         onClick={onClick}
         className={cn(
            "p-5 cursor-pointer transition-all duration-300 group border-l-4 overflow-hidden relative",
            state === "locked" && "opacity-60 bg-muted/50 border-l-muted hover:opacity-80",
            state === "current" && "bg-gradient-to-br from-card to-blue-500/5 border-l-blue-500 shadow-lg shadow-blue-500/5 hover:-translate-y-1 hover:shadow-xl",
            state === "completed" && "bg-gradient-to-br from-emerald-50 to-emerald-100/20 border-l-emerald-500 grayscale-[0.3] hover:grayscale-0 dark:from-emerald-950/20 dark:to-emerald-900/10"
         )}
      >
         {/* Background Decoration */}
         {state === "current" && (
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
         )}

         <div className="flex justify-between items-start gap-3 relative z-10">
            <div>
               <div className="flex items-center gap-2 mb-2">
                  {category && (
                     <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                        {category}
                     </Badge>
                  )}
                  {state === "current" && (
                     <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-[10px] h-5 border-0">
                        در حال انجام
                     </Badge>
                  )}
                  {state === "completed" && (
                     <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-[10px] h-5 border-0">
                        تکمیل شده
                     </Badge>
                  )}
               </div>
               
               <h4 className={cn(
                  "font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors",
                  state === "completed" && "line-through text-muted-foreground decoration-emerald-500/50"
               )}>
                  {title}
               </h4>
               
               {desc && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                     {desc}
                  </p>
               )}
            </div>
            
            <div className={cn(
               "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
               state === "locked" ? "bg-muted text-muted-foreground" :
               state === "completed" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40" :
               "bg-blue-100 text-blue-600 dark:bg-blue-900/40 group-hover:bg-blue-600 group-hover:text-white"
            )}>
               {state === "locked" ? <Lock size={14} /> : 
                state === "completed" ? <CheckCircle2 size={16} /> :
                <ChevronRight size={18} className="rtl:rotate-180" />}
            </div>
         </div>
      </Card>
   );
}
