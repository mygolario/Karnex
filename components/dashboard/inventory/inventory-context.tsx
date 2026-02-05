"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { InventoryItem, saveOperations } from "@/lib/db";
import { toast } from "sonner";

interface InventoryContextType {
  items: InventoryItem[];
  loading: boolean;
  addItem: (item: Omit<InventoryItem, "id" | "lastRestock" | "status">) => Promise<void>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  restockItem: (id: string, amount: number) => Promise<void>;
  stats: {
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalItems: number;
  };
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.uid;
  const { activeProject, updateActiveProject } = useProject();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync with activeProject
  useEffect(() => {
    if (activeProject?.operations?.inventory) {
      setItems(activeProject.operations.inventory);
    } else {
      setItems([]);
    }
  }, [activeProject]);

  const calculateStatus = (qty: number, min: number): InventoryItem['status'] => {
    if (qty <= 0) return 'out';
    if (qty <= min) return 'low';
    return 'ok';
  };

  const persistItems = async (newItems: InventoryItem[]) => {
    if (!activeProject) return;
    setLoading(true);
    try {
      // 1. Optimistic Update
      setItems(newItems);
      
      // 2. DB Update via context helper or direct DB call
      if (userId) {
          await saveOperations(userId, 'inventory', newItems, activeProject.id);
      }
      
      updateActiveProject({
        operations: {
            ...activeProject.operations,
            inventory: newItems
        }
      });
    } catch (error) {
      console.error("Inventory Save Error", error);
      toast.error("خطا در ذخیره تغییرات");
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (newItem: Omit<InventoryItem, "id" | "lastRestock" | "status">) => {
    const item: InventoryItem = {
      ...newItem,
      id: `inv-${Date.now()}`,
      status: calculateStatus(newItem.quantity, newItem.minQuantity),
      lastRestock: new Date().toLocaleDateString("fa-IR"),
    };
    await persistItems([...items, item]);
    toast.success("کالای جدید اضافه شد");
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const merged = { ...item, ...updates };
        // Recalc status if qty changed
        if (updates.quantity !== undefined || updates.minQuantity !== undefined) {
            merged.status = calculateStatus(merged.quantity, merged.minQuantity);
        }
        return merged;
      }
      return item;
    });
    await persistItems(updatedItems);
    toast.success("کالا بروزرسانی شد");
  };

  const deleteItem = async (id: string) => {
    const updatedItems = items.filter(i => i.id !== id);
    await persistItems(updatedItems);
    toast.success("کالا حذف شد");
  };

  const restockItem = async (id: string, amount: number) => {
    const updatedItems = items.map(item => {
        if (item.id === id) {
            const newQty = item.quantity + amount;
            return {
                ...item,
                quantity: newQty,
                status: calculateStatus(newQty, item.minQuantity),
                lastRestock: new Date().toLocaleDateString("fa-IR")
            };
        }
        return item;
    });
    await persistItems(updatedItems);
    toast.success("موجودی بروز شد");
  };

  const stats = {
    totalValue: items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0),
    lowStockCount: items.filter(i => i.status === 'low').length,
    outOfStockCount: items.filter(i => i.status === 'out').length,
    totalItems: items.length
  };

  return (
    <InventoryContext.Provider value={{ items, loading, addItem, updateItem, deleteItem, restockItem, stats }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
