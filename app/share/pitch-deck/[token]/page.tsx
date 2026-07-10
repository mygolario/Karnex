"use client";

import { useEffect, useState } from "react";
import { SlideVisualizer } from "@/components/features/pitch-deck/slide-templates";
import type { PitchDeckSlide } from "@/lib/pitch-deck/types";

export default function SharePitchDeckPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [data, setData] = useState<{ projectName: string; slides: PitchDeckSlide[] } | null>(
    null
  );
  const [error, setError] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    params.then(({ token }) => {
      fetch(`/api/share/pitch-deck/${token}`)
        .then(async (r) => {
          if (!r.ok) throw new Error("not found");
          return r.json();
        })
        .then(setData)
        .catch(() => setError(true));
    });
  }, [params]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!data?.slides?.length) return;
      if (e.key === "ArrowLeft" || e.key === " ") {
        setIndex((i) => Math.min(data.slides.length - 1, i + 1));
      }
      if (e.key === "ArrowRight") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        لینک اشتراک معتبر نیست
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        در حال بارگذاری...
      </div>
    );
  }

  const slide = data.slides[index];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex flex-col">
      <div className="p-4 border-b border-primary/10 flex justify-between items-center bg-background/80 backdrop-blur">
        <div>
          <p className="text-[10px] font-bold text-primary">کارنکس · پیچ‌دک</p>
          <h1 className="font-black">{data.projectName}</h1>
        </div>
        <span className="text-xs text-muted-foreground">
          {index + 1} / {data.slides.length}
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        {slide && (
          <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-primary/15 shadow-xl shadow-primary/10">
            <SlideVisualizer
              slide={slide}
              index={index}
              total={data.slides.length}
              projectName={data.projectName}
            />
          </div>
        )}
      </div>
      <div className="p-4 flex justify-center gap-3">
        <button
          type="button"
          className="text-sm px-4 py-2 rounded-xl border border-border bg-background disabled:opacity-40"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          قبلی
        </button>
        <button
          type="button"
          className="text-sm px-4 py-2 rounded-xl bg-gradient-to-l from-primary to-secondary text-white disabled:opacity-40"
          disabled={index >= data.slides.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          بعدی
        </button>
      </div>
    </div>
  );
}
