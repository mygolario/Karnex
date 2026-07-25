"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ResponsiveTableProps {
  children: React.ReactNode;
  /**
   * Width below which the table scrolls horizontally instead of squashing.
   * A plain `overflow-x-auto` does nothing on its own — the table still
   * compresses to fit unless something forces it wider.
   */
  minWidth?: number;
  /**
   * Optional card rendering for phones. When provided, the table is replaced
   * entirely below `md` rather than being made scrollable.
   */
  cards?: React.ReactNode;
  /** Applied to the table wrapper only — cards bring their own surface. */
  className?: string;
  cardsClassName?: string;
}

export function ResponsiveTable({
  children,
  minWidth = 640,
  cards,
  className,
  cardsClassName,
}: ResponsiveTableProps) {
  if (cards) {
    return (
      <>
        <div className={cn("md:hidden space-y-3", cardsClassName)}>{cards}</div>
        <div className={cn("hidden md:block w-full overflow-x-auto", className)}>
          {children}
        </div>
      </>
    );
  }

  return (
    <div
      className={cn(
        "w-full overflow-x-auto [-webkit-overflow-scrolling:touch] overscroll-x-contain",
        className
      )}
    >
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
}

/**
 * A single record rendered as a card — the mobile counterpart of a table row.
 * Pass an array of these as `cards` to `ResponsiveTable`.
 */
export function ResponsiveTableCard({
  title,
  actions,
  rows,
  onClick,
  className,
}: {
  title: React.ReactNode;
  actions?: React.ReactNode;
  rows: Array<{ label: React.ReactNode; value: React.ReactNode }>;
  onClick?: () => void;
  className?: string;
}) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "w-full text-start rounded-2xl border border-border/60 bg-card p-4 space-y-3",
        onClick && "transition-colors hover:bg-muted/40 active:bg-muted/60",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="font-semibold text-sm min-w-0 truncate">{title}</div>
        {actions && <div className="shrink-0 flex items-center gap-1">{actions}</div>}
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
        {rows.map((row, i) => (
          <div key={i} className="min-w-0">
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
              {row.label}
            </dt>
            <dd className="text-xs font-medium truncate">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Wrapper>
  );
}
