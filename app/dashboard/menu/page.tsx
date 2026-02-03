"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, Plus, Sparkles, QrCode, Loader2, 
  Edit3, Trash2, Download, Eye, DollarSign, Flame,
  Star, TrendingUp, Coffee, Pizza, Utensils, 
  GripVertical, ChevronUp, ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isBestSeller?: boolean;
  isSpicy?: boolean;
  isNew?: boolean;
  aiSuggestion?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  items: MenuItem[];
}

const CATEGORY_ICONS: Record<string, any> = {
  "نوشیدنی": Coffee,
  "پیتزا": Pizza,
  "غذای اصلی": Utensils,
  "پیش‌غذا": Utensils,
  "دسر": Star,
};

export default function MenuPage() {
  const { activeProject: plan } = useProject();
  const [categories, setCategories] = useState<MenuCategory[]>([
    { id: "1", name: "غذای اصلی", icon: "🍽️", items: [] },
    { id: "2", name: "پیش‌غذا", icon: "🥗", items: [] },
    { id: "3", name: "نوشیدنی", icon: "☕", items: [] },
    { id: "4", name: "دسر", icon: "🍰", items: [] },
  ]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("1");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    price: 0,
    category: "1"
  });

  // Check project type
  if (plan?.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <ClipboardList size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">منو‌ساز برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">
            این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.
          </p>
          <Link href="/dashboard/overview">
            <Button>بازگشت به داشبورد</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleGenerateMenu = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch("/api/ai/generate-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: plan?.projectName,
          businessType: plan?.template,
          description: plan?.description
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
          toast.success("منو توسط دستیار کارنکس تولید شد");
        }
      } else {
        // Demo data for testing
        const demoCategories: MenuCategory[] = [
          {
            id: "1",
            name: "غذای اصلی",
            icon: "🍽️",
            items: [
              { id: "1-1", name: "چلوکباب کوبیده", description: "دو سیخ کباب کوبیده با برنج ایرانی", price: 185000, category: "1", isBestSeller: true },
              { id: "1-2", name: "جوجه کباب", description: "جوجه کباب با سس مخصوص", price: 165000, category: "1", aiSuggestion: "افزایش ۱۰٪ قیمت پیشنهاد می‌شود" },
              { id: "1-3", name: "کباب برگ", description: "کباب برگ گوسفندی با برنج", price: 245000, category: "1", isNew: true },
            ]
          },
          {
            id: "2",
            name: "پیش‌غذا",
            icon: "🥗",
            items: [
              { id: "2-1", name: "سالاد شیرازی", description: "خیار، گوجه، پیاز با آبلیمو", price: 45000, category: "2" },
              { id: "2-2", name: "ماست و خیار", description: "ماست محلی با نعنا", price: 35000, category: "2" },
            ]
          },
          {
            id: "3",
            name: "نوشیدنی",
            icon: "☕",
            items: [
              { id: "3-1", name: "دوغ محلی", description: "دوغ تازه با نعنا", price: 25000, category: "3", isBestSeller: true },
              { id: "3-2", name: "چای سنتی", description: "چای دو غزال با نبات", price: 15000, category: "3" },
            ]
          },
          {
            id: "4",
            name: "دسر",
            icon: "🍰",
            items: [
              { id: "4-1", name: "فالوده شیرازی", description: "فالوده با آبلیمو تازه", price: 55000, category: "4" },
            ]
          }
        ];
        setCategories(demoCategories);
        toast.success("منو نمونه توسط دستیار کارنکس تولید شد");
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در تولید منو");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) {
      toast.error("نام و قیمت الزامی است");
      return;
    }

    const item: MenuItem = {
      id: `item-${Date.now()}`,
      name: newItem.name || "",
      description: newItem.description || "",
      price: newItem.price || 0,
      category: newItem.category || "1"
    };

    setCategories(prev => prev.map(cat => 
      cat.id === item.category 
        ? { ...cat, items: [...cat.items, item] }
        : cat
    ));

    setNewItem({ name: "", description: "", price: 0, category: selectedCategory });
    setIsAddingItem(false);
    toast.success("آیتم اضافه شد");
  };

  const handleDeleteItem = (categoryId: string, itemId: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
        : cat
    ));
    toast.success("آیتم حذف شد");
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const avgPrice = totalItems > 0 
    ? categories.reduce((sum, cat) => sum + cat.items.reduce((s, i) => s + i.price, 0), 0) / totalItems 
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">منو/کاتالوگ هوشمند</h1>
              <p className="text-muted-foreground">طراحی منوی دیجیتال با پیشنهاد قیمت AI</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowPreview(true)} className="gap-2">
            <Eye size={18} />
            پیش‌نمایش
          </Button>
          <Button variant="outline" className="gap-2">
            <QrCode size={18} />
            QR کد منو
          </Button>
          <Button
            onClick={handleGenerateMenu}
            disabled={isGeneratingAI}
            className="gap-2 bg-gradient-to-r from-primary to-secondary"
          >
            {isGeneratingAI ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            تولید منو با AI
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "تعداد آیتم‌ها", value: totalItems, icon: ClipboardList, color: "text-blue-500" },
          { label: "دسته‌بندی‌ها", value: categories.length, icon: GripVertical, color: "text-emerald-500" },
          { label: "میانگین قیمت", value: `${Math.round(avgPrice / 1000)}K`, icon: DollarSign, color: "text-amber-500" },
          { label: "پرفروش‌ها", value: categories.reduce((s, c) => s + c.items.filter(i => i.isBestSeller).length, 0), icon: Flame, color: "text-red-500" },
        ].map((stat, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h3 className="font-bold">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.items.length} آیتم</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory(category.id);
                  setNewItem(prev => ({ ...prev, category: category.id }));
                  setIsAddingItem(true);
                }}
                className="gap-2"
              >
                <Plus size={16} />
                افزودن
              </Button>
            </div>

            {category.items.length > 0 ? (
              <div className="divide-y divide-border">
                {category.items.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold">{item.name}</h4>
                          {item.isBestSeller && (
                            <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 gap-1">
                              <Flame size={10} />
                              پرفروش
                            </Badge>
                          )}
                          {item.isNew && (
                            <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">
                              جدید
                            </Badge>
                          )}
                          {item.isSpicy && (
                            <span className="text-red-500">🌶️</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        {item.aiSuggestion && (
                          <div className="mt-2 px-2 py-1 bg-primary/5 border border-primary/20 rounded-lg inline-flex items-center gap-1">
                            <Sparkles size={12} className="text-primary" />
                            <span className="text-xs text-primary">{item.aiSuggestion}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-lg">
                          {item.price.toLocaleString()}
                          <span className="text-xs text-muted-foreground mr-1">تومان</span>
                        </p>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            <Edit3 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 text-red-500"
                            onClick={() => handleDeleteItem(category.id, item.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">هنوز آیتمی اضافه نشده</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {isAddingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddingItem(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus size={20} className="text-primary" />
                افزودن آیتم جدید
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">نام آیتم *</label>
                  <input
                    className="input-premium w-full"
                    value={newItem.name}
                    onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="مثال: چلوکباب کوبیده"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">توضیحات</label>
                  <textarea
                    className="input-premium w-full min-h-[60px]"
                    value={newItem.description}
                    onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="توضیحات آیتم..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">قیمت (تومان) *</label>
                    <input
                      type="number"
                      className="input-premium w-full"
                      value={newItem.price}
                      onChange={e => setNewItem(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">دسته‌بندی</label>
                    <select
                      className="input-premium w-full"
                      value={newItem.category}
                      onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddingItem(false)} className="flex-1">
                    انصراف
                  </Button>
                  <Button onClick={handleAddItem} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                    افزودن
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State for new users */}
      {totalItems === 0 && (
        <Card className="p-12 text-center mt-6">
          <ClipboardList size={64} className="mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-xl font-bold mb-2">منوی شما خالی است</h3>
          <p className="text-muted-foreground mb-6">
            با دستیار کارنکس یک منوی کامل و حرفه‌ای بسازید
          </p>
          <Button onClick={handleGenerateMenu} disabled={isGeneratingAI} className="gap-2 bg-gradient-to-r from-primary to-secondary">
            <Sparkles size={18} />
            تولید منو با دستیار کارنکس
          </Button>
        </Card>
      )}
    </div>
  );
}
