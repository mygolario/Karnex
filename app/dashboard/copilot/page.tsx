"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import {
  Bot, Send, Loader2, Trash2, Copy, RefreshCw,
  Briefcase, Target, Users, TrendingUp, Sparkles,
  MessageSquare, Mic, ArrowUp, Search, Presentation, HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChatMessage, AssistantData } from "@/lib/db";
import { DollarSign } from "lucide-react";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";
import { useTour } from "@/components/features/onboarding/tour-context";

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
    title: "مدیر پروژه هوشمند",
    description: "من اینجا هستم تا در ساخت و تکمیل پروژه‌تان به شما کمک کنم. می‌توانم بیزنس پلن را پر کنم، اسلاید بسازم و تسک‌های رودمپ را اضافه کنم.",
    systemPrompt: "You are Karnex Project Manager. Proactive, helpful, and capable of executing tasks.",
    prompts: professionalPrompts,
    icon: Briefcase,
    gradient: "from-primary/10 to-blue-500/10",
    badge: "Project Manager",
    badgeColor: "bg-emerald-500"
  },
  traditional: {
    title: "مشاور کسب‌وکار",
    description: "همراه شما در مدیریت بهینه، افزایش فروش و توسعه بازار. بیایید کسب‌وکارتان را رونق دهیم.",
    systemPrompt: "...",
    prompts: traditionalPrompts,
    icon: Briefcase,
    gradient: "from-amber-500/10 to-orange-500/10",
    badge: "Business Mode",
    badgeColor: "bg-amber-500"
  },
  creator: {
    title: "مشاور تولید محتوا",
    description: "من اینجا هستم تا در ایده‌پردازی، تقویم محتوایی و رشد برند شخصی به شما کمک کنم. بیایید با هم محتوای وایرال بسازیم!",
    systemPrompt: "...",
    prompts: creatorPrompts,
    icon: Mic,
    gradient: "from-purple-500/10 to-pink-500/10",
    badge: "Creator Mode",
    badgeColor: "bg-purple-500"
  }
};

export default function CopilotPage() {
  const { user } = useAuth();
  const { activeProject: plan, updateActiveProject, refreshProjects } = useProject();
  const { startTour } = useTour();
  
  // Determine Persona
  let activePersona = PERSONAS.default;
  if (plan?.projectType === 'creator') activePersona = PERSONAS.creator;
  else if (plan?.projectType === 'traditional') activePersona = PERSONAS.traditional;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  
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
                 xpReward: m.xpReward || 0,
                 tool_call: m.tool_call || undefined
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

  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const [selectedContexts, setSelectedContexts] = useState<any[]>([]); // Stores data of mentioned items

  type MentionItem = {
    id: string;
    type: 'roadmap' | 'canvas' | 'slide';
    title: string;
    subtitle: string;
    data: any; // The actual content to send to AI
    icon: any;
  };

  const getMentionableItems = (): MentionItem[] => {
      // Always return at least one item for testing/help
      const items: MentionItem[] = [
          {
              id: 'help_general',
              type: 'roadmap', 
              title: 'راهنمایی کلی',
              subtitle: 'سوالی درباره پروژه دارید؟',
              data: { context: 'general_help' },
              icon: Sparkles
          }
      ];

      if (!plan) return items;

      // 1. Roadmap Tasks
      // 1. Roadmap Tasks
      if (plan.roadmap && Array.isArray(plan.roadmap) && plan.roadmap.length > 0) {
          
          // Add Full Roadmap Context
          items.push({
              id: 'roadmap_full',
              type: 'roadmap',
              title: 'کل نقشه راه',
              subtitle: `برنامه اجرایی کامل (${plan.roadmap.length} فاز)`,
              data: { type: 'full_roadmap', phases: plan.roadmap },
              icon: TrendingUp
          });

          plan.roadmap.forEach((phase: any) => {
              if (phase.steps && Array.isArray(phase.steps)) {
                  phase.steps.forEach((step: any) => {
                       items.push({
                           id: step.id || step.title || Math.random().toString(),
                           type: 'roadmap',
                           title: (typeof step === 'string' ? step : step.title) || "تسک بدون عنوان",
                           subtitle: `نقشه راه - فاز ${phase.phase}`,
                           data: step,
                           icon: TrendingUp
                       });
                  });
              }
          });
      }

      // 2. Canvas Sections (and Cards)
      const canvasData = plan.projectType === 'creator' ? plan.brandCanvas : plan.leanCanvas;
      const safeCanvasData = (canvasData && typeof canvasData === 'object') ? canvasData : {};
      const canvasTitle = plan.projectType === 'creator' ? 'بوم برند شخصی' : 'بوم مدل کسب‌وکار';

      if (Object.keys(safeCanvasData).length > 0) {
           // Add Full Canvas Context
           items.push({
              id: 'canvas_full',
              type: 'canvas',
              title: `کل ${canvasTitle}`,
              subtitle: 'تمام بخش‌های بوم برای تحلیل جامع',
              data: { type: 'full_canvas', content: safeCanvasData },
              icon: Target
          });
      }

      const persianKeys: Record<string, string> = {
          'customerSegments': 'بخش‌های مشتری',
          'valueProposition': 'ارزش پیشنهادی',
          'channels': 'کانال‌ها',
          'customerRelations': 'روابط مشتری',
          'revenueStream': 'جریان درآمد',
          'keyResources': 'منابع کلیدی',
          'keyActivities': 'فعالیت‌های کلیدی',
          'keyPartners': 'شرکای کلیدی',
          'costStructure': 'ساختار هزینه',
          // Brand
          'identity': 'هویت برند',
          'audience': 'مخاطب',
          'contentStrategy': 'استراتژی محتوا'
      };

      Object.keys(safeCanvasData).forEach((key) => {
          const content = (safeCanvasData as any)[key];
          const persianTitle = persianKeys[key] || key;

          // Add the Section itself
          items.push({
              id: `section_${key}`,
              type: 'canvas',
              title: persianTitle, 
              subtitle: "بخش تحلیل کسب و کار",
              data: { section: key, content },
              icon: Target
          });
          
          // Add individual cards if array
          if (Array.isArray(content)) {
              content.forEach((card: any) => {
                  if (card) {
                    items.push({
                        id: card.id || Math.random().toString(),
                        type: 'canvas',
                        title: String(card.content || "کارت خالی").substring(0, 30) + "...",
                        subtitle: `کارت در ${persianTitle}`,
                        data: card,
                        icon: Target
                    });
                  }
              });
          }
      });

      // 3. Pitch Deck Slides
      if (plan.pitchDeck && Array.isArray(plan.pitchDeck) && plan.pitchDeck.length > 0) {
          
          // Add Full Deck Context
          items.push({
              id: 'pitch_deck_full',
              type: 'slide',
              title: 'کل پیچ‌دک',
              subtitle: `نسخه دستیار کارنکس (${plan.pitchDeck.length} اسلاید)`,
              data: { type: 'full_deck', slides: plan.pitchDeck },
              icon: Presentation
          });

          const slideTypeMap: Record<string, string> = {
              'title': 'عنوان',
              'problem': 'مشکل',
              'solution': 'راهکار',
              'market': 'اندازه بازار',
              'market_size': 'اندازه بازار',
              'business_model': 'مدل درآمدی',
              'traction': 'دستاوردها',
              'team': 'تیم',
              'ask': 'سرمایه',
              'generic': 'توضیحات',
              'why_now': 'چرا الان؟',
              'product': 'محصول',
              'competition': 'رقبا'
          };

          plan.pitchDeck.forEach((slide: any, index: number) => {
              const persianType = slideTypeMap[slide.type] || slide.type;
              items.push({
                  id: slide.id || Math.random().toString(),
                  type: 'slide',
                  title: slide.title || `اسلاید ${index + 1}`,
                  subtitle: `اسلاید ${persianType}`,
                  data: slide,
                  icon: Presentation
              });
          });
      }

      return items;
  };

  const mentionableItems = getMentionableItems();
  const filteredMentions = mentionableItems.filter(item => 
      item.title.toLowerCase().includes(mentionQuery.toLowerCase()) || 
      item.subtitle.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 5); // Limit to 5

  const insertMention = (item: MentionItem) => {
      const parts = input.split('@');
      parts.pop(); // Remove the partial query
      const newValue = parts.join('@') + `@${item.title.replace(/\s+/g, '_')} `;
      setInput(newValue);
      setShowMentionMenu(false);
      setMentionQuery("");
      setMentionIndex(0);
      
      // Add to context if not already there
      if (!selectedContexts.find(c => c.id === item.id)) {
          setSelectedContexts([...selectedContexts, item]);
      }
      
      inputRef.current?.focus();
  };
  
  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || isLoading) return;

    setInput("");
    setSelectedContexts([]); // Clear context after sending

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
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: plan?.id,
          messages: newMessages.slice(-8).map(m => ({ role: m.role, content: m.content })),
          context: selectedContexts.length > 0 ? selectedContexts.map(c => c.data) : undefined // Send selected context
        })
      });

      const data = await response.json();
      console.log("[Copilot] API Response:", data);

      if (data.error === "AI_LIMIT_REACHED" || response.status === 429) {
        setShowLimitModal(true);
        setIsLoading(false);
        return;
      }

      if (data.error) throw new Error(data.error);

      // Handle Tool Call Result
      if (data.tool_call) {
          console.log("[Copilot] Tool Executed:", data.tool_call);
          const toolResult = data.tool_call.result;
          
          if (data.tool_call.status === 'success') {
              try {
                console.log("[Copilot] Refreshing Projects...");
                await refreshProjects();
                console.log("[Copilot] Projects Refreshed.");
                toast.success("تغییرات اعمال شد");
              } catch(e) { 
                  console.error("Refresh failed", e); 
                  toast.error("خطا در به‌روزرسانی داده‌ها");
              }
          } else {
              toast.error(toolResult.error || "خطا در انجام عملیات");
          }

          const assistantMessage: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: data.content || toolResult.message || "عملیات انجام شد.",
            timestamp: Date.now(),
            tool_call: data.tool_call
          };

          const updatedMessages = [...newMessages, assistantMessage];
          setMessages(updatedMessages);
          updateAssistantData({ messages: updatedMessages });

      } else if (data.content) {
          const assistantMessage: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: data.content,
            timestamp: Date.now()
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

   const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentionMenu) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setMentionIndex(prev => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setMentionIndex(prev => Math.min(filteredMentions.length - 1, prev + 1));
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            if (filteredMentions[mentionIndex]) {
                insertMention(filteredMentions[mentionIndex]);
            }
        } else if (e.key === 'Escape') {
            setShowMentionMenu(false);
        }
    } else {
        if(e.key === 'Enter' && !e.shiftKey) { 
            e.preventDefault(); 
            handleSendMessage(); 
        }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setInput(val);

      const lastAt = val.lastIndexOf('@');
      if (lastAt !== -1) {
          const query = val.slice(lastAt + 1);
          console.log("[Mentions] Triggered @:", query);
          
          if (!query.includes(' ') || (query.split(' ').length < 3)) { 
              console.log("[Mentions] Menu Opening. Query:", query);
              setMentionQuery(query);
              setShowMentionMenu(true);
              setMentionIndex(0);
          } else {
              setShowMentionMenu(false);
          }
      } else {
          setShowMentionMenu(false);
      }
  };

  // Debug: Log validation
  useEffect(() => {
      console.log("[Mentions] Render State:", { showMentionMenu, query: mentionQuery, count: filteredMentions.length });
  }, [showMentionMenu, mentionQuery, filteredMentions.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);



  return (
    <div className="h-[calc(100vh-6rem)] relative flex flex-col items-center bg-gradient-to-b from-background to-muted/10 font-sans">
      
      {/* Header - Floating Glass */}
      {/* Header - Floating Glass */}
      <motion.header 
        data-tour-id="copilot-header"
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

            {/* Limit Indicator Removed */}

            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => startTour('copilot')} 
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                title="راهنمای صفحه"
            >
                <HelpCircle size={18} />
            </Button>
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
                     
                     <div data-tour-id="prompt-templates" className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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
                                "text-justify",
                                msg.role === 'user' ? "text-right" : "text-right"
                            )} dir="rtl">
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
                                     {msg.tool_call && (
                                         <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-medium border border-emerald-500/20">
                                             <Sparkles size={10} />
                                             <span>تغییر اعمال شد</span>
                                         </div>
                                     )}
                                     <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                
                                {msg.role === 'assistant' && !msg.tool_call && (
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
                        <div className="flex gap-6" dir="rtl">
                             <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center shrink-0 text-white shadow-lg shadow-blue-500/20 mt-1">
                                <Bot size={18} />
                             </div>
                             <div className="bg-white/50 dark:bg-white/5 border px-5 py-4 rounded-3xl rounded-tl-none flex items-center gap-3 shadow-sm backdrop-blur-sm">
                                <Loader2 size={16} className="animate-spin text-primary" />
                                <span className="text-xs font-medium text-foreground/70 tracking-wide animate-pulse">در حال انجام عملیات...</span>
                             </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Input - Floating Bar */}
        <div className="absolute bottom-6 left-0 right-0 px-4 md:px-0 z-30" data-tour-id="chat-input-container">
            <div className="max-w-3xl mx-auto relative group">
                
                {/* Mention Menu */}
                <AnimatePresence>
                     {showMentionMenu && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full mb-2 left-0 right-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden max-h-72 overflow-y-auto"
                            dir="rtl"
                        >
                             <div className="p-3 text-xs font-semibold text-muted-foreground bg-muted/30 border-b flex items-center gap-2">
                                 <Search size={12} />
                                 برای افزودن زمینه، یک مورد را انتخاب کنید
                             </div>
                             {filteredMentions.length > 0 ? (
                                 <div className="p-1.5 space-y-1">
                                    {filteredMentions.map((item, i) => (
                                        <button
                                            key={item.id}
                                            onClick={() => insertMention(item)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all duration-200 group relative overflow-hidden",
                                                i === mentionIndex 
                                                    ? "bg-primary text-primary-foreground shadow-md transform scale-[1.01]" 
                                                    : "hover:bg-muted text-foreground hover:translate-x-1"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                                i === mentionIndex ? "bg-white/20 text-white" : "bg-muted text-muted-foreground group-hover:bg-background"
                                            )}>
                                                <item.icon size={16} />
                                            </div>
                                            <div className="flex flex-col items-start overflow-hidden flex-1">
                                                 <span className="text-sm font-bold truncate w-full">{item.title}</span>
                                                 <span className={cn("text-[11px] truncate w-full", i === mentionIndex ? "text-white/80" : "text-muted-foreground")}>{item.subtitle}</span>
                                            </div>
                                            {i === mentionIndex && (
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">
                                                    <ArrowUp size={14} className="-rotate-90" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                 </div>
                             ) : (
                                 <div className="p-8 text-center flex flex-col items-center gap-2 text-muted-foreground">
                                     <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                        <Search size={18} />
                                     </div>
                                     <span className="text-xs">موردی یافت نشد</span>
                                 </div>
                             )}
                        </motion.div>
                     )}
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 mx-4"></div>
                
                <div className="relative bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/20 md:rounded-[2rem] rounded-2xl shadow-2xl flex flex-col transition-all focus-within:ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                    
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="از من بخواهید بیزنس پلن را پر کنم یا برای اشاره از @ استفاده کنید..."
                        className="w-full min-h-[60px] max-h-48 resize-none bg-transparent p-5 pl-14 outline-none text-base text-foreground placeholder:text-muted-foreground/60 custom-scrollbar rounded-[2rem]"
                        dir="rtl"
                    />

                    <div className="flex items-center justify-between px-3 pb-3">
                         <div className="flex items-center gap-1">
                             {/* Context Chips (Visual Indicator) */}
                             <div className="flex -space-x-2 px-2 overflow-hidden max-w-[200px]" dir="rtl">
                                {selectedContexts.map((ctx, i) => (
                                     <div key={i} className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center text-[10px] shadow-sm relative z-10 transition-transform hover:scale-110" title={ctx.title}>
                                        <ctx.icon size={12} />
                                     </div>
                                ))}
                             </div>
                             {showMentionMenu && (
                                 <span className="text-[10px] text-muted-foreground animate-pulse px-2 flex items-center gap-1 bg-muted/50 rounded-full py-0.5">
                                     <Search size={10} />
                                      {filteredMentions.length} مورد پیدا شد
                                 </span>
                             )}
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
      <LimitReachedModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
}
