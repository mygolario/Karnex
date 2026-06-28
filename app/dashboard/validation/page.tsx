"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Target, FlaskConical, TrendingUp } from "lucide-react";
import Link from "next/link";
import {
  AIOutputShell,
  AIReasoningPanel,
  AIActionBar,
  AIScoreBadge,
  AIExecutiveSummary,
  AIGenerationProgressAuto,
} from "@/components/ai-output";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";
import { toast } from "sonner";

export default function ValidationPage() {
  const { activeProject: plan } = useProject();
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<Record<string, unknown> | null>(null);
  const [showLimit, setShowLimit] = useState(false);

  if (plan?.projectType !== "startup") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">اعتبارسنجی ایده — استارتاپ</h2>
          <p className="text-muted-foreground mb-4">فقط برای پروژه‌های استارتاپی.</p>
          <Link href="/dashboard/overview"><Button>بازگشت</Button></Link>
        </Card>
      </div>
    );
  }

  const runValidation = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate-idea",
          businessIdea: plan.overview || plan.tagline,
          projectName: plan.projectName,
          activeProject: plan,
        }),
      });
      if (res.status === 429) {
        setShowLimit(true);
        return;
      }
      const data = await res.json();
      if (data.validation) {
        setValidation(data.validation as Record<string, unknown>);
        toast.success("تحلیل اعتبارسنجی آماده است");
      }
    } catch {
      toast.error("خطا در اعتبارسنجی");
    } finally {
      setLoading(false);
    }
  };

  const critique = validation?.critique as Record<string, unknown> | undefined;
  const score = Number(critique?.score ?? 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 pb-24">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">اعتبارسنجی ایده</h1>
          <p className="text-muted-foreground text-sm">نقد YC-style + فرض‌ها + آزمایش‌های ارزان</p>
        </div>
        <Button onClick={runValidation} disabled={loading}>
          {loading ? <Loader2 className="animate-spin ml-2 h-4 w-4" /> : null}
          تحلیل ایده
        </Button>
      </div>

      {loading && (
        <Card className="p-6">
          <AIGenerationProgressAuto
            steps={["بررسی بازار", "شناسایی فرض‌ها", "طراحی آزمایش‌ها", "نمره‌دهی"]}
          />
        </Card>
      )}

      {validation && (
        <AIOutputShell
          title="گزارش اعتبارسنجی"
          pillar="startup"
          confidence={score}
          subtitle={String(critique?.summary ?? "")}
        >
          <div className="flex flex-wrap gap-6 mb-4">
            <AIScoreBadge score={score} label="امتیاز ایده" pillar="startup" size="lg" />
          </div>
          <AIExecutiveSummary
            bullets={[
              String(critique?.summary ?? ""),
              ...((critique?.weaknesses as string[])?.slice(0, 2) ?? []),
            ].filter(Boolean)}
          />
          <AIReasoningPanel reasoning={validation.reasoning as string} />
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <FlaskConical className="h-4 w-4" /> آزمایش‌ها
              </h3>
              <ul className="text-xs space-y-2">
                {((validation.experiments as { title: string; metric: string }[]) ?? []).map((e, i) => (
                  <li key={i} className="border-b pb-2">{e.title} — {e.metric}</li>
                ))}
              </ul>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" /> فرض‌های کلیدی
              </h3>
              <ul className="text-xs space-y-2">
                {((validation.assumptions as { text: string; risk: string }[]) ?? []).slice(0, 4).map((a, i) => (
                  <li key={i}>{a.text} <span className="text-muted-foreground">({a.risk})</span></li>
                ))}
              </ul>
            </Card>
          </div>
          <AIActionBar
            className="mt-4"
            onCopy={() => JSON.stringify(validation, null, 2)}
            onRegenerate={runValidation}
            copilotPrefill="ایده من را عمیق‌تر اعتبارسنجی کن و آزمایش‌های بیشتری پیشنهاد بده"
          />
        </AIOutputShell>
      )}

      <LimitReachedModal isOpen={showLimit} onClose={() => setShowLimit(false)} />
    </div>
  );
}
