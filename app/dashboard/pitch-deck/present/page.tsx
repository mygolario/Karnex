"use client";

import { useEffect, useState, useCallback } from "react";
import { SlideVisualizer } from "@/components/features/pitch-deck/slide-templates";
import type { PitchDeckSlide } from "@/lib/pitch-deck/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

export default function PitchDeckPresentPage() {
  const [slides, setSlides] = useState<PitchDeckSlide[]>([]);
  const [projectName, setProjectName] = useState("");
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const raw = sessionStorage.getItem("pitch-deck-present");
    if (raw) {
      const data = JSON.parse(raw);
      const list = (data.slides || []).filter((s: PitchDeckSlide) => !s.isHidden);
      setSlides(list);
      setProjectName(data.projectName || "");
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // RTL presenter: ArrowLeft / Space = next
  const next = useCallback(
    () => setIndex((i) => Math.min(i + 1, slides.length - 1)),
    [slides.length]
  );
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const slide = slides[index];
  const nextSlide = slides[index + 1];
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 text-foreground grid lg:grid-cols-2 gap-0">
      <div className="p-6 flex flex-col gap-4 border-e border-primary/10 bg-background/80 backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-bold text-primary">کابین پرزنتر کارنکس</h1>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Clock size={14} /> {mm}:{ss}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          اسلاید {index + 1} از {slides.length}
        </p>
        <div className="flex-1 min-h-[120px] rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {slide?.notes?.trim()
            ? slide.notes
            : "یادداشت سخنران برای این اسلاید خالی است. در استودیو یادداشت اضافه کنید."}
        </div>
        {nextSlide && (
          <div className="p-3 rounded-2xl bg-secondary/5 border border-secondary/15">
            <p className="text-[10px] text-secondary mb-1 font-bold">اسلاید بعد</p>
            <p className="text-sm font-bold">{nextSlide.title}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {(nextSlide.bullets || []).slice(0, 2).join(" · ")}
            </p>
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={prev} disabled={index === 0} className="rounded-xl">
            <ChevronRight size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={next}
            disabled={index >= slides.length - 1}
            className="rounded-xl"
          >
            <ChevronLeft size={14} />
          </Button>
        </div>
      </div>
      <div className="p-8 flex items-center justify-center bg-muted/30">
        {slide ? (
          <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-primary/15 shadow-2xl shadow-primary/10">
            <SlideVisualizer
              slide={slide}
              index={index}
              total={slides.length}
              projectName={projectName}
            />
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">اسلایدی برای ارائه نیست</p>
        )}
      </div>
    </div>
  );
}
