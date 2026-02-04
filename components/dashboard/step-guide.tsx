"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, ChevronRight, Loader2, Lightbulb, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Context for pre-filling AI chat from roadmap


interface StepGuideProps {
  stepName: string;
  stepPhase: string;
  projectName?: string;
}

export function StepGuide({ stepName, stepPhase, projectName }: StepGuideProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState<string | null>(null);

  const fetchGuide = async () => {
    if (guide) {
      setIsOpen(true);
      return;
    }

    setLoading(true);
    setIsOpen(true);

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

  // Open AI chat with pre-filled question about this step
  const askAiMentor = () => {
    const question = `در مورد مرحله "${stepName}" (فاز: ${stepPhase}) سوال دارم. چطور باید این کار رو انجام بدم؟`;
    // Navigate to copilot with question as query param
    router.push(`/dashboard/copilot?q=${encodeURIComponent(question)}`);
  };

  return (
    <div className="mt-2">
      {!isOpen ? (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchGuide}
            className="text-xs text-primary hover:text-primary/80 hover:bg-primary/5 h-7 px-2"
          >
            <HelpCircle size={12} className="mr-1.5" />
            چطور انجام بدم؟
          </Button>
          
          {/* AI Mentor Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={askAiMentor}
            className="text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-7 px-2"
          >
            <MessageCircle size={12} className="mr-1.5" />
            کمک از دستیار کارنکس
          </Button>
        </div>
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
            <>
              <div className="prose prose-sm max-w-none text-muted-foreground text-sm leading-7 whitespace-pre-line">
                {guide}
              </div>
              
              {/* Still confused? Ask AI Mentor */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={askAiMentor}
                  className="w-full text-xs gap-2"
                >
                  <MessageCircle size={14} />
                  هنوز سوال دارم — بپرس از منتور AI
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
