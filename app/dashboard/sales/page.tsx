"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart, Plus, Loader2, Receipt, Banknote,
  CreditCard, ArrowLeftRight, X,
} from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { salesApi } from "@/lib/sales/api";
import { inventoryApi } from "@/lib/inventory/api";
import type { Order, DailyReport, PaymentMethod, OrderItemInput } from "@/lib/sales/types";
import type { Product } from "@/lib/inventory/types";
import { toPersianDigits } from "@/lib/utils";

const fmt = (n: number) => toPersianDigits(Math.round(n).toLocaleString("fa-IR"));

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "نقدی",
  card: "کارت",
  transfer: "انتقال",
};

const PAYMENT_ICONS = {
  cash: Banknote,
  card: CreditCard,
  transfer: ArrowLeftRight,
} as const;

interface CartLine extends OrderItemInput {
  key: string;
}

export default function SalesPage() {
  const { activeProject: plan } = useProject();
  const projectId = plan?.id;

  const [orders, setOrders] = useState<Order[]>([]);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [customerName, setCustomerName] = useState("");
  const [note, setNote] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(1);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [salesData, invData] = await Promise.all([
        salesApi.list(projectId),
        inventoryApi.list(projectId),
      ]);
      setOrders(salesData.orders);
      setReport(salesData.report);
      setProducts(invData.products);
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری فروش ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const cartTotal = useMemo(
    () => cart.reduce((s, i) => s + i.qty * i.unitPrice, 0),
    [cart]
  );

  if (plan?.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <ShoppingCart size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">صندوق فروش برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت به داشبورد</Button></Link>
        </Card>
      </div>
    );
  }

  const addToCart = () => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      toast.error("محصول را انتخاب کن");
      return;
    }
    if (qty <= 0) {
      toast.error("تعداد باید بزرگ‌تر از صفر باشد");
      return;
    }
    setCart((prev) => [
      ...prev,
      {
        key: `${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        qty,
        unitPrice: product.price,
      },
    ]);
    setQty(1);
  };

  const removeFromCart = (key: string) => {
    setCart((prev) => prev.filter((i) => i.key !== key));
  };

  const submitSale = async () => {
    if (!projectId) return;
    if (cart.length === 0) {
      toast.error("سبد فروش خالی است");
      return;
    }
    setSaving(true);
    try {
      await salesApi.create(projectId, {
        customerName: customerName || null,
        paymentMethod,
        note: note || null,
        items: cart.map(({ productId: pid, name, qty: q, unitPrice }) => ({
          productId: pid,
          name,
          qty: q,
          unitPrice,
        })),
        deductInventory: true,
      });
      toast.success("فروش ثبت شد");
      setCart([]);
      setCustomerName("");
      setNote("");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ثبت فروش");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">صندوق فروش</h1>
            <p className="text-muted-foreground">ثبت فروش سریع و گزارش روزانه (Z-Report)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "فروش امروز", value: `${fmt(report?.totalRevenue ?? 0)} ت`, icon: Receipt },
          { label: "تعداد فاکتور", value: toPersianDigits(report?.orderCount ?? 0), icon: ShoppingCart },
          { label: "میانگین فاکتور", value: `${fmt(report?.averageTicket ?? 0)} ت`, icon: Banknote },
          {
            label: "بیشترین روش پرداخت",
            value: report?.byPayment?.[0]
              ? PAYMENT_LABELS[report.byPayment[0].method as PaymentMethod] || report.byPayment[0].method
              : "—",
            icon: CreditCard,
          },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-sky-500">
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-lg font-bold truncate">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-lg">ثبت فروش جدید</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">محصول</label>
              <select
                className="input-premium w-full"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="">انتخاب محصول…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {fmt(p.price)} ت (موجودی: {toPersianDigits(p.stock)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">تعداد</label>
              <input
                type="number"
                dir="ltr"
                min={1}
                className="input-premium w-full"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <Button onClick={addToCart} variant="outline" className="gap-2 w-full sm:w-auto">
            <Plus size={16} /> افزودن به سبد
          </Button>

          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {cart.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">سبد خالی است</p>
            ) : (
              cart.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-3 p-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {toPersianDigits(item.qty)} × {fmt(item.unitPrice)} ت
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{fmt(item.qty * item.unitPrice)} ت</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 text-red-500"
                      onClick={() => removeFromCart(item.key)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">نام مشتری (اختیاری)</label>
              <input
                className="input-premium w-full"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="مهمان"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">یادداشت</label>
              <input
                className="input-premium w-full"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="اختیاری"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">روش پرداخت</label>
            <div className="flex gap-2">
              {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((m) => {
                const Icon = PAYMENT_ICONS[m];
                return (
                  <Button
                    key={m}
                    variant={paymentMethod === m ? "default" : "outline"}
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => setPaymentMethod(m)}
                  >
                    <Icon size={14} /> {PAYMENT_LABELS[m]}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-lg font-black">جمع: {fmt(cartTotal)} ت</span>
            <Button
              onClick={submitSale}
              disabled={saving || cart.length === 0}
              className="gap-2 bg-gradient-to-r from-primary to-secondary"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Receipt size={16} />}
              ثبت فروش
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
            <h3 className="font-bold">گزارش روزانه (Z-Report)</h3>
            {report && (
              <Badge variant="secondary">{toPersianDigits(report.date)}</Badge>
            )}
          </div>

          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {report?.byPayment && report.byPayment.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">تفکیک پرداخت</p>
                  <div className="space-y-2">
                    {report.byPayment.map((p) => (
                      <div key={p.method} className="flex justify-between text-sm">
                        <span>{PAYMENT_LABELS[p.method as PaymentMethod] || p.method}</span>
                        <span>
                          {toPersianDigits(p.count)} فاکتور — {fmt(p.total)} ت
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report?.topItems && report.topItems.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">پرفروش‌ها</p>
                  <div className="space-y-2">
                    {report.topItems.slice(0, 5).map((item) => (
                      <div key={item.name} className="flex justify-between text-sm">
                        <span className="truncate">{item.name}</span>
                        <span className="shrink-0">
                          {toPersianDigits(item.qty)} — {fmt(item.revenue)} ت
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2">آخرین فروش‌ها</p>
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">هنوز فروشی ثبت نشده</p>
                ) : (
                  <div className="divide-y divide-border rounded-xl border border-border overflow-hidden max-h-72 overflow-y-auto">
                    {orders.slice(0, 15).map((o) => (
                      <div key={o.id} className="p-3 flex justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {o.customerName || "مهمان"} — {fmt(o.total)} ت
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {o.paymentMethod
                              ? PAYMENT_LABELS[o.paymentMethod]
                              : "—"}{" "}
                            · {toPersianDigits(o.items.length)} آیتم
                          </p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          {toPersianDigits(new Date(o.createdAt).toLocaleTimeString("fa-IR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }))}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
