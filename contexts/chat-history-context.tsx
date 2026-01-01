"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "@/contexts/auth-context";
import { collection, addDoc, getDocs, query, orderBy, limit, doc, deleteDoc } from "firebase/firestore";
import { db, appId } from "@/lib/firebase";

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
  addMessage: (role: "user" | "assistant", content: string) => void;
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
  const [loading, setLoading] = useState(true);

  // Load sessions on mount
  useEffect(() => {
    if (user) {
      refreshSessions();
    } else {
      setSessions([]);
      setCurrentSession(null);
      setLoading(false);
    }
  }, [user]);

  const refreshSessions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const colRef = collection(db, "artifacts", appId, "users", user.uid, "chats");
      const q = query(colRef, orderBy("updatedAt", "desc"), limit(20));
      const snap = await getDocs(q);
      
      const loadedSessions = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any)
      })) as ChatSession[];
      
      setSessions(loadedSessions);
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = (title?: string) => {
    const newSession: ChatSession = {
      title: title || `گفتگو ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCurrentSession(newSession);
  };

  const addMessage = async (role: "user" | "assistant", content: string) => {
    if (!user) return;

    const message: ChatMessage = {
      role,
      content,
      timestamp: new Date().toISOString()
    };

    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        messages: [...currentSession.messages, message],
        updatedAt: new Date().toISOString()
      };
      setCurrentSession(updatedSession);

      // Save to Firestore
      try {
        if (currentSession.id) {
          // Update existing
          // For simplicity, we'll just track locally for now
          // Full implementation would use updateDoc
        } else {
          // Create new
          const colRef = collection(db, "artifacts", appId, "users", user.uid, "chats");
          const docRef = await addDoc(colRef, updatedSession);
          setCurrentSession({ ...updatedSession, id: docRef.id });
          await refreshSessions();
        }
      } catch (error) {
        console.error("Error saving chat:", error);
      }
    }
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, "artifacts", appId, "users", user.uid, "chats", sessionId);
      await deleteDoc(docRef);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
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
