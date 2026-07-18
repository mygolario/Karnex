"use client";

import { useState, useMemo } from "react";
import {
  X, MessageSquare, History, Sparkles, Settings2, Send, Check,
  Copy, Trash2, RotateCcw, Circle, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/lib/canvas/store";
import { useCanvasActions } from "./canvas-provider";
import { canvasApi } from "@/lib/canvas/api";
import { CARD_COLOR_VARIANTS } from "@/lib/canvas/color-variants";
import type { RightPanelTab, CardColor, CardType, CardData } from "@/lib/canvas/types";
import { getTemplate } from "@/lib/canvas/templates";
import { getCompletenessScore } from "@/lib/canvas/completeness";
import { toPersianDigits } from "@/lib/utils";
import { useProject } from "@/contexts/project-context";
import { useIsMobile } from "@/hooks/use-is-mobile";

const TABS: { id: RightPanelTab; label: string; icon: LucideIcon }[] = [
  { id: "properties", label: "ویژگی‌ها", icon: Settings2 },
  { id: "comments", label: "نظرات", icon: MessageSquare },
  { id: "history", label: "تاریخچه", icon: History },
  { id: "ai", label: "هوش مصنوعی", icon: Sparkles },
];

const COLOR_OPTIONS: CardColor[] = ["yellow", "blue", "green", "pink", "purple", "cyan", "red", "orange"];

export function CanvasRightPanel() {
  const isMobile = useIsMobile();
  const rightPanelOpen = useCanvasStore((s) => s.rightPanelOpen);
  const rightPanelTab = useCanvasStore((s) => s.rightPanelTab);
  const setRightPanelTab = useCanvasStore((s) => s.setRightPanelTab);
  const setRightPanelOpen = useCanvasStore((s) => s.setRightPanelOpen);
  const selectedCardIds = useCanvasStore((s) => s.selectedCardIds);
  const canvasState = useCanvasStore((s) => s.canvasState);
  const canvasType = useCanvasStore((s) => s.canvasType);
  const comments = useCanvasStore((s) => s.comments);
  const versions = useCanvasStore((s) => s.versions);
  const canvasId = useCanvasStore((s) => s.canvasId);
  const addComment = useCanvasStore((s) => s.addComment);
  const resolveComment = useCanvasStore((s) => s.resolveComment);
  const updateCardColor = useCanvasStore((s) => s.updateCardColor);
  const updateCardType = useCanvasStore((s) => s.updateCardType);
  const deleteCard = useCanvasStore((s) => s.deleteCard);
  const duplicateCard = useCanvasStore((s) => s.duplicateCard);

  const { undo, redo, canUndo, canRedo, saveVersion, restoreVersion } = useCanvasActions();
  const { activeProject: plan } = useProject();
  const [newComment, setNewComment] = useState("");

  const selectedCards = useMemo(() => {
    const result: { card: CardData; sectionId: string }[] = [];
    for (const [sectionId, cards] of Object.entries(canvasState)) {
      for (const card of cards) {
        if (selectedCardIds.includes(card.id)) {
          result.push({ card, sectionId });
        }
      }
    }
    return result;
  }, [canvasState, selectedCardIds]);

  const template = getTemplate(canvasType);
  const completeness = getCompletenessScore(canvasState, canvasType);

  const [critiqueResult, setCritiqueResult] = useState<{
    summary?: string;
    recommendations?: string[];
    score?: number;
  } | null>(null);
  const [critiqueLoading, setCritiqueLoading] = useState(false);

  const runCanvasCritique = async () => {
    setCritiqueLoading(true);
    try {
      const summary = Object.entries(canvasState)
        .map(([section, cards]) => `${section}: ${cards.map((c) => c.content).filter(Boolean).join("; ")}`)
        .join("\n");
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-canvas-critique", canvasSummary: summary }),
      });
      const data = await res.json();
      if (data.success) setCritiqueResult(data.critique);
    } finally {
      setCritiqueLoading(false);
    }
  };

  if (!isMobile && !rightPanelOpen) return null;

  const handleAddComment = async () => {
    if (!newComment.trim() || !plan?.id) return;
    const cardId = selectedCards[0]?.card.id;

    const tempComment = {
      id: `comment-${Date.now()}`,
      canvasId: canvasId || "",
      cardId: cardId || null,
      authorId: "me",
      authorName: "شما",
      body: newComment.trim(),
      resolved: false,
      parentId: null,
      createdAt: new Date().toISOString(),
    };
    addComment(tempComment);
    setNewComment("");

    try {
      if (!canvasId) return;
      const saved = await canvasApi.addComment(plan.id, canvasId, newComment.trim(), cardId);
      useCanvasStore.setState({
        comments: useCanvasStore.getState().comments.map((c) => (c.id === tempComment.id ? saved : c)),
      });
    } catch {
      // Comment stays in local state as fallback
    }
  };

  const panelContent = (
    <div className={cn(
      "border-s border-border bg-background/80 backdrop-blur-xl flex flex-col canvas-export-exclude shrink-0",
      isMobile ? "w-full h-full" : "w-72"
    )}>
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setRightPanelTab(tab.id)}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  rightPanelTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title={tab.label}
              >
                <Icon size={15} />
              </button>
            );
          })}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setRightPanelOpen(false)}>
          <X size={14} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {rightPanelTab === "properties" && (
          <>
            {selectedCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                <div className="p-4 rounded-full bg-muted">
                  <Settings2 size={24} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  کارتی را انتخاب کنید تا ویژگی‌های آن نمایش داده شود
                </p>
                <p className="text-[11px] text-muted-foreground/60">
                  برای انتخاب چندگانه: Shift + Click
                </p>
              </div>
            ) : (
              selectedCards.map(({ card, sectionId }) => {
                const section = template.sections.find((s) => s.id === sectionId);
                return (
                  <div key={card.id} className="space-y-3 p-3 rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{section?.title}</Badge>
                      {card.isAIGenerated && (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <Sparkles size={9} /> AI
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">{card.content || "خالی"}</p>

                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">رنگ</label>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {COLOR_OPTIONS.map((c) => {
                          const cv = CARD_COLOR_VARIANTS[c];
                          return (
                            <button
                              key={c}
                              onClick={() => updateCardColor(sectionId, card.id, c)}
                              className={cn(
                                "w-6 h-6 rounded-md border-2 transition-all",
                                cv.bg, cv.border, cv.darkBg, cv.darkBorder,
                                card.color === c ? "ring-2 ring-primary ring-offset-1 scale-110" : "hover:scale-105"
                              )}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">نوع</label>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(["NOTE", "CHECKLIST", "METRIC", "VOTE"] as CardType[]).map((t) => (
                          <button
                            key={t}
                            onClick={() => updateCardType(sectionId, card.id, t)}
                            className={cn(
                              "text-[10px] px-2 py-1 rounded-md border transition-all",
                              card.cardType === t
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-muted-foreground hover:bg-muted"
                            )}
                          >
                            {t === "NOTE" ? "یادداشت" : t === "CHECKLIST" ? "چک‌لیست" : t === "METRIC" ? "معیار" : "رأی"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={() => duplicateCard(sectionId, card.id)}>
                        <Copy size={12} /> تکثیر
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-7 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => deleteCard(sectionId, card.id)}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {rightPanelTab === "comments" && (
          <>
            <div className="space-y-2">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                  <div className="p-4 rounded-full bg-muted">
                    <MessageSquare size={24} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">نظری وجود ندارد</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className={cn("p-2.5 rounded-lg border", comment.resolved ? "bg-muted/30 border-border opacity-60" : "bg-card border-border")}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{comment.authorName}</span>
                      <button onClick={() => resolveComment(comment.id)} className="text-muted-foreground hover:text-green-600">
                        {comment.resolved ? <RotateCcw size={12} /> : <Check size={12} />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">{comment.body}</p>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="نظر خود را بنویسید..."
                  className="text-xs min-h-[60px] resize-none"
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleAddComment(); } }}
                />
                <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send size={14} />
                </Button>
              </div>
              <p className="text-[9px] text-muted-foreground mt-1">Ctrl + Enter برای ارسال</p>
            </div>
          </>
        )}

        {rightPanelTab === "history" && (
          <>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 text-xs h-8" onClick={undo} disabled={!canUndo}>
                <RotateCcw size={12} /> برگشت
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs h-8" onClick={redo} disabled={!canRedo}>
                <History size={12} /> جلو
              </Button>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-8 border-dashed"
              onClick={() => saveVersion()}
            >
              <History size={12} /> ذخیره نسخه فعلی
            </Button>

            {versions.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">نسخه‌های ذخیره‌شده</h4>
                {versions.map((version) => (
                  <div key={version.id} className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{version.name || "نسخه بدون نام"}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(version.createdAt).toLocaleString("fa-IR")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7 shrink-0"
                      onClick={() => restoreVersion(version.id)}
                    >
                      بازیابی
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">امتیاز کامل بودن</h4>
              <div className="space-y-1.5">
                {completeness.perSection.map((s) => {
                  const section = template.sections.find((sec) => sec.id === s.sectionId);
                  return (
                    <div key={s.sectionId} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Circle size={8} className={s.filled ? "text-green-500 fill-green-500" : "text-muted-foreground/30"} />
                        <span className="text-muted-foreground">{section?.title}</span>
                      </div>
                      <span className="text-muted-foreground tabular-nums">{toPersianDigits(s.count)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 p-2.5 rounded-lg bg-muted">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">پیشرفت کلی</span>
                  <span className="font-bold tabular-nums">{toPersianDigits(completeness.percentage)}%</span>
                </div>
                <div className="mt-1.5 w-full h-2 rounded-full bg-background overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500" style={{ width: `${completeness.percentage}%` }} />
                </div>
              </div>
            </div>
          </>
        )}

        {rightPanelTab === "ai" && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-purple-500" />
                <h4 className="text-sm font-bold">دستیار هوش مصنوعی</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                هوش مصنوعی می‌تواند بوم شما را تحلیل کرده و پیشنهاداتی برای بهبود ارائه دهد.
              </p>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-xs h-9" onClick={() => useCanvasStore.getState().setWizardOpen(true)}>
                <Sparkles size={14} className="text-purple-500" />
                راهنمای هوشمند بوم
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-9" onClick={runCanvasCritique} disabled={critiqueLoading}>
                <Sparkles size={14} className="text-blue-500" />
                {critiqueLoading ? "در حال تحلیل..." : "تحلیل و نقد بوم"}
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                <Sparkles size={14} className="text-green-500" />
                سناریوی چه‌می‌شود-اگر
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                <Sparkles size={14} className="text-amber-500" />
                چینش خودکار کارت‌ها
              </Button>
            </div>

            {critiqueResult && (
              <div className="p-3 rounded-lg bg-muted space-y-2 text-xs">
                {critiqueResult.summary && <p>{String(critiqueResult.summary)}</p>}
                {Array.isArray(critiqueResult.recommendations) && (critiqueResult.recommendations as string[]).map((r, i) => (
                  <p key={i} className="text-muted-foreground">• {r}</p>
                ))}
              </div>
            )}

            <div className="p-3 rounded-lg bg-muted">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">تحلیل سریع</h4>
              <div className="space-y-1">
                {completeness.perSection.filter((s) => !s.filled).map((s) => {
                  const section = template.sections.find((sec) => sec.id === s.sectionId);
                  return (
                    <div key={s.sectionId} className="flex items-center gap-1.5 text-xs">
                      <Circle size={8} className="text-amber-500 fill-amber-500" />
                      <span className="text-muted-foreground">{section?.title} خالی است</span>
                    </div>
                  );
                })}
                {completeness.perSection.every((s) => s.filled) && (
                  <p className="text-xs text-green-600 dark:text-green-400">همه بخش‌ها پر شده‌اند!</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
        <SheetContent side="bottom" className="h-[70dvh] p-0 rounded-t-2xl">
          {panelContent}
        </SheetContent>
      </Sheet>
    );
  }

  if (!rightPanelOpen) return null;
  return panelContent;
}
