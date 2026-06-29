"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "./location-context";
import { Brain, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutiveSummaryCardProps {
  onNavigateTab?: (tab: string) => void;
}

export function ExecutiveSummaryCard({ onNavigateTab }: ExecutiveSummaryCardProps) {
  const { analysis } = useLocation();
  const [expanded, setExpanded] = useState(false);

  const narrative =
    analysis?.executiveSummary?.narrative || analysis?.aiInsight;
  const links = analysis?.executiveSummary?.evidenceLinks || [];

  if (!narrative) return null;

  return (
    <Card className="p-5 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent dir-rtl">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Brain size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm mb-2">خلاصه مدیریتی</h3>
          <p
            className={cn(
              "text-sm text-muted-foreground leading-relaxed",
              !expanded && "line-clamp-4"
            )}
          >
            {narrative}
          </p>
          {narrative.length > 200 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 mt-2 text-xs"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp size={14} className="ml-1" /> کمتر
                </>
              ) : (
                <>
                  <ChevronDown size={14} className="ml-1" /> بیشتر
                </>
              )}
            </Button>
          )}
          {links.length > 0 && onNavigateTab && (
            <div className="flex flex-wrap gap-2 mt-3">
              {links.map((link) => (
                <Button
                  key={link.tab}
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] border-white/10"
                  onClick={() => onNavigateTab(link.tab)}
                >
                  {link.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
