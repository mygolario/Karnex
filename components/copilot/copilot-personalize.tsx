"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CopilotUsage } from "./copilot-usage";

interface UserProfileData {
  role?: string | null;
  industry?: string | null;
  businessStage?: string | null;
  goals?: string[] | null;
  preferredTone?: string;
  expertiseLevel?: string;
}

const TONES = [
  { value: "balanced", label: "متعادل" },
  { value: "formal", label: "رسمی" },
  { value: "casual", label: "صمیمی" },
];

const LEVELS = [
  { value: "beginner", label: "مبتدی" },
  { value: "intermediate", label: "متوسط" },
  { value: "expert", label: "حرفه‌ای" },
];

const STAGES = [
  { value: "idea", label: "ایده" },
  { value: "validation", label: "اعتبارسنجی" },
  { value: "mvp", label: "MVP" },
  { value: "launch", label: "راه‌اندازی" },
  { value: "growth", label: "رشد" },
];

export function CopilotPersonalize() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfileData>({
    preferredTone: "balanced",
    expertiseLevel: "beginner",
  });

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/copilot/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setProfile({
            role: data.profile.role,
            industry: data.profile.industry,
            businessStage: data.profile.businessStage,
            goals: data.profile.goals,
            preferredTone: data.profile.preferredTone || "balanced",
            expertiseLevel: data.profile.expertiseLevel || "beginner",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [open]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/copilot/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error();
      toast.success("ترجیحات ذخیره شد");
      setOpen(false);
    } catch {
      toast.error("خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <Settings size={14} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle>شخصی‌سازی دستیار</DialogTitle>
          <DialogDescription>
            دستیار بر اساس این ترجیحات با شما صحبت می‌کند.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-muted-foreground" size={20} />
          </div>
        ) : (
          <div className="space-y-3">
            <Field label="لحن پاسخ">
              <Segmented
                options={TONES}
                value={profile.preferredTone || "balanced"}
                onChange={(v) => setProfile({ ...profile, preferredTone: v })}
              />
            </Field>

            <Field label="سطح تخصص">
              <Segmented
                options={LEVELS}
                value={profile.expertiseLevel || "beginner"}
                onChange={(v) => setProfile({ ...profile, expertiseLevel: v })}
              />
            </Field>

            <Field label="مرحله کسب‌وکار">
              <Segmented
                options={STAGES}
                value={profile.businessStage || "idea"}
                onChange={(v) => setProfile({ ...profile, businessStage: v })}
              />
            </Field>

            <Field label="نقش / صنعت">
              <input
                value={profile.role || ""}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                placeholder="مثلاً: بنیان‌گذار، فناوری"
                className="w-full h-9 px-3 rounded-lg bg-muted/50 border border-border/50 text-xs outline-none focus:border-ai/30"
                dir="rtl"
              />
            </Field>

            <Button
              onClick={save}
              disabled={saving}
              className="w-full gap-2 ai-orb text-white"
              size="sm"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              ذخیره ترجیحات
            </Button>

            <div className="pt-2 border-t border-border/50">
              <CopilotUsage />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1 bg-muted/40 p-1 rounded-lg">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 text-[11px] font-medium py-1.5 rounded-md transition-all",
            value === o.value ? "bg-background text-ai shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
