"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InventoryItem } from "@/lib/db";
import { useInventory } from "./inventory-context";
import { Button } from "@/components/ui/button";
import { Package, X } from "lucide-react";
import { toast } from "sonner";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: InventoryItem;
}

export function AddItemModal({ isOpen, onClose, editItem }: AddItemModalProps) {
  const { addItem, updateItem } = useInventory();
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    sku: "",
    category: "",
    quantity: 0,
    minQuantity: 5,
    unitPrice: 0,
    supplier: "",
  });

  useEffect(() => {
    if (editItem) {
      setFormData(editItem);
    } else {
      setFormData({
        name: "",
        sku: "",
        category: "",
        quantity: 0,
        minQuantity: 5,
        unitPrice: 0,
        supplier: "",
      });
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.name || formData.quantity === undefined) {
      toast.error("نام کالا و موجودی الزامی است");
      return;
    }

    try {
      if (editItem) {
        await updateItem(editItem.id, formData);
      } else {
        await addItem(formData as any);
      }
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg shadow-2xl relative"
        >
          <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={onClose}>
            <X size={20} />
          </Button>

          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Package size={20} />
            </div>
            {editItem ? "ویرایش کالا" : "افزودن کالای جدید"}
          </h3>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">نام کالا *</label>
                <input
                  className="input-premium w-full bg-muted/30"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="مثال: قهوه ترک"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">کد کالا (SKU)</label>
                <input
                  className="input-premium w-full bg-muted/30"
                  value={formData.sku}
                  onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))}
                  placeholder="CF-001"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">دسته‌بندی</label>
                <input
                  className="input-premium w-full bg-muted/30"
                  value={formData.category}
                  onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                  placeholder="مواد اولیه"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">تامین‌کننده</label>
                <input
                  className="input-premium w-full bg-muted/30"
                  value={formData.supplier}
                  onChange={e => setFormData(p => ({ ...p, supplier: e.target.value }))}
                  placeholder="نام شرکت"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">موجودی فعلی *</label>
                <input
                  type="number"
                  className="input-premium w-full bg-muted/30 text-center font-mono text-lg"
                  value={formData.quantity}
                  onChange={e => setFormData(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))}
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">حداقل هشدار</label>
                <input
                  type="number"
                  className="input-premium w-full bg-muted/30 text-center font-mono text-lg"
                  value={formData.minQuantity}
                  onChange={e => setFormData(p => ({ ...p, minQuantity: parseInt(e.target.value) || 0 }))}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">قیمت خرید (تومان)</label>
              <input
                type="number"
                className="input-premium w-full bg-muted/30 text-left font-mono"
                value={formData.unitPrice}
                onChange={e => setFormData(p => ({ ...p, unitPrice: parseInt(e.target.value) || 0 }))}
                placeholder="450000"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 mt-2 border-t border-border">
            <Button variant="ghost" onClick={onClose} className="flex-1 rounded-xl h-12">
              انصراف
            </Button>
            <Button onClick={handleSubmit} className="flex-[2] rounded-xl h-12 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20">
              {editItem ? "ذخیره تغییرات" : "افزودن به انبار"}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
