import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromCache, // Added for offline fallback
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  collection 
} from "firebase/firestore";
import { db, appId } from "@/lib/firebase";

// Define the Data Structure (TypeScript Interface)
// This matches your AI Output
export interface BusinessPlan {
  projectName: string;
  tagline: string;
  overview: string;
  leanCanvas: {
    problem: string;
    solution: string;
    uniqueValue: string;
    revenueStream: string;
  };
  brandKit: {
    primaryColorHex: string;
    secondaryColorHex: string;
    colorPsychology: string;
    suggestedFont: string;
    logoConcepts: any[];
  };
  roadmap: any[];
  marketingStrategy: any[];
  competitors: {
    name: string;
    strength: string;
    weakness: string;
    channel: string;
  }[];
  legalAdvice?: {
    requirements: { title: string; description: string; priority: string; }[];
    permits: string[];
    tips: string[];
  };
  budget: string;
  audience: string; // Added to fix type error
  ideaInput?: string; // Optional since it might be legacy
  completedSteps?: string[]; // Track checking off items
  createdAt: string;
}

// Save Legal Advice to Cloud
export const saveLegalAdvice = async (userId: string, legalData: any) => {
  try {
     const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', 'current');
     await updateDoc(planRef, { legalAdvice: legalData });
     return true;
  } catch (error) {
    console.error("Error saving legal advice:", error);
    throw error;
  }
};

// Save Plan to Cloud
export const savePlanToCloud = async (userId: string, planData: any) => {
  try {
    // Path: /artifacts/{appId}/users/{userId}/plans/current
    // We use a fixed ID 'current' for the MVP so the user always finds their active project
    const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', 'current');
    
    await setDoc(planRef, {
      ...planData,
      updatedAt: new Date().toISOString()
    }, { merge: true }); // Merge updates, don't overwrite if not needed

    return true;
  } catch (error) {
    console.error("Error saving plan:", error);
    throw error;
  }
};

// Get Plan from Cloud
export const getPlanFromCloud = async (userId: string) => {
  const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', 'current');

  try {
    // 1. Try fetching from server with a lenient timeout (15s)
    const timeoutMs = 15000;
    const fetchPromise = getDoc(planRef);
    
    const timerPromise = new Promise<any>((_, reject) => 
        setTimeout(() => reject(new Error("Firestore Read Timeout")), timeoutMs)
    );

    const docSnap = await Promise.race([fetchPromise, timerPromise]);

    if (docSnap && docSnap.exists()) {
      return docSnap.data() as BusinessPlan;
    } 
    // If successful but empty, it might mean it really doesn't exist, OR 
    // it returned from cache empty. Return null.
    return null;

  } catch (error: any) {
    // 2. Fallback to Local Cache
    // This is normal behavior for offline/slow connections, so we use logic to recover.
    if (!error.message.includes("Firestore Read Timeout")) {
         console.warn("Network read failed. Attempting logic cache read...", error.message);
    }
    
    try {
        // Force read from local cache (offline support)
        const cachedSnap = await getDocFromCache(planRef);
        if (cachedSnap && cachedSnap.exists()) {
            console.log("✓ Retrieved plan from local device cache (Offline Mode Active).");
            return cachedSnap.data() as BusinessPlan;
        }
    } catch (cacheError) {
        // Only log if cache also fails, which means user has NO data at all.
        // console.warn("Cache read also failed:", cacheError);
    }

    // 3. If here, both network and cache failed
    if (error.message.includes("offline") || error.code === 'unavailable' || error.message.includes("Timeout")) {
        console.warn("Could not load plan (Offline & No Cache). Returning empty state.");
        return null;
    }
    
    console.error("Critical Error fetching plan:", error);
    throw error;
  }
};

// Toggle a Step Checkbox
export const toggleStepCompletion = async (userId: string, stepName: string, isCompleted: boolean) => {
  try {
    const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', 'current');
    
    await updateDoc(planRef, {
      completedSteps: isCompleted ? arrayUnion(stepName) : arrayRemove(stepName)
    });

    return true;
  } catch (error) {
    console.error("Error toggling step:", error);
    throw error;
  }
};

// Delete Project
export const deleteProject = async (userId: string) => {
  try {
     const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', 'current');
     await deleteDoc(planRef);
     return true;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};
