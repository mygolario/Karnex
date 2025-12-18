import { 
  doc, 
  setDoc, 
  getDoc, 
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
  try {
    const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', 'current');
    const docSnap = await getDoc(planRef);

    if (docSnap.exists()) {
      return docSnap.data() as BusinessPlan;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching plan:", error);
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
