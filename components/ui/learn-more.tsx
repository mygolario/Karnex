"use client";

import { useState, ReactNode } from "react";
import { ChevronDown, ChevronUp, Lightbulb, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// LEARN MORE - Expandable Accordion Section
// ============================================
interface LearnMoreProps {
  title?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  variant?: "default" | "primary" | "secondary" | "accent" | "muted";
  className?: string;
}

export function LearnMore({ 
  title = "بیشتر بدانید", 
  children, 
  defaultOpen = false,
  variant = "default",
  className 
}: LearnMoreProps) {
  const [expanded, setExpanded] = useState(defaultOpen);

  const variantStyles = {
    default: "bg-primary/5 border-primary/20 hover:bg-primary/10",
    primary: "bg-primary/5 border-primary/20 hover:bg-primary/10",
    accent: "bg-accent/5 border-accent/20 hover:bg-accent/10",
    muted: "bg-muted/50 border-border hover:bg-muted",
    secondary: "bg-secondary/5 border-secondary/20 hover:bg-secondary/10",
  };

  return (
    <div className={cn("rounded-xl overflow-hidden", className)}>
      {/* Toggle Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full flex items-center justify-between gap-3 p-4 text-right transition-colors border",
          variantStyles[variant],
          expanded ? "rounded-t-xl" : "rounded-xl"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            variant === "accent" ? "bg-accent/20 text-accent" 
              : variant === "secondary" ? "bg-secondary/20 text-secondary"
              : "bg-primary/20 text-primary"
          )}>
            <Lightbulb size={16} />
          </div>
          <span className="font-bold text-foreground text-sm">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp size={18} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={18} className="text-muted-foreground" />
        )}
      </button>

      {/* Expandable Content */}
      {expanded && (
        <div className={cn(
          "border border-t-0 rounded-b-xl p-4 animate-in slide-in-from-top-2 duration-200",
          variant === "accent" ? "border-accent/20 bg-accent/5" 
            : variant === "muted" ? "border-border bg-muted/30"
            : variant === "secondary" ? "border-secondary/20 bg-secondary/5"
            : "border-primary/20 bg-primary/5"
        )}>
          {children}
        </div>
      )}
    </div>
  );
}


// ============================================
// FAQ ITEM - Question/Answer Accordion
// ============================================
interface FaqItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
  className?: string;
}

export function FaqItem({ question, answer, defaultOpen = false, className }: FaqItemProps) {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <div className={cn("border border-border rounded-xl overflow-hidden", className)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full flex items-center justify-between gap-3 p-4 text-right transition-colors hover:bg-muted/50",
          expanded && "bg-muted/30"
        )}
      >
        <span className="font-bold text-foreground text-sm">{question}</span>
        {expanded ? (
          <ChevronUp size={18} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown size={18} className="text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
          <p className="text-muted-foreground text-sm leading-7">{answer}</p>
        </div>
      )}
    </div>
  );
}


// ============================================
// FEATURE GUIDE - Section with Icon & Content
// ============================================
interface FeatureGuideProps {
  icon: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
  variant?: "primary" | "secondary" | "accent";
  className?: string;
}

export function FeatureGuide({ 
  icon, 
  title, 
  description, 
  children,
  variant = "primary",
  className 
}: FeatureGuideProps) {
  const variantStyles = {
    primary: "from-primary/10 to-purple-500/10 border-primary/20",
    secondary: "from-secondary/10 to-emerald-500/10 border-secondary/20",
    accent: "from-accent/10 to-orange-500/10 border-accent/20",
  };

  const iconStyles = {
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-white",
    accent: "bg-accent text-white",
  };

  return (
    <div className={cn(
      "bg-gradient-to-br rounded-2xl border p-6",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start gap-4 mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
          iconStyles[variant]
        )}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg mb-1">{title}</h3>
          <p className="text-muted-foreground text-sm leading-6">{description}</p>
        </div>
      </div>
      {children && (
        <div className="mt-4 pt-4 border-t border-border/50">
          {children}
        </div>
      )}
    </div>
  );
}


// ============================================
// GLOSSARY TERM - Definition with Tooltip
// ============================================
interface GlossaryTermProps {
  term: string;
  definition: string;
  className?: string;
}

export function GlossaryTerm({ term, definition, className }: GlossaryTermProps) {
  const [show, setShow] = useState(false);

  return (
    <span 
      className={cn(
        "relative inline border-b border-dashed border-primary/50 text-primary cursor-help",
        className
      )}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {term}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-foreground text-background text-xs px-3 py-2 rounded-lg shadow-xl max-w-xs leading-relaxed whitespace-normal min-w-[200px]">
            <strong className="block mb-1 text-secondary">{term}:</strong>
            {definition}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
        </div>
      )}
    </span>
  );
}
