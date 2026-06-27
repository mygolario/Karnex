"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
  Bot,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  ArrowLeft,
  X,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useProject } from "@/contexts/project-context";
import { useCopilotStore } from "@/lib/copilot/store";
import type { CopilotInsight } from "@/lib/copilot/types";
import { cn } from "@/lib/utils";

export function AIInsightsWidget() {
  const { activeProject } = useProject();
  const router = useRouter();
  const { setPendingPrefill, clearMessages } = useCopilotStore();

  const [insights, setInsights] = useState<CopilotInsight[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!activeProject?.id) return;
    setLoading(true);
    try {
      // Regenerate then load
      await fetch(`/api/copilot/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeProject.id }),
      }).catch(() => {});
      const res = await fetch(
        `/api/copilot/insights?projectId=${encodeURIComponent(activeProject.id)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setInsights((data.insights || []).slice(0, 8));
        setCurrentIndex(0);
      }
    } finally {
      setLoading(false);
    }
  }, [activeProject?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const active = insights.filter((i) => i.status !== "dismissed");
  const current = active[currentIndex % (active.length || 1)];

  useEffect(() => {
    if (active.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % active.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [active.length]);

  const dismiss = async (id: string) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
    setCurrentIndex(0);
    try {
      await fetch(`/api/copilot/insights/${id}`, { method: "DELETE" });
    } catch {}
  };

  const apply = (insight: CopilotInsight) => {
    const action = insight.actionPayload;
    fetch(`/api/copilot/insights/${insight.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "read" }),
    }).catch(() => {});
    if (action?.type === "open_page" && action.href) {
      router.push(action.href);
      return;
    }
    if (action?.type === "open_copilot") {
      clearMessages();
      if (action.prefill) setPendingPrefill(action.prefill);
      router.push("/dashboard/copilot");
    }
  };

  if (loading && insights.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground">پیشنهادات هوشمند</h3>
        </div>
        <div className="text-center py-8">
          <RefreshCw className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2 animate-spin" />
          <p className="text-sm text-muted-foreground">در حال تحلیل پروژه...</p>
        </div>
      </Card>
    );
  }

  if (!current || active.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-foreground">پیشنهادات هوشمند</h3>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={refresh}
            title="به‌روزرسانی"
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
        <div className="text-center py-8">
          <Bot className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">همه‌چیز روبراه به‌نظر می‌رسه ✅</p>
        </div>
      </Card>
    );
  }

  const Icon =
    current.priority === "urgent"
      ? AlertTriangle
      : current.type === "streak" || current.type === "competitor"
        ? TrendingUp
        : Lightbulb;

  const tone =
    current.priority === "urgent"
      ? "from-red-500/10 to-orange-500/10 border-red-500/20"
      : current.priority === "warning"
        ? "from-amber-500/10 to-orange-500/10 border-amber-500/20"
        : "from-violet-500/10 to-purple-500/10 border-violet-500/20";
  const iconColor =
    current.priority === "urgent"
      ? "text-red-500"
      : current.priority === "warning"
        ? "text-amber-500"
        : "text-violet-500";

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground">پیشنهادات هوشمند</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={refresh}
            title="به‌روزرسانی"
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          <button
            onClick={() => dismiss(current.id)}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="رد کردن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={cn("rounded-xl border p-4 bg-gradient-to-br", tone)}
        >
          <div className="flex items-start gap-3">
            <div className={cn("w-10 h-10 rounded-xl bg-white/50 dark:bg-white/10 flex items-center justify-center shrink-0", iconColor)}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-foreground mb-1">{current.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{current.body}</p>
              {current.actionPayload?.label && (
                <Button
                  size="sm"
                  variant="soft"
                  className="font-bold text-xs gap-1 h-7"
                  onClick={() => apply(current)}
                >
                  {current.actionPayload.label}
                  <ArrowLeft className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {active.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {active.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === currentIndex % active.length
                  ? "w-4 bg-primary"
                  : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
