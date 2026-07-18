"use client";

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Plus,
  Search,
  Loader2,
  Download,
  Copy,
  Check,
  RefreshCw,
  MapPin,
  Building2,
  Globe,
  ChevronDown,
  ChevronUp,
  Trash2,
  X,
  Sparkles,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";
import { cn, toPersianDigits } from "@/lib/utils";
import { saveCompetitorIntel, type PitchDeckSlide } from "@/lib/db";
import type {
  CompetitorConfidence,
  CompetitorDiscoveryResult,
  CompetitorIntel,
  CompetitorIntelItem,
  CompetitorScope,
  FeatureCell,
} from "@/lib/competitors/types";
import {
  acceptProposedCompetitors,
  buildCompetitorExportMarkdown,
  buildProjectContextBlock,
  createManualCompetitor,
  emptyCompetitorIntel,
  getActiveIntelItems,
  mergeDiscoveryIntoIntel,
  projectActiveCompetitors,
  seedCompetitorIntel,
  swotArraysToAnalysis,
} from "@/lib/competitors/normalize";

type MatrixTab = "ratings" | "features" | "swot";
type ScopeFilter = "all" | CompetitorScope | "iranian" | "global";

const CONFIDENCE_LABEL: Record<CompetitorConfidence, string> = {
  high: "اعتماد بالا",
  medium: "اعتماد متوسط",
  low: "اعتماد پایین",
};

const SCOPE_LABEL: Record<CompetitorScope, string> = {
  local: "محلی",
  national: "ملی",
  regional: "منطقه‌ای",
  global: "جهانی",
};

function syncPitchCompetitionSlides(
  pitchDeck: PitchDeckSlide[] | undefined,
  competitors: ReturnType<typeof projectActiveCompetitors>
): PitchDeckSlide[] | undefined {
  if (!pitchDeck?.length || competitors.length === 0) return pitchDeck;
  return pitchDeck.map((slide) => {
    if (slide.type !== "competition") return slide;
    return {
      ...slide,
      metadata: {
        ...(slide.metadata || {}),
        competitors: competitors.map((c) => ({
          name: c.name,
          strength: c.strength,
          weakness: c.weakness,
        })),
      },
    };
  });
}

function formatRelativeFa(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return toPersianDigits(
    d.toLocaleString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

export function CompetitorWorkspace() {
  const { user } = useAuth();
  const { activeProject: plan, updateActiveProject } = useProject();

  const [intel, setIntel] = useState<CompetitorIntel>(() => emptyCompetitorIntel());
  const [swotArrays, setSwotArrays] = useState<{
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  }>({ strengths: [], weaknesses: [], opportunities: [], threats: [] });
  const [proposed, setProposed] = useState<CompetitorIntelItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [matrixTab, setMatrixTab] = useState<MatrixTab>("ratings");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [draftName, setDraftName] = useState("");

  // Seed from project when it changes
  useEffect(() => {
    if (!plan) return;
    const seeded = seedCompetitorIntel(plan);
    setIntel(seeded);

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

  const filtered = useMemo(() => {
    return active.filter((c) => {
      switch (scopeFilter) {
        case "all":
          return true;
        case "iranian":
          return c.isIranian !== false;
        case "global":
          return c.isIranian === false || c.scope === "global";
        case "local":
        case "national":
        case "regional":
          return c.scope === scopeFilter;
        default: {
          const _exhaustive: never = scopeFilter;
          return _exhaustive;
        }
      }
    });
  }, [active, scopeFilter]);

  const localStrip = useMemo(() => {
    if (plan?.projectType !== "traditional") return [];
    return plan.locationAnalysis?.competitorAnalysis?.directCompetitors || [];
  }, [plan]);

  const saturation = plan?.locationAnalysis?.competitorAnalysis?.saturationLevel;
  const dimensions =
    intel.matrixDimensions?.length
      ? intel.matrixDimensions
      : ["عمق محصول", "دسترسی قیمت", "حضور محلی", "اعتماد برند", "توزیع و کانال"];

  const persist = useCallback(
    async (
      nextIntel: CompetitorIntel,
      nextSwot?: typeof swotArrays,
      options?: { silent?: boolean }
    ) => {
      if (!plan?.id || !user?.id) return;
      setSaving(true);
      try {
        const stamped = { ...nextIntel, updatedAt: new Date().toISOString() };
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

  const handleDiscover = async (isRefresh: boolean) => {
    if (!plan) return;
    setAnalyzing(true);
    setErrorMsg(null);
    try {
      const { analyzeCompetitorsAction } = await import("@/lib/ai-actions");
      const result = await analyzeCompetitorsAction({
        projectName: plan.projectName,
        projectIdea: plan.overview || plan.ideaInput || "",
        audience: plan.audience || "",
        contextBlock: buildProjectContextBlock(plan),
      });

      if (!result.success) {
        if (result.error === "AI_LIMIT_REACHED") {
          setShowLimitModal(true);
          return;
        }
        if (result.error === "OPENROUTER_API_KEY_MISSING") {
          setErrorMsg("اتصال هوش مصنوعی پیکربندی نشده است. می‌توانی رقبا را دستی اضافه کنی.");
          return;
        }
        setErrorMsg("تحلیل ناموفق بود. دوباره تلاش کن یا رقیب را دستی اضافه کن.");
        return;
      }

      const discovery = result.data as CompetitorDiscoveryResult;
      if (discovery.swot) setSwotArrays(discovery.swot);

      if (isRefresh && active.length > 0) {
        const merged = mergeDiscoveryIntoIntel(intel, discovery, { autoAccept: false });
        setIntel(merged.intel);
        setProposed(merged.proposed);
        if (discovery.swot) {
          await persist(merged.intel, discovery.swot, { silent: true });
        } else {
          await persist(merged.intel, undefined, { silent: true });
        }
        toast.message(
          merged.proposed.length
            ? `${toPersianDigits(String(merged.proposed.length))} پیشنهاد جدید برای بررسی`
            : "تحلیل تازه شد؛ تغییر معناداری در لیست نبود"
        );
      } else {
        const merged = mergeDiscoveryIntoIntel(intel, discovery, { autoAccept: true });
        setProposed([]);
        await persist(merged.intel, discovery.swot);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("خطای غیرمنتظره در تحلیل رقبا.");
    } finally {
      setAnalyzing(false);
    }
  };

  const acceptAllProposed = async () => {
    const next = acceptProposedCompetitors(intel, proposed);
    setProposed([]);
    await persist(next, swotArrays);
  };

  const dismissProposed = (id: string) => {
    setProposed((prev) => prev.filter((p) => p.id !== id));
  };

  const updateItemLocal = (id: string, patch: Partial<CompetitorIntelItem>) => {
    setIntel((prev) => ({
      ...prev,
      competitors: prev.competitors.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    }));
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

  const addManual = async () => {
    if (!draftName.trim()) return;
    const item = createManualCompetitor({ name: draftName.trim() });
    const next = {
      ...intel,
      competitors: [...intel.competitors, item],
    };
    setDraftName("");
    setAddOpen(false);
    setExpandedId(item.id);
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

  const hasAnyData = active.length > 0 || !!intel.brief;

  if (!plan) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 pb-28 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">تحلیل رقبا</h1>
              <p className="text-sm text-muted-foreground">
                جایگاه، تمایز و قدم بعدی — نه فقط یک لیست
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-normal">
              {plan.projectName}
            </Badge>
            <span>آخرین به‌روزرسانی: {formatRelativeFa(intel.updatedAt)}</span>
            {saving && (
              <span className="inline-flex items-center gap-1 text-primary">
                <Loader2 className="w-3 h-3 animate-spin" />
                در حال ذخیره
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleDiscover(active.length > 0)}
            disabled={analyzing}
            className="gap-2"
          >
            {analyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : active.length > 0 ? (
              <RefreshCw className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {active.length > 0 ? "بازتحلیل هوشمند" : "کشف با هوش مصنوعی"}
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" />
            افزودن رقیب
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

      {/* Traditional local strip (legacy locationAnalysis data if present) */}
      {plan.projectType === "traditional" && localStrip.length > 0 && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">رقبای محلی ذخیره‌شده</h2>
              {saturation && (
                <Badge variant="secondary" className="text-[10px]">
                  اشباع: {saturation}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {localStrip.slice(0, 8).map((c, i) => (
              <div
                key={`${c.name}-${i}`}
                className="shrink-0 rounded-lg border border-border/60 px-3 py-2 text-xs min-w-[140px]"
              >
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-muted-foreground mt-0.5">
                    {c.distance || "فاصله نامشخص"}
                  </p>
                </div>
              ))}
            </div>
        </Card>
      )}

      {/* Proposed review tray */}
      <AnimatePresence>
        {proposed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card className="p-4 border-primary/30 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm">پیشنهادهای بازتحلیل</h3>
                  <p className="text-xs text-muted-foreground">
                    بدون پاک کردن ویرایش‌های تو؛ موارد را بپذیر یا رد کن.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={acceptAllProposed}>
                    پذیرش همه ({toPersianDigits(String(proposed.length))})
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setProposed([])}>
                    رد همه
                  </Button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {proposed.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border bg-background p-3 text-sm flex justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {p.tagline || p.strength}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 h-8 w-8"
                      onClick={() => dismissProposed(p.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasAnyData ? (
        <Card className="p-8 sm:p-12 text-center space-y-5">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Search className="w-7 h-7 text-muted-foreground" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-bold">فضای رقابتی‌ات هنوز خالی است</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              با هوش مصنوعی رقبای واقعی بازار را پیدا کن، یا رقبایی که می‌شناسی را دستی اضافه کن.
              نتیجه ذخیره می‌شود و به امتیاز و پیچ‌دک وصل می‌شود.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => handleDiscover(false)} disabled={analyzing} className="gap-2">
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              کشف با هوش مصنوعی
            </Button>
            <Button variant="outline" onClick={() => setAddOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              افزودن دستی
            </Button>
            <Button variant="ghost" onClick={importSeeds} className="gap-2 text-sm">
              وارد کردن از پلن / برند / مکان
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Roster */}
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold">
                  فهرست رقبا{" "}
                  <span className="text-muted-foreground font-normal text-sm">
                    ({toPersianDigits(String(active.length))})
                  </span>
                </h2>
                <div className="flex flex-wrap gap-1">
                  {(
                    [
                      ["all", "همه"],
                      ["iranian", "ایرانی"],
                      ["local", "محلی"],
                      ["national", "ملی"],
                      ["global", "جهانی"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setScopeFilter(key)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[11px] border transition-colors",
                        scopeFilter === key
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:bg-muted"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {filtered.map((c) => {
                  const open = expandedId === c.id;
                  return (
                    <Card
                      key={c.id}
                      className={cn(
                        "overflow-hidden transition-shadow",
                        open && "ring-1 ring-primary/40"
                      )}
                    >
                      <button
                        type="button"
                        className="w-full text-start p-4 flex items-start gap-3"
                        onClick={() => setExpandedId(open ? null : c.id)}
                      >
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          {c.isIranian === false ? (
                            <Globe className="w-4 h-4" />
                          ) : (
                            <Building2 className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold truncate">{c.name}</span>
                            <Badge variant="outline" className="text-[10px] font-normal">
                              {c.isIranian === false ? "بین‌المللی" : "ایرانی"}
                            </Badge>
                            {c.scope && (
                              <Badge variant="secondary" className="text-[10px] font-normal">
                                {SCOPE_LABEL[c.scope]}
                              </Badge>
                            )}
                            {c.confidence && (
                              <span className="text-[10px] text-muted-foreground">
                                {CONFIDENCE_LABEL[c.confidence]}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {c.tagline || c.channel || "بدون توضیح موقعیت"}
                          </p>
                        </div>
                        {open ? (
                          <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                        )}
                      </button>

                      <AnimatePresence>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                              <Field
                                label="نام"
                                value={c.name}
                                onChange={(v) => updateItemLocal(c.id, { name: v })}
                                onBlur={(v) => void persistItem(c.id, { name: v })}
                              />
                              <Field
                                label="موقعیت‌یابی (یک خط)"
                                value={c.tagline || ""}
                                onChange={(v) => updateItemLocal(c.id, { tagline: v })}
                                onBlur={(v) => void persistItem(c.id, { tagline: v })}
                              />
                              <Field
                                label="کانال"
                                value={c.channel || ""}
                                onChange={(v) => updateItemLocal(c.id, { channel: v })}
                                onBlur={(v) => void persistItem(c.id, { channel: v })}
                              />
                              <Field
                                label="وب‌سایت / لینک"
                                value={c.url || ""}
                                onChange={(v) => updateItemLocal(c.id, { url: v })}
                                onBlur={(v) => void persistItem(c.id, { url: v })}
                              />
                              <Field
                                label="نقطه قوت"
                                value={c.strength}
                                onChange={(v) => updateItemLocal(c.id, { strength: v })}
                                onBlur={(v) => void persistItem(c.id, { strength: v })}
                                multiline
                              />
                              <Field
                                label="نقطه ضعف"
                                value={c.weakness}
                                onChange={(v) => updateItemLocal(c.id, { weakness: v })}
                                onBlur={(v) => void persistItem(c.id, { weakness: v })}
                                multiline
                              />
                              <Field
                                label="نقاط ورود شما (با خط جدید جدا کن)"
                                value={(c.entryPoints || []).join("\n")}
                                onChange={(v) =>
                                  updateItemLocal(c.id, {
                                    entryPoints: v
                                      .split("\n")
                                      .map((s) => s.trim())
                                      .filter(Boolean),
                                  })
                                }
                                onBlur={(v) =>
                                  void persistItem(c.id, {
                                    entryPoints: v
                                      .split("\n")
                                      .map((s) => s.trim())
                                      .filter(Boolean),
                                  })
                                }
                                multiline
                              />
                              <div className="flex justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive gap-1"
                                  onClick={() => dismissCompetitor(c.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  کنار گذاشتن
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  );
                })}
                {filtered.length === 0 && (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    با این فیلتر رقیبی نیست.
                  </p>
                )}
              </div>
            </div>

            {/* Right rail: map + brief */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold text-sm">نقشه موقعیت</h2>
                </div>
                <PositionMap
                  intel={intel}
                  active={active}
                  onMoveYou={(x, y) => {
                    const next = {
                      ...intel,
                      yourPosition: {
                        ...(intel.yourPosition || {
                          x: 0.5,
                          y: 0.5,
                          xAxis: "قیمت (ارزان ← گران)",
                          yAxis: "تخصص (عمومی ← تخصصی)",
                        }),
                        x,
                        y,
                      },
                    };
                    setIntel(next);
                    void persist(next, undefined, { silent: true });
                  }}
                  onAxisChange={(axis, value) => {
                    const next = {
                      ...intel,
                      yourPosition: {
                        x: intel.yourPosition?.x ?? 0.5,
                        y: intel.yourPosition?.y ?? 0.5,
                        xAxis: intel.yourPosition?.xAxis || "قیمت (ارزان ← گران)",
                        yAxis: intel.yourPosition?.yAxis || "تخصص (عمومی ← تخصصی)",
                        [axis]: value,
                      },
                    };
                    setIntel(next);
                    void persist(next, undefined, { silent: true });
                  }}
                />
              </Card>

              <Card className="p-4 space-y-3">
                <h2 className="font-semibold text-sm">جایگاه شما</h2>
                {intel.brief ? (
                  <p className="text-sm leading-relaxed text-foreground/90">{intel.brief}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    پس از کشف هوشمند، خلاصه جایگاه اینجا می‌آید.
                  </p>
                )}
                {intel.wedge && (
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                    <p className="text-[11px] text-primary mb-1">زاویه تمایز</p>
                    <p className="text-sm font-medium">{intel.wedge}</p>
                  </div>
                )}
                {!!intel.whiteSpace?.length && (
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1.5">فضای سفید</p>
                    <ul className="space-y-1">
                      {intel.whiteSpace.map((w) => (
                        <li key={w} className="text-sm flex gap-2">
                          <span className="text-primary">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {!!intel.nextMoves?.length && (
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1.5">قدم‌های بعدی</p>
                    <ol className="space-y-1.5 list-decimal list-inside">
                      {intel.nextMoves.map((m) => (
                        <li key={m} className="text-sm">
                          {m}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Matrix section */}
          <Card className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2 border-b border-border/50 pb-3">
              {(
                [
                  ["ratings", "امتیازها"],
                  ["features", "قابلیت‌ها"],
                  ["swot", "SWOT"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMatrixTab(key)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm transition-colors",
                    matrixTab === key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {matrixTab === "ratings" && (
              <div className="overflow-x-auto mobile-scroll-x -mx-1 px-1 max-w-full">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="text-muted-foreground text-xs">
                      <th className="text-start font-medium p-2">بُعد</th>
                      <th className="text-start font-medium p-2">شما</th>
                      {active.slice(0, 5).map((c) => (
                        <th key={c.id} className="text-start font-medium p-2 truncate max-w-[120px]">
                          {c.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dimensions.map((dim) => (
                      <tr key={dim} className="border-t border-border/40">
                        <td className="p-2 font-medium whitespace-nowrap">{dim}</td>
                        <td className="p-2">
                          <RatingPicker
                            value={intel.yourRatings?.[dim]}
                            onChange={(v) => setRating("you", dim, v)}
                          />
                        </td>
                        {active.slice(0, 5).map((c) => (
                          <td key={c.id} className="p-2">
                            <RatingPicker
                              value={c.ratings?.[dim]}
                              onChange={(v) => setRating(c.id, dim, v)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[11px] text-muted-foreground mt-2">
                  امتیاز ۱ تا ۵ قابل ویرایش است؛ عدد تصادفی ساخته نمی‌شود.
                </p>
              </div>
            )}

            {matrixTab === "features" && (
              <FeatureMatrixEditor
                intel={intel}
                active={active}
                onAddRow={(label) => {
                  const id = `feat_${Date.now()}`;
                  const cells: Record<string, FeatureCell> = { you: "partial" };
                  for (const c of active) cells[c.id] = "no";
                  const next = {
                    ...intel,
                    featureRows: [...(intel.featureRows || []), { id, label, cells }],
                  };
                  setIntel(next);
                  void persist(next, undefined, { silent: true });
                }}
                onCycle={cycleFeatureCell}
              />
            )}

            {matrixTab === "swot" && (
              <div className="grid sm:grid-cols-2 gap-3">
                {(
                  [
                    ["strengths", "نقاط قوت", "bg-emerald-500/10 border-emerald-500/20"],
                    ["weaknesses", "نقاط ضعف", "bg-rose-500/10 border-rose-500/20"],
                    ["opportunities", "فرصت‌ها", "bg-sky-500/10 border-sky-500/20"],
                    ["threats", "تهدیدها", "bg-amber-500/10 border-amber-500/20"],
                  ] as const
                ).map(([key, title, cls]) => (
                  <div key={key} className={cn("rounded-xl border p-3 space-y-2", cls)}>
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <textarea
                      className="w-full min-h-[100px] text-sm bg-background/70 rounded-lg border border-border/50 p-2 resize-y"
                      value={swotArrays[key].join("\n")}
                      onChange={(e) => {
                        const next = {
                          ...swotArrays,
                          [key]: e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        };
                        setSwotArrays(next);
                      }}
                      onBlur={() => void persist(intel, swotArrays, { silent: true })}
                      placeholder="هر مورد در یک خط"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Add modal */}
      <AnimatePresence>
        {addOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAddOpen(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-background border p-5 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold">افزودن رقیب</h3>
              <input
                autoFocus
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="نام رقیب"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void addManual();
                }}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setAddOpen(false)}>
                  انصراف
                </Button>
                <Button onClick={() => void addManual()} disabled={!draftName.trim()}>
                  افزودن
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: (v: string) => void;
  multiline?: boolean;
}) {
  const cls =
    "w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm";
  return (
    <label className="block space-y-1">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      {multiline ? (
        <textarea
          className={cn(cls, "min-h-[72px] resize-y")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur?.(e.target.value)}
        />
      ) : (
        <input
          className={cls}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur?.(e.target.value)}
        />
      )}
    </label>
  );
}

function RatingPicker({
  value,
  onChange,
}: {
  value?: number;
  onChange: (v: 1 | 2 | 3 | 4 | 5) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {([1, 2, 3, 4, 5] as const).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            "w-6 h-6 rounded text-[11px] border transition-colors",
            value === n
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 text-muted-foreground border-transparent hover:border-border"
          )}
        >
          {toPersianDigits(String(n))}
        </button>
      ))}
    </div>
  );
}

function PositionMap({
  intel,
  active,
  onMoveYou,
  onAxisChange,
}: {
  intel: CompetitorIntel;
  active: CompetitorIntelItem[];
  onMoveYou: (x: number, y: number) => void;
  onAxisChange: (axis: "xAxis" | "yAxis", value: string) => void;
}) {
  const pos = intel.yourPosition || {
    x: 0.5,
    y: 0.5,
    xAxis: "قیمت (ارزان ← گران)",
    yAxis: "تخصص (عمومی ← تخصصی)",
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;
    onMoveYou(Math.max(0.05, Math.min(0.95, x)), Math.max(0.05, Math.min(0.95, y)));
  };

  return (
    <div className="space-y-2">
      <input
        className="w-full text-[11px] text-muted-foreground bg-transparent border-b border-border/40 pb-1"
        value={pos.yAxis}
        onChange={(e) => onAxisChange("yAxis", e.target.value)}
      />
      <div
        role="presentation"
        onClick={handleClick}
        className="relative aspect-square rounded-xl border border-border/60 bg-muted/30 cursor-crosshair overflow-hidden"
      >
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
          <div className="border-e border-b border-border/30" />
          <div className="border-b border-border/30" />
          <div className="border-e border-border/30" />
          <div />
        </div>
        {active.slice(0, 8).map((c) => {
          const x = c.position?.x ?? 0.5;
          const y = c.position?.y ?? 0.5;
          return (
            <div
              key={c.id}
              title={c.name}
              className="absolute w-2.5 h-2.5 rounded-full bg-foreground/50 -translate-x-1/2 translate-y-1/2"
              style={{ left: `${x * 100}%`, bottom: `${y * 100}%` }}
            />
          );
        })}
        <div
          title="شما"
          className="absolute w-4 h-4 rounded-full bg-primary border-2 border-background shadow -translate-x-1/2 translate-y-1/2 z-10"
          style={{ left: `${pos.x * 100}%`, bottom: `${pos.y * 100}%` }}
        />
      </div>
      <input
        className="w-full text-[11px] text-muted-foreground bg-transparent border-b border-border/40 pb-1 text-center"
        value={pos.xAxis}
        onChange={(e) => onAxisChange("xAxis", e.target.value)}
      />
      <p className="text-[10px] text-muted-foreground">
        روی نقشه کلیک کن تا موقعیت «شما» جابه‌جا شود. نقاط خاکستری رقبا هستند.
      </p>
    </div>
  );
}

function FeatureMatrixEditor({
  intel,
  active,
  onAddRow,
  onCycle,
}: {
  intel: CompetitorIntel;
  active: CompetitorIntelItem[];
  onAddRow: (label: string) => void;
  onCycle: (rowId: string, colId: string) => void;
}) {
  const [label, setLabel] = useState("");
  const rows = intel.featureRows || [];
  const cellLabel = (v?: FeatureCell) => {
    switch (v) {
      case "yes":
        return "دارد";
      case "partial":
        return "نسبی";
      case "no":
        return "ندارد";
      default:
        return "—";
    }
  };

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          هنوز ردیف قابلیتی نیست. یک قابلیت یا پیشنهاد اضافه کن تا با رقبا مقایسه شود.
        </p>
      ) : (
        <div className="overflow-x-auto mobile-scroll-x -mx-1 px-1 max-w-full">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="text-start p-2">قابلیت</th>
                <th className="text-start p-2">شما</th>
                {active.slice(0, 5).map((c) => (
                  <th key={c.id} className="text-start p-2 truncate max-w-[100px]">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border/40">
                  <td className="p-2 font-medium">{row.label}</td>
                  <td className="p-2">
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded border hover:bg-muted"
                      onClick={() => onCycle(row.id, "you")}
                    >
                      {cellLabel(row.cells.you)}
                    </button>
                  </td>
                  {active.slice(0, 5).map((c) => (
                    <td key={c.id} className="p-2">
                      <button
                        type="button"
                        className="text-xs px-2 py-1 rounded border hover:bg-muted"
                        onClick={() => onCycle(row.id, c.id)}
                      >
                        {cellLabel(row.cells[c.id])}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
          placeholder="نام قابلیت یا پیشنهاد"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && label.trim()) {
              onAddRow(label.trim());
              setLabel("");
            }
          }}
        />
        <Button
          variant="outline"
          disabled={!label.trim()}
          onClick={() => {
            onAddRow(label.trim());
            setLabel("");
          }}
        >
          افزودن ردیف
        </Button>
      </div>
    </div>
  );
}
