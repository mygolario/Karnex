"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AgentRunDTO } from "@/lib/workforce/types";

export function MorningBrief({ projectId }: { projectId?: string }) {
  const [run, setRun] = useState<AgentRunDTO | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/workforce?projectId=${encodeURIComponent(projectId)}`);
        if (!res.ok) return;
        const json = await res.json();
        const runs: AgentRunDTO[] = json.runs || [];
        const pending = runs.find((r) => r.status === "needs_approval");
        const latest = pending || runs.find((r) => r.agentId === "night_shift") || runs[0];
        if (!cancelled) setRun(latest ?? null);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (!loaded || !run) return null;

  const pending = run.status === "needs_approval";
  const focus =
    run.output.kind === "night_shift"
      ? run.output.todayFocus
      : run.summary || run.title;

  return (
    <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-l from-indigo-500/10 to-transparent p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
        <Moon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-300">
          {pending ? "کار عامل منتظر تأیید توست" : "آخرین کار هم‌بنیان‌گذار"}
        </p>
        <p className="font-black text-foreground mt-0.5 leading-7">{focus}</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{run.title}</p>
      </div>
      <Link href="/dashboard/workforce">
        <Button className="rounded-xl font-bold shrink-0">
          {pending ? "تأیید کار" : "میز عامل‌ها"}
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
