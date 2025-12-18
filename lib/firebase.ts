import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 1. Setup Configuration
const getFirebaseConfig = () => {
  // A. Try Environment Variable (Production / Standard Local)
  if (process.env.NEXT_PUBLIC_FIREBASE_CONFIG) {
    try {
      return JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
    } catch (e) {
      console.error("Error parsing firebase config from env:", e);
    }
  }

  // B. Fallback to injected global (WebContainers / Legacy)
  if (typeof (global as any).__firebase_config !== 'undefined') {
    return JSON.parse((global as any).__firebase_config);
  }

  return {}; // Will cause initialization error if reached
};

const firebaseConfig = getFirebaseConfig();

// 2. Initialize App (Singleton Pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 3. Export Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper to get the App ID for storage paths
export const appId = 'karnex-live'; 
