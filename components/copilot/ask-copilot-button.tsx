"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCopilotStore } from "@/lib/copilot/store";
import { cn } from "@/lib/utils";

interface AskCopilotButtonProps {
  /** Pre-filled prompt to send to the Copilot. */
  prompt: string;
  /** Optional contexts to attach as @-mentions (e.g. the entity the user is on). */
  contexts?: { id: string; type: any; title: string; subtitle?: string; data?: unknown; icon?: string }[];
  label?: string;
  className?: string;
  variant?: "ghost" | "soft" | "outline";
  size?: "sm" | "default";
}

/**
 * Context-aware inline "Ask Copilot about this" button.
 * Queues a prefill (+ optional @-context) and routes to the Copilot workspace.
 * Drop this on any dashboard page next to an entity (roadmap step, calendar
 * post, script, location analysis, sponsor rate, idea, ...).
 */
export function AskCopilotButton({
  prompt,
  contexts,
  label = "بپرس از دستیار",
  className,
  variant = "soft",
  size = "sm",
}: AskCopilotButtonProps) {
  const router = useRouter();
  const { setPendingPrefill, clearMessages, addContext } = useCopilotStore();

  const handleClick = () => {
    clearMessages();
    if (contexts && contexts.length) {
      contexts.forEach((c) =>
        addContext({
          id: c.id,
          type: c.type,
          title: c.title,
          subtitle: c.subtitle || "",
          data: c.data,
          icon: c.icon || "Sparkles",
        })
      );
    }
    setPendingPrefill(prompt);
    router.push("/dashboard/copilot");
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors",
        "bg-ai/10 hover:bg-ai/20 text-ai border border-ai/20",
        size === "sm" ? "text-[11px] px-2.5 py-1" : "text-xs px-3 py-1.5",
        className
      )}
    >
      <Sparkles size={size === "sm" ? 12 : 14} />
      {label}
    </button>
  );
}
