"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { useLocation } from "./location-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const URGENCY_CONFIG = {
  "فوری": { color: "text-red-500", bg: "bg-red-500/10 border-red-500/20", icon: AlertCircle, stripe: "border-r-red-500" },
  "مهم": { color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", icon: Clock, stripe: "border-r-amber-500" },
  "پیشنهادی": { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: CheckCircle2, stripe: "border-r-blue-500" },
};

export function RecommendationsList() {
  const { analysis } = useLocation();

  // Use prioritizedRecommendations if available, else fall back to regular recommendations
  const recs = analysis?.prioritizedRecommendations || analysis?.recommendations?.map(r => ({
    ...r,
    urgency: "پیشنهادی" as const,
  }));

  if (!recs || recs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb size={18} className="text-primary" />
        <h3 className="font-bold text-sm">پیشنهادات عملیاتی</h3>
      </div>

      <div className="space-y-3">
        {recs.map((rec, index) => {
          const urgency = (rec as any).urgency || "پیشنهادی";
          const config = URGENCY_CONFIG[urgency as keyof typeof URGENCY_CONFIG] || URGENCY_CONFIG["پیشنهادی"];
          const Icon = config.icon;

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
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className="font-bold text-sm">{rec.title}</h4>
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-bold shrink-0",
                        config.bg, config.color
                      )}>
                        <Icon size={10} className="ml-1" />
                        {urgency}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rec.desc}</p>
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
