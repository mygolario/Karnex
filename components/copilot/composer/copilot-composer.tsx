"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "@/contexts/project-context";
import { useCopilotStore, generateId } from "@/lib/copilot/store";
import type { MentionItem, CopilotMessage, SlashCommand } from "@/lib/copilot/types";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  Square,
  Search,
  X,
  Mic,
  Paperclip,
  Sparkles,
  TrendingUp,
  Target,
  Presentation,
  HelpCircle,
  CalendarDays,
  FileText,
  ClipboardList,
  MapPin,
  DollarSign,
  Zap,
  Lightbulb,
  Compass,
  Slash as SlashIconLucide,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";

const SLASH_COMMANDS: (SlashCommand & { prompt: string })[] = [
  { command: "/plan", label: "برنامه‌ریزی", description: "یک برنامه عملیاتی تدوین کن", icon: "Compass", prompt: "یک برنامه عملیاتی گام‌به‌گام برای پروژه‌ام تدوین کن." },
  { command: "/critique", label: "نقد و بررسی", description: "مدل کسب‌وکار را نقد کن", icon: "Zap", prompt: "مدل کسب‌وکار فعلی من را نقد کن و نقاط ضعف را بگو." },
  { command: "/competitors", label: "تحلیل رقبا", description: "رقبای بازار را تحلیل کن", icon: "TrendingUp", prompt: "رقبای اصلی بازار من را شناسایی و تحلیل کن." },
  { command: "/swot", label: "تحلیل SWOT", description: "جدول SWOT را به‌روزرسانی کن", icon: "Target", prompt: "جدول SWOT کسب‌وکار من را بر اساس اطلاعات پروژه به‌روزرسانی کن." },
  { command: "/script", label: "نوشتن اسکریپت", description: "یک اسکریپت محتوا بنویس", icon: "FileText", prompt: "یک اسکریپت ویدیوی کوتاه با قلاب وایرال بنویس." },
  { command: "/calendar", label: "تقویم محتوا", description: "پست‌های هفته را زمان‌بندی کن", icon: "CalendarDays", prompt: "۳ پست برای این هفته پیشنهاد بده و به تقویم محتوا اضافه کن." },
  { command: "/idea", label: "ایده‌پردازی", description: "ایده‌های وایرال پیشنهاد بده", icon: "Lightbulb", prompt: "۵ ایده محتوای وایرال مرتبط با حوزه‌ام پیشنهاد بده." },
  { command: "/strategy", label: "استراتژی رشد", description: "استراتژی رشد ۳ ماهه", icon: "TrendingUp", prompt: "یک استراتژی رشد ۳ ماهه برای پروژه‌ام تدوین کن." },
];

export function CopilotComposer() {
  const { activeProject: plan, refreshProjects } = useProject();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    input,
    setInput,
    messages,
    addMessage,
    updateMessage,
    isLoading,
    isStreaming,
    statusMessage,
    setIsLoading,
    setIsStreaming,
    setStatusMessage,
    setAbortController,
    stopGeneration,
    showMentionMenu,
    setShowMentionMenu,
    mentionQuery,
    setMentionQuery,
    mentionIndex,
    setMentionIndex,
    selectedContexts,
    addContext,
    removeContext,
    clearContexts,
    setShowLimitModal,
    showLimitModal,
    activePersona,
    activeMode,
    modelTier,
    setModelTier,
    activeConversationId,
    setActiveConversationId,
    upsertConversation,
    loadConversations,
    consumePendingPrefill,
  } = useCopilotStore();

  // Consume any queued prefill (from ⌘K / insight "Ask Copilot" / inline buttons)
  useEffect(() => {
    const prefill = consumePendingPrefill();
    if (prefill) setInput(prefill);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === Mention items ===
  const getMentionableItems = useCallback((): MentionItem[] => {
    const items: MentionItem[] = [
      {
        id: "help_general",
        type: "help",
        title: "راهنمایی کلی",
        subtitle: "سوال درباره پروژه؟",
        data: { context: "general_help" },
        icon: "HelpCircle",
      },
    ];

    if (!plan) return items;

    // Canvas sections
    const canvasData =
      plan.projectType === "creator" ? plan.brandCanvas : plan.leanCanvas;
    const safeCanvasData =
      canvasData && typeof canvasData === "object" ? canvasData : {};

    const persianKeys: Record<string, string> = {
      customerSegments: "بخش‌های مشتری",
      valueProposition: "ارزش پیشنهادی",
      channels: "کانال‌ها",
      customerRelations: "روابط مشتری",
      revenueStream: "جریان درآمد",
      costStructure: "ساختار هزینه",
    };

    if (Object.keys(safeCanvasData).length > 0) {
      items.push({
        id: "canvas_full",
        type: "canvas",
        title: "کل بوم کسب‌وکار",
        subtitle: "تمام بخش‌ها برای تحلیل جامع",
        data: { type: "full_canvas", content: safeCanvasData },
        icon: "Target",
      });

      Object.keys(safeCanvasData).forEach((key) => {
        const persianTitle = persianKeys[key] || key;
        items.push({
          id: `section_${key}`,
          type: "canvas",
          title: persianTitle,
          subtitle: "بخش بوم کسب‌وکار",
          data: { section: key, content: (safeCanvasData as Record<string, unknown>)[key] },
          icon: "Target",
        });
      });
    }

    // Pitch deck slides
    if (plan.pitchDeck && Array.isArray(plan.pitchDeck) && plan.pitchDeck.length > 0) {
      items.push({
        id: "pitch_deck_full",
        type: "slide",
        title: "کل پیچ‌دک",
        subtitle: `(${plan.pitchDeck.length} اسلاید)`,
        data: { type: "full_deck", slides: plan.pitchDeck },
        icon: "Presentation",
      });

      plan.pitchDeck.forEach((slide: any, index: number) => {
        items.push({
          id: (slide.id as string) || `slide_${index}`,
          type: "slide",
          title: (slide.title as string) || `اسلاید ${index + 1}`,
          subtitle: `اسلاید پیچ‌دک`,
          data: slide,
          icon: "Presentation",
        });
      });
    }

    // Roadmap phases + steps
    if (plan.roadmap && Array.isArray(plan.roadmap) && plan.roadmap.length > 0) {
      items.push({
        id: "roadmap_full",
        type: "roadmap",
        title: "کل نقشه راه",
        subtitle: `(${plan.roadmap.length} فاز)`,
        data: { type: "full_roadmap", phases: plan.roadmap },
        icon: "TrendingUp",
      });
      plan.roadmap.forEach((phase: any, pi: number) => {
        const phaseTitle = phase.phase || phase.title || `فاز ${pi + 1}`;
        items.push({
          id: `roadmap_phase_${pi}`,
          type: "roadmap",
          title: `فاز: ${phaseTitle}`,
          subtitle: "نقشه راه",
          data: { phaseIndex: pi, phase },
          icon: "TrendingUp",
        });
        const steps = Array.isArray(phase?.steps) ? phase.steps : [];
        steps.forEach((s: any, si: number) => {
          const step = typeof s === "string" ? { title: s } : s;
          if (step.title) {
            items.push({
              id: `roadmap_step_${pi}_${si}`,
              type: "roadmap",
              title: step.title,
              subtitle: `گام نقشه راه — ${phaseTitle}`,
              data: { phaseIndex: pi, stepIndex: si, step },
              icon: "Compass",
            });
          }
        });
      });
    }

    // Creator: content calendar posts + rate card
    if (plan.projectType === "creator") {
      const posts = Array.isArray(plan.contentCalendar) ? plan.contentCalendar : [];
      if (posts.length > 0) {
        items.push({
          id: "calendar_full",
          type: "calendar",
          title: "کل تقویم محتوا",
          subtitle: `(${posts.length} پست)`,
          data: { type: "full_calendar", posts },
          icon: "CalendarDays",
        });
        posts.forEach((p: any) => {
          items.push({
            id: `post_${p.id}`,
            type: "calendar",
            title: p.title || "پست",
            subtitle: `پست ${p.platform || ""} — ${p.status || ""}`,
            data: p,
            icon: "CalendarDays",
          });
        });
      }
      const rateCard = (plan as any).financials?.rateCard;
      if (rateCard) {
        items.push({
          id: "rate_card",
          type: "sponsor",
          title: "تعرفه اسپانسری",
          subtitle: "قیمت‌گذاری محتوا",
          data: rateCard,
          icon: "DollarSign",
        });
      }
    }

    // Traditional: permits + location
    if (plan.projectType === "traditional") {
      const permits = Array.isArray((plan as any).permits) ? (plan as any).permits : [];
      if (permits.length > 0) {
        items.push({
          id: "permits_full",
          type: "location",
          title: "لیست مجوزها",
          subtitle: `${permits.length} مجوز`,
          data: { type: "permits", permits },
          icon: "ClipboardList",
        });
        permits.forEach((p: any) => {
          items.push({
            id: `permit_${p.id}`,
            type: "location",
            title: p.title || "مجوز",
            subtitle: `مجوز — ${p.status || ""}`,
            data: p,
            icon: "ClipboardList",
          });
        });
      }
      const loc = (plan as any).locationAnalysis;
      if (loc) {
        items.push({
          id: "location_analysis",
          type: "location",
          title: "تحلیل موقعیت",
          subtitle: "تحلیل مکانی",
          data: loc,
          icon: "MapPin",
        });
      }
    }

    return items;
  }, [plan]);

  const mentionableItems = getMentionableItems();
  const filteredMentions = mentionableItems
    .filter(
      (item) =>
        item.title.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(mentionQuery.toLowerCase())
    )
    .slice(0, 5);

  // === Slash command menu ===
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashIndex, setSlashIndex] = useState(0);
  const slashQuery = input.startsWith("/") ? input.slice(1).split(" ")[0].toLowerCase() : "";
  const filteredSlash = useMemo(
    () =>
      SLASH_COMMANDS.filter(
        (c) =>
          c.command.toLowerCase().includes(slashQuery) ||
          c.label.toLowerCase().includes(slashQuery)
      ).slice(0, 6),
    [slashQuery]
  );

  const insertSlashCommand = (cmd: (typeof SLASH_COMMANDS)[number]) => {
    setInput(cmd.prompt);
    setSlashOpen(false);
    setSlashIndex(0);
    textareaRef.current?.focus();
  };

  // === Mention menu logic ===
  const insertMention = (item: MentionItem) => {
    const parts = input.split("@");
    parts.pop();
    const newValue = parts.join("@") + `@${item.title.replace(/\s+/g, "_")} `;
    setInput(newValue);
    setShowMentionMenu(false);
    setMentionQuery("");
    setMentionIndex(0);
    addContext(item);
    textareaRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);

    // Slash command menu: shown when the input starts with "/" and has no space yet.
    if (val.startsWith("/") && !val.includes(" ")) {
      setSlashOpen(true);
      setSlashIndex(0);
      setShowMentionMenu(false);
      return;
    }
    setSlashOpen(false);

    const lastAt = val.lastIndexOf("@");
    if (lastAt !== -1) {
      const query = val.slice(lastAt + 1);
      if (!query.includes(" ") || query.split(" ").length < 3) {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (slashOpen) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashIndex(Math.max(0, slashIndex - 1));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashIndex(Math.min(filteredSlash.length - 1, slashIndex + 1));
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (filteredSlash[slashIndex]) insertSlashCommand(filteredSlash[slashIndex]);
      } else if (e.key === "Escape") {
        setSlashOpen(false);
      }
      return;
    }
    if (showMentionMenu) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex(Math.max(0, useCopilotStore.getState().mentionIndex - 1));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex(
          Math.min(filteredMentions.length - 1, useCopilotStore.getState().mentionIndex + 1)
        );
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (filteredMentions[mentionIndex]) {
          insertMention(filteredMentions[mentionIndex]);
        }
      } else if (e.key === "Escape") {
        setShowMentionMenu(false);
      }
    } else {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  // === Auto-resize textarea ===
  const handleInputResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  // === Send message ===
  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || isLoading) return;

    setInput("");
    clearContexts();
    setShowMentionMenu(false);

    const userMessage: CopilotMessage = {
      id: generateId(),
      role: "user",
      content: messageToSend,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    addMessage(userMessage);

    // Create abort controller for stop button
    const controller = new AbortController();
    setAbortController(controller);

    setIsLoading(true);
    setStatusMessage("درحال بررسی درخواست...");

    // Create empty assistant message for streaming
    const assistantMessageId = generateId();
    addMessage({
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    });

    let assistantContent = "";
    let finalToolCall: { name: string; status: "success" | "error"; result: unknown } | null = null;
    let resolvedConversationId = activeConversationId;

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: plan?.id,
          messages: newMessages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context:
            selectedContexts.length > 0
              ? selectedContexts.map((c) => c.data)
              : undefined,
          persona: activePersona,
          mode: activeMode,
          tier: modelTier,
          conversationId: activeConversationId || undefined,
        }),
        signal: controller.signal,
      });

      if (response.status === 429) {
        setShowLimitModal(true);
        setIsLoading(false);
        // Remove the empty assistant message
        updateMessage(assistantMessageId, { content: "اعتبار شما به پایان رسیده است." });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "خطا در ارتباط با سرور");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === "meta") {
              if (parsed.conversationId && !resolvedConversationId) {
                resolvedConversationId = parsed.conversationId;
                setActiveConversationId(parsed.conversationId);
              }
              if (parsed.userMessageId && userMessage) {
                updateMessage(userMessage.id, { dbId: parsed.userMessageId });
              }
              if (parsed.assistantMessageId) {
                updateMessage(assistantMessageId, { dbId: parsed.assistantMessageId });
              }
            } else if (parsed.type === "status") {
              setStatusMessage(parsed.content);
            } else if (parsed.type === "text") {
              assistantContent += parsed.content;
              updateMessage(assistantMessageId, { content: assistantContent });
            } else if (parsed.type === "tool_call") {
              finalToolCall = parsed.tool_call;
            } else if (parsed.type === "error") {
              if (parsed.error !== "stopped") throw new Error(parsed.error);
            }
          } catch {
            // Ignore parse error on chunks
          }
        }
      }

      // Handle tool call result
      if (finalToolCall) {
        updateMessage(assistantMessageId, { toolCall: finalToolCall });

        if (finalToolCall.status === "success") {
          try {
            await refreshProjects();
            toast.success("تغییرات اعمال شد");
          } catch {
            toast.error("خطا در به‌روزرسانی داده‌ها");
          }
        } else {
          toast.error("خطا در انجام عملیات");
        }
      }

      // Refresh the conversation list so the new/updated thread shows up.
      if (plan?.id) {
        loadConversations(plan.id);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        // User stopped — keep partial content
        if (assistantContent) {
          updateMessage(assistantMessageId, { content: assistantContent + "\n\n_(متوقف شد)_" });
        } else {
          updateMessage(assistantMessageId, { content: "_(متوقف شد)_" });
        }
      } else {
        console.error("Copilot chat error:", error);
        const errorMsg = error instanceof Error ? error.message : "خطا در ارتباط با سرور";
        updateMessage(assistantMessageId, { content: `❌ ${errorMsg}` });
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStatusMessage("");
      setAbortController(null);
    }
  };

  // === Voice input ===
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognitionClass = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      toast.error("مرورگر شما از ورود صوتی پشتیبانی نمی‌کند");
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = "fa-IR";
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const currentInput = useCopilotStore.getState().input;
      setInput(currentInput + transcript);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = () => {
      toast.error("خطا در تشخیص صدا");
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
    toast.info("در حال ضبط...");
  };

  return (
    <>
      <div className="shrink-0 px-4 pb-4 pt-2" data-tour-id="chat-input-container">
        <div className="max-w-3xl mx-auto relative">
          {/* Slash Command Menu */}
          <AnimatePresence>
            {slashOpen && filteredSlash.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full mb-2 inset-x-0 bg-popover/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl overflow-hidden max-h-72 overflow-y-auto copilot-scroll z-30"
                dir="rtl"
              >
                <div className="p-3 text-xs font-semibold text-muted-foreground bg-muted/30 border-b border-border/30 flex items-center gap-2">
                  <SlashIconLucide size={12} />
                  دستورهای سریع
                </div>
                <div className="p-1.5 space-y-1">
                  {filteredSlash.map((cmd, i) => (
                    <button
                      key={cmd.command}
                      onClick={() => insertSlashCommand(cmd)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-xl text-right transition-all",
                        i === slashIndex ? "bg-ai text-white shadow-md" : "hover:bg-muted text-foreground"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", i === slashIndex ? "bg-white/20 text-white" : "bg-muted text-muted-foreground")}>
                        <MentionIcon icon={cmd.icon} />
                      </div>
                      <div className="flex flex-col items-start overflow-hidden flex-1">
                        <span className="text-sm font-bold">{cmd.label}</span>
                        <span className={cn("text-[11px] truncate w-full", i === slashIndex ? "text-white/80" : "text-muted-foreground")}>
                          {cmd.description}
                        </span>
                      </div>
                      <code className={cn("text-[10px] font-mono", i === slashIndex ? "text-white/70" : "text-muted-foreground/70")}>{cmd.command}</code>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mention Menu */}
          <AnimatePresence>
            {showMentionMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full mb-2 inset-x-0 bg-popover/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl overflow-hidden max-h-72 overflow-y-auto copilot-scroll z-30"
                dir="rtl"
              >
                <div className="p-3 text-xs font-semibold text-muted-foreground bg-muted/30 border-b border-border/30 flex items-center gap-2">
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
                          "w-full flex items-center gap-3 p-2.5 rounded-xl text-right transition-all",
                          i === mentionIndex
                            ? "bg-ai text-white shadow-md"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            i === mentionIndex
                              ? "bg-white/20 text-white"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <MentionIcon icon={item.icon} />
                        </div>
                        <div className="flex flex-col items-start overflow-hidden flex-1">
                          <span className="text-sm font-bold truncate w-full">
                            {item.title}
                          </span>
                          <span
                            className={cn(
                              "text-[11px] truncate w-full",
                              i === mentionIndex ? "text-white/80" : "text-muted-foreground"
                            )}
                          >
                            {item.subtitle}
                          </span>
                        </div>
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

          {/* Context Chips */}
          {selectedContexts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedContexts.map((ctx) => (
                <div
                  key={ctx.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ai/10 border border-ai/20 text-ai text-[11px] font-medium"
                >
                  <MentionIcon icon={ctx.icon} />
                  <span className="truncate max-w-[120px]">{ctx.title}</span>
                  <button
                    onClick={() => removeContext(ctx.id)}
                    className="hover:bg-ai/20 rounded p-0.5 transition-colors"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="relative bg-card border border-border/60 rounded-2xl shadow-lg focus-within:border-ai/30 focus-within:ring-2 focus-within:ring-ai/10 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                handleInputChange(e);
                handleInputResize();
              }}
              onKeyDown={handleKeyDown}
              placeholder="سوال خود را بپرسید... از / برای دستورهای سریع و از @ برای اشاره استفاده کنید"
              className="w-full min-h-[52px] max-h-[200px] resize-none bg-transparent p-4 pb-12 outline-none text-sm text-foreground placeholder:text-muted-foreground/60 copilot-scroll rounded-2xl"
              dir="rtl"
              rows={1}
            />

            {/* Bottom bar */}
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 pb-2.5">
              <div className="flex items-center gap-1">
                {/* Attachment (future) */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => toast.info("آپلود فایل به‌زودی...")}
                >
                  <Paperclip size={15} />
                </Button>

                {/* Voice input */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    "h-8 w-8",
                    isListening
                      ? "text-destructive animate-pulse"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={handleVoiceInput}
                >
                  <Mic size={15} />
                </Button>
              </div>

              {/* Send / Stop + Tier pill */}
              <div className="flex items-center gap-1.5">
                {/* Model tier pill — cycles Hard ↔ Fast */}
                <button
                  onClick={() => {
                    const next = modelTier === "hard" ? "fast" : "hard";
                    setModelTier(next);
                    toast.info(next === "fast" ? "مدل سریع انتخاب شد" : "مدل قوی انتخاب شد");
                  }}
                  title="تغییر مدل پاسخ‌گویی"
                  className={cn(
                    "h-8 px-2.5 rounded-full flex items-center gap-1 text-[11px] font-medium transition-colors",
                    modelTier === "fast"
                      ? "bg-amber-500/15 text-amber-600 border border-amber-500/25"
                      : "bg-ai/10 text-ai border border-ai/20"
                  )}
                >
                  <Gauge size={12} />
                  {modelTier === "fast" ? "سریع" : "قوی"}
                </button>

                {isLoading ? (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9 rounded-full shadow-md"
                    onClick={stopGeneration}
                  >
                    <Square size={16} className="fill-current" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    className={cn(
                      "h-9 w-9 rounded-full shadow-md transition-all",
                      input.trim()
                        ? "ai-orb text-white hover:scale-110"
                        : "bg-muted text-muted-foreground"
                    )}
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim()}
                  >
                    <ArrowUp size={18} strokeWidth={2.5} />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-center text-muted-foreground/50 mt-2">
            دستیار کارنکس ممکن است اشتباه کند. اطلاعات مهم را بررسی کنید.
          </p>
        </div>
      </div>

      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
    </>
  );
}

export function MentionIcon({ icon }: { icon: string }) {
  const size = 15;
  switch (icon) {
    case "Target":
      return <Target size={size} />;
    case "Presentation":
      return <Presentation size={size} />;
    case "TrendingUp":
      return <TrendingUp size={size} />;
    case "HelpCircle":
      return <HelpCircle size={size} />;
    case "Compass":
      return <Compass size={size} />;
    case "CalendarDays":
      return <CalendarDays size={size} />;
    case "FileText":
      return <FileText size={size} />;
    case "ClipboardList":
      return <ClipboardList size={size} />;
    case "MapPin":
      return <MapPin size={size} />;
    case "DollarSign":
      return <DollarSign size={size} />;
    case "Lightbulb":
      return <Lightbulb size={size} />;
    case "Zap":
      return <Zap size={size} />;
    default:
      return <Sparkles size={size} />;
  }
}
