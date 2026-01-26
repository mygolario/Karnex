"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenTool,
  Check,
  Loader2,
  Copy,
  X,
  Sparkles,
  Instagram,
  Mail,
  Layout,
  Type,
  MessageCircle,
  Film,
  Image,
  RefreshCw,
  Smile,
  Briefcase,
  Megaphone,
  Clock,
  CheckCircle2,
  Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ContentGeneratorProps {
  strategy: string;
  projectName: string;
  audience: string;
}

type ContentType = 'instagram' | 'story' | 'carousel' | 'email' | 'ad' | 'blog';
type ToneType = 'friendly' | 'professional' | 'persuasive';

interface ContentTypeOption {
  id: ContentType;
  icon: React.ElementType;
  label: string;
  description: string;
}

interface ToneOption {
  id: ToneType;
  icon: React.ElementType;
  label: string;
  emoji: string;
}

const contentTypes: ContentTypeOption[] = [
  { id: 'instagram', icon: Instagram, label: "پست اینستاگرام", description: "کپشن + هشتگ" },
  { id: 'story', icon: Film, label: "استوری", description: "متن کوتاه + CTA" },
  { id: 'carousel', icon: Image, label: "کاروسل", description: "۵ اسلاید" },
  { id: 'email', icon: Mail, label: "ایمیل مارکتینگ", description: "عنوان + بدنه" },
  { id: 'ad', icon: Megaphone, label: "متن تبلیغاتی", description: "کپی کوتاه" },
  { id: 'blog', icon: Layout, label: "مقاله بلاگ", description: "ساختار + عناوین" },
];

const tones: ToneOption[] = [
  { id: 'friendly', icon: Smile, label: "دوستانه", emoji: "😊" },
  { id: 'professional', icon: Briefcase, label: "رسمی", emoji: "💼" },
  { id: 'persuasive', icon: Megaphone, label: "ترغیب‌کننده", emoji: "🔥" },
];

// Pre-made templates
const templates = [
  { id: 1, name: "معرفی محصول", types: ['instagram', 'carousel'] },
  { id: 2, name: "تخفیف ویژه", types: ['story', 'ad'] },
  { id: 3, name: "آموزشی", types: ['carousel', 'blog'] },
  { id: 4, name: "پشت صحنه", types: ['story', 'instagram'] },
];

export function ContentGeneratorButton({ strategy, projectName, audience }: ContentGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [contentType, setContentType] = useState<ContentType>('instagram');
  const [tone, setTone] = useState<ToneType>('friendly');
  const [generatedContents, setGeneratedContents] = useState<string[]>([]);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generate = async () => {
    setLoading(true);
    setProgress(0);
    setGeneratedContents([]);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 90));
    }, 300);

    try {
      const typeLabel = {
        instagram: "پست اینستاگرام (کپشن + ایده تصویر + هشتگ)",
        story: "متن استوری اینستاگرام با CTA",
        carousel: "محتوای ۵ اسلاید کاروسل",
        email: "متن ایمیل مارکتینگ (عنوان + بدنه)",
        ad: "متن تبلیغاتی کوتاه (Ad Copy)",
        blog: "ساختار کلی مقاله بلاگ (Outline)"
      }[contentType];

      const toneLabel = {
        friendly: "دوستانه و صمیمی",
        professional: "رسمی و حرفه‌ای",
        persuasive: "ترغیب‌کننده و فوری"
      }[tone];

      const prompt = `
        برای استارتاپ "${projectName}" با مخاطب هدف "${audience}"، 
        بر اساس استراتژی بازاریابی زیر: "${strategy}"
        
        لطفاً ۳ نسخه متفاوت از "${typeLabel}" بنویس.
        لحن: ${toneLabel}
        زبان: فارسی
        
        هر نسخه را با "---" جدا کن.
        نسخه‌ها باید متنوع اما همگی حرفه‌ای باشند.
      `;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });

      const data = await res.json();
      const variations = data.reply.split('---').map((v: string) => v.trim()).filter(Boolean);
      setGeneratedContents(variations.length > 0 ? variations : [data.reply]);
      setProgress(100);
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  const copyToClipboard = (text?: string) => {
    const content = text || generatedContents[selectedVariation];
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyAll = () => {
    const allContent = generatedContents.join('\n\n---\n\n');
    navigator.clipboard.writeText(allContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setStep(0);
    setGeneratedContents([]);
    setSelectedVariation(0);
  };

  return (
    <>
      <Button
        size="sm"
        variant="gradient"
        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
        className="gap-2 shadow-sm text-xs h-8"
      >
        <Sparkles size={12} />
        تولید محتوا
      </Button>

      {mounted && isOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in isolate"
          onClick={() => { setIsOpen(false); reset(); }}
          onMouseMove={(e) => e.stopPropagation()}
          onMouseEnter={(e) => e.stopPropagation()}
          onMouseLeave={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onMouseMove={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border/50 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white">
                  <Wand2 size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">دستیار تولید محتوا</h2>
                  <p className="text-xs text-muted-foreground">{strategy}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Progress dots */}
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((s) => (
                    <div
                      key={s}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        step >= s ? "bg-primary" : "bg-muted"
                      )}
                    />
                  ))}
                </div>

                <button
                  onClick={() => { setIsOpen(false); reset(); }}
                  className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Step 0: Select Type */}
                {step === 0 && (
                  <motion.div
                    key="type"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="text-sm text-muted-foreground">چه نوع محتوایی می‌خواهید؟</div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {contentTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setContentType(type.id)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center",
                            contentType === type.id
                              ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                              : "border-border/50 hover:border-border bg-muted/30"
                          )}
                        >
                          <type.icon size={24} className={contentType === type.id ? "text-primary" : "text-muted-foreground"} />
                          <div>
                            <div className="font-bold text-foreground text-sm">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Quick Templates */}
                    <div className="pt-4 border-t border-border/50">
                      <div className="text-xs text-muted-foreground mb-3">قالب‌های آماده:</div>
                      <div className="flex flex-wrap gap-2">
                        {templates.filter(t => t.types.includes(contentType)).map((template) => (
                          <Badge
                            key={template.id}
                            variant="secondary"
                            className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                          >
                            {template.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full" onClick={() => setStep(1)}>
                      مرحله بعد
                    </Button>
                  </motion.div>
                )}

                {/* Step 1: Select Tone */}
                {step === 1 && (
                  <motion.div
                    key="tone"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="text-sm text-muted-foreground">لحن محتوا چطور باشد؟</div>

                    <div className="grid grid-cols-3 gap-4">
                      {tones.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTone(t.id)}
                          className={cn(
                            "flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all",
                            tone === t.id
                              ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                              : "border-border/50 hover:border-border bg-muted/30"
                          )}
                        >
                          <span className="text-3xl">{t.emoji}</span>
                          <div className="font-bold text-foreground">{t.label}</div>
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(0)}>قبلی</Button>
                      <Button
                        className="flex-1"
                        onClick={generate}
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            <span>در حال نوشتن... {Math.round(progress)}%</span>
                          </div>
                        ) : (
                          <>
                            <Sparkles size={16} className="ml-2" />
                            تولید ۳ نسخه
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Progress bar */}
                    {loading && (
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-violet-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Results */}
                {step === 2 && generatedContents.length > 0 && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* Success badge */}
                    <div className="flex items-center justify-between">
                      <Badge className="gap-1 bg-emerald-100 text-emerald-700 border-emerald-200">
                        <CheckCircle2 size={12} />
                        {generatedContents.length} نسخه تولید شد
                      </Badge>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={copyAll} className="gap-2">
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                          کپی همه
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setStep(1); generate(); }} className="gap-2">
                          <RefreshCw size={12} />
                          تولید مجدد
                        </Button>
                      </div>
                    </div>

                    {/* Variation selector */}
                    <div className="flex gap-2">
                      {generatedContents.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedVariation(idx)}
                          className={cn(
                            "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all",
                            selectedVariation === idx
                              ? "bg-primary text-white shadow-md"
                              : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          )}
                        >
                          نسخه {idx + 1}
                        </button>
                      ))}
                    </div>

                    {/* Content display */}
                    <div className="relative">
                      <div className="bg-muted/30 border border-border rounded-2xl p-5 text-sm leading-8 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                        {generatedContents[selectedVariation]}
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-3 left-3 gap-1 h-8"
                        onClick={() => copyToClipboard()}
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? "کپی شد" : "کپی"}
                      </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={reset}>
                        محتوای جدید
                      </Button>
                      <Button variant="outline" className="flex-1 gap-2">
                        <Clock size={14} />
                        زمان‌بندی
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </>
  );
}
