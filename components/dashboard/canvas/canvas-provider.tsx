"use client";

import { useEffect, useRef, useState, useCallback, createContext, useContext } from "react";
import { useCanvasStore, migrateLegacyState } from "@/lib/canvas/store";
import { useCanvasAutosave, useUndoRedo } from "@/lib/canvas/autosave";
import { useProject } from "@/contexts/project-context";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { generateSmartCanvasAction } from "@/lib/ai-actions";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";
import { canvasApi } from "@/lib/canvas/api";
import { dbCardsToState, countCardsInState, parseCanvasLayout } from "@/lib/canvas/persistence";
import { getDefaultCanvasType } from "@/lib/canvas/templates";
import type { CanvasType } from "@/lib/canvas/types";

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const { activeProject: plan } = useProject();
  const { user } = useAuth();
  const { saveStatus, forceSave } = useCanvasAutosave();
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const initRef = useRef(false);
  const planIdRef = useRef<string | null>(null);

  const init = useCanvasStore((s) => s.init);
  const loadFromPersisted = useCanvasStore((s) => s.loadFromPersisted);
  const setComments = useCanvasStore((s) => s.setComments);
  const setVersions = useCanvasStore((s) => s.setVersions);
  const setCanvasId = useCanvasStore((s) => s.setCanvasId);

  const loadComments = useCallback(async (canvasId: string) => {
    if (!plan?.id) return;
    try {
      const comments = await canvasApi.getComments(plan.id, canvasId);
      setComments(comments);
    } catch {
      // Comments load silently
    }
  }, [plan?.id, setComments]);

  const loadVersions = useCallback(async (canvasId: string) => {
    if (!plan?.id) return;
    try {
      const versions = await canvasApi.getVersions(plan.id, canvasId);
      setVersions(versions);
    } catch {
      // Versions load silently
    }
  }, [plan?.id, setVersions]);

  const saveVersion = useCallback(async (name?: string) => {
    const canvasId = useCanvasStore.getState().canvasId;
    if (!plan?.id || !canvasId) return;
    try {
      await forceSave();
      const version = await canvasApi.createVersion(plan.id, canvasId, name);
      useCanvasStore.getState().addVersion(version);
      toast.success("نسخه ذخیره شد");
    } catch {
      toast.error("خطا در ذخیره نسخه");
    }
  }, [plan?.id, forceSave]);

  const restoreVersion = useCallback(async (versionId: string) => {
    const canvasId = useCanvasStore.getState().canvasId;
    if (!plan?.id || !canvasId) return;
    try {
      const state = await canvasApi.restoreVersion(plan.id, canvasId, versionId);
      useCanvasStore.getState().replaceCanvasState(state);
      useCanvasStore.getState().setSaveStatus("saving");
      toast.success("نسخه بازیابی شد");
    } catch {
      toast.error("خطا در بازیابی نسخه");
    }
  }, [plan?.id]);

  useEffect(() => {
    if (!plan || !user) return;
    if (planIdRef.current !== plan.id) {
      initRef.current = false;
      planIdRef.current = plan.id ?? null;
    }
    if (initRef.current) return;

    let cancelled = false;

    async function bootstrap() {
      if (!plan?.id) return;

      const canvasType = getDefaultCanvasType(plan.projectType) as CanvasType;
      const isBrand = plan.projectType === "creator";
      const legacySource = (isBrand ? plan.brandCanvas : plan.leanCanvas) as Record<string, unknown> | undefined;
      const legacyConnections = (plan as { canvasConnections?: unknown }).canvasConnections;
      const legacyViewMode = (plan as { canvasViewMode?: "grid" | "freeform" }).canvasViewMode;

      try {
        const { canvas } = await canvasApi.ensureCanvas(plan.id!, {
          projectType: plan.projectType,
          type: canvasType,
        });

        if (cancelled) return;

        const layout = parseCanvasLayout(canvas.layout);
        const dbState = dbCardsToState(canvas.cards || []);
        const hasDbCards = countCardsInState(dbState) > 0;

        setCanvasId(canvas.id);

        if (hasDbCards) {
          loadFromPersisted(
            dbState,
            canvas.id,
            (canvas.type as CanvasType) || canvasType,
            layout.connections ?? (Array.isArray(legacyConnections) ? legacyConnections : []),
            layout.viewMode ?? legacyViewMode ?? "grid"
          );
        } else {
          init(
            plan.projectType,
            plan.leanCanvas as unknown as Record<string, unknown>,
            plan.brandCanvas as unknown as Record<string, unknown>,
            legacyConnections as Parameters<typeof init>[3],
            legacyViewMode
          );
          setCanvasId(canvas.id);

          const migratedState = useCanvasStore.getState().canvasState;
          if (countCardsInState(migratedState) > 0) {
            await canvasApi.syncState(
              plan.id!,
              canvas.id,
              migratedState,
              useCanvasStore.getState().connections,
              useCanvasStore.getState().viewMode
            );
          }
        }

        setVersions(
          (canvas.versions || []).map((v: { id: string; canvasId: string; name: string | null; snapshot: unknown; createdBy: string | null; createdAt: string }) => ({
            id: v.id,
            canvasId: v.canvasId,
            name: v.name || undefined,
            snapshot: v.snapshot as Record<string, import("@/lib/canvas/types").CardData[]>,
            createdBy: v.createdBy || undefined,
            createdAt: v.createdAt,
          }))
        );

        await loadComments(canvas.id);
        initRef.current = true;

        const sourceData = legacySource;
        const hasLegacyData =
          sourceData &&
          Object.keys(sourceData).some((k) => {
            const v = sourceData[k];
            return Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.length > 0;
          });

        if (!hasDbCards && !hasLegacyData && (plan.overview || plan.description)) {
          setTimeout(() => autoFillCanvas(), 500);
        }
      } catch (err) {
        console.error("Canvas bootstrap failed:", err);
        init(
          plan.projectType,
          plan.leanCanvas as unknown as Record<string, unknown>,
          plan.brandCanvas as unknown as Record<string, unknown>,
          legacyConnections as Parameters<typeof init>[3],
          legacyViewMode
        );
        initRef.current = true;
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [plan, user, init, loadFromPersisted, setCanvasId, setVersions, loadComments]);

  const autoFillCanvas = async () => {
    if (!plan) return;
    const store = useCanvasStore.getState();

    if (plan.projectType !== "creator") {
      try {
        store.setSaveStatus("saving");
        const response = await fetch("/api/ai-generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generate-full-canvas",
            businessIdea: plan.overview || plan.description,
            projectName: plan.projectName,
          }),
        });

        if (response.status === 429) {
          setShowLimitModal(true);
          store.setSaveStatus("idle");
          return;
        }

        const data = await response.json();
        if (data.success && data.canvas) {
          const parsed = data.canvas;
          const keys = [
            "keyPartners", "keyActivities", "keyResources", "uniqueValue",
            "customerRelations", "channels", "customerSegments",
            "costStructure", "revenueStream",
          ];

          keys.forEach((key) => {
            let content = parsed[key];
            if (typeof content === "string") {
              content = content
                .split("\n")
                .filter((l: string) => l.trim().length > 0)
                .map((l: string) => l.replace(/^[•\-]\s*/, ""));
            }
            const items = Array.isArray(content) ? content : [content];
            if (items.length > 0 && items[0]) {
              store.addAICards(
                key,
                items.filter(Boolean).map((text: string) => ({ content: text }))
              );
            }
          });

          toast.success("بوم با موفقیت تکمیل شد");
          store.setSaveStatus("saving");
        }
      } catch (err) {
        console.error(err);
        toast.error("خطا در تولید خودکار");
        store.setSaveStatus("idle");
      }
    }
  };

  const handleSmartWizardComplete = async (answers: Record<string, string>) => {
    if (!plan || !user) return;
    const store = useCanvasStore.getState();
    store.setSaveStatus("saving");

    try {
      const type = plan.projectType === "creator" ? "brand" : "lean";
      const result = await generateSmartCanvasAction({
        idea: plan.overview || plan.description || "",
        answers,
        type,
      });

      if (result.success && result.data) {
        Object.entries(result.data).forEach(([key, cards]) => {
          if (Array.isArray(cards)) {
            store.addAICards(
              key,
              cards.map((text) => ({ content: text }))
            );
          }
        });
        toast.success("بوم با موفقیت تکمیل شد");
      } else if (result.error === "AI_LIMIT_REACHED") {
        setShowLimitModal(true);
      } else {
        toast.error("خطا در تولید محتوا");
      }
    } catch (e) {
      console.error(e);
      toast.error("خطا در ارتباط با هوش مصنوعی");
    } finally {
      store.setSaveStatus("saving");
    }
  };

  return (
    <CanvasProviderContext.Provider
      value={{
        saveStatus,
        forceSave,
        undo,
        redo,
        canUndo,
        canRedo,
        autoFillCanvas,
        handleSmartWizardComplete,
        saveVersion,
        loadComments,
        restoreVersion,
        loadVersions,
      }}
    >
      {children}
      <LimitReachedModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </CanvasProviderContext.Provider>
  );
}

interface CanvasProviderValue {
  saveStatus: string;
  forceSave: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  autoFillCanvas: () => Promise<void>;
  handleSmartWizardComplete: (answers: Record<string, string>) => Promise<void>;
  saveVersion: (name?: string) => Promise<void>;
  loadComments: (canvasId: string) => Promise<void>;
  restoreVersion: (versionId: string) => Promise<void>;
  loadVersions: (canvasId: string) => Promise<void>;
}

const CanvasProviderContext = createContext<CanvasProviderValue | null>(null);

export function useCanvasActions() {
  const ctx = useContext(CanvasProviderContext);
  if (!ctx) throw new Error("useCanvasActions must be used within CanvasProvider");
  return ctx;
}

export { migrateLegacyState };
