"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import type { PitchDeckSlide } from "@/lib/db";
import { savePitchDeck } from "@/lib/db";
import { generatePitchDeckAction } from "@/lib/ai-actions";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import {
  buildCompletenessChecklist,
  buildSyncProposals,
  applySyncProposals,
  getProjectContextSummary,
  createEmptySlide,
  createBlankDeck,
  getVisibleSlides,
  exportPitchDeckPptx,
  type SyncProposal,
} from "@/lib/pitch-deck";

import { DeckHome } from "./deck-home";
import { StoryWizard, type StoryWizardAnswers } from "./story-wizard";
import { DeckPreview } from "./deck-preview";
import { Filmstrip } from "./filmstrip";
import { WorkspaceToolbar, type SaveStatus } from "./workspace-toolbar";
import { SlideEditorPanel } from "./slide-editor-panel";
import { PitchDeckAiSidebar, type StructuredSlidePatch } from "./ai-sidebar";
import { SyncPanel } from "./sync-panel";
import { PresentMode } from "./present-mode";
import { SlideVisualizer } from "./slide-templates";

type Mode = "home" | "wizard" | "preview" | "edit";
type MobileEditPanel = "slides" | "editor" | "preview";

const GEN_STEPS = ["داستان", "اسلایدها", "پرداخت نهایی"] as const;

export function PitchDeckBuilder() {
  const { user } = useAuth();
  const { activeProject, updateActiveProject } = useProject();
  const isMobile = useIsMobile();

  const [mode, setMode] = useState<Mode>("home");
  const [mobileEditPanel, setMobileEditPanel] = useState<MobileEditPanel>("editor");
  const [slides, setSlides] = useState<PitchDeckSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isPlaying, setIsPlaying] = useState(false);
  const [syncProposals, setSyncProposals] = useState<SyncProposal[] | null>(null);
  const [regeneratingSlide, setRegeneratingSlide] = useState(false);

  const initialized = useRef(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slidesRef = useRef(slides);
  slidesRef.current = slides;

  useEffect(() => {
    if (!activeProject || initialized.current) return;
    if (activeProject.pitchDeck && activeProject.pitchDeck.length > 0) {
      setSlides(activeProject.pitchDeck);
      setMode("preview");
    } else {
      setMode("home");
    }
    initialized.current = true;
  }, [activeProject]);

  const contextSummary = useMemo(
    () =>
      activeProject
        ? getProjectContextSummary(activeProject)
        : { hasCanvas: false, hasCompetitors: false, hasRoadmap: false, labels: [] },
    [activeProject]
  );

  const completeness = useMemo(() => buildCompletenessChecklist(slides), [slides]);

  const persist = useCallback(
    async (updated: PitchDeckSlide[], silent = false) => {
      if (!user || !activeProject?.id) return;
      setSaveStatus("saving");
      try {
        await savePitchDeck(user.id!, updated, activeProject.id);
        updateActiveProject({ pitchDeck: updated });
        setSaveStatus("saved");
        if (!silent) toast.success("تغییرات ذخیره شد");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (err) {
        console.error(err);
        setSaveStatus("error");
        toast.error("خطا در ذخیره پیچ‌دک");
      }
    },
    [user, activeProject?.id, updateActiveProject]
  );

  const scheduleAutosave = useCallback(
    (updated: PitchDeckSlide[]) => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        void persist(updated, true);
      }, 1200);
    },
    [persist]
  );

  const setSlidesAndAutosave = useCallback(
    (updated: PitchDeckSlide[] | ((prev: PitchDeckSlide[]) => PitchDeckSlide[])) => {
      setSlides((prev) => {
        const next = typeof updated === "function" ? updated(prev) : updated;
        scheduleAutosave(next);
        return next;
      });
    },
    [scheduleAutosave]
  );

  const handleGenerateAI = async (wizardAnswers?: StoryWizardAnswers) => {
    if (!activeProject) return;
    setIsGenerating(true);
    setGenStep(0);
    toast.info("هوش مصنوعی کارنکس در حال تدوین سناریوی پیچ‌دک شماست...");

    const stepTimer = setInterval(() => {
      setGenStep((s) => Math.min(s + 1, GEN_STEPS.length - 1));
    }, 2200);

    try {
      const res = await generatePitchDeckAction({
        idea: activeProject.description || activeProject.projectName || "ایده استارتاپی",
        wizardAnswers,
        projectContext: activeProject,
      });

      if (res.success && res.data?.slides) {
        const newSlides = res.data.slides.map((s: PitchDeckSlide) => ({
          ...s,
          notes: s.notes || "",
          metadata: { theme: "karnex_pink", ...(s.metadata || {}) },
        }));
        setSlides(newSlides);
        await persist(newSlides, true);
        setMode("preview");
        toast.success("پیچ‌دک هوشمند شما آماده شد!");
      } else {
        toast.error(res.error || "خطا در تولید محتوای پیچ‌دک");
        if (slidesRef.current.length === 0) setMode("home");
      }
    } catch (err) {
      console.error(err);
      toast.error("خطا در برقراری ارتباط با موتور هوش مصنوعی");
      if (slidesRef.current.length === 0) setMode("home");
    } finally {
      clearInterval(stepTimer);
      setIsGenerating(false);
    }
  };

  const handleWizardComplete = async (answers: StoryWizardAnswers) => {
    await handleGenerateAI(answers);
  };

  const updateCurrentSlide = (field: keyof PitchDeckSlide, value: unknown) => {
    if (!slides.length) return;
    setSlidesAndAutosave((prev) =>
      prev.map((s, i) => (i === currentSlideIndex ? { ...s, [field]: value } : s))
    );
  };

  const updateMetadataField = (key: string, value: unknown) => {
    if (!slides.length) return;
    const slide = slides[currentSlideIndex];
    if (!slide) return;
    updateCurrentSlide("metadata", { ...(slide.metadata || {}), [key]: value });
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;
    setSlidesAndAutosave((prev) => {
      const reordered = [...prev];
      const temp = reordered[index];
      reordered[index] = reordered[newIndex];
      reordered[newIndex] = temp;
      return reordered;
    });
    if (currentSlideIndex === index) setCurrentSlideIndex(newIndex);
    else if (currentSlideIndex === newIndex) setCurrentSlideIndex(index);
  };

  const duplicateSlide = (index: number) => {
    const slide = slides[index];
    if (!slide) return;
    const newSlide: PitchDeckSlide = {
      ...slide,
      id: `slide-${Date.now()}`,
      title: `${slide.title} (کپی)`,
    };
    setSlidesAndAutosave((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, newSlide);
      return next;
    });
    setCurrentSlideIndex(index + 1);
    toast.success("اسلاید تکثیر شد");
  };

  const toggleHideSlide = (index: number) => {
    setSlidesAndAutosave((prev) =>
      prev.map((s, i) => (i === index ? { ...s, isHidden: !s.isHidden } : s))
    );
  };

  const handleDeleteSlide = (index: number) => {
    setSlidesAndAutosave((prev) => prev.filter((_, i) => i !== index));
    setCurrentSlideIndex((ci) => Math.min(ci, Math.max(0, slides.length - 2)));
    toast.success("اسلاید حذف شد");
  };

  const handleAddSlide = () => {
    const newSlide = createEmptySlide("generic");
    setSlidesAndAutosave((prev) => [...prev, newSlide]);
    setCurrentSlideIndex(slides.length);
    setMode("edit");
  };

  const handleEditSlide = (index: number) => {
    if (index === -1) {
      handleAddSlide();
      return;
    }
    setCurrentSlideIndex(index);
    setMode("edit");
  };

  const openSyncPanel = () => {
    if (!activeProject) return;
    setSyncProposals(buildSyncProposals(slides, activeProject));
  };

  const applySync = (acceptedIds: Set<string>) => {
    if (!syncProposals) return;
    const updated = applySyncProposals(slides, syncProposals, acceptedIds);
    setSlidesAndAutosave(updated);
    setSyncProposals(null);
    toast.success("همگام‌سازی اعمال شد");
  };

  const handleExportPPTX = async () => {
    setDownloading(true);
    try {
      await exportPitchDeckPptx({
        slides,
        projectName: activeProject?.projectName || "PitchDeck",
      });
      toast.success("دانلود فایل پاورپوینت انجام شد");
    } catch (err) {
      console.error(err);
      toast.error("خطا در ساخت فایل پاورپوینت");
    } finally {
      setDownloading(false);
    }
  };

  const handleExportPDF = () => {
    toast.info("در حال آماده‌سازی نسخه PDF...");
    setTimeout(() => window.print(), 400);
  };

  const handleShare = async () => {
    if (!activeProject?.id) return;
    setSharing(true);
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pitch-deck" }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        const shareUrl = `${window.location.origin}/share/pitch-deck/${data.token}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success("لینک مشاهده کپی شد");
      } else {
        toast.error(data.error || "خطا در ساخت لینک");
      }
    } catch (err) {
      console.error(err);
      toast.error("خطا در ساخت لینک مشاهده");
    } finally {
      setSharing(false);
    }
  };

  const openPresenterCockpit = () => {
    const visible = getVisibleSlides(slides);
    sessionStorage.setItem(
      "pitch-deck-present",
      JSON.stringify({
        slides: visible,
        projectName: activeProject?.projectName,
      })
    );
    window.open("/dashboard/pitch-deck/present", "_blank", "noopener,noreferrer");
  };

  const applyAiPatch = (patch: StructuredSlidePatch) => {
    if (!slides.length) return;
    setSlidesAndAutosave((prev) =>
      prev.map((s, i) => {
        if (i !== currentSlideIndex) return s;
        return {
          ...s,
          ...(patch.title !== undefined ? { title: patch.title } : {}),
          ...(patch.bullets !== undefined ? { bullets: patch.bullets } : {}),
          ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
          ...(patch.metadata
            ? { metadata: { ...(s.metadata || {}), ...patch.metadata } }
            : {}),
        };
      })
    );
    toast.success("تغییرات هوش مصنوعی اعمال شد");
  };

  const regenerateCurrentSlide = async () => {
    const slide = slides[currentSlideIndex];
    if (!slide || !activeProject) return;
    setRegeneratingSlide(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pitch-slide-ai",
          mode: "regenerate_slide",
          slideType: slide.type,
          slideContent: JSON.stringify({
            type: slide.type,
            title: slide.title,
            bullets: slide.bullets,
            metadata: slide.metadata,
          }),
          projectName: activeProject.projectName,
          idea: activeProject.description,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        applyAiPatch({
          title: data.result.title,
          bullets: data.result.bullets,
          metadata: data.result.metadata,
        });
      } else {
        toast.error("بازتولید اسلاید ناموفق بود");
      }
    } catch (err) {
      console.error(err);
      toast.error("خطا در بازتولید اسلاید");
    } finally {
      setRegeneratingSlide(false);
    }
  };

  // --- Views ---

  if (isGenerating) {
    return (
      <div
        className="flex min-h-[70vh] flex-col items-center justify-center space-y-6 rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-primary/5 p-8"
        dir="rtl"
      >
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/25 blur-3xl" />
          <Loader2 className="relative z-10 h-16 w-16 animate-spin text-primary" />
        </div>
        <div className="relative z-10 max-w-md space-y-4 text-center">
          <h3 className="bg-gradient-to-l from-primary to-orange-500 bg-clip-text text-2xl font-black text-transparent">
            در حال تولید پیچ‌دک هوشمند...
          </h3>
          <div className="flex items-center justify-center gap-2">
            {GEN_STEPS.map((label, i) => (
              <motion.span
                key={label}
                animate={{ opacity: i <= genStep ? 1 : 0.35, scale: i === genStep ? 1.05 : 1 }}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-bold",
                  i <= genStep ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {label}
              </motion.span>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            دستیار کارنکس در حال بررسی بوم، رقبا و نقشه راه شماست.
          </p>
        </div>
      </div>
    );
  }

  if (mode === "wizard") {
    return (
      <StoryWizard
        onComplete={handleWizardComplete}
        onCancel={() => setMode(slides.length > 0 ? "preview" : "home")}
        isGenerating={isGenerating}
        allowSkip={contextSummary.hasCanvas}
        onSkip={() => void handleGenerateAI()}
      />
    );
  }

  if (mode === "home") {
    return (
      <DeckHome
        projectName={activeProject?.projectName || ""}
        contextLabels={contextSummary.labels}
        onSmartGenerate={() => setMode("wizard")}
        onFromCanvas={() => {
          if (contextSummary.hasCanvas) void handleGenerateAI();
          else setMode("wizard");
        }}
        onManual={() => {
          const blank = createBlankDeck(activeProject?.projectName || "");
          setSlides(blank);
          setCurrentSlideIndex(0);
          setMode("edit");
          void persist(blank, true);
        }}
      />
    );
  }

  if (isPlaying) {
    return (
      <PresentMode
        slides={slides}
        projectName={activeProject?.projectName || ""}
        startIndex={currentSlideIndex}
        onClose={() => setIsPlaying(false)}
      />
    );
  }

  if (mode === "preview") {
    return (
      <div className="min-h-[80vh] rounded-3xl border border-border/60 bg-gradient-to-br from-background to-primary/[0.03] p-1 md:p-4">
        <DeckPreview
          slides={slides}
          onEditSlide={handleEditSlide}
          onDeleteSlide={handleDeleteSlide}
          onRegenerate={() => setMode("wizard")}
          onDownload={handleExportPPTX}
          onOpenWorkspace={() => setMode("edit")}
          onShare={handleShare}
          onPresent={() => setIsPlaying(true)}
        />
        {syncProposals && (
          <SyncPanel
            proposals={syncProposals}
            onApply={applySync}
            onClose={() => setSyncProposals(null)}
          />
        )}
      </div>
    );
  }

  // Edit workspace
  const currentSlide = slides[currentSlideIndex];

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          html, body {
            width: 297mm !important;
            height: 210mm !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          @page { size: A4 landscape; margin: 0; }
        }
      `,
        }}
      />

      <div
        className="print:hidden flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-primary/[0.04] p-4 md:p-6 animate-in fade-in duration-300"
        dir="rtl"
      >
        <WorkspaceToolbar
          onBack={() => setMode("preview")}
          onSync={openSyncPanel}
          onPresent={() => setIsPlaying(true)}
          onPresenterCockpit={openPresenterCockpit}
          onExportPptx={handleExportPPTX}
          onExportPdf={handleExportPDF}
          onShare={handleShare}
          onSave={() => void persist(slides)}
          saveStatus={saveStatus}
          downloading={downloading}
          sharing={sharing}
          hasSlides={slides.length > 0}
        />

        {isMobile && (
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-border/50 bg-muted/30 p-1">
            {(
              [
                { id: "slides" as const, label: "اسلایدها" },
                { id: "editor" as const, label: "ویرایش" },
                { id: "preview" as const, label: "پیش‌نمایش" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMobileEditPanel(tab.id)}
                className={cn(
                  "min-w-[80px] flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all",
                  mobileEditPanel === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className={cn(
          "grid flex-1 gap-5 overflow-hidden lg:grid-cols-12",
          isMobile ? "min-h-0" : "min-h-[500px]"
        )}>
          <Filmstrip
            slides={slides}
            currentIndex={currentSlideIndex}
            onSelect={setCurrentSlideIndex}
            onAdd={handleAddSlide}
            onMove={moveSlide}
            onDuplicate={duplicateSlide}
            onToggleHide={toggleHideSlide}
            onDelete={handleDeleteSlide}
            className={cn(
              "lg:col-span-3",
              isMobile && mobileEditPanel !== "slides" && "hidden",
              isMobile && mobileEditPanel === "slides" && "col-span-full max-h-none"
            )}
          />

          <div
            className={cn(
              "flex flex-col gap-4 overflow-hidden lg:col-span-6",
              isMobile && mobileEditPanel === "slides" && "hidden"
            )}
          >
            {slides.length === 0 ? (
              <div className="flex min-h-[400px] flex-1 flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/50 p-8 text-center">
                <Play size={24} className="mb-4 opacity-40" />
                <p className="mb-2 font-bold">اسلایدی برای ویرایش وجود ندارد</p>
                <Button onClick={handleAddSlide} className="mt-2 rounded-xl font-bold">
                  <Plus size={16} className="ms-1" /> ایجاد اسلاید جدید
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "relative flex min-h-[280px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border/50 bg-muted/20 p-4",
                    isMobile && mobileEditPanel !== "preview" && "hidden"
                  )}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-500/5" />
                  <div className="relative aspect-[1.777] w-full max-w-3xl overflow-hidden rounded-2xl border border-border/40 shadow-2xl shadow-primary/5 transition-transform duration-500 hover:scale-[1.005]">
                    {currentSlide && (
                      <SlideVisualizer
                        slide={currentSlide}
                        index={currentSlideIndex}
                        total={slides.length}
                        projectName={activeProject?.projectName || ""}
                      />
                    )}
                  </div>
                </div>

                <div
                  className={cn(isMobile && mobileEditPanel !== "editor" && "hidden")}
                >
                  {currentSlide && (
                    <SlideEditorPanel
                      slide={currentSlide}
                      slides={slides}
                      onUpdateField={updateCurrentSlide}
                      onUpdateMetadata={updateMetadataField}
                      onApplyThemeToAll={(theme) => {
                        setSlidesAndAutosave((prev) =>
                          prev.map((s) => ({
                            ...s,
                            metadata: { ...(s.metadata || {}), theme },
                          }))
                        );
                        toast.success("پوسته روی همه اسلایدها اعمال شد");
                      }}
                    />
                  )}
                </div>
              </>
            )}
          </div>

          {!isMobile && (
            <PitchDeckAiSidebar
              slide={currentSlide}
              completeness={completeness}
              onApplyPatch={applyAiPatch}
              onJumpCompleteness={(idx) => {
                if (idx >= 0) setCurrentSlideIndex(idx);
              }}
              onRegenerateSlide={() => void regenerateCurrentSlide()}
              regenerating={regeneratingSlide}
              className="hidden rounded-2xl border border-border/50 lg:col-span-3 lg:flex"
            />
          )}
        </div>
      </div>

      {syncProposals && (
        <SyncPanel
          proposals={syncProposals}
          onApply={applySync}
          onClose={() => setSyncProposals(null)}
        />
      )}

      <div className="hidden w-full print:block">
        {getVisibleSlides(slides).map((s, idx, arr) => (
          <div
            key={s.id}
            className="relative flex h-[210mm] w-[297mm] flex-col justify-between overflow-hidden"
            style={{
              pageBreakAfter: "always",
              pageBreakInside: "avoid",
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
            }}
          >
            <SlideVisualizer
              slide={s}
              index={idx}
              total={arr.length}
              projectName={activeProject?.projectName || ""}
              isExport
            />
          </div>
        ))}
      </div>
    </>
  );
}
