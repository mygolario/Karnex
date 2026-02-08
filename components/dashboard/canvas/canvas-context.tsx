"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useProject } from "@/contexts/project-context";
import { useAuth } from "@/contexts/auth-context";
import { savePlanToCloud, CanvasCard } from "@/lib/db";
import { toast } from "sonner";

// Define the shape of our canvas state
export type CanvasState = Record<string, CanvasCard[]>;

interface CanvasContextType {
  canvasState: CanvasState;
  setCanvasState: (state: CanvasState) => void;
  addCard: (sectionId: string, content?: string, color?: string) => void;
  updateCard: (sectionId: string, cardId: string, content: string) => void;
  deleteCard: (sectionId: string, cardId: string) => void;
  moveCard: (activeId: string, overId: string, activeSection: string, overSection: string) => void;
  saveCanvas: () => Promise<void>;
  autoFillCanvas: () => Promise<void>;
  isSaving: boolean;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) throw new Error("useCanvas must be used within a CanvasProvider");
  return context;
}

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return `card-${crypto.randomUUID()}`;
    }
    return `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const { activeProject: plan, updateActiveProject } = useProject();
  const { user } = useAuth();
  const [canvasState, setCanvasState] = useState<CanvasState>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize State
  useEffect(() => {
    if (!plan) return;
    
    let initialState: CanvasState = {};
    const isBrandCanvas = plan.projectType === 'creator';
    const sourceData = isBrandCanvas ? plan.brandCanvas : plan.leanCanvas;
    
    // Normalize data (handle legacy string format vs new array format)
    if (sourceData) {
        Object.keys(sourceData).forEach(key => {
            const content = (sourceData as any)[key];
            if (Array.isArray(content)) {
                initialState[key] = content;
            } else if (typeof content === 'string' && content) {
                // Legacy migration
                initialState[key] = [{ 
                    id: generateId(), 
                    content: content, 
                    color: 'blue' // Default color
                }];
            } else {
                initialState[key] = [];
            }
        });
    }
    
    setCanvasState(initialState);
  }, [plan?.id, plan?.projectType]);

  const saveCanvas = async (newState: CanvasState = canvasState) => {
      if (!plan || !user) return;
      setIsSaving(true);
      try {
          // Prepare update object
          const updateData: any = {};
          Object.keys(newState).forEach(key => {
              updateData[key] = newState[key];
          });

          const isBrand = plan.projectType === 'creator';
          const fieldName = isBrand ? 'brandCanvas' : 'leanCanvas';
          
          // 1. Update Project Context (Optimistic)
          updateActiveProject({ [fieldName]: updateData });

          // 2. Save to Cloud
          // For nested updates in Firestore, specific paths should be used ideally, 
          // but our db helper `savePlanToCloud` takes the whole object or merge.
          // We'll update the plan document.
          // Note: `savePlanToCloud` merges at top level. We need to construct the full update object.
          
          await savePlanToCloud(user.uid, { [fieldName]: updateData }, true, plan.id!);
          
      } catch (e) {
          console.error("Save failed", e);
          toast.error("خطا در ذخیره تغییرات");
      } finally {
          setIsSaving(false);
      }
  };

  // Debounced Save (Optional: Implement if instant save feels too heavy)
  // For now, we save on specific actions.

  const addCard = (sectionId: string, content: string = "", color: string = "blue") => {
      const newCard: CanvasCard = {
          id: generateId(),
          content,
          color: color as any
      };
      
      const newState = {
          ...canvasState,
          [sectionId]: [newCard, ...(canvasState[sectionId] || [])]
      };
      
      setCanvasState(newState);
      saveCanvas(newState);
  };

  const updateCard = (sectionId: string, cardId: string, content: string) => {
      const newState = {
          ...canvasState,
          [sectionId]: canvasState[sectionId]?.map(c => c.id === cardId ? {...c, content} : c) || []
      };
      setCanvasState(newState);
      // We might want to debounce this one if it's called on keystroke
      // For now assume it's called onBlur or manual save
      saveCanvas(newState);
  };

  const deleteCard = (sectionId: string, cardId: string) => {
      const newState = {
          ...canvasState,
          [sectionId]: canvasState[sectionId]?.filter(c => c.id !== cardId) || []
      };
      setCanvasState(newState);
      saveCanvas(newState);
  };

  const moveCard = (activeId: string, overId: string, activeSection: string, overSection: string) => {
      setCanvasState((prevState) => {
          const activeItems = [...(prevState[activeSection] || [])];
          const overItems = [...(prevState[overSection] || [])];

          // Check if we are moving within same section or different
          if (activeSection === overSection) {
              // Reorder
              const activeIndex = activeItems.findIndex(i => i.id === activeId);
              const overIndex = activeItems.findIndex(i => i.id === overId);
              
              if (activeIndex !== -1 && overIndex !== -1) {
                  const [movedItem] = activeItems.splice(activeIndex, 1);
                  activeItems.splice(overIndex, 0, movedItem);
                  const newState = { ...prevState, [activeSection]: activeItems };
                  saveCanvas(newState); // Auto save reorder
                  return newState;
              }
          } else {
              // Move to different section
              const activeIndex = activeItems.findIndex(i => i.id === activeId);
              if (activeIndex !== -1) {
                  const [movedItem] = activeItems.splice(activeIndex, 1);
                  // Update color to match new section if desirable? Or keep original?
                  // Let's keep original color for now, or update it:
                  // movedItem.color = sectionColors[overSection] || movedItem.color; 
                  
                  // Insert at end or at specific position? 
                  // If overId is a card, insert before it. If it's a section, insert at end/start.
                  // For simplicity in this function, we assume overId is section or card handled by caller.
                  // Simplification: Push to end of target list
                  overItems.push(movedItem);
                  
                  const newState = { 
                      ...prevState, 
                      [activeSection]: activeItems,
                      [overSection]: overItems 
                  };
                  saveCanvas(newState);
                  return newState;
              }
          }
          return prevState;
      });
  };

  const autoFillCanvas = async () => {
    if (!plan) return;
    setIsSaving(true); // Reuse saving state or add specific loading state

    try {
      if (plan.projectType !== 'creator') {
         const response = await fetch("/api/ai-generate", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
             action: 'generate-full-canvas',
             businessIdea: plan.overview || plan.description,
             projectName: plan.projectName
          }),
        });

        const data = await response.json();
        
        if (data.success && data.canvas) {
          const parsed = data.canvas;
          const newState: CanvasState = { ...canvasState };
          
          // BMC Keys
          const keys = ['keyPartners', 'keyActivities', 'keyResources', 'uniqueValue', 'customerRelations', 'channels', 'customerSegments', 'costStructure', 'revenueStream'];

          keys.forEach(key => {
            let content = parsed[key];
            if (typeof content === 'string') {
               content = content.split('\n').filter((l: string) => l.trim().length > 0).map((l: string) => l.replace(/^[•-]\s*/, ''));
            }
            const items = Array.isArray(content) ? content : [content];
            
            if (items.length > 0) {
                 newState[key] = items.filter(Boolean).map((text: string) => ({
                    id: generateId(), content: text, color: 'blue' // You might want dynamic colors? for now blue
                 }));
            }
          });

          setCanvasState(newState);
          await saveCanvas(newState);
          toast.success("بوم با موفقیت تکمیل شد");
        }
      } else {
         // Brand Canvas
         const prompt = `Generate personal brand canvas content for creator "${plan.projectName}" (${plan.overview}). 
         Return JSON object matching these keys: identity, promise, audience, contentStrategy, channels, monetization, resources, collaborators, investment.`;
         
         const response = await fetch("/api/ai-generate", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, systemPrompt: "Return ONLY valid JSON." }),
          });

          const data = await response.json();
          if (data.success && data.content) {
            const parsed = JSON.parse(data.content.replace(/```json|```/g, "").trim());
            const newState: CanvasState = { ...canvasState };
            
            const keys = ['identity', 'promise', 'audience', 'contentStrategy', 'channels', 'monetization', 'resources', 'collaborators', 'investment'];

            keys.forEach(key => {
              const items = Array.isArray(parsed[key]) ? parsed[key] : [parsed[key]];
              if (items && items.length) {
                newState[key] = items.filter(Boolean).map((text: string) => ({
                    id: generateId(), content: text, color: 'purple'
                }));
              }
            });

            setCanvasState(newState);
            await saveCanvas(newState);
            toast.success("بوم برند با موفقیت تکمیل شد");
          }
      }
    } catch (err) { 
        console.error(err); 
        toast.error("خطا در تولید خودکار");
    } finally { 
        setIsSaving(false); 
    }
  };

  return (
    <CanvasContext.Provider value={{
        canvasState,
        setCanvasState,
        addCard,
        updateCard,
        deleteCard,
        moveCard,
        saveCanvas,
        autoFillCanvas,
        isSaving
    }}>
      {children}
    </CanvasContext.Provider>
  );
}
