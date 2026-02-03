"use client";

import { useState, useEffect } from "react";
import { useProject } from "@/contexts/project-context";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Store, Plus, Sparkles, QrCode, Image as ImageIcon, 
  Edit3, Trash2, Copy, ExternalLink, Loader2, Package,
  DollarSign, Tag, BarChart3, Eye, Share2, Download,
  CheckCircle2, AlertCircle, TrendingUp, Zap
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image?: string;
  stock: number;
  isActive: boolean;
  aiGenerated?: boolean;
}

interface StoreSettings {
  storeName: string;
  storeDescription: string;
  currency: string;
  theme: "light" | "dark" | "colorful";
  qrCode?: string;
}

const SAMPLE_CATEGORIES = [
  "غذا و نوشیدنی",
  "پوشاک",
  "لوازم خانگی",
  "خدمات",
  "لوازم التحریر",
  "سایر"
];

export default function StorefrontPage() {
  const { activeProject: plan } = useProject();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: plan?.projectName || "فروشگاه من",
    storeDescription: "",
    currency: "تومان",
    theme: "light"
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    category: SAMPLE_CATEGORIES[0],
    stock: 100,
    isActive: true
  });

  // Check project type
  if (plan?.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Store size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">فروشگاه‌ساز برای کسب‌وکار سنتی</h2>
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

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch("/api/ai/generate-products", {
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
        if (data.products) {
          setProducts(prev => [...prev, ...data.products.map((p: any, i: number) => ({
            ...p,
            id: `ai-${Date.now()}-${i}`,
            aiGenerated: true,
            isActive: true
          }))]);
          toast.success(`${data.products.length} محصول توسط دستیار کارنکس اضافه شد`);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در تولید محصولات");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error("نام و قیمت الزامی است");
      return;
    }

    const product: Product = {
      id: `prod-${Date.now()}`,
      name: newProduct.name || "",
      description: newProduct.description || "",
      price: newProduct.price || 0,
      category: newProduct.category || SAMPLE_CATEGORIES[0],
      stock: newProduct.stock || 100,
      isActive: true
    };

    setProducts(prev => [...prev, product]);
    setNewProduct({
      name: "",
      description: "",
      price: 0,
      category: SAMPLE_CATEGORIES[0],
      stock: 100,
      isActive: true
    });
    setIsAddingProduct(false);
    toast.success("محصول اضافه شد");
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success("محصول حذف شد");
  };

  const generateQRCode = () => {
    // Generate QR code URL (using a free API)
    const storeUrl = `https://karnex.ir/store/${user?.uid}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(storeUrl)}`;
    setStoreSettings(prev => ({ ...prev, qrCode: qrUrl }));
    setShowQRModal(true);
  };

  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const activeProducts = products.filter(p => p.isActive).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">فروشگاه‌ساز هوشمند</h1>
              <p className="text-muted-foreground">مدیریت محصولات و کاتالوگ دیجیتال</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={generateQRCode}
            className="gap-2"
          >
            <QrCode size={18} />
            QR کد فروشگاه
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsAddingProduct(true)}
            className="gap-2"
          >
            <Plus size={18} />
            افزودن محصول
          </Button>
          <Button
            onClick={handleGenerateAI}
            disabled={isGeneratingAI}
            className="gap-2 bg-gradient-to-r from-primary to-secondary"
          >
            {isGeneratingAI ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            تولید با دستیار کارنکس
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "کل محصولات", value: products.length, icon: Package, color: "text-blue-500" },
          { label: "محصولات فعال", value: activeProducts, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "ارزش موجودی", value: `${(totalValue / 1000000).toFixed(1)}M`, icon: DollarSign, color: "text-amber-500" },
          { label: "تولید AI", value: products.filter(p => p.aiGenerated).length, icon: Sparkles, color: "text-purple-500" },
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

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddingProduct(false)}
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
                افزودن محصول جدید
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">نام محصول *</label>
                  <input
                    className="input-premium w-full"
                    value={newProduct.name}
                    onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="مثال: پیتزا مخصوص"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">توضیحات</label>
                  <textarea
                    className="input-premium w-full min-h-[80px]"
                    value={newProduct.description}
                    onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="توضیحات محصول..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">قیمت (تومان) *</label>
                    <input
                      type="number"
                      className="input-premium w-full"
                      value={newProduct.price}
                      onChange={e => setNewProduct(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                      placeholder="50000"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">موجودی</label>
                    <input
                      type="number"
                      className="input-premium w-full"
                      value={newProduct.stock}
                      onChange={e => setNewProduct(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">دسته‌بندی</label>
                  <select
                    className="input-premium w-full"
                    value={newProduct.category}
                    onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {SAMPLE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddingProduct(false)} className="flex-1">
                    انصراف
                  </Button>
                  <Button onClick={handleAddProduct} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                    افزودن
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-6 text-center"
            >
              <h3 className="text-xl font-bold mb-4">QR کد فروشگاه شما</h3>
              {storeSettings.qrCode && (
                <img src={storeSettings.qrCode} alt="QR Code" className="mx-auto rounded-xl mb-4" />
              )}
              <p className="text-muted-foreground text-sm mb-4">
                این QR کد را در فروشگاه فیزیکی خود قرار دهید
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setShowQRModal(false)}>
                  بستن
                </Button>
                <Button className="gap-2">
                  <Download size={16} />
                  دانلود
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card className="p-12 text-center">
          <Package size={64} className="mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-xl font-bold mb-2">محصولی وجود ندارد</h3>
          <p className="text-muted-foreground mb-6">
            محصولات خود را اضافه کنید یا از دستیار کارنکس برای تولید خودکار استفاده کنید.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => setIsAddingProduct(true)} className="gap-2">
              <Plus size={18} />
              افزودن دستی
            </Button>
            <Button onClick={handleGenerateAI} disabled={isGeneratingAI} className="gap-2 bg-gradient-to-r from-primary to-secondary">
              <Sparkles size={18} />
              تولید با AI
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                {/* Image placeholder */}
                <div className="h-40 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
                  <Package size={40} className="text-muted-foreground/30" />
                  {product.aiGenerated && (
                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-primary to-secondary text-white gap-1">
                      <Sparkles size={12} />
                      AI
                    </Badge>
                  )}
                  {!product.isActive && (
                    <Badge variant="secondary" className="absolute top-2 left-2">
                      غیرفعال
                    </Badge>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-foreground">{product.name}</h4>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-primary">
                        {product.price.toLocaleString()} <span className="text-xs">تومان</span>
                      </p>
                    </div>
                  </div>

                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      موجودی: {product.stock}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                        <Edit3 size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-8 h-8 p-0 text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
