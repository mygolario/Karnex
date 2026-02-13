"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "next-auth"; // Use NextAuth User type
import { useSession, signOut as nextAuthSignOut, signIn as nextAuthSignIn } from "next-auth/react";
import { UserProfile } from "@/lib/db";

// Define the Context Shape
interface AuthContextType {
  user: User | null;
  session: any | null; // Typed loosely for now, or import Session from next-auth
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
  signIn: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Loading state differs from NextAuth status
  // We want 'loading' to be true if authentication is loading OR profile is fetching
  const loading = status === "loading" || loadingProfile;

  const fetchProfile = async (uid?: string) => {
    if (!uid) return;
    try {
      setLoadingProfile(true);
      // Calls our refactored API which uses auth() to identify user
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
    } finally {
        setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
        // Fetch profile when session is available and user changes
        fetchProfile(session.user.id);
    } else if (status === 'unauthenticated') {
        setUserProfile(null);
    }
  }, [session?.user?.id, status]);

  const refreshProfile = async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  };

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: "/" });
    setUserProfile(null);
  };
  
  const signIn = async (provider?: string) => {
      await nextAuthSignIn(provider);
  }

  return (
    <AuthContext.Provider value={{ 
        user: session?.user as User || null, 
        session, 
        userProfile, 
        loading, 
        refreshProfile, 
        signOut,
        signIn
    }}>
      {children}
    </AuthContext.Provider>
  );
}
