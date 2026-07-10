"use client";

import { SlideVisualizer } from "./slide-templates";
import type { PitchDeckSlide } from "@/lib/pitch-deck/types";
import { SLIDE_INTENT } from "@/lib/pitch-deck/types";
import { perSlideTips } from "@/lib/pitch-deck/readiness";
import { Button } from "@/components/ui/button";
import { EyeOff, GripVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryboardProps {
  slides: PitchDeckSlide[];
  projectName: string;
  onSelect: (index: number) => void;
  onReorder: (from: number, to: number) => void;
  onAddOptional: () => void;
  onBackToHub: () => void;
}

export function Storyboard({
  slides,
  projectName,
  onSelect,
  onReorder,
  onAddOptional,
  onBackToHub,
}: StoryboardProps) {
  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6" data-tour="deck-grid">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-black">استوری‌بورد روایت</h2>
          <p className="text-sm text-muted-foreground">جریان داستان سرمایه‌گذار را ببینید و مرتب کنید</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onBackToHub} className="rounded-xl">
            هاب پیچ‌دک
          </Button>
          <Button size="sm" onClick={onAddOptional} className="rounded-xl" data-tour="add-slide-btn">
            <Plus size={14} />
            اسلاید اختیاری
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 min-w-max pb-4 h-full items-stretch">
          {slides.map((slide, index) => {
            const tips = perSlideTips(slide);
            const weak = tips.length > 0 && (!slide.bullets || slide.bullets.length < 2);
            return (
              <div
                key={slide.id}
                className={cn(
                  "w-[280px] flex flex-col gap-2 group",
                  slide.isHidden && "opacity-50"
                )}
              >
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-bold text-primary">
                    {slide.intent || SLIDE_INTENT[slide.type] || slide.type}
                  </span>
                  <div className="flex items-center gap-1">
                    {slide.isHidden && <EyeOff size={12} className="text-muted-foreground" />}
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-muted disabled:opacity-30"
                      disabled={index === 0}
                      onClick={() => onReorder(index, index - 1)}
                      title="جابجایی"
                    >
                      <GripVertical size={12} />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  className={cn(
                    "aspect-[16/9] rounded-2xl overflow-hidden border-2 transition-all text-start shadow-sm hover:shadow-md hover:border-primary/50",
                    weak ? "border-secondary/40" : "border-border/60"
                  )}
                >
                  <SlideVisualizer
                    slide={slide}
                    index={index}
                    total={slides.length}
                    projectName={projectName}
                  />
                </button>
                <p className="text-xs font-medium truncate px-1">{slide.title}</p>
                {weak && tips[0] && (
                  <p className="text-[10px] text-secondary px-1 leading-snug">{tips[0]}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
