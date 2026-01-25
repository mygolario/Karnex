"use client";

import { useState, ReactNode } from "react";
import { HelpCircle, X, ChevronDown, ChevronUp, ExternalLink, Clock, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================
// HOVER EXPLAINER - Simple Tooltip on Hover
// ============================================
interface HoverExplainerProps {
  text: string;
  children?: ReactNode;
  className?: string;
}

export function HoverExplainer({ text, children, className }: HoverExplainerProps) {
  const [show, setShow] = useState(false);

  return (
    <span 
      className={cn("relative inline-flex items-center gap-1 cursor-help", className)}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children || <HelpCircle size={14} className="text-muted-foreground hover:text-primary transition-colors" />}
      
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-foreground text-background text-xs px-3 py-2 rounded-lg shadow-xl max-w-xs leading-relaxed whitespace-normal">
            {text}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
        </div>
      )}
    </span>
  );
}


// ============================================
// CLICK EXPLAINER - Modal with Detailed Guide
// ============================================
interface ExplainerGuide {
  title: string;
  description: string;
  steps?: string[];
  tools?: { name: string; link?: string; free?: boolean }[];
  difficulty?: "easy" | "medium" | "hard";
  timeEstimate?: string;
  tips?: string[];
}

interface ClickExplainerProps {
  guide: ExplainerGuide;
  children?: ReactNode;
  buttonText?: string;
  className?: string;
}

export function ClickExplainer({ guide, children, buttonText = "چطور انجام دهم؟", className }: ClickExplainerProps) {
  const [open, setOpen] = useState(false);

  const difficultyConfig = {
    easy: { label: "آسان", color: "bg-emerald-500", icon: "🟢" },
    medium: { label: "متوسط", color: "bg-amber-500", icon: "🟡" },
    hard: { label: "پیشرفته", color: "bg-red-500", icon: "🔴" },
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors",
          className
        )}
      >
        {children || (
          <>
            <HelpCircle size={14} />
            {buttonText}
          </>
        )}
      </button>

      {/* Modal Overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        >
          {/* Modal Content */}
          <div 
            className="bg-card rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-purple-600 text-white p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={18} />
                    <span className="text-xs opacity-80">راهنمای گام به گام</span>
                  </div>
                  <h3 className="text-lg font-bold">{guide.title}</h3>
                </div>
                <button 
                  onClick={() => setOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              {/* Badges */}
              {(guide.difficulty || guide.timeEstimate) && (
                <div className="flex gap-3 mt-4">
                  {guide.difficulty && (
                    <span className="flex items-center gap-1.5 text-xs bg-white/20 px-2.5 py-1 rounded-full">
                      {difficultyConfig[guide.difficulty].icon}
                      {difficultyConfig[guide.difficulty].label}
                    </span>
                  )}
                  {guide.timeEstimate && (
                    <span className="flex items-center gap-1.5 text-xs bg-white/20 px-2.5 py-1 rounded-full">
                      <Clock size={12} />
                      {guide.timeEstimate}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto max-h-[60vh] space-y-5">
              {/* Description */}
              <p className="text-muted-foreground leading-7">{guide.description}</p>

              {/* Steps */}
              {guide.steps && guide.steps.length > 0 && (
                <div>
                  <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Zap size={16} className="text-primary" />
                    مراحل انجام
                  </h4>
                  <ol className="space-y-3">
                    {guide.steps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-6 h-6 shrink-0 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground text-sm leading-6">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Recommended Tools */}
              {guide.tools && guide.tools.length > 0 && (
                <div>
                  <h4 className="font-bold text-foreground mb-3">ابزارهای پیشنهادی</h4>
                  <div className="grid gap-2">
                    {guide.tools.map((tool, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
                      >
                        <span className="font-medium text-sm text-foreground">{tool.name}</span>
                        <div className="flex items-center gap-2">
                          {tool.free && (
                            <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded">
                              رایگان
                            </span>
                          )}
                          {tool.link && (
                            <a 
                              href={tool.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-xs flex items-center gap-1"
                            >
                              مشاهده
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {guide.tips && guide.tips.length > 0 && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                  <h4 className="font-bold text-accent mb-2 text-sm">💡 نکات مهم</h4>
                  <ul className="space-y-2">
                    {guide.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-accent">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                بستن
              </Button>
              <Button variant="gradient" onClick={() => setOpen(false)}>
                فهمیدم!
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


// ============================================
// INLINE EXPLAINER - Icon with Expandable Text
// ============================================
interface InlineExplainerProps {
  title: string;
  text: string;
  children?: ReactNode;
  className?: string;
}

export function InlineExplainer({ title, text, children, className }: InlineExplainerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn("", className)}>
      {children}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-2"
      >
        <HelpCircle size={12} />
        <span>{expanded ? "بستن توضیحات" : "توضیح بیشتر"}</span>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      
      {expanded && (
        <div className="mt-3 p-4 bg-muted/50 rounded-xl border border-border animate-in slide-in-from-top-2 duration-200">
          <h4 className="font-bold text-foreground text-sm mb-2">{title}</h4>
          <p className="text-muted-foreground text-sm leading-7">{text}</p>
        </div>
      )}
    </div>
  );
}
