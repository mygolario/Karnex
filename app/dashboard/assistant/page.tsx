"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Loader2, 
  Trash2,
  Download,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Scale,
  Wand2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Zap,
  RefreshCw,
  Copy,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  followUps?: string[];
}

// Prompt templates for quick actions
const promptTemplates = [
  { 
    icon: TrendingUp, 
    title: "استراتژی رشد", 
    prompt: "یک استراتژی رشد ۶ ماهه برای کسب‌وکارم پیشنهاد بده با مراحل مشخص",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    icon: Target, 
    title: "تحلیل SWOT", 
    prompt: "نقاط قوت، ضعف، فرصت‌ها و تهدیدهای پروژه من رو تحلیل کن",
    color: "from-purple-500 to-pink-500"
  },
  { 
    icon: Users, 
    title: "جذب مشتری", 
    prompt: "چطور می‌تونم اولین ۱۰۰ مشتری پروژه‌ام رو جذب کنم؟",
    color: "from-amber-500 to-orange-500"
  },
  { 
    icon: DollarSign, 
    title: "مشاوره مالی", 
    prompt: "برای شروع کسب‌وکارم چه بودجه‌ای نیاز دارم و چطور تخصیص بدم؟",
    color: "from-emerald-500 to-teal-500"
  },
  { 
    icon: Scale, 
    title: "مسائل حقوقی", 
    prompt: "مهم‌ترین نکات حقوقی که برای شروع کسب‌وکارم باید رعایت کنم چیه؟",
    color: "from-rose-500 to-red-500"
  },
  { 
    icon: Wand2, 
    title: "بهبود ایده", 
    prompt: "چطور می‌تونم ایده کسب‌وکارم رو بهتر و متمایزتر کنم؟",
    color: "from-indigo-500 to-violet-500"
  },
];

const STORAGE_KEY = "karnex_advisor_history";
const MAX_HISTORY = 100;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 }
  }
};

export default function AssistantPage() {
  const { user } = useAuth();
  const { activeProject: plan } = useProject();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initial welcome message
  const welcomeMessage: Message = {
    id: 'welcome',
    role: 'assistant',
    content: `سلام! 👋 من دستیار هوشمند کارنکس هستم - مشاور کسب‌وکار شخصی شما.

من به تمام اطلاعات پروژه‌تون دسترسی دارم و می‌تونم در این موارد کمکتون کنم:

🎯 **استراتژی رشد** - برنامه‌ریزی برای توسعه کسب‌وکار
📊 **تحلیل بازار** - شناخت رقبا و فرصت‌ها
💡 **بهبود ایده** - تقویت مدل کسب‌وکار
💰 **مشاوره مالی** - بودجه‌بندی و جذب سرمایه
⚖️ **مسائل حقوقی** - مجوزها و قراردادها

از قالب‌های آماده سمت راست استفاده کنید یا هر سوالی دارید بپرسید!`,
    timestamp: Date.now()
  };

  // Load chat history from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${user.uid}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        } catch (e) {
          console.error("Failed to parse chat history");
        }
      }
    }
    // Set welcome message if no history
    setMessages([welcomeMessage]);
  }, [user]);

  // Save chat history to localStorage
  useEffect(() => {
    if (user && messages.length > 0 && messages[0].id !== 'welcome') {
      const toSave = messages.slice(-MAX_HISTORY);
      localStorage.setItem(`${STORAGE_KEY}_${user.uid}`, JSON.stringify(toSave));
    }
  }, [messages, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showFollowUps]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || isLoading) return;

    setInput("");
    setShowFollowUps([]);
    
    const userMessage: Message = { 
      id: generateId(),
      role: 'user', 
      content: messageToSend,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev.filter(m => m.id !== 'welcome'), userMessage]);
    setIsLoading(true);

    try {
      // Build project context from active project
      const projectContext = plan ? {
        projectName: plan.projectName,
        tagline: plan.tagline,
        overview: plan.overview,
        audience: plan.audience,
        budget: plan.budget,
        leanCanvas: plan.leanCanvas,
        brandKit: plan.brandKit,
        roadmap: plan.roadmap,
        completedSteps: plan.completedSteps,
        marketingStrategy: plan.marketingStrategy,
        competitors: plan.competitors,
        legalAdvice: plan.legalAdvice
      } : {};

      // Get conversation history for context
      const conversationHistory = messages
        .filter(m => m.id !== 'welcome')
        .slice(-8)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/advisor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          projectContext,
          conversationHistory
        })
      });

      const data = await res.json();
      
      if (data.reply) {
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: data.reply,
          timestamp: Date.now(),
          followUps: data.followUps || []
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        if (data.followUps && data.followUps.length > 0) {
          setShowFollowUps(data.followUps);
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: generateId(),
        role: 'assistant', 
        content: 'متاسفانه ارتباط قطع شد. لطفا دوباره تلاش کنید.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (user) {
      localStorage.removeItem(`${STORAGE_KEY}_${user.uid}`);
      setMessages([welcomeMessage]);
      setShowFollowUps([]);
    }
  };

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportConversation = () => {
    const text = messages
      .map(m => `[${m.role === 'user' ? 'شما' : 'دستیار'}] ${new Date(m.timestamp).toLocaleString('fa-IR')}\n${m.content}`)
      .join('\n\n---\n\n');
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `karnex-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("fa-IR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  // Calculate project stats for display
  const totalSteps = plan?.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 0;
  const completedCount = plan?.completedSteps?.length || 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] flex flex-row-reverse gap-4">
      {/* Sidebar - Quick Actions */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:flex flex-col border-l border-border/40 bg-card/50 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-6 flex-1 overflow-y-auto no-scrollbar space-y-6">
              {/* Project Context Card */}
              {plan && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20"
                >
                  <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                    <Target size={16} className="text-primary" />
                    پروژه فعال
                  </h3>
                  <p className="font-bold text-lg text-foreground mb-1">{plan.projectName}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{plan.overview}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground font-medium">{progressPercent}%</span>
                  </div>
                </motion.div>
              )}

              {/* Prompt Templates */}
              <div>
                <h3 className="font-bold text-sm text-muted-foreground mb-4 flex items-center gap-2">
                  <Lightbulb size={16} className="text-accent" />
                  قالب‌های آماده
                </h3>
                <div className="space-y-2">
                  {promptTemplates.map((template, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleSendMessage(template.prompt)}
                      disabled={isLoading}
                      className="w-full p-3 rounded-xl bg-muted/50 hover:bg-muted text-right transition-all group flex items-center gap-3 border border-transparent hover:border-primary/20 disabled:opacity-50"
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shrink-0 transition-transform group-hover:scale-110",
                        template.color
                      )}>
                        <template.icon size={18} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{template.title}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              {plan && (
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                  <h3 className="font-bold text-xs text-muted-foreground mb-3 uppercase tracking-wide">آمار پروژه</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="text-center p-2 rounded-lg bg-background/50">
                      <p className="font-bold text-lg text-foreground">{totalSteps}</p>
                      <p className="text-muted-foreground">مرحله</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-background/50">
                      <p className="font-bold text-lg text-primary">{completedCount}</p>
                      <p className="text-muted-foreground">تکمیل شده</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-6 h-12 bg-muted hover:bg-primary/10 rounded-l-lg items-center justify-center text-muted-foreground hover:text-primary transition-colors border-l border-y border-border/50"
      >
        {sidebarOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="shrink-0 p-4 md:p-6 border-b border-border/40 bg-gradient-to-l from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/30"
              >
                <Bot size={24} />
              </motion.div>
              <div>
                <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                  دستیار کارنکس
                  <Badge variant="accent" className="text-[10px] gap-1">
                    <Zap size={10} />
                    AI
                  </Badge>
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  مشاور کسب‌وکار هوشمند
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {messages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={exportConversation}
                    className="text-muted-foreground hover:text-foreground gap-2"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">خروجی</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="text-muted-foreground hover:text-destructive gap-2"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">پاک کردن</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 no-scrollbar"
        >
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg, index) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index < 3 ? index * 0.1 : 0 }}
                className={cn(
                  "flex",
                  msg.role === 'user' ? "justify-start" : "justify-end"
                )}
              >
                <div className={cn(
                  "max-w-[85%] md:max-w-[75%] group relative",
                  msg.role === 'user' ? "pr-10" : "pl-10"
                )}>
                  <div 
                    className={cn(
                      "p-4 md:p-5 rounded-2xl text-sm leading-8",
                      msg.role === 'user' 
                        ? "bg-gradient-to-l from-primary to-purple-600 text-white rounded-br-sm shadow-lg shadow-primary/20" 
                        : "bg-card border border-border/50 text-foreground rounded-bl-sm shadow-sm"
                    )}
                  >
                    <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                  
                  {/* Message Meta */}
                  <div className={cn(
                    "flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground",
                    msg.role === 'user' ? "justify-start" : "justify-end"
                  )}>
                    <span>{formatTime(msg.timestamp)}</span>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => copyMessage(msg.content, msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-foreground"
                        title="کپی"
                      >
                        {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <div className="bg-card border border-border/50 p-5 rounded-2xl rounded-bl-sm flex items-center gap-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  </div>
                  <span className="text-sm text-muted-foreground">در حال تحلیل...</span>
                </div>
              </motion.div>
            )}

            {/* Follow-up Suggestions */}
            <AnimatePresence>
              {showFollowUps.length > 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-wrap justify-end gap-2 pt-2"
                >
                  {showFollowUps.map((q, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => handleSendMessage(q)}
                      className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-full transition-all border border-primary/20 hover:scale-105"
                    >
                      {q}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input Area */}
        <div className="shrink-0 p-4 md:p-6 border-t border-border/40 bg-card/30 backdrop-blur-xl">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="سوال خود را بپرسید..."
                  className="input-premium w-full min-h-[52px] max-h-32 resize-none py-3.5 pl-12"
                  dir="rtl"
                  rows={1}
                />
                <div className="absolute left-3 bottom-3 text-xs text-muted-foreground">
                  Enter ↵
                </div>
              </div>
              <Button 
                type="submit"
                variant="gradient"
                size="lg"
                disabled={!input.trim() || isLoading}
                className="shrink-0 h-[52px] w-[52px] rounded-xl"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-3">
              دستیار کارنکس بر اساس اطلاعات پروژه شما پاسخ می‌دهد • Shift+Enter برای خط جدید
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
