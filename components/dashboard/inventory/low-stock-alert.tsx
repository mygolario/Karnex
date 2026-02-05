"use client";

import { useInventory } from "./inventory-context";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function LowStockAlert() {
  const { items, restockItem } = useInventory();
  const [activeSuggestion, setActiveSuggestion] = useState<any>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    // Find first low stock item that hasn't been dismissed
    const alertItem = items.find(i => 
       (i.status === 'low' || i.status === 'out') && 
       !dismissedIds.includes(i.id)
    );
    setActiveSuggestion(alertItem || null);
  }, [items, dismissedIds]);

  if (!activeSuggestion) return null;

  const handleRestock = async () => {
    const amount = activeSuggestion.minQuantity * 3; // Simple heuristic
    await restockItem(activeSuggestion.id, amount);
    toast.success(`سفارش مجدد برای ${activeSuggestion.name} ثبت شد (شبیه‌سازی)`);
  };

  const handleDismiss = () => {
      setDismissedIds(prev => [...prev, activeSuggestion.id]);
  };

  return (
    <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-blue-500/20"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Sparkles className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">دستیار هوشمند انبار</h3>
                <p className="text-blue-100 text-sm max-w-lg leading-relaxed">
                   موجودی <strong className="text-white underline decoration-wavy decoration-blue-300 underline-offset-4">{activeSuggestion.name}</strong> 
                   {activeSuggestion.status === 'out' ? ' تمام شده است!' : ' رو به اتمام است.'}
                   &nbsp;آیا مایل به ثبت سفارش مجدد هستید؟
                </p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <Button 
                 variant="ghost" 
                 size="sm"
                 className="text-white/70 hover:text-white hover:bg-white/10"
                 onClick={handleDismiss}
               >
                 فعلاً نه
               </Button>
               <Button 
                 className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg font-bold rounded-xl"
                 onClick={handleRestock}
               >
                 ثبت سفارش خودکار
               </Button>
            </div>
          </div>
          
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none" />
        </motion.div>
    </AnimatePresence>
  );
}
