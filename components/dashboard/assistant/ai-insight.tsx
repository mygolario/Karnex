"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronRight, ChevronLeft, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { XpBadge } from "./xp-float";

export interface AIInsight {
    id: string;
    title: string;
    content: string;
    action?: string;
    actionPrompt?: string;
    xpReward?: number;
    category: "tip" | "fact" | "suggestion" | "motivation";
}

interface AIInsightCardProps {
    insights: AIInsight[];
    onAction?: (insight: AIInsight) => void;
    onDismiss?: (insightId: string) => void;
}

const categoryEmojis = {
    tip: "💡",
    fact: "📊",
    suggestion: "🎯",
    motivation: "💪",
};

const categoryColors = {
    tip: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
    fact: "from-blue-500/10 to-cyan-500/10 border-blue-500/20",
    suggestion: "from-purple-500/10 to-pink-500/10 border-purple-500/20",
    motivation: "from-emerald-500/10 to-green-500/10 border-emerald-500/20",
};

export function AIInsightCard({ insights, onAction, onDismiss }: AIInsightCardProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    const activeInsights = insights.filter(i => !dismissed.has(i.id));
    const currentInsight = activeInsights[currentIndex % activeInsights.length];

    // Auto-rotate every 10 seconds
    useEffect(() => {
        if (activeInsights.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % activeInsights.length);
        }, 10000);

        return () => clearInterval(interval);
    }, [activeInsights.length]);

    const handleDismiss = (id: string) => {
        setDismissed(prev => new Set([...prev, id]));
        onDismiss?.(id);
    };

    const handleAction = (insight: AIInsight) => {
        onAction?.(insight);
        handleDismiss(insight.id);
    };

    if (!currentInsight || activeInsights.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-visible rounded-2xl bg-gradient-to-br ${categoryColors[currentInsight.category]} border p-4`}
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-xl"
                        >
                            {categoryEmojis[currentInsight.category]}
                        </motion.span>
                        <span className="font-bold text-sm text-foreground">نکته امروز</span>
                    </div>

                    {/* Navigation dots */}
                    {activeInsights.length > 1 && (
                        <div className="flex items-center gap-1">
                            {activeInsights.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex % activeInsights.length
                                        ? "bg-primary w-3"
                                        : "bg-muted-foreground/30"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentInsight.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h4 className="font-bold text-foreground mb-1 text-sm">{currentInsight.title}</h4>
                        <p className="text-xs text-muted-foreground leading-6 mb-3">
                            {currentInsight.content}
                        </p>

                        {/* Action button */}
                        {currentInsight.action && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                    variant="gradient"
                                    size="sm"
                                    onClick={() => handleAction(currentInsight)}
                                    className="gap-1.5 text-xs h-8"
                                >
                                    <Sparkles size={12} />
                                    {currentInsight.action}
                                </Button>
                                {currentInsight.xpReward && (
                                    <XpBadge amount={currentInsight.xpReward} variant="inline" />
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// Single insight display (simpler version)
export function AIInsightSimple({ insight, onAction }: { insight: AIInsight; onAction?: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20"
        >
            <div className="flex items-start gap-3">
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-2xl shrink-0"
                >
                    💡
                </motion.div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-7">{insight.content}</p>
                    {insight.action && onAction && (
                        <button
                            onClick={onAction}
                            className="text-xs text-primary hover:text-primary/80 font-bold mt-2 flex items-center gap-1"
                        >
                            {insight.action}
                            <ChevronLeft size={12} />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// Generate sample insights
export function generateDailyInsights(projectName: string): AIInsight[] {
    const today = new Date().toDateString();

    return [
        {
            id: `insight-${today}-1`,
            category: "tip",
            title: "میدونستی؟",
            content: `پروژه‌هایی که اول ۱۰ مشتری واقعی پیدا می‌کنن، ۵ برابر موفق‌ترن! شروع کن با نزدیک‌ترین‌ها.`,
            action: "چطور اولین مشتری‌هام رو پیدا کنم؟",
            actionPrompt: "چطور می‌تونم اولین ۱۰ مشتری واقعی پروژه‌ام رو پیدا کنم؟",
            xpReward: 10,
        },
        {
            id: `insight-${today}-2`,
            category: "suggestion",
            title: `پیشنهاد برای ${projectName}`,
            content: "یه ویدیوی ساده معرفی محصول بساز. حتی با موبایل! ۷۰% مشتری‌ها ترجیح میدن ویدیو ببینن.",
            action: "چطور ویدیو بسازم؟",
            actionPrompt: "چطور یک ویدیوی معرفی ساده برای پروژه‌ام بسازم؟",
            xpReward: 15,
        },
        {
            id: `insight-${today}-3`,
            category: "motivation",
            title: "یادت باشه",
            content: "هر روز یه قدم کوچک، بهتر از یه جهش بزرگ بدون عمله. قدم امروز چیه؟ 🚀",
        },
    ];
}
