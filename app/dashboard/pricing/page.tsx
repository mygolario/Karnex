"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calculator, Loader2, Sparkles, Save, Trash2, Package,
} from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { inventoryApi } from "@/lib/inventory/api";
import type { Product } from "@/lib/inventory/types";
import { toPersianDigits } from "@/lib/utils";

const fmt = (n: number) => toPersianDigits(Math.round(n).toLocaleString("fa-IR"));

interface PriceDraft {
  id: string;
  productId: string | null;
  productName: string;
  cost: number;
  price: number;
  markupPct: number;
  marginPct: number;
  fixedCosts: number;
  breakEvenUnits: number;
  note: string;
  createdAt: string;
}

function calcFromCostMarkup(cost: number, markupPct: number) {
  const price = cost * (1 + markupPct / 100);
  const marginPct = price > 0 ? ((price - cost) / price) * 100 : 0;
  return { price, marginPct };
}

function calcFromCostPrice(cost: number, price: number) {
  const markupPct = cost > 0 ? ((price - cost) / cost) * 100 : 0;
  const marginPct = price > 0 ? ((price - cost) / price) * 100 : 0;
  return { markupPct, marginPct };
}

function breakEven(fixedCosts: number, price: number, cost: number) {
  const contribution = price - cost;
  if (contribution <= 0) return 0;
  return Math.ceil(fixedCosts / contribution);
}

export default function PricingPage() {
  const { activeProject: plan } = useProject();
  const projectId = plan?.id;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [drafts, setDrafts] = useState<PriceDraft[]>([]);

  const [productId, setProductId] = useState("");
  const [cost, setCost] = useState(0);
  const [markupPct, setMarkupPct] = useState(40);
  const [price, setPrice] = useState(0);
  const [fixedCosts, setFixedCosts] = useState(0);
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"markup" | "price">("markup");

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await inventoryApi.list(projectId);
      setProducts(data.products);
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری محصولات ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId]
  );

  useEffect(() => {
    if (!selected) return;
    setCost(selected.cost);
    if (mode === "markup") {
      const { price: p } = calcFromCostMarkup(selected.cost, markupPct);
      setPrice(Math.round(p));
    } else {
      setPrice(selected.price);
      const { markupPct: m } = calcFromCostPrice(selected.cost, selected.price);
      setMarkupPct(Math.round(m * 10) / 10);
    }
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const marginPct = useMemo(() => {
    if (price <= 0) return 0;
    return ((price - cost) / price) * 100;
  }, [price, cost]);

  const beUnits = useMemo(
    () => breakEven(fixedCosts, price, cost),
    [fixedCosts, price, cost]
  );

  if (plan?.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Calculator size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">ماشین‌حساب قیمت‌گذاری</h2>
          <p className="text-muted-foreground mb-4">این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت به داشبورد</Button></Link>
        </Card>
      </div>
    );
  }

  const onCostChange = (v: number) => {
    setCost(v);
    if (mode === "markup") {
      const { price: p } = calcFromCostMarkup(v, markupPct);
      setPrice(Math.round(p));
    }
  };

  const onMarkupChange = (v: number) => {
    setMarkupPct(v);
    setMode("markup");
    const { price: p } = calcFromCostMarkup(cost, v);
    setPrice(Math.round(p));
  };

  const onPriceChange = (v: number) => {
    setPrice(v);
    setMode("price");
    const { markupPct: m } = calcFromCostPrice(cost, v);
    setMarkupPct(Math.round(m * 10) / 10);
  };

  const selectProduct = (id: string) => {
    setProductId(id);
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setCost(p.cost);
    setPrice(p.price);
    const { markupPct: m } = calcFromCostPrice(p.cost, p.price);
    setMarkupPct(Math.round(m * 10) / 10);
    setMode("price");
  };

  const saveDraft = () => {
    const draft: PriceDraft = {
      id: `draft-${Date.now()}`,
      productId: productId || null,
      productName: selected?.name || "محصول سفارشی",
      cost,
      price,
      markupPct,
      marginPct,
      fixedCosts,
      breakEvenUnits: beUnits,
      note,
      createdAt: new Date().toISOString(),
    };
    setDrafts((prev) => [draft, ...prev]);
    toast.success("پیش‌نویس ذخیره شد (محلی)");
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const suggestPrice = async () => {
    setAiLoading(true);
    setAiSuggestion("");
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generic",
          prompt: `برای محصول «${selected?.name || "کالا"}» با هزینه خرید ${cost} تومان، قیمت فروش پیشنهادی، درصد مارک‌آپ و حاشیه سود مناسب بازار ایران را پیشنهاد بده.
هزینه‌های ثابت ماهانه تقریبی: ${fixedCosts} تومان.
قیمت فعلی محاسبه شده: ${price} تومان (مارک‌آپ ${markupPct}٪، حاشیه ${marginPct.toFixed(1)}٪).
پاسخ کوتاه، عملی و به فارسی باشد.`,
          activeProject: plan,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      setAiSuggestion(data.content || "");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در پیشنهاد AI");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">ماشین‌حساب قیمت‌گذاری</h1>
            <p className="text-muted-foreground">بر اساس هزینه، مارک‌آپ، حاشیه و نقطه سربه‌سر</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-lg">محاسبه قیمت</h3>

          {loading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">محصول از انبار</label>
                <select
                  className="input-premium w-full"
                  value={productId}
                  onChange={(e) => selectProduct(e.target.value)}
                >
                  <option value="">انتخاب یا دستی وارد کن…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — هزینه {fmt(p.cost)} / فروش {fmt(p.price)}
                    </option>
                  ))}
                </select>
                {products.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Package size={12} />
                    محصولی در انبار نیست — اعداد را دستی وارد کن یا از{" "}
                    <Link href="/dashboard/inventory" className="underline">موجودی</Link> اضافه کن.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">هزینه واحد (تومان)</label>
                  <input
                    type="number"
                    dir="ltr"
                    className="input-premium w-full"
                    value={cost}
                    onChange={(e) => onCostChange(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">هزینه ثابت ماهانه</label>
                  <input
                    type="number"
                    dir="ltr"
                    className="input-premium w-full"
                    value={fixedCosts}
                    onChange={(e) => setFixedCosts(parseInt(e.target.value) || 0)}
                    placeholder="اجاره و…"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">مارک‌آپ ٪</label>
                  <input
                    type="number"
                    dir="ltr"
                    className="input-premium w-full"
                    value={markupPct}
                    onChange={(e) => onMarkupChange(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">قیمت فروش (تومان)</label>
                  <input
                    type="number"
                    dir="ltr"
                    className="input-premium w-full"
                    value={price}
                    onChange={(e) => onPriceChange(parseInt(e.target.value) || 0)}
                  />
                </div>
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

              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 bg-muted/30">
                  <p className="text-lg font-bold">{fmt(price)} ت</p>
                  <p className="text-[10px] text-muted-foreground">قیمت فروش</p>
                </Card>
                <Card className="p-3 bg-muted/30">
                  <p className={`text-lg font-bold ${marginPct >= 30 ? "text-emerald-600" : marginPct > 0 ? "text-amber-600" : "text-red-600"}`}>
                    {toPersianDigits(marginPct.toFixed(1))}٪
                  </p>
                  <p className="text-[10px] text-muted-foreground">حاشیه سود</p>
                </Card>
                <Card className="p-3 bg-muted/30">
                  <p className="text-lg font-bold">{toPersianDigits(beUnits)}</p>
                  <p className="text-[10px] text-muted-foreground">سربه‌سر (واحد)</p>
                </Card>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={saveDraft} variant="outline" className="gap-2">
                  <Save size={16} /> ذخیره پیش‌نویس
                </Button>
                <Button
                  onClick={suggestPrice}
                  disabled={aiLoading}
                  className="gap-2 bg-gradient-to-r from-primary to-secondary"
                >
                  {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  پیشنهاد قیمت AI
                </Button>
              </div>

              {aiSuggestion && (
                <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                  {aiSuggestion}
                </div>
              )}
            </>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
            <h3 className="font-bold">پیش‌نویس‌های قیمت</h3>
            <Badge variant="secondary">{toPersianDigits(drafts.length)}</Badge>
          </div>
          {drafts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              پیش‌نویسی ذخیره نشده — محاسبات را اینجا نگه دار.
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[32rem] overflow-y-auto">
              {drafts.map((d) => (
                <div key={d.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold truncate">{d.productName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      هزینه {fmt(d.cost)} → فروش {fmt(d.price)} · مارک‌آپ{" "}
                      {toPersianDigits(d.markupPct.toFixed(0))}٪ · حاشیه{" "}
                      {toPersianDigits(d.marginPct.toFixed(0))}٪
                    </p>
                    {d.fixedCosts > 0 && (
                      <p className="text-xs text-muted-foreground">
                        سربه‌سر: {toPersianDigits(d.breakEvenUnits)} واحد
                      </p>
                    )}
                    {d.note && <p className="text-xs mt-1">{d.note}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 text-red-500 shrink-0"
                    onClick={() => removeDraft(d.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
