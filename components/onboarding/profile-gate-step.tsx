"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOnboarding, trackStepView } from "./onboarding-context";
import { OnboardingShell } from "./onboarding-shell";
import {
  PROFILE_ROLE_OPTIONS,
  PROFILE_INDUSTRY_OPTIONS,
  PROFILE_STAGE_OPTIONS,
  PROFILE_GOAL_OPTIONS,
  BUDGET_BAND_OPTIONS,
  LOCATION_SCOPE_OPTIONS,
  type OnboardingProfileInput,
} from "@/lib/onboarding/profile-schema";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileGateStep() {
  const { saveProfile, loading: ctxLoading } = useOnboarding();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<OnboardingProfileInput>>({
    preferredTone: "balanced",
    expertiseLevel: "beginner",
    goals: [],
  });

  useEffect(() => {
    trackStepView("profile");
  }, []);

  const toggleGoal = (goal: string) => {
    setForm((f) => {
      const goals = f.goals ?? [];
      if (goals.includes(goal)) return { ...f, goals: goals.filter((g) => g !== goal) };
      if (goals.length >= 6) return f;
      return { ...f, goals: [...goals, goal] };
    });
  };

  const handleSubmit = async () => {
    if (
      !form.role ||
      !form.industry ||
      !form.businessStage ||
      !form.budgetBand ||
      !form.audienceSketch ||
      !form.locationScope ||
      !(form.goals?.length ?? 0)
    ) {
      return;
    }
    setSaving(true);
    const ok = await saveProfile(form as OnboardingProfileInput);
    setSaving(false);
    if (ok) {
      const res = await fetch("/api/onboarding");
      const data = await res.json();
      if (data.user?.currentStep === "complete") {
        router.push("/dashboard/overview");
      } else {
        router.push("/onboarding/genesis");
      }
    }
  };

  if (ctxLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <OnboardingShell
      phase="profile"
      title="پروفایل راه‌اندازی"
      subtitle="چند سؤال کوتاه تا طرح و دستیار هوشمند دقیقاً برای شما تنظیم شوند."
    >
      <div className="space-y-8">
        <FieldGroup label="نقش شما" required>
          <OptionGrid
            options={PROFILE_ROLE_OPTIONS}
            value={form.role}
            onChange={(role) => setForm((f) => ({ ...f, role }))}
          />
        </FieldGroup>

        <FieldGroup label="صنعت / حوزه" required>
          <div className="flex flex-wrap gap-2">
            {PROFILE_INDUSTRY_OPTIONS.map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() => setForm((f) => ({ ...f, industry: ind }))}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold border transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary",
                  form.industry === ind
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "border-border hover:border-brand-primary/50"
                )}
              >
                {ind}
              </button>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup label="مرحله کسب‌وکار" required>
          <OptionGrid
            options={PROFILE_STAGE_OPTIONS}
            value={form.businessStage}
            onChange={(businessStage) => setForm((f) => ({ ...f, businessStage: businessStage as OnboardingProfileInput["businessStage"] }))}
          />
        </FieldGroup>

        <FieldGroup label="اهداف (حداکثر ۶)" required>
          <div className="flex flex-wrap gap-2">
            {PROFILE_GOAL_OPTIONS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGoal(g)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold border focus-visible:ring-2 focus-visible:ring-brand-primary",
                  form.goals?.includes(g)
                    ? "bg-brand-secondary/20 border-brand-secondary text-foreground"
                    : "border-border"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup label="بودجه تقریبی (۳ ماه اول)" required>
          <OptionGrid
            options={BUDGET_BAND_OPTIONS}
            value={form.budgetBand}
            onChange={(budgetBand) => setForm((f) => ({ ...f, budgetBand }))}
          />
        </FieldGroup>

        <FieldGroup label="مخاطب هدف (یک جمله)" required>
          <textarea
            value={form.audienceSketch ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, audienceSketch: e.target.value }))}
            rows={2}
            className="w-full rounded-xl border border-border bg-card/60 p-3 text-sm focus-visible:ring-2 focus-visible:ring-brand-primary"
            placeholder="مثلاً: جوانان ۲۰–۳۵ سال علاقه‌مند به تکنولوژی در تهران"
            aria-required
          />
        </FieldGroup>

        <FieldGroup label="محدوده فعالیت" required>
          <OptionGrid
            options={LOCATION_SCOPE_OPTIONS}
            value={form.locationScope}
            onChange={(locationScope) => setForm((f) => ({ ...f, locationScope }))}
          />
        </FieldGroup>

        <FieldGroup label="سطح تخصص">
          <OptionGrid
            options={[
              { id: "beginner", label: "مبتدی" },
              { id: "intermediate", label: "متوسط" },
              { id: "expert", label: "حرفه‌ای" },
            ]}
            value={form.expertiseLevel}
            onChange={(expertiseLevel) =>
              setForm((f) => ({
                ...f,
                expertiseLevel: expertiseLevel as OnboardingProfileInput["expertiseLevel"],
              }))
            }
          />
        </FieldGroup>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            size="lg"
            className="w-full bg-gradient-to-l from-brand-primary to-brand-secondary text-white font-black text-lg h-14"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? <Loader2 className="animate-spin w-5 h-5" /> : "ادامه — طرح راه‌اندازی"}
          </Button>
        </motion.div>
      </div>
    </OnboardingShell>
  );
}

function FieldGroup({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-black mb-3 block">
        {label}
        {required && <span className="text-destructive mr-1">*</span>}
      </legend>
      {children}
    </fieldset>
  );
}

function OptionGrid({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value?: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "p-3 rounded-xl border text-sm font-bold text-start transition-all focus-visible:ring-2 focus-visible:ring-brand-primary",
            value === opt.id
              ? "border-brand-primary bg-brand-primary/10 ring-1 ring-brand-primary/30"
              : "border-border hover:border-brand-primary/40 bg-card/40"
          )}
          aria-pressed={value === opt.id}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
