"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "./location-context";
import { useProject } from "@/contexts/project-context";
import { Loader2, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationAiChatProps {
  open: boolean;
  onClose: () => void;
}

export function LocationAiChat({ open, onClose }: LocationAiChatProps) {
  const { analysis } = useLocation();
  const { activeProject } = useProject();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([]);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const send = async () => {
    if (!input.trim() || !analysis) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "location-chat",
          prompt: userMsg,
          activeProject,
          locationAnalysis: analysis,
        }),
      });
      const data = await res.json();
      const reply =
        data.content ||
        data.reply ||
        "پاسخی دریافت نشد. از تب‌های گزارش استفاده کنید.";
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "خطا در ارتباط. دوباره تلاش کنید." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-[min(400px,calc(100vw-2rem))] shadow-2xl border-white/10 bg-background/95 backdrop-blur-xl dir-rtl">
      <div className="flex items-center justify-between p-3 border-b border-white/5">
        <span className="text-sm font-bold">پرسش درباره این مکان</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X size={16} />
        </Button>
      </div>
      <div className="h-48 overflow-y-auto p-3 space-y-2 text-xs">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-center py-6">
            مثلاً: «آیا اجاره اینجا با بودجه من جور است؟»
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "p-2 rounded-lg max-w-[90%]",
              m.role === "user"
                ? "bg-primary/10 mr-auto text-right"
                : "bg-muted/30 ml-auto"
            )}
          >
            {m.text}
          </div>
        ))}
        {loading && <Loader2 className="animate-spin mx-auto size-5 text-primary" />}
      </div>
      <div className="p-3 flex gap-2 border-t border-white/5">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="سؤال خود را بنویسید..."
          className="h-9 text-xs"
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <Button size="icon" className="h-9 w-9 shrink-0" onClick={send} disabled={loading}>
          <Send size={14} />
        </Button>
      </div>
    </Card>
  );
}
