"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { HelpCircle } from "lucide-react";

interface OptionTileProps {
  label: string;
  hint?: string;
  icon?: LucideIcon;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function OptionTile({
  label,
  hint,
  icon: Icon,
  selected,
  onClick,
  disabled,
}: OptionTileProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full text-start rounded-2xl border px-4 py-4 transition-all",
        "bg-card/50 backdrop-blur-sm hover:border-brand-primary/40 hover:bg-brand-primary/5",
        selected
          ? "border-brand-primary ring-2 ring-brand-primary/20 bg-brand-primary/5"
          : "border-border/60",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <span
            className={cn(
              "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white",
              !selected && "opacity-80"
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-bold text-foreground">{label}</p>
          {hint && (
            <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>
          )}
        </div>
      </div>
    </button>
  );
}

export function ChipButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-sm transition-colors",
        selected
          ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold"
          : "border-border/60 bg-card/40 text-muted-foreground hover:border-brand-primary/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

export function JargonTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-primary"
        aria-expanded={open}
      >
        <HelpCircle className="h-3.5 w-3.5" />
        <span>یعنی چی؟</span>
      </button>
      {open && (
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed bg-muted/40 rounded-lg px-3 py-2">
          {text}
        </p>
      )}
    </div>
  );
}

export function StickyNav({
  onBack,
  onNext,
  nextLabel = "ادامه",
  nextDisabled,
  backLabel = "قبلی",
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backLabel?: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl",
        "p-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex justify-center gap-3",
        "md:static md:mt-10 md:border-0 md:bg-transparent md:backdrop-blur-none md:p-0 md:pb-0"
      )}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="h-12 px-5 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          {backLabel}
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className={cn(
          "h-12 flex-1 max-w-sm rounded-xl font-bold text-white transition-all",
          "bg-gradient-to-r from-brand-primary to-brand-secondary shadow-lg shadow-primary/20",
          nextDisabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {nextLabel}
      </button>
    </div>
  );
}
