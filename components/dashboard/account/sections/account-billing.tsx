"use client";

import { useState, useEffect } from "react";
import { AccountSectionHeader, SettingsCard } from "@/components/dashboard/account/account-primitives";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreditCard, Crown, Clock, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getUserTransactions } from "@/lib/payment-actions";
import { useAuth } from "@/contexts/auth-context";
import type { AccountSectionProps } from "./section-props";
import type { TransactionItem } from "@/lib/account/api-types";

export function AccountBilling({ bundle, refresh }: AccountSectionProps) {
  const { user } = useAuth();
  const sub = bundle.subscription;
  const [txs, setTxs] = useState<TransactionItem[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setLoadingTx(true);
      getUserTransactions(user.id)
        .then((t) => setTxs(t as unknown as TransactionItem[]))
        .catch(() => {})
        .finally(() => setLoadingTx(false));
    }
  }, [user?.id]);

  const handleCancel = async () => {
    if (!confirm("اشتراک در پایان دوره لغو شود؟")) return;
    setCancelling(true);
    try {
      await fetch("/api/user/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      await refresh();
      toast.success("اشتراک در پایان دوره لغو خواهد شد");
    } catch {
      toast.error("خطا در لغو اشتراک");
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivate = async () => {
    try {
      await fetch("/api/user/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reactivate" }),
      });
      await refresh();
      toast.success("اشتراک فعال شد");
    } catch {
      toast.error("خطا");
    }
  };

  const planId = sub?.planId || "free";
  const endDate = sub?.endDate ? new Date(sub.endDate) : null;

  return (
    <div className="space-y-6">
      <AccountSectionHeader
        title="اشتراک و صورت‌حساب"
        subtitle="طرح فعال، تمدید، لغو و تاریخچه پرداخت‌ها."
        icon={CreditCard}
        accent="amber"
        action={<Link href="/pricing"><Button variant="outline"><Crown size={16} className="me-2" /> ارتقا طرح</Button></Link>}
      />

      {/* Current plan */}
      <Card variant="gradient">
        <div className="relative z-10 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-sm opacity-80 mb-1">طرح فعلی</div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black">
                  {planId === "free" ? "رایگان" : planId === "plus" ? "پلاس" : planId === "pro" ? "پرو" : "اولترا"}
                </span>
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold">
                  {sub?.status === "active" ? "فعال" : "غیرفعال"}
                </span>
              </div>
              {endDate && (
                <div className="text-sm opacity-80 mt-2 flex items-center gap-1.5">
                  <Clock size={14} />
                  {sub?.cancelAtPeriodEnd ? "لغو در پایان دوره: " : "تمدید در: "}
                  {endDate.toLocaleDateString("fa-IR")}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {sub?.cancelAtPeriodEnd ? (
                <Button variant="secondary" onClick={handleReactivate} className="bg-white/20 text-white hover:bg-white/30">
                  فعال‌سازی مجدد
                </Button>
              ) : planId !== "free" ? (
                <Button variant="secondary" onClick={handleCancel} disabled={cancelling} className="bg-white/20 text-white hover:bg-white/30">
                  {cancelling ? "..." : "لغو اشتراک"}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      {/* Transactions */}
      <SettingsCard title="تاریخچه تراکنش‌ها" icon={Clock} accent="amber">
        {loadingTx ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <RefreshCw className="animate-spin me-2" size={18} /> در حال بارگذاری...
          </div>
        ) : txs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Clock size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">هنوز تراکنشی ثبت نشده است.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {txs.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    tx.status === "completed" ? "bg-emerald-500/10 text-emerald-600" :
                    tx.status === "pending" ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"
                  }`}>
                    {tx.status === "completed" ? <CheckCircle2 size={16} /> : tx.status === "pending" ? <Clock size={16} /> : <AlertTriangle size={16} />}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{tx.description || "پرداخت اشتراک"}</div>
                    <div className="text-xs text-muted-foreground font-mono">{new Date(tx.createdAt).toLocaleDateString("fa-IR")}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-end">
                    <div className="font-bold text-sm">{new Intl.NumberFormat("fa-IR").format(tx.amount / 10)} تومان</div>
                    {tx.refId && <div className="text-xs text-muted-foreground font-mono">{tx.refId}</div>}
                  </div>
                  {tx.status === "completed" && (
                    <a href={`/payment/receipt/${tx.id}`} className="text-xs bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg transition-colors">
                      رسید
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsCard>
    </div>
  );
}
