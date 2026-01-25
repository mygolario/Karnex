"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronRight, Loader2, BookOpen, ExternalLink, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StepGuideProps {
  stepName: string;
  stepPhase: string;
  projectName?: string;
}

export function StepGuide({ stepName, stepPhase, projectName }: StepGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState<string | null>(null);

  const fetchGuide = async () => {
    if (guide) {
      setIsOpen(true);
      return;
    }

    setLoading(true);
    setIsOpen(true); // Open immediately to show loader

    try {
      const prompt = `
        کاربر می‌خواهد مرحله زیر را در پروژه استارتاپی خود انجام دهد:
        "${stepName}"
        (فاز: ${stepPhase})
        
        پروژه: ${projectName || "استارتاپ"}

        لطفاً یک راهنمای بسیار خلاصه و کاربردی (شامل ۳ تا ۵ قدم اجرایی) برای انجام این مرحله بنویس.
        لحن: دوستانه و مربی‌گونه.
        فرمت: markdown ساده (بدون هدرهای بزرگ).
      `;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setGuide(data.reply);
      
    } catch (err) {
      console.error(err);
      setGuide("متاسفانه نتوانستم راهنما را بارگذاری کنم. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      {!isOpen ? (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchGuide}
          className="text-xs text-primary hover:text-primary/80 hover:bg-primary/5 h-7 px-2"
        >
          <HelpCircle size={12} className="mr-1.5" />
          چطور این کار را انجام دهم؟
        </Button>
      ) : (
        <Card variant="muted" className="mt-2 relative animate-in slide-in-from-top-2 fade-in duration-300 border-primary/20 bg-primary/5">
          <div className="flex justify-between items-start mb-3">
            <Badge variant="gradient" className="text-[10px] px-2 h-5">
              <Lightbulb size={10} className="mr-1" />
              راهنمای هوشمند
            </Badge>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-6 text-primary">
              <Loader2 size={24} className="animate-spin mb-2" />
              <span className="text-xs animate-pulse">در حال نوشتن راهنما...</span>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-muted-foreground text-sm leading-7 whitespace-pre-line">
              {guide}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
