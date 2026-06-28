"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useOnboarding, trackStepView } from "./onboarding-context";
import { OnboardingShell } from "./onboarding-shell";
import { BlueprintPreview } from "./blueprint-preview";
import { GenesisConcierge } from "./genesis-concierge";
import { PILLARS, type ProjectType } from "@/app/new-project/genesis-constants";
import { BUDGET_BAND_OPTIONS } from "@/lib/onboarding/profile-schema";
import { Button } from "@/components/ui/button";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";
import { cn } from "@/lib/utils";

const SUB_STEPS = ["pillar", "details", "vision", "review"] as const;
type SubStep = (typeof SUB_STEPS)[number];

export function LaunchBriefStep() {
  const router = useRouter();
  const { state, quality, patchProject, generateProject, loading } = useOnboarding();
  const project = state?.project;
  const profile = state?.user.profileData;

  const [subStep, setSubStep] = useState<SubStep>("pillar");
  const [generating, setGenerating] = useState(false);
  const [showLimit, setShowLimit] = useState(false);
  const [error, setError] = useState("");
  const [showMobileBlueprint, setShowMobileBlueprint] = useState(false);

  useEffect(() => {
    trackStepView("genesis", subStep);
  }, [subStep]);

  const syncPatch = useCallback(
    async (patch: Parameters<typeof patchProject>[0]) => {
      await patchProject(patch);
    },
    [patchProject]
  );

  const pillarConfig = PILLARS.find((p) => p.id === project?.pillar);

  const blueprintInput = useMemo(
    () => ({
      pillar: project?.pillar ?? null,
      projectName: project?.projectName ?? "",
      projectVision: project?.projectVision ?? "",
      answers: project?.answers ?? {},
      audience: project?.audience || profile?.audienceSketch || "",
      budget: project?.budget || profile?.budgetBand || "",
      profileComplete: Boolean(state?.user.profileCompletedAt),
    }),
    [project, profile, state?.user.profileCompletedAt]
  );

  const handleSelectPillar = async (id: ProjectType) => {
    await syncPatch({ pillar: id, answers: {} });
    setSubStep("details");
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    const result = await generateProject();
    setGenerating(false);
    if (result.error === "AI_LIMIT_REACHED" || result.error?.includes("LIMIT")) {
      setShowLimit(true);
      return;
    }
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.projectId) router.push("/onboarding/reveal");
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin w-12 h-12 text-brand-primary mx-auto" />
          <p className="font-black text-xl">کارنکس در حال ساخت استراتژی شماست...</p>
        </div>
      </div>
    );
  }

  const sidebar =
    quality && (
      <BlueprintPreview
        input={blueprintInput}
        score={quality.score}
        gaps={quality.gaps}
        className="hidden lg:flex"
      />
    );

  return (
    <>
      <OnboardingShell
        phase="genesis"
        title="طرح راه‌اندازی"
        subtitle="مسیر، جزئیات و ایده — با پیش‌نمایش زنده طرح شما."
        sidebar={sidebar}
      >
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowMobileBlueprint((v) => !v)}
            aria-expanded={showMobileBlueprint}
          >
            {showMobileBlueprint ? "بستن پیش‌نمایش" : "پیش‌نمایش طرح"}
          </Button>
          {showMobileBlueprint && quality && (
            <BlueprintPreview
              input={blueprintInput}
              score={quality.score}
              gaps={quality.gaps}
              className="mt-3"
            />
          )}
        </div>

        <GenesisConcierge subStep={subStep} quality={quality} />

        <div className="frosted-glass rounded-2xl border border-border/60 p-6 lg:p-8">
          {subStep === "pillar" && (
            <GenesisPillarBridge
              selected={project.pillar}
              onSelect={handleSelectPillar}
            />
          )}
          {subStep === "details" && project.pillar && (
            <GenesisDetailsBridge
              pillar={project.pillar}
              projectName={project.projectName}
              answers={project.answers}
              audience={project.audience || profile?.audienceSketch || ""}
              budget={project.budget || ""}
              onNameChange={(projectName) => syncPatch({ projectName })}
              onAnswer={(qId, optId) =>
                syncPatch({ answers: { ...project.answers, [qId]: optId } })
              }
              onAudience={(audience) => syncPatch({ audience })}
              onBudget={(budget) => syncPatch({ budget })}
              onBack={() => setSubStep("pillar")}
              onNext={() => setSubStep("vision")}
            />
          )}
          {subStep === "vision" && project.pillar && (
            <GenesisVisionBridge
              pillar={project.pillar}
              vision={project.projectVision}
              onChange={(projectVision) => syncPatch({ projectVision })}
              onBack={() => setSubStep("details")}
              onNext={() => setSubStep("review")}
            />
          )}
          {subStep === "review" && project.pillar && (
            <GenesisReviewBridge
              pillar={project.pillar}
              projectName={project.projectName}
              vision={project.projectVision}
              answers={project.answers}
              quality={quality}
              error={error}
              onEdit={(s) => setSubStep(s)}
              onGenerate={handleGenerate}
              onBack={() => setSubStep("vision")}
            />
          )}
        </div>
      </OnboardingShell>

      <LimitReachedModal isOpen={showLimit} onClose={() => setShowLimit(false)} />
    </>
  );
}

function GenesisPillarBridge({
  selected,
  onSelect,
}: {
  selected: ProjectType | null;
  onSelect: (id: ProjectType) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black">مسیر خود را انتخاب کنید</h2>
      <div className="grid gap-4">
        {PILLARS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={cn(
              "p-5 rounded-2xl border text-start transition-all focus-visible:ring-2 focus-visible:ring-brand-primary",
              selected === p.id
                ? "border-brand-primary bg-brand-primary/10"
                : "border-border hover:border-brand-primary/50 bg-card/40"
            )}
          >
            <p className="font-black text-lg">{p.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function GenesisDetailsBridge({
  pillar,
  projectName,
  answers,
  audience,
  budget,
  onNameChange,
  onAnswer,
  onAudience,
  onBudget,
  onBack,
  onNext,
}: {
  pillar: ProjectType;
  projectName: string;
  answers: Record<string, string>;
  audience: string;
  budget: string;
  onNameChange: (v: string) => void;
  onAnswer: (qId: string, optId: string) => void;
  onAudience: (v: string) => void;
  onBudget: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const config = PILLARS.find((p) => p.id === pillar)!;
  const needsAudience = pillar === "creator" || pillar === "startup";
  const needsBudget = pillar === "traditional";

  return (
    <div className="space-y-6">
      <label className="block">
        <span className="text-sm font-black">نام پروژه</span>
        <input
          value={projectName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={config.projectPlaceholder}
          className="mt-2 w-full rounded-xl border border-border bg-background p-3 focus-visible:ring-2 focus-visible:ring-brand-primary"
        />
      </label>

      {config.questions.map((q) => (
        <div key={q.id}>
          <p className="text-sm font-black mb-2">{q.question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onAnswer(q.id, opt.id)}
                className={cn(
                  "p-3 rounded-xl border text-sm font-bold focus-visible:ring-2 focus-visible:ring-brand-primary",
                  answers[q.id] === opt.id
                    ? "border-brand-primary bg-brand-primary/10"
                    : "border-border"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {(needsAudience || needsBudget) && (
        <div className="space-y-4 pt-2 border-t border-border">
          {needsAudience && (
            <label className="block">
              <span className="text-sm font-black">مخاطب هدف</span>
              <input
                value={audience}
                onChange={(e) => onAudience(e.target.value)}
                className="mt-2 w-full rounded-xl border border-border p-3 focus-visible:ring-2 focus-visible:ring-brand-primary"
                placeholder="چه کسانی مشتری/مخاطب شما هستند؟"
              />
            </label>
          )}
          {needsBudget && (
            <div>
              <p className="text-sm font-black mb-2">بودجه راه‌اندازی</p>
              <div className="flex flex-wrap gap-2">
                {BUDGET_BAND_OPTIONS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onBudget(b.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold border focus-visible:ring-2 focus-visible:ring-brand-primary",
                      budget === b.id ? "border-brand-primary bg-brand-primary/10" : "border-border"
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack}>
          قبلی
        </Button>
        <Button
          className="flex-1 bg-gradient-to-l from-brand-primary to-brand-secondary text-white"
          disabled={!projectName.trim()}
          onClick={onNext}
        >
          بعدی
        </Button>
      </div>
    </div>
  );
}

function GenesisVisionBridge({
  pillar,
  vision,
  onChange,
  onBack,
  onNext,
}: {
  pillar: ProjectType;
  vision: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const config = PILLARS.find((p) => p.id === pillar)!;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{config.visionHint}</p>
      <textarea
        value={vision}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className="w-full rounded-xl border border-border p-4 focus-visible:ring-2 focus-visible:ring-brand-primary"
        placeholder="ایده خود را توضیح دهید..."
      />
      <p className="text-xs text-muted-foreground">
        {vision.length < 20 ? "حداقل ۲۰ کاراکتر" : vision.length < 80 ? "خوب است — ۸۰+ کاراکتر کیفیت را بالا می‌برد" : "عالی!"}
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          قبلی
        </Button>
        <Button
          className="flex-1 bg-gradient-to-l from-brand-primary to-brand-secondary text-white"
          disabled={vision.trim().length < 20}
          onClick={onNext}
        >
          مرور نهایی
        </Button>
      </div>
    </div>
  );
}

function GenesisReviewBridge({
  pillar,
  projectName,
  vision,
  answers,
  quality,
  error,
  onEdit,
  onGenerate,
  onBack,
}: {
  pillar: ProjectType;
  projectName: string;
  vision: string;
  answers: Record<string, string>;
  quality: ReturnType<typeof import("@/lib/onboarding/quality-score").computeQualityScore> | null;
  error: string;
  onEdit: (s: SubStep) => void;
  onGenerate: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3 text-sm">
        <p>
          <strong>نام:</strong> {projectName}
        </p>
        <p>
          <strong>ایده:</strong> {vision.slice(0, 120)}
          {vision.length > 120 ? "..." : ""}
        </p>
        {quality && (
          <p className="text-brand-primary font-black">کیفیت طرح: {quality.score}٪</p>
        )}
      </div>

      <ul className="text-xs text-muted-foreground space-y-1">
        <li>✓ نقشه راه ۴–۱۲ هفته</li>
        <li>✓ بوم مدل کسب‌وکار</li>
        <li>✓ گام‌های عملیاتی هفته اول</li>
      </ul>

      {error && <p className="text-destructive text-sm">{error}</p>}
      {!quality?.canGenerate && (
        <p className="text-amber-600 text-sm">لطفاً فیلدهای ضروری را تکمیل کنید.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit("pillar")}>
          ویرایش مسیر
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit("details")}>
          ویرایش جزئیات
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit("vision")}>
          ویرایش ایده
        </Button>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          قبلی
        </Button>
        <Button
          className="flex-1 bg-gradient-to-l from-brand-primary to-brand-secondary text-white font-black h-12"
          disabled={!quality?.canGenerate}
          onClick={onGenerate}
        >
          ساخت استراتژی با هوش مصنوعی
        </Button>
      </div>
    </div>
  );
}
