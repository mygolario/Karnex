"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { SlideVisualizer } from "@/components/features/pitch-deck/slide-templates";
import type { PitchDeckSlide } from "@/lib/db";
import { getVisibleSlides } from "@/lib/pitch-deck";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

export default function PitchDeckPresentPage() {
  const [slides, setSlides] = useState<PitchDeckSlide[]>([]);
  const [projectName, setProjectName] = useState("");
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pitch-deck-present");
      if (!raw) {
        setLoadError(true);
        return;
      }
      const data = JSON.parse(raw) as {
        slides?: PitchDeckSlide[];
        projectName?: string;
      };
      const incoming: PitchDeckSlide[] = data.slides || [];
      setSlides(getVisibleSlides(incoming));
      setProjectName(data.projectName || "");
      if (incoming.length === 0) setLoadError(true);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const next = useCallback(
    () => setIndex((i) => Math.min(i + 1, slides.length - 1)),
    [slides.length]
  );
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // RTL: ArrowLeft advances
      if (e.key === "ArrowLeft" || e.key === " ") next();
      if (e.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const slide = slides[index];
  const nextSlide = slides[index + 1];
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  if (loadError && slides.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 text-white p-6" dir="rtl">
        <p className="text-zinc-400 text-center max-w-md">
          داده‌ای برای نمایش نیست. ارائه را از صفحه پیچ‌دک دوباره باز کنید.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard/pitch-deck">بازگشت به پیچ‌دک</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen gap-0 bg-zinc-950 text-white lg:grid-cols-2" dir="rtl">
      <div className="flex flex-col gap-4 border-e border-white/10 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-bold text-primary">کابین پرزنتر</h1>
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
            <Clock size={14} /> {mm}:{ss}
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          اسلاید {slides.length ? index + 1 : 0} از {slides.length}
        </p>
        <div className="min-h-[120px] flex-1 rounded-xl border border-white/10 bg-zinc-900 p-3 text-sm text-zinc-300">
          <p className="mb-2 text-[10px] font-bold text-primary">یادداشت سخنران</p>
          {slide?.notes?.trim() ? (
            <p className="leading-relaxed whitespace-pre-wrap">{slide.notes}</p>
          ) : (
            <p className="text-zinc-500">یادداشتی برای این اسلاید ثبت نشده است.</p>
          )}
        </div>
        {nextSlide && (
          <div className="rounded-xl border border-white/5 bg-zinc-900/60 p-3">
            <p className="mb-1 text-[10px] text-zinc-500">اسلاید بعد</p>
            <p className="text-sm font-bold">{nextSlide.title}</p>
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={prev} disabled={index === 0}>
            <ChevronRight size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={next}
            disabled={index >= slides.length - 1}
          >
            <ChevronLeft size={14} />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-center bg-black p-8">
        {slide ? (
          <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <SlideVisualizer
              slide={slide}
              index={index}
              total={slides.length}
              projectName={projectName}
            />
          </div>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-zinc-500">داده‌ای برای نمایش نیست</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/pitch-deck">بازگشت به پیچ‌دک</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
