"use client";

import { useState } from "react";
import { InventoryItem, saveOperations } from "@/lib/db";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Search, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

export function InventoryTracker() {
  const { user } = useAuth();
  const { activeProject: plan, updateActiveProject } = useProject();

  const [items, setItems] = useState<InventoryItem[]>(
    plan?.operations?.inventory || []
  );
  const [search, setSearch] = useState("");

  const addItem = () => {
    const newItem: InventoryItem = {
        id: uuidv4(),
        name: "محصول جدید",
        category: "عمومی",
        quantity: 0,
        minQuantity: 5,
        unitPrice: 0,
        status: 'out'
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof InventoryItem, value: any) => {
    const updatedItems = items.map(item => {
        if (item.id === id) {
            const updated = { ...item, [field]: value };
            // Auto-update status
            if (field === 'quantity' || field === 'minQuantity') {
                const qty = field === 'quantity' ? value : item.quantity;
                const min = field === 'minQuantity' ? value : item.minQuantity;
                updated.status = qty === 0 ? 'out' : qty <= min ? 'low' : 'ok';
            }
            return updated;
        }
        return item;
    });
    setItems(updatedItems);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleSave = async () => {
    if (!user || !plan) return;
    try {
        await saveOperations(user.uid, 'inventory', items, plan.id || 'current');
        updateActiveProject({ operations: { ...plan.operations, inventory: items } });
        toast.success("لیست انبار ذخیره شد");
    } catch (err) {
        toast.error("خطا در ذخیره سازی");
    }
  };

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));

  // Stats
  const lowStockCount = items.filter(i => i.status === 'low').length;
  const outStockCount = items.filter(i => i.status === 'out').length;

  return (
    <div className="space-y-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-6 rounded-3xl">
            <div>
                 <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                    <span className="text-orange-500">Inventory</span>
                    <span>مدیریت موجودی</span>
                </h2>
                <div className="flex gap-3 text-sm">
                    {lowStockCount > 0 && <span className="text-amber-500 font-bold">{lowStockCount} کالا رو به اتمام</span>}
                    {outStockCount > 0 && <span className="text-red-500 font-bold">{outStockCount} کالا ناموجود</span>}
                </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" onClick={addItem}><Plus size={16} className="ml-2"/> کالای جدید</Button>
                <Button onClick={handleSave}>ذخیره تغییرات</Button>
            </div>
        </div>

        <div className="relative">
            <Search className="absolute right-3 top-3 text-muted-foreground" size={20} />
            <Input 
                placeholder="جستجو در انبار..." 
                className="pl-4 pr-10 py-6 text-lg rounded-2xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
                <Card key={item.id} className="p-4 relative group overflow-hidden border-2 border-transparent hover:border-primary/5 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <Input 
                            value={item.name} 
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            className="font-bold w-2/3 border-none shadow-none px-0 text-lg focus-visible:ring-0"
                            placeholder="نام کالا"
                        />
                        <Badge variant={item.status === 'ok' ? 'success' : item.status === 'low' ? 'warning' : 'danger'} >
                            {item.status === 'ok' ? 'موجود' : item.status === 'low' ? 'کمبود' : 'ناموجود'}
                        </Badge>
                    </div>

                    <div className="space-y-3 bg-muted/40 p-3 rounded-xl">
                        <div className="flex justify-between items-center">
                            <label className="text-xs text-muted-foreground">تعداد موجود</label>
                            <Input 
                                type="number" 
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                className="w-20 h-8 text-center bg-background"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <label className="text-xs text-muted-foreground">حداقل موجودی</label>
                            <Input 
                                type="number" 
                                value={item.minQuantity}
                                onChange={(e) => updateItem(item.id, 'minQuantity', parseInt(e.target.value) || 0)}
                                className="w-20 h-8 text-center bg-background"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <label className="text-xs text-muted-foreground">قیمت (تومان)</label>
                            <Input 
                                type="number" 
                                value={item.unitPrice}
                                onChange={(e) => updateItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                                className="w-24 h-8 text-center bg-background"
                            />
                        </div>
                    </div>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeItem(item.id)}
                        className="absolute bottom-2 left-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={16} />
                    </Button>
                </Card>
            ))}

            {items.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground gap-4 border-2 border-dashed rounded-3xl">
                    <Package size={48} className="opacity-20" />
                    <p>هنوز کالایی ثبت نشده است.</p>
                    <Button variant="link" onClick={addItem}>ثبت اولین کالا</Button>
                </div>
            )}
        </div>
    </div>
  );
}
