import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  disableNetwork,
  enableNetwork,
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfigStr = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

if (!firebaseConfigStr) {
  throw new Error("NEXT_PUBLIC_FIREBASE_CONFIG is not defined");
}

const firebaseConfig = JSON.parse(firebaseConfigStr);

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics (Client-side only)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export const auth = getAuth(app);

// Initialize Firestore with persistent local cache for offline support
// This handles connection issues gracefully and reduces console errors
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
  ignoreUndefinedProperties: true,
});

// Network is enabled by default.
// We rely on Firestore's built-in offline persistence and connection management.

export { app, analytics };

// Helper to manually enable/disable Firestore network
export const enableFirestoreNetwork = () => enableNetwork(db);
export const disableFirestoreNetwork = () => disableNetwork(db);

// Helper to get the App ID for storage paths
export const appId = "karnex-live";
