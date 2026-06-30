"use client";

import { useEffect, useState, useCallback } from "react";
import { SlideVisualizer } from "@/components/features/pitch-deck/slide-templates";
import type { PitchDeckSlide } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

export default function PitchDeckPresentPage() {
  const [slides, setSlides] = useState<PitchDeckSlide[]>([]);
  const [projectName, setProjectName] = useState("");
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("pitch-deck-present");
    if (raw) {
      const data = JSON.parse(raw);
      setSlides(data.slides || []);
      setProjectName(data.projectName || "");
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, slides.length - 1)), [slides.length]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const slide = slides[index];
  const nextSlide = slides[index + 1];
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-slate-950 text-white grid lg:grid-cols-2 gap-0">
      <div className="p-6 flex flex-col gap-4 border-e border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-bold text-cyan-400">کابین پرزنتر</h1>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Clock size={14} /> {mm}:{ss}
          </div>
        </div>
        <p className="text-xs text-slate-500">اسلاید {index + 1} از {slides.length}</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="یادداشت سخنران..."
          className="flex-1 min-h-[120px] bg-slate-900 border border-white/10 rounded-xl p-3 text-sm resize-none"
        />
        {nextSlide && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <p className="text-[10px] text-slate-500 mb-1">اسلاید بعد</p>
            <p className="text-sm font-bold">{nextSlide.title}</p>
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={prev} disabled={index === 0}>
            <ChevronRight size={14} />
          </Button>
          <Button variant="outline" size="sm" onClick={next} disabled={index >= slides.length - 1}>
            <ChevronLeft size={14} />
          </Button>
        </div>
      </div>
      <div className="p-8 flex items-center justify-center bg-black">
        {slide ? (
          <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <SlideVisualizer slide={slide} index={index} total={slides.length} projectName={projectName} />
          </div>
        ) : (
          <p className="text-slate-500">داده‌ای برای نمایش نیست</p>
        )}
      </div>
    </div>
  );
}
