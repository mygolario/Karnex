import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfigStr = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

if (!firebaseConfigStr) {
  throw new Error('NEXT_PUBLIC_FIREBASE_CONFIG is not defined');
}

const firebaseConfig = JSON.parse(firebaseConfigStr);

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics (Client-side only)
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export { app, analytics };

// Helper to get the App ID for storage paths
export const appId = 'karnex-live'; 
