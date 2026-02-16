"use client";

import { useState } from "react";
import {
    X, Clock, Flag, FolderOpen, ExternalLink,
    Sparkles, Loader2, CheckCircle2, ListTree,
    MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";

interface RoadmapStep {
    title: string;
    description?: string;
    estimatedHours?: number | string;
    priority?: 'high' | 'medium' | 'low' | string;
    category?: string;
    resources?: string[];
}

interface SubTask {
    parentStep: string;
    text: string;
    isCompleted: boolean;
}

interface StepDetailModalProps {
    step: RoadmapStep;
    phaseName: string;
    weekNumber?: number;
    isOpen: boolean;
    onClose: () => void;
    isCompleted: boolean;
    onToggleComplete: () => void;
    subTasks: SubTask[];
    onSubTaskToggle: (subTask: SubTask) => void;
    onBreakTask: () => void;
    isBreakingTask: boolean;
    projectName?: string;
}

export function StepDetailModal({
    step,
    phaseName,
    weekNumber,
    isOpen,
    onClose,
    isCompleted,
    onToggleComplete,
    subTasks,
    onSubTaskToggle,
    onBreakTask,
    isBreakingTask,
    projectName
}: StepDetailModalProps) {
    const [aiTip, setAiTip] = useState<string | null>(null);
    const [loadingTip, setLoadingTip] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500/10 text-red-600 border-red-500/20';
            case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'low': return 'bg-green-500/10 text-green-600 border-green-500/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getPriorityLabel = (priority?: string) => {
        switch (priority) {
            case 'high': return 'اولویت بالا';
            case 'medium': return 'اولویت متوسط';
            case 'low': return 'اولویت پایین';
            default: return 'بدون اولویت';
        }
    };

    const handleGetTip = async () => {
        setLoadingTip(true);
        try {
            const { chatAction } = await import("@/lib/chat-actions");
            const result = await chatAction(
                `برای انجام این کار راهنمایی کن: "${step.title}"`,
                { projectName, overview: step.description, projectType: "startup" }, // Defaulting projectType, ideally should be passed prop
                false
            );

            if (result.success) {
                setAiTip(result.reply || 'نکته‌ای یافت نشد.');
            } else if (result.error === 'AI_LIMIT_REACHED') {
                 setShowLimitModal(true);
                 setAiTip('اعتبار هوش مصنوعی شما تمام شده است.');
            } else {
                 setAiTip('خطا در دریافت راهنمایی');
            }
        } catch (error) {
            setAiTip('خطا در دریافت راهنمایی');
        } finally {
            setLoadingTip(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-card rounded-3xl shadow-2xl border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-card/95 backdrop-blur-xl border-b border-border/50 p-6 z-10">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    {weekNumber && (
                                        <Badge variant="outline" className="text-xs">
                                            هفته {weekNumber}
                                        </Badge>
                                    )}
                                    <Badge variant="secondary" className="text-xs">
                                        {phaseName}
                                    </Badge>
                                    {step.category && (
                                        <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                                            <FolderOpen size={10} className="ml-1" />
                                            {step.category}
                                        </Badge>
                                    )}
                                </div>
                                <h2 className={cn(
                                    "text-xl font-bold text-foreground leading-tight",
                                    isCompleted && "line-through text-muted-foreground"
                                )}>
                                    {step.title}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 mt-4 flex-wrap">
                            {step.estimatedHours && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Clock size={14} className="text-primary" />
                                    <span>{step.estimatedHours} ساعت</span>
                                </div>
                            )}
                            {step.priority && (
                                <Badge variant="outline" className={cn("text-xs", getPriorityColor(step.priority))}>
                                    <Flag size={10} className="ml-1" />
                                    {getPriorityLabel(step.priority)}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Description */}
                        {step.description && (
                            <div>
                                <h3 className="text-sm font-bold text-foreground mb-2">توضیحات</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        )}

                        {/* Sub-tasks */}
                        {subTasks.length > 0 && (
                            <div className="bg-muted/30 rounded-2xl p-4">
                                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                    <ListTree size={16} className="text-primary" />
                                    گام‌های کوچکتر
                                </h3>
                                <div className="space-y-2">
                                    {subTasks.map((sub, i) => (
                                        <button
                                            key={i}
                                            onClick={() => onSubTaskToggle(sub)}
                                            className={cn(
                                                "flex items-center gap-3 w-full text-right p-3 rounded-xl transition-all",
                                                sub.isCompleted
                                                    ? "bg-muted/50 opacity-60"
                                                    : "hover:bg-background bg-background/50"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                                sub.isCompleted
                                                    ? "bg-primary border-primary text-white"
                                                    : "border-muted-foreground/30"
                                            )}>
                                                {sub.isCompleted && <CheckCircle2 size={12} />}
                                            </div>
                                            <span className={cn(
                                                "text-sm",
                                                sub.isCompleted && "line-through text-muted-foreground"
                                            )}>
                                                {sub.text}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Break Task Button */}
                        {!isCompleted && subTasks.length === 0 && (
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

                        {/* AI Tip Section */}
                        <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl p-4 border border-primary/10">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Sparkles size={16} className="text-primary" />
                                    راهنمای هوشمند
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleGetTip}
                                    disabled={loadingTip}
                                    className="text-xs"
                                >
                                    {loadingTip ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <>
                                            <MessageCircle size={14} className="ml-1" />
                                            راهنمایی بگیر
                                        </>
                                    )}
                                </Button>
                            </div>
                            {aiTip && (
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {aiTip}
                                </p>
                            )}
                            {!aiTip && !loadingTip && (
                                <p className="text-xs text-muted-foreground/60">
                                    برای دریافت نکته و راهنمایی کلیک کنید
                                </p>
                            )}
                        </div>

                        {/* Resources */}
                        {step.resources && step.resources.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-foreground mb-3">منابع مفید</h3>
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
                    </div>

                    {/* Footer Actions */}
                    <div className="sticky bottom-0 bg-card/95 backdrop-blur-xl border-t border-border/50 p-4 flex gap-3">
                        <Button
                            variant={isCompleted ? "outline" : "gradient"}
                            className="flex-1 gap-2"
                            onClick={onToggleComplete}
                        >
                            <CheckCircle2 size={18} />
                            {isCompleted ? "لغو تکمیل" : "تکمیل شد!"}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={onClose}
                        >
                            بستن
                        </Button>
                    </div>
                </motion.div>

                
                <LimitReachedModal 
                    isOpen={showLimitModal} 
                    onClose={() => setShowLimitModal(false)}
                    zIndex={60} // Higher z-index to show above this modal
                />
            </motion.div>
        </AnimatePresence>
    );
}
