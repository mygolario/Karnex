"use client";

import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CompetitorAnalyzer } from "@/components/dashboard/competitor-analyzer";

export default function CompetitorsPage() {
  const { activeProject: plan } = useProject();

  if (plan?.projectType !== "startup") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">تحلیل رقبا — استارتاپ</h2>
          <Link href="/dashboard/overview"><Button>بازگشت</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      <CompetitorAnalyzer />
    </div>
  );
}
