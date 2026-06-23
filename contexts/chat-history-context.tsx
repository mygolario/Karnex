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

import { useChatStore } from "@/lib/store/chat-store";

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const {
    sessions,
    currentSession,
    loading,
    createSession: storeCreateSession,
    addMessage: storeAddMessage,
    loadSession: storeLoadSession,
    deleteSession: storeDeleteSession,
    refreshSessions: storeRefreshSessions,
    clearStore
  } = useChatStore();

  // Clear store on logout
  useEffect(() => {
    if (!user) {
      clearStore();
    }
  }, [user, clearStore]);

  const refreshSessions = async () => {
    await storeRefreshSessions();
  };

  const createSession = (title?: string) => {
    storeCreateSession(title);
  };

  const addMessage = async (role: "user" | "assistant", content: string) => {
    if (!user?.id) return;
    await storeAddMessage(user.id, role, content);
  };

  const loadSession = (sessionId: string) => {
    storeLoadSession(sessionId);
  };

  const deleteSession = async (sessionId: string) => {
    await storeDeleteSession(sessionId);
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
