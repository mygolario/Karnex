"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Radar,
  ListChecks,
  Megaphone,
  Presentation,
  Moon,
  Loader2,
  Check,
  X,
  Sparkles,
  Bot,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useProject } from "@/contexts/project-context";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/utils";
import { WORKFORCE_AGENTS, NIGHT_SHIFT, agentsForPillar } from "@/lib/workforce/catalog";
import type { AgentRunDTO, WorkforceAgentId } from "@/lib/workforce/types";
import { RunOutput } from "./run-output";

const ICONS = {
  radar: Radar,
  "list-checks": ListChecks,
  megaphone: Megaphone,
  presentation: Presentation,
};

const ACCENT: Record<string, string> = {
  teal: "from-teal-500 to-cyan-600",
  amber: "from-amber-500 to-orange-600",
  pink: "from-pink-500 to-rose-600",
  violet: "from-violet-500 to-purple-600",
};

const STATUS_FA: Record<string, string> = {
  needs_approval: "منتظر تأیید",
  applied: "اعمال شد",
  dismissed: "رد شد",
  failed: "ناموفق",
  running: "در حال کار",
};

function relativeFa(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diff / 60000));
  if (mins < 1) return "همین حالا";
  if (mins < 60) return `${toPersianDigits(mins)} دقیقه پیش`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${toPersianDigits(hours)} ساعت پیش`;
  return `${toPersianDigits(Math.round(hours / 24))} روز پیش`;
}

export function WorkforceHq() {
  const { activeProject: plan, loading } = useProject();
  const projectId = plan?.id;
  const [runs, setRuns] = useState<AgentRunDTO[]>([]);
  const [nightShiftEnabled, setNightShiftEnabled] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [busyAgent, setBusyAgent] = useState<string | null>(null);
  const [busyRun, setBusyRun] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const visibleAgents = useMemo(
    () => agentsForPillar(plan?.projectType),
    [plan?.projectType],
  );

  const refresh = useCallback(async () => {
    if (!projectId) return;
    const res = await fetch(`/api/workforce?projectId=${encodeURIComponent(projectId)}`);
    if (!res.ok) {
      setLoadingList(false);
      return;
    }
    const json = await res.json();
    setRuns(json.runs || []);
    setNightShiftEnabled(Boolean(json.nightShiftEnabled));
    setLoadingList(false);
  }, [projectId]);

  useEffect(() => {
    setLoadingList(true);
    void refresh();
  }, [refresh]);

  const dispatch = async (agentId: WorkforceAgentId) => {
    if (!projectId) return;
    setBusyAgent(agentId);
    try {
      const res = await fetch("/api/workforce/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, agentId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.message || json.error || "اجرا نشد");
        return;
      }
      const run = json.run as AgentRunDTO;
      setRuns((prev) => [run, ...prev.filter((r) => r.id !== run.id)]);
      setOpenId(run.id);
      if (run.status === "failed") toast.error(run.error || "عامل ناموفق بود");
      else toast.success("کار آماده تأیید است — هنوز روی پروژه نوشته نشده");
    } catch {
      toast.error("ارتباط با سرور برقرار نشد");
    } finally {
      setBusyAgent(null);
    }
  };

  const applyRun = async (runId: string) => {
    if (!projectId) return;
    setBusyRun(runId);
    try {
      const res = await fetch(`/api/workforce/${runId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error || "اعمال نشد");
        return;
      }
      const run = json.run as AgentRunDTO;
      setRuns((prev) => prev.map((r) => (r.id === run.id ? run : r)));
      const applied = json.result?.applied?.length ?? 0;
      toast.success(
        applied
          ? `${toPersianDigits(applied)} تغییر روی پروژه اعمال شد`
          : "اعمال شد",
      );
    } catch {
      toast.error("اعمال نشد");
    } finally {
      setBusyRun(null);
    }
  };

  const dismissRun = async (runId: string) => {
    if (!projectId) return;
    setBusyRun(runId);
    try {
      const res = await fetch(`/api/workforce/${runId}/dismiss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error || "رد نشد");
        return;
      }
      const run = json.run as AgentRunDTO;
      setRuns((prev) => prev.map((r) => (r.id === run.id ? run : r)));
      toast.message("رد شد — روی پروژه چیزی نوشته نشد");
    } finally {
      setBusyRun(null);
    }
  };

  const toggleNightShift = async (enabled: boolean) => {
    if (!projectId) return;
    setNightShiftEnabled(enabled);
    const res = await fetch("/api/workforce", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, nightShiftEnabled: enabled }),
    });
    if (!res.ok) {
      setNightShiftEnabled(!enabled);
      toast.error("تنظیم ذخیره نشد");
      return;
    }
    toast.success(enabled ? "شب‌کاری زمان‌بندی شد" : "شب‌کاری خاموش شد");
  };

  if (!loading && !plan) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-black mb-3">اول پروژه، بعد عامل‌ها</h2>
          <p className="text-muted-foreground mb-6">
            عامل‌ها روی یک شرکت زنده کار می‌کنند. اول پروژه‌ات را بساز.
          </p>
          <Link href="/new-project">
            <Button size="lg" className="rounded-xl font-bold">
              <Plus className="h-4 w-4" />
              ساخت پروژه
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const pending = runs.filter((r) => r.status === "needs_approval");
  const nightBusy = busyAgent === "night_shift";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 px-1">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">هم‌بنیان‌گذار اجرایی</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">میز عامل‌ها</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl leading-7">
          کارنکس دیگر فقط پلن نمی‌نویسد. عامل‌ها کار این هفته را آماده می‌کنند؛ تو تأیید می‌کنی تا روی پروژه نوشته شود.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 text-white p-6 md:p-8 shadow-2xl"
      >
        <div className="absolute -top-16 -end-10 w-56 h-56 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold mb-3">
              <Moon className="h-3.5 w-3.5" />
              {NIGHT_SHIFT.name}
            </div>
            <h2 className="text-2xl md:text-3xl font-black leading-snug">
              بگذار امشب کارنکس کار کند
            </h2>
            <p className="text-white/75 mt-2 text-sm leading-7 max-w-xl">
              {NIGHT_SHIFT.tagline}. تحقیق، اجرا و رشد در یک گزارش صبح جمع می‌شود — هیچ پیام عمومی بدون تأیید تو نمی‌رود.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <Button
                size="lg"
                disabled={!projectId || nightBusy}
                onClick={() => dispatch("night_shift")}
                className="rounded-2xl font-bold bg-white text-slate-900 hover:bg-white/90 h-12 px-6"
              >
                {nightBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                شروع شب‌کاری
              </Button>
              <label className="flex items-center gap-2 text-xs text-white/80" dir="ltr">
                <Switch
                  checked={nightShiftEnabled}
                  onCheckedChange={toggleNightShift}
                  disabled={!projectId}
                />
                <span dir="rtl">هر شب خودکار</span>
              </label>
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-2 min-w-[200px]">
            {["تحقیق", "اجرا", "رشد"].map((label, i) => (
              <div
                key={label}
                className={cn(
                  "rounded-xl bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur",
                  nightBusy && "animate-pulse",
                )}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                {`شیفت ${label}`}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleAgents.map((agent) => {
          const Icon = ICONS[agent.icon];
          const busy = busyAgent === agent.id;
          const last = runs.find((r) => r.agentId === agent.id);
          return (
            <div
              key={agent.id}
              className="rounded-3xl border border-border/60 bg-card p-5 flex flex-col"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "h-11 w-11 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shrink-0",
                    ACCENT[agent.accent],
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-black">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.role} — {agent.tagline}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3 leading-6 flex-1">{agent.description}</p>
              {last && (
                <p className="text-[11px] text-muted-foreground mt-2">
                  آخرین کار: {STATUS_FA[last.status]} · {relativeFa(last.createdAt)}
                </p>
              )}
              <Button
                className="mt-4 rounded-xl font-bold"
                disabled={!projectId || Boolean(busyAgent)}
                onClick={() => dispatch(agent.id)}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                {agent.dispatchLabel}
              </Button>
            </div>
          );
        })}
      </div>

      {plan?.projectType === "startup" ? null : (
        <p className="text-xs text-muted-foreground">
          عامل سرمایه برای پروژه‌های استارتاپ است.
        </p>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black">صندوق تأیید</h2>
          <span className="text-xs text-muted-foreground">
            {toPersianDigits(pending.length)} مورد منتظر تو
          </span>
        </div>
        {loadingList ? (
          <div className="h-24 rounded-2xl bg-muted animate-pulse" />
        ) : pending.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            هنوز کاری برای تأیید نیست. یک عامل را بفرست یا شب‌کاری را شروع کن.
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((run) => (
              <RunRow
                key={run.id}
                run={run}
                open={openId === run.id}
                onToggle={() => setOpenId(openId === run.id ? null : run.id)}
                busy={busyRun === run.id}
                onApply={() => applyRun(run.id)}
                onDismiss={() => dismissRun(run.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-black mb-3">گزارش کار</h2>
        {runs.length === 0 && !loadingList ? (
          <p className="text-sm text-muted-foreground">هنوز اجرایی ثبت نشده.</p>
        ) : (
          <div className="space-y-2">
            {runs
              .filter((r) => r.status !== "needs_approval")
              .slice(0, 12)
              .map((run) => (
                <RunRow
                  key={run.id}
                  run={run}
                  open={openId === run.id}
                  onToggle={() => setOpenId(openId === run.id ? null : run.id)}
                  busy={busyRun === run.id}
                  onApply={() => applyRun(run.id)}
                  onDismiss={() => dismissRun(run.id)}
                />
              ))}
          </div>
        )}
      </section>

      <div className="rounded-2xl border border-border/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="font-bold text-sm">گفتگو با هم‌بنیان‌گذار</p>
          <p className="text-xs text-muted-foreground">اگر کار Ambiguous است، در چت ابزارها را صدا کن.</p>
        </div>
        <Link href="/dashboard/copilot">
          <Button variant="outline" className="rounded-xl">
            <Bot className="h-4 w-4" />
            دستیار کارنکس
          </Button>
        </Link>
      </div>
    </div>
  );
}

function RunRow({
  run,
  open,
  onToggle,
  busy,
  onApply,
  onDismiss,
}: {
  run: AgentRunDTO;
  open: boolean;
  onToggle: () => void;
  busy: boolean;
  onApply: () => void;
  onDismiss: () => void;
}) {
  const def = WORKFORCE_AGENTS.find((a) => a.id === run.agentId);
  const pending = run.status === "needs_approval";
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-start p-4 flex items-center gap-3"
      >
        <span
          className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
            pending
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
              : run.status === "applied"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "bg-muted text-muted-foreground",
          )}
        >
          {STATUS_FA[run.status] || run.status}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold truncate">{run.title}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {def?.name || run.agentId} · {run.summary} · {relativeFa(run.createdAt)}
          </p>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-border/40 pt-4">
          {run.status === "failed" ? (
            <p className="text-sm text-destructive">{run.error || "ناموفق"}</p>
          ) : (
            <RunOutput output={run.output} />
          )}
          {pending && (
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                className="rounded-xl font-bold"
                disabled={busy}
                onClick={onApply}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                اعمال روی پروژه
              </Button>
              <Button variant="outline" className="rounded-xl" disabled={busy} onClick={onDismiss}>
                <X className="h-4 w-4" />
                رد کردن
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
