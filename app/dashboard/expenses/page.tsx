"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Receipt, Plus, Loader2, Trash2, TrendingDown, X, Sparkles, Repeat,
} from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { financeApi } from "@/lib/finance/api";
import type { BusinessTransaction, BusinessTxType } from "@/lib/finance/types";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/lib/finance/types";
import { toPersianDigits } from "@/lib/utils";

const fmt = (n: number) => toPersianDigits(Math.round(n).toLocaleString("fa-IR"));

function isExpenseLike(type: BusinessTxType) {
  return type === "expense" || type === "cogs";
}

function isRecurring(tx: BusinessTransaction) {
  const meta = tx.metadata;
  if (!meta || typeof meta !== "object") return false;
  return Boolean((meta as { recurring?: unknown }).recurring);
}

export default function ExpensesPage() {
  const { activeProject: plan } = useProject();
  const projectId = plan?.id;

  const [transactions, setTransactions] = useState<BusinessTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    type: "expense" as "expense" | "cogs",
    category: DEFAULT_EXPENSE_CATEGORIES[0],
    amount: 0,
    note: "",
    date: new Date().toISOString().slice(0, 10),
    recurring: false,
    recurringNote: "",
  });

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await financeApi.list(projectId);
      setTransactions(data.transactions.filter((t) => isExpenseLike(t.type)));
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری هزینه‌ها ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const expense = transactions.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0);
    const cogs = transactions.filter((t) => t.type === "cogs").reduce((a, t) => a + t.amount, 0);
    const recurring = transactions.filter(isRecurring).reduce((a, t) => a + t.amount, 0);
    return { expense, cogs, recurring, all: expense + cogs };
  }, [transactions]);

  if (plan?.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Receipt size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">مدیریت هزینه‌ها برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت به داشبورد</Button></Link>
        </Card>
      </div>
    );
  }

  const openAdd = () => {
    setForm({
      type: "expense",
      category: DEFAULT_EXPENSE_CATEGORIES[0],
      amount: 0,
      note: "",
      date: new Date().toISOString().slice(0, 10),
      recurring: false,
      recurringNote: "",
    });
    setShowModal(true);
  };

  const saveTx = async () => {
    if (!projectId) return;
    if (!form.amount || form.amount <= 0) {
      toast.error("مبلغ باید بزرگ‌تر از صفر باشد");
      return;
    }
    setSaving(true);
    try {
      const metadata =
        form.recurring
          ? {
              recurring: true,
              recurringNote: form.recurringNote.trim() || "هزینه تکراری",
            }
          : null;

      await financeApi.create(projectId, {
        type: form.type,
        category: form.category,
        amount: form.amount,
        note: form.note || null,
        date: form.date,
        metadata,
      });
      toast.success("هزینه ثبت شد");
      setShowModal(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ثبت");
    } finally {
      setSaving(false);
    }
  };

  const removeTx = async (tx: BusinessTransaction) => {
    if (!projectId) return;
    if (!confirm("حذف این هزینه؟")) return;
    try {
      await financeApi.remove(projectId, tx.id);
      toast.success("حذف شد");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">هزینه‌ها</h1>
            <p className="text-muted-foreground">هزینه عملیاتی، بهای تمام‌شده و هزینه‌های تکراری</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-gradient-to-r from-primary to-secondary">
          <Plus size={18} /> ثبت هزینه
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "کل هزینه‌ها", value: fmt(totals.all), icon: TrendingDown, color: "text-red-500" },
          { label: "هزینه عملیاتی", value: fmt(totals.expense), icon: Receipt, color: "text-rose-500" },
          { label: "بهای تمام‌شده", value: fmt(totals.cogs), icon: TrendingDown, color: "text-orange-500" },
          { label: "تکراری", value: fmt(totals.recurring), icon: Repeat, color: "text-amber-500" },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-lg font-bold">
                  {s.value} <span className="text-xs font-normal text-muted-foreground">ت</span>
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
          <h3 className="font-bold">لیست هزینه‌ها</h3>
          <Badge variant="secondary" className="text-[10px]">
            {toPersianDigits(transactions.length)} مورد
          </Badge>
        </div>
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt size={56} className="mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-bold mb-2">هنوز هزینه‌ای ثبت نشده</h3>
            <p className="text-muted-foreground mb-6">اجاره، قبوض و تأمین کالا را اینجا ثبت کن.</p>
            <Button onClick={openAdd} className="gap-2 bg-gradient-to-r from-primary to-secondary">
              <Plus size={18} /> اولین هزینه
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((tx) => {
              const recurring = isRecurring(tx);
              const recurringNote =
                recurring && tx.metadata && typeof tx.metadata === "object"
                  ? String((tx.metadata as { recurringNote?: string }).recurringNote || "")
                  : "";
              return (
                <div key={tx.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-bold truncate">{tx.category}</h4>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${
                            tx.type === "cogs"
                              ? "bg-orange-500/10 text-orange-600"
                              : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {tx.type === "cogs" ? "بهای تمام‌شده" : "هزینه"}
                        </Badge>
                        {recurring && (
                          <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-700 gap-1">
                            <Repeat size={10} /> تکراری
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span>
                          مبلغ: <b className="text-foreground">{fmt(tx.amount)} ت</b>
                        </span>
                        <span>
                          تاریخ:{" "}
                          <b className="text-foreground">
                            {toPersianDigits(
                              new Date(tx.date).toLocaleDateString("fa-IR")
                            )}
                          </b>
                        </span>
                        {tx.note && <span>{tx.note}</span>}
                        {recurringNote && (
                          <span className="text-amber-700">یادداشت تکراری: {recurringNote}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 text-red-500 shrink-0"
                      onClick={() => removeTx(tx)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
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
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Plus size={20} className="text-primary" /> ثبت هزینه
                </h3>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setShowModal(false)}>
                  <X size={16} />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={form.type === "expense" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setForm({ ...form, type: "expense" })}
                  >
                    هزینه عملیاتی
                  </Button>
                  <Button
                    variant={form.type === "cogs" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setForm({ ...form, type: "cogs", category: "تأمین کالا" })}
                  >
                    بهای تمام‌شده
                  </Button>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">دسته‌بندی</label>
                  <select
                    className="input-premium w-full"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {DEFAULT_EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">مبلغ (تومان)</label>
                    <input
                      type="number"
                      dir="ltr"
                      className="input-premium w-full"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">تاریخ</label>
                    <input
                      type="date"
                      dir="ltr"
                      className="input-premium w-full"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">یادداشت</label>
                  <input
                    className="input-premium w-full"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="اختیاری"
                  />
                </div>
                <div className="rounded-2xl border border-border p-3 space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.recurring}
                      onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
                    />
                    <Repeat size={14} className="text-amber-600" />
                    هزینه تکراری (ماهانه)
                  </label>
                  {form.recurring && (
                    <input
                      className="input-premium w-full"
                      value={form.recurringNote}
                      onChange={(e) => setForm({ ...form, recurringNote: e.target.value })}
                      placeholder="مثال: اجاره فروشگاه — هر ماه"
                    />
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                    انصراف
                  </Button>
                  <Button onClick={saveTx} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-secondary">
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
