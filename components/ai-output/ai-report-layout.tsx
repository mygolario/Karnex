"use client";

import { cn } from "@/lib/utils";
import { AIExecutiveSummary } from "./ai-executive-summary";
import { AIReasoningPanel } from "./ai-reasoning-panel";

export function AIReportLayout({
  hero,
  tabs,
  activeTab,
  onTabChange,
  summaryBullets,
  reasoning,
  children,
  className,
}: {
  hero: React.ReactNode;
  tabs?: { id: string; label: string }[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  summaryBullets?: string[];
  reasoning?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {hero}
      {summaryBullets && summaryBullets.length > 0 && (
        <AIExecutiveSummary bullets={summaryBullets} />
      )}
      {tabs && tabs.length > 0 && (
        <div className="flex gap-1 overflow-x-auto border-b pb-px">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange?.(t.id)}
              className={cn(
                "shrink-0 px-3 py-2 text-xs font-medium border-b-2 transition-colors",
                activeTab === t.id
                  ? "border-ai text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div>{children}</div>
      <AIReasoningPanel reasoning={reasoning} />
    </div>
  );
}
