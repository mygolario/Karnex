"use client";

import React, { useState } from "react";
import { PenTool, Check, Loader2, Copy, X, Sparkles, Instagram, Mail, Layout, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ContentGeneratorProps {
  strategy: string;
  projectName: string;
  audience: string;
}

export function ContentGeneratorButton({ strategy, projectName, audience }: ContentGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [contentType, setContentType] = useState<'instagram' | 'email' | 'ad' | 'blog'>('instagram');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    setGeneratedContent(null);
    try {
      const typeLabel = {
        instagram: "پست اینستاگرام (کپشن + ایده تصویر)",
        email: "متن ایمیل مارکتینگ",
        ad: "متن تبلیغاتی کوتاه (Ad Copy)",
        blog: "ساختار کلی مقاله بلاگ (Outline)"
      }[contentType];

      const prompt = `
        برای استارتاپ "${projectName}" با مخاطب هدف "${audience}"، 
        بر اساس استراتژی بازاریابی زیر: "${strategy}"
        
        لطفاً یک نمونه "${typeLabel}" جذاب و حرفه‌ای بنویس.
        لحن: ترغیب‌کننده و دوستانه.
        زبان: فارسی.
      `;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });

      const data = await res.json();
      setGeneratedContent(data.reply);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={(e) => e.stopPropagation()}>
          <Card variant="default" className="max-w-xl w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95" padding="lg">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute left-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-black text-foreground mb-1 flex items-center gap-2">
                <PenTool size={20} className="text-primary" />
                دستیار تولید محتوا
              </h2>
              <p className="text-sm text-muted-foreground">
                استراتژی: {strategy}
              </p>
            </div>

            {/* Type Selector */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { id: 'instagram', icon: Instagram, label: "اینستاگرام" },
                { id: 'email', icon: Mail, label: "ایمیل" },
                { id: 'ad', icon: Type, label: "تبلیغ" },
                { id: 'blog', icon: Layout, label: "بلاگ" },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setContentType(type.id as any)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                    contentType === type.id 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  }`}
                >
                  <type.icon size={18} className="mb-1" />
                  {type.label}
                </button>
              ))}
            </div>

            {!generatedContent && !loading && (
              <div className="text-center py-8">
                <Button size="lg" variant="gradient" onClick={generate} className="w-full">
                  <Sparkles size={18} className="mr-2" />
                  بنویس!
                </Button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-primary mb-3" />
                <span className="text-sm text-muted-foreground animate-pulse">در حال ایده‌پردازی و نوشتن...</span>
              </div>
            )}

            {generatedContent && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-muted/30 border border-border rounded-xl p-4 text-sm leading-7 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {generatedContent}
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setGeneratedContent(null)}>
                    تلاش دوباره
                  </Button>
                  <Button variant="default" className="flex-[2] gap-2" onClick={copyToClipboard}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "کپی شد" : "کپی متن"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
