"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star, Plus, Loader2, Sparkles, X, MessageSquare, Reply,
} from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { reviewsApi } from "@/lib/reviews/api";
import type { Review, ReviewSummary } from "@/lib/reviews/types";
import { REVIEW_SOURCE_LABELS } from "@/lib/reviews/types";
import { toPersianDigits } from "@/lib/utils";

export default function ReviewsPage() {
  const { activeProject: plan } = useProject();
  const projectId = plan?.id;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");

  const [form, setForm] = useState({
    author: "",
    rating: 5,
    body: "",
    source: "direct",
  });

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await reviewsApi.list(projectId);
      setReviews(data.reviews);
      setSummary(data.summary);
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری نظرات ناموفق بود");
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
          <Star size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">نظرات مشتریان برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت به داشبورد</Button></Link>
        </Card>
      </div>
    );
  }

  const openAdd = () => {
    setForm({ author: "", rating: 5, body: "", source: "direct" });
    setShowModal(true);
  };

  const saveReview = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      await reviewsApi.create(projectId, {
        author: form.author || null,
        rating: form.rating,
        body: form.body || null,
        source: form.source,
      });
      toast.success("نظر ثبت شد");
      setShowModal(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ثبت");
    } finally {
      setSaving(false);
    }
  };

  const openReply = (r: Review) => {
    setReplyTarget(r);
    setReplyText(r.reply || "");
  };

  const generateReply = async () => {
    if (!replyTarget) return;
    setAiLoading(replyTarget.id);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generic",
          prompt: `یک پاسخ حرفه‌ای، مودب و کوتاه به فارسی برای این نظر مشتری بنویس.
امتیاز: ${replyTarget.rating} از ۵
نویسنده: ${replyTarget.author || "ناشناس"}
متن نظر: ${replyTarget.body || "(بدون متن)"}
اگر نظر منفی است همدردی کن و دعوت به تماس کن. اگر مثبت است تشکر کن.`,
          activeProject: plan,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      setReplyText(data.content || "");
      toast.success("پاسخ پیشنهادی آماده شد");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در تولید پاسخ");
    } finally {
      setAiLoading(null);
    }
  };

  const saveReply = async () => {
    if (!projectId || !replyTarget) return;
    if (!replyText.trim()) {
      toast.error("متن پاسخ خالی است");
      return;
    }
    setSaving(true);
    try {
      const { review } = await reviewsApi.reply(projectId, replyTarget.id, replyText);
      setReviews((prev) => prev.map((r) => (r.id === review.id ? review : r)));
      toast.success("پاسخ ذخیره شد");
      setReplyTarget(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا");
    } finally {
      setSaving(false);
    }
  };

  const stars = (n: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}
      />
    ));

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">نظرات مشتریان</h1>
            <p className="text-muted-foreground">امتیازها، بازخورد و پاسخ‌های سریع</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-gradient-to-r from-primary to-secondary">
          <Plus size={18} /> ثبت نظر
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4">
          <p className="text-xl font-bold">{toPersianDigits((summary?.average ?? 0).toFixed(1))}</p>
          <p className="text-xs text-muted-foreground">میانگین امتیاز</p>
        </Card>
        <Card className="p-4">
          <p className="text-xl font-bold">{toPersianDigits(summary?.count ?? 0)}</p>
          <p className="text-xs text-muted-foreground">تعداد نظرات</p>
        </Card>
        <Card className="p-4">
          <p className="text-xl font-bold text-amber-600">{toPersianDigits(summary?.unreplied ?? 0)}</p>
          <p className="text-xs text-muted-foreground">بدون پاسخ</p>
        </Card>
        <Card className="p-4 space-y-1">
          {(summary?.distribution ?? []).map((d) => (
            <div key={d.rating} className="flex items-center gap-2 text-xs">
              <span className="w-4">{toPersianDigits(d.rating)}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{
                    width: summary && summary.count > 0
                      ? `${(d.count / summary.count) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <span className="w-4 text-muted-foreground">{toPersianDigits(d.count)}</span>
            </div>
          ))}
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 bg-muted/30 border-b border-border">
          <h3 className="font-bold">لیست نظرات</h3>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare size={56} className="mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-bold mb-2">هنوز نظری ثبت نشده</h3>
            <p className="text-muted-foreground mb-6">نظرات مشتریان را اینجا جمع کن و پاسخ بده.</p>
            <Button onClick={openAdd} className="gap-2 bg-gradient-to-r from-primary to-secondary">
              <Plus size={18} /> اولین نظر
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-bold">{r.author || "ناشناس"}</h4>
                      <div className="flex">{stars(r.rating)}</div>
                      {r.source && (
                        <Badge variant="secondary" className="text-[10px]">
                          {REVIEW_SOURCE_LABELS[r.source] || r.source}
                        </Badge>
                      )}
                      {!r.reply && (
                        <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600">
                          بدون پاسخ
                        </Badge>
                      )}
                    </div>
                    {r.body && <p className="text-sm text-muted-foreground mb-2">{r.body}</p>}
                    {r.reply && (
                      <div className="rounded-xl bg-muted/40 p-3 text-sm border border-border">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Reply size={12} /> پاسخ شما
                        </p>
                        {r.reply}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="gap-1 shrink-0" onClick={() => openReply(r)}>
                    <Reply size={14} /> {r.reply ? "ویرایش پاسخ" : "پاسخ"}
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
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">ثبت نظر جدید</h3>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setShowModal(false)}>
                  <X size={16} />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">نام نویسنده</label>
                  <input
                    className="input-premium w-full"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="اختیاری"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">امتیاز</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm({ ...form, rating: n })}
                        className="p-1"
                      >
                        <Star
                          size={24}
                          className={
                            n <= form.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">منبع</label>
                  <select
                    className="input-premium w-full"
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                  >
                    {Object.entries(REVIEW_SOURCE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">متن نظر</label>
                  <textarea
                    className="input-premium w-full min-h-[80px]"
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">انصراف</Button>
                  <Button onClick={saveReview} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : null} ذخیره
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {replyTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setReplyTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">پاسخ به {replyTarget.author || "ناشناس"}</h3>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setReplyTarget(null)}>
                  <X size={16} />
                </Button>
              </div>
              {replyTarget.body && (
                <p className="text-sm text-muted-foreground mb-3 p-3 rounded-xl bg-muted/40">{replyTarget.body}</p>
              )}
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">متن پاسخ</label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 h-8"
                  onClick={generateReply}
                  disabled={aiLoading === replyTarget.id}
                >
                  {aiLoading === replyTarget.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  پیشنهاد AI
                </Button>
              </div>
              <textarea
                className="input-premium w-full min-h-[120px] mb-4"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <Button onClick={saveReply} disabled={saving} className="w-full bg-gradient-to-r from-primary to-secondary">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Reply size={16} />} ذخیره پاسخ
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
