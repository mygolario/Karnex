"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Plus, Loader2, Send, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { broadcastApi } from "@/lib/broadcast/api";
import type { BroadcastChannel, BroadcastMessage } from "@/lib/broadcast/types";
import { toPersianDigits } from "@/lib/utils";

const CHANNEL_LABELS: Record<BroadcastChannel, string> = {
  sms: "پیامک",
  whatsapp: "واتساپ",
  telegram: "تلگرام",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "پیش‌نویس",
  scheduled: "زمان‌بندی‌شده",
  sent: "ارسال‌شده",
};

export default function BroadcastPage() {
  const { activeProject: plan } = useProject();
  const projectId = plan?.id;
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [smsConfigured, setSmsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    channel: "sms" as BroadcastChannel,
    sendNow: false,
  });

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await broadcastApi.list(projectId);
      setBroadcasts(data.broadcasts);
      setSmsConfigured(data.smsProviderConfigured);
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری پیام‌ها ناموفق بود");
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
          <h2 className="text-xl font-bold mb-2">پیام گروهی برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت به داشبورد</Button></Link>
        </Card>
      </div>
    );
  }

  const save = async () => {
    if (!projectId) return;
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("عنوان و متن الزامی است");
      return;
    }
    setSaving(true);
    try {
      await broadcastApi.create(projectId, {
        title: form.title,
        body: form.body,
        channel: form.channel,
        status: form.sendNow ? "sent" : "draft",
      });
      toast.success(form.sendNow ? "پیام به‌صورت محلی ثبت و ارسال‌شده علامت خورد" : "پیش‌نویس ذخیره شد");
      setShowModal(false);
      setForm({ title: "", body: "", channel: "sms", sendNow: false });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">پیام گروهی</h1>
            <p className="text-sm text-muted-foreground">SMS / واتساپ / تلگرام — بدون اتصال اجباری به پنل پیامک</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus size={16} /> پیام جدید
        </Button>
      </div>

      {!smsConfigured && (
        <Card className="p-4 flex gap-3 items-start border-amber-500/30 bg-amber-500/5">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">ارائه‌دهنده SMS اختیاری است</p>
            <p className="text-muted-foreground mt-1">
              فعلاً پیام‌ها فقط محلی ذخیره می‌شوند. با علامت «ارسال‌شده»، تعداد گیرندگان از لیست مشتریان پروژه محاسبه می‌شود؛ ارسال واقعی انجام نمی‌شود.
            </p>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : broadcasts.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">هنوز پیامی ثبت نشده است.</Card>
      ) : (
        <div className="space-y-3">
          {broadcasts.map((b) => (
            <Card key={b.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold">{b.title}</h3>
                    <Badge variant="secondary">{CHANNEL_LABELS[b.channel]}</Badge>
                    <Badge variant={b.status === "sent" ? "default" : "outline"}>
                      {STATUS_LABELS[b.status] || b.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">{b.body}</p>
                </div>
                <div className="text-xs text-muted-foreground text-left shrink-0">
                  {b.status === "sent" && (
                    <p className="flex items-center gap-1 mb-1">
                      <Send size={12} /> {toPersianDigits(String(b.recipientCount))} گیرنده
                    </p>
                  )}
                  <p>{new Date(b.createdAt).toLocaleDateString("fa-IR")}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg p-6 space-y-4 relative">
            <button type="button" className="absolute top-4 left-4" onClick={() => setShowModal(false)}>
              <X size={18} />
            </button>
            <h2 className="text-lg font-bold">پیام جدید</h2>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="عنوان"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[120px]"
              placeholder="متن پیام"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value as BroadcastChannel })}
            >
              <option value="sms">پیامک</option>
              <option value="whatsapp">واتساپ</option>
              <option value="telegram">تلگرام</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.sendNow}
                onChange={(e) => setForm({ ...form, sendNow: e.target.checked })}
              />
              علامت به‌عنوان ارسال‌شده (محلی — بدون SMS واقعی)
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>انصراف</Button>
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : "ذخیره"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
