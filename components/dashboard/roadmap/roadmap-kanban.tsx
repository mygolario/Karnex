"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, MoreHorizontal, Calendar, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoadmapStepObject, RoadmapPhase } from "@/hooks/use-roadmap";

interface RoadmapKanbanProps {
  roadmap: RoadmapPhase[];
  completedSteps: string[];
  onToggleStep: (step: string | RoadmapStepObject) => void;
  onOpenStepDetail?: (step: string | RoadmapStepObject, phase?: RoadmapPhase) => void;
  getStepTitle: (step: string | RoadmapStepObject) => string;
  filterPriority: string;
}

export function RoadmapKanban({
  roadmap,
  completedSteps,
  onToggleStep,
  onOpenStepDetail,
  getStepTitle,
  filterPriority
}: RoadmapKanbanProps) {

  // Flatten all steps from all phases into one list for the Kanban
  const allSteps = roadmap.flatMap(phase => 
    phase.steps.map(step => {
      const stepObj = typeof step === 'string' ? { title: step, priority: 'low' } : step;
      return { ...stepObj, phaseName: phase.phase, phaseId: phase.weekNumber };
    })
  );

  // Filter by priority if set
  const filteredSteps = allSteps.filter(step => {
    if (filterPriority === "all") return true;
    // Handle both object and string steps (strings have no priority)
    if (typeof step === 'string') return filterPriority === "low"; // Default string steps to low? Or just hide?
    return step.priority === filterPriority;
  });

  // Sort into columns
  const doneSteps = filteredSteps.filter(s => completedSteps.includes(getStepTitle(s as any)));
  
  // For "In Progress", we can use the 'status' field if available, OR rudimentary logic:
  // If not done, and it's in the current active phase or manually marked in-progress
  // For now, let's stick to the "First non-completed step is In Progress" logic, OR explicit status if we add it.
  // Let's improve: "In Progress" = The first 2 uncompleted steps. "Todo" = The rest.
  
  const notDoneSteps = filteredSteps.filter(s => !completedSteps.includes(getStepTitle(s as any)));
  const inProgressSteps = notDoneSteps.slice(0, 2); // Pick first 2 as active
  const todoSteps = notDoneSteps.slice(2);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[600px]" data-tour-id="kanban-board">
      
      {/* 1. To Do Column */}
      <KanbanColumn 
         title="برای انجام" 
         count={todoSteps.length} 
         icon={<Circle size={16} />}
         colorClass="border-slate-200 bg-slate-50/50"
      >
         <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {todoSteps.map((step: any, idx) => (
               <KanbanCard 
                 key={getStepTitle(step) + idx} 
                 step={step} 
                 status="todo"
                 phase={roadmap.find((p) => p.steps.some((s) => getStepTitle(s) === getStepTitle(step)))}
                 onAction={() => onToggleStep(step)}
                 onOpenDetail={onOpenStepDetail}
                 getStepTitle={getStepTitle}
               />
            ))}
            {todoSteps.length === 0 && <EmptyState />}
         </motion.div>
      </KanbanColumn>

      {/* 2. In Progress Column */}
      <KanbanColumn 
         title="در حال انجام" 
         count={inProgressSteps.length} 
         icon={<Clock size={16} className="animate-pulse text-blue-500" />}
         colorClass="border-blue-200 bg-blue-50/30"
         isMain
      >
         <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {inProgressSteps.map((step: any, idx) => (
               <KanbanCard 
                 key={getStepTitle(step) + idx} 
                 step={step} 
                 status="in-progress"
                 phase={roadmap.find((p) => p.steps.some((s) => getStepTitle(s) === getStepTitle(step)))}
                 onAction={() => onToggleStep(step)}
                 onOpenDetail={onOpenStepDetail}
                 getStepTitle={getStepTitle}
               />
            ))}
             {inProgressSteps.length === 0 && <EmptyState text="تسکی در جریان نیست" />}
         </motion.div>
      </KanbanColumn>

      {/* 3. Done Column */}
      <KanbanColumn 
         title="تکمیل شده" 
         count={doneSteps.length} 
         icon={<CheckCircle2 size={16} className="text-emerald-500" />}
         colorClass="border-emerald-100 bg-emerald-50/30"
      >
         <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {doneSteps.map((step: any, idx) => (
               <KanbanCard 
                 key={getStepTitle(step) + idx} 
                 step={step} 
                 status="done"
                 phase={roadmap.find((p) => p.steps.some((s) => getStepTitle(s) === getStepTitle(step)))}
                 onAction={() => onToggleStep(step)}
                 onOpenDetail={onOpenStepDetail}
                 getStepTitle={getStepTitle}
               />
            ))}
            {doneSteps.length === 0 && <EmptyState text="هنوز موردی تکمیل نشده" />}
         </motion.div>
      </KanbanColumn>

    </div>
  );
}

// Sub-components for cleanliness

function KanbanColumn({ title, count, icon, children, colorClass, isMain }: any) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2 font-bold text-sm text-foreground/80">
           <span className="p-1.5 rounded-md bg-background border shadow-xs">{icon}</span>
           {title}
        </div>
        <Badge variant="secondary" className="px-2 h-5 text-[10px] min-w-[20px] justify-center">
          {count}
        </Badge>
      </div>
      <div className={cn(
        "flex-1 p-3 rounded-2xl border-2 border-dashed transition-colors",
        colorClass,
        isMain && "border-solid border-blue-200 bg-blue-50/50 shadow-inner"
      )}>
        {children}
      </div>
    </div>
  );
}

function KanbanCard({ 
  step, 
  status, 
  phase,
  onAction, 
  onOpenDetail, 
  getStepTitle 
}: { 
  step: any; 
  status: 'todo'|'in-progress'|'done'; 
  phase?: RoadmapPhase;
  onAction: () => void;
  onOpenDetail?: (step: string | RoadmapStepObject, phase?: RoadmapPhase) => void;
  getStepTitle: (step: string | RoadmapStepObject) => string;
}) {
   const isString = typeof step === 'string';
   const title = isString ? step : step.title;
   const desc = !isString ? step.description : null;
   const priority = !isString ? step.priority : null;
   const phaseName = step.phaseName ?? phase?.phase;

   const priorityColor = {
     high: "text-red-600 bg-red-50 border-red-100",
     medium: "text-amber-600 bg-amber-50 border-amber-100",
     low: "text-slate-600 bg-slate-50 border-slate-100"
   }[priority as string] || "text-slate-600 bg-slate-50 border-slate-100";

   const handleOpenDetail = (e: React.MouseEvent) => {
     e.stopPropagation();
     onOpenDetail?.(step, phase);
   };

   return (
     <motion.div 
       layout
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       className={cn(
         "group relative bg-card hover:shadow-md transition-all duration-200 p-3 rounded-xl border border-border/60 hover:border-primary/30 cursor-grab active:cursor-grabbing",
         status === 'done' && "opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0",
         status === 'in-progress' && "ring-1 ring-blue-500/20 shadow-sm"
       )}
     >
       {/* Drag Handle */}
       <div className="absolute top-3 left-3 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors">
          <GripVertical size={14} />
       </div>

       <div className="space-y-2 pl-4">
          <div className="flex flex-wrap gap-1 mb-1">
             {phaseName && (
               <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium truncate max-w-[100px]">
                 {phaseName}
               </span>
             )}
             {priority && (
               <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border font-medium", priorityColor)}>
                  {priority === 'high' ? 'فوری' : priority === 'medium' ? 'متوسط' : 'عادی'}
               </span>
             )}
          </div>

          <h4 
            className={cn(
              "font-bold text-sm leading-snug", 
              status === 'done' && "line-through text-muted-foreground",
              onOpenDetail && "cursor-pointer hover:text-primary transition-colors"
            )}
            onClick={onOpenDetail ? handleOpenDetail : undefined}
          >
            {title}
          </h4>
          
          {desc && (
            <p 
              className={cn(
                "text-xs text-muted-foreground line-clamp-2 leading-relaxed",
                onOpenDetail && "cursor-pointer hover:text-foreground/80"
              )}
              onClick={onOpenDetail ? handleOpenDetail : undefined}
            >
              {desc}
            </p>
          )}

          <div className="pt-2 mt-2 border-t border-border/30 flex items-center justify-between">
             <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Calendar size={12} />
                <span>برنامه‌ریزی شده</span>
             </div>
             
             <div className="flex gap-1">
               {onOpenDetail && (
                 <Button 
                   size="sm" 
                   variant="ghost"
                   onClick={handleOpenDetail}
                   className="h-6 px-2 text-[10px] gap-1 hover:bg-primary/10 hover:text-primary text-muted-foreground"
                 >
                   جزئیات
                 </Button>
               )}
               <Button 
                 size="sm" 
                 variant="ghost"
                 onClick={(e) => { e.stopPropagation(); onAction(); }}
                 className={cn(
                   "h-6 px-2 text-[10px] gap-1 hover:bg-primary/10 hover:text-primary",
                   status === 'done' ? "text-emerald-600 hover:text-red-500" : "text-muted-foreground"
                 )}
               >
                  {status === 'done' ? "بازگردانی" : (status === 'in-progress' ? "تکمیل" : "شروع")}
               </Button>
             </div>
          </div>
       </div>
     </motion.div>
   )
}

function EmptyState({ text = "موردی یافت نشد" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/50">
       <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-2">
         <MoreHorizontal size={20} />
       </div>
       <p className="text-xs">{text}</p>
    </div>
  )
}
