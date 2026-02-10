"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { UserProfile } from "@/lib/db";

// Define the Context Shape
interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  session: null,
  userProfile: null, 
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = async (uid: string, email?: string) => {
    try {
      const res = await fetch("/api/user-data?type=profile");
      if (!res.ok) {
        console.error("Error fetching profile: HTTP", res.status);
        return;
      }
      const data = await res.json();
      if (data.profile) {
        setUserProfile(data.profile as UserProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    // Listen for changes — only re-fetch on meaningful events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Always update session
      setSession(session);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email);
        }
        setLoading(false);
        return;
      }
      
      // For TOKEN_REFRESHED and other events, just update user reference quietly
      // Do NOT re-fetch profile/projects — this prevents the blank flash on tab switch
      if (session?.user) {
        setUser(prev => prev?.id === session.user.id ? prev : session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, userProfile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
