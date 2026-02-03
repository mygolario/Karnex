"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "@/contexts/project-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  User,
  Lightbulb,
  Target,
  Mic,
  MicOff,
  Volume2,
  Presentation,
  FileText,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedTopics = [
  { icon: Target, text: "چگونه مشتری اول را پیدا کنم؟", color: "from-blue-500 to-cyan-500" },
  { icon: TrendingUp, text: "استراتژی رشد پیشنهاد بده", color: "from-emerald-500 to-teal-500" },
  { icon: Presentation, text: "نکات مهم برای پیچ سرمایه‌گذار", color: "from-purple-500 to-pink-500" },
  { icon: FileText, text: "مدل درآمدی مناسب چیست؟", color: "from-orange-500 to-amber-500" },
];

export default function CopilotPage() {
  const { activeProject: plan } = useProject();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState<"chat" | "pitch">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const systemPrompt = mode === "pitch"
        ? `You are a tough startup investor evaluating a pitch. Ask hard questions, challenge assumptions, and give brutally honest feedback. The startup is: ${plan?.projectName} - ${plan?.overview}. Respond in Persian.`
        : `You are Karnex AI Co-Pilot, a helpful business advisor. You have context about the user's project:
Project: ${plan?.projectName || "نامشخص"}
Description: ${plan?.overview || "نامشخص"}
Audience: ${plan?.audience || "نامشخص"}
Type: ${plan?.projectType || "startup"}

Provide helpful, actionable advice in Persian. Be concise but thorough.`;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: content,
          systemPrompt,
        }),
      });

      const data = await response.json();

      if (data.success && data.content) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    // @ts-ignore
    const recognition = new webkitSpeechRecognition();
    recognition.lang = "fa-IR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      inputRef.current?.focus();
    };

    recognition.start();
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fa-IR";
      speechSynthesis.speak(utterance);
    }
  };

  // Empty state
  if (!plan) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Bot size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">پروژه‌ای انتخاب نشده</h2>
          <p className="text-muted-foreground">برای استفاده از دستیار کارنکس، ابتدا پروژه‌ای بسازید.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground flex items-center gap-2">
              دستیار کارنکس
              <Badge variant="secondary" className="text-[10px]">AI</Badge>
            </h1>
            <p className="text-sm text-muted-foreground">مشاور شخصی کسب‌وکار</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl">
          <button
            onClick={() => setMode("chat")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "chat"
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            💬 چت
          </button>
          <button
            onClick={() => setMode("pitch")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "pitch"
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🎯 تمرین پیچ
          </button>
        </div>
      </div>

      {/* Mode Banner */}
      <AnimatePresence mode="wait">
        {mode === "pitch" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
          >
            <p className="text-sm text-purple-600 font-medium flex items-center gap-2">
              <Presentation size={16} />
              حالت تمرین پیچ فعال است. AI نقش سرمایه‌گذار سختگیر را بازی می‌کند.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center"
            >
              <Sparkles size={40} className="text-pink-500" />
            </motion.div>
            <h2 className="text-xl font-bold mb-2">سلام! من دستیار کارنکس هستم 👋</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              درباره {plan.projectName} سوال بپرسید یا یکی از موضوعات زیر را انتخاب کنید.
            </p>

            {/* Suggested Topics */}
            <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto">
              {suggestedTopics.map((topic, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => sendMessage(topic.text)}
                  className="group p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all text-right"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform`}>
                    <topic.icon size={20} />
                  </div>
                  <p className="text-sm font-medium">{topic.text}</p>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    message.role === "user"
                      ? "bg-primary text-white"
                      : "bg-gradient-to-br from-pink-500 to-rose-600 text-white"
                  }`}
                >
                  {message.role === "user" ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div
                  className={`max-w-[75%] p-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-muted rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm leading-7 whitespace-pre-wrap">{message.content}</p>
                  {message.role === "assistant" && (
                    <button
                      onClick={() => speakText(message.content)}
                      className="mt-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Volume2 size={12} />
                      خواندن
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm text-muted-foreground">در حال فکر کردن...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={toggleVoice}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "pitch" ? "پیچ خود را شروع کنید..." : "سوال خود را بپرسید..."}
          className="flex-1 h-12 px-4 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary/50 outline-none"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          size="lg"
          className="h-12 px-6"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </Button>
      </form>
    </div>
  );
}
