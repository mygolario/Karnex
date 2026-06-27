"use client";

import { useEffect, useRef, useState, useCallback, createContext, useContext } from "react";
import { useCanvasStore } from "@/lib/canvas/store";
import { useCanvasAutosave, useUndoRedo } from "@/lib/canvas/autosave";
import { useProject } from "@/contexts/project-context";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { generateSmartCanvasAction } from "@/lib/ai-actions";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";
import { canvasApi } from "@/lib/canvas/api";

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const { activeProject: plan } = useProject();
  const { user } = useAuth();
  const { saveStatus, forceSave } = useCanvasAutosave();
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const initRef = useRef(false);

  const init = useCanvasStore((s) => s.init);
  const setComments = useCanvasStore((s) => s.setComments);

  const loadComments = useCallback(async () => {
    if (!plan?.id) return;
    try {
      const comments = await canvasApi.getComments(plan.id, "current");
      setComments(comments);
    } catch {
      // Comments will load silently - no error toast to avoid noise
    }
  }, [plan?.id, setComments]);

  const saveVersion = useCallback(async (name?: string) => {
    if (!plan?.id) return;
    try {
      const version = await canvasApi.createVersion(plan.id, "current", name);
      useCanvasStore.getState().addVersion(version);
      toast.success("نسخه ذخیره شد");
    } catch {
      toast.error("خطا در ذخیره نسخه");
    }
  }, [plan?.id]);

  useEffect(() => {
    if (!plan || initRef.current) return;
    initRef.current = true;
    init(
      plan.projectType,
      plan.leanCanvas as unknown as Record<string, unknown>,
      plan.brandCanvas as unknown as Record<string, unknown>,
      (plan as any).canvasConnections,
      (plan as any).canvasViewMode
    );

    const isBrand = plan.projectType === "creator";
    const sourceData = (isBrand ? plan.brandCanvas : plan.leanCanvas) as unknown as Record<string, unknown> | undefined;
    const hasData =
      sourceData &&
      Object.keys(sourceData).some((k) => {
        const v = (sourceData as Record<string, unknown>)[k];
        return Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.length > 0;
      });

    if (!hasData && (plan.overview || plan.description)) {
      setTimeout(() => autoFillCanvas(), 500);
    }

    loadComments();
  }, [plan]);

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
  loadComments: () => Promise<void>;
}

const CanvasProviderContext = createContext<CanvasProviderValue | null>(null);

export function useCanvasActions() {
  const ctx = useContext(CanvasProviderContext);
  if (!ctx) throw new Error("useCanvasActions must be used within CanvasProvider");
  return ctx;
}
