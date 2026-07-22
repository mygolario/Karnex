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

  const clearClientAuth = useCallback(async () => {
    setUser(null);
    setUserProfile(null);
    if (isSupabaseBrowserConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut({ scope: "local" });
      } catch {
        /* ignore */
      }
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const res = await fetch("/api/user-data?type=profile", { cache: "no-store" });
      if (!res.ok) {
        // Expired/invalid session → logged-out UI. Soft-deleted users are 404.
        if (res.status === 401 || res.status === 403) {
          await clearClientAuth();
          return;
        }
        if (res.status === 404) {
          await clearClientAuth();
          window.location.href = "/login?error=user_deleted";
          return;
        }
        return;
      }
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
  }, [clearClientAuth]);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    const init = async () => {
      // Validate with Auth server — do not trust cached session alone.
      const { data, error } = await supabase.auth.getUser();

      if (cancelled) return;

      if (error || !data.user) {
        // Drop stale local tokens that cause Dashboard UI + API 401 spam.
        await clearClientAuth();
        setLoading(false);
        return;
      }

      setUser(mapSupabaseUser(data.user));
      await fetchProfile();
      if (!cancelled) setLoading(false);
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // INITIAL_SESSION is handled by getUser() above to avoid phantom login.
      if (event === "INITIAL_SESSION") return;

      if (event === "SIGNED_OUT") {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        setUser(mapSupabaseUser(session.user));
        await fetchProfile();
        setLoading(false);
        return;
      }

      if (!session?.user) {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [fetchProfile, clearClientAuth]);

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
