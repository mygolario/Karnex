"use client";

import { Presentation } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProject } from "@/contexts/project-context";
import { PitchDeckBuilder } from "@/components/features/pitch-deck/pitch-deck-builder";

export default function PitchDeckPage() {
  const { activeProject: plan } = useProject();

  // Project Type Guard
  if (plan?.projectType !== "startup") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Presentation size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">پیچ دک ساز استارتاپی</h2>
          <p className="text-muted-foreground mb-4">
            این امکان فقط برای پروژه‌های استارتاپی فعال است.
          </p>
          <Link href="/dashboard/overview">
            <Button>بازگشت به داشبورد</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)]">
      <PitchDeckBuilder />
    </div>
  );
}
