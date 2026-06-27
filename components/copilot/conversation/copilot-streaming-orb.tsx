"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Reasoning-steps indicator shown while the Copilot is working. Renders the live
 * Persian status label (tied to real `status` stream events) plus a shimmer
 * skeleton of the upcoming bubble, keeping the violet `ai-orb` brand identity.
 */
export function CopilotStreamingOrb({ status }: { status: string }) {
  return (
    <div className="flex gap-3" dir="rtl">
      {/* AI avatar with pulsing glow */}
      <div className="w-9 h-9 rounded-xl ai-orb-glow flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles size={16} className="text-white" />
      </div>

      <div className="flex flex-col gap-2 max-w-[80%]">
        {/* Status / reasoning step */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          key={status}
          className="copilot-pane rounded-2xl rounded-tl-md p-4 flex items-center gap-3"
        >
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-ai animate-typing-dot" style={{ animationDelay: "0s" }} />
            <span className="w-2 h-2 rounded-full bg-ai animate-typing-dot" style={{ animationDelay: "0.2s" }} />
            <span className="w-2 h-2 rounded-full bg-ai animate-typing-dot" style={{ animationDelay: "0.4s" }} />
          </div>
          <span className="text-xs font-medium text-muted-foreground tracking-wide">
            {status || "در حال پردازش..."}
          </span>
        </motion.div>

        {/* Shimmer skeleton of the upcoming answer */}
        <div className="copilot-pane rounded-2xl rounded-tl-md p-4 space-y-2.5 w-[320px] max-w-full">
          <div className="h-3 rounded bg-muted/60 animate-pulse w-3/4" />
          <div className="h-3 rounded bg-muted/40 animate-pulse w-full" />
          <div className="h-3 rounded bg-muted/40 animate-pulse w-5/6" />
          <div className="h-3 rounded bg-muted/30 animate-pulse w-2/3" />
        </div>
      </div>
    </div>
  );
}
