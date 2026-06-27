"use client";

import { useState, useEffect } from "react";
import { AccountSectionHeader, SettingsCard } from "@/components/dashboard/account/account-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Brain, Target, Zap, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { AccountSectionProps } from "./section-props";
import type { CopilotUsageTotals } from "@/lib/account/api-types";

const TONES = [
  { id: "formal", label: "رسمی" },
  { id: "balanced", label: "متعادل" },
  { id: "casual", label: "صمیمی" },
];
const LEVELS = [
  { id: "beginner", label: "مبتدی" },
  { id: "intermediate", label: "متوسط" },
  { id: "expert", label: "حرفه‌ای" },
];
const STAGES = [
  { id: "idea", label: "ایده" },
  { id: "validation", label: "اعتبارسنجی" },
  { id: "mvp", label: "MVP" },
  { id: "launch", label: "راه‌اندازی" },
  { id: "growth", label: "رشد" },
];
const GOAL_OPTIONS = [
  "رشد مخاطب", "جذب سرمایه", "یافتن اسپانسور", "اعتبارسنجی ایده",
  "ساخت MVP", "بازاریابی", "فروش بیشتر", "محتوا‌سازی منظم",
];

export function AccountAI({ bundle, refresh }: AccountSectionProps) {
  const cp = bundle.copilotProfile || {};
  const [form, setForm] = useState({
    role: cp.role || "",
    industry: cp.industry || "",
    businessStage: cp.businessStage || "idea",
    preferredTone: cp.preferredTone || "balanced",
    expertiseLevel: cp.expertiseLevel || "beginner",
    goals: (cp.goals as string[]) || [],
  });
  const [saving, setSaving] = useState(false);
  const [usage, setUsage] = useState<CopilotUsageTotals | null>(null);

  const loadUsage = async () => {
    const res = await fetch("/api/copilot/usage");
    if (res.ok) {
      const data = await res.json();
      setUsage(data.totals as CopilotUsageTotals);
    }
  };
  useEffect(() => { loadUsage(); }, []);

  const toggleGoal = (g: string) =>
    setForm((f) => ({
      ...f,
      goals: f.goals.includes(g) ? f.goals.filter((x) => x !== g) : [...f.goals, g],
    }));

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/copilot/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      await refresh();
      toast.success("شخصی‌سازی دستیار ذخیره شد");
    } catch {
      toast.error("خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const clearMemory = async () => {
    if (!confirm("حافظه یادگرفته‌شده دستیار پاک شود؟")) return;
    await fetch("/api/copilot/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goals: [] }),
    });
    toast.success("حافظه پاک شد");
    await refresh();
  };

  return (
    <div className="space-y-6">
      <AccountSectionHeader
        title="دستیار هوشمند"
        subtitle="لحن، تخصص، اهداف و حافظه دستیار هوشمند کارنکس را شخصی‌سازی کنید."
        icon={Sparkles}
        accent="violet"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SettingsCard title="لحن و سطح" icon={Brain} accent="violet">
          <div className="space-y-5">
            <div>
              <Label className="mb-2 block">لحن پاسخ‌ها</Label>
              <div className="grid grid-cols-3 gap-2">
                {TONES.map((t) => (
                  <Pill key={t.id} active={form.preferredTone === t.id} onClick={() => setForm({ ...form, preferredTone: t.id })}>
                    {t.label}
                  </Pill>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">سطح تخصص</Label>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((l) => (
                  <Pill key={l.id} active={form.expertiseLevel === l.id} onClick={() => setForm({ ...form, expertiseLevel: l.id })}>
                    {l.label}
                  </Pill>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">مرحله کسب‌وکار</Label>
              <div className="grid grid-cols-5 gap-2">
                {STAGES.map((s) => (
                  <Pill key={s.id} active={form.businessStage === s.id} onClick={() => setForm({ ...form, businessStage: s.id })}>
                    {s.label}
                  </Pill>
                ))}
              </div>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="هویت و اهداف" icon={Target} accent="violet">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>نقش شما</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="مثلاً بنیان‌گذار، بازاریاب..." />
            </div>
            <div className="space-y-1.5">
              <Label>صنعت</Label>
              <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="مثلاً فناوری، غذا، مد..." />
            </div>
            <div>
              <Label className="mb-2 block">اهداف</Label>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((g) => (
                  <Pill key={g} active={form.goals.includes(g)} onClick={() => toggleGoal(g)}>
                    {g}
                  </Pill>
                ))}
              </div>
            </div>
          </div>
        </SettingsCard>

        {usage && (
          <SettingsCard title="مصرف این ماه" icon={Zap} accent="violet">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">تعداد درخواست</span><span className="font-bold">{usage.requests}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">توکن کل</span><span className="font-bold">{usage.totalTokens?.toLocaleString("fa-IR")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">هزینه تقریبی</span><span className="font-bold">${(usage.costUsd || 0).toFixed(3)}</span></div>
            </div>
          </SettingsCard>
        )}

        <SettingsCard title="حافظه دستیار" description="دستیار بر اساس این تنظیمات، پاسخ‌ها را شخصی‌سازی می‌کند." icon={Brain} accent="violet">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            حافظه یادگرفته‌شده شامل ترجیحات شماست که دستیار در طول زمان از گفتگوها استخراج می‌کند. می‌توانید آن را پاک کنید تا از نو شروع شود.
          </p>
          <Button variant="outline" onClick={clearMemory} className="text-destructive hover:text-destructive">
            <Trash2 size={16} className="me-2" /> پاک کردن حافظه یادگرفته‌شده
          </Button>
        </SettingsCard>
      </div>

      <div className="flex justify-end">
        <Button size="lg" onClick={save} disabled={saving} className="rounded-xl px-8 shadow-lg shadow-violet-500/25 bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:opacity-90">
          {saving ? <Loader2 className="animate-spin me-2" /> : <CheckCircle2 size={18} className="me-2" />}
          ذخیره شخصی‌سازی
        </Button>
      </div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
        active
          ? "bg-violet-500 text-white border-violet-500 shadow-md shadow-violet-500/25"
          : "bg-background text-muted-foreground border-border hover:border-violet-500/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
