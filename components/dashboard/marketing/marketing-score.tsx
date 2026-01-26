"use client";

import React from "react";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Sparkles, Target, BarChart3, MessageSquare, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MarketingScoreProps {
    score?: number;
    previousScore?: number;
    breakdown?: {
        content: number;
        channels: number;
        consistency: number;
        engagement: number;
    };
}

export function MarketingScore({
    score = 72,
    previousScore = 68,
    breakdown = { content: 75, channels: 65, consistency: 80, engagement: 68 }
}: MarketingScoreProps) {
    const trend = score - previousScore;
    const trendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
    const trendColor = trend > 0 ? "text-emerald-500" : trend < 0 ? "text-rose-500" : "text-muted-foreground";

    const categories = [
        { key: "content", label: "محتوا", icon: MessageSquare, color: "from-violet-500 to-purple-500" },
        { key: "channels", label: "کانال‌ها", icon: BarChart3, color: "from-blue-500 to-cyan-500" },
        { key: "consistency", label: "استمرار", icon: Target, color: "from-emerald-500 to-teal-500" },
        { key: "engagement", label: "تعامل", icon: Zap, color: "from-amber-500 to-orange-500" },
    ];

    const getScoreColor = (s: number) => {
        if (s >= 80) return "text-emerald-500";
        if (s >= 60) return "text-amber-500";
        return "text-rose-500";
    };

    const getScoreGradient = (s: number) => {
        if (s >= 80) return "from-emerald-500 to-teal-500";
        if (s >= 60) return "from-amber-500 to-orange-500";
        return "from-rose-500 to-red-500";
    };

    // Calculate stroke dasharray for circular progress
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <Card variant="default" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex flex-col lg:flex-row gap-6 items-center">
                {/* Score Circle */}
                <div className="relative flex-shrink-0">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-muted/20"
                        />
                        {/* Progress circle */}
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            strokeWidth="8"
                            strokeLinecap="round"
                            className={cn("stroke-current", getScoreColor(score))}
                            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </svg>

                    {/* Score number */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            className={cn("text-3xl font-black", getScoreColor(score))}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                        >
                            {score}
                        </motion.span>
                        <span className="text-xs text-muted-foreground font-medium">امتیاز</span>
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4 w-full">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} className="text-primary" />
                            <h3 className="font-bold text-foreground">سلامت بازاریابی</h3>
                        </div>
                        <Badge variant="outline" className={cn("gap-1", trendColor)}>
                            {React.createElement(trendIcon, { size: 12 })}
                            {trend > 0 ? `+${trend}` : trend}% از هفته قبل
                        </Badge>
                    </div>

                    {/* Category breakdown */}
                    <div className="grid grid-cols-2 gap-3">
                        {categories.map((cat, idx) => (
                            <motion.div
                                key={cat.key}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                                className="flex items-center gap-3 p-2 rounded-xl bg-muted/30"
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br shadow-sm",
                                    cat.color
                                )}>
                                    <cat.icon size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-muted-foreground truncate">{cat.label}</div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                className={cn("h-full rounded-full bg-gradient-to-r", cat.color)}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${breakdown[cat.key as keyof typeof breakdown]}%` }}
                                                transition={{ delay: 0.5 + idx * 0.1, duration: 0.8 }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-foreground w-8">
                                            {breakdown[cat.key as keyof typeof breakdown]}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
