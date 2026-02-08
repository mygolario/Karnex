"use client";

import { PageTourHelp } from "@/components/features/onboarding/page-tour-help";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot, Send, Loader2, Trash2, Rocket, Zap, Copy, Check, TrendingUp,
  Target, Users, DollarSign, Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChatMessage, AssistantData, DailyMission } from "@/lib/db";

// Mission Control Components
import { DailyGreeting } from "@/components/dashboard/assistant/daily-greeting";
import { DailyMissions, generateDailyMissions } from "@/components/dashboard/assistant/daily-missions";
import { AIInsightCard, AIInsight, generateDailyInsights } from "@/components/dashboard/assistant/ai-insight";
import { SmartActionCard, ActionCard } from "@/components/dashboard/assistant/action-card";
import { VoiceInput } from "@/components/dashboard/assistant/voice-input";
import { Celebration, triggerConfetti, triggerStars } from "@/components/dashboard/assistant/celebration";
import { XpFloat, XpBadge } from "@/components/dashboard/assistant/xp-float";
import { StreakDisplay } from "@/components/dashboard/assistant/streak-display";

// Prompt templates
const promptTemplates = [
  { icon: TrendingUp, title: "رشد", prompt: "استراتژی رشد ۶ ماهه برای پروژه‌ام پیشنهاد بده", color: "from-blue-500 to-cyan-500" },
  { icon: Target, title: "SWOT", prompt: "تحلیل SWOT پروژه من رو انجام بده", color: "from-purple-500 to-pink-500" },
  { icon: Users, title: "مشتری", prompt: "چطور اولین ۱۰۰ مشتری رو جذب کنم؟", color: "from-amber-500 to-orange-500" },
  { icon: DollarSign, title: "مالی", prompt: "بودجه‌بندی و منابع مالی پروژه رو تحلیل کن", color: "from-emerald-500 to-teal-500" },
  { icon: Wand2, title: "بهبود", prompt: "چطور ایده‌ام رو بهتر و متمایزتر کنم؟", color: "from-rose-500 to-red-500" },
];

export default function AssistantPage() {
  const { user } = useAuth();
  const { activeProject: plan, updateActiveProject } = useProject();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Gamification state
  const [streak, setStreak] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [celebrationType, setCelebrationType] = useState<"confetti" | "stars" | "mission" | null>(null);
  const [xpGain, setXpGain] = useState({ amount: 0, trigger: false });

  // Mission Control state
  const [missions, setMissions] = useState<any[]>([]); 
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [pendingActions, setPendingActions] = useState<ActionCard[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Sanitization Helper to prevent "undefined" Firestore errors
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

  // Robust Update Function
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

          // Explicitly sanitize messages array if present
          if (newData.messages) {
             newData.messages = newData.messages.map(m => ({
                 ...m,
                 followUps: m.followUps || [],
                 actions: m.actions || [],
                 xpReward: m.xpReward || 0
             }));
          }

          const sanitizedData = sanitizeForFirestore(newData);
          
          // Optimistic update via context
          await updateActiveProject({
              assistantData: sanitizedData
          });
          
      } catch (err) {
          console.error("Failed to save assistant data:", err);
          toast.error("مشکل در ذخیره‌سازی");
      } finally {
          setTimeout(() => setIsSaving(false), 800);
      }
  };

  // Load Assistant Data
  useEffect(() => {
    if (plan?.assistantData) {
      setMessages(plan.assistantData.messages || []);
      setStreak(plan.assistantData.streak || 0);
      setTotalXp(plan.assistantData.totalXp || 0);
      
      // Check for Streak Logic
      const lastVisit = plan.assistantData.lastVisit;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (lastVisit !== today) {
        let newStreak = plan.assistantData.streak || 0;
        if (lastVisit === yesterday) {
           newStreak += 1;
           if ([3, 7, 14, 30].includes(newStreak)) {
             setTimeout(() => setCelebrationType("stars"), 1000);
           }
        } else if (lastVisit && lastVisit !== today) {
           newStreak = 1;
        } else {
            newStreak = 1;
        }
        
        if (newStreak !== plan.assistantData.streak) {
            setStreak(newStreak);
            updateAssistantData({ streak: newStreak, lastVisit: today });
        }
      }

      if (plan.projectName) {
          const totalSteps = plan?.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 0;
          const completedCount = plan?.completedSteps?.length || 0;
          const progress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
          setMissions(generateDailyMissions(plan.projectName, progress));
          setInsights(generateDailyInsights(plan.projectName));
      }

    } else if (plan) {
        // Initialize Empty Data
        updateActiveProject({
            assistantData: {
                messages: [],
                streak: 1,
                totalXp: 0,
                lastVisit: new Date().toDateString(),
                missions: []
            }
        });
        setStreak(1);
    }
  }, [plan?.id]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showFollowUps, pendingActions]);

  const awardXp = useCallback((amount: number) => {
    setXpGain({ amount, trigger: true });
    setTotalXp(prev => {
        const newTotal = prev + amount;
        updateAssistantData({ totalXp: newTotal });
        return newTotal;
    });
    if (amount >= 25) triggerStars();
  }, [plan]);

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || isLoading) return;

    setInput("");
    setShowFollowUps([]);
    setPendingActions([]); // Clear previous actions on new chat

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
    
    // Save User Message
    updateAssistantData({ messages: newMessages });

    setIsLoading(true);
    awardXp(10); // XP for chatting

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
          requestActions: true
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
          actions: data.actions || [],
          xpReward: data.xpReward || 0
        };

        const updatedMessages = [...newMessages, assistantMessage];
        setMessages(updatedMessages);
        
        // Save Assistant Message
        updateAssistantData({ messages: updatedMessages });

        if (data.followUps?.length > 0) setShowFollowUps(data.followUps);
        if (data.actions?.length > 0) setPendingActions(data.actions);
        if (data.xpReward) awardXp(data.xpReward);
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در ارتباط با دستیار");
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
      setMessages([]);
      setShowFollowUps([]);
      setPendingActions([]);
      updateAssistantData({ messages: [] });
      toast.success("تاریخچه چت پاک شد");
  };

  const handleMissionComplete = (missionId: string) => {
      setMissions(prev => prev.map(m => m.id === missionId ? { ...m, completed: true } : m));
      const mission = missions.find(m => m.id === missionId);
      if (mission) {
          awardXp(mission.xpReward || 20);
          setCelebrationType("mission");
      }
  };

  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      
      <Celebration type={celebrationType || "confetti"} trigger={celebrationType !== null} onComplete={() => setCelebrationType(null)} />
      <XpFloat amount={xpGain.amount} trigger={xpGain.trigger} position={{ x: 50, y: 30 }} onComplete={() => setXpGain({ amount: 0, trigger: false })} />

      {/* Sidebar - Missions & Insights (Hidden on mobile) */}
      <aside className="hidden lg:flex flex-col w-80 shrink-0 gap-4 overflow-y-auto no-scrollbar pb-10">
        <DailyGreeting
          userName={user?.displayName || "کاربر"}
          projectName={plan?.projectName}
          streak={streak}
          totalXp={totalXp}
          progressPercent={0} // Calc stats if needed
          todayMission={missions.find(m => !m.completed)?.title}
        />
        <DailyMissions missions={missions} onMissionClick={(m) => m.actionPrompt && handleSendMessage(m.actionPrompt)} onMissionComplete={handleMissionComplete} />
        <AIInsightCard insights={insights} onAction={(i) => i.actionPrompt && handleSendMessage(i.actionPrompt)} />
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-muted/20 rounded-3xl border border-muted-foreground/10 overflow-hidden shadow-sm">
        


        {/* Header */}
        <div className="shrink-0 p-4 border-b border-border/40 bg-background/50 backdrop-blur-sm flex justify-between items-center" data-tour-id="copilot-header">
            <div className="flex items-center gap-3">
                 <PageTourHelp tourId="copilot" />
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <Bot size={20} />
                 </div>
                 <div>
                    <h1 className="font-bold flex items-center gap-2">مرکز فرماندهی <Badge variant="secondary" className="text-[10px] h-5">Beta</Badge></h1>
                    <p className="text-xs text-muted-foreground">دستیار هوشمند شما</p>
                 </div>
            </div>
            
            {/* Actions & Status */}
            <div className="flex items-center gap-1">
                <AnimatePresence>
                    {isSaving && (
                        <motion.div 
                            initial={{ opacity: 0, x: 10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0 }}
                            className="text-[10px] text-muted-foreground mr-2 font-medium bg-background/50 px-2 py-1 rounded-full border border-primary/20 flex items-center gap-1"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            در حال ذخیره...
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
            </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                     <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 animate-pulse">
                        <Rocket size={40} />
                     </div>
                     <h2 className="text-2xl font-black mb-2">چطور می‌تونم کمکت کنم؟</h2>
                     <p className="text-muted-foreground mb-8 max-w-sm">از بین سوالات آماده انتخاب کن یا سوال خودت رو بپرس.</p>
                     
                     <div className="flex flex-wrap justify-center gap-2 max-w-lg" data-tour-id="prompt-templates">
                        {promptTemplates.map((t, i) => (
                            <button key={i} onClick={() => handleSendMessage(t.prompt)} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-background border hover:border-primary hover:text-primary transition-all shadow-sm">
                                <t.icon size={14} /> {t.title}
                            </button>
                        ))}
                     </div>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[85%] rounded-2xl p-5 text-sm leading-7 shadow-sm",
                                msg.role === 'user' 
                                    ? "bg-primary text-primary-foreground rounded-br-none" 
                                    : "bg-background border rounded-bl-none"
                            )}>
                                <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap dark:text-gray-200">
                                    {msg.content}
                                </div>
                                {msg.role === 'assistant' && (
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/10 text-[10px] opacity-70">
                                        <span>AI Assistant</span>
                                        <button onClick={() => { navigator.clipboard.writeText(msg.content); toast.success("کپی شد"); }}>
                                            <Copy size={12} className="hover:text-primary" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="bg-background border px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1 shadow-sm">
                                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
                             </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Follow Ups */}
            {showFollowUps.length > 0 && !isLoading && (
                <div className="flex flex-wrap justify-end gap-2 max-w-3xl mx-auto pt-2">
                    {showFollowUps.map((q, i) => (
                        <button key={i} onClick={() => handleSendMessage(q)} className="text-xs bg-primary/5 text-primary px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors">
                            {q}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Input */}
        <div className="shrink-0 p-4 bg-background border-t" data-tour-id="chat-input">
            <div className="max-w-3xl mx-auto flex gap-2 items-end">
                <VoiceInput onTranscript={(text) => handleSendMessage(text)} disabled={isLoading} />
                <div className="flex-1 relative">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder="اینجا بنویس..."
                        className="w-full min-h-[50px] max-h-32 resize-none rounded-xl border bg-muted/30 p-3 pl-10 focus:ring-2 ring-primary/20 outline-none text-sm custom-scrollbar"
                    />
                </div>
                <Button size="icon" className="h-[50px] w-[50px] rounded-xl shrink-0" onClick={() => handleSendMessage()} disabled={!input.trim() || isLoading}>
                    <Send size={20} />
                </Button>
            </div>
        </div>

      </div>
    </div>
  );
}
