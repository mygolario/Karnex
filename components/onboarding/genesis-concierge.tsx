"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "./onboarding-context";
import type { QualityScoreResult } from "@/lib/onboarding/quality-score";
import { toPersianDigits } from "@/lib/utils";

interface Props {
  subStep: string;
  quality: QualityScoreResult | null;
}

export function GenesisConcierge({ subStep, quality }: Props) {
  const { sendGenesisChat } = useOnboarding();
  const [message, setMessage] = useState("");
  const [followUp, setFollowUp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const tip =
    subStep === "vision"
      ? "هرچه مشکل، راه‌حل و مخاطب را دقیق‌تر بنویسید، نقشه راه واقع‌بینانه‌تر می‌شود."
      : subStep === "review"
        ? "قبل از ساخت، خلاصه را مرور کنید — ویرایش سریع از دکمه‌های پایین ممکن است."
        : quality && quality.score < 60
          ? `با تکمیل ${quality.gaps[0]?.label ?? "فیلدهای پیشنهادی"} کیفیت طرح بالاتر می‌رود.`
          : "پرسش دارید؟ دستیار می‌تواند کمک کند (حداکثر ۴ پرسش).";

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    const result = await sendGenesisChat(message.trim());
    setLoading(false);
    setMessage("");
    if (result?.followUp) setFollowUp(result.followUp);
  };

  return (
    <div className="mb-4 rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-4">
      <div className="flex items-start gap-3">
        <MessageCircle className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">راهنمای کارنکس</p>
          <p className="text-xs text-muted-foreground mt-1">{tip}</p>
          {followUp && (
            <p className="text-xs text-brand-primary mt-2 font-medium">{followUp}</p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "بستن" : "پرسش"}
        </Button>
      </div>

      {open && (
        <div className="mt-3 flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="سؤال خود را بنویسید..."
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="پیام به دستیار"
          />
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={loading || !message.trim()}
            aria-label="ارسال"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}

      {quality && (
        <p className="sr-only">کیفیت فعلی {toPersianDigits(String(quality.score))} درصد</p>
      )}
    </div>
  );
}
