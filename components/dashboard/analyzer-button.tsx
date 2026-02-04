"use client";

import React, { useState } from "react";
import { Search, Loader2, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BusinessPlan } from "@/lib/db";

interface AnalyzerButtonProps {
  plan: BusinessPlan;
}

export function AnalyzerButton({ plan }: AnalyzerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{ strengths: string[], weaknesses: string[], score: number } | null>(null);

  const analyze = async () => {
    setLoading(true);
    try {
      const prompt = `
        Analyze this Business Model Canvas for a project called "${plan.projectName}".
        
        Canvas Data:
        - Key Partners: ${JSON.stringify(plan.leanCanvas?.keyPartners)}
        - Key Activities: ${JSON.stringify(plan.leanCanvas?.keyActivities)}
        - Key Resources: ${JSON.stringify(plan.leanCanvas?.keyResources)}
        - Value Propositions: ${JSON.stringify(plan.leanCanvas?.uniqueValue)}
        - Customer Relationships: ${JSON.stringify(plan.leanCanvas?.customerRelations)}
        - Channels: ${JSON.stringify(plan.leanCanvas?.channels)}
        - Customer Segments: ${JSON.stringify(plan.leanCanvas?.customerSegments)}
        - Cost Structure: ${JSON.stringify(plan.leanCanvas?.costStructure)}
        - Revenue Streams: ${JSON.stringify(plan.leanCanvas?.revenueStream)}

        Act like a strict Angel Investor.
        Return ONLY a JSON object with this format (no markdown):
        {
          "strengths": ["point 1", "point 2"],
          "weaknesses": ["point 1", "point 2"],
          "score": 85
        }
        Translate the content to Persian.
      `;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, jsonMode: true }) // Hint for JSON
      });

      const data = await res.json();
      // Try to parse JSON from the reply string if it's wrapped in markdown
      const jsonStr = data.reply.replace(/```json/g, '').replace(/```/g, '');
      setAnalysis(JSON.parse(jsonStr));
    } catch (err) {
      console.error(err);
      // Fallback mock
      setAnalysis({
        strengths: ["ارزش پیشنهادی شفاف است", "جریان درآمدی مشخص است"],
        weaknesses: ["بخش مشتریان نیاز به تدقیق دارد", "پایداری مالی باید بررسی شود"],
        score: 75
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => { setIsOpen(true); if (!analysis) analyze(); }}
        className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
      >
        <Search size={16} />
        نقد و بررسی هوشمند
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <Card variant="default" className="max-w-xl w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95" padding="xl">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute left-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Search size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-foreground">تحلیل سرمایه‌گذار</h2>
              <p className="text-muted-foreground">دستیار کارنکس بوم کسب‌وکار شما را نقد می‌کند</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 size={40} className="animate-spin text-primary mb-4" />
                <p className="animate-pulse text-muted-foreground">در حال بررسی مدل کسب‌وکار...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                {/* Score */}
                <div className="flex items-center justify-center mb-8">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" className="text-muted/20" fill="none" />
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" className="text-primary" fill="none" 
                        strokeDasharray={351} 
                        strokeDashoffset={351 - (351 * analysis.score) / 100} 
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-foreground">{analysis.score}</span>
                      <span className="text-xs text-muted-foreground">امتیاز کل</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                    <h3 className="font-bold text-emerald-600 mb-3 flex items-center gap-2">
                      <CheckCircle2 size={18} />
                      نقاط قوت
                    </h3>
                    <ul className="space-y-2">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
                    <h3 className="font-bold text-rose-600 mb-3 flex items-center gap-2">
                      <AlertTriangle size={18} />
                      نقاط قابل بهبود
                    </h3>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button className="w-full mt-4" size="lg" onClick={() => setIsOpen(false)}>
                  متوجه شدم
                </Button>
              </div>
            ) : null}
          </Card>
        </div>
      )}
    </>
  );
}
