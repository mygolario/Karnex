"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import {
  Bot, Send, Loader2, Trash2, Copy, RefreshCw,
  Briefcase, Target, Users, TrendingUp, Sparkles,
  MessageSquare, Mic, ArrowUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChatMessage, AssistantData } from "@/lib/db";
import { VoiceInput } from "@/components/dashboard/assistant/voice-input";
import { DollarSign } from "lucide-react";

// Professional Prompts - Enhanced Visuals
const professionalPrompts = [
  { 
    icon: Target, 
    title: "تحلیل استراتژیک", 
    prompt: "نقاط قوت و ضعف مدل کسب‌وکار فعلی من را تحلیل کن.",
    color: "from-blue-500/20 to-blue-600/20 text-blue-600"
  },
  { 
    icon: TrendingUp, 
    title: "برنامه رشد", 
    prompt: "یک برنامه عملیاتی ۳ ماهه برای افزایش جذب کاربر تدوین کن.",
    color: "from-emerald-500/20 to-emerald-600/20 text-emerald-600"

  },
  { 
    icon: Users, 
    title: "پرسونا مشتری", 
    prompt: "پرسونای دقیق مشتری ایده‌آل برای این پروژه را توصیف کن.",
    color: "from-violet-500/20 to-violet-600/20 text-violet-600"
  },
  { 
    icon: DollarSign, 
    title: "مدل درآمدی", 
    prompt: "راهکارهایی برای بهینه‌سازی جریان‌های درآمدی پیشنهاد بده.",
    color: "from-amber-500/20 to-amber-600/20 text-amber-600"
  },
];

const creatorPrompts = [
  { 
    icon: Sparkles, 
    title: "هوک وایرال", 
    prompt: "یک هوک ۳ ثانیه‌ای جذاب برای شروع ویدیو درباره [موضوع] پیشنهاد بده.",
    color: "from-pink-500/20 to-rose-600/20 text-rose-600"
  },
  { 
    icon: MessageSquare, 
    title: "تقویم محتوایی", 
    prompt: "یک برنامه محتوایی هفتگی برای اینستاگرام و یوتیوب تدوین کن.",
    color: "from-purple-500/20 to-indigo-600/20 text-indigo-600"
  },
  { 
    icon: Users, 
    title: "رشد مخاطب", 
    prompt: "استراتژی‌هایی برای افزایش نرخ تعامل (Engagement) پیشنهاد بده.",
    color: "from-blue-500/20 to-cyan-600/20 text-cyan-600"
  },
  { 
    icon: DollarSign, 
    title: "کسب درآمد", 
    prompt: "بهترین روش‌های درآمدزایی از این برند شخصی چیست؟",
    color: "from-emerald-500/20 to-green-600/20 text-emerald-600"
  },
];

const traditionalPrompts = [
  { 
    icon: TrendingUp, 
    title: "افزایش فروش", 
    prompt: "راهکارهای عملی برای افزایش فروش در کوتاه‌مدت پیشنهاد بده.",
    color: "from-emerald-500/20 to-green-600/20 text-emerald-600"
  },
  { 
    icon: Users, 
    title: "مدیریت مشتری", 
    prompt: "چگونه می‌توانم مشتریان فعلی را وفادارتر کنم؟",
    color: "from-blue-500/20 to-indigo-600/20 text-indigo-600"
  },
  { 
    icon: Target, 
    title: "کاهش هزینه‌ها", 
    prompt: "روش‌هایی برای کاهش هزینه‌های عملیاتی و افزایش بهره‌وری پیشنهاد بده.",
    color: "from-rose-500/20 to-red-600/20 text-red-600"
  },
  { 
    icon: Briefcase, 
    title: "توسعه بازار", 
    prompt: "چگونه می‌توانم کسب‌وکارهای مشابه را تحلیل و از آنها پیشی بگیرم؟",
    color: "from-amber-500/20 to-orange-600/20 text-orange-600"
  },
];

const PERSONAS = {
  default: {
    title: "مشاور ارشد استراتژیک",
    description: "من آماده‌ام تا به عنوان یک شریک هوشمند، در تحلیل بازار، تدوین استراتژی و رشد کسب‌وکارتان به شما کمک کنم.",
    systemPrompt: "You are Karnex Assistant, a high-level strategic business consultant. Your tone is professional, concise, and analytical. Focus on actionable insights, financial viability, and market strategy. Do not use emojis excessively. Format your response with clear Markdown headers, bullet points, and bold text for key metrics. Output language: Persian.",
    prompts: professionalPrompts,
    icon: Briefcase,
    gradient: "from-primary/10 to-blue-500/10",
    badge: "Professional Mode",
    badgeColor: "bg-emerald-500"
  },
  traditional: {
    title: "مشاور کسب‌وکار",
    description: "همراه شما در مدیریت بهینه، افزایش فروش و توسعه بازار. بیایید کسب‌وکارتان را رونق دهیم.",
    systemPrompt: "You are Karnex Assistant, a dedicated Business Consultant for traditional businesses (retail, service, manufacturing). Your tone is respectful, experienced, and practical. Focus on operational efficiency, sales techniques, cost reduction, and tangible market expansion. Avoid overly abstract startup jargon. Output language: Persian.",
    prompts: traditionalPrompts,
    icon: Briefcase,
    gradient: "from-amber-500/10 to-orange-500/10",
    badge: "Business Mode",
    badgeColor: "bg-amber-500"
  },
  creator: {
    title: "مشاور تولید محتوا",
    description: "من اینجا هستم تا در ایده‌پردازی، تقویم محتوایی و رشد برند شخصی به شما کمک کنم. بیایید با هم محتوای وایرال بسازیم!",
    systemPrompt: "You are Karnex Assistant, a specialized Content Creator Consultant. Your tone is creative, energetic, and trend-focused. Focus on audience engagement, viral strategies, storytelling, and brand consistency. Use relevant emojis to keep the vibe high. Output language: Persian.",
    prompts: creatorPrompts,
    icon: Mic,
    gradient: "from-purple-500/10 to-pink-500/10",
    badge: "Creator Mode",
    badgeColor: "bg-purple-500"
  }
};

export default function CopilotPage() {
  const { user } = useAuth();
  const { activeProject: plan, updateActiveProject } = useProject();
  
  // Determine Persona
  let activePersona = PERSONAS.default;
  if (plan?.projectType === 'creator') activePersona = PERSONAS.creator;
  else if (plan?.projectType === 'traditional') activePersona = PERSONAS.traditional;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Sanitization Helper
  const sanitizeForFirestore = (obj: any): any => {
    if (obj === undefined) return null;
    if (obj === null) return null;
    if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
    if (typeof obj === 'object') {
      const newObj: any = {};
      for (const key in obj) {
        const val = sanitizeForFirestore(obj[key]);
        if (val !== undefined) newObj[key] = val;
      }
      return newObj;
    }
    return obj;
  };

  // Robust Persistence
  const updateAssistantData = async (updates: Partial<AssistantData>) => {
      if (!plan) return;
      setIsSaving(true);
      
      try {
          const currentData = plan.assistantData || { 
              messages: [], 
              streak: 0, 
              totalXp: 0, 
              missions: [], 
              lastVisit: new Date().toDateString() 
          };
          
          const newData = { ...currentData, ...updates };

          if (newData.messages) {
             newData.messages = newData.messages.map(m => ({
                 ...m,
                 followUps: m.followUps || [],
                 actions: m.actions || [],
                 xpReward: m.xpReward || 0
             }));
          }

          const sanitizedData = sanitizeForFirestore(newData);
          
          await updateActiveProject({
              assistantData: sanitizedData
          });
          
      } catch (err) {
          console.error("Failed to save assistant data:", err);
      } finally {
          setTimeout(() => setIsSaving(false), 800);
      }
  };

  // Load Data
  useEffect(() => {
    if (plan?.assistantData) {
      setMessages(plan.assistantData.messages || []);
    }
  }, [plan?.id]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || isLoading) return;

    setInput("");

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: messageToSend,
      timestamp: Date.now(),
      followUps: [],
      actions: [],
      xpReward: 0
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    updateAssistantData({ messages: newMessages });

    setIsLoading(true);

    try {
      const projectContext = plan ? {
        projectName: plan.projectName,
        tagline: plan.tagline,
        overview: plan.overview,
        audience: plan.audience,
        budget: plan.budget,
        leanCanvas: plan.leanCanvas,
        roadmap: plan.roadmap,
      } : {};

      const conversationHistory = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/advisor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          projectContext,
          conversationHistory,
          requestActions: false, 
          systemPromptOverride: activePersona.systemPrompt
        })
      });

      const data = await res.json();

      if (data.reply) {
        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: data.reply,
          timestamp: Date.now(),
          followUps: data.followUps || [],
          actions: [],
          xpReward: 0
        };

        const updatedMessages = [...newMessages, assistantMessage];
        setMessages(updatedMessages);
        updateAssistantData({ messages: updatedMessages });
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
      setMessages([]);
      updateAssistantData({ messages: [] });
      toast.success("چت پاک شد");
  };

  return (
    <div className="h-[calc(100vh-6rem)] relative flex flex-col items-center bg-gradient-to-b from-background to-muted/10 font-sans">
      
      {/* Dynamic Background Mesh (Subtle) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      {/* Header - Floating Glass */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl mx-auto mt-4 shrink-0 h-16 rounded-2xl border border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl shadow-sm flex items-center justify-between px-6 z-20"
      >
        <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Sparkles size={20} />
             </div>
             <div>
                <h1 className="font-bold text-base tracking-tight flex items-center gap-2">دستیار هوشمند کارنکس</h1>
                <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground flex items-center gap-1.5 opacity-80">
                    <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]", activePersona.badgeColor)}></div>
                    {activePersona.badge}
                </span>
             </div>
        </div>
        
        <div className="flex items-center gap-2">
            <AnimatePresence>
                {isSaving && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full border border-white/5"
                    >
                        <RefreshCw size={10} className="animate-spin" />
                        Saving
                    </motion.div>
                )}
            </AnimatePresence>
            {messages.length > 0 && (
              <Button variant="ghost" size="icon" onClick={clearHistory} className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 size={16} />
              </Button>
            )}
        </div>
      </motion.header>

      {/* Content Area */}
      <div className="flex-1 w-full max-w-3xl flex flex-col relative z-10">
        
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 space-y-8 customize-scrollbar pb-60">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                     <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8 relative"
                     >
                        <div className={cn("w-24 h-24 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl bg-gradient-to-tr", activePersona.gradient)}>
                             <activePersona.icon size={40} strokeWidth={1.5} className="text-foreground/80" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-2 shadow-lg border">
                            <Sparkles size={16} className={cn("fill-current", plan?.projectType === 'creator' ? "text-purple-500" : "text-amber-500")} />
                        </div>
                     </motion.div>

                     <h3 className="text-2xl font-bold tracking-tight mb-3">{activePersona.title}</h3>
                     <p className="text-base text-muted-foreground mb-10 max-w-lg leading-relaxed">
                         {activePersona.description}
                     </p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {activePersona.prompts.map((t, i) => (
                            <motion.button 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => handleSendMessage(t.prompt)} 
                                className="flex items-center gap-4 p-4 rounded-2xl border bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg transition-all text-right group backdrop-blur-sm"
                            >
                                <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0", t.color)}>
                                    <t.icon size={18} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-semibold text-foreground/90 group-hover:text-primary transition-colors">{t.title}</span>
                                    <span className="text-[11px] text-muted-foreground/70 truncate max-w-[180px]">{t.prompt}</span>
                                </div>
                            </motion.button>
                        ))}
                     </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {messages.map((msg, i) => (
                        <motion.div 
                          key={msg.id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={cn("flex gap-4 md:gap-6 group", msg.role === 'user' ? "flex-row-reverse" : "")}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border mt-1",
                                msg.role === 'user' ? "bg-white dark:bg-zinc-800 text-primary border-primary/20" : "bg-gradient-to-tr from-primary to-blue-600 text-white border-transparent shadow-blue-500/20 shadow-lg"
                            )}>
                                {msg.role === 'user' ? <Users size={18} /> : <Sparkles size={18} />}
                            </div>
                            
                            <div className={cn(
                                "max-w-[85%] md:max-w-[75%]",
                                msg.role === 'user' ? "text-left" : ""
                            )}>
                                <div className="flex items-center gap-2 mb-1.5 px-1">
                                    <span className="text-xs font-semibold opacity-70">
                                        {msg.role === 'user' ? 'شما' : 'دستیار کارنکس'}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground opacity-40">
                                        {new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                
                                <div className={cn(
                                    "text-[15px] leading-8 rounded-3xl p-5 shadow-sm relative overflow-hidden",
                                    msg.role === 'user' 
                                        ? "bg-white dark:bg-zinc-800/80 text-foreground border rounded-tr-sm" 
                                        : "bg-white/80 dark:bg-white/5 backdrop-blur-md border border-white/10 rounded-tl-sm ring-1 ring-white/20"
                                )}>
                                     {/* Markdown-like styling applied via global CSS or utility classes ideally. For now, whitespace-pre-wrap works. */}
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                
                                {msg.role === 'assistant' && (
                                    <div className="flex items-center gap-2 mt-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-background/80"
                                            onClick={() => { navigator.clipboard.writeText(msg.content); toast.success("کپی شد"); }}
                                        >
                                            <Copy size={13} />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-6">
                             <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center shrink-0 text-white shadow-lg shadow-blue-500/20 mt-1">
                                <Bot size={18} />
                             </div>
                             <div className="bg-white/50 dark:bg-white/5 border px-5 py-4 rounded-3xl rounded-tl-none flex items-center gap-3 shadow-sm backdrop-blur-sm">
                                <Loader2 size={16} className="animate-spin text-primary" />
                                <span className="text-xs font-medium text-foreground/70 tracking-wide animate-pulse">در حال تحلیل و نگارش...</span>
                             </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Input - Floating Bar */}
        <div className="absolute bottom-6 left-0 right-0 px-4 md:px-0 z-30">
            <div className="max-w-3xl mx-auto relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 mx-4"></div>
                
                <div className="relative bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/20 md:rounded-[2rem] rounded-2xl shadow-2xl flex flex-col transition-all focus-within:ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                    
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder="پیام یا درخواست خود را تایپ کنید..."
                        className="w-full min-h-[60px] max-h-48 resize-none bg-transparent p-5 pl-14 outline-none text-base text-foreground placeholder:text-muted-foreground/60 custom-scrollbar rounded-[2rem]"
                    />

                    <div className="flex items-center justify-between px-3 pb-3">
                         <div className="flex items-center gap-1">
                            <VoiceInput onTranscript={(text) => handleSendMessage(text)} disabled={isLoading} />
                         </div>

                         <Button 
                            size="icon" 
                            className={cn(
                                "h-10 w-10 rounded-full shadow-md transition-all duration-300",
                                input.trim() ? "bg-primary hover:bg-primary/90 hover:scale-110" : "bg-muted text-muted-foreground hover:bg-muted"
                            )}
                            onClick={() => handleSendMessage()} 
                            disabled={!input.trim() || isLoading}
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={20} strokeWidth={2.5} />}
                        </Button>
                    </div>
                </div>
                
                <p className="text-[10px] text-center text-muted-foreground mt-3 opacity-50 mix-blend-plus-lighter font-medium">
                    دستیار هوشمند کارنکس ممکن است اشتباه کند. لطفاً اطلاعات مهم را بررسی کنید.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}
