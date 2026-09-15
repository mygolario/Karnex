"use client";

import { toast } from "sonner";
import { Copy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/utils";
import type { AgentOutput } from "@/lib/workforce/types";

async function copyText(label: string, text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} کپی شد`);
  } catch {
    toast.error("کپی نشد");
  }
}

function CopyBtn({ label, text }: { label: string; text: string }) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="h-8 rounded-lg text-xs"
      onClick={() => copyText(label, text)}
    >
      <Copy className="h-3.5 w-3.5" />
      کپی
    </Button>
  );
}

const threatClass: Record<string, string> = {
  high: "bg-red-500/10 text-red-600 dark:text-red-400",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

const threatLabel: Record<string, string> = {
  high: "تهدید بالا",
  medium: "متوسط",
  low: "کم",
};

export function RunOutput({ output }: { output: AgentOutput }) {
  if (output.kind === "research") {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-black text-foreground">{output.headline}</h3>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{output.briefing}</p>
        </div>
        <div className="space-y-2">
          {output.competitorMoves.map((move) => (
            <div
              key={move.name + move.move}
              className="rounded-2xl border border-border/60 bg-muted/30 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-sm">{move.name}</p>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", threatClass[move.threat])}>
                  {threatLabel[move.threat]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-6">{move.move}</p>
            </div>
          ))}
        </div>
        {output.questions.length > 0 && (
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2">سوال‌های این هفته</p>
            <ul className="space-y-1.5 text-sm">
              {output.questions.map((q) => (
                <li key={q} className="flex gap-2">
                  <span className="text-primary">؟</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {output.recommendedActions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground">کار بعدی</p>
            {output.recommendedActions.map((a) => (
              <div key={a.title} className="text-sm">
                <p className="font-bold">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.why}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (output.kind === "execution") {
    return (
      <div className="space-y-4">
        <p className="text-base font-black">{output.weekTheme}</p>
        <p className="text-sm text-amber-700 dark:text-amber-400 flex gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          {output.decisionForFounder}
        </p>
        {output.missions.map((m) => (
          <div key={m.id} className="rounded-2xl border border-border/60 p-4 bg-card">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-sm">{m.title}</p>
                {m.roadmapStep && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">گام نقشه راه: {m.roadmapStep}</p>
                )}
              </div>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 shrink-0">
                {toPersianDigits(m.minutes)} دقیقه
              </span>
            </div>
            <ol className="mt-3 space-y-1 text-sm text-muted-foreground list-decimal list-inside">
              {m.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            {m.copyPaste && (
              <div className="mt-3 rounded-xl bg-muted/50 p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-[11px] font-bold">{m.copyPaste.label}</p>
                  <CopyBtn label={m.copyPaste.label} text={m.copyPaste.body} />
                </div>
                <p className="text-xs leading-6 whitespace-pre-wrap">{m.copyPaste.body}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (output.kind === "growth") {
    return (
      <div className="space-y-4">
        <p className="text-base font-black">{output.hook}</p>
        {output.posts.map((post) => (
          <div key={post.title + post.caption.slice(0, 12)} className="rounded-2xl border border-border/60 p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-sm font-bold">
                {post.title}
                <span className="ms-2 text-[10px] font-medium text-muted-foreground">{post.channel}</span>
              </p>
              <CopyBtn label="کپشن" text={`${post.caption}\n\n${post.cta}`} />
            </div>
            <p className="text-sm leading-7 whitespace-pre-wrap">{post.caption}</p>
            <p className="text-xs text-pink-600 dark:text-pink-400 mt-2 font-medium">CTA: {post.cta}</p>
          </div>
        ))}
        <div className="rounded-2xl border border-border/60 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold">اسکریپت مصاحبه</p>
            <CopyBtn
              label="اسکریپت"
              text={`${output.interviewScript.opener}\n\n${output.interviewScript.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`}
            />
          </div>
          <p className="text-sm leading-7">{output.interviewScript.opener}</p>
          <ol className="mt-2 space-y-1 text-sm list-decimal list-inside text-muted-foreground">
            {output.interviewScript.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </div>
        <div className="rounded-2xl bg-muted/40 p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold">قالب دایرکت</p>
            <CopyBtn label="دایرکت" text={output.dmTemplate} />
          </div>
          <p className="text-sm leading-7">{output.dmTemplate}</p>
        </div>
      </div>
    );
  }

  if (output.kind === "capital") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-violet-500/10 border border-violet-500/20 p-4">
          <p className="text-[11px] font-bold text-violet-700 dark:text-violet-300 mb-1">وان‌لاینر</p>
          <p className="text-sm font-bold leading-7">{output.oneLiner}</p>
          <div className="mt-2">
            <CopyBtn label="وان‌لاینر" text={output.oneLiner} />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-1">Ask</p>
          <p className="text-sm leading-7">{output.ask}</p>
        </div>
        <div className="space-y-2">
          {output.faqs.map((f) => (
            <div key={f.q} className="rounded-xl border border-border/50 p-3">
              <p className="text-sm font-bold">{f.q}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-6">{f.a}</p>
            </div>
          ))}
        </div>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {output.objections.map((o) => (
            <li key={o}>• {o}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-lg font-black">{output.greeting}</p>
        <p className="text-sm mt-2">
          <span className="text-muted-foreground">تمرکز امروز: </span>
          <span className="font-bold">{output.todayFocus}</span>
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">{output.decision}</p>
      </div>
      <ul className="space-y-1 text-sm">
        {output.whatAgentsDid.map((line) => (
          <li key={line} className="flex gap-2">
            <span className="text-primary">✦</span>
            {line}
          </li>
        ))}
      </ul>
      {output.children.research && (
        <section className="border-t border-border/50 pt-4">
          <p className="text-xs font-bold text-teal-600 mb-2">عامل تحقیق</p>
          <RunOutput output={output.children.research} />
        </section>
      )}
      {output.children.execution && (
        <section className="border-t border-border/50 pt-4">
          <p className="text-xs font-bold text-amber-600 mb-2">عامل اجرا</p>
          <RunOutput output={output.children.execution} />
        </section>
      )}
      {output.children.growth && (
        <section className="border-t border-border/50 pt-4">
          <p className="text-xs font-bold text-pink-600 mb-2">عامل رشد</p>
          <RunOutput output={output.children.growth} />
        </section>
      )}
      {output.children.capital && (
        <section className="border-t border-border/50 pt-4">
          <p className="text-xs font-bold text-violet-600 mb-2">عامل سرمایه</p>
          <RunOutput output={output.children.capital} />
        </section>
      )}
    </div>
  );
}
