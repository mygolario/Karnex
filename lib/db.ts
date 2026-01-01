import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromCache, 
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
  addDoc
} from "firebase/firestore";
import { db, appId } from "@/lib/firebase";

// Define the Data Structure (TypeScript Interface)
export interface BusinessPlan {
  id?: string; // Document ID
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
  audience: string;
  ideaInput?: string;
  completedSteps?: string[];
  createdAt: string;
  updatedAt?: string;
}

// Get All User Projects
export const getUserProjects = async (userId: string): Promise<BusinessPlan[]> => {
  try {
    const colRef = collection(db, 'artifacts', appId, 'users', userId, 'plans');
    const snap = await getDocs(colRef); // Fetch all
    
    return snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any)
    })) as BusinessPlan[];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

// Create New Project (Auto ID)
export const createProject = async (userId: string, planData: any) => {
    try {
        const colRef = collection(db, 'artifacts', appId, 'users', userId, 'plans');
        // We use addDoc for auto-generated UUIDs
        const docRef = await addDoc(colRef, {
            ...planData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating project:", error);
        throw error;
    }
}

// Save Legal Advice 
export const saveLegalAdvice = async (userId: string, legalData: any, projectId: string = 'current') => {
  try {
     const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId);
     await updateDoc(planRef, { legalAdvice: legalData });
     return true;
  } catch (error) {
    console.error("Error saving legal advice:", error);
    throw error;
  }
};

// Save Plan (Update existing) 
export const savePlanToCloud = async (userId: string, planData: any, merge: boolean = true, projectId: string = 'current') => {
  try {
    const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId);
    
    // Ensure we don't accidentally overwrite 'current' if we meant a specific ID, but here projectId handles that.
    await setDoc(planRef, {
      ...planData,
      updatedAt: new Date().toISOString()
    }, { merge });

    return true;
  } catch (error) {
    console.error("Error saving plan:", error);
    throw error;
  }
};

// Get Single Plan
export const getPlanFromCloud = async (userId: string, projectId: string = 'current') => {
  const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId);

  try {
    const timeoutMs = 15000;
    const fetchPromise = getDoc(planRef);
    
    const timerPromise = new Promise<any>((_, reject) => 
        setTimeout(() => reject(new Error("Firestore Read Timeout")), timeoutMs)
    );

    const docSnap = await Promise.race([fetchPromise, timerPromise]);

    if (docSnap && docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as BusinessPlan;
    } 
    return null;

  } catch (error: any) {
    if (!error.message.includes("Firestore Read Timeout")) {
         console.warn("Network read failed. Attempting logic cache check...", error.message);
    }
    
    try {
        const cachedSnap = await getDocFromCache(planRef);
        if (cachedSnap && cachedSnap.exists()) {
            console.log("✓ Retrieved plan from cache.");
            return { id: cachedSnap.id, ...cachedSnap.data() } as BusinessPlan;
        }
    } catch (cacheError) {}

    if (error.message.includes("offline") || error.code === 'unavailable' || error.message.includes("Timeout")) {
        return null;
    }
    
    console.error("Critical Error fetching plan:", error);
    throw error;
  }
};

// Toggle Step
export const toggleStepCompletion = async (userId: string, stepName: string, isCompleted: boolean, projectId: string = 'current') => {
  try {
    const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId);
    
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
export const deleteProject = async (userId: string, projectId: string = 'current') => {
  try {
     const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId);
     await deleteDoc(planRef);
     return true;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};
