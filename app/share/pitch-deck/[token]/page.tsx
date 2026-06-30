"use client";

import { useEffect, useState } from "react";
import { SlideVisualizer } from "@/components/features/pitch-deck/slide-templates";
import type { PitchDeckSlide } from "@/lib/db";

export default function SharePitchDeckPage({ params }: { params: Promise<{ token: string }> }) {
  const [data, setData] = useState<{ projectName: string; slides: PitchDeckSlide[] } | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    params.then(({ token }) => {
      fetch(`/api/share/pitch-deck/${token}`)
        .then((r) => r.json())
        .then(setData)
        .catch(() => setData(null));
    });
  }, [params]);

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">در حال بارگذاری...</div>;
  }

  const slide = data.slides[index];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h1 className="font-bold">{data.projectName}</h1>
        <span className="text-xs text-slate-400">{index + 1} / {data.slides.length}</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        {slide && (
          <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-white/10">
            <SlideVisualizer slide={slide} index={index} total={data.slides.length} projectName={data.projectName} />
          </div>
        )}
      </div>
      <div className="p-4 flex justify-center gap-4">
        <button type="button" className="text-sm px-4 py-2 rounded-lg bg-white/10" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>قبلی</button>
        <button type="button" className="text-sm px-4 py-2 rounded-lg bg-white/10" disabled={index >= data.slides.length - 1} onClick={() => setIndex((i) => i + 1)}>بعدی</button>
      </div>
    </div>
  );
}
