"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Rocket } from "lucide-react";
import Link from "next/link";
import {
  AIOutputShell,
  AIReasoningPanel,
  AIActionBar,
  AIGenerationProgressAuto,
} from "@/components/ai-output";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";
import { toast } from "sonner";

export default function GrowthPage() {
  const { activeProject: plan } = useProject();
  const [loading, setLoading] = useState(false);
  const [planType, setPlanType] = useState<"north-star" | "experiments">("north-star");
  const [data, setData] = useState<unknown>(null);
  const [showLimit, setShowLimit] = useState(false);

  if (plan?.projectType !== "startup") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">برنامه رشد — استارتاپ</h2>
          <Link href="/dashboard/overview"><Button>بازگشت</Button></Link>
        </Card>
      </div>
    );
  }

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-growth-plan",
          planType,
          stage: "Acquisition",
          businessIdea: plan.overview || plan.tagline,
          projectName: plan.projectName,
          activeProject: plan,
        }),
      });
      if (res.status === 429) {
        setShowLimit(true);
        return;
      }
      const json = await res.json();
      if (json.data) {
        setData(json.data);
        toast.success("برنامه رشد آماده است");
      }
    } catch {
      toast.error("خطا در تولید برنامه");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 pb-24">
      <h1 className="text-2xl font-black flex items-center gap-2">
        <Rocket className="h-7 w-7 text-indigo-500" /> برنامه رشد
      </h1>
      <div className="flex gap-2">
        <Button variant={planType === "north-star" ? "default" : "outline"} size="sm" onClick={() => setPlanType("north-star")}>North Star</Button>
        <Button variant={planType === "experiments" ? "default" : "outline"} size="sm" onClick={() => setPlanType("experiments")}>آزمایش‌های AAARRR</Button>
        <Button onClick={generate} disabled={loading} className="mr-auto">
          {loading && <Loader2 className="animate-spin ml-2 h-4 w-4" />}
          تولید
        </Button>
      </div>
      {loading && (
        <AIGenerationProgressAuto steps={["تحلیل متریک", "طراحی آزمایش", "جدول زمانی ۳۰/۶۰/۹۰"]} />
      )}
      {data != null ? (
        <AIOutputShell title={planType === "north-star" ? "North Star Metric" : "آزمایش‌های رشد"} pillar="startup">
          <pre className="text-xs whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">{JSON.stringify(data, null, 2)}</pre>
          <AIReasoningPanel reasoning={(data as { reasoning?: string }).reasoning} />
          <AIActionBar onCopy={() => JSON.stringify(data, null, 2)} onRegenerate={generate} />
        </AIOutputShell>
      ) : null}
      <LimitReachedModal isOpen={showLimit} onClose={() => setShowLimit(false)} />
    </div>
  );
}
