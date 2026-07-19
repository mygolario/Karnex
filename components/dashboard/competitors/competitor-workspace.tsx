"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Loader2,
  Plus,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";
import { cn, toPersianDigits } from "@/lib/utils";
import { saveCompetitorIntel } from "@/lib/db";
import type {
  CompetitorDiscoveryOptions,
  CompetitorDiscoveryResult,
  CompetitorIntel,
  CompetitorIntelItem,
  FeatureCell,
} from "@/lib/competitors/types";
import {
  acceptProposedCompetitors,
  buildCompetitorExportMarkdown,
  buildProjectContextBlock,
  cloneIntel,
  createManualCompetitor,
  emptyCompetitorIntel,
  ensureActionableMoves,
  getActiveIntelItems,
  getDismissedIntelItems,
  hydrateCompetitorIntel,
  mergeDiscoveryIntoIntel,
  projectActiveCompetitors,
  seedCompetitorIntel,
  stringsFromActionableMoves,
  swotArraysToAnalysis,
} from "@/lib/competitors/normalize";
import { DiscoveryWizard } from "./discovery-wizard";
import { CommandCenter } from "./command-center";
import { ProposalTray } from "./proposal-tray";
import { RosterPanel } from "./roster-panel";
import { CompareMode } from "./compare-mode";
import { PositionMapPanel } from "./position-map-panel";
import { MatricesPanel } from "./matrices-panel";
import { BattleCardsPanel } from "./battle-cards";
import { NextMovesPanel } from "./next-moves-panel";
import {
  ANALYZE_COMPETITORS_CREDIT_COST,
  formatRelativeFa,
  STUDIO_MODES,
  syncPitchCompetitionSlides,
} from "./shared";
import type { StudioMode } from "./types-ui";

type SwotArrays = {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
};

function stripDiscoveryMeta(data: CompetitorDiscoveryResult & { _meta?: unknown }) {
  const { _meta: _ignored, ...rest } = data;
  return rest as CompetitorDiscoveryResult;
}

export function CompetitorWorkspace() {
  const { user } = useAuth();
  const { activeProject: plan, updateActiveProject } = useProject();
  const searchParams = useSearchParams();
  const fromValidation = searchParams.get("from") === "validation";

  const [intel, setIntel] = useState<CompetitorIntel>(() => emptyCompetitorIntel());
  const [swotArrays, setSwotArrays] = useState<SwotArrays>({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  });
  const [proposed, setProposed] = useState<CompetitorIntelItem[]>([]);
  const [undoSnapshot, setUndoSnapshot] = useState<CompetitorIntel | null>(null);
  const [mode, setMode] = useState<StudioMode>("hub");
  const [showWizard, setShowWizard] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [lastDiscoveryOpts, setLastDiscoveryOpts] = useState<CompetitorDiscoveryOptions>({
    geography: "both",
    focus: "all",
    count: 6,
  });

  useEffect(() => {
    if (!plan) return;
    const seeded = seedCompetitorIntel(plan);
    setIntel(seeded);
    setShowWizard(getActiveIntelItems(seeded).length === 0 && !seeded.brief);

    const existingSwot = plan.swotAnalysis;
    if (existingSwot) {
      const toArr = (v: unknown) => {
        if (Array.isArray(v)) return v as string[];
        if (typeof v === "string" && v.trim()) {
          return v.split("\n").map((s) => s.trim()).filter(Boolean);
        }
        return [];
      };
      setSwotArrays({
        strengths: toArr(existingSwot.strengths),
        weaknesses: toArr(existingSwot.weaknesses),
        opportunities: toArr(existingSwot.opportunities),
        threats: toArr(existingSwot.threats),
      });
    }
  }, [plan?.id]);

  const active = useMemo(() => getActiveIntelItems(intel), [intel]);
  const dismissed = useMemo(() => getDismissedIntelItems(intel), [intel]);
  const moves = useMemo(() => ensureActionableMoves(intel), [intel]);
  const hasAnyData = active.length > 0 || !!intel.brief;

  const stageHint =
    (plan?.genesisAnswers as { stage?: string } | undefined)?.stage || undefined;

  const persist = useCallback(
    async (
      nextIntel: CompetitorIntel,
      nextSwot?: SwotArrays,
      options?: { silent?: boolean }
    ) => {
      if (!plan?.id || !user?.id) return;
      setSaving(true);
      try {
        const hydrated = hydrateCompetitorIntel(nextIntel);
        const stamped: CompetitorIntel = {
          ...hydrated,
          updatedAt: new Date().toISOString(),
          nextMoves: stringsFromActionableMoves(hydrated.actionableMoves),
        };
        const competitors = projectActiveCompetitors(stamped);
        const swotAnalysis = nextSwot ? swotArraysToAnalysis(nextSwot) : undefined;
        const pitchDeck = syncPitchCompetitionSlides(plan.pitchDeck, competitors);

        await saveCompetitorIntel(user.id, stamped, competitors, plan.id, {
          swotAnalysis,
          pitchDeck,
        });

        updateActiveProject({
          competitorIntel: stamped,
          competitors,
          ...(swotAnalysis ? { swotAnalysis } : {}),
          ...(pitchDeck ? { pitchDeck } : {}),
        });

        setIntel(stamped);
        if (!options?.silent) toast.success("تحلیل رقبا ذخیره شد");
      } catch (e) {
        console.error(e);
        toast.error("ذخیره ناموفق بود");
      } finally {
        setSaving(false);
      }
    },
    [plan, user?.id, updateActiveProject]
  );

  const handleDiscover = async (
    isRefresh: boolean,
    discovery?: CompetitorDiscoveryOptions
  ) => {
    if (!plan) return;
    const opts = discovery || lastDiscoveryOpts;
    setLastDiscoveryOpts(opts);
    setAnalyzing(true);
    setErrorMsg(null);
    try {
      const { analyzeCompetitorsAction } = await import("@/lib/ai-actions");
      const result = await analyzeCompetitorsAction({
        projectName: plan.projectName,
        projectIdea: plan.overview || plan.ideaInput || "",
        audience: plan.audience || "",
        contextBlock: buildProjectContextBlock(plan),
        discovery: opts,
      });

      if (!result.success) {
        if (result.error === "AI_LIMIT_REACHED") {
          setShowLimitModal(true);
          return;
        }
        if (result.error === "OPENROUTER_API_KEY_MISSING") {
          setErrorMsg(
            "اتصال هوش مصنوعی پیکربندی نشده است. می‌توانی رقبا را دستی اضافه کنی."
          );
          return;
        }
        setErrorMsg("تحلیل ناموفق بود. دوباره تلاش کن یا رقیب را دستی اضافه کن.");
        return;
      }

      const raw = result.data as CompetitorDiscoveryResult & {
        _meta?: { model?: string; geography?: string; focus?: string; count?: number };
      };
      const discoveryResult = stripDiscoveryMeta(raw);
      if (discoveryResult.swot) setSwotArrays(discoveryResult.swot);

      const meta = raw._meta;
      setShowWizard(false);
      setMode("hub");

      // Always proposal tray — never silent overwrite of roster
      const merged = mergeDiscoveryIntoIntel(intel, discoveryResult, {
        autoAccept: false,
        discoveryOptions: opts,
        model: meta?.model,
      });

      // Narrative fields (brief/wedge/moves) already applied on merged.intel
      setIntel(merged.intel);
      setProposed(merged.proposed);
      if (discoveryResult.swot) {
        await persist(merged.intel, discoveryResult.swot, { silent: true });
      } else {
        await persist(merged.intel, undefined, { silent: true });
      }

      if (merged.proposed.length === 0) {
        toast.message("تحلیل تازه شد؛ تغییر معناداری در لیست نبود");
      } else if (!isRefresh && active.length === 0) {
        toast.message(
          `${toPersianDigits(String(merged.proposed.length))} رقیب پیشنهادی — پذیرش همه را بزن یا تک‌تک بررسی کن`
        );
      } else {
        toast.message(
          `${toPersianDigits(String(merged.proposed.length))} پیشنهاد جدید برای بررسی`
        );
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("خطای غیرمنتظره در تحلیل رقبا.");
    } finally {
      setAnalyzing(false);
    }
  };

  const acceptAllProposed = async () => {
    setUndoSnapshot(cloneIntel(intel));
    const next = acceptProposedCompetitors(intel, proposed);
    setProposed([]);
    await persist(next, swotArrays);
  };

  const acceptOneProposed = async (item: CompetitorIntelItem) => {
    setUndoSnapshot(cloneIntel(intel));
    const next = acceptProposedCompetitors(intel, [item]);
    setProposed((prev) => prev.filter((p) => p.id !== item.id));
    await persist(next, undefined, { silent: true });
  };

  const undoLastAccept = async () => {
    if (!undoSnapshot) return;
    setProposed([]);
    await persist(undoSnapshot, undefined, { silent: true });
    setUndoSnapshot(null);
    toast.message("آخرین پذیرش برگردانده شد");
  };

  const persistItem = async (id: string, patch: Partial<CompetitorIntelItem>) => {
    setIntel((prev) => {
      const stamped: CompetitorIntel = {
        ...prev,
        competitors: prev.competitors.map((c) =>
          c.id === id ? { ...c, ...patch } : c
        ),
      };
      void persist(stamped, undefined, { silent: true });
      return stamped;
    });
  };

  const dismissCompetitor = async (id: string) => {
    setIntel((prev) => {
      const stamped: CompetitorIntel = {
        ...prev,
        competitors: prev.competitors.map((c) =>
          c.id === id ? { ...c, status: "dismissed" as const } : c
        ),
      };
      void persist(stamped, undefined, { silent: true });
      return stamped;
    });
    toast.message("رقیب کنار گذاشته شد");
  };

  const restoreCompetitor = async (id: string) => {
    setIntel((prev) => {
      const stamped: CompetitorIntel = {
        ...prev,
        competitors: prev.competitors.map((c) =>
          c.id === id ? { ...c, status: "active" as const } : c
        ),
      };
      void persist(stamped, undefined, { silent: true });
      return stamped;
    });
    toast.success("رقیب بازگردانده شد");
  };

  const addManual = async () => {
    if (!draftName.trim()) return;
    const item = createManualCompetitor({ name: draftName.trim() });
    const next = {
      ...intel,
      competitors: [...intel.competitors, item],
    };
    setDraftName("");
    setAddOpen(false);
    setShowWizard(false);
    setMode("roster");
    await persist(next, undefined, { silent: true });
    toast.success("رقیب اضافه شد");
  };

  const importSeeds = async () => {
    if (!plan) return;
    const fresh = seedCompetitorIntel({ ...plan, competitorIntel: undefined });
    const existingNames = new Set(
      intel.competitors.map((c) => c.name.trim().toLowerCase())
    );
    const additions = fresh.competitors.filter(
      (c) => !existingNames.has(c.name.trim().toLowerCase())
    );
    if (additions.length === 0) {
      toast.message("مورد جدیدی برای وارد کردن نبود");
      return;
    }
    const next = {
      ...intel,
      competitors: [...intel.competitors, ...additions],
    };
    setShowWizard(false);
    await persist(next);
  };

  const handleExport = async () => {
    if (!plan) return;
    const md = buildCompetitorExportMarkdown(plan, intel);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `competitors-${plan.projectName || "karnex"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("فایل مارک‌داون دانلود شد");
  };

  const handleCopy = async () => {
    if (!plan) return;
    const md = buildCompetitorExportMarkdown(plan, intel);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("کپی شد");
  };

  const cycleFeatureCell = (rowId: string, colId: string) => {
    const order: FeatureCell[] = ["no", "partial", "yes"];
    const rows = [...(intel.featureRows || [])];
    const idx = rows.findIndex((r) => r.id === rowId);
    if (idx < 0) return;
    const current = rows[idx].cells[colId] || "no";
    const nextVal = order[(order.indexOf(current) + 1) % order.length];
    rows[idx] = {
      ...rows[idx],
      cells: { ...rows[idx].cells, [colId]: nextVal },
    };
    const next = { ...intel, featureRows: rows };
    setIntel(next);
    void persist(next, undefined, { silent: true });
  };

  const addFeatureRow = () => {
    const id = `feat_${Date.now()}`;
    const cells: Record<string, FeatureCell> = { you: "no" };
    for (const c of active) cells[c.id] = "no";
    const next = {
      ...intel,
      featureRows: [
        ...(intel.featureRows || []),
        { id, label: "ویژگی جدید", cells },
      ],
    };
    setIntel(next);
    void persist(next, undefined, { silent: true });
  };

  const setRating = (
    target: "you" | string,
    dim: string,
    value: 1 | 2 | 3 | 4 | 5
  ) => {
    if (target === "you") {
      setIntel((prev) => {
        const next = {
          ...prev,
          yourRatings: { ...(prev.yourRatings || {}), [dim]: value },
        };
        void persist(next, undefined, { silent: true });
        return next;
      });
      return;
    }
    setIntel((prev) => {
      const next: CompetitorIntel = {
        ...prev,
        competitors: prev.competitors.map((c) =>
          c.id === target
            ? { ...c, ratings: { ...(c.ratings || {}), [dim]: value } }
            : c
        ),
      };
      void persist(next, undefined, { silent: true });
      return next;
    });
  };

  const toggleMove = (id: string) => {
    setIntel((prev) => {
      const current = ensureActionableMoves(prev);
      const actionableMoves = current.map((m) =>
        m.id === id
          ? { ...m, status: m.status === "done" ? ("todo" as const) : ("done" as const) }
          : m
      );
      const next = {
        ...prev,
        actionableMoves,
        nextMoves: stringsFromActionableMoves(actionableMoves),
      };
      void persist(next, undefined, { silent: true });
      return next;
    });
  };

  const updateYourPosition = (patch: {
    x?: number;
    y?: number;
    xAxis?: string;
    yAxis?: string;
  }) => {
    setIntel((prev) => {
      const base = prev.yourPosition || {
        x: 0.5,
        y: 0.5,
        xAxis: "قیمت (ارزان ← گران)",
        yAxis: "تخصص (عمومی ← تخصصی)",
      };
      const next = {
        ...prev,
        yourPosition: { ...base, ...patch },
      };
      void persist(next, undefined, { silent: true });
      return next;
    });
  };

  const updateRivalPosition = (id: string, x: number, y: number) => {
    void persistItem(id, { position: { x, y } });
  };

  const onSwotChange = (next: SwotArrays) => {
    setSwotArrays(next);
    void persist(intel, next, { silent: true });
  };

  if (!plan) return null;

  const showEmptyWizard = showWizard || !hasAnyData;

  return (
    <div className="max-w-6xl mx-auto p-4 pb-28 space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">استودیو رقبا</h1>
              <p className="text-sm text-muted-foreground">
                تمایز محصول، تهدیدها و قدم بعدی — با داده زنده وب
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-normal">
              {plan.projectName}
            </Badge>
            <span>آخرین به‌روزرسانی: {formatRelativeFa(intel.updatedAt)}</span>
            <Badge variant="secondary" className="font-normal text-[10px]">
              کشف: {toPersianDigits(String(ANALYZE_COMPETITORS_CREDIT_COST))} اعتبار
            </Badge>
            {saving && (
              <span className="inline-flex items-center gap-1 text-primary">
                <Loader2 className="w-3 h-3 animate-spin" />
                در حال ذخیره
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!showEmptyWizard && (
            <Button
              onClick={() => handleDiscover(active.length > 0)}
              disabled={analyzing}
              className="gap-2"
            >
              {analyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Target className="w-4 h-4" />
              )}
              {active.length > 0 ? "بازتحلیل" : "کشف"}
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setAddOpen(true);
              setShowWizard(false);
            }}
          >
            <Plus className="w-4 h-4" />
            افزودن
          </Button>
          <Button variant="outline" size="icon" onClick={handleCopy} title="کپی">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={handleExport} title="دانلود">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {errorMsg && (
        <Card className="p-4 border-destructive/30 bg-destructive/5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm">{errorMsg}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-8 px-2"
              onClick={() => setErrorMsg(null)}
            >
              بستن
            </Button>
          </div>
        </Card>
      )}

      <ProposalTray
        proposed={proposed}
        canUndo={!!undoSnapshot}
        onAcceptAll={acceptAllProposed}
        onDismissAll={() => setProposed([])}
        onDismissOne={(id) => setProposed((prev) => prev.filter((p) => p.id !== id))}
        onAcceptOne={acceptOneProposed}
        onUndo={undoLastAccept}
      />

      {showEmptyWizard ? (
        <DiscoveryWizard
          projectName={plan.projectName}
          analyzing={analyzing}
          onDiscover={(opts) => handleDiscover(false, opts)}
          onManual={() => setAddOpen(true)}
          onImportSeeds={importSeeds}
          onCancel={hasAnyData ? () => setShowWizard(false) : undefined}
        />
      ) : (
        <>
          {/* Desktop mode tabs */}
          <div className="hidden sm:flex flex-wrap gap-1 border-b pb-2">
            {STUDIO_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm transition-colors",
                  mode === m.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {mode === "hub" && (
                <CommandCenter
                  intel={intel}
                  active={active}
                  analyzing={analyzing}
                  stageHint={stageHint}
                  fromValidation={fromValidation}
                  onRefresh={() => handleDiscover(true)}
                  onOpenWizard={() => setShowWizard(true)}
                  onSetMode={setMode}
                />
              )}
              {mode === "roster" && (
                <RosterPanel
                  items={active}
                  dismissed={dismissed}
                  onPersistItem={persistItem}
                  onDismiss={dismissCompetitor}
                  onRestore={restoreCompetitor}
                />
              )}
              {mode === "compare" && <CompareMode intel={intel} active={active} />}
              {mode === "map" && (
                <PositionMapPanel
                  intel={intel}
                  active={active}
                  onUpdatePosition={updateYourPosition}
                  onUpdateRivalPosition={updateRivalPosition}
                />
              )}
              {mode === "matrices" && (
                <MatricesPanel
                  intel={intel}
                  active={active}
                  swotArrays={swotArrays}
                  onSetRating={setRating}
                  onCycleFeature={cycleFeatureCell}
                  onAddFeatureRow={addFeatureRow}
                  onSwotChange={onSwotChange}
                />
              )}
              {mode === "battle" && (
                <BattleCardsPanel plan={plan} intel={intel} active={active} />
              )}
              {mode === "moves" && (
                <NextMovesPanel moves={moves} onToggle={toggleMove} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Mobile bottom mode switcher */}
          <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex overflow-x-auto gap-1 px-2 py-2">
              {STUDIO_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "shrink-0 px-3 py-2 rounded-lg text-xs",
                    mode === m.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Add manual dialog */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <Card className="w-full max-w-sm p-5 space-y-4">
            <h3 className="font-semibold">افزودن رقیب دستی</h3>
            <input
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              placeholder="نام رقیب"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") void addManual();
              }}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setAddOpen(false)}>
                انصراف
              </Button>
              <Button onClick={addManual} disabled={!draftName.trim()}>
                افزودن
              </Button>
            </div>
          </Card>
        </div>
      )}

      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
    </div>
  );
}
