"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutGrid,
    Map,
    Megaphone,
    BarChart3,
    Wand2,
    Check,
    X,
    Loader2,
    ChevronDown,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XpBadge } from "./xp-float";

export type ActionType =
    | "update_canvas"
    | "add_roadmap_step"
    | "generate_content"
    | "analyze_competitors"
    | "improve_strategy";

export interface ActionCard {
    id: string;
    type: ActionType;
    title: string;
    description: string;
    preview?: string;
    targetField?: string;
    newValue?: string;
    xpReward: number;
}

interface ActionCardProps {
    action: ActionCard;
    onApply: (action: ActionCard) => Promise<void>;
    onDismiss: (actionId: string) => void;
}

const actionIcons = {
    update_canvas: LayoutGrid,
    add_roadmap_step: Map,
    generate_content: Megaphone,
    analyze_competitors: BarChart3,
    improve_strategy: Wand2,
};

const actionColors = {
    update_canvas: "from-amber-500 to-orange-500",
    add_roadmap_step: "from-blue-500 to-cyan-500",
    generate_content: "from-rose-500 to-pink-500",
    analyze_competitors: "from-emerald-500 to-teal-500",
    improve_strategy: "from-purple-500 to-indigo-500",
};

const actionLabels = {
    update_canvas: "بوم کسب‌وکار",
    add_roadmap_step: "نقشه راه",
    generate_content: "محتوا",
    analyze_competitors: "رقبا",
    improve_strategy: "استراتژی",
};

export function SmartActionCard({ action, onApply, onDismiss }: ActionCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isApplied, setIsApplied] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const Icon = actionIcons[action.type];
    const gradient = actionColors[action.type];
    const label = actionLabels[action.type];

    const handleApply = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await onApply(action);
            setIsApplied(true);

            // Auto-dismiss after success
            setTimeout(() => {
                onDismiss(action.id);
            }, 2000);
        } catch (err) {
            setError("خطا در اعمال تغییرات");
        } finally {
            setIsLoading(false);
        }
    };

    if (isApplied) {
        return (
            <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.02, 1] }}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5"
            >
                <div className="flex items-center justify-center gap-3 text-emerald-600">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Check size={28} />
                    </motion.div>
                    <div className="text-center">
                        <p className="font-bold">اعمال شد!</p>
                        <XpBadge amount={action.xpReward} variant="small" />
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-card rounded-2xl border border-border/50 shadow-lg hover:shadow-xl transition-shadow"
        >
            {/* Gradient top bar */}
            <div className={`h-1 bg-gradient-to-r ${gradient}`} />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg shrink-0`}>
                        <Icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-[10px]">{label}</Badge>
                            <XpBadge amount={action.xpReward} variant="inline" />
                        </div>
                        <h3 className="font-bold text-foreground">{action.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                    </div>
                </div>

                {/* Preview section */}
                {action.preview && (
                    <div className="mb-4">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Eye size={14} />
                            <span>پیش‌نمایش تغییرات</span>
                            <ChevronDown
                                size={14}
                                className={`transition-transform ${showPreview ? "rotate-180" : ""}`}
                            />
                        </button>

                        <AnimatePresence>
                            {showPreview && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-3 bg-muted/50 rounded-xl p-4 text-sm"
                                >
                                    {action.targetField && (
                                        <div className="text-xs text-muted-foreground mb-2">
                                            فیلد: <span className="font-bold">{action.targetField}</span>
                                        </div>
                                    )}
                                    <div className="bg-background rounded-lg p-3 border border-border/50">
                                        <p className="text-foreground leading-7">{action.preview}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="gradient"
                        size="sm"
                        onClick={handleApply}
                        disabled={isLoading}
                        className="flex-1 gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                در حال اعمال...
                            </>
                        ) : (
                            <>
                                <Check size={16} />
                                اعمال و دریافت XP
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDismiss(action.id)}
                        disabled={isLoading}
                        className="text-muted-foreground hover:text-destructive"
                    >
                        <X size={16} />
                    </Button>
                </div>
            </div>

            {/* Decorative background */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full blur-2xl pointer-events-none`} />
        </motion.div>
    );
}

// Compact action card for inline display
export function CompactActionCard({ action, onApply }: { action: ActionCard; onApply: () => void }) {
    const Icon = actionIcons[action.type];
    const gradient = actionColors[action.type];

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onApply}
            className="w-full text-right bg-card hover:bg-muted/50 border border-border/50 hover:border-primary/30 rounded-xl p-3 transition-all group"
        >
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{action.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                </div>
                <XpBadge amount={action.xpReward} variant="inline" />
            </div>
        </motion.button>
    );
}
