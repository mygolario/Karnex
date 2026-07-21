"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  labeledGenesisAnswers,
  buildPersonalizationPreview,
  buildIdeaFromAnswers,
} from "@/lib/genesis/format";
import { GENESIS_ASSIST_CAP } from "@/lib/genesis/intake-constants";
import {
  genesisPolishBriefAction,
  suggestProjectNameAction,
} from "@/lib/ai-actions";
import { useGenesisWizard } from "./genesis-wizard-context";
import { StickyNav } from "./genesis-ui";
import { cn, toPersianDigits } from "@/lib/utils";

export function StepBrief() {
  const {
    answers,
    projectName,
    setName,
    projectVision,
    setVision,
    confidence,
    creditEstimate,
    consumeAssist,
    assistsRemaining,
    advance,
    retreat,
    goToStep,
  } = useGenesisWizard();

  const [polishing, setPolishing] = useState(false);
  const [naming, setNaming] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [assistMsg, setAssistMsg] = useState("");

  const labeled = useMemo(() => labeledGenesisAnswers(answers), [answers]);
  const preview = useMemo(
    () => buildPersonalizationPreview(answers),
    [answers]
  );
  const ideaBlock = useMemo(
    () => buildIdeaFromAnswers(answers, projectVision),
    [answers, projectVision]
  );

  const levelLabel =
    confidence.level === "strong"
      ? "عالی"
      : confidence.level === "ok"
        ? "خوب"
        : "نیاز به کمی تقویت";

  const levelColor =
    confidence.level === "strong"
      ? "text-emerald-600"
      : confidence.level === "ok"
        ? "text-brand-secondary"
        : "text-amber-600";

  const canBuild =
    projectName.trim().length >= 2 && ideaBlock.replace(/\s/g, "").length >= 12;

  const polishVision = async () => {
    setAssistMsg("");
    if (!consumeAssist()) {
      setAssistMsg(
        `حداکثر ${toPersianDigits(GENESIS_ASSIST_CAP)} کمک AI در این پیش‌نویس.`
      );
      return;
    }
    setPolishing(true);
    try {
      const briefBlock = Object.entries(labeled)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      const res = await genesisPolishBriefAction({
        projectName: projectName || "پروژه",
        briefBlock: briefBlock || ideaBlock,
      });
      if (res.success && res.data?.vision) {
        setVision(res.data.vision);
        setAssistMsg("خلاصه روشن‌تر شد — اگر خواستی ویرایش کن.");
      } else if (res.isLimitError) {
        setAssistMsg("سقف اعتبار AI تمام شده است.");
      }
    } finally {
      setPolishing(false);
    }
  };

  const suggestNames = async () => {
    setAssistMsg("");
    if (!consumeAssist()) {
      setAssistMsg(
        `حداکثر ${toPersianDigits(GENESIS_ASSIST_CAP)} کمک AI در این پیش‌نویس.`
      );
      return;
    }
    setNaming(true);
    try {
      const res = await suggestProjectNameAction(
        [
          `نام فعلی کاربر: ${projectName}`,
          `چشم‌انداز پروژه: ${ideaBlock}`,
          `جزئیات: ${Object.values(labeled).join("، ")}`,
        ].join("\n")
      );
      if (res.success && res.data?.names?.length) {
        setNameSuggestions(res.data.names);
      } else if (res.isLimitError) {
        setAssistMsg("سقف اعتبار AI تمام شده است.");
      }
    } finally {
      setNaming(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 pb-28 md:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h2 className="text-3xl font-black mb-2">میز هم‌بنیان‌گذار</h2>
        <p className="text-muted-foreground">{preview}</p>
      </motion.div>

      {/* Living brief desk — surprise composition */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-3xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary/10 via-card/80 to-brand-secondary/10 p-6 md:p-8 shadow-xl shadow-primary/10 overflow-hidden"
      >
        <div className="absolute -top-20 -end-20 w-56 h-56 rounded-full bg-brand-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -start-10 w-40 h-40 rounded-full bg-brand-secondary/20 blur-3xl pointer-events-none" />

        <div className="relative space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              نام پروژه
            </label>
            <div className="flex gap-2">
              <Input
                value={projectName}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً نوبت‌یار"
                className="h-12 rounded-xl text-base bg-background/70"
              />
              <button
                type="button"
                onClick={suggestNames}
                disabled={naming || assistsRemaining <= 0}
                className="shrink-0 h-12 px-3 rounded-xl border border-border/60 bg-background/70 text-sm font-medium hover:border-brand-primary/40 disabled:opacity-50 inline-flex items-center gap-1"
              >
                {naming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                )}
                پیشنهاد
              </button>
            </div>
            {nameSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {nameSuggestions.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setName(n)}
                    className="text-xs rounded-full border border-border/60 px-3 py-1 hover:border-brand-primary/50"
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(labeled).slice(0, 8).map(([k, v]) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  // jump back to interview/context for edits
                  if (["مشکل", "راه‌حل", "مخاطب", "حوزه"].includes(k)) {
                    goToStep(2);
                  } else {
                    goToStep(3);
                  }
                }}
                className="text-start rounded-xl border border-border/40 bg-background/50 px-3 py-2 hover:border-brand-primary/30 transition-colors group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">{k}</span>
                  <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60" />
                </div>
                <p className="text-sm font-medium line-clamp-2 mt-0.5">{v}</p>
              </button>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                جمع‌بندی آزاد (اختیاری)
              </label>
              <button
                type="button"
                onClick={polishVision}
                disabled={polishing || assistsRemaining <= 0}
                className="text-xs text-brand-primary font-medium hover:underline disabled:opacity-50 inline-flex items-center gap-1"
              >
                {polishing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                روشن‌ترش کن
              </button>
            </div>
            <Textarea
              value={projectVision}
              onChange={(e) => setVision(e.target.value)}
              placeholder="اگر چیزی مانده بگو… یا خالی بگذار؛ از جواب‌های بالا استفاده می‌کنیم."
              className="min-h-[100px] rounded-xl bg-background/70"
            />
          </div>

          {/* Confidence meter */}
          <div className="rounded-xl bg-background/60 border border-border/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">آمادگی ایده</span>
              <span className={cn("text-sm font-bold", levelColor)}>
                {levelLabel} · {toPersianDigits(confidence.score)}٪
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${confidence.score}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 18 }}
              />
            </div>
            {confidence.level === "weak" && confidence.tips.length > 0 && (
              <ul className="mt-3 space-y-1">
                {confidence.tips.map((tip) => (
                  <li key={tip} className="text-xs text-muted-foreground">
                    · {tip}
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="text-xs font-semibold text-brand-primary hover:underline mt-1"
                  >
                    ۲–۳ سوال کوتاه برای تقویت ایده
                  </button>
                </li>
              </ul>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            هزینه ساخت استراتژی: حدود{" "}
            <span className="font-semibold text-foreground">
              {toPersianDigits(creditEstimate.total)} اعتبار
            </span>{" "}
            (بوم {toPersianDigits(creditEstimate.core)} + نقشه راه{" "}
            {toPersianDigits(creditEstimate.roadmap)}
            {creditEstimate.assistsUsed > 0
              ? ` + کمک‌های قبلی ${toPersianDigits(creditEstimate.assistsUsed)}`
              : ""}
            )
          </p>
          {assistMsg && (
            <p className="text-xs text-center text-brand-primary">{assistMsg}</p>
          )}
        </div>
      </motion.div>

      <StickyNav
        onBack={retreat}
        onNext={advance}
        nextDisabled={!canBuild}
        nextLabel="ساخت استراتژی با هوش مصنوعی"
      />
    </div>
  );
}
