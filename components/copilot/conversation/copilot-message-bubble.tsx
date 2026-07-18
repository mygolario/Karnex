"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { useCopilotStore } from "@/lib/copilot/store";
import type { CopilotMessage } from "@/lib/copilot/types";
import { Markdown } from "./markdown";
import {
  Sparkles,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Undo2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const TOOL_LABELS: Record<string, string> = {
  update_business_plan: "به‌روزرسانی بوم کسب‌وکار",
  create_pitch_deck_slide: "ایجاد اسلاید پیچ‌دک",
  update_pitch_deck_slide: "اصلاح اسلاید پیچ‌دک",
  search_competitors: "تحلیل رقبا",
  update_swot_analysis: "به‌روزرسانی SWOT",
  save_memory: "ذخیره در حافظه",
  update_step_status: "تغییر وضعیت گام نقشه راه",
  add_roadmap_step: "افزودن گام به نقشه راه",
  add_step_note: "یادداشت روی گام",
  add_canvas_card: "افزودن کارت به بوم",
  create_content_post: "ایجاد پست محتوا",
  move_content_post: "تغییر وضعیت پست محتوا",
  create_script: "ایجاد اسکریپت",
  toggle_permit: "به‌روزرسانی مجوز",
};

export function CopilotMessageBubble({ message }: { message: CopilotMessage }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [toolExpanded, setToolExpanded] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [reverted, setReverted] = useState(message.toolCall?.status === "error" && (message.toolCall.result as any)?.reverted);
  const isUser = message.role === "user";
  const { refreshProjects } = useProject();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success("کپی شد");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = async (type: "up" | "down") => {
    setFeedback(type);
    try {
      await fetch("/api/copilot/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: message.id,
          rating: type,
          feature: "copilot",
        }),
      });
      toast.success("بازخورد ثبت شد");
    } catch {
      toast.error("خطا در ثبت بازخورد");
    }
  };

  const toolLabel = message.toolCall ? TOOL_LABELS[message.toolCall.name] || message.toolCall.name : "";
  const actionId = message.toolCall ? (message.toolCall.result as any)?.actionId : undefined;
  const canUndo = !!actionId && message.toolCall?.status === "success" && !reverted;

  const handleUndo = async () => {
    if (!actionId) {
      toast.info("بازگردانی برای این عملیات پشتیبانی نمی‌شود");
      return;
    }
    setUndoing(true);
    try {
      const res = await fetch(`/api/copilot/actions/${actionId}/undo`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در بازگردانی");
      setReverted(true);
      toast.success(data.message || "عملیات بازگردانده شد");
      await refreshProjects();
    } catch (e: any) {
      toast.error(e.message || "خطا در بازگردانی");
    } finally {
      setUndoing(false);
    }
  };

  return (
    <div className={cn("flex gap-3 group", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
          isUser ? "bg-muted text-muted-foreground border border-border" : "ai-orb text-white"
        )}
      >
        {isUser ? <User size={16} /> : <Sparkles size={16} />}
      </div>

      {/* Message content */}
      <div className={cn("max-w-[80%] flex flex-col", isUser ? "items-end" : "items-start")}>
        {/* Name + time */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-semibold text-muted-foreground">
            {isUser ? "شما" : "کارنکس"}
          </span>
          <span className="text-[10px] text-muted-foreground/50">
            {new Date(message.timestamp).toLocaleTimeString("fa-IR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Tool call card */}
        {message.toolCall && (
          <div
            className={cn(
              "mb-2 w-full rounded-xl border overflow-hidden text-xs",
              message.toolCall.status === "success"
                ? "bg-emerald-500/5 border-emerald-500/25"
                : "bg-destructive/5 border-destructive/25"
            )}
          >
            <button
              onClick={() => setToolExpanded((v) => !v)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/30 transition-colors"
            >
              {message.toolCall.status === "success" ? (
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={13} className="text-destructive shrink-0" />
              )}
              <span className="font-medium flex-1 text-start">{toolLabel}</span>
              <span
                className={cn(
                  "text-[10px]",
                  message.toolCall.status === "success" ? "text-emerald-600" : "text-destructive"
                )}
              >
                {message.toolCall.status === "success" ? "اعمال شد" : "خطا"}
              </span>
              <ChevronDown
                size={13}
                className={cn("text-muted-foreground transition-transform", toolExpanded && "rotate-180")}
              />
            </button>
            {toolExpanded && (
              <div className="px-3 pb-2.5 pt-1 border-t border-border/30 bg-muted/20">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    {reverted ? "بازگردانده شد" : "نتیجه عملیات"}
                  </span>
                  {canUndo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[11px] gap-1 text-muted-foreground hover:text-foreground px-2"
                      onClick={handleUndo}
                      disabled={undoing}
                    >
                      {undoing ? <Loader2 size={12} className="animate-spin" /> : <Undo2 size={12} />}
                      بازگردانی
                    </Button>
                  )}
                </div>
                <pre
                  className="text-[11px] leading-5 text-muted-foreground font-mono whitespace-pre-wrap break-words max-h-40 overflow-y-auto copilot-scroll"
                  dir="ltr"
                >
                  {JSON.stringify(message.toolCall.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl p-4 shadow-sm",
            isUser
              ? "bg-primary/10 text-foreground rounded-tr-md"
              : "copilot-pane ai-message rounded-tl-md"
          )}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap text-[14px] leading-8">{message.content}</div>
          ) : (
            <Markdown content={message.content} />
          )}
        </div>

        {/* Follow-up chips */}
        {message.followUps && message.followUps.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.followUps.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  useCopilotStore.getState().setInput(q);
                }}
                className="text-xs bg-ai/5 text-ai px-3 py-1.5 rounded-lg border border-ai/20 hover:bg-ai/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Action bar — AI messages only */}
        {!isUser && message.content && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                "h-7 w-7",
                feedback === "up" ? "text-emerald-500" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => handleFeedback("up")}
            >
              <ThumbsUp size={13} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                "h-7 w-7",
                feedback === "down" ? "text-destructive" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => handleFeedback("down")}
            >
              <ThumbsDown size={13} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => toast.info("بازتولید به‌زودی...")}
            >
              <RefreshCw size={13} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
