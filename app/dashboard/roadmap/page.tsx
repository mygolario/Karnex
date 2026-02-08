"use client";

import { useState } from "react";
import { useRoadmap } from "@/hooks/use-roadmap";
import { RoadmapKanban } from "@/components/dashboard/roadmap/roadmap-kanban";
import { RoadmapTimeline } from "@/components/dashboard/roadmap/roadmap-timeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, KanbanSquare, CalendarDays, Loader2, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { PageTourHelp } from "@/components/features/onboarding/page-tour-help";

export default function RoadmapPage() {
  const { 
    loading, 
    plan, 
    roadmap, 
    completedSteps, 
    activeWeek, 
    progressPercent, 
    toggleStep, 
    getStepTitle 
  } = useRoadmap();

  const [viewMode, setViewMode] = useState<"kanban" | "timeline">("kanban");
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState<number | null>(null);

  // If loading
  if (loading || !plan) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">در حال آماده‌سازی نقشه راه...</p>
        </div>
      </div>
    );
  }

  // Determine which phase to show in Kanban logic
  // Default to active week index (activeWeek is 1-based usually, so -1)
  const currentPhaseIndex = selectedPhaseIdx !== null 
    ? selectedPhaseIdx 
    : (activeWeek > 0 ? activeWeek - 1 : 0);
    
  const currentPhase = roadmap[currentPhaseIndex];

  // Celebration state logic
  const isAllComplete = progressPercent === 100;

  return (
    <div className="container mx-auto max-w-7xl py-6 space-y-8 pb-24">
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6" data-tour-id="roadmap-header">
        <div className="flex items-center gap-4">
          <PageTourHelp tourId="roadmap" /> 
           <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
             <span className="bg-primary/10 p-2 rounded-xl text-primary">
               <Layers size={28} />
             </span>
             نقشه راه محصول
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg leading-relaxed">
            اینجا مرکز فرماندهی شماست. <span className="text-foreground font-medium">قدم به قدم</span> پیش بروید و مسیر رشد محصول خود را بسازید.
          </p>
        </div>
        </div>

        {/* View Switcher */}
        <div className="bg-muted/50 p-1 rounded-xl flex items-center border">
          <button
            onClick={() => setViewMode("kanban")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              viewMode === "kanban" 
                ? "bg-background text-foreground shadow-sm ring-1 ring-border" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <KanbanSquare size={16} />
            تسک‌ها (Kanban)
          </button>
          <button
            onClick={() => setViewMode("timeline")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              viewMode === "timeline" 
                ? "bg-background text-foreground shadow-sm ring-1 ring-border" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CalendarDays size={16} />
            زمان‌بندی (Timeline)
          </button>
        </div>
      </div>

      {/* 2. Progress Bar */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-end mb-3">
           <div>
             <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-1">پیشرفت کلی پروژه</span>
             <div className="text-4xl font-black text-foreground">{progressPercent}%</div>
           </div>
           {isAllComplete && (
             <Badge variant="gradient" className="animate-pulse">
               <Sparkles size={12} className="mr-1" /> تکمیل شده!
             </Badge>
           )}
        </div>
        <div className="h-4 w-full bg-muted/50 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary via-purple-500 to-indigo-600 relative"
          >
            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>
      </div>

      {/* 3. Main Content Area */}
      <AnimatePresence mode="wait">
        {viewMode === "kanban" ? (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Phase Selection Dropdown (Only for Kanban) */}
            <div className="flex items-center gap-4 bg-background sticky top-0 z-20 py-2" data-tour-id="phases-container">
              <span className="text-sm font-medium text-muted-foreground">نمایش فاز:</span>
              <Select 
                value={String(currentPhaseIndex)} 
                onValueChange={(val) => setSelectedPhaseIdx(Number(val))}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="انتخاب فاز" />
                </SelectTrigger>
                <SelectContent>
                  {roadmap.map((p, idx) => (
                    <SelectItem key={idx} value={String(idx)}>
                      فاز {idx + 1}: {p.phase} {idx + 1 === activeWeek && "(فعلی)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {currentPhaseIndex + 1 === activeWeek && (
                <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5">
                  فاز فعال
                </Badge>
              )}
            </div>

            <RoadmapKanban 
              phase={currentPhase}
              completedSteps={completedSteps}
              onToggleStep={toggleStep}
              getStepTitle={getStepTitle}
            />
          </motion.div>
        ) : (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <RoadmapTimeline 
               roadmap={roadmap}
               completedSteps={completedSteps}
               activeWeek={activeWeek}
               onToggleStep={toggleStep}
               getStepTitle={getStepTitle}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 4. Complete State (Big celebration at bottom if done) */}
      {isAllComplete && (
        <motion.div 
           initial={{ opacity: 0, y: 50 }}
           animate={{ opacity: 1, y: 0 }}
           className="fixed bottom-0 left-0 right-0 p-6 z-50 flex justify-center pointer-events-none"
        >
          <Card className="p-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl flex items-center gap-6 pointer-events-auto max-w-2xl w-full border-0">
             <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
               <Trophy size={40} className="text-white" />
             </div>
             <div>
               <h3 className="text-2xl font-black mb-1">تبریک! شما قهرمانید!</h3>
               <p className="text-white/90">تمام مراحل نقشه راه با موفقیت به پایان رسید.</p>
             </div>
             <Button variant="secondary" size="lg" className="mr-auto whitespace-nowrap">
               دریافت گواهی
             </Button>
          </Card>
        </motion.div>
      )}

    </div>
  );
}
