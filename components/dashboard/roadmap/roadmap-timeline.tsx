"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, MapPin, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { RoadmapPhase, RoadmapStepObject } from "@/hooks/use-roadmap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <div className="relative max-w-3xl mx-auto py-12 px-4" data-tour-id="timeline-view">
      
      {/* Central Line */}
      <div className="absolute top-0 bottom-0 right-[28px] md:right-1/2 w-0.5 bg-gradient-to-b from-primary/10 via-primary/40 to-primary/10 border-l border-dashed border-primary/30" />

      <div className="space-y-16">
        {roadmap.map((phase, idx) => {
          const weekNum = phase.weekNumber || idx + 1;
          const isPast = weekNum < activeWeek;
          const isCurrent = weekNum === activeWeek;
          
          const completedCount = phase.steps.filter(s => completedSteps.includes(getStepTitle(s))).length;
          const totalCount = phase.steps.length;
          const percent = Math.round((completedCount / totalCount) * 100);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={cn(
                "relative flex flex-col md:flex-row gap-8 items-start md:items-center",
                // Alternating layout for desktop could be added here, but keeping it simple aligned for clear reading
              )}
            >
               {/* 1. Milestone Marker (Center) */}
               <div className="absolute right-0 md:right-1/2 translate-x-1/2 z-10 flex items-center justify-center">
                  <div className={cn(
                    "w-14 h-14 rounded-full border-4 flex items-center justify-center bg-background shadow-xl transition-all",
                    percent === 100 ? "border-emerald-500 text-emerald-600" :
                    isCurrent ? "border-primary text-primary scale-110 shadow-primary/20" :
                    "border-muted text-muted-foreground"
                  )}>
                     {percent === 100 ? <CheckCircle2 size={28} /> : 
                      isCurrent ? <MapPin size={24} className="animate-bounce" /> :
                      <span className="font-bold text-lg">{weekNum}</span>}
                  </div>
               </div>

               {/* 2. Content Card */}
               <div className={cn(
                 "w-full md:w-[45%] mr-16 md:mr-auto", // Push content away from marker
                 // For alternating layout, we'd swap ml/mr based on index.
                 // Let's stick to Right-Aligned content for mobile, Alternating for Desktop? 
                 // Actually, simpler is better: All text on LEFT of line for English, RIGHT for Persian.
                 // Since it's RTL, let's put content on the LEFT of the line (which is visually 'start' in RTL?)
                 // Wait, standard RTL means Right is start. So line is in center. Content should alternate or be on one side.
                 // Let's put content fully to the LEFT of the line for specific phases?
                 // Let's just make cards full width with Padding Right for the line on Mobile, 
                 // and standard alternating on Desktop.
                 idx % 2 === 0 ? "md:mr-[55%] md:ml-0" : "md:mr-0 md:ml-[55%]" 
               )}>
                  <div className={cn(
                    "bg-card border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group",
                    isCurrent && "border-primary/40 ring-4 ring-primary/5"
                  )}>
                     {/* Progress bg */}
                     <div 
                       className="absolute bottom-0 right-0 left-0 h-1 bg-muted/50"
                     >
                        <div className="h-full bg-primary/50" style={{ width: `${percent}%` }} />
                     </div>

                     <div className="flex justify-between items-start mb-4">
                        <div>
                          <Badge variant="secondary" className="mb-2 text-[10px]">{phase.weekNumber ? `هفته ${phase.weekNumber}` : `فاز ${idx+1}`}</Badge>
                          <h3 className="font-black text-xl">{phase.phase}</h3>
                          {phase.theme && <p className="text-sm text-muted-foreground mt-1">{phase.theme}</p>}
                        </div>
                        <div className="text-center">
                           <div className="text-2xl font-bold">{percent}%</div>
                           <div className="text-[10px] text-muted-foreground">تکمیل شده</div>
                        </div>
                     </div>

                     <div className="space-y-3">
                        {phase.steps.map((step, sIdx) => {
                          const title = getStepTitle(step);
                          const isDone = completedSteps.includes(title);
                          return (
                            <div 
                              key={sIdx}
                              onClick={() => onToggleStep(step)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer border border-transparent",
                                isDone 
                                  ? "bg-emerald-500/5 text-emerald-700/70 border-emerald-500/10" 
                                  : "bg-muted/30 hover:bg-muted/70 hover:border-muted-foreground/10"
                              )}
                            >
                               <div className={cn(
                                 "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                                 isDone ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30"
                               )}>
                                  {isDone && <CheckCircle2 size={12} />}
                               </div>
                               <span className={cn("text-sm font-medium", isDone && "line-through opacity-70")}>
                                 {title}
                               </span>
                            </div>
                          )
                        })}
                     </div>
                  </div>
               </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
