"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package, Plus, Sparkles, Loader2, Edit3, Trash2, AlertTriangle,
  PackageX, TrendingDown, ArrowDownToLine, ArrowUpFromLine, Settings2, X,
} from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { inventoryApi } from "@/lib/inventory/api";
import type { Product, InventorySummary, StockTxType } from "@/lib/inventory/types";
import { toPersianDigits } from "@/lib/utils";

const fmt = (n: number) => toPersianDigits(Math.round(n).toLocaleString("fa-IR"));

export default function InventoryPage() {
  const { activeProject: plan } = useProject();
  const projectId = plan?.id;

  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [moveTarget, setMoveTarget] = useState<Product | null>(null);

  const [form, setForm] = useState({
    name: "", sku: "", category: "", unit: "عدد", cost: 0, price: 0, stock: 0, lowStockAt: 0,
  });
  const [move, setMove] = useState<{ type: StockTxType; qty: number; note: string }>({
    type: "in", qty: 0, note: "",
  });

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await inventoryApi.list(projectId);
      setProducts(data.products);
      setSummary(data.summary);
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری موجودی ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  if (plan?.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Package size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">مدیریت موجودی برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت به داشبورد</Button></Link>
        </Card>
      </div>
    );
  }

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", sku: "", category: "", unit: "عدد", cost: 0, price: 0, stock: 0, lowStockAt: 0 });
    setShowProductModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, sku: p.sku || "", category: p.category || "", unit: p.unit,
      cost: p.cost, price: p.price, stock: p.stock, lowStockAt: p.lowStockAt,
    });
    setShowProductModal(true);
  };

  const saveProduct = async () => {
    if (!projectId) return;
    if (!form.name.trim()) { toast.error("نام محصول الزامی است"); return; }
    setSaving(true);
    try {
      if (editing) {
        const { product } = await inventoryApi.update(projectId, editing.id, form);
        setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
        toast.success("محصول به‌روز شد");
      } else {
        const { product } = await inventoryApi.create(projectId, form);
        setProducts((prev) => [...prev, product]);
        toast.success("محصول اضافه شد");
      }
      setShowProductModal(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ذخیره محصول");
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (p: Product) => {
    if (!projectId) return;
    if (!confirm(`حذف «${p.name}»؟ این عمل قابل بازگشت نیست.`)) return;
    try {
      await inventoryApi.remove(projectId, p.id);
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      toast.success("محصول حذف شد");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در حذف");
    }
  };

  const submitMove = async () => {
    if (!projectId || !moveTarget) return;
    if (move.qty <= 0) { toast.error("مقدار باید بزرگ‌تر از صفر باشد"); return; }
    setSaving(true);
    try {
      const { product } = await inventoryApi.move(projectId, {
        productId: moveTarget.id, type: move.type, qty: move.qty, note: move.note,
      });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
      toast.success("موجودی به‌روز شد");
      setMoveTarget(null);
      setMove({ type: "in", qty: 0, note: "" });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ثبت حرکت");
    } finally {
      setSaving(false);
    }
  };

  const totalValue = products.reduce((a, p) => a + p.stock * p.cost, 0);
  const lowCount = products.filter((p) => p.lowStockAt > 0 && p.stock <= p.lowStockAt).length;
  const outCount = products.filter((p) => p.stock <= 0).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">مدیریت موجودی و انبار</h1>
            <p className="text-muted-foreground">کالاها، موجودی و هشدارهای کم‌موجودی</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-gradient-to-r from-primary to-secondary">
          <Plus size={18} /> افزودن محصول
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "تعداد کالاها", value: toPersianDigits(products.length), icon: Package, color: "text-blue-500" },
          { label: "ارزش انبار", value: `${fmt(totalValue)} ت`, icon: TrendingDown, color: "text-emerald-500" },
          { label: "کم‌موجودی", value: toPersianDigits(lowCount), icon: AlertTriangle, color: "text-amber-500" },
          { label: "ناموجود", value: toPersianDigits(outCount), icon: PackageX, color: "text-red-500" },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
          <h3 className="font-bold">لیست محصولات</h3>
          {summary && summary.lowStockCount > 0 && (
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 gap-1">
              <AlertTriangle size={12} /> {toPersianDigits(summary.lowStockCount)} هشدار موجودی
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={56} className="mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-bold mb-2">هنوز محصولی ثبت نشده</h3>
            <p className="text-muted-foreground mb-6">محصولاتت را اضافه کن تا موجودی و هزینه‌ها را مدیریت کنی.</p>
            <Button onClick={openAdd} className="gap-2 bg-gradient-to-r from-primary to-secondary">
              <Plus size={18} /> اولین محصول
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {products.map((p) => {
              const low = p.lowStockAt > 0 && p.stock <= p.lowStockAt && p.stock > 0;
              const out = p.stock <= 0;
              const margin = p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0;
              return (
                <div key={p.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-bold truncate">{p.name}</h4>
                        {p.category && <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>}
                        {out && <Badge variant="secondary" className="text-[10px] bg-red-500/10 text-red-600 gap-1"><PackageX size={10} /> ناموجود</Badge>}
                        {low && <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 gap-1"><AlertTriangle size={10} /> کم‌موجود</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span>موجودی: <b className="text-foreground">{toPersianDigits(p.stock)} {p.unit}</b></span>
                        <span>قیمت: <b className="text-foreground">{fmt(p.price)} ت</b></span>
                        <span>هزینه: <b className="text-foreground">{fmt(p.cost)} ت</b></span>
                        <span>حاشیه: <b className={margin >= 30 ? "text-emerald-600" : margin > 0 ? "text-amber-600" : "text-red-600"}>{toPersianDigits(margin.toFixed(0))}٪</b></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" className="gap-1 h-8" onClick={() => { setMoveTarget(p); setMove({ type: "in", qty: 0, note: "" }); }}>
                        <ArrowDownToLine size={14} /> ورود
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 h-8" onClick={() => { setMoveTarget(p); setMove({ type: "out", qty: 0, note: "" }); }}>
                        <ArrowUpFromLine size={14} /> خروج
                      </Button>
                      <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => openEdit(p)}><Edit3 size={14} /></Button>
                      <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-red-500" onClick={() => removeProduct(p)}><Trash2 size={14} /></Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Product modal */}
      <AnimatePresence>
        {showProductModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProductModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {editing ? <Settings2 size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
                  {editing ? "ویرایش محصول" : "محصول جدید"}
                </h3>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setShowProductModal(false)}><X size={16} /></Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">نام محصول *</label>
                  <input className="input-premium w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: قهوه اسپرسو ۲۵۰ گرم" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">دسته‌بندی</label>
                    <input className="input-premium w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="نوشیدنی" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">واحد</label>
                    <input className="input-premium w-full" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="عدد / کیلوگرم" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">قیمت فروش (تومان)</label>
                    <input type="number" dir="ltr" className="input-premium w-full" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">هزینه خرید (تومان)</label>
                    <input type="number" dir="ltr" className="input-premium w-full" value={form.cost} onChange={(e) => setForm({ ...form, cost: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">موجودی اولیه</label>
                    <input type="number" dir="ltr" className="input-premium w-full" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} disabled={!!editing} />
                    {editing && <p className="text-[10px] text-muted-foreground mt-1">برای تغییر موجودی از ورود/خروج استفاده کن.</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">حد هشدار موجودی</label>
                    <input type="number" dir="ltr" className="input-premium w-full" value={form.lowStockAt} onChange={(e) => setForm({ ...form, lowStockAt: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowProductModal(false)} className="flex-1">انصراف</Button>
                  <Button onClick={saveProduct} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} ذخیره
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock movement modal */}
      <AnimatePresence>
        {moveTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setMoveTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {move.type === "in" ? "ثبت ورود موجودی" : "ثبت خروج موجودی"} — {moveTarget.name}
                </h3>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setMoveTarget(null)}><X size={16} /></Button>
              </div>
              <div className="flex gap-2 mb-4">
                {(["in", "out", "adjust"] as StockTxType[]).map((t) => (
                  <Button key={t} variant={move.type === t ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setMove({ ...move, type: t })}>
                    {t === "in" ? "ورود" : t === "out" ? "خروج" : "تنظیم دستی"}
                  </Button>
                ))}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {move.type === "adjust" ? "موجودی جدید" : "مقدار"}
                  </label>
                  <input type="number" dir="ltr" className="input-premium w-full" value={move.qty} onChange={(e) => setMove({ ...move, qty: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">یادداشت (اختیاری)</label>
                  <input className="input-premium w-full" value={move.note} onChange={(e) => setMove({ ...move, note: e.target.value })} placeholder="مثال: خرید از تأمین‌کننده" />
                </div>
                <Button onClick={submitMove} disabled={saving} className="w-full bg-gradient-to-r from-primary to-secondary">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null} ثبت
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
