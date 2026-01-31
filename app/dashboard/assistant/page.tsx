"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
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
  Wand2,
  MessageSquare,
  Zap,
  Copy,
  Check,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mission Control Components
import { DailyGreeting } from "@/components/dashboard/assistant/daily-greeting";
import { DailyMissions, Mission, generateDailyMissions } from "@/components/dashboard/assistant/daily-missions";
import { AIInsightCard, AIInsight, generateDailyInsights } from "@/components/dashboard/assistant/ai-insight";
import { SmartActionCard, ActionCard } from "@/components/dashboard/assistant/action-card";
import { VoiceInput } from "@/components/dashboard/assistant/voice-input";
import { Celebration, triggerConfetti, triggerStars } from "@/components/dashboard/assistant/celebration";
import { XpFloat, XpBadge } from "@/components/dashboard/assistant/xp-float";
import { StreakDisplay } from "@/components/dashboard/assistant/streak-display";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  followUps?: string[];
  actions?: ActionCard[];
  xpReward?: number;
}

// Prompt templates
const promptTemplates = [
  { icon: TrendingUp, title: "رشد", prompt: "استراتژی رشد ۶ ماهه برای پروژه‌ام پیشنهاد بده", color: "from-blue-500 to-cyan-500" },
  { icon: Target, title: "SWOT", prompt: "تحلیل SWOT پروژه من رو انجام بده", color: "from-purple-500 to-pink-500" },
  { icon: Users, title: "مشتری", prompt: "چطور اولین ۱۰۰ مشتری رو جذب کنم؟", color: "from-amber-500 to-orange-500" },
  { icon: DollarSign, title: "مالی", prompt: "بودجه‌بندی و منابع مالی پروژه رو تحلیل کن", color: "from-emerald-500 to-teal-500" },
  { icon: Wand2, title: "بهبود", prompt: "چطور ایده‌ام رو بهتر و متمایزتر کنم؟", color: "from-rose-500 to-red-500" },
];

const STORAGE_KEY = "karnex_advisor_history";
const STREAK_KEY = "karnex_assistant_streak";
const XP_KEY = "karnex_assistant_xp";
const MAX_HISTORY = 100;

export default function AssistantPage() {
  const { user } = useAuth();
  const { activeProject: plan } = useProject();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Gamification state
  const [streak, setStreak] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [celebrationType, setCelebrationType] = useState<"confetti" | "stars" | "mission" | null>(null);
  const [xpGain, setXpGain] = useState({ amount: 0, trigger: false });

  // Mission Control state
  const [missions, setMissions] = useState<Mission[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [pendingActions, setPendingActions] = useState<ActionCard[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Calculate project stats
  const totalSteps = plan?.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 0;
  const completedCount = plan?.completedSteps?.length || 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  // Load streak and XP from localStorage
  useEffect(() => {
    if (user) {
      const savedStreak = localStorage.getItem(`${STREAK_KEY}_${user.uid}`);
      const savedXp = localStorage.getItem(`${XP_KEY}_${user.uid}`);
      const lastVisit = localStorage.getItem(`${STREAK_KEY}_${user.uid}_last`);

      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (lastVisit === today) {
        // Same day, keep streak
        setStreak(parseInt(savedStreak || "0"));
      } else if (lastVisit === yesterday) {
        // Consecutive day, increment streak
        const newStreak = (parseInt(savedStreak || "0")) + 1;
        setStreak(newStreak);
        localStorage.setItem(`${STREAK_KEY}_${user.uid}`, newStreak.toString());

        // Celebrate streak milestones
        if ([3, 7, 14, 30].includes(newStreak)) {
          setTimeout(() => setCelebrationType("stars"), 1000);
        }
      } else {
        // Streak broken
        setStreak(1);
        localStorage.setItem(`${STREAK_KEY}_${user.uid}`, "1");
      }

      localStorage.setItem(`${STREAK_KEY}_${user.uid}_last`, today);
      setTotalXp(parseInt(savedXp || "0"));
    }
  }, [user]);

  // Generate daily missions and insights
  useEffect(() => {
    if (plan?.projectName) {
      setMissions(generateDailyMissions(plan.projectName, progressPercent));
      setInsights(generateDailyInsights(plan.projectName));
    }
  }, [plan?.projectName, progressPercent]);

  // Load chat history
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
  }, [user]);

  // Save chat history
  useEffect(() => {
    if (user && messages.length > 0) {
      const toSave = messages.slice(-MAX_HISTORY);
      localStorage.setItem(`${STORAGE_KEY}_${user.uid}`, JSON.stringify(toSave));
    }
  }, [messages, user]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showFollowUps, pendingActions]);

  // XP helper
  const awardXp = useCallback((amount: number) => {
    if (user && amount > 0) {
      setXpGain({ amount, trigger: true });
      setTotalXp(prev => {
        const newTotal = prev + amount;
        localStorage.setItem(`${XP_KEY}_${user.uid}`, newTotal.toString());
        return newTotal;
      });

      // Small celebration for XP
      if (amount >= 25) {
        triggerStars();
      }
    }
  }, [user]);

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || isLoading) return;

    setInput("");
    setShowFollowUps([]);
    setPendingActions([]);

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: messageToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Award XP for asking a question
    awardXp(10);

    // Mark mission as completed if matches
    const questionMission = missions.find(m => m.type === "quick_win" && !m.completed);
    if (questionMission) {
      handleMissionComplete(questionMission.id);
    }

    try {
      const projectContext = plan ? {
        projectName: plan.projectName,
        tagline: plan.tagline,
        overview: plan.overview,
        audience: plan.audience,
        budget: plan.budget,
        leanCanvas: plan.leanCanvas,
        roadmap: plan.roadmap,
        completedSteps: plan.completedSteps,
        marketingStrategy: plan.marketingStrategy,
      } : {};

      const conversationHistory = messages
        .slice(-8)
        .map(m => ({ role: m.role, content: m.content }));

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
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: data.reply,
          timestamp: Date.now(),
          followUps: data.followUps || [],
          actions: data.actions || [],
          xpReward: data.xpReward
        };

        setMessages(prev => [...prev, assistantMessage]);

        if (data.followUps?.length > 0) {
          setShowFollowUps(data.followUps);
        }

        if (data.actions?.length > 0) {
          setPendingActions(data.actions);
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

  const handleMissionClick = (mission: Mission) => {
    if (mission.actionPrompt) {
      handleSendMessage(mission.actionPrompt);
    }
  };

  const handleMissionComplete = (missionId: string) => {
    setMissions(prev => prev.map(m =>
      m.id === missionId ? { ...m, completed: true } : m
    ));

    const mission = missions.find(m => m.id === missionId);
    if (mission) {
      awardXp(mission.xpReward);
      setCelebrationType("mission");
    }
  };

  const handleActionApply = async (action: ActionCard) => {
    // TODO: Implement actual action application
    await new Promise(resolve => setTimeout(resolve, 1500));
    awardXp(action.xpReward);
    triggerConfetti();
  };

  const handleActionDismiss = (actionId: string) => {
    setPendingActions(prev => prev.filter(a => a.id !== actionId));
  };

  const handleInsightAction = (insight: AIInsight) => {
    if (insight.actionPrompt) {
      handleSendMessage(insight.actionPrompt);
    }
    if (insight.xpReward) {
      awardXp(insight.xpReward);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setInput(text);
    // Auto-send voice input
    setTimeout(() => handleSendMessage(text), 500);
  };

  const clearHistory = () => {
    if (user) {
      localStorage.removeItem(`${STORAGE_KEY}_${user.uid}`);
      setMessages([]);
      setShowFollowUps([]);
      setPendingActions([]);
    }
  };

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">

      {/* Celebrations */}
      <Celebration
        type={celebrationType || "confetti"}
        trigger={celebrationType !== null}
        onComplete={() => setCelebrationType(null)}
      />

      {/* XP Float */}
      <XpFloat
        amount={xpGain.amount}
        trigger={xpGain.trigger}
        position={{ x: 50, y: 30 }}
        onComplete={() => setXpGain({ amount: 0, trigger: false })}
      />

      {/* Left Sidebar - Missions & Insights */}
      <aside className="hidden lg:flex flex-col w-80 shrink-0 gap-4 overflow-y-auto no-scrollbar">
        {/* Daily Greeting */}
        <DailyGreeting
          userName={user?.displayName || user?.email?.split("@")[0]}
          projectName={plan?.projectName}
          streak={streak}
          totalXp={totalXp}
          progressPercent={progressPercent}
          todayMission={missions.find(m => !m.completed)?.title}
        />

        {/* Daily Missions */}
        <DailyMissions
          missions={missions}
          onMissionClick={handleMissionClick}
          onMissionComplete={handleMissionComplete}
        />

        {/* AI Insights */}
        <AIInsightCard
          insights={insights}
          onAction={handleInsightAction}
        />
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-card/30 rounded-2xl border border-border/40 overflow-hidden">
        {/* Header */}
        <div className="shrink-0 p-4 md:p-5 border-b border-border/40 bg-gradient-to-l from-primary/5 to-transparent">
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
                  مرکز فرماندهی
                  <Badge variant="accent" className="text-[10px] gap-1">
                    <Zap size={10} />
                    AI
                  </Badge>
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  دستیار کسب‌وکار هوشمند
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stats badges */}
              <div className="hidden md:flex items-center gap-2">
                <StreakDisplay streak={streak} size="sm" showLabel={false} />
              </div>

              {/* Actions */}
              {messages.length > 0 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 no-scrollbar"
        >
          {/* Empty state */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center p-8"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-primary/30"
              >
                <Rocket size={40} />
              </motion.div>
              <h2 className="text-2xl font-black text-foreground mb-3">
                سلام! من مشاور کسب‌وکار شما هستم 👋
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md leading-8">
                هر سوالی درباره کسب‌وکارتون دارید بپرسید.
                یا از قالب‌های آماده استفاده کنید.
              </p>

              {/* Quick templates */}
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {promptTemplates.map((template, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleSendMessage(template.prompt)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                      "bg-muted hover:bg-muted/80 text-foreground border border-border/50",
                      "hover:border-primary/30 hover:shadow-lg transition-all"
                    )}
                  >
                    <template.icon size={16} />
                    {template.title}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex",
                  msg.role === 'user' ? "justify-start" : "justify-end"
                )}
              >
                <div className={cn(
                  "max-w-[85%] group relative",
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

                    {/* XP reward badge */}
                    {msg.xpReward && msg.role === 'assistant' && (
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <XpBadge amount={msg.xpReward} variant="small" />
                      </div>
                    )}
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

            {/* Pending Action Cards */}
            <AnimatePresence>
              {pendingActions.length > 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-3"
                >
                  {pendingActions.map((action) => (
                    <SmartActionCard
                      key={action.id}
                      action={action}
                      onApply={handleActionApply}
                      onDismiss={handleActionDismiss}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Follow-up Suggestions */}
            <AnimatePresence>
              {showFollowUps.length > 0 && !isLoading && pendingActions.length === 0 && (
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
        <div className="shrink-0 p-4 md:p-5 border-t border-border/40 bg-card/50 backdrop-blur-xl">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex gap-3 items-end">
              {/* Voice input */}
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                disabled={isLoading}
                className="shrink-0"
              />

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
                  placeholder="سوالت رو بپرس..."
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

            {/* Quick templates for mobile */}
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
              {promptTemplates.slice(0, 4).map((template, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(template.prompt)}
                  disabled={isLoading}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0",
                    "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
                    "border border-border/50 transition-all disabled:opacity-50"
                  )}
                >
                  <template.icon size={12} />
                  {template.title}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
