"use client";

import { motion } from "framer-motion";
import { Users, Eye, Heart, ShoppingCart, ArrowDown, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FunnelStage {
    id: string;
    label: string;
    labelEn: string;
    icon: React.ElementType;
    percentage: number;
    color: string;
    tip: string;
}

const defaultStages: FunnelStage[] = [
    {
        id: "awareness",
        label: "آگاهی",
        labelEn: "Awareness",
        icon: Eye,
        percentage: 100,
        color: "from-violet-500 to-purple-500",
        tip: "محتوای ویروسی و حضور در شبکه‌های اجتماعی"
    },
    {
        id: "interest",
        label: "علاقه",
        labelEn: "Interest",
        icon: Heart,
        percentage: 60,
        color: "from-blue-500 to-cyan-500",
        tip: "ایمیل‌های جذاب و محتوای آموزشی رایگان"
    },
    {
        id: "decision",
        label: "تصمیم",
        labelEn: "Decision",
        icon: Users,
        percentage: 35,
        color: "from-amber-500 to-orange-500",
        tip: "نظرات مشتریان و مقایسه با رقبا"
    },
    {
        id: "action",
        label: "خرید",
        labelEn: "Action",
        icon: ShoppingCart,
        percentage: 12,
        color: "from-emerald-500 to-teal-500",
        tip: "تخفیف‌های محدود و CTA قوی"
    },
];

interface MarketingFunnelProps {
    stages?: FunnelStage[];
}

export function MarketingFunnel({ stages = defaultStages }: MarketingFunnelProps) {
    return (
        <Card variant="default" className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <Users size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-foreground">قیف بازاریابی</h3>
                    <p className="text-xs text-muted-foreground">Marketing Funnel</p>
                </div>
            </div>

            <div className="space-y-3">
                {stages.map((stage, idx) => (
                    <motion.div
                        key={stage.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.15 }}
                        className="group relative"
                    >
                        <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br shadow-md transition-transform group-hover:scale-110",
                                stage.color
                            )}>
                                <stage.icon size={18} />
                            </div>

                            {/* Progress bar container */}
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-foreground">{stage.label}</span>
                                        <span className="text-xs text-muted-foreground">({stage.labelEn})</span>
                                    </div>
                                    <Badge variant="secondary" className="font-bold">
                                        {stage.percentage}%
                                    </Badge>
                                </div>

                                {/* Progress bar */}
                                <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                                    <motion.div
                                        className={cn("h-full rounded-full bg-gradient-to-r", stage.color)}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stage.percentage}%` }}
                                        transition={{ delay: 0.3 + idx * 0.15, duration: 0.8, ease: "easeOut" }}
                                    />
                                </div>

                                {/* Tip on hover */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <Lightbulb size={12} className="text-amber-500" />
                                    {stage.tip}
                                </div>
                            </div>
                        </div>

                        {/* Arrow connector */}
                        {idx < stages.length - 1 && (
                            <div className="flex justify-center py-1">
                                <ArrowDown size={16} className="text-muted-foreground/50" />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Conversion rate */}
            <div className="mt-6 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">نرخ تبدیل کل:</span>
                    <Badge variant="outline" className="font-bold text-emerald-600 border-emerald-200 bg-emerald-50">
                        {stages[stages.length - 1]?.percentage}%
                    </Badge>
                </div>
            </div>
        </Card>
    );
}
