"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Loader2, Sparkles, MessageCircle } from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RoadmapAiCopilotProps {
  projectName?: string;
  projectType?: string;
  currentStepTitle?: string;
  progressPercent: number;
  blockedStepCount: number;
}

const QUICK_CHIPS = [
  "گام بعدی چیست؟",
  "این هفته چه کنم؟",
  "چرا گیر کردم؟",
];

export function RoadmapAiCopilot({
  projectName,
  projectType,
  currentStepTitle,
  progressPercent,
  blockedStepCount,
}: RoadmapAiCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);
    setResponse(null);

    try {
      const { chatAction } = await import("@/lib/chat-actions");
      const result = await chatAction(userMessage, {
        projectName,
        overview: `کاربر در گام فعلی: ${currentStepTitle}. پیشرفت: ${progressPercent}%`,
        projectType,
      });
      setResponse(result && result.success ? (result.reply || "پاسخی دریافت نشد.") : "خطایی رخ داد.");
    } catch {
      setResponse("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-[var(--mobile-bottom-nav-offset)] md:bottom-24 end-3 md:end-6 z-50 flex flex-col items-end gap-2">
      {/* Expanded panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="copilot-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-[min(20rem,calc(100vw-1.5rem))] shadow-2xl shadow-primary/10 border border-border/60 bg-card/95 backdrop-blur-xl rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-violet-500/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Co-Pilot نقشه راه
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
                aria-label="بستن"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick chips */}
            <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none border-b border-border/30">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setMessage(chip)}
                  className={cn(
                    "shrink-0 text-xs px-3 py-1.5 rounded-full",
                    "bg-primary/8 hover:bg-primary/15 text-primary border border-primary/20",
                    "transition-colors duration-150 whitespace-nowrap"
                  )}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Response area */}
            {response && (
              <div className="px-4 py-3 max-h-40 overflow-y-auto border-b border-border/30">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {response}
                </p>
              </div>
            )}

            {/* Input area */}
            <div className="p-3 flex flex-col gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="سوال خود را بپرسید..."
                className="min-h-[72px] max-h-32 resize-none text-sm bg-background/50 border-border/50 focus-visible:ring-primary/30 rounded-xl"
                dir="rtl"
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                size="sm"
                className="w-full rounded-xl gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isLoading ? "در حال پردازش..." : "ارسال"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger pill */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-full",
          "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
          "text-sm font-medium transition-shadow duration-200",
          blockedStepCount > 0
            ? "ring-2 ring-red-500/50 animate-pulse"
            : ""
        )}
        aria-label="باز کردن دستیار AI"
      >
        <Bot className="w-4 h-4" />
        <span>دستیار AI</span>
        {blockedStepCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold leading-none">
            {toPersianDigits(blockedStepCount)}
          </span>
        )}
      </motion.button>
    </div>
  );
}
