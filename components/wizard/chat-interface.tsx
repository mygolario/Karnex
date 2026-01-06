"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceInputButton } from "./voice-input-button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ExtractedData {
  idea?: string;
  problem?: string;
  audience?: string;
  industry?: string;
  competitors?: string[];
  budget?: string;
  status?: string;
}

interface ChatInterfaceProps {
  onComplete: (data: ExtractedData) => void;
}

const systemPrompt = `تو یک مشاور استارتاپی هستی که به کاربران ایرانی کمک می‌کنی ایده‌شون رو توضیح بدن.
سوالات رو یکی یکی و به زبان ساده بپرس:
1. ایده کسب‌وکارت چیه؟
2. چه مشکلی رو حل می‌کنه؟
3. مخاطبت کیه؟
4. رقیب‌هات کی‌ان؟
5. چقدر بودجه داری؟

جواب‌ها رو کوتاه و دوستانه بده. وقتی همه اطلاعات رو داشتی، بگو "عالیه! حالا بزن دکمه 'ساخت طرح' تا طرح کسب‌وکارت رو بسازم 🚀"`;

const initialMessage: Message = {
  id: "initial",
  role: "assistant",
  content: "سلام! 👋 من دستیار هوشمند کارنکس هستم.\n\nبذار کمکت کنم یه طرح کسب‌وکار عالی بسازی. اول بگو **ایده‌ات چیه؟** سعی کن ساده و خلاصه توضیح بدی."
};

export function ChatInterface({ onComplete }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/wizard-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          systemPrompt
        })
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update extracted data if provided
      if (data.extractedData) {
        setExtractedData(prev => ({ ...prev, ...data.extractedData }));
      }

    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "متاسفانه مشکلی پیش اومد. دوباره امتحان کن."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = (text: string) => {
    setInput(prev => prev + " " + text);
    inputRef.current?.focus();
  };

  const isComplete = Boolean(extractedData.idea && extractedData.problem);

  return (
    <div className="flex flex-col h-[500px] bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-foreground">دستیار کارنکس</p>
          <p className="text-xs text-muted-foreground">آنلاین و آماده کمک</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                message.role === "user" 
                  ? "bg-primary text-white" 
                  : "bg-muted text-foreground"
              )}>
                {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn(
                "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
                message.role === "user" 
                  ? "bg-primary text-white rounded-br-sm" 
                  : "bg-muted text-foreground rounded-bl-sm"
              )}>
                {message.content.split("\n").map((line, i) => (
                  <p key={i} className={i > 0 ? "mt-2" : ""}>
                    {line}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-muted p-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-muted/30">
        {isComplete && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onComplete(extractedData)}
            className="w-full mb-3 p-3 bg-gradient-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Sparkles size={18} />
            ساخت طرح کسب‌وکار
          </motion.button>
        )}
        
        <div className="flex items-center gap-2">
          <VoiceInputButton onTranscript={handleVoiceInput} />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="پیامت رو بنویس..."
            className="flex-1 input-premium"
            disabled={isLoading}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-3 rounded-xl transition-all",
              input.trim() && !isLoading
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
