"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CompetitorNextMove } from "@/lib/competitors/types";

type Props = {
  moves: CompetitorNextMove[];
  onToggle: (id: string) => void;
};

export function NextMovesPanel({ moves, onToggle }: Props) {
  if (moves.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground" dir="rtl">
        هنوز قدم بعدی پیشنهاد نشده — یک کشف هوشمند اجرا کن.
      </Card>
    );
  }

  const todo = moves.filter((m) => m.status === "todo");
  const done = moves.filter((m) => m.status === "done");

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h2 className="font-semibold">قدم‌های بعدی</h2>
        <p className="text-xs text-muted-foreground mt-1">
          کارهای عملی برای تقویت تمایزت — تیک بزن وقتی انجام شد.
        </p>
      </div>

      <div className="space-y-2">
        {todo.map((m) => (
          <MoveRow key={m.id} move={m} onToggle={onToggle} />
        ))}
      </div>

      {done.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs text-muted-foreground">انجام‌شده</p>
          {done.map((m) => (
            <MoveRow key={m.id} move={m} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

function MoveRow({
  move,
  onToggle,
}: {
  move: CompetitorNextMove;
  onToggle: (id: string) => void;
}) {
  const done = move.status === "done";
  return (
    <button
      type="button"
      onClick={() => onToggle(move.id)}
      className={cn(
        "w-full text-start rounded-xl border p-3 flex items-start gap-3 transition-colors",
        done ? "opacity-60 bg-muted/30" : "hover:bg-muted/40"
      )}
    >
      {done ? (
        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      ) : (
        <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
      )}
      <span className={cn("text-sm leading-relaxed", done && "line-through")}>
        {move.text}
      </span>
    </button>
  );
}
