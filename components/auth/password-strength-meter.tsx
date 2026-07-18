"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

const REQUIREMENTS = [
  { key: "length", label: "حداقل ۸ کاراکتر", test: (p: string) => p.length >= 8 },
  { key: "upper", label: "حرف بزرگ انگلیسی", test: (p: string) => /[A-Z]/.test(p) },
  { key: "number", label: "عدد", test: (p: string) => /[0-9]/.test(p) },
  { key: "symbol", label: "کاراکتر خاص", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function PasswordStrengthMeter({
  password,
  className,
}: PasswordStrengthMeterProps) {
  const { score, label, color, passed } = useMemo(() => {
    if (!password) {
      return { score: 0, label: "", color: "", passed: [] as string[] };
    }

    const passedKeys = REQUIREMENTS.filter((r) => r.test(password)).map((r) => r.key);

    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;

    let resolvedLabel = "";
    let resolvedColor = "";

    if (s <= 1) {
      resolvedLabel = "ضعیف";
      resolvedColor = "bg-destructive";
    } else if (s <= 2) {
      resolvedLabel = "متوسط";
      resolvedColor = "bg-amber-500";
    } else if (s <= 3) {
      resolvedLabel = "خوب";
      resolvedColor = "bg-brand-primary";
    } else {
      resolvedLabel = "قوی";
      resolvedColor = "bg-emerald-500";
    }

    return { score: s, label: resolvedLabel, color: resolvedColor, passed: passedKeys };
  }, [password]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <div className="flex gap-1 h-1 flex-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "flex-1 rounded-full transition-all duration-300",
                level <= score ? color : "bg-muted"
              )}
            />
          ))}
        </div>
        {label && (
          <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
            {label}
          </span>
        )}
      </div>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {REQUIREMENTS.map((req) => {
          const isPassed = passed.includes(req.key);
          return (
            <li
              key={req.key}
              className={cn(
                "flex items-center gap-1.5 text-xs transition-colors",
                isPassed ? "text-brand-primary" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors",
                  isPassed
                    ? "border-brand-primary bg-brand-primary/10"
                    : "border-border"
                )}
              >
                {isPassed && <Check size={10} />}
              </span>
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
