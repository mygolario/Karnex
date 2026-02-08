"use client";

import { motion } from "framer-motion";
import { PILLARS, ProjectType } from "@/app/new-project/genesis-constants";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface ProjectTypeSelectionProps {
  selectedId: ProjectType | null;
  onSelect: (id: ProjectType) => void;
}

export function ProjectTypeSelection({ selectedId, onSelect }: ProjectTypeSelectionProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-12 space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black tracking-tight text-foreground"
        >
          چه چیزی می‌سازید؟
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          نوع پروژه خود را انتخاب کنید تا ابزارهای مناسب برای شما بارگذاری شود.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {PILLARS.map((pillar, index) => {
          const isSelected = selectedId === pillar.id;
          
          return (
            <motion.button
              key={pillar.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              onClick={() => onSelect(pillar.id as ProjectType)}
              className={cn(
                "group relative h-[450px] rounded-3xl overflow-hidden text-right transition-all duration-500",
                "border border-border/50 hover:border-primary/50",
                isSelected ? "ring-4 ring-primary/20 scale-[1.02]" : "hover:scale-[1.02]"
              )}
            >
              {/* Background Gradient */}
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br",
                pillar.color
              )} />
              
              {/* Glass Effect */}
              <div className="absolute inset-0 bg-card/60 backdrop-blur-sm group-hover:bg-card/40 transition-colors duration-500" />
              
              {/* Selection Indicator */}
              <div className={cn(
                "absolute top-6 left-6 z-30 transition-all duration-300",
                isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"
              )}>
                <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg shadow-primary/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col p-8 z-20">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-xl transition-transform duration-500 group-hover:scale-110",
                  "bg-gradient-to-br text-white",
                  pillar.color
                )}>
                  <pillar.icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-3xl font-bold text-foreground mb-3">{pillar.title}</h3>
                <div className="inline-flex px-3 py-1 rounded-full bg-secondary/50 text-secondary-foreground text-xs font-medium mb-6 backdrop-blur-md">
                  {pillar.subtitle}
                </div>
                
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {pillar.description}
                </p>

                <div className="mt-auto pt-8">
                   <div className={cn(
                     "flex items-center text-primary font-bold transition-all duration-300 transform",
                     "group-hover:translate-x-0 group-hover:opacity-100",
                     isSelected ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                   )}>
                      <span>انتخاب این مسیر</span>
                      <ArrowRight className="mr-2 w-5 h-5 rtl:rotate-180" />
                   </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
