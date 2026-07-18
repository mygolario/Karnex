"use client";

import { useEffect, useMemo, useState } from "react";
import { SlideVisualizer } from "@/components/features/pitch-deck/slide-templates";
import type { PitchDeckSlide } from "@/lib/db";
import { getVisibleSlides } from "@/lib/pitch-deck";

export default function SharePitchDeckPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [data, setData] = useState<{
    projectName: string;
    slides: PitchDeckSlide[];
  } | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    params.then(({ token }) => {
      fetch(`/api/share/pitch-deck/${token}`)
        .then((r) => r.json())
        .then(setData)
        .catch(() => setData(null));
    });
  }, [params]);

  const slides = useMemo(
    () => (data?.slides ? getVisibleSlides(data.slides) : []),
    [data]
  );

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        در حال بارگذاری...
      </div>
    );
  }

  const slide = slides[index];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white" dir="rtl">
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <h1 className="font-bold">{data.projectName}</h1>
        <span className="text-xs text-zinc-400">
          {slides.length ? index + 1 : 0} / {slides.length}
        </span>
      </div>
      <div className="flex flex-1 items-center justify-center p-8">
        {slide && (
          <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10">
            <SlideVisualizer
              slide={slide}
              index={index}
              total={slides.length}
              projectName={data.projectName}
            />
          </div>
        )}
      </div>
      <div className="flex justify-center gap-4 p-4">
        <button
          type="button"
          className="rounded-lg bg-white/10 px-4 py-2 text-sm disabled:opacity-40"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          قبلی
        </button>
        <button
          type="button"
          className="rounded-lg bg-white/10 px-4 py-2 text-sm disabled:opacity-40"
          disabled={index >= slides.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          بعدی
        </button>
      </div>
    </div>
  );
}
