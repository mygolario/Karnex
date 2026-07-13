"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone, Plus, Loader2, Trash2, Sparkles, X, Power,
} from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { promotionsApi } from "@/lib/promotions/api";
import type { Promotion, PromotionType } from "@/lib/promotions/types";
import { PROMOTION_TYPE_LABELS } from "@/lib/promotions/types";
import { toPersianDigits } from "@/lib/utils";

export default function PromotionsPage() {
  const { activeProject: plan } = useProject();
  const projectId = plan?.id;

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    type: "discount" as PromotionType,
    discountPct: 10,
    code: "",
    copy: "",
    active: true,
  });

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await promotionsApi.list(projectId);
      setPromotions(data.promotions);
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری کمپین‌ها ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  if (plan?.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Megaphone size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">تخفیف و کمپین برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت به داشبورد</Button></Link>
        </Card>
      </div>
    );
  }

  const openAdd = () => {
    setForm({
      title: "",
      type: "discount",
      discountPct: 10,
      code: "",
      copy: "",
      active: true,
    });
    setShowModal(true);
  };

  const generateCopy = async () => {
    if (!form.title.trim()) {
      toast.error("ابتدا عنوان کمپین را وارد کن");
      return;
    }
    setAiLoading(true);
    try {
      const typeLabel = PROMOTION_TYPE_LABELS[form.type];
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generic",
          prompt: `یک متن تبلیغاتی کوتاه و جذاب به فارسی برای کمپین «${form.title}» از نوع «${typeLabel}»${form.discountPct ? ` با ${form.discountPct}٪ تخفیف` : ""} بنویس. مناسب اینستاگرام و پیامک. حداکثر ۳ جمله.`,
          activeProject: plan,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      setForm((f) => ({ ...f, copy: data.content || f.copy }));
      toast.success("متن تبلیغاتی آماده شد");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در تولید متن");
    } finally {
      setAiLoading(false);
    }
  };

  const savePromo = async () => {
    if (!projectId) return;
    if (!form.title.trim()) {
      toast.error("عنوان کمپین الزامی است");
      return;
    }
    setSaving(true);
    try {
      await promotionsApi.create(projectId, {
        title: form.title,
        type: form.type,
        discountPct: form.type === "bogo" ? null : form.discountPct,
        code: form.code || null,
        copy: form.copy || null,
        active: form.active,
      });
      toast.success("کمپین ایجاد شد");
      setShowModal(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: Promotion) => {
    if (!projectId) return;
    try {
      const { promotion } = await promotionsApi.update(projectId, p.id, { active: !p.active });
      setPromotions((prev) => prev.map((x) => (x.id === promotion.id ? promotion : x)));
      toast.success(promotion.active ? "کمپین فعال شد" : "کمپین غیرفعال شد");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا");
    }
  };

  const removePromo = async (p: Promotion) => {
    if (!projectId) return;
    if (!confirm(`حذف «${p.title}»؟`)) return;
    try {
      await promotionsApi.remove(projectId, p.id);
      setPromotions((prev) => prev.filter((x) => x.id !== p.id));
      toast.success("حذف شد");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در حذف");
    }
  };

  const activeCount = promotions.filter((p) => p.active).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">تخفیف و کمپین</h1>
            <p className="text-muted-foreground">کمپین‌های تخفیف، فروش ویژه و یکی‌بخر‌یکی‌ببر</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-gradient-to-r from-primary to-secondary">
          <Plus size={18} /> کمپین جدید
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <Card className="p-4">
          <p className="text-xl font-bold">{toPersianDigits(promotions.length)}</p>
          <p className="text-xs text-muted-foreground">کل کمپین‌ها</p>
        </Card>
        <Card className="p-4">
          <p className="text-xl font-bold text-emerald-600">{toPersianDigits(activeCount)}</p>
          <p className="text-xs text-muted-foreground">فعال</p>
        </Card>
        <Card className="p-4">
          <p className="text-xl font-bold">{toPersianDigits(promotions.length - activeCount)}</p>
          <p className="text-xs text-muted-foreground">غیرفعال</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 bg-muted/30 border-b border-border">
          <h3 className="font-bold">لیست کمپین‌ها</h3>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="p-12 text-center">
            <Megaphone size={56} className="mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-bold mb-2">هنوز کمپینی نداری</h3>
            <p className="text-muted-foreground mb-6">اولین تخفیف یا فروش ویژه‌ات را بساز.</p>
            <Button onClick={openAdd} className="gap-2 bg-gradient-to-r from-primary to-secondary">
              <Plus size={18} /> ساخت کمپین
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {promotions.map((p) => (
              <div key={p.id} className="p-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-bold truncate">{p.title}</h4>
                      <Badge variant="secondary" className="text-[10px]">
                        {PROMOTION_TYPE_LABELS[p.type] || p.type}
                      </Badge>
                      {p.active ? (
                        <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">فعال</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">غیرفعال</Badge>
                      )}
                      {p.discountPct != null && (
                        <Badge variant="secondary" className="text-[10px]">
                          {toPersianDigits(p.discountPct)}٪
                        </Badge>
                      )}
                      {p.code && (
                        <Badge variant="outline" className="text-[10px] font-mono" dir="ltr">
                          {p.code}
                        </Badge>
                      )}
                    </div>
                    {p.copy && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{p.copy}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => toggleActive(p)}
                      title={p.active ? "غیرفعال کردن" : "فعال کردن"}
                    >
                      <Power size={14} className={p.active ? "text-emerald-500" : ""} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 text-red-500"
                      onClick={() => removePromo(p)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Plus size={20} className="text-primary" /> کمپین جدید
                </h3>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setShowModal(false)}>
                  <X size={16} />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">عنوان *</label>
                  <input
                    className="input-premium w-full"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="مثال: تخفیف آخر هفته"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">نوع</label>
                  <div className="flex gap-2 flex-wrap">
                    {(Object.keys(PROMOTION_TYPE_LABELS) as PromotionType[]).map((t) => (
                      <Button
                        key={t}
                        variant={form.type === t ? "default" : "outline"}
                        size="sm"
                        onClick={() => setForm({ ...form, type: t })}
                      >
                        {PROMOTION_TYPE_LABELS[t]}
                      </Button>
                    ))}
                  </div>
                </div>

                {form.type !== "bogo" && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">درصد تخفیف</label>
                    <input
                      type="number"
                      dir="ltr"
                      className="input-premium w-full"
                      value={form.discountPct}
                      onChange={(e) => setForm({ ...form, discountPct: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-1 block">کد تخفیف (اختیاری)</label>
                  <input
                    className="input-premium w-full"
                    dir="ltr"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="SUMMER20"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">متن تبلیغاتی</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 h-8"
                      onClick={generateCopy}
                      disabled={aiLoading}
                    >
                      {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      تولید با AI
                    </Button>
                  </div>
                  <textarea
                    className="input-premium w-full min-h-[100px]"
                    value={form.copy}
                    onChange={(e) => setForm({ ...form, copy: e.target.value })}
                    placeholder="متن کمپین برای شبکه‌های اجتماعی…"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                    انصراف
                  </Button>
                  <Button
                    onClick={savePromo}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-primary to-secondary"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} ذخیره
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
