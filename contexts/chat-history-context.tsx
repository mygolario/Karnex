"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase";

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
  const supabase = createClient();

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
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const loadedSessions = data.map((d: any) => ({
        id: d.id,
        title: d.title,
        messages: d.messages || [],
        createdAt: d.created_at,
        updatedAt: d.updated_at
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
      const updatedMessages = [...currentSession.messages, message];
      const updatedSession = {
        ...currentSession,
        messages: updatedMessages,
        updatedAt: new Date().toISOString()
      };
      
      setCurrentSession(updatedSession);

      // Save to Supabase
      try {
        if (currentSession.id) {
          // Update existing
           await supabase
            .from('chat_sessions')
            .update({
              messages: updatedMessages,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentSession.id);
            
            // Update local sessions list to reflect change
            setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
        } else {
          // Create new
          const { data, error } = await supabase
            .from('chat_sessions')
            .insert({
              user_id: user.id,
              title: updatedSession.title,
              messages: updatedMessages,
              created_at: updatedSession.createdAt,
              updated_at: updatedSession.updatedAt
            })
            .select('id')
            .single();
            
          if (error) throw error;
          
          const newSessionWithId = { ...updatedSession, id: data.id };
          setCurrentSession(newSessionWithId);
          setSessions(prev => [newSessionWithId, ...prev]);
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
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id); // Ensure ownership

      if (error) throw error;

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
