"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles, Sun, Moon, CloudSun, Target, Zap } from "lucide-react";
import { StreakBadge } from "./streak-display";
import { XpCounter } from "./xp-float";

interface DailyGreetingProps {
    userName?: string;
    projectName?: string;
    streak: number;
    totalXp: number;
    progressPercent: number;
    todayMission?: string;
}

export function DailyGreeting({
    userName = "دوست من",
    projectName,
    streak,
    totalXp,
    progressPercent,
    todayMission,
}: DailyGreetingProps) {
    const [greeting, setGreeting] = useState("سلام");
    const [TimeIcon, setTimeIcon] = useState<typeof Sun>(Sun);
    const [emoji, setEmoji] = useState("👋");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            setGreeting("صبح بخیر");
            setTimeIcon(Sun);
            setEmoji("☀️");
        } else if (hour >= 12 && hour < 17) {
            setGreeting("ظهر بخیر");
            setTimeIcon(CloudSun);
            setEmoji("🌤️");
        } else if (hour >= 17 && hour < 21) {
            setGreeting("عصر بخیر");
            setTimeIcon(CloudSun);
            setEmoji("🌅");
        } else {
            setGreeting("شب بخیر");
            setTimeIcon(Moon);
            setEmoji("🌙");
        }
    }, []);

    // Get encouraging message based on progress/streak
    const getEncouragement = () => {
        if (streak >= 7) return "چه استریک فوق‌العاده‌ای داری! 🔥";
        if (progressPercent >= 75) return "عالیه! تا موفقیت فاصله‌ای نیست! 🚀";
        if (progressPercent >= 50) return "نیمه راه رو رد کردی! ادامه بده! 💪";
        if (progressPercent >= 25) return "شروع خوبی داشتی! 🌟";
        return "امروز یه قدم جلو برو! 🎯";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-indigo-700 text-white p-4 shadow-2xl shadow-primary/30"
        >
            {/* Background decorations */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-secondary/20 rounded-full blur-3xl" />

            <div className="relative z-10">
                {/* Top bar with stats */}
                <div className="flex items-center justify-between mb-4">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <TimeIcon size={24} className="text-white/80" />
                    </motion.div>
                    <div className="flex items-center gap-2">
                        <StreakBadge streak={streak} />
                        <div className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm flex items-center gap-1">
                            <XpCounter value={totalXp} className="text-white text-xs" />
                        </div>
                    </div>
                </div>

                {/* Main greeting */}
                <div className="mb-4">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3"
                    >
                        {greeting}، {userName.split(" ")[0]}!
                        <motion.span
                            animate={{ rotate: [0, 20, 0] }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            {emoji}
                        </motion.span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/80 text-lg"
                    >
                        {getEncouragement()}
                    </motion.p>
                </div>

                {/* Project progress - only show if there's progress */}
                {projectName && progressPercent > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/15 backdrop-blur-sm rounded-xl p-3 mb-3"
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                                <Target size={14} />
                                <span className="font-bold text-xs">{projectName}</span>
                            </div>
                            <span className="text-xs font-bold">{progressPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-secondary to-emerald-400 rounded-full"
                            />
                        </div>
                    </motion.div>
                )}

                {/* Today's mission teaser */}
                {todayMission && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20"
                    >
                        <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-900 flex items-center justify-center">
                            <Zap size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                ماموریت امروز
                            </p>
                            <p className="text-sm font-medium truncate">{todayMission}</p>
                        </div>
                        <Sparkles size={16} className="text-amber-400 animate-pulse" />
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
