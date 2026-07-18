"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Plus, Loader2, ScanLine, X } from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { couponsApi } from "@/lib/coupons/api";
import type { Coupon } from "@/lib/coupons/types";
import { toPersianDigits } from "@/lib/utils";

const fmt = (n: number) => toPersianDigits(Math.round(n).toLocaleString("fa-IR"));

export default function CouponsPage() {
  const { activeProject: plan } = useProject();
  const projectId = plan?.id;
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountPct: 10,
    discountAmt: 0 as number | "",
    maxUses: 100 as number | "",
  });

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await couponsApi.list(projectId);
      setCoupons(data.coupons);
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری کوپن‌ها ناموفق بود");
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
          <Ticket size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">کوپن و QR برای کسب‌وکار سنتی</h2>
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
      await couponsApi.create(projectId, {
        code: form.code || undefined,
        discountPct: form.discountPct || null,
        discountAmt: form.discountAmt === "" ? null : Number(form.discountAmt) || null,
        maxUses: form.maxUses === "" ? null : Number(form.maxUses),
      });
      toast.success("کوپن ساخته شد");
      setShowModal(false);
      setForm({ code: "", discountPct: 10, discountAmt: 0, maxUses: 100 });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا");
    } finally {
      setSaving(false);
    }
  };

  const redeem = async () => {
    if (!projectId || !redeemCode.trim()) return;
    setRedeeming(true);
    try {
      await couponsApi.redeem(projectId, { code: redeemCode.trim() });
      toast.success("کوپن با موفقیت استفاده شد");
      setRedeemCode("");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا");
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">کوپن و QR</h1>
            <p className="text-sm text-muted-foreground">کد بزرگ برای نمایش / اسکن و شمارش استفاده</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus size={16} /> کوپن جدید
        </Button>
      </div>

      <Card className="p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <ScanLine className="w-5 h-5 text-muted-foreground shrink-0" />
        <input
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono tracking-widest uppercase"
          placeholder="کد کوپن برای استفاده"
          value={redeemCode}
          onChange={(e) => setRedeemCode(e.target.value)}
        />
        <Button onClick={redeem} disabled={redeeming || !redeemCode.trim()}>
          {redeeming ? <Loader2 className="animate-spin" size={16} /> : "اعمال کوپن"}
        </Button>
      </Card>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : coupons.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">هنوز کوپنی ساخته نشده است.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <Card key={c.id} className="p-5 space-y-4">
              <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center">
                <p className="text-xs text-muted-foreground mb-2">QR · کد کوپن</p>
                <p className="font-mono text-3xl font-black tracking-[0.2em] break-all">{c.code}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {c.discountPct != null && (
                  <Badge variant="secondary">{toPersianDigits(String(c.discountPct))}٪ تخفیف</Badge>
                )}
                {c.discountAmt != null && c.discountAmt > 0 && (
                  <Badge variant="secondary">{fmt(c.discountAmt)} تومان</Badge>
                )}
                <Badge variant={c.active ? "default" : "outline"}>
                  {c.active ? "فعال" : "غیرفعال"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                استفاده: {toPersianDigits(String(c.usedCount))}
                {c.maxUses != null ? ` / ${toPersianDigits(String(c.maxUses))}` : ""}
              </p>
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
            <h2 className="text-lg font-bold">کوپن جدید</h2>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono uppercase"
              placeholder="کد (خالی = خودکار)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="درصد تخفیف"
                value={form.discountPct}
                onChange={(e) => setForm({ ...form, discountPct: Number(e.target.value) })}
              />
              <input
                type="number"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="مبلغ تخفیف"
                value={form.discountAmt}
                onChange={(e) => setForm({ ...form, discountAmt: e.target.value === "" ? "" : Number(e.target.value) })}
              />
            </div>
            <input
              type="number"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="سقف استفاده"
              value={form.maxUses}
              onChange={(e) => setForm({ ...form, maxUses: e.target.value === "" ? "" : Number(e.target.value) })}
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
