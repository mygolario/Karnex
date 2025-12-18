"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from "@/lib/firebase";

// Define the Context Shape
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initialize Authentication
    const initAuth = async () => {
      try {
        // If the environment provides a token, use it (Simulates logged in user)
        if (typeof (window as any).__initial_auth_token !== 'undefined' && (window as any).__initial_auth_token) {
          await signInWithCustomToken(auth, (window as any).__initial_auth_token);
        } else {
          // Otherwise, create a secure anonymous session
          // This allows users to start using the app immediately without signup friction
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth Initialization Error:", error);
      }
    };

    initAuth();

    // 2. Listen for User State Changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
