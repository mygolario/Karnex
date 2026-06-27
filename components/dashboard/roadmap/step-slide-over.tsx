"use client";

import { useState, useCallback } from "react";
import {
  Clock,
  Flag,
  FolderOpen,
  ExternalLink,
  Sparkles,
  Loader2,
  CheckCircle2,
  ListTree,
  MessageCircle,
  Calendar,
  Link2,
  Play,
  AlertCircle,
  SkipForward,
  RotateCcw,
  FileText,
  Lightbulb,
  NotebookPen,
  Timer,
  StopCircle,
  Bot,
  Wrench,
  Plus,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { JalaliDatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn, toPersianDigits } from "@/lib/utils";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";
import {
  STATUS_CONFIG,
  getCategoryConfig,
  getPriorityConfig,
  getPriorityLabel,
  StepStatus,
} from "@/lib/roadmap/constants";
import type { RoadmapStep, SubTask } from "@/lib/db";

interface StepSlideOverProps {
  step: RoadmapStep | null;
  phaseName: string;
  weekNumber?: number;
  isOpen: boolean;
  onClose: () => void;
  status: StepStatus;
  isUnlocked: boolean;
  onUpdateStatus: (
    status: StepStatus,
    meta?: { blockedReason?: string; actualHours?: number }
  ) => void;
  subTasks: SubTask[];
  onSubTaskToggle: (subTask: SubTask) => void;
  onBreakTask: () => void;
  isBreakingTask: boolean;
  projectName?: string;
  projectType?: string;
  onSetDueDate: (date: string) => void;
  onComplete: () => void;
  onSaveNotes?: (notes: string) => void;
}

export function StepSlideOver({
  step,
  phaseName,
  weekNumber,
  isOpen,
  onClose,
  status,
  isUnlocked,
  onUpdateStatus,
  subTasks,
  onSubTaskToggle,
  onBreakTask,
  isBreakingTask,
  projectName,
  projectType = "startup",
  onSetDueDate,
  onComplete,
  onSaveNotes,
}: StepSlideOverProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [aiGuide, setAiGuide] = useState<string | null>(null);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [notes, setNotes] = useState(step?.notes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null);
  const [blockedReason, setBlockedReason] = useState("");
  const [isResolvingBlock, setIsResolvingBlock] = useState(false);
  const [blockResolution, setBlockResolution] = useState<string | null>(null);
  const [showBlockedForm, setShowBlockedForm] = useState(false);

  const statusCfg = STATUS_CONFIG[status];
  const catCfg = step ? getCategoryConfig(step.category) : null;
  const prioCfg = step ? getPriorityConfig(step.priority) : null;

  const fetchGuide = useCallback(async () => {
    if (!step) return;
    if (aiGuide) return;
    setLoadingGuide(true);
    try {
      const { chatAction } = await import("@/lib/chat-actions");
      const result = await chatAction(
        `یک راهنمای بسیار خلاصه و کاربردی (شامل ۳ تا ۵ قدم اجرایی) برای انجام این مرحله بنویس: "${step.title}" (فاز: ${phaseName})`,
        { projectName, overview: step.description, projectType },
        false
      );
      if (result.success) {
        setAiGuide(result.reply || "راهنمایی یافت نشد.");
      } else if (result.error === "AI_LIMIT_REACHED") {
        setShowLimitModal(true);
      } else {
        setAiGuide("خطا در دریافت راهنمایی");
      }
    } catch {
      setAiGuide("خطا در دریافت راهنمایی");
    } finally {
      setLoadingGuide(false);
    }
  }, [step, aiGuide, phaseName, projectName, projectType]);

  const handleResolveBlock = useCallback(async () => {
    if (!step || !blockedReason.trim()) return;
    setIsResolvingBlock(true);
    try {
      const { chatAction } = await import("@/lib/chat-actions");
      const result = await chatAction(
        `کاربر در گام "${step.title}" گیر کرده است. مشکل: "${blockedReason}". سه راه‌حل عملی و مختصر برای رفع این مشکل پیشنهاد بده. اگر نیاز به سرویس ایرانی مثل enamad.ir، nic.ir یا اداره ثبت شرکت‌ها دارد، لینک‌های مرتبط را هم بده.`,
        { projectName, overview: step.description, projectType },
        false
      );
      if (result.success) {
        setBlockResolution(result.reply || "راه‌حلی یافت نشد.");
      } else if (result.error === "AI_LIMIT_REACHED") {
        setShowLimitModal(true);
      }
    } catch {
      setBlockResolution("خطا در دریافت راه‌حل");
    } finally {
      setIsResolvingBlock(false);
    }
  }, [step, blockedReason, projectName, projectType]);

  const handleStatusChange = useCallback(
    (newStatus: StepStatus) => {
      onUpdateStatus(newStatus);
      if (newStatus === "done") onComplete();
    },
    [onUpdateStatus, onComplete]
  );

  const toggleChecklistItem = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleSaveNotes = async () => {
    if (!onSaveNotes) return;
    setIsSavingNotes(true);
    await new Promise((r) => setTimeout(r, 300));
    onSaveNotes(notes);
    setIsSavingNotes(false);
  };

  const handleStartTimer = () => {
    if (isTimerRunning) return;
    setIsTimerRunning(true);
    const ref = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    setTimerRef(ref);
  };

  const handleStopTimer = () => {
    if (timerRef) clearInterval(timerRef);
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    handleStopTimer();
    setTimerSeconds(0);
  };

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${toPersianDigits(h.toString().padStart(2, "0"))}:${toPersianDigits(m.toString().padStart(2, "0"))}:${toPersianDigits(s.toString().padStart(2, "0"))}`;
  };

  const checklistDone = checkedItems.size;
  const checklistTotal = step?.checklist?.length ?? 0;
  const checklistPercent =
    checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;

  if (!step) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(o) => !o && onClose()}>
        <SheetContent
          side="left"
          className="w-full sm:max-w-2xl p-0 flex flex-col overflow-hidden"
        >
          {/* ─── Header ─────────────────────────────────────────── */}
          <SheetHeader className="p-0">
            <div className="p-5 border-b border-border/50 bg-card/95 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                {weekNumber != null && (
                  <Badge variant="outline" size="sm">
                    هفته {toPersianDigits(weekNumber)}
                  </Badge>
                )}
                <Badge variant="muted" size="sm">
                  {phaseName}
                </Badge>
                {catCfg && (
                  <Badge
                    size="sm"
                    className={cn(catCfg.bgClass, catCfg.textClass, "border-0")}
                  >
                    <FolderOpen size={10} className="ms-1" />
                    {catCfg.label}
                  </Badge>
                )}
                {statusCfg && (
                  <Badge
                    size="sm"
                    className={cn("border-0", statusCfg.badgeClass)}
                  >
                    {statusCfg.label}
                  </Badge>
                )}
              </div>
              <SheetTitle className="text-xl font-bold leading-tight text-start">
                {step.title}
              </SheetTitle>
              {/* Meta */}
              <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                {step.estimatedHours != null && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-primary" />
                    {toPersianDigits(step.estimatedHours)} ساعت تخمینی
                  </span>
                )}
                {prioCfg && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                      prioCfg.badgeClass
                    )}
                  >
                    <Flag size={10} />
                    {getPriorityLabel(step.priority)}
                  </span>
                )}
                {step.dependsOn && step.dependsOn.length > 0 && (
                  <span className="flex items-center gap-1 text-xs">
                    <Link2 size={12} />
                    {toPersianDigits(step.dependsOn.length)} پیش‌نیاز
                  </span>
                )}
              </div>
            </div>
          </SheetHeader>

          {/* ─── Tabs ────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="p-4"
            >
              <TabsList
                variant="pills"
                className="w-full justify-start mb-4 flex-wrap gap-1"
              >
                <TabsTrigger value="overview" className="text-xs">
                  <FileText size={13} />
                  کلیات
                </TabsTrigger>
                <TabsTrigger value="checklist" className="text-xs">
                  <ListTree size={13} />
                  چک‌لیست
                  {checklistTotal > 0 && (
                    <span className="text-[10px] bg-primary/10 text-primary rounded-full px-1.5">
                      {toPersianDigits(checklistDone)}/{toPersianDigits(checklistTotal)}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="subtasks" className="text-xs">
                  <Plus size={13} />
                  گام‌ها
                  {subTasks.length > 0 && (
                    <span className="text-[10px] bg-primary/10 text-primary rounded-full px-1.5">
                      {toPersianDigits(subTasks.length)}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="notes" className="text-xs">
                  <NotebookPen size={13} />
                  یادداشت
                </TabsTrigger>
                <TabsTrigger value="timer" className="text-xs">
                  <Timer size={13} />
                  زمان‌سنج
                </TabsTrigger>
                <TabsTrigger value="ai" className="text-xs">
                  <Bot size={13} />
                  AI کوچ
                </TabsTrigger>
              </TabsList>

              {/* ── Overview ── */}
              <TabsContent value="overview" className="space-y-4">
                {step.description && (
                  <div>
                    <h3 className="text-sm font-bold mb-2">توضیحات</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                )}

                <div className="bg-muted/30 rounded-2xl p-4 space-y-2">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    موعد انجام
                  </h3>
                  <JalaliDatePicker
                    value={step.dueDate}
                    onChange={onSetDueDate}
                    placeholder="تاریخ را انتخاب کنید"
                  />
                </div>

                {step.tips && step.tips.length > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4">
                    <h3 className="text-sm font-bold text-amber-600 mb-2 flex items-center gap-2">
                      <Lightbulb size={16} className="text-amber-500" />
                      نکات طلایی
                    </h3>
                    <ul className="space-y-1.5 list-disc list-inside ps-2">
                      {step.tips.map((tip, i) => (
                        <li
                          key={i}
                          className="text-xs text-muted-foreground leading-relaxed"
                        >
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {step.resources && step.resources.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold mb-2">منابع مفید</h3>
                    <div className="space-y-2">
                      {step.resources.map((resource, i) => (
                        <a
                          key={i}
                          href={resource}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ExternalLink size={14} />
                          {resource}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ── Checklist ── */}
              <TabsContent value="checklist" className="space-y-3">
                {checklistTotal > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>پیشرفت چک‌لیست</span>
                      <span>{toPersianDigits(checklistPercent)}٪</span>
                    </div>
                    <Progress value={checklistPercent} className="h-1.5" />
                  </div>
                )}
                {step.checklist && step.checklist.length > 0 ? (
                  <div className="space-y-2">
                    {step.checklist.map((item, i) => {
                      const checked = checkedItems.has(i);
                      return (
                        <button
                          key={i}
                          onClick={() => toggleChecklistItem(i)}
                          className={cn(
                            "flex items-start gap-3 w-full text-start p-3 rounded-xl transition-all",
                            checked
                              ? "bg-emerald-500/10 border border-emerald-500/20"
                              : "bg-muted/30 hover:bg-muted/50 border border-transparent"
                          )}
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                              checked
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-muted-foreground/30"
                            )}
                          >
                            {checked && <CheckCircle2 size={12} />}
                          </div>
                          <span
                            className={cn(
                              "text-sm leading-relaxed",
                              checked && "line-through text-muted-foreground"
                            )}
                          >
                            {item}
                          </span>
                        </button>
                      );
                    })}
                    {checklistDone === checklistTotal && checklistTotal > 0 && (
                      <div className="text-center text-xs text-emerald-600 font-medium pt-2">
                        ✅ همه موارد چک‌لیست انجام شد!
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    چک‌لیستی برای این گام وجود ندارد.
                  </p>
                )}
              </TabsContent>

              {/* ── Sub-tasks ── */}
              <TabsContent value="subtasks" className="space-y-3">
                {subTasks.length > 0 ? (
                  <div className="space-y-2">
                    {subTasks.map((sub, i) => (
                      <button
                        key={i}
                        onClick={() => onSubTaskToggle(sub)}
                        className={cn(
                          "flex items-center gap-3 w-full text-end p-3 rounded-xl transition-all",
                          sub.isCompleted
                            ? "bg-muted/50 opacity-60"
                            : "hover:bg-background bg-background/50"
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                            sub.isCompleted
                              ? "bg-primary border-primary text-white"
                              : "border-muted-foreground/30"
                          )}
                        >
                          {sub.isCompleted && <CheckCircle2 size={12} />}
                        </div>
                        <span
                          className={cn(
                            "text-sm",
                            sub.isCompleted &&
                              "line-through text-muted-foreground"
                          )}
                        >
                          {sub.text}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    هنوز گام کوچکی شکسته نشده است.
                  </p>
                )}

                {status !== "done" && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={onBreakTask}
                    disabled={isBreakingTask}
                  >
                    {isBreakingTask ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        در حال شکستن تسک...
                      </>
                    ) : (
                      <>
                        <ListTree size={16} />
                        این کار را به گام‌های کوچکتر تقسیم کن
                      </>
                    )}
                  </Button>
                )}
              </TabsContent>

              {/* ── Notes ── */}
              <TabsContent value="notes" className="space-y-3">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <NotebookPen size={16} className="text-primary" />
                    یادداشت‌های شخصی
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    افکار، ایده‌ها و نکاتی که برای این گام دارید را اینجا بنویسید.
                  </p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="یادداشت خود را بنویسید..."
                    className="min-h-[200px] resize-none text-sm leading-relaxed"
                    dir="rtl"
                  />
                  <Button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes || !onSaveNotes}
                    size="sm"
                    className="w-full gap-2"
                  >
                    {isSavingNotes ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        ذخیره...
                      </>
                    ) : (
                      "💾 ذخیره یادداشت"
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* ── Timer ── */}
              <TabsContent value="timer" className="space-y-4">
                <div className="text-center space-y-4">
                  <h3 className="text-sm font-bold flex items-center justify-center gap-2">
                    <Timer size={16} className="text-primary" />
                    زمان‌سنج کار
                  </h3>

                  {/* Clock display */}
                  <div
                    className={cn(
                      "text-5xl font-black font-mono tracking-widest py-8 px-4 rounded-3xl transition-all",
                      isTimerRunning
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-muted/30 text-foreground"
                    )}
                  >
                    {formatTimer(timerSeconds)}
                  </div>

                  {/* Timer controls */}
                  <div className="flex justify-center gap-3">
                    {!isTimerRunning ? (
                      <Button
                        variant="gradient"
                        className="gap-2"
                        onClick={handleStartTimer}
                      >
                        <Play size={16} />
                        شروع
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="gap-2 text-amber-600"
                        onClick={handleStopTimer}
                      >
                        <StopCircle size={16} />
                        توقف
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={handleResetTimer}
                    >
                      <RotateCcw size={14} />
                      ریست
                    </Button>
                  </div>

                  {/* Estimated vs timer */}
                  {step.estimatedHours != null && (
                    <div className="bg-muted/30 rounded-2xl p-4 text-sm space-y-2">
                      <div className="flex justify-between text-muted-foreground">
                        <span>زمان تخمینی</span>
                        <span className="font-mono">
                          {toPersianDigits(step.estimatedHours)} ساعت
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>زمان سپری شده</span>
                        <span className="font-mono text-primary">
                          {formatTimer(timerSeconds)}
                        </span>
                      </div>
                      {timerSeconds > 0 && Number(step.estimatedHours) > 0 && (
                        <Progress
                          value={Math.min(
                            (timerSeconds / (Number(step.estimatedHours) * 3600)) * 100,
                            100
                          )}
                          className="h-1.5"
                        />
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ── AI Coach ── */}
              <TabsContent value="ai" className="space-y-4">
                {/* AI Guide */}
                <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl p-4 border border-primary/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Sparkles size={16} className="text-primary" />
                      راهنمای گام‌به‌گام
                    </h3>
                    {!aiGuide && !loadingGuide && (
                      <Button
                        variant="soft"
                        size="sm"
                        onClick={fetchGuide}
                        className="text-xs"
                      >
                        <MessageCircle size={14} />
                        دریافت راهنما
                      </Button>
                    )}
                  </div>
                  {loadingGuide ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-3 bg-muted animate-pulse rounded"
                          style={{ width: `${70 + i * 10}%` }}
                        />
                      ))}
                    </div>
                  ) : aiGuide ? (
                    <div className="prose prose-sm max-w-none text-muted-foreground text-sm leading-7 whitespace-pre-line">
                      {aiGuide}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/60">
                      با کلیک روی «دریافت راهنما»، یک راهنمای گام‌به‌گام دریافت کنید.
                    </p>
                  )}
                </div>

                {/* Blocker Resolution */}
                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 space-y-3">
                  <h3 className="text-sm font-bold text-red-600 flex items-center gap-2">
                    <Wrench size={16} className="text-red-500" />
                    رفع مسدودیت
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    اگر در این گام گیر کرده‌اید، مشکل را توضیح دهید تا راه‌حل هوشمند دریافت کنید.
                  </p>

                  {!showBlockedForm && !blockResolution && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => setShowBlockedForm(true)}
                    >
                      <AlertCircle size={14} />
                      گیر کردم — کمک بخواه
                    </Button>
                  )}

                  {showBlockedForm && !blockResolution && (
                    <div className="space-y-2">
                      <Textarea
                        value={blockedReason}
                        onChange={(e) => setBlockedReason(e.target.value)}
                        placeholder="مشکل خود را توضیح دهید..."
                        className="text-sm min-h-[80px] resize-none"
                        dir="rtl"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={handleResolveBlock}
                          disabled={isResolvingBlock || !blockedReason.trim()}
                        >
                          {isResolvingBlock ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Sparkles size={14} />
                          )}
                          دریافت راه‌حل
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowBlockedForm(false);
                            setBlockedReason("");
                          }}
                        >
                          لغو
                        </Button>
                      </div>
                    </div>
                  )}

                  {blockResolution && (
                    <div className="space-y-2">
                      <div className="prose prose-sm max-w-none text-sm text-muted-foreground leading-7 whitespace-pre-line">
                        {blockResolution}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setBlockResolution(null);
                          setShowBlockedForm(false);
                          setBlockedReason("");
                        }}
                      >
                        سوال جدید
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* ─── Footer: status actions ───────────────────────────── */}
          <div className="border-t border-border/50 p-4 bg-card/95 backdrop-blur-xl space-y-2">
            {!isUnlocked ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-xl p-3">
                <AlertCircle size={16} className="text-amber-500" />
                این گام قفل است — پیش‌نیازهای آن را تکمیل کنید.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {status === "todo" && (
                  <Button
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => handleStatusChange("in-progress")}
                  >
                    <Play size={14} />
                    شروع
                  </Button>
                )}
                {status === "in-progress" && (
                  <Button
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => handleStatusChange("todo")}
                  >
                    <RotateCcw size={14} />
                    بازگشت به صف
                  </Button>
                )}
                {(status === "todo" ||
                  status === "in-progress" ||
                  status === "blocked") && (
                  <>
                    <Button
                      variant="outline"
                      className="gap-1.5 text-red-600 hover:text-red-700"
                      onClick={() => handleStatusChange("blocked")}
                    >
                      <AlertCircle size={14} />
                      مسدود
                    </Button>
                    <Button
                      variant="gradient"
                      className="gap-1.5"
                      onClick={() => handleStatusChange("done")}
                    >
                      <CheckCircle2 size={16} />
                      تکمیل شد!
                    </Button>
                  </>
                )}
                {status === "done" && (
                  <>
                    <Button
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => handleStatusChange("todo")}
                    >
                      <RotateCcw size={14} />
                      لغو تکمیل
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-1.5 text-muted-foreground"
                      onClick={() => handleStatusChange("skipped")}
                    >
                      <SkipForward size={14} />
                      رد کردن
                    </Button>
                  </>
                )}
                {status === "skipped" && (
                  <Button
                    variant="outline"
                    className="gap-1.5 col-span-2"
                    onClick={() => handleStatusChange("todo")}
                  >
                    <RotateCcw size={14} />
                    بازگرداندن به صف
                  </Button>
                )}
                {status === "blocked" && (
                  <Button
                    variant="gradient"
                    className="gap-1.5 col-span-2"
                    onClick={() => handleStatusChange("done")}
                  >
                    <CheckCircle2 size={16} />
                    رفع انسداد و تکمیل
                  </Button>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
    </>
  );
}
