import { useEffect, useRef, useCallback } from "react";
import { useStore } from "zustand";
import { useCanvasStore } from "./store";
import type { CanvasState } from "./types";
import { useProject } from "@/contexts/project-context";
import { useAuth } from "@/contexts/auth-context";
import { savePlanToCloud } from "@/lib/db";
import { toast } from "sonner";

const AUTOSAVE_DEBOUNCE_MS = 800;

function stateToLegacyFormat(
  state: CanvasState
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, cards] of Object.entries(state)) {
    result[key] = cards.map((c) => ({
      id: c.id,
      content: c.content,
      color: c.color,
      order: c.order,
      x: c.x,
      y: c.y,
      width: c.width,
      height: c.height,
      cardType: c.cardType,
    }));
  }
  return result;
}

export function useCanvasAutosave() {
  const { activeProject: plan, updateActiveProject } = useProject();
  const { user } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const isMountedRef = useRef(false);

  const doSave = useCallback(
    async (state: CanvasState, type: string) => {
      if (!plan || !user) return;

      const fieldName = type === "BRAND" ? "brandCanvas" : "leanCanvas";
      const updateData = stateToLegacyFormat(state);
      const connections = useCanvasStore.getState().connections;
      const viewMode = useCanvasStore.getState().viewMode;

      if (typeof window !== "undefined" && !navigator.onLine) {
        updateActiveProject({ 
          [fieldName]: updateData,
          canvasConnections: connections,
          canvasViewMode: viewMode
        });
        const { addUpdateProjectToQueue } = await import("@/lib/offline-sync");
        addUpdateProjectToQueue(user.id!, plan.id!, { 
          [fieldName]: updateData,
          canvasConnections: connections,
          canvasViewMode: viewMode
        });
        useCanvasStore.getState().setSaveStatus("offline");
        return;
      }

      useCanvasStore.getState().setSaveStatus("saving");

      try {
        await savePlanToCloud(user.id!, { 
          [fieldName]: updateData,
          canvasConnections: connections,
          canvasViewMode: viewMode
        }, true, plan.id!);
        updateActiveProject({ 
          [fieldName]: updateData,
          canvasConnections: connections,
          canvasViewMode: viewMode
        });
        useCanvasStore.getState().setSaveStatus("saved");
        useCanvasStore.getState().setLastSavedState(JSON.parse(JSON.stringify(state)));

        setTimeout(() => {
          const current = useCanvasStore.getState().saveStatus;
          if (current === "saved") {
            useCanvasStore.getState().setSaveStatus("idle");
          }
        }, 2000);
      } catch (e) {
        console.error("Autosave failed:", e);
        useCanvasStore.getState().setSaveStatus("error");
        toast.error("خطا در ذخیره‌سازی — تغییرات شما حفظ شده و دوباره تلاش می‌شود");
      }
    },
    [plan, user, updateActiveProject]
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isMountedRef.current || !plan) return;

    const state = useCanvasStore.getState().canvasState;
    const type = useCanvasStore.getState().canvasType;
    const status = useCanvasStore.getState().saveStatus;
    const isInitialized = useCanvasStore.getState().isInitialized;

    if (!isInitialized) return;
    if (status === "idle" || status === "saved") return;

    const stateJson = JSON.stringify(state);
    if (stateJson === lastSavedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      lastSavedRef.current = stateJson;
      doSave(state, type);
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    useCanvasStore((s) => s.canvasState),
    useCanvasStore((s) => s.canvasType),
    useCanvasStore((s) => s.saveStatus),
    plan,
    doSave,
  ]);

  return {
    saveStatus: useCanvasStore((s) => s.saveStatus),
    forceSave: () => {
      const state = useCanvasStore.getState().canvasState;
      const type = useCanvasStore.getState().canvasType;
      doSave(state, type);
    },
  };
}

export function useUndoRedo() {
  const undo = useCallback(() => {
    useCanvasStore.temporal.getState().undo();
  }, []);

  const redo = useCallback(() => {
    useCanvasStore.temporal.getState().redo();
  }, []);

  const clearHistory = useCallback(() => {
    useCanvasStore.temporal.getState().clear();
  }, []);

  const canUndo = useStore(useCanvasStore.temporal, (state) => state.pastStates.length > 0);
  const canRedo = useStore(useCanvasStore.temporal, (state) => state.futureStates.length > 0);
  const pastLength = useStore(useCanvasStore.temporal, (state) => state.pastStates.length);
  const futureLength = useStore(useCanvasStore.temporal, (state) => state.futureStates.length);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlKey && e.key === "z" && !e.shiftKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
        e.preventDefault();
        useCanvasStore.temporal.getState().undo();
      } else if (ctrlKey && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        const target = e.target as HTMLElement;
        if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
        e.preventDefault();
        useCanvasStore.temporal.getState().redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { undo, redo, clearHistory, canUndo, canRedo, pastLength, futureLength };
}
