"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AIVersionEntry {
  id: string;
  label: string;
  createdAt: string;
  summary?: string;
}

export function AIVersionHistory({
  versions,
  activeId,
  onSelect,
  onCompare,
  className,
}: {
  versions: AIVersionEntry[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onCompare?: (a: string, b: string) => void;
  className?: string;
}) {
  if (versions.length <= 1) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-xs text-muted-foreground">نسخه‌ها:</span>
      {versions.map((v, i) => (
        <Button
          key={v.id}
          variant={v.id === activeId ? "default" : "outline"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => onSelect?.(v.id)}
        >
          {v.label || `نسخه ${i + 1}`}
        </Button>
      ))}
      {versions.length >= 2 && onCompare && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onCompare(versions[0].id, versions[1].id)}
        >
          مقایسه
        </Button>
      )}
    </div>
  );
}
