"use client";

import { motion } from "framer-motion";
import { Flag, CheckCircle2, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { RoadmapPhase, RoadmapStepObject } from "@/hooks/use-roadmap";

interface RoadmapTimelineProps {
  roadmap: RoadmapPhase[];
  completedSteps: string[];
  activeWeek: number;
  onToggleStep: (step: string | RoadmapStepObject) => void;
  getStepTitle: (step: string | RoadmapStepObject) => string;
}

export function RoadmapTimeline({
  roadmap,
  completedSteps,
  activeWeek,
  onToggleStep,
  getStepTitle,
}: RoadmapTimelineProps) {
  return (
    <div className="relative py-8 overflow-x-auto pb-12 px-4">
      {/* Timeline Line */}
      <div className="absolute top-[4.5rem] left-0 md:left-4 right-0 md:right-4 h-1 bg-gradient-to-r from-primary/80 via-primary/50 to-muted z-0 rounded-full opacity-30" />

      <div className="flex gap-12 relative z-10 w-max mx-auto md:mx-0">
        {roadmap.map((phase, idx) => {
          const weekNum = phase.weekNumber || idx + 1;
          const isPast = weekNum < activeWeek;
          const isCurrent = weekNum === activeWeek;
          const isFuture = weekNum > activeWeek;
          
          const allCompleted = phase.steps.every(s => completedSteps.includes(getStepTitle(s)));

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "w-72 flex-shrink-0 flex flex-col gap-4",
                isFuture && "opacity-60 grayscale"
              )}
            >
              {/* Header Marker */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-12 h-12 rounded-full border-4 flex items-center justify-center bg-card shadow-lg relative transition-all duration-300",
                  allCompleted ? "border-emerald-500 text-emerald-600" :
                  isCurrent ? "border-primary text-primary scale-110" :
                  "border-muted text-muted-foreground"
                )}>
                  {allCompleted ? <CheckCircle2 size={24} /> : 
                   isFuture ? <Lock size={18} /> : 
                   <span className="font-bold text-lg">{weekNum}</span>}
                  
                  {isCurrent && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                  )}
                </div>
                
                <div className="text-center mt-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    فاز {weekNum}
                  </span>
                  <h3 className="font-bold text-foreground mt-1 text-lg">{phase.phase}</h3>
                  {phase.theme && (
                     <span className="inline-block px-2 py-0.5 rounded-full bg-secondary text-[10px] text-secondary-foreground mt-1">
                       {phase.theme}
                     </span>
                  )}
                </div>
              </div>

              {/* Steps List */}
              <div className={cn(
                "bg-card border rounded-2xl p-4 space-y-2 shadow-sm",
                isCurrent && "ring-2 ring-primary/20 shadow-primary/5"
              )}>
                {phase.steps.map((step, sIdx) => {
                  const title = getStepTitle(step);
                  const isDone = completedSteps.includes(title);
                  
                  return (
                    <div 
                      key={sIdx}
                      onClick={() => !isFuture && onToggleStep(step)}
                      className={cn(
                        "flex items-start gap-3 p-2 rounded-lg transition-colors text-sm",
                        isFuture ? "cursor-not-allowed" : "cursor-pointer hover:bg-muted/50",
                        isDone && "text-muted-foreground"
                      )}
                    >
                      <div className="mt-0.5 shrink-0">
                         {isDone ? (
                           <CheckCircle2 size={16} className="text-emerald-500" />
                         ) : (
                           <Circle size={16} className="text-muted-foreground" />
                         )}
                      </div>
                      <span className={cn(isDone && "line-through")}>
                        {title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
