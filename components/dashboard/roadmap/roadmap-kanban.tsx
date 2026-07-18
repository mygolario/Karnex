"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { cn, toPersianDigits } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StepCard } from "./step-card";
import type { RoadmapStep, RoadmapPhase, SubTask } from "@/lib/db";
import {
  StepStatus,
  StepDisplayState,
  STATUS_CONFIG,
  KANBAN_COLUMNS,
} from "@/lib/roadmap/constants";

interface RoadmapKanbanProps {
  roadmap: RoadmapPhase[];
  getStepStatus: (step: string | RoadmapStep) => StepStatus;
  getStepDisplayState: (step: string | RoadmapStep) => StepDisplayState;
  onToggleStep: (step: string | RoadmapStep) => void;
  onOpenStepDetail: (step: string | RoadmapStep, phase?: RoadmapPhase) => void;
  onUpdateStepStatus: (
    step: string | RoadmapStep,
    status: StepStatus
  ) => void;
  subTasks?: SubTask[];
}

interface BoardStep {
  step: RoadmapStep;
  phase: RoadmapPhase;
  status: StepStatus;
  state: StepDisplayState;
}

function DraggableStep({
  step,
  state,
  subTasks,
  onToggle,
  onOpen,
}: {
  step: RoadmapStep;
  state: StepDisplayState;
  subTasks?: SubTask[];
  onToggle: () => void;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: step.title,
  });

  return (
    <div ref={setNodeRef} className={cn(isDragging && "opacity-30")}>
      <StepCard
        step={step}
        state={state}
        onClick={onOpen}
        onQuickToggle={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        subTasks={subTasks}
        draggable
        dragAttributes={attributes as unknown as Record<string, unknown>}
        dragListeners={listeners as unknown as Record<string, unknown>}
        isDragging={isDragging}
      />
    </div>
  );
}

function KanbanColumn({
  status,
  steps,
  onToggle,
  onOpen,
  getSubTasks,
}: {
  status: StepStatus;
  steps: BoardStep[];
  onToggle: (step: string | RoadmapStep) => void;
  onOpen: (step: string | RoadmapStep, phase?: RoadmapPhase) => void;
  getSubTasks: (title: string) => SubTask[] | undefined;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const cfg = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col gap-3 min-w-[260px] w-[280px]">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-1">
        <div className="flex items-center gap-2">
          <span className={cn("w-2.5 h-2.5 rounded-full", cfg.dotClass)} />
          <h3 className="text-sm font-bold text-foreground">{cfg.label}</h3>
        </div>
        <Badge variant="muted" size="sm">
          {toPersianDigits(steps.length)}
        </Badge>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col gap-2.5 p-2 rounded-2xl border-2 border-dashed transition-all min-h-[120px]",
          isOver
            ? "border-primary/50 bg-primary/5"
            : "border-border/40 bg-muted/20"
        )}
      >
        {steps.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground/50">
            خالی
          </div>
        )}
        {steps.map(({ step, phase, state }) => (
          <DraggableStep
            key={step.title}
            step={step}
            state={state}
            subTasks={getSubTasks(step.title)}
            onToggle={() => onToggle(step)}
            onOpen={() => onOpen(step, phase)}
          />
        ))}
      </div>
    </div>
  );
}

export function RoadmapKanban({
  roadmap,
  getStepStatus,
  getStepDisplayState,
  onToggleStep,
  onOpenStepDetail,
  onUpdateStepStatus,
  subTasks,
}: RoadmapKanbanProps) {
  const [activeStep, setActiveStep] = useState<RoadmapStep | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // Flatten roadmap and bucket by status
  const columns = useMemo(() => {
    const buckets: Record<StepStatus, BoardStep[]> = {
      todo: [],
      "in-progress": [],
      blocked: [],
      done: [],
      skipped: [],
    };

    for (const phase of roadmap) {
      for (const s of phase.steps) {
        const step =
          typeof s === "string" ? { title: s } : (s as RoadmapStep);
        const status = getStepStatus(step);
        const state = getStepDisplayState(step);
        buckets[status]?.push({ step, phase, status, state });
      }
    }
    return buckets;
  }, [roadmap, getStepStatus, getStepDisplayState]);

  const getSubTasks = (title: string) =>
    subTasks?.filter((s) => s.parentStep === title);

  const handleDragStart = (e: DragStartEvent) => {
    const title = e.active.id as string;
    for (const phase of roadmap) {
      for (const s of phase.steps) {
        const step =
          typeof s === "string" ? { title: s } : (s as RoadmapStep);
        if (step.title === title) {
          setActiveStep(step);
          return;
        }
      }
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveStep(null);
    const { active, over } = e;
    if (!over) return;

    const stepTitle = active.id as string;
    const newStatus = over.id as StepStatus;

    if (!KANBAN_COLUMNS.includes(newStatus)) return;

    // Find the step
    for (const phase of roadmap) {
      for (const s of phase.steps) {
        const step =
          typeof s === "string" ? { title: s } : (s as RoadmapStep);
        if (step.title === stepTitle) {
          if (getStepStatus(step) !== newStatus) {
            onUpdateStepStatus(step, newStatus);
          }
          return;
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            steps={columns[status]}
            onToggle={onToggleStep}
            onOpen={onOpenStepDetail}
            getSubTasks={getSubTasks}
          />
        ))}
      </div>

      <DragOverlay>
        {activeStep ? (
          <div className="rotate-2 opacity-90">
            <StepCard
              step={activeStep}
              state="available"
              subTasks={getSubTasks(activeStep.title)}
              compact
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
