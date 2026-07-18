"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Plus, Loader2, Copy, X } from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { referralApi } from "@/lib/referral/api";
import type { Referral } from "@/lib/referral/types";
import { toPersianDigits } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  pending: "در انتظار",
  converted: "تبدیل‌شده",
  rewarded: "پاداش داده‌شده",
};

export default function ReferralPage() {
  const { activeProject: plan } = useProject();
  const projectId = plan?.id;
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ referrerName: "", rewardPoints: 50 });

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await referralApi.list(projectId);
      setReferrals(data.referrals);
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری معرفی‌ها ناموفق بود");
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
          <h2 className="text-xl font-bold mb-2">معرفی دوستان برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت به داشبورد</Button></Link>
        </Card>
      </div>
    );
  }

  const save = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      await referralApi.create(projectId, {
        referrerName: form.referrerName || null,
        rewardPoints: form.rewardPoints,
      });
      toast.success("کد معرفی ساخته شد");
      setShowModal(false);
      setForm({ referrerName: "", rewardPoints: 50 });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا");
    } finally {
      setSaving(false);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("کد کپی شد");
    } catch {
      toast.error("کپی ناموفق بود");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">برنامه معرفی</h1>
            <p className="text-sm text-muted-foreground">کدهای معرفی و پاداش امتیاز</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus size={16} /> کد جدید
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : referrals.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">هنوز کد معرفی‌ای ساخته نشده است.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {referrals.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <button
                    type="button"
                    onClick={() => copyCode(r.code)}
                    className="font-mono text-2xl font-bold tracking-widest flex items-center gap-2 hover:text-primary"
                  >
                    {toPersianDigits(r.code)}
                    <Copy size={16} className="text-muted-foreground" />
                  </button>
                  <p className="text-sm text-muted-foreground mt-2">
                    معرف: {r.referrerName || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    پاداش: {toPersianDigits(String(r.rewardPoints))} امتیاز
                  </p>
                </div>
                <Badge variant="secondary">{STATUS_LABELS[r.status] || r.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4 relative">
            <button type="button" className="absolute top-4 left-4" onClick={() => setShowModal(false)}>
              <X size={18} />
            </button>
            <h2 className="text-lg font-bold">کد معرفی جدید</h2>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="نام معرف (اختیاری)"
              value={form.referrerName}
              onChange={(e) => setForm({ ...form, referrerName: e.target.value })}
            />
            <input
              type="number"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="امتیاز پاداش"
              value={form.rewardPoints}
              onChange={(e) => setForm({ ...form, rewardPoints: Number(e.target.value) })}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>انصراف</Button>
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : "ساخت"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
