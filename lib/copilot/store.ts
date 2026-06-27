import { create } from "zustand";
import type {
  CopilotMode,
  CopilotPersona,
  CopilotModelTier,
  CopilotMessage,
  MentionItem,
  CopilotConversation,
  CopilotInsight,
} from "./types";
import { copilotApi } from "./api";

interface CopilotState {
  // Workspace layout
  leftRailOpen: boolean;
  artifactCanvasOpen: boolean;
  activeMode: CopilotMode;

  // Conversations
  conversations: CopilotConversation[];
  activeConversationId: string | null;
  conversationsLoading: boolean;

  // Messages for the active conversation
  messages: CopilotMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  statusMessage: string;

  // Composer
  input: string;
  selectedContexts: MentionItem[];

  // Mention menu
  showMentionMenu: boolean;
  mentionQuery: string;
  mentionIndex: number;

  // Abort controller for stop button
  abortController: AbortController | null;

  // Persona & model tier
  activePersona: CopilotPersona;
  modelTier: CopilotModelTier;

  // Limit modal
  showLimitModal: boolean;

  // Proactive insights
  insights: CopilotInsight[];
  insightsOpen: boolean;
  unreadInsights: number;
  /** Composer prefill queued from ⌘K / inline "Ask Copilot about this". */
  pendingPrefill: string | null;

  // Actions
  setLeftRailOpen: (open: boolean) => void;
  setArtifactCanvasOpen: (open: boolean) => void;
  setActiveMode: (mode: CopilotMode) => void;
  setActivePersona: (persona: CopilotPersona) => void;
  setModelTier: (tier: CopilotModelTier) => void;

  setInput: (input: string) => void;
  setShowMentionMenu: (show: boolean) => void;
  setMentionQuery: (query: string) => void;
  setMentionIndex: (index: number) => void;
  addContext: (item: MentionItem) => void;
  removeContext: (id: string) => void;
  clearContexts: () => void;

  setMessages: (messages: CopilotMessage[]) => void;
  addMessage: (message: CopilotMessage) => void;
  updateMessage: (id: string, updates: Partial<CopilotMessage>) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;

  // Conversation persistence
  loadConversations: (projectId?: string) => Promise<void>;
  createConversation: (projectId?: string) => Promise<CopilotConversation | null>;
  selectConversation: (conversationId: string) => Promise<void>;
  renameConversation: (conversationId: string, title: string) => Promise<void>;
  togglePinConversation: (conversationId: string, pinned: boolean) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  upsertConversation: (conv: CopilotConversation) => void;
  setActiveConversationId: (id: string | null) => void;
  setConversationsLoading: (loading: boolean) => void;

  setIsLoading: (loading: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
  setStatusMessage: (message: string) => void;
  setAbortController: (controller: AbortController | null) => void;
  setShowLimitModal: (show: boolean) => void;

  // Insights
  loadInsights: (projectId?: string) => Promise<void>;
  refreshUnread: () => Promise<void>;
  markInsightRead: (id: string) => Promise<void>;
  dismissInsight: (id: string) => Promise<void>;
  setInsightsOpen: (open: boolean) => void;
  setPendingPrefill: (text: string | null) => void;
  consumePendingPrefill: () => string | null;

  stopGeneration: () => void;
}

const generateId = () =>
  `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

export const useCopilotStore = create<CopilotState>((set, get) => ({
  leftRailOpen: true,
  artifactCanvasOpen: false,
  activeMode: "cofounder",

  conversations: [],
  activeConversationId: null,
  conversationsLoading: false,

  messages: [],
  isLoading: false,
  isStreaming: false,
  statusMessage: "",

  input: "",
  selectedContexts: [],

  showMentionMenu: false,
  mentionQuery: "",
  mentionIndex: 0,

  abortController: null,

  activePersona: "default",
  modelTier: "hard",

  showLimitModal: false,

  insights: [],
  insightsOpen: false,
  unreadInsights: 0,
  pendingPrefill: null,

  setLeftRailOpen: (open) => set({ leftRailOpen: open }),
  setArtifactCanvasOpen: (open) => set({ artifactCanvasOpen: open }),
  setActiveMode: (mode) => set({ activeMode: mode }),
  setActivePersona: (persona) => set({ activePersona: persona }),
  setModelTier: (tier) => set({ modelTier: tier }),

  setInput: (input) => set({ input }),
  setShowMentionMenu: (show) => set({ showMentionMenu: show }),
  setMentionQuery: (query) => set({ mentionQuery: query }),
  setMentionIndex: (index) => set({ mentionIndex: index }),

  addContext: (item) =>
    set((state) => {
      if (state.selectedContexts.find((c) => c.id === item.id)) return state;
      return { selectedContexts: [...state.selectedContexts, item] };
    }),

  removeContext: (id) =>
    set((state) => ({
      selectedContexts: state.selectedContexts.filter((c) => c.id !== id),
    })),

  clearContexts: () => set({ selectedContexts: [] }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  removeMessage: (id) =>
    set((state) => ({ messages: state.messages.filter((m) => m.id !== id) })),

  clearMessages: () =>
    set({ messages: [], activeConversationId: null }),

  loadConversations: async (projectId) => {
    set({ conversationsLoading: true });
    try {
      const conversations = await copilotApi.listConversations(projectId);
      set({ conversations, conversationsLoading: false });
    } catch (e) {
      console.error("loadConversations failed:", e);
      set({ conversationsLoading: false });
    }
  },

  createConversation: async (projectId) => {
    const { activeMode, activePersona, modelTier } = get();
    try {
      const conv = await copilotApi.createConversation({
        projectId,
        mode: activeMode,
        persona: activePersona,
        tier: modelTier,
      });
      set((state) => ({
        conversations: [conv, ...state.conversations],
        activeConversationId: conv.id,
        messages: [],
      }));
      return conv;
    } catch (e) {
      console.error("createConversation failed:", e);
      return null;
    }
  },

  selectConversation: async (conversationId) => {
    set({ activeConversationId: conversationId, messages: [] });
    try {
      const messages = await copilotApi.getMessages(conversationId);
      const conv = get().conversations.find((c) => c.id === conversationId);
      if (conv) {
        set({ activeMode: conv.mode, activePersona: conv.persona });
      }
      set({ messages });
    } catch (e) {
      console.error("selectConversation failed:", e);
    }
  },

  renameConversation: async (conversationId, title) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, title } : c
      ),
    }));
    try {
      await copilotApi.updateConversation(conversationId, { title });
    } catch (e) {
      console.error("renameConversation failed:", e);
    }
  },

  togglePinConversation: async (conversationId, pinned) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, pinned } : c
      ),
    }));
    try {
      await copilotApi.updateConversation(conversationId, { pinned });
    } catch (e) {
      console.error("togglePinConversation failed:", e);
    }
  },

  deleteConversation: async (conversationId) => {
    const wasActive = get().activeConversationId === conversationId;
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== conversationId),
    }));
    try {
      await copilotApi.deleteConversation(conversationId);
    } catch (e) {
      console.error("deleteConversation failed:", e);
    }
    if (wasActive) {
      set({ activeConversationId: null, messages: [] });
    }
  },

  upsertConversation: (conv) =>
    set((state) => {
      const exists = state.conversations.some((c) => c.id === conv.id);
      const next = exists
        ? state.conversations.map((c) => (c.id === conv.id ? { ...c, ...conv } : c))
        : [conv, ...state.conversations];
      return { conversations: next };
    }),

  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setConversationsLoading: (loading) => set({ conversationsLoading: loading }),

  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setStatusMessage: (message) => set({ statusMessage: message }),
  setAbortController: (controller) => set({ abortController: controller }),
  setShowLimitModal: (show) => set({ showLimitModal: show }),

  loadInsights: async (projectId) => {
    try {
      const res = await fetch(
        `/api/copilot/insights${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ""}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json();
      set({ insights: (data.insights || []) as CopilotInsight[] });
    } catch (e) {
      console.error("loadInsights failed:", e);
    }
  },

  refreshUnread: async () => {
    try {
      const res = await fetch(`/api/copilot/insights?unread=1`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      set({ unreadInsights: data.unread || 0 });
    } catch (e) {
      console.error("refreshUnread failed:", e);
    }
  },

  markInsightRead: async (id) => {
    set((state) => ({
      insights: state.insights.map((i) =>
        i.id === id ? { ...i, status: "read" } : i
      ),
    }));
    try {
      await fetch(`/api/copilot/insights/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      });
      get().refreshUnread();
    } catch (e) {
      console.error("markInsightRead failed:", e);
    }
  },

  dismissInsight: async (id) => {
    set((state) => ({
      insights: state.insights.filter((i) => i.id !== id),
    }));
    try {
      await fetch(`/api/copilot/insights/${id}`, { method: "DELETE" });
      get().refreshUnread();
    } catch (e) {
      console.error("dismissInsight failed:", e);
    }
  },

  setInsightsOpen: (open) => set({ insightsOpen: open }),
  setPendingPrefill: (text) => set({ pendingPrefill: text }),
  consumePendingPrefill: () => {
    const text = get().pendingPrefill;
    if (text) set({ pendingPrefill: null });
    return text;
  },

  stopGeneration: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ abortController: null });
    }
    set({
      isLoading: false,
      isStreaming: false,
      statusMessage: "",
    });
  },
}));

export { generateId };
