"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { savePitchDeck } from "@/lib/db";
import type { PitchDeckV2, PitchDeckSlide, WizardAnswers } from "@/lib/pitch-deck/types";
import {
  migratePitchDeck,
  snapshotVersion,
  restoreVersion,
  wizardToMeta,
  emptyPitchDeck,
} from "@/lib/pitch-deck/migrate";
import {
  syncDeckFromProject,
  projectSyncFingerprint,
} from "@/lib/pitch-deck/sync-engine";
import { computeReadiness } from "@/lib/pitch-deck/readiness";
import { exportPitchDeckPptx } from "@/lib/pitch-deck/export-pptx";
import { createEmptySlide, listAddableSlideTypes } from "@/lib/pitch-deck/utils";
import { generatePitchDeckAction } from "@/lib/ai-actions";
import { StoryWizard } from "./story-wizard";
import { DeckHub } from "./deck-hub";
import { Storyboard } from "./storyboard";
import { SlideStudio } from "./slide-studio";
import { SlideVisualizer } from "./slide-templates";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

type Mode = "hub" | "wizard" | "storyboard" | "studio" | "versions" | "scripts";

export function PitchDeckBuilder() {
  const { user } = useAuth();
  const { activeProject, updateActiveProject } = useProject();

  const [mode, setMode] = useState<Mode>("hub");
  const [deck, setDeck] = useState<PitchDeckV2>(emptyPitchDeck());
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scriptText, setScriptText] = useState<{ s60?: string; s180?: string } | null>(null);
  const [scriptLoading, setScriptLoading] = useState(false);

  // Presenter
  const [isPlaying, setIsPlaying] = useState(false);
  const [presenterSlideIndex, setPresenterSlideIndex] = useState(0);
  const [playTime, setPlayTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const initialized = useRef(false);
  const syncFp = useRef("");
  const printRef = useRef<HTMLDivElement>(null);

  const visibleSlides = deck.slides.filter((s) => !s.isHidden);
  const projectName = activeProject?.projectName || "Karnex";

  const applyReadiness = useCallback((d: PitchDeckV2): PitchDeckV2 => {
    return { ...d, readiness: computeReadiness(d) };
  }, []);

  // Init — wizard if empty, never silent auto-gen
  useEffect(() => {
    if (!activeProject || initialized.current) return;
    const migrated = migratePitchDeck(activeProject.pitchDeck as any);
    if (migrated.slides.length === 0) {
      setDeck(applyReadiness(migrated));
      setMode("wizard");
    } else {
      const synced = syncDeckFromProject(migrated, activeProject);
      setDeck(applyReadiness(synced.deck));
      setMode("hub");
      syncFp.current = projectSyncFingerprint(activeProject);
    }
    initialized.current = true;
  }, [activeProject, applyReadiness]);

  // Continuous auto-sync when project data changes
  useEffect(() => {
    if (!activeProject || !initialized.current) return;
    if (deck.slides.length === 0) return;
    const fp = projectSyncFingerprint(activeProject);
    if (fp === syncFp.current) return;
    syncFp.current = fp;
    setDeck((prev) => {
      const { deck: next, changed } = syncDeckFromProject(prev, activeProject);
      if (!changed) return prev;
      return applyReadiness(next);
    });
  }, [activeProject, applyReadiness, deck.slides.length]);

  // Presenter timer
  useEffect(() => {
    if (isPlaying) {
      setPlayTime(0);
      timerRef.current = setInterval(() => setPlayTime((p) => p + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  // Keyboard — RTL: ArrowLeft / Space advance
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isPlaying || !visibleSlides.length) return;
      if (e.key === "ArrowLeft" || e.key === " ") {
        e.preventDefault();
        setPresenterSlideIndex((p) => Math.min(visibleSlides.length - 1, p + 1));
      } else if (e.key === "ArrowRight") {
        setPresenterSlideIndex((p) => Math.max(0, p - 1));
      } else if (e.key === "Escape") {
        setIsPlaying(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPlaying, visibleSlides.length]);

  const handleSave = async (nextDeck: PitchDeckV2 = deck) => {
    if (!user || !activeProject?.id) return;
    setLoading(true);
    try {
      const withReady = applyReadiness(nextDeck);
      await savePitchDeck(user.id!, withReady, activeProject.id);
      updateActiveProject({ pitchDeck: withReady });
      setDeck(withReady);
      toast.success("پیچ‌دک ذخیره شد");
    } catch (err) {
      console.error(err);
      toast.error("خطا در ذخیره پیچ‌دک");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async (wizardAnswers?: WizardAnswers) => {
    if (!activeProject) return;
    setIsGenerating(true);
    toast.info("در حال تولید پیچ‌دک سرمایه‌گذاری با داده‌های پروژه...");

    try {
      // Snapshot before overwrite if we already have slides
      let base = deck;
      if (deck.slides.length > 0) {
        base = snapshotVersion(deck, "قبل از تولید مجدد");
      }

      const res = await generatePitchDeckAction({
        idea: activeProject.description || activeProject.projectName || "ایده استارتاپی",
        wizardAnswers,
        projectContext: activeProject,
      });

      if (res.success && res.data?.slides) {
        const meta = wizardToMeta(wizardAnswers);
        let next: PitchDeckV2 = {
          ...base,
          version: 2,
          meta: { ...base.meta, ...meta },
          slides: res.data.slides,
        };
        const synced = syncDeckFromProject(next, activeProject);
        next = applyReadiness(synced.deck);
        // Mark AI market numbers as estimates when no research
        next = {
          ...next,
          slides: next.slides.map((s) => {
            if (s.type !== "market") return s;
            const claims = [...(s.claims || [])];
            for (const f of ["tam", "sam", "som"] as const) {
              if (s.metadata?.[f]) {
                claims.push({ text: `${f}: ${s.metadata[f]}`, status: "estimate" as const });
              }
            }
            return { ...s, claims };
          }),
        };
        setDeck(next);
        await handleSave(next);
        setMode("hub");
        toast.success("پیچ‌دک اختصاصی شما آماده شد");
      } else {
        toast.error(res.error || "خطا در تولید پیچ‌دک");
        if (deck.slides.length === 0) {
          const fallback = emptyPitchDeck(wizardToMeta(wizardAnswers));
          fallback.slides = [
            createEmptySlide("title"),
          ];
          fallback.slides[0].title = activeProject.projectName || "عنوان پروژه";
          fallback.slides[0].bullets = [wizardAnswers?.tagline || "ارائه استارتاپ"];
          setDeck(applyReadiness(fallback));
          setMode("studio");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("خطا در ارتباط با موتور هوش مصنوعی");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWizardComplete = async (answers: WizardAnswers) => {
    await handleGenerateAI(answers);
  };

  const handleRegenerate = () => {
    if (deck.slides.length > 0) {
      const ok = window.confirm(
        "تولید مجدد کل پیچ‌دک، اسلایدهای فعلی را جایگزین می‌کند. یک نسخه پشتیبان ذخیره می‌شود. ادامه؟"
      );
      if (!ok) return;
    }
    setMode("wizard");
  };

  const updateSlides = (slides: PitchDeckSlide[]) => {
    setDeck((prev) => applyReadiness({ ...prev, slides }));
  };

  const handlePresent = () => {
    const slides = visibleSlides;
    if (!slides.length) {
      toast.error("اسلایدی برای ارائه نیست");
      return;
    }
    setPresenterSlideIndex(0);
    setIsPlaying(true);
  };

  const openPresenterCockpit = () => {
    sessionStorage.setItem(
      "pitch-deck-present",
      JSON.stringify({
        slides: visibleSlides,
        projectName,
      })
    );
    window.open("/dashboard/pitch-deck/present", "_blank");
  };

  const handleShare = async () => {
    if (!activeProject?.id) return;
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pitch-deck" }),
      });
      const data = await res.json();
      if (data.url || data.shareUrl || data.path) {
        const url =
          data.url ||
          data.shareUrl ||
          `${window.location.origin}${data.path}`;
        await navigator.clipboard.writeText(url);
        toast.success("لینک اشتراک کپی شد");
        setDeck((prev) => ({
          ...prev,
          share: { token: data.token || "", createdAt: new Date().toISOString() },
        }));
      } else if (data.token) {
        const url = `${window.location.origin}/share/pitch-deck/${data.token}`;
        await navigator.clipboard.writeText(url);
        toast.success("لینک اشتراک کپی شد");
      } else {
        toast.error(data.error || "خطا در ساخت لینک اشتراک");
      }
    } catch (e) {
      console.error(e);
      toast.error("خطا در اشتراک‌گذاری");
    }
  };

  const handleExportPptx = async () => {
    setDownloading(true);
    try {
      await exportPitchDeckPptx({
        slides: deck.slides,
        projectName,
        fileName: `${projectName}.pptx`,
      });
      toast.success("فایل پاورپوینت دانلود شد");
    } catch (e) {
      console.error(e);
      toast.error("خطا در خروجی PPTX");
    } finally {
      setDownloading(false);
    }
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleScripts = async () => {
    setMode("scripts");
    setScriptLoading(true);
    try {
      const outline = deck.slides
        .filter((s) => !s.isHidden)
        .map((s, i) => `${i + 1}. ${s.title}: ${(s.bullets || []).join("؛ ")}`)
        .join("\n");
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pitch-slide-ai",
          slideContent: outline,
          mode: "rewrite",
          scriptModes: true,
        }),
      });
      // Fallback local scripts if API doesn't support scriptModes
      const s60 = deck.slides
        .filter((s) => !s.isHidden)
        .slice(0, 4)
        .map((s) => `${s.title}: ${(s.bullets || [])[0] || ""}`)
        .join(" ");
      const s180 = deck.slides
        .filter((s) => !s.isHidden)
        .map((s) => `در اسلاید «${s.title}»، بگویید: ${(s.bullets || []).slice(0, 2).join(" و ")}.`)
        .join("\n\n");
      if (res.ok) {
        const data = await res.json();
        setScriptText({
          s60: data.result?.script60 || s60,
          s180: data.result?.script180 || data.result?.text || s180,
        });
      } else {
        setScriptText({ s60, s180 });
      }
    } catch {
      const s60 = `${projectName}: ${(deck.meta.tagline || deck.slides[0]?.bullets?.[0] || "")}`;
      setScriptText({ s60, s180: s60 });
    } finally {
      setScriptLoading(false);
    }
  };

  const addOptionalSlide = () => {
    const addable = listAddableSlideTypes(deck.slides);
    if (addable.length === 0) {
      const slide = createEmptySlide("generic");
      updateSlides([...deck.slides, slide]);
      setCurrentSlideIndex(deck.slides.length);
      setMode("studio");
      return;
    }
    const pick = addable[0];
    const slide = createEmptySlide(pick.type);
    slide.title = pick.label;
    updateSlides([...deck.slides, slide]);
    setCurrentSlideIndex(deck.slides.length);
    setMode("studio");
    toast.success(`اسلاید «${pick.label}» اضافه شد`);
  };

  const reorder = (from: number, to: number) => {
    if (to < 0 || to >= deck.slides.length) return;
    const next = [...deck.slides];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    updateSlides(next);
  };

  // Generating overlay
  if (isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 rounded-3xl border border-primary/15 bg-gradient-to-br from-pink-50 via-background to-orange-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-bold text-lg">در حال تدوین داستان سرمایه‌گذاری...</p>
        <p className="text-sm text-muted-foreground">بوم، رقبا، نقشه راه و داده‌های مالی همگام می‌شوند</p>
      </div>
    );
  }

  return (
    <>
      <div className="h-full">
        {mode === "wizard" && (
          <StoryWizard
            onComplete={handleWizardComplete}
            onCancel={() => setMode(deck.slides.length ? "hub" : "wizard")}
            isGenerating={isGenerating}
          />
        )}

        {mode === "hub" && deck.slides.length > 0 && (
          <DeckHub
            deck={deck}
            projectName={projectName}
            onContinue={() => setMode("storyboard")}
            onPresent={handlePresent}
            onShare={handleShare}
            onExportPptx={handleExportPptx}
            onExportPdf={handleExportPdf}
            onImprove={() => {
              setCurrentSlideIndex(0);
              setMode("studio");
            }}
            onRegenerate={handleRegenerate}
            onVersions={() => setMode("versions")}
            onScripts={handleScripts}
            downloading={downloading}
          />
        )}

        {mode === "hub" && deck.slides.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <Sparkles className="text-primary w-10 h-10" />
            <p className="font-bold">هنوز پیچ‌دکی ندارید</p>
            <Button onClick={() => setMode("wizard")} className="rounded-2xl bg-gradient-to-l from-primary to-secondary text-white border-0">
              شروع ویزارد داستان
            </Button>
          </div>
        )}

        {mode === "storyboard" && (
          <Storyboard
            slides={deck.slides}
            projectName={projectName}
            onSelect={(i) => {
              setCurrentSlideIndex(i);
              setMode("studio");
            }}
            onReorder={reorder}
            onAddOptional={addOptionalSlide}
            onBackToHub={() => setMode("hub")}
          />
        )}

        {mode === "studio" && (
          <SlideStudio
            deck={deck}
            projectName={projectName}
            currentIndex={currentSlideIndex}
            onIndexChange={setCurrentSlideIndex}
            onChangeSlides={updateSlides}
            onSave={() => handleSave()}
            onPresent={() => {
              handlePresent();
            }}
            onBackStoryboard={() => setMode("storyboard")}
            saving={loading}
          />
        )}

        {mode === "versions" && (
          <div className="h-full p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">تاریخچه نسخه‌ها</h2>
              <Button variant="outline" onClick={() => setMode("hub")} className="rounded-xl">
                بازگشت
              </Button>
            </div>
            {(deck.versions || []).length === 0 && (
              <p className="text-sm text-muted-foreground">هنوز نسخه‌ای ذخیره نشده است.</p>
            )}
            <div className="space-y-2">
              {(deck.versions || []).map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 p-4"
                >
                  <div>
                    <p className="font-bold text-sm">{v.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(v.createdAt).toLocaleString("fa-IR")} · {v.slidesSnapshot.length} اسلاید
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      const next = applyReadiness(restoreVersion(deck, v.id));
                      setDeck(next);
                      toast.success("نسخه بازگردانی شد — ذخیره را فراموش نکنید");
                      setMode("hub");
                    }}
                  >
                    بازگردانی
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === "scripts" && (
          <div className="h-full p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">اسکریپت ارائه</h2>
              <Button variant="outline" onClick={() => setMode("hub")} className="rounded-xl">
                بازگشت
              </Button>
            </div>
            {scriptLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="animate-spin" size={16} /> در حال آماده‌سازی...
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                  <p className="text-xs font-bold text-primary mb-2">۶۰ ثانیه</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{scriptText?.s60}</p>
                </div>
                <div className="rounded-2xl border border-secondary/15 bg-secondary/5 p-4">
                  <p className="text-xs font-bold text-secondary mb-2">۳ دقیقه</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{scriptText?.s180}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inline presenter */}
      {isPlaying && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 text-white/80">
            <div className="flex items-center gap-3 text-sm">
              <Clock size={14} />
              {String(Math.floor(playTime / 60)).padStart(2, "0")}:
              {String(playTime % 60).padStart(2, "0")}
              <span className="text-white/40">
                {presenterSlideIndex + 1} / {visibleSlides.length}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/20 text-white"
                onClick={openPresenterCockpit}
              >
                کابین پرزنتر
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white"
                onClick={() => setIsPlaying(false)}
              >
                <X />
              </Button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 md:p-10">
            <div className="w-full max-w-5xl aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl">
              {visibleSlides[presenterSlideIndex] && (
                <SlideVisualizer
                  slide={visibleSlides[presenterSlideIndex]}
                  index={presenterSlideIndex}
                  total={visibleSlides.length}
                  projectName={projectName}
                />
              )}
            </div>
          </div>
          <div className="px-6 pb-4 text-center text-white/70 text-sm max-w-3xl mx-auto">
            {visibleSlides[presenterSlideIndex]?.notes || ""}
          </div>
          <div className="flex items-center justify-center gap-4 pb-6">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-white/20 text-white"
              onClick={() => setPresenterSlideIndex((p) => Math.max(0, p - 1))}
              disabled={presenterSlideIndex === 0}
            >
              <ChevronRight />
            </Button>
            <div className="flex gap-1.5">
              {visibleSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`w-2 h-2 rounded-full ${
                    i === presenterSlideIndex ? "bg-pink-400" : "bg-white/30"
                  }`}
                  onClick={() => setPresenterSlideIndex(i)}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-white/20 text-white"
              onClick={() =>
                setPresenterSlideIndex((p) => Math.min(visibleSlides.length - 1, p + 1))
              }
              disabled={presenterSlideIndex >= visibleSlides.length - 1}
            >
              <ChevronLeft />
            </Button>
          </div>
        </div>
      )}

      {/* Print / PDF container */}
      <div className="hidden print:block" ref={printRef}>
        {visibleSlides.map((slide, i) => (
          <div
            key={slide.id}
            className="print-slide"
            style={{ width: "297mm", height: "210mm", pageBreakAfter: "always" }}
          >
            <SlideVisualizer
              slide={slide}
              index={i}
              total={visibleSlides.length}
              projectName={projectName}
              isExport
            />
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-slide,
          .print-slide * {
            visibility: visible;
          }
          .print-slide {
            position: absolute;
            left: 0;
            top: 0;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>
    </>
  );
}
