"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakDisplayProps {
    streak: number;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    animate?: boolean;
}

export function StreakDisplay({
    streak,
    size = "md",
    showLabel = true,
    animate = true
}: StreakDisplayProps) {
    const sizes = {
        sm: {
            container: "gap-1",
            icon: 14,
            text: "text-sm",
            label: "text-[10px]",
        },
        md: {
            container: "gap-1.5",
            icon: 18,
            text: "text-lg",
            label: "text-xs",
        },
        lg: {
            container: "gap-2",
            icon: 24,
            text: "text-2xl",
            label: "text-sm",
        },
    };

    const s = sizes[size];

    // Colors based on streak milestones
    const getStreakColor = () => {
        if (streak >= 30) return "from-purple-500 to-pink-500"; // Epic
        if (streak >= 14) return "from-red-500 to-orange-500"; // Fire
        if (streak >= 7) return "from-orange-500 to-amber-500"; // Hot
        if (streak >= 3) return "from-amber-400 to-yellow-500"; // Warm
        return "from-slate-400 to-slate-500"; // Starting
    };

    const getStreakEmoji = () => {
        if (streak >= 30) return "💎";
        if (streak >= 14) return "🔥";
        if (streak >= 7) return "⚡";
        if (streak >= 3) return "✨";
        return "🌱";
    };

    if (streak <= 0) {
        return (
            <div className={`flex items-center ${s.container} text-muted-foreground`}>
                <Flame size={s.icon} className="opacity-30" />
                {showLabel && (
                    <span className={s.label}>استریک نداری</span>
                )}
            </div>
        );
    }

    return (
        <motion.div
            initial={animate ? { scale: 0.8, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex items-center ${s.container}`}
        >
            {/* Fire icon with gradient */}
            <motion.div
                animate={animate && streak >= 3 ? {
                    scale: [1, 1.1, 1],
                } : {}}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                className={`relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br ${getStreakColor()} shadow-lg`}
                style={{
                    boxShadow: streak >= 7 ? "0 0 20px rgba(251, 146, 60, 0.5)" : undefined,
                }}
            >
                <span className="text-base">{getStreakEmoji()}</span>

                {/* Glow effect for high streaks */}
                {streak >= 7 && (
                    <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-orange-400 blur-md -z-10"
                    />
                )}
            </motion.div>

            {/* Streak count */}
            <div className="flex flex-col">
                <motion.span
                    key={streak}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`font-black ${s.text} bg-gradient-to-r ${getStreakColor()} bg-clip-text text-transparent`}
                >
                    {streak}
                </motion.span>
                {showLabel && (
                    <span className={`${s.label} text-muted-foreground -mt-0.5`}>
                        روز
                    </span>
                )}
            </div>
        </motion.div>
    );
}

// Compact streak for header
export function StreakBadge({ streak }: { streak: number }) {
    if (streak <= 0) return null;

    const getColor = () => {
        if (streak >= 14) return "bg-gradient-to-r from-red-500 to-orange-500";
        if (streak >= 7) return "bg-gradient-to-r from-orange-500 to-amber-500";
        return "bg-gradient-to-r from-amber-400 to-yellow-500";
    };

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-bold ${getColor()} shadow-lg`}
        >
            <span>🔥</span>
            <span>{streak}</span>
        </motion.div>
    );
}

// Streak milestone celebration trigger
export function useStreakMilestone(streak: number, previousStreak: number) {
    const milestones = [3, 7, 14, 30, 50, 100];

    for (const milestone of milestones) {
        if (streak >= milestone && previousStreak < milestone) {
            return {
                reached: true,
                milestone,
                message: getStreakMessage(milestone),
            };
        }
    }

    return { reached: false, milestone: 0, message: "" };
}

function getStreakMessage(milestone: number): string {
    switch (milestone) {
        case 3: return "۳ روز متوالی! شروع عالی! ✨";
        case 7: return "یک هفته کامل! داری حرفه‌ای می‌شی! ⚡";
        case 14: return "۲ هفته! استریک آتشین! 🔥";
        case 30: return "یک ماه! افسانه‌ای! 💎";
        case 50: return "۵۰ روز! تو یه قهرمانی! 🏆";
        case 100: return "۱۰۰ روز! باورنکردنی! 👑";
        default: return "ادامه بده!";
    }
}
