"use client";

import React, { useState } from "react";
import { Wand2, RefreshCw, Zap, AlignLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- MAIN COMPONENT ---

interface SectionRegeneratorProps {
  sectionTitle?: string;
  currentContent?: string;
  onUpdate?: (newContent: string) => void;
}

export function SectionRegenerator({ 
  sectionTitle = "بخش طرح", 
  currentContent = "", 
  onUpdate 
}: SectionRegeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper to map mode to prompt instructions
  const getPromptForMode = (mode: "professional" | "simplify" | "expand") => {
    switch (mode) {
      case "professional":
        return "لطفاً متن زیر را با لحنی کاملاً رسمی، تجاری و حرفه‌ای بازنویسی کن. از واژگان مناسب کسب‌وکار استفاده کن.";
      case "simplify":
        return "لطفاً متن زیر را به زبان بسیار ساده، روان و قابل فهم بازنویسی کن. جملات پیچیده را کوتاه کن.";
      case "expand":
        return "لطفاً متن زیر را توسعه بده و جزئیات، مثال‌ها یا استدلال‌های بیشتری به آن اضافه کن تا کامل‌تر شود.";
      default:
        return "لطفاً متن زیر را بهبود بده.";
    }
  };

  const handleRegenerate = async (mode: "professional" | "simplify" | "expand") => {
    setLoading(true);
    try {
      // 1. Construct the Prompt
      const instruction = getPromptForMode(mode);
      const fullMessage = `
        ${instruction}
        
        عنوان بخش: ${sectionTitle}
        
        متن فعلی:
        "${currentContent}"
        
        فقط متن بازنویسی شده را برگردان. بدون توضیحات اضافه.
      `;

      // 2. Call the Real AI API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: fullMessage,
          // We can optionally pass planContext if available, but for refinement, text is usually enough.
          // If the API requires it, we can pass a minimal object.
          planContext: { projectName: "Refinement Task" } 
        })
      });

      if (!response.ok) throw new Error("AI Request Failed");

      const data = await response.json();
      
      if (data.reply) {
        if (onUpdate) onUpdate(data.reply);
        setIsOpen(false);
      } else {
        throw new Error("No reply from AI");
      }

    } catch (error) {
      console.error("Regeneration Error:", error);
      alert("متاسفانه ارتباط با هوش مصنوعی برقرار نشد. لطفاً مجدد تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block font-sans text-right" dir="rtl">
        {/* Trigger */}
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOpen(!isOpen)}
            className="gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-100 h-8 px-3"
        >
          <Wand2 className="h-4 w-4" />
          <span className="font-medium">بازنویسی با هوش مصنوعی</span>
        </Button>

        {/* Popover Content */}
        {isOpen && (
            <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                <div className="absolute left-0 z-20 mt-2 w-64 origin-top-left rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in duration-200 border border-indigo-100 overflow-hidden">
                    <div className="p-1 grid gap-1 relative">
                        {/* Header */}
                        <div className="flex justify-between items-center px-3 py-2 bg-indigo-50/50 border-b border-indigo-100 mb-1">
                            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                                <Wand2 className="h-3 w-3" />
                                دستیار هوشمند
                            </span>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                        
                        {/* Actions */}
                        <div className="p-2 space-y-1">
                            <button 
                                className="flex w-full items-center rounded-lg px-2 py-2.5 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors disabled:opacity-50 text-right group"
                                onClick={() => handleRegenerate("professional")} 
                                disabled={loading}
                            >
                                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-md ml-3 group-hover:bg-amber-200 transition-colors">
                                    <Zap className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex flex-col">
                                    <span>رسمی و حرفه‌ای</span>
                                    <span className="text-[10px] text-gray-400 font-normal">مناسب ارائه به سرمایه‌گذار</span>
                                </div>
                            </button>
                            
                            <button 
                                className="flex w-full items-center rounded-lg px-2 py-2.5 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors disabled:opacity-50 text-right group"
                                onClick={() => handleRegenerate("simplify")} 
                                disabled={loading}
                            >
                                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md ml-3 group-hover:bg-blue-200 transition-colors">
                                    <AlignLeft className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex flex-col">
                                    <span>ساده‌سازی متن</span>
                                    <span className="text-[10px] text-gray-400 font-normal">روان و قابل فهم</span>
                                </div>
                            </button>
                            
                            <button 
                                className="flex w-full items-center rounded-lg px-2 py-2.5 text-xs font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors disabled:opacity-50 text-right group"
                                onClick={() => handleRegenerate("expand")} 
                                disabled={loading}
                            >
                                <div className="p-1.5 bg-green-100 text-green-600 rounded-md ml-3 group-hover:bg-green-200 transition-colors">
                                    <RefreshCw className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex flex-col">
                                    <span>توسعه و بسط</span>
                                    <span className="text-[10px] text-gray-400 font-normal">افزودن جزئیات بیشتر</span>
                                </div>
                            </button>
                        </div>

                        {loading && (
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-30">
                                <div className="flex flex-col items-center gap-2 text-blue-600">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span className="text-xs font-medium animate-pulse">در حال نگارش...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </>
        )}
    </div>
  );
}

// Simple loader since we are removing the previous mock mocks
function Loader2({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
