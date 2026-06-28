"use client";

import { cn } from "@/lib/utils";
import { AIActionBar } from "./ai-action-bar";

export function AIStudioLayout({
  inputPanel,
  outputPanel,
  actions,
  className,
}: {
  inputPanel: React.ReactNode;
  outputPanel: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-[minmax(280px,1fr)_2fr]", className)}>
      <div className="rounded-xl border bg-muted/20 p-4 space-y-3">{inputPanel}</div>
      <div className="rounded-xl border bg-card p-4 space-y-3 min-h-[320px]">
        {outputPanel}
        {actions && (
          <div className="pt-3 border-t flex flex-wrap gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}

export function AIStudioActionBar(
  props: React.ComponentProps<typeof AIActionBar>
) {
  return <AIActionBar {...props} compact />;
}
