import { create } from "zustand";
import { temporal } from "zundo";
import type {
  CanvasState,
  CardData,
  CardColor,
  CardType,
  CanvasType,
  CanvasViewport,
  SaveStatus,
  ToolType,
  RightPanelTab,
  CommentData,
  CanvasVersionData,
  CanvasViewMode,
  CanvasConnection,
} from "./types";
import { getTemplate, getDefaultCanvasType } from "./templates";

const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `card-${crypto.randomUUID()}`;
  }
  return `card-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export interface CanvasStoreState {
  canvasState: CanvasState;
  canvasType: CanvasType;
  canvasName: string;
  saveStatus: SaveStatus;
  selectedCardIds: string[];
  activeTool: ToolType;
  viewport: CanvasViewport;
  rightPanelOpen: boolean;
  rightPanelTab: RightPanelTab;
  leftToolbarOpen: boolean;
  highlightedSectionId: string | null;
  comments: CommentData[];
  versions: CanvasVersionData[];
  lastSavedState: CanvasState | null;
  isInitialized: boolean;
  exportDialogOpen: boolean;
  commandPaletteOpen: boolean;
  wizardOpen: boolean;
  searchQuery: string;
  focusMode: boolean;

  // New Reworked Fields
  viewMode: CanvasViewMode;
  connections: CanvasConnection[];

  init: (
    projectType?: string,
    leanCanvas?: Record<string, unknown> | null,
    brandCanvas?: Record<string, unknown> | null,
    canvasConnections?: CanvasConnection[] | null,
    canvasViewMode?: CanvasViewMode | null
  ) => void;
  setCanvasType: (type: CanvasType) => void;
  setCanvasName: (name: string) => void;
  addCard: (sectionId: string, content?: string, color?: CardColor, cardType?: CardType) => void;
  updateCard: (sectionId: string, cardId: string, content: string) => void;
  updateCardColor: (sectionId: string, cardId: string, color: CardColor) => void;
  updateCardType: (sectionId: string, cardId: string, cardType: CardType) => void;
  deleteCard: (sectionId: string, cardId: string) => void;
  deleteCards: (cards: { sectionId: string; cardId: string }[]) => void;
  moveCard: (activeId: string, overId: string, activeSection: string, overSection: string) => void;
  reorderCard: (sectionId: string, fromIndex: number, toIndex: number) => void;
  duplicateCard: (sectionId: string, cardId: string) => void;
  addAICards: (sectionId: string, cards: { content: string }[]) => void;
  replaceCanvasState: (newState: CanvasState) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setLastSavedState: (state: CanvasState) => void;
  setActiveTool: (tool: ToolType) => void;
  setViewport: (viewport: Partial<CanvasViewport>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  zoomToFit: () => void;
  setSelectedCardIds: (ids: string[]) => void;
  toggleCardSelection: (cardId: string) => void;
  clearSelection: () => void;
  setRightPanelOpen: (open: boolean) => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  setLeftToolbarOpen: (open: boolean) => void;
  setHighlightedSectionId: (id: string | null) => void;
  setFocusMode: (on: boolean) => void;
  setExportDialogOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setWizardOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setComments: (comments: CommentData[]) => void;
  addComment: (comment: CommentData) => void;
  resolveComment: (commentId: string) => void;
  setVersions: (versions: CanvasVersionData[]) => void;
  addVersion: (version: CanvasVersionData) => void;

  // New Reworked Actions
  setViewMode: (mode: CanvasViewMode) => void;
  addConnection: (fromId: string, toId: string, label?: string, color?: string) => void;
  deleteConnection: (id: string) => void;
  updateCardPosition: (sectionId: string, cardId: string, x: number, y: number) => void;
  updateCardSize: (sectionId: string, cardId: string, width: number, height: number) => void;
  moveCardToSection: (cardId: string, fromSectionId: string, toSectionId: string, x: number, y: number) => void;
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.15;

interface LegacyCard {
  id?: string;
  content?: string;
  color?: string;
  order?: number;
  cardType?: string;
  tags?: string[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

function migrateLegacyState(
  sourceData: Record<string, unknown> | null | undefined,
  templateType: CanvasType
): CanvasState {
  const template = getTemplate(templateType);
  const state: CanvasState = {};
  const sectionIds = template.sections.map((s) => s.id);

  for (const sectionId of sectionIds) {
    const content = sourceData ? sourceData[sectionId] : undefined;
    if (Array.isArray(content)) {
      if (content.length > 0 && typeof content[0] === "string") {
        state[sectionId] = content.map((text: string) => ({
          id: generateId(),
          section: sectionId,
          content: text,
          cardType: "NOTE" as CardType,
          color: "blue" as CardColor,
          order: 0,
        }));
      } else if (content.length > 0 && typeof content[0] === "object") {
        state[sectionId] = content.map((c: LegacyCard, i: number) => ({
          id: c.id || generateId(),
          section: sectionId,
          content: c.content || "",
          cardType: (c.cardType as CardType) || "NOTE",
          color: (c.color as CardColor) || "blue",
          order: c.order ?? i,
          x: c.x,
          y: c.y,
          width: c.width,
          height: c.height,
          isAIGenerated: c.color === "purple",
          tags: c.tags,
        }));
      } else {
        state[sectionId] = [];
      }
    } else if (typeof content === "string" && content) {
      state[sectionId] = [
        {
          id: generateId(),
          section: sectionId,
          content,
          cardType: "NOTE" as CardType,
          color: "blue" as CardColor,
          order: 0,
        },
      ];
    } else {
      state[sectionId] = [];
    }
  }

  return state;
}

export const useCanvasStore = create<CanvasStoreState>()(
  temporal(
    (set, get) => ({
      canvasState: {},
      canvasType: "BMC",
      canvasName: "بوم کسب‌وکار",
      saveStatus: "idle",
      selectedCardIds: [],
      activeTool: "select",
      viewport: { zoom: 1, panX: 0, panY: 0 },
      rightPanelOpen: false,
      rightPanelTab: "properties",
      leftToolbarOpen: true,
      highlightedSectionId: null,
      comments: [],
      versions: [],
      lastSavedState: null,
      isInitialized: false,
      exportDialogOpen: false,
      commandPaletteOpen: false,
      wizardOpen: false,
      searchQuery: "",
      focusMode: false,

      // New states
      viewMode: "grid",
      connections: [],

      init: (projectType, leanCanvas, brandCanvas, canvasConnections, canvasViewMode) => {
        const type = getDefaultCanvasType(projectType);
        const sourceData = type === "BRAND" ? brandCanvas : leanCanvas;
        const state = migrateLegacyState(sourceData, type);
        set({
          canvasState: state,
          canvasType: type,
          connections: canvasConnections || [],
          viewMode: canvasViewMode || "grid",
          lastSavedState: JSON.parse(JSON.stringify(state)),
          isInitialized: true,
          saveStatus: "idle",
        });
      },

      setCanvasType: (type) => {
        const currentState = get().canvasState;
        const template = getTemplate(type);
        const newState: CanvasState = {};
        for (const section of template.sections) {
          newState[section.id] = currentState[section.id] || [];
        }
        set({ canvasType: type, canvasState: newState });
      },

      setCanvasName: (name) => set({ canvasName: name }),

      addCard: (sectionId, content = "", color = "blue", cardType = "NOTE") => {
        const state = get().canvasState;
        const newCard: CardData = {
          id: generateId(),
          section: sectionId,
          content,
          cardType,
          color,
          order: 0,
        };
        const sectionCards = state[sectionId] || [];
        const newState = {
          ...state,
          [sectionId]: [newCard, ...sectionCards.map((c, i) => ({ ...c, order: i + 1 }))],
        };
        set({ canvasState: newState, saveStatus: "saving" });
      },

      updateCard: (sectionId, cardId, content) => {
        const state = get().canvasState;
        const sectionCards = state[sectionId] || [];
        const newState = {
          ...state,
          [sectionId]: sectionCards.map((c) =>
            c.id === cardId ? { ...c, content } : c
          ),
        };
        set({ canvasState: newState, saveStatus: "saving" });
      },

      updateCardColor: (sectionId, cardId, color) => {
        const state = get().canvasState;
        const sectionCards = state[sectionId] || [];
        const newState = {
          ...state,
          [sectionId]: sectionCards.map((c) =>
            c.id === cardId ? { ...c, color } : c
          ),
        };
        set({ canvasState: newState, saveStatus: "saving" });
      },

      updateCardType: (sectionId, cardId, cardType) => {
        const state = get().canvasState;
        const sectionCards = state[sectionId] || [];
        const newState = {
          ...state,
          [sectionId]: sectionCards.map((c) =>
            c.id === cardId ? { ...c, cardType } : c
          ),
        };
        set({ canvasState: newState, saveStatus: "saving" });
      },

      deleteCard: (sectionId, cardId) => {
        const state = get().canvasState;
        const sectionCards = state[sectionId] || [];
        const newState = {
          ...state,
          [sectionId]: sectionCards.filter((c) => c.id !== cardId),
        };
        const selected = get().selectedCardIds.filter((id) => id !== cardId);
        set({ canvasState: newState, selectedCardIds: selected, saveStatus: "saving" });
      },

      deleteCards: (cards) => {
        const state = get().canvasState;
        const newState = { ...state };
        const idsToRemove = new Set(cards.map((c) => c.cardId));
        for (const key of Object.keys(newState)) {
          newState[key] = (newState[key] || []).filter((c) => !idsToRemove.has(c.id));
        }
        set({
          canvasState: newState,
          selectedCardIds: [],
          saveStatus: "saving",
        });
      },

      moveCard: (activeId, overId, activeSection, overSection) => {
        const state = get().canvasState;
        const activeItems = [...(state[activeSection] || [])];
        const overItems = [...(state[overSection] || [])];

        if (activeSection === overSection) {
          const activeIndex = activeItems.findIndex((i) => i.id === activeId);
          const overIndex = activeItems.findIndex((i) => i.id === overId);
          if (activeIndex !== -1 && overIndex !== -1) {
            const [moved] = activeItems.splice(activeIndex, 1);
            activeItems.splice(overIndex, 0, moved);
            const newState = {
              ...state,
              [activeSection]: activeItems.map((c, i) => ({ ...c, order: i })),
            };
            set({ canvasState: newState, saveStatus: "saving" });
          }
        } else {
          const activeIndex = activeItems.findIndex((i) => i.id === activeId);
          if (activeIndex !== -1) {
            const [moved] = activeItems.splice(activeIndex, 1);
            const overIndex = overItems.findIndex((i) => i.id === overId);
            if (overIndex !== -1) {
              overItems.splice(overIndex, 0, moved);
            } else {
              overItems.push(moved);
            }
            const newState = {
              ...state,
              [activeSection]: activeItems.map((c, i) => ({ ...c, order: i })),
              [overSection]: overItems.map((c, i) => ({ ...c, order: i })),
            };
            set({ canvasState: newState, saveStatus: "saving" });
          }
        }
      },

      reorderCard: (sectionId, fromIndex, toIndex) => {
        const state = get().canvasState;
        const items = [...(state[sectionId] || [])];
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, moved);
        const newState = {
          ...state,
          [sectionId]: items.map((c, i) => ({ ...c, order: i })),
        };
        set({ canvasState: newState, saveStatus: "saving" });
      },

      duplicateCard: (sectionId, cardId) => {
        const state = get().canvasState;
        const sectionCards = state[sectionId] || [];
        const original = sectionCards.find((c) => c.id === cardId);
        if (!original) return;
        const newCard: CardData = {
          ...original,
          id: generateId(),
          content: original.content + " (کپی)",
          order: 0,
          isAIGenerated: false,
        };
        const newState = {
          ...state,
          [sectionId]: [newCard, ...sectionCards.map((c, i) => ({ ...c, order: i + 1 }))],
        };
        set({ canvasState: newState, saveStatus: "saving" });
      },

      addAICards: (sectionId, cards) => {
        const state = get().canvasState;
        const sectionCards = state[sectionId] || [];
        const newCards: CardData[] = cards.map((c, i) => ({
          id: generateId(),
          section: sectionId,
          content: c.content,
          cardType: "NOTE",
          color: "purple",
          order: i,
          isAIGenerated: true,
        }));
        const newState = {
          ...state,
          [sectionId]: [...newCards, ...sectionCards.map((c, i) => ({ ...c, order: i + newCards.length }))],
        };
        set({ canvasState: newState, saveStatus: "saving" });
      },

      replaceCanvasState: (newState) => {
        set({ canvasState: newState, saveStatus: "saving" });
      },

      setSaveStatus: (status) => set({ saveStatus: status }),
      setLastSavedState: (state) => set({ lastSavedState: state }),

      setActiveTool: (tool) => set({ activeTool: tool }),

      setViewport: (viewport) =>
        set({ viewport: { ...get().viewport, ...viewport } }),

      zoomIn: () => {
        const z = get().viewport.zoom;
        const newZoom = Math.min(ZOOM_MAX, z + ZOOM_STEP);
        set({ viewport: { ...get().viewport, zoom: newZoom } });
      },

      zoomOut: () => {
        const z = get().viewport.zoom;
        const newZoom = Math.max(ZOOM_MIN, z - ZOOM_STEP);
        set({ viewport: { ...get().viewport, zoom: newZoom } });
      },

      zoomReset: () => set({ viewport: { zoom: 1, panX: 0, panY: 0 } }),
      zoomToFit: () => set({ viewport: { zoom: 1, panX: 0, panY: 0 } }),

      setSelectedCardIds: (ids) => set({ selectedCardIds: ids, rightPanelOpen: ids.length > 0 }),

      toggleCardSelection: (cardId) => {
        const current = get().selectedCardIds;
        if (current.includes(cardId)) {
          const next = current.filter((id) => id !== cardId);
          set({ selectedCardIds: next, rightPanelOpen: next.length > 0 });
        } else {
          const next = [...current, cardId];
          set({ selectedCardIds: next, rightPanelOpen: true, rightPanelTab: "properties" });
        }
      },

      clearSelection: () => set({ selectedCardIds: [], rightPanelOpen: false }),

      setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
      setRightPanelTab: (tab) => set({ rightPanelTab: tab, rightPanelOpen: true }),
      setLeftToolbarOpen: (open) => set({ leftToolbarOpen: open }),
      setHighlightedSectionId: (id) => set({ highlightedSectionId: id }),
      setFocusMode: (on) => set({ focusMode: on }),
      setExportDialogOpen: (open) => set({ exportDialogOpen: open }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setWizardOpen: (open) => set({ wizardOpen: open }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      setComments: (comments) => set({ comments }),
      addComment: (comment) =>
        set({ comments: [...get().comments, comment] }),
      resolveComment: (commentId) =>
        set({
          comments: get().comments.map((c) =>
            c.id === commentId ? { ...c, resolved: !c.resolved } : c
          ),
        }),

      setVersions: (versions) => set({ versions }),
      addVersion: (version) => set({ versions: [version, ...get().versions] }),

      // Reworked Actions
      setViewMode: (mode) => set({ viewMode: mode, saveStatus: "saving" }),

      addConnection: (fromId, toId, label, color) => {
        const connections = get().connections;
        if (connections.some((c) => (c.fromId === fromId && c.toId === toId) || (c.fromId === toId && c.toId === fromId))) {
          return;
        }
        const newConnection: CanvasConnection = {
          id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          fromId,
          toId,
          label,
          color,
        };
        set({ connections: [...connections, newConnection], saveStatus: "saving" });
      },

      deleteConnection: (id) => {
        set({
          connections: get().connections.filter((c) => c.id !== id),
          saveStatus: "saving",
        });
      },

      updateCardPosition: (sectionId, cardId, x, y) => {
        const state = get().canvasState;
        const sectionCards = state[sectionId] || [];
        const newState = {
          ...state,
          [sectionId]: sectionCards.map((c) =>
            c.id === cardId ? { ...c, x, y } : c
          ),
        };
        set({ canvasState: newState, saveStatus: "saving" });
      },

      updateCardSize: (sectionId, cardId, width, height) => {
        const state = get().canvasState;
        const sectionCards = state[sectionId] || [];
        const newState = {
          ...state,
          [sectionId]: sectionCards.map((c) =>
            c.id === cardId ? { ...c, width, height } : c
          ),
        };
        set({ canvasState: newState, saveStatus: "saving" });
      },

      moveCardToSection: (cardId, fromSectionId, toSectionId, x, y) => {
        const state = get().canvasState;
        const fromCards = [...(state[fromSectionId] || [])];
        const toCards = [...(state[toSectionId] || [])];

        const cardIndex = fromCards.findIndex((c) => c.id === cardId);
        if (cardIndex === -1) return;

        const [card] = fromCards.splice(cardIndex, 1);
        const updatedCard = { ...card, section: toSectionId, x, y };

        const newState = {
          ...state,
          [fromSectionId]: fromCards.map((c, i) => ({ ...c, order: i })),
          [toSectionId]: [updatedCard, ...toCards].map((c, i) => ({ ...c, order: i })),
        };
        set({ canvasState: newState, saveStatus: "saving" });
      },
    }),
    {
      partialize: (state) => ({
        canvasState: state.canvasState,
        canvasType: state.canvasType,
        connections: state.connections,
        viewMode: state.viewMode,
      }),
      equality: (pastState, currentState) =>
        pastState.canvasType === currentState.canvasType &&
        pastState.viewMode === currentState.viewMode &&
        pastState.connections === currentState.connections &&
        pastState.canvasState === currentState.canvasState,
      limit: 50,
    }
  )
);

export { generateId, migrateLegacyState };
