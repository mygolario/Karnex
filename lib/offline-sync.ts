import { toggleStepCompletion, savePlanToCloud } from "@/lib/db";

export interface SyncItem {
  userId: string;
  projectId: string;
  type: "toggle-step" | "update-project";
  stepName?: string;
  isCompleted?: boolean;
  updates?: any;
  timestamp: number;
}

const QUEUE_KEY = "karnex-offline-sync-queue";

export function getOfflineQueue(): SyncItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to read offline queue", e);
    return [];
  }
}

export function saveOfflineQueue(queue: SyncItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error("Failed to save offline queue", e);
  }
}

export function addToggleStepToQueue(userId: string, projectId: string, stepName: string, isCompleted: boolean) {
  const queue = getOfflineQueue();
  // Filter out any duplicate toggle-step for the same step to avoid redundant hits
  const filtered = queue.filter(item => !(item.type === "toggle-step" && item.projectId === projectId && item.stepName === stepName));
  const newItem: SyncItem = {
    userId,
    projectId,
    type: "toggle-step",
    stepName,
    isCompleted,
    timestamp: Date.now()
  };
  saveOfflineQueue([...filtered, newItem]);
}

export function addUpdateProjectToQueue(userId: string, projectId: string, updates: any) {
  const queue = getOfflineQueue();
  // For updates, we can merge updates if there is already a pending update-project for this project
  const existingIndex = queue.findIndex(item => item.type === "update-project" && item.projectId === projectId);
  if (existingIndex > -1) {
    const existing = queue[existingIndex];
    existing.updates = { ...existing.updates, ...updates };
    existing.timestamp = Date.now();
    saveOfflineQueue([...queue]);
  } else {
    const newItem: SyncItem = {
      userId,
      projectId,
      type: "update-project",
      updates,
      timestamp: Date.now()
    };
    saveOfflineQueue([...queue, newItem]);
  }
}

export async function replayOfflineQueue(): Promise<boolean> {
  if (typeof window === "undefined" || !navigator.onLine) return false;
  
  const queue = getOfflineQueue();
  if (queue.length === 0) return true;
  
  console.log(`🔄 Replaying ${queue.length} offline actions...`);
  const remaining: SyncItem[] = [];
  
  for (const item of queue) {
    try {
      if (item.type === "toggle-step" && item.stepName !== undefined && item.isCompleted !== undefined) {
        await toggleStepCompletion(item.userId, item.stepName, item.isCompleted, item.projectId);
      } else if (item.type === "update-project" && item.updates) {
        await savePlanToCloud(item.userId, item.updates, true, item.projectId);
      }
    } catch (err) {
      console.error(`Failed to replay sync action:`, item, err);
      remaining.push(item);
    }
  }
  
  saveOfflineQueue(remaining);
  return remaining.length === 0;
}
