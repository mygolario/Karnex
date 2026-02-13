"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "@/contexts/auth-context";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id?: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface ChatHistoryContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  loading: boolean;
  createSession: (title?: string) => void;
  addMessage: (role: "user" | "assistant", content: string) => Promise<void>;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | null>(null);

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);
  if (!context) throw new Error("useChatHistory must be within ChatHistoryProvider");
  return context;
}

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(false); // Default to false as we are not fetching

  // Load sessions on mount (Mock)
  useEffect(() => {
    if (user) {
      // In a real app, we might load from localStorage or an API here
      setSessions([]); 
    } else {
      setSessions([]);
      setCurrentSession(null);
    }
  }, [user]);

  const refreshSessions = async () => {
    // Stub
  };

  const createSession = (title?: string) => {
    const newSession: ChatSession = {
        id: crypto.randomUUID(),
        title: title || `گفتگو ${sessions.length + 1}`,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    setCurrentSession(newSession);
    setSessions(prev => [newSession, ...prev]);
  };

  const addMessage = async (role: "user" | "assistant", content: string) => {
    if (!user || !currentSession) return;

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
    
    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
  };

  const deleteSession = async (sessionId: string) => {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
  };

  return (
    <ChatHistoryContext.Provider value={{
      sessions,
      currentSession,
      loading,
      createSession,
      addMessage,
      loadSession,
      deleteSession,
      refreshSessions
    }}>
      {children}
    </ChatHistoryContext.Provider>
  );
}
