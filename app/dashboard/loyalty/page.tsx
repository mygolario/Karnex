"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Gift, Plus, Loader2, X, Sparkles, Coins, Minus, Users,
} from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { loyaltyApi } from "@/lib/loyalty/api";
import type { LoyaltyAccount, LoyaltySummary } from "@/lib/loyalty/types";
import { toPersianDigits } from "@/lib/utils";

const fmt = (n: number) => toPersianDigits(Math.round(n).toLocaleString("fa-IR"));

const TIER_LABEL: Record<string, string> = {
  bronze: "برنز",
  silver: "نقره",
  gold: "طلا",
};

const TIER_STYLE: Record<string, string> = {
  bronze: "bg-amber-700/10 text-amber-800",
  silver: "bg-slate-400/15 text-slate-600",
  gold: "bg-yellow-500/15 text-yellow-700",
};

export default function LoyaltyPage() {
  const { activeProject: plan } = useProject();
  const projectId = plan?.id;

  const [accounts, setAccounts] = useState<LoyaltyAccount[]>([]);
  const [summary, setSummary] = useState<LoyaltySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [pointsTarget, setPointsTarget] = useState<LoyaltyAccount | null>(null);
  const [pointsMode, setPointsMode] = useState<"add" | "redeem">("add");

  const [form, setForm] = useState({
    customerId: "",
    customerName: "",
    phone: "",
    points: 0,
  });
  const [pointsForm, setPointsForm] = useState({ amount: 0, reason: "" });

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await loyaltyApi.list(projectId);
      setAccounts(data.accounts);
      setSummary(data.summary);
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری باشگاه مشتریان ناموفق بود");
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
          <Gift size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">باشگاه مشتریان برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت به داشبورد</Button></Link>
        </Card>
      </div>
    );
  }

  const openAdd = () => {
    setForm({
      customerId: `c-${Date.now()}`,
      customerName: "",
      phone: "",
      points: 0,
    });
    setShowAccountModal(true);
  };

  const saveAccount = async () => {
    if (!projectId) return;
    if (!form.customerId.trim()) {
      toast.error("شناسه مشتری الزامی است");
      return;
    }
    setSaving(true);
    try {
      await loyaltyApi.create(projectId, {
        customerId: form.customerId.trim(),
        customerName: form.customerName || null,
        phone: form.phone || null,
        points: form.points || 0,
      });
      toast.success("عضو باشگاه اضافه شد");
      setShowAccountModal(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const openPoints = (account: LoyaltyAccount, mode: "add" | "redeem") => {
    setPointsTarget(account);
    setPointsMode(mode);
    setPointsForm({ amount: 0, reason: "" });
  };

  const submitPoints = async () => {
    if (!projectId || !pointsTarget) return;
    if (pointsForm.amount <= 0) {
      toast.error("مقدار امتیاز باید بزرگ‌تر از صفر باشد");
      return;
    }
    setSaving(true);
    try {
      const delta = pointsMode === "add" ? pointsForm.amount : -pointsForm.amount;
      await loyaltyApi.points(projectId, {
        accountId: pointsTarget.id,
        delta,
        reason: pointsForm.reason || null,
      });
      toast.success(pointsMode === "add" ? "امتیاز اضافه شد" : "امتیاز کسر شد");
      setPointsTarget(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ثبت امتیاز");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">باشگاه مشتریان</h1>
            <p className="text-muted-foreground">امتیاز وفاداری، سطوح و پاداش‌ها</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-gradient-to-r from-primary to-secondary">
          <Plus size={18} /> عضو جدید
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "اعضا", value: toPersianDigits(summary?.totalAccounts ?? accounts.length), icon: Users, color: "text-rose-500" },
          { label: "کل امتیازها", value: fmt(summary?.totalPoints ?? 0), icon: Coins, color: "text-amber-500" },
          ...(summary?.byTier.slice(0, 2).map((t) => ({
            label: `سطح ${TIER_LABEL[t.tier] || t.tier}`,
            value: toPersianDigits(t.count),
            icon: Gift,
            color: "text-pink-500",
          })) ?? [
            { label: "برنز", value: toPersianDigits(0), icon: Gift, color: "text-pink-500" },
            { label: "نقره", value: toPersianDigits(0), icon: Gift, color: "text-pink-500" },
          ]),
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
        <div className="p-4 bg-muted/30 border-b border-border">
          <h3 className="font-bold">اعضای باشگاه</h3>
        </div>
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-12 text-center">
            <Gift size={56} className="mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-bold mb-2">هنوز عضوی ثبت نشده</h3>
            <p className="text-muted-foreground mb-6">اولین مشتری وفادار را به باشگاه اضافه کن.</p>
            <Button onClick={openAdd} className="gap-2 bg-gradient-to-r from-primary to-secondary">
              <Plus size={18} /> عضو جدید
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {accounts.map((a) => {
              const tier = a.tier || "bronze";
              return (
                <div key={a.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-bold truncate">{a.customerName || a.customerId}</h4>
                        <Badge variant="secondary" className={`text-[10px] ${TIER_STYLE[tier] || ""}`}>
                          {TIER_LABEL[tier] || tier}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span>امتیاز: <b className="text-foreground">{fmt(a.points)}</b></span>
                        {a.phone && (
                          <span>تلفن: <b className="text-foreground" dir="ltr">{toPersianDigits(a.phone)}</b></span>
                        )}
                        <span className="font-mono text-[10px]" dir="ltr">{a.customerId}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 h-8 text-emerald-600"
                        onClick={() => openPoints(a, "add")}
                      >
                        <Plus size={14} /> امتیاز
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 h-8 text-amber-600"
                        onClick={() => openPoints(a, "redeem")}
                      >
                        <Minus size={14} /> مصرف
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <AnimatePresence>
        {showAccountModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAccountModal(false)}
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
                  <Plus size={20} className="text-primary" /> عضو جدید
                </h3>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setShowAccountModal(false)}>
                  <X size={16} />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">نام مشتری</label>
                  <input
                    className="input-premium w-full"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="مثال: مریم احمدی"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">شناسه مشتری *</label>
                    <input
                      dir="ltr"
                      className="input-premium w-full"
                      value={form.customerId}
                      onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">تلفن</label>
                    <input
                      dir="ltr"
                      className="input-premium w-full"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="09..."
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">امتیاز اولیه</label>
                  <input
                    type="number"
                    dir="ltr"
                    className="input-premium w-full"
                    value={form.points}
                    onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowAccountModal(false)} className="flex-1">
                    انصراف
                  </Button>
                  <Button onClick={saveAccount} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} ذخیره
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pointsTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPointsTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {pointsMode === "add" ? "افزودن امتیاز" : "مصرف امتیاز"} —{" "}
                  {pointsTarget.customerName || pointsTarget.customerId}
                </h3>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setPointsTarget(null)}>
                  <X size={16} />
                </Button>
              </div>
              <div className="flex gap-2 mb-4">
                <Button
                  variant={pointsMode === "add" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setPointsMode("add")}
                >
                  افزودن
                </Button>
                <Button
                  variant={pointsMode === "redeem" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setPointsMode("redeem")}
                >
                  مصرف
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">مقدار امتیاز</label>
                  <input
                    type="number"
                    dir="ltr"
                    className="input-premium w-full"
                    value={pointsForm.amount}
                    onChange={(e) => setPointsForm({ ...pointsForm, amount: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    موجودی فعلی: {fmt(pointsTarget.points)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">دلیل</label>
                  <input
                    className="input-premium w-full"
                    value={pointsForm.reason}
                    onChange={(e) => setPointsForm({ ...pointsForm, reason: e.target.value })}
                    placeholder="مثال: خرید امروز / پاداش تولد"
                  />
                </div>
                <Button onClick={submitPoints} disabled={saving} className="w-full bg-gradient-to-r from-primary to-secondary">
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
