"use client";

import Link from "next/link";
import { Lightbulb, FileText, Calendar, CheckCircle2, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STEPS = [
  { id: "ideas", label: "ایده", href: "/dashboard/ideas", icon: Lightbulb },
  { id: "scripts", label: "اسکریپت", href: "/dashboard/scripts", icon: FileText },
  { id: "calendar", label: "تقویم", href: "/dashboard/content-calendar", icon: Calendar },
  { id: "published", label: "منتشر شده", icon: CheckCircle2, href: "/dashboard/content-calendar" },
];

/** Creator content pipeline: Idea → Script → Calendar → Published */
export function ContentPipelineView() {
  return (
    <Card className="p-4 pillar-creator-accent">
      <h3 className="text-sm font-bold mb-3">خط تولید محتوا</h3>
      <div className="flex flex-wrap items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2">
            <Link href={step.href}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                <step.icon className="h-3.5 w-3.5" />
                {step.label}
              </Button>
            </Link>
            {i < STEPS.length - 1 && (
              <ArrowLeft className="h-3 w-3 text-muted-foreground rotate-180" />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
