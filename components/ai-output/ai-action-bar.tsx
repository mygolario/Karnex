"use client";

import { Button } from "@/components/ui/button";
import {
  Copy,
  RefreshCw,
  Download,
  MessageSquare,
  Check,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCopilotStore } from "@/lib/copilot/store";

export function AIActionBar({
  onCopy,
  onRegenerate,
  onExport,
  onApply,
  copilotPrefill,
  regenerateOptions,
  className,
  compact,
}: {
  onCopy?: () => string;
  onRegenerate?: (modifier?: string) => void;
  onExport?: () => void;
  onApply?: () => void;
  copilotPrefill?: string;
  regenerateOptions?: { id: string; label: string }[];
  className?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { setPendingPrefill, clearMessages } = useCopilotStore();

  const handleCopy = async () => {
    const text = onCopy?.();
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("کپی شد");
    setTimeout(() => setCopied(false), 2000);
  };

  const askCopilot = () => {
    if (!copilotPrefill) return;
    clearMessages();
    setPendingPrefill(copilotPrefill);
    router.push("/dashboard/copilot");
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        compact && "gap-1",
        className
      )}
    >
      {onCopy && (
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={handleCopy}
          className="gap-1.5"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          کپی
        </Button>
      )}
      {onRegenerate && (
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={() => onRegenerate()}
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          تولید مجدد
        </Button>
      )}
      {regenerateOptions?.map((opt) => (
        <Button
          key={opt.id}
          variant="ghost"
          size="sm"
          onClick={() => onRegenerate?.(opt.id)}
          className="text-xs"
        >
          {opt.label}
        </Button>
      ))}
      {onExport && (
        <Button variant="outline" size={compact ? "sm" : "default"} onClick={onExport} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          خروجی
        </Button>
      )}
      {onApply && (
        <Button size={compact ? "sm" : "default"} onClick={onApply} className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          اعمال
        </Button>
      )}
      {copilotPrefill && (
        <Button
          variant="secondary"
          size={compact ? "sm" : "default"}
          onClick={askCopilot}
          className="gap-1.5"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          پرسش از Copilot
        </Button>
      )}
    </div>
  );
}
