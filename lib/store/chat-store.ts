import { create } from "zustand";
import { ChatSession, ChatMessage } from "@/contexts/chat-history-context";

interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  loading: boolean;
  
  createSession: (title?: string) => void;
  addMessage: (userId: string, role: "user" | "assistant", content: string) => Promise<void>;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
  clearStore: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSession: null,
  loading: false,

  createSession: (title) => {
    const { sessions } = get();
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: title || `گفتگو ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set({
      currentSession: newSession,
      sessions: [newSession, ...sessions]
    });
  },

  addMessage: async (userId, role, content) => {
    const { currentSession, sessions } = get();
    if (!currentSession) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...currentSession.messages, message];
    const updatedSession = {
      ...currentSession,
      messages: updatedMessages,
      updatedAt: new Date().toISOString()
    };
    
    set({
      currentSession: updatedSession,
      sessions: sessions.map(s => s.id === currentSession.id ? updatedSession : s)
    });
  },

  loadSession: (sessionId) => {
    const { sessions } = get();
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      set({ currentSession: session });
    }
  },

  deleteSession: async (sessionId) => {
    const { currentSession } = get();
    set(state => ({
      sessions: state.sessions.filter(s => s.id !== sessionId),
      currentSession: currentSession?.id === sessionId ? null : currentSession
    }));
  },

  refreshSessions: async () => {
    // Stub
  },

  clearStore: () => {
    set({ sessions: [], currentSession: null, loading: false });
  }
}));
