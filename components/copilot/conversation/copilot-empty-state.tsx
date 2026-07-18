"use client";

import { motion } from "framer-motion";
import { useProject } from "@/contexts/project-context";
import { useCopilotStore } from "@/lib/copilot/store";
import {
  Briefcase,
  Target,
  Users,
  TrendingUp,
  DollarSign,
  Sparkles,
  MessageSquare,
  Mic,
  CalendarDays,
  FileText,
  ClipboardList,
  MapPin,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const personaConfig = {
  default: {
    title: "هم‌بنیان‌گذار هوشمند",
    description:
      "من اینجا هستم تا در ساخت و تکمیل پروژه‌تان کمک کنم. می‌توانم بیزنس پلن را پر کنم، اسلاید بسازم و رقبا را تحلیل کنم.",
    gradient: "from-ai/20 to-blue-500/20",
    icon: Briefcase,
  },
  traditional: {
    title: "مشاور کسب‌وکار سنتی",
    description:
      "همراه شما در مدیریت بهینه، افزایش فروش و توسعه بازار. بیایید کسب‌وکارتان را رونق دهیم.",
    gradient: "from-amber-500/20 to-orange-500/20",
    icon: Briefcase,
  },
  creator: {
    title: "مشاور تولید محتوا",
    description:
      "من اینجا هستم تا در ایده‌پردازی، تقویم محتوایی و رشد برند شخصی کمک کنم. بیایید محتوای وایرال بسازیم!",
    gradient: "from-purple-500/20 to-pink-500/20",
    icon: Mic,
  },
};

interface Suggestion {
  icon: typeof Target;
  title: string;
  prompt: string;
  color: string;
}

/** Derive dynamic, persona-aware suggestions + today's focus from project state. */
function useDynamicSuggestions(): { focus?: string; suggestions: Suggestion[] } {
  const { activeProject: plan } = useProject();
  return useMemo(() => {
    if (!plan) {
      return {
        suggestions: [
          { icon: Target, title: "تحلیل استراتژیک", prompt: "نقاط قوت و ضعف مدل کسب‌وکار فعلی من را تحلیل کن.", color: "from-blue-500/20 to-blue-600/20 text-blue-600" },
          { icon: Users, title: "پرسونا مشتری", prompt: "پرسونای دقیق مشتری ایده‌آل برای این پروژه را توصیف کن.", color: "from-violet-500/20 to-violet-600/20 text-violet-600" },
        ],
      };
    }

    const data = plan as any;
    const projectType = data.projectType || "startup";
    const canvas = projectType === "creator" ? data.brandCanvas : data.leanCanvas;
    const canvasFilled = canvas && typeof canvas === "object" ? Object.keys(canvas).filter((k) => {
      const v = canvas[k];
      return Array.isArray(v) ? v.length > 0 : v && String(v).trim().length > 0;
    }).length : 0;

    // Current roadmap step
    let focus: string | undefined;
    const roadmap: any[] = Array.isArray(data.roadmap) ? data.roadmap : [];
    const completed: string[] = Array.isArray(data.completedSteps) ? data.completedSteps : [];
    for (const phase of roadmap) {
      const steps = Array.isArray(phase?.steps) ? phase.steps : [];
      for (const s of steps) {
        const step = typeof s === "string" ? { title: s } : s;
        const id = step.id || step.title;
        const status = step.status || (completed.includes(id) ? "done" : "todo");
        if (status !== "done") { focus = step.title || "گام بعدی نقشه راه"; break; }
      }
      if (focus) break;
    }

    const suggestions: Suggestion[] = [];

    if (projectType === "creator") {
      if (canvasFilled < 3) {
        suggestions.push({ icon: Target, title: "تکمیل بوم برند", prompt: "بوم برند من را با ۳-۵ کارت برای هر بخش پر کن.", color: "from-purple-500/20 to-purple-600/20 text-purple-600" });
      }
      suggestions.push({ icon: CalendarDays, title: "زمان‌بندی محتوا", prompt: "۳ پست برای این هفته پیشنهاد بده و آن‌ها را به تقویم محتوا اضافه کن.", color: "from-pink-500/20 to-pink-600/20 text-pink-600" });
      suggestions.push({ icon: FileText, title: "اسکریپت وایرال", prompt: "یک اسکریپت ویدیوی کوتاه با قلاب وایرال برای اینستاگرام بنویس.", color: "from-fuchsia-500/20 to-fuchsia-600/20 text-fuchsia-600" });
      suggestions.push({ icon: TrendingUp, title: "برنامه رشد کانال", prompt: "یک برنامه ۳ ماهه برای رشد کانالم تدوین کن.", color: "from-emerald-500/20 to-emerald-600/20 text-emerald-600" });
    } else if (projectType === "traditional") {
      const permits: any[] = Array.isArray(data.permits) ? data.permits : [];
      const pendingPermits = permits.filter((p) => p.status !== "done").length;
      if (pendingPermits > 0) {
        suggestions.push({ icon: ClipboardList, title: `بررسی مجوزها (${pendingPermits})`, prompt: `من ${pendingPermits} مجوز ناتمام دارم. اولویت‌بندی کن و بگو از کدام شروع کنم.`, color: "from-amber-500/20 to-amber-600/20 text-amber-600" });
      }
      suggestions.push({ icon: MapPin, title: "تحلیل موقعیت", prompt: "تحلیل موقعیت کسب‌وکار من را بررسی کن و پیشنهاد بهبود بده.", color: "from-orange-500/20 to-orange-600/20 text-orange-600" });
      suggestions.push({ icon: Target, title: "تحلیل SWOT", prompt: "جدول SWOT کسب‌وکار من را بر اساس اطلاعات پروژه به‌روزرسانی کن.", color: "from-blue-500/20 to-blue-600/20 text-blue-600" });
      suggestions.push({ icon: DollarSign, title: "بهینه‌سازی سود", prompt: "راهکارهایی برای کاهش هزینه و افزایش سودآوری پیشنهاد بده.", color: "from-emerald-500/20 to-emerald-600/20 text-emerald-600" });
    } else {
      if (canvasFilled < 5) {
        suggestions.push({ icon: Target, title: "تکمیل بوم کسب‌وکار", prompt: "بوم مدل کسب‌وکار من را با کارت‌های باکیفیت پر کن.", color: "from-blue-500/20 to-blue-600/20 text-blue-600" });
      }
      const pitchCount = Array.isArray(data.pitchDeck) ? data.pitchDeck.length : 0;
      if (pitchCount < 6) {
        suggestions.push({ icon: Zap, title: "تکمیل پیچ‌دک", prompt: "اسلایدهای مفقوده پیچ‌دکم را بساز و تکمیل کن.", color: "from-violet-500/20 to-violet-600/20 text-violet-600" });
      }
      suggestions.push({ icon: Users, title: "تحلیل رقبا", prompt: "رقبای اصلی بازار من را شناسایی و تحلیل کن.", color: "from-amber-500/20 to-amber-600/20 text-amber-600" });
      suggestions.push({ icon: TrendingUp, title: "برنامه رشد", prompt: "یک برنامه عملیاتی ۳ ماهه برای افزایش جذب کاربر تدوین کن.", color: "from-emerald-500/20 to-emerald-600/20 text-emerald-600" });
    }

    // Always ensure at least a few suggestions.
    if (suggestions.length < 2) {
      suggestions.push({ icon: Target, title: "تحلیل استراتژیک", prompt: "نقاط قوت و ضعف مدل کسب‌وکار فعلی من را تحلیل کن.", color: "from-blue-500/20 to-blue-600/20 text-blue-600" });
    }

    return { focus, suggestions: suggestions.slice(0, 4) };
  }, [plan]);
}

export function CopilotEmptyState() {
  const { activePersona } = useCopilotStore();
  const { focus, suggestions } = useDynamicSuggestions();

  const config = personaConfig[activePersona as keyof typeof personaConfig] || personaConfig.default;
  const Icon = config.icon;

  const handlePromptClick = (prompt: string) => {
    useCopilotStore.getState().setInput(prompt);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 overflow-y-auto copilot-scroll" dir="rtl">
      {/* Persona avatar */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6 relative"
      >
        <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-border/30 shadow-lg bg-gradient-to-tr", config.gradient)}>
          <Icon size={36} strokeWidth={1.5} className="text-foreground/80" />
        </div>
        <div className="absolute -bottom-2 -end-2 bg-background rounded-full p-2 shadow-md border border-border/50">
          <Sparkles size={16} className={cn("fill-current", activePersona === "creator" ? "text-purple-500" : activePersona === "traditional" ? "text-amber-500" : "text-ai")} />
        </div>
      </motion.div>

      <h3 className="text-xl font-bold tracking-tight mb-2">{config.title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md leading-relaxed">{config.description}</p>

      {/* Today's focus */}
      {focus && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 w-full max-w-lg rounded-2xl border border-ai/20 bg-ai/5 p-4 flex items-center gap-3 text-start"
        >
          <div className="w-10 h-10 rounded-xl ai-orb flex items-center justify-center shrink-0">
            <Target size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-ai font-semibold">تمرکز امروز</p>
            <p className="text-sm font-bold text-foreground truncate">{focus}</p>
          </div>
          <button
            onClick={() => handlePromptClick(`برای گام «${focus}» از نقشه راه، یک برنامه عملی امروز به من بده.`)}
            className="text-[11px] text-ai font-medium hover:underline shrink-0"
          >
            بپرس
          </button>
        </motion.div>
      )}

      {/* Dynamic suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg" data-tour-id="prompt-templates">
        {suggestions.map((t, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => handlePromptClick(t.prompt)}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-border/50 bg-card hover:border-ai/30 hover:shadow-md transition-all text-start group"
          >
            <div className={cn("w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0", t.color)}>
              <t.icon size={16} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-semibold text-foreground/90 group-hover:text-ai transition-colors">{t.title}</span>
              <span className="text-[11px] text-muted-foreground/70 truncate">{t.prompt}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground/50 mt-6 flex items-center gap-1.5">
        <MessageSquare size={12} />
        برای اشاره به بخش خاص از @ و برای دستورهای سریع از / استفاده کنید
      </p>
    </div>
  );
}
