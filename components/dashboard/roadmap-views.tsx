"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RoadmapStep {
  id: string;
  title: string;
  completed: boolean;
  phase: string;
}

interface KanbanBoardProps {
  steps: RoadmapStep[];
  onToggleStep: (stepId: string) => void;
  className?: string;
}

/**
 * Kanban Board View for Roadmap
 * Displays steps in columns: To Do, In Progress, Done
 */
export function KanbanBoard({ steps, onToggleStep, className }: KanbanBoardProps) {
  const todoSteps = steps.filter(s => !s.completed).slice(1); // All except first incomplete
  const inProgressStep = steps.find(s => !s.completed); // First incomplete is "in progress"
  const doneSteps = steps.filter(s => s.completed);

  const columns = [
    { 
      id: "todo", 
      title: "در انتظار", 
      steps: todoSteps,
      color: "bg-muted",
      iconColor: "text-muted-foreground",
    },
    { 
      id: "progress", 
      title: "در حال انجام", 
      steps: inProgressStep ? [inProgressStep] : [],
      color: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
    { 
      id: "done", 
      title: "تکمیل شده", 
      steps: doneSteps,
      color: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {columns.map(column => (
        <div 
          key={column.id}
          className={cn(
            "rounded-xl p-4 min-h-[300px]",
            column.color
          )}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground text-sm">{column.title}</h3>
            <Badge variant="outline" className="text-xs">
              {column.steps.length}
            </Badge>
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {column.steps.map(step => (
              <div
                key={step.id}
                onClick={() => onToggleStep(step.id)}
                className={cn(
                  "bg-card border border-border rounded-lg p-3 cursor-pointer transition-all",
                  "hover:ring-2 hover:ring-primary/20 hover:shadow-md",
                  step.completed && "opacity-75"
                )}
              >
                <div className="flex items-start gap-2">
                  <div className={cn("shrink-0 mt-0.5", column.iconColor)}>
                    {step.completed ? (
                      <CheckCircle2 size={16} />
                    ) : column.id === "progress" ? (
                      <Clock size={16} className="animate-pulse" />
                    ) : (
                      <Circle size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm line-clamp-2",
                      step.completed ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                      {step.title}
                    </p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-[10px]">
                        {step.phase}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {column.steps.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {column.id === "done" ? "هنوز موردی تکمیل نشده" : "موردی وجود ندارد"}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Timeline View for Roadmap
 * Displays steps as a horizontal timeline
 */
interface TimelineViewProps {
  phases: Array<{ phase: string; steps: string[] }>;
  completedSteps: string[];
  onToggleStep: (step: string) => void;
  className?: string;
}

export function TimelineView({ phases, completedSteps, onToggleStep, className }: TimelineViewProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Timeline connector */}
      <div className="absolute top-6 left-0 right-0 h-0.5 bg-border z-0" />
      
      {/* Timeline items */}
      <div className="relative z-10 flex overflow-x-auto pb-4 gap-4">
        {phases.map((phase, phaseIdx) => (
          <div key={phaseIdx} className="flex-shrink-0 w-64">
            {/* Phase marker */}
            <div className="flex items-center gap-2 mb-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border-4",
                phase.steps.every(s => completedSteps.includes(s))
                  ? "bg-emerald-500 border-emerald-200 text-white"
                  : phase.steps.some(s => completedSteps.includes(s))
                    ? "bg-amber-500 border-amber-200 text-white"
                    : "bg-muted border-border text-muted-foreground"
              )}>
                <Flag size={18} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm line-clamp-1">
                  فاز {phaseIdx + 1}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {phase.phase}
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2 pr-2">
              {phase.steps.map((step, stepIdx) => {
                const isCompleted = completedSteps.includes(step);
                return (
                  <div
                    key={stepIdx}
                    onClick={() => onToggleStep(step)}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all",
                      "hover:ring-2 hover:ring-primary/20",
                      isCompleted 
                        ? "bg-emerald-500/5 border-emerald-500/20" 
                        : "bg-card border-border"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {isCompleted ? (
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <span className={cn(
                        "text-xs line-clamp-2",
                        isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                      )}>
                        {step}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
