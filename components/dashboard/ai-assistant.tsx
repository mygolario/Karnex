"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getPlanFromCloud } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { useMentorContext } from "@/components/dashboard/step-guide";
import { 
  Sparkles, 
  Send, 
  Loader2,
  Bot,
  ArrowUpRight,
  Lightbulb,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

// Context-aware suggestions based on current page
const pageSuggestions: Record<string, string[]> = {
  "/dashboard/overview": ["از کجا شروع کنم؟", "نکات مهم امروز", "اولویت‌بندی کارها"],
  "/dashboard/roadmap": ["این مرحله یعنی چی؟", "چطور سریع‌تر پیش برم؟"],
  "/dashboard/canvas": ["ارزش پیشنهادی چیه؟", "مشتری ایده‌آل کیه؟"],
  "/dashboard/brand": ["چطور لوگو بسازم؟", "رنگ مناسب برندم چیه؟"],
  "/dashboard/marketing": ["چطور مشتری جذب کنم؟", "بازاریابی رایگان"],
  "/dashboard/legal": ["آیا ثبت شرکت لازمه؟", "مجوزهای ضروری"],
};

const defaultSuggestions = ["راهنمایی سریع", "سوال دارم"];

export function AiAssistant() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { pendingQuestion, setPendingQuestion } = useMentorContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quickResponse, setQuickResponse] = useState<string | null>(null);
  const [planContext, setPlanContext] = useState<any>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get suggestions based on current page
  const currentSuggestions = pageSuggestions[pathname] || defaultSuggestions;

  // Load the Business Plan Context
  useEffect(() => {
    if (user) {
      getPlanFromCloud(user.uid).then(setPlanContext);
    }
  }, [user]);

  // Handle pending questions from AI Mentor button
  useEffect(() => {
    if (pendingQuestion) {
      setIsOpen(true);
      setInput(pendingQuestion);
      setPendingQuestion(null);
    }
  }, [pendingQuestion, setPendingQuestion]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuickResponse(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleQuickQuestion = async (customMessage?: string) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || isLoading) return;

    setInput("");
    setIsLoading(true);
    setQuickResponse(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          planContext: planContext || {},
          generateFollowUps: false
        })
      });

      const data = await res.json();
      
      if (data.reply) {
        // Show truncated response
        const truncated = data.reply.length > 200 
          ? data.reply.substring(0, 200) + "..." 
          : data.reply;
        setQuickResponse(truncated);
      }
    } catch (error) {
      console.error(error);
      setQuickResponse("متاسفانه مشکلی پیش آمد. لطفا دوباره تلاش کنید.");
    } finally {
      setIsLoading(false);
    }
  };

  const goToFullAssistant = () => {
    setIsOpen(false);
    router.push('/dashboard/assistant');
  };

  // Don't show on assistant page
  if (pathname === '/dashboard/assistant') {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 left-6 z-50",
          "p-3.5 rounded-2xl shadow-xl",
          "transition-all duration-300",
          "flex items-center gap-2 group",
          isOpen 
            ? "bg-muted text-foreground shadow-lg"
            : "bg-gradient-to-r from-primary to-purple-600 text-white shadow-primary/30 hover:scale-110 hover:shadow-2xl hover:shadow-primary/40"
        )}
      >
        {isOpen ? (
          <X size={22} />
        ) : (
          <>
            <div className="relative">
              <Sparkles size={22} className="group-hover:animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-secondary rounded-full animate-pulse" />
            </div>
          </>
        )}
      </motion.button>

      {/* Quick Action Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-20 left-6 z-50 w-80 max-w-[calc(100vw-3rem)]"
          >
            <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">دستیار سریع</h3>
                    <p className="text-xs text-muted-foreground">سوال سریع بپرسید</p>
                  </div>
                </div>
              </div>

              {/* Quick Response */}
              {quickResponse && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 bg-muted/30 border-b border-border/30"
                >
                  <p className="text-sm text-foreground leading-7">{quickResponse}</p>
                  <button
                    onClick={goToFullAssistant}
                    className="text-xs text-primary hover:underline mt-2 flex items-center gap-1"
                  >
                    ادامه گفتگو در دستیار
                    <ArrowUpRight size={12} />
                  </button>
                </motion.div>
              )}

              {/* Input */}
              <div className="p-3">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleQuickQuestion(); }}
                  className="flex gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="سوال سریع..."
                    className="input-premium flex-1 text-sm py-2"
                    dir="rtl"
                  />
                  <Button 
                    type="submit"
                    variant="gradient"
                    size="icon-sm"
                    disabled={!input.trim() || isLoading}
                    className="shrink-0"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </Button>
                </form>
              </div>

              {/* Quick Suggestions */}
              {!quickResponse && (
                <div className="px-3 pb-3">
                  <div className="flex items-center gap-1.5 mb-2 text-[10px] text-muted-foreground">
                    <Lightbulb size={10} />
                    <span>پیشنهادات سریع</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentSuggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickQuestion(suggestion)}
                        disabled={isLoading}
                        className="text-[11px] bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-full transition-colors border border-border/50 disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA to Full Assistant */}
              <div className="p-3 pt-0">
                <Button
                  variant="soft"
                  size="sm"
                  className="w-full gap-2 text-xs"
                  onClick={goToFullAssistant}
                >
                  <Bot size={14} />
                  باز کردن دستیار کامل
                  <ArrowUpRight size={12} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
