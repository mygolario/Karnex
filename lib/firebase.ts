import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCmCyXBlANcuBZhRIF9QZemzC4-UcFgVoY",
  authDomain: "karnex-aaec4.firebaseapp.com",
  projectId: "karnex-aaec4",
  storageBucket: "karnex-aaec4.firebasestorage.app",
  messagingSenderId: "882483651592",
  appId: "1:882483651592:web:f08f1ed916453cb2a19dbd",
  measurementId: "G-KMVWDV0PLM"
};

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
