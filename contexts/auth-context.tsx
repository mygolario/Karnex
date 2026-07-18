"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserProfile } from "@/lib/db";
import { createClient, isSupabaseBrowserConfigured } from "@/lib/supabase/client";
import { getOAuthRedirectUrl } from "@/lib/auth/oauth-redirect";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface AppUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  session: { user: AppUser } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (provider?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userProfile: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
  signIn: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function mapSupabaseUser(su: SupabaseUser | null, appId?: string): AppUser | null {
  if (!su) return null;
  return {
    id: appId || su.id,
    email: su.email,
    name:
      su.user_metadata?.full_name ||
      su.user_metadata?.name ||
      su.email?.split("@")[0],
    image: su.user_metadata?.avatar_url || su.user_metadata?.picture,
    role: null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const res = await fetch("/api/user-data?type=profile");
      if (!res.ok) return;
      const data = await res.json();
      if (data.profile) {
        setUserProfile(data.profile as UserProfile);
        setUser((prev) =>
          prev
            ? {
                ...prev,
                id: data.profile.id,
                role: data.profile.role,
                name: data.profile.full_name || prev.name,
                image: data.profile.avatar_url || prev.image,
              }
            : {
                id: data.profile.id,
                email: data.profile.email,
                name: data.profile.full_name,
                image: data.profile.avatar_url,
                role: data.profile.role,
              }
        );
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const init = async () => {
      const {
        data: { user: su },
      } = await supabase.auth.getUser();
      if (su) {
        await fetchProfile();
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          await fetchProfile();
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const signOut = async () => {
    if (isSupabaseBrowserConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setUserProfile(null);
    setUser(null);
    window.location.href = "/";
  };

  const signIn = async (provider?: string) => {
    if (!isSupabaseBrowserConfigured()) return;
    const supabase = createClient();
    if (provider === "google") {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getOAuthRedirectUrl("/dashboard/overview"),
        },
      });
    }
  };

  const session = user ? { user } : null;
  const isInitialLoading = loading || (loadingProfile && !userProfile);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        loading: isInitialLoading,
        refreshProfile,
        signOut,
        signIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
