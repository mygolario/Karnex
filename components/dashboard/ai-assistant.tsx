"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getPlanFromCloud } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  Bot,
  Minimize2,
  Maximize2,
  HelpCircle,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

// Context-aware suggestions based on current page
const pageSuggestions: Record<string, { title: string; questions: string[] }> = {
  "/dashboard/overview": {
    title: "سوالات درباره داشبورد",
    questions: [
      "از کجا شروع کنم؟",
      "بوم کسب‌وکار چیست؟",
      "چطور پیشرفتم را ببینم؟"
    ]
  },
  "/dashboard/roadmap": {
    title: "سوالات درباره نقشه راه",
    questions: [
      "این مرحله یعنی چی؟",
      "چطور سایت بسازم؟",
      "اول کدوم کار رو انجام بدم؟"
    ]
  },
  "/dashboard/canvas": {
    title: "سوالات درباره بوم کسب‌وکار",
    questions: [
      "مشکل مشتری یعنی چی؟",
      "ارزش پیشنهادی چیه؟",
      "چطور ویرایش کنم؟"
    ]
  },
  "/dashboard/brand": {
    title: "سوالات درباره برند",
    questions: [
      "چطور لوگو بسازم؟",
      "از رنگ‌ها کجا استفاده کنم؟",
      "فونت مناسب چیه؟"
    ]
  },
  "/dashboard/marketing": {
    title: "سوالات درباره بازاریابی",
    questions: [
      "چطور مشتری پیدا کنم؟",
      "اینستاگرام یا سایت؟",
      "بدون بودجه چیکار کنم؟"
    ]
  },
  "/dashboard/legal": {
    title: "سوالات حقوقی",
    questions: [
      "نماد اعتماد چیه؟",
      "آیا ثبت شرکت لازمه؟",
      "بدون مجوز شروع کنم؟"
    ]
  }
};

const defaultSuggestions = {
  title: "سوالات پرتکرار",
  questions: [
    "از کجا شروع کنم؟",
    "چطور مشتری پیدا کنم؟",
    "بودجه‌بندی"
  ]
};

export function AiAssistant() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Initial Welcome Message
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'سلام! من مشاور هوشمند کارنکس هستم. 👋\n\nدر مورد پروژه‌تون سوالی دارید؟ می‌تونم در مورد نقشه راه، بازاریابی، یا هر چیز دیگه‌ای کمکتون کنم.\n\n💡 نکته: هر سوالی داشتید بپرسید - من با زبان ساده توضیح می‌دم!' }
  ]);
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [planContext, setPlanContext] = useState<any>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get suggestions based on current page
  const currentSuggestions = pageSuggestions[pathname] || defaultSuggestions;

  // Load the Business Plan Context
  useEffect(() => {
    if (user) {
      getPlanFromCloud(user.uid).then(setPlanContext);
    }
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || isLoading) return;

    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: messageToSend }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          planContext: planContext || {}
        })
      });

      const data = await res.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', text: 'متاسفانه ارتباط قطع شد. لطفا دوباره تلاش کنید.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-6 left-6 z-50",
            "bg-gradient-to-r from-primary to-purple-600 text-white",
            "p-4 rounded-2xl shadow-xl shadow-primary/30",
            "transition-all duration-300",
            "hover:scale-110 hover:shadow-2xl hover:shadow-primary/40",
            "flex items-center gap-3 group",
            "animate-in slide-in-from-bottom-4"
          )}
        >
          <div className="relative">
            <Sparkles size={24} className="group-hover:animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-pulse" />
          </div>
          <span className="font-bold hidden md:inline">سوال دارید؟</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={cn(
            "fixed z-50 shadow-2xl",
            "flex flex-col",
            "animate-in slide-in-from-bottom-10 fade-in duration-300",
            "overflow-hidden",
            isMinimized
              ? "bottom-6 left-6 w-80 h-16 rounded-2xl"
              : "bottom-6 left-6 w-[90vw] md:w-[420px] h-[600px] max-h-[80vh] rounded-3xl"
          )}
        >
          {/* Glass Background */}
          <div className="absolute inset-0 bg-card/95 backdrop-blur-xl border border-border/50" />
          
          {/* Header */}
          <div className={cn(
            "relative z-10 bg-gradient-to-r from-primary to-purple-600 p-4 flex justify-between items-center text-white",
            isMinimized ? "rounded-2xl" : ""
          )}>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">مشاور کارنکس</h3>
                {!isMinimized && (
                  <p className="text-xs text-white/80 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                    آنلاین - سوالاتتون رو بپرسید!
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div 
                ref={scrollRef}
                className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4"
              >
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={cn(
                        "max-w-[85%] p-4 rounded-2xl text-sm leading-7",
                        msg.role === 'user' 
                          ? "bg-gradient-to-r from-primary to-purple-600 text-white rounded-br-sm shadow-lg shadow-primary/20" 
                          : "bg-muted text-foreground rounded-bl-sm"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                
                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex justify-end">
                    <div className="bg-muted p-4 rounded-2xl rounded-bl-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
              </div>

              {/* Context-Aware Suggestions */}
              {messages.length <= 2 && (
                <div className="relative z-10 px-4 pb-2">
                  <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                    <Lightbulb size={12} className="text-accent" />
                    <span>{currentSuggestions.title}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentSuggestions.questions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(suggestion)}
                        className="text-xs bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-colors border border-border/50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="relative z-10 p-4 border-t border-border/50">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="هر سوالی بپرسید..."
                    className="input-premium flex-1"
                    dir="rtl"
                  />
                  <Button 
                    type="submit"
                    variant="gradient"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    className="shrink-0"
                  >
                    <Send size={18} className={cn(
                      "transition-transform",
                      isLoading ? "opacity-0" : "opacity-100"
                    )} />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
