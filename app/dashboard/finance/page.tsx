"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet, Plus, Loader2, Trash2, TrendingUp, TrendingDown,
  Sparkles, X, ArrowUpCircle, ArrowDownCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { financeApi } from "@/lib/finance/api";
import type { BusinessTransaction, BusinessTxType, PnLReport } from "@/lib/finance/types";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from "@/lib/finance/types";
import { toPersianDigits } from "@/lib/utils";

const fmt = (n: number) => toPersianDigits(Math.round(n).toLocaleString("fa-IR"));

export default function FinancePage() {
  const { activeProject: plan } = useProject();
  const projectId = plan?.id;

  const [transactions, setTransactions] = useState<BusinessTransaction[]>([]);
  const [pnl, setPnl] = useState<PnLReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiNarrative, setAiNarrative] = useState<{ summary?: string; anomalies?: string[]; tip?: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    type: "income" as BusinessTxType,
    category: DEFAULT_INCOME_CATEGORIES[0],
    amount: 0,
    note: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await financeApi.list(projectId);
      setTransactions(data.transactions);
      setPnl(data.pnl);
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری مالی ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  if (plan?.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Wallet size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">سود و زیان برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت به داشبورد</Button></Link>
        </Card>
      </div>
    );
  }

  const openAdd = (type: BusinessTxType = "income") => {
    setForm({
      type,
      category: type === "income" ? DEFAULT_INCOME_CATEGORIES[0] : DEFAULT_EXPENSE_CATEGORIES[0],
      amount: 0,
      note: "",
      date: new Date().toISOString().slice(0, 10),
    });
    setShowModal(true);
  };

  const saveTx = async () => {
    if (!projectId) return;
    if (!form.amount || form.amount <= 0) { toast.error("مبلغ باید بزرگ‌تر از صفر باشد"); return; }
    setSaving(true);
    try {
      await financeApi.create(projectId, {
        type: form.type,
        category: form.category,
        amount: form.amount,
        note: form.note || null,
        date: form.date,
      });
      toast.success("تراکنش ثبت شد");
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
    if (!confirm("حذف این تراکنش؟")) return;
    try {
      await financeApi.remove(projectId, tx.id);
      toast.success("حذف شد");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا");
    }
  };

  const runAiNarrative = async () => {
    if (!pnl) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pnl-narrative",
          pnl,
          activeProject: plan,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      setAiNarrative(data.narrative);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در تحلیل AI");
    } finally {
      setAiLoading(false);
    }
  };

  const categories = form.type === "income" ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">سود و زیان</h1>
            <p className="text-muted-foreground">
              {pnl ? `دوره: ${pnl.period.label}` : "درآمد، هزینه و حاشیه سود ماهانه"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={runAiNarrative} disabled={aiLoading || !pnl} className="gap-2">
            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            تحلیل AI
          </Button>
          <Button variant="outline" onClick={() => openAdd("expense")} className="gap-2">
            <ArrowDownCircle size={16} /> هزینه
          </Button>
          <Button onClick={() => openAdd("income")} className="gap-2 bg-gradient-to-r from-primary to-secondary">
            <Plus size={18} /> درآمد
          </Button>
        </div>
      </div>

      {pnl && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "درآمد ماه", value: fmt(pnl.totalIncome), icon: TrendingUp, color: "text-emerald-500" },
            { label: "هزینه‌ها", value: fmt(pnl.totalExpenses + pnl.totalCogs), icon: TrendingDown, color: "text-red-500" },
            { label: "سود ناخالص", value: fmt(pnl.grossProfit), icon: Wallet, color: "text-blue-500" },
            { label: "سود خالص", value: fmt(pnl.netProfit), icon: TrendingUp, color: pnl.netProfit >= 0 ? "text-emerald-600" : "text-red-600" },
          ].map((s, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${s.color}`}>
                  <s.icon size={20} />
                </div>
                <div>
                  <p className="text-lg font-bold">{s.value} <span className="text-xs font-normal text-muted-foreground">ت</span></p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {aiNarrative && (
        <Card className="p-5 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium text-sm">{aiNarrative.summary}</p>
              {aiNarrative.anomalies && aiNarrative.anomalies.length > 0 && (
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                  {aiNarrative.anomalies.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              )}
              {aiNarrative.tip && (
                <p className="text-xs text-primary font-medium">پیشنهاد: {aiNarrative.tip}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {pnl && pnl.trend.length > 0 && (
        <Card className="p-5">
          <h3 className="font-bold mb-4">روند ۶ ماهه</h3>
          <div className="flex items-end gap-2 h-32">
            {pnl.trend.map((t, i) => {
              const max = Math.max(...pnl.trend.map((x) => Math.max(x.income, x.expenses, 1)));
              const incomeH = Math.max(4, (t.income / max) * 100);
              const expenseH = Math.max(4, (t.expenses / max) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center gap-0.5 h-24">
                    <div className="w-2 rounded-t bg-emerald-500/80" style={{ height: `${incomeH}%` }} title={`درآمد: ${fmt(t.income)}`} />
                    <div className="w-2 rounded-t bg-red-500/70" style={{ height: `${expenseH}%` }} title={`هزینه: ${fmt(t.expenses)}`} />
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">{t.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> درآمد</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> هزینه</span>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="p-4 bg-muted/30 border-b border-border">
          <h3 className="font-bold">تراکنش‌های اخیر</h3>
        </div>
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet size={56} className="mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-bold mb-2">هنوز تراکنشی ثبت نشده</h3>
            <p className="text-muted-foreground mb-6">اولین درآمد یا هزینه را ثبت کن تا سود و زیان محاسبه شود.</p>
            <Button onClick={() => openAdd("income")} className="gap-2 bg-gradient-to-r from-primary to-secondary">
              <Plus size={18} /> ثبت درآمد
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.slice(0, 50).map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    tx.type === "income" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                  }`}>
                    {tx.type === "income" ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{tx.category}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {tx.type === "income" ? "درآمد" : tx.type === "cogs" ? "بهای تمام‌شده" : "هزینه"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {toPersianDigits(new Date(tx.date).toLocaleDateString("fa-IR"))}
                      {tx.note ? ` — ${tx.note}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-bold ${tx.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                    {tx.type === "income" ? "+" : "−"}{fmt(tx.amount)}
                  </span>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-red-500" onClick={() => removeTx(tx)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">ثبت تراکنش</h3>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setShowModal(false)}><X size={16} /></Button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  {(["income", "expense", "cogs"] as BusinessTxType[]).map((t) => (
                    <Button
                      key={t}
                      variant={form.type === t ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setForm({
                        ...form,
                        type: t,
                        category: t === "income" ? DEFAULT_INCOME_CATEGORIES[0] : DEFAULT_EXPENSE_CATEGORIES[0],
                      })}
                    >
                      {t === "income" ? "درآمد" : t === "cogs" ? "بهای تمام‌شده" : "هزینه"}
                    </Button>
                  ))}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">دسته‌بندی</label>
                  <select
                    className="input-premium w-full"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">مبلغ (تومان) *</label>
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
                <div>
                  <label className="text-sm font-medium mb-1 block">یادداشت</label>
                  <input
                    className="input-premium w-full"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="اختیاری"
                  />
                </div>
                <Button onClick={saveTx} disabled={saving} className="w-full bg-gradient-to-r from-primary to-secondary">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} ثبت
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
