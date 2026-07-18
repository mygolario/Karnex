"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MascotMood } from "@/lib/tour/types";
import { Sparkles, Hand, PartyPopper, Lightbulb, Bot } from "lucide-react";

const MOOD_CONFIG: Record<
  MascotMood,
  { icon: typeof Bot; gradient: string; label: string; animate?: string }
> = {
  welcome: {
    icon: Sparkles,
    gradient: "from-primary to-violet-600",
    label: "خوش آمدید",
    animate: "animate-bounce-gentle",
  },
  tip: {
    icon: Lightbulb,
    gradient: "from-amber-400 to-orange-500",
    label: "نکته",
  },
  action: {
    icon: Hand,
    gradient: "from-emerald-400 to-teal-600",
    label: "امتحان کنید",
    animate: "animate-pulse",
  },
  success: {
    icon: PartyPopper,
    gradient: "from-green-400 to-emerald-600",
    label: "عالی!",
  },
  celebrate: {
    icon: PartyPopper,
    gradient: "from-fuchsia-400 to-purple-600",
    label: "تبریک!",
    animate: "animate-bounce-gentle",
  },
  idle: {
    icon: Bot,
    gradient: "from-slate-400 to-slate-600",
    label: "راهنما",
  },
};

interface TourMascotProps {
  mood?: MascotMood;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function TourMascot({
  mood = "tip",
  size = "md",
  showLabel = false,
  className,
}: TourMascotProps) {
  const config = MOOD_CONFIG[mood];
  const Icon = config.icon;
  const sizeMap = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  };
  const iconSize = { sm: 18, md: 24, lg: 32 };

  return (
    <motion.div
      className={cn("flex items-center gap-2 shrink-0", className)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div
        className={cn(
          "rounded-2xl flex items-center justify-center shadow-lg border border-white/20 bg-gradient-to-br text-white",
          sizeMap[size],
          config.gradient,
          config.animate
        )}
      >
        <Icon size={iconSize[size]} className="text-white" />
      </div>
      {showLabel && (
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {config.label}
        </span>
      )}
    </motion.div>
  );
}

/** Floating mascot capsule for beacons */
export function TourMascotPeek({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        "w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-white/30",
        className
      )}
      animate={{ y: [0, -4, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
    >
      <Bot size={14} className="text-white" />
    </motion.div>
  );
}
