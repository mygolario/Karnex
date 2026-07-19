"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, X } from "lucide-react";
import type { PitchDeckSlide } from "@/lib/db";
import { getVisibleSlides } from "@/lib/pitch-deck";
import { SlideVisualizer } from "./slide-templates";

interface PresentModeProps {
  slides: PitchDeckSlide[];
  projectName: string;
  startIndex?: number;
  onClose: () => void;
}

export function PresentMode({
  slides,
  projectName,
  startIndex = 0,
  onClose,
}: PresentModeProps) {
  const visible = getVisibleSlides(slides);
  const [index, setIndex] = useState(() => {
    // Map start index from full deck to visible deck
    const visibleIds = new Set(visible.map((s) => s.id));
    let count = 0;
    for (let i = 0; i < slides.length; i++) {
      if (visibleIds.has(slides[i].id)) {
        if (i === startIndex) return count;
        count++;
      }
    }
    return 0;
  });
  const [playTime, setPlayTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setPlayTime((p) => p + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === " ") {
        e.preventDefault();
        setIndex((prev) => Math.min(visible.length - 1, prev + 1));
      } else if (e.key === "ArrowRight") {
        setIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible.length, onClose]);

  const playSlide = visible[index];

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col justify-between overflow-hidden bg-zinc-950 p-6" dir="rtl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={20} className="ms-2" /> خروج
          </Button>
          <span className="text-sm font-black text-primary">
            {projectName} - حالت ارائه
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-sm text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Clock size={16} /> {Math.floor(playTime / 60)}:
            {(playTime % 60).toString().padStart(2, "0")}
          </span>
          <span>
            اسلاید {index + 1} از {visible.length}
          </span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="relative aspect-[1.777] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
          {playSlide && (
            <SlideVisualizer
              slide={playSlide}
              index={index}
              total={visible.length}
              projectName={projectName}
            />
          )}
        </div>
      </div>

      {playSlide?.notes && (
        <div className="mx-auto mb-2 max-w-3xl rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center text-xs text-zinc-300">
          {playSlide.notes}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/10 px-8 pt-4">
        <Button
          variant="outline"
          className="rounded-xl border-white/10 text-white hover:bg-zinc-900"
          onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
          disabled={index === 0}
        >
          قبلی
        </Button>
        <div className="flex gap-2">
          {visible.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setIndex(idx)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                idx === index ? "scale-125 bg-primary" : "bg-zinc-700"
              }`}
              aria-label={`اسلاید ${idx + 1}`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          className="rounded-xl border-white/10 text-white hover:bg-zinc-900"
          onClick={() => setIndex((prev) => Math.min(visible.length - 1, prev + 1))}
          disabled={index >= visible.length - 1}
        >
          بعدی
        </Button>
      </div>
    </div>
  );
}
