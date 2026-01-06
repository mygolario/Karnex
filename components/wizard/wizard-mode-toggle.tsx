"use client";

import { motion } from "framer-motion";
import { MessageSquare, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardModeToggleProps {
  mode: "chat" | "wizard";
  onChange: (mode: "chat" | "wizard") => void;
}

export function WizardModeToggle({ mode, onChange }: WizardModeToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-xl">
      <button
        onClick={() => onChange("chat")}
        className={cn(
          "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
          mode === "chat" ? "text-white" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {mode === "chat" && (
          <motion.div
            layoutId="mode-indicator"
            className="absolute inset-0 bg-gradient-primary rounded-lg"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <MessageSquare size={16} />
          گفتگو با AI
        </span>
      </button>
      <button
        onClick={() => onChange("wizard")}
        className={cn(
          "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
          mode === "wizard" ? "text-white" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {mode === "wizard" && (
          <motion.div
            layoutId="mode-indicator"
            className="absolute inset-0 bg-gradient-primary rounded-lg"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <List size={16} />
          راهنمای گام‌به‌گام
        </span>
      </button>
    </div>
  );
}
