"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, AlertCircle, Clock, CheckCircle2, Plus, Check } from "lucide-react";
import { useLocation } from "./location-context";
import { useProject } from "@/contexts/project-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const URGENCY_CONFIG = {
  "فوری": { color: "text-red-500", bg: "bg-red-500/10 border-red-500/20", icon: AlertCircle, stripe: "border-r-red-500" },
  "مهم": { color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", icon: Clock, stripe: "border-r-amber-500" },
  "پیشنهادی": { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: CheckCircle2, stripe: "border-r-blue-500" },
};

export function RecommendationsList() {
  const { analysis } = useLocation();
  const { activeProject, updateActiveProject } = useProject();

  // Use prioritizedRecommendations if available, else fall back to regular recommendations
  const recs = analysis?.prioritizedRecommendations || analysis?.recommendations?.map((r, i) => ({
    ...r,
    id: `loc-rec-${i}`,
    urgency: "پیشنهادی" as const,
    cost: "متوسط" as const,
  }));

  if (!recs || recs.length === 0) return null;

  const isStepAdded = (rec: any) => {
    if (!activeProject?.roadmap) return false;
    return activeProject.roadmap.some(phase => 
      phase.steps.some(step => 
        typeof step === "string" 
          ? step === rec.title 
          : step.title === rec.title || step.id === rec.id
      )
    );
  };

  const handleAddToRoadmap = async (rec: any) => {
    if (!activeProject) return;

    const newStep = {
      id: rec.id || `loc-rec-${Date.now()}`,
      title: rec.title,
      description: rec.desc,
      priority: rec.urgency === "فوری" ? "high" : rec.urgency === "مهم" ? "medium" : "low",
      status: "todo",
      cost: rec.cost === "کم‌هزینه" ? "low" : rec.cost === "سرمایه‌گذاری" ? "high" : "medium",
      tags: ["مکان‌یابی", "تحلیل هوشمند"]
    };

    const updatedRoadmap = [...(activeProject.roadmap || [])];

    // Find phase containing "مکان" or "راه" or "مجوز". If not found, use first phase
    let targetPhaseIndex = updatedRoadmap.findIndex(phase => 
      phase.phase.includes("مکان") || phase.phase.includes("راه") || phase.phase.includes("مجوز")
    );

    if (targetPhaseIndex === -1 && updatedRoadmap.length > 0) {
      targetPhaseIndex = 0;
    }

    if (targetPhaseIndex !== -1) {
      updatedRoadmap[targetPhaseIndex].steps.push(newStep);
      await updateActiveProject({ roadmap: updatedRoadmap });
      toast.success("پیشنهاد با موفقیت به نقشه راه پروژه افزوده شد");
    } else {
      updatedRoadmap.push({
        phase: "مکان‌یابی و فاز راه‌اندازی فیزیکی",
        steps: [newStep],
        weekNumber: 1
      });
      await updateActiveProject({ roadmap: updatedRoadmap });
      toast.success("فاز مکان‌یابی در نقشه راه ایجاد و پیشنهاد افزوده شد");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 text-right dir-rtl"
    >
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb size={18} className="text-primary" />
        <h3 className="font-bold text-sm">اقدامات پیشنهادی کارنکس</h3>
      </div>

      <div className="space-y-3">
        {recs.map((rec, index) => {
          const urgency = (rec as any).urgency || "پیشنهادی";
          const config = URGENCY_CONFIG[urgency as keyof typeof URGENCY_CONFIG] || URGENCY_CONFIG["پیشنهادی"];
          const Icon = config.icon;
          const added = isStepAdded(rec);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className={cn(
                "p-4 border-r-4 bg-card/30 backdrop-blur border-white/5",
                config.stripe
              )}>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-black",
                    config.bg, config.color
                  )}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm">{rec.title}</h4>
                        <Badge variant="outline" className={cn(
                          "text-[10px] font-bold shrink-0",
                          config.bg, config.color
                        )}>
                          <Icon size={10} className="ms-1" />
                          {urgency}
                        </Badge>
                        {rec.cost && (
                          <Badge variant="secondary" className="text-[10px] bg-slate-900 border-white/5 text-muted-foreground font-medium">
                            {rec.cost}
                          </Badge>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        variant={added ? "secondary" : "outline"}
                        disabled={added}
                        onClick={() => handleAddToRoadmap(rec)}
                        className={cn(
                          "text-[10px] h-7 px-2.5 rounded-lg border-white/5",
                          added ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "hover:bg-primary hover:text-white"
                        )}
                      >
                        {added ? (
                          <>
                            <Check size={10} className="ml-1" />
                            افزوده شد
                          </>
                        ) : (
                          <>
                            <Plus size={10} className="ml-1" />
                            افزودن به نقشه راه
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed text-justify">{rec.desc}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
