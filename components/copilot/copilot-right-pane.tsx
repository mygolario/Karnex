"use client";

import { useEffect, useState } from "react";
import { useProject } from "@/contexts/project-context";
import { useCopilotStore } from "@/lib/copilot/store";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Link2,
  Brain,
  ListChecks,
  PanelRightClose,
  Pin,
  AlertTriangle,
  HelpCircle,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MentionIcon } from "./composer/copilot-composer";

type Tab = "artifact" | "sources" | "memory" | "plan";

interface MemoryData {
  decisions?: any[];
  openQuestions?: any[];
  risks?: any[];
  keyFacts?: any[];
  updatedAt?: number;
}

export function CopilotRightPane({ onClose }: { onClose?: () => void }) {
  const { activeProject: plan } = useProject();
  const { setArtifactCanvasOpen, selectedContexts, clearContexts, removeContext } = useCopilotStore();
  const [tab, setTab] = useState<Tab>("sources");
  const [memory, setMemory] = useState<MemoryData | null>(null);
  const [loadingMemory, setLoadingMemory] = useState(false);

  useEffect(() => {
    if (!plan?.id) return;
    setLoadingMemory(true);
    fetch(`/api/copilot/memory?projectId=${plan.id}`)
      .then((r) => r.json())
      .then((data) => setMemory(data.memory || null))
      .finally(() => setLoadingMemory(false));
  }, [plan?.id, tab]);

  const tabs: { id: Tab; label: string; icon: typeof Sparkles }[] = [
    { id: "artifact", label: "خروجی", icon: Sparkles },
    { id: "sources", label: "منابع", icon: Link2 },
    { id: "memory", label: "حافظه", icon: Brain },
    { id: "plan", label: "برنامه", icon: ListChecks },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-card border-s border-border/50" dir="rtl">
      {/* Header */}
      <div className="h-12 shrink-0 flex items-center justify-between px-3 border-b border-border/50">
        <div className="flex items-center gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                tab === t.id ? "bg-ai/10 text-ai" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          onClick={() => {
            if (onClose) onClose();
            else setArtifactCanvasOpen(false);
          }}
        >
          <PanelRightClose size={15} />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto copilot-scroll p-4">
        {tab === "artifact" && (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
            <div className="w-12 h-12 rounded-2xl ai-orb flex items-center justify-center mb-3">
              <Sparkles size={22} className="text-white" />
            </div>
            <p className="text-sm font-medium text-foreground/80">پنل خروجی زنده</p>
            <p className="text-xs mt-1 max-w-[220px]">
              پیش‌نمایش زنده بوم، اسلاید، اسکریپت یا برنامه‌ای که دستیار می‌سازد اینجا نمایش داده می‌شود.
            </p>
          </div>
        )}

        {tab === "sources" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">زمینه‌های پیوست‌شده</span>
              {selectedContexts.length > 0 && (
                <button onClick={clearContexts} className="text-[11px] text-muted-foreground hover:text-foreground">
                  پاک کردن
                </button>
              )}
            </div>
            {selectedContexts.length === 0 ? (
              <p className="text-xs text-muted-foreground/70 py-6 text-center">
                هنوز موردی با @ اضافه نشده است.
              </p>
            ) : (
              selectedContexts.map((ctx) => (
                <div
                  key={ctx.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-border/50 bg-background/50"
                >
                  <div className="w-7 h-7 rounded-lg bg-ai/10 text-ai flex items-center justify-center shrink-0">
                    <MentionIcon icon={ctx.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{ctx.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{ctx.subtitle}</p>
                  </div>
                  <button
                    onClick={() => removeContext(ctx.id)}
                    className="text-muted-foreground hover:text-destructive text-[11px]"
                  >
                    حذف
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "memory" && (
          <div className="space-y-3">
            {loadingMemory ? (
              <p className="text-xs text-muted-foreground text-center py-6">در حال بارگذاری حافظه...</p>
            ) : !memory ||
              ![
                ...(memory.decisions || []),
                ...(memory.openQuestions || []),
                ...(memory.risks || []),
                ...(memory.keyFacts || []),
              ].length ? (
              <div className="text-center py-6 text-muted-foreground">
                <Brain size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs">هنوز چیزی در حافظه ثبت نشده است.</p>
                <p className="text-[11px] mt-1 opacity-70">تصمیمات و حقایق کلیدی به‌طور خودکار ذخیره می‌شوند.</p>
              </div>
            ) : (
              <>
                <MemoryGroup icon={Pin} title="تصمیمات" items={memory.decisions} color="text-ai" />
                <MemoryGroup icon={HelpCircle} title="پرسش‌های باز" items={memory.openQuestions} color="text-blue-500" />
                <MemoryGroup icon={AlertTriangle} title="ریسک‌ها" items={memory.risks} color="text-amber-500" />
                <MemoryGroup icon={KeyRound} title="حقایق کلیدی" items={memory.keyFacts} color="text-emerald-500" />
              </>
            )}
          </div>
        )}

        {tab === "plan" && (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
            <ListChecks size={28} className="mb-2 opacity-40" />
            <p className="text-xs">برنامه‌های چندمرحله‌ای دستیار اینجا نمایش داده می‌شوند.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MemoryGroup({
  icon: Icon,
  title,
  items,
  color,
}: {
  icon: typeof Pin;
  title: string;
  items?: any[];
  color: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={13} className={color} />
        <span className="text-[11px] font-bold text-muted-foreground">{title}</span>
      </div>
      <div className="space-y-1.5">
        {items.map((it: any, i: number) => (
          <div key={it.id || i} className="text-xs p-2.5 rounded-lg bg-muted/40 border border-border/30">
            {it.content || it.question || it.value}
            {it.severity && (
              <span className="ms-2 text-[10px] text-amber-600">({it.severity})</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
