"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Target,
    TrendingUp,
    Users,
    MessageSquare,
    Lightbulb,
    CheckCircle,
    Clock,
    Sparkles,
    ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XpBadge } from "./xp-float";

export interface Mission {
    id: string;
    type: "quick_win" | "growth" | "learning" | "action";
    title: string;
    description: string;
    xpReward: number;
    completed: boolean;
    actionPrompt?: string; // Question to send to AI
    expiresAt?: string;
}

interface DailyMissionsProps {
    missions: Mission[];
    onMissionClick: (mission: Mission) => void;
    onMissionComplete: (missionId: string) => void;
}

const missionIcons = {
    quick_win: Sparkles,
    growth: TrendingUp,
    learning: Lightbulb,
    action: Target,
};

const missionColors = {
    quick_win: "from-emerald-500 to-green-600",
    growth: "from-blue-500 to-cyan-500",
    learning: "from-amber-500 to-orange-500",
    action: "from-purple-500 to-pink-500",
};

const missionLabels = {
    quick_win: "سریع",
    growth: "رشد",
    learning: "یادگیری",
    action: "اقدام",
};

export function DailyMissions({ missions, onMissionClick, onMissionComplete }: DailyMissionsProps) {
    const [expanded, setExpanded] = useState(true);

    const completedCount = missions.filter(m => m.completed).length;
    const totalXp = missions.reduce((acc, m) => acc + m.xpReward, 0);
    const earnedXp = missions.filter(m => m.completed).reduce((acc, m) => acc + m.xpReward, 0);

    return (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-lg">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-4 flex items-center justify-between bg-gradient-to-l from-primary/10 to-transparent hover:from-primary/20 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/30">
                        <Target size={20} />
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold text-foreground">ماموریت‌های امروز</h3>
                        <p className="text-xs text-muted-foreground">
                            {completedCount}/{missions.length} انجام شده
                            <span className="text-amber-500 mr-2">⚡ {earnedXp}/{totalXp} XP</span>
                        </p>
                    </div>
                </div>
                <ChevronDown
                    size={20}
                    className={`text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
                />
            </button>

            {/* Progress bar */}
            <div className="h-1 bg-muted">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / missions.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                />
            </div>

            {/* Missions list */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-3 space-y-2"
                    >
                        {missions.map((mission, i) => (
                            <MissionCard
                                key={mission.id}
                                mission={mission}
                                index={i}
                                onClick={() => onMissionClick(mission)}
                                onComplete={() => onMissionComplete(mission.id)}
                            />
                        ))}

                        {missions.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Sparkles size={32} className="mx-auto mb-2 opacity-30" />
                                <p>ماموریت جدید فردا!</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface MissionCardProps {
    mission: Mission;
    index: number;
    onClick: () => void;
    onComplete: () => void;
}

function MissionCard({ mission, index, onClick, onComplete }: MissionCardProps) {
    const Icon = missionIcons[mission.type];
    const gradient = missionColors[mission.type];
    const label = missionLabels[mission.type];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative overflow-hidden rounded-xl border transition-all ${mission.completed
                    ? "bg-muted/30 border-border/30 opacity-60"
                    : "bg-background border-border/50 hover:border-primary/30 hover:shadow-lg cursor-pointer"
                }`}
            onClick={() => !mission.completed && onClick()}
        >
            {/* Completed overlay */}
            {mission.completed && (
                <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center z-10">
                    <CheckCircle size={32} className="text-emerald-500" />
                </div>
            )}

            <div className="p-3 flex items-center gap-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shrink-0 ${mission.completed ? "opacity-30" : "shadow-lg group-hover:scale-110 transition-transform"
                    }`}>
                    <Icon size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={`font-bold text-sm ${mission.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {mission.title}
                        </h4>
                        <Badge variant="secondary" className="text-[9px] px-1.5">
                            {label}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                        {mission.description}
                    </p>
                </div>

                {/* XP Reward */}
                {!mission.completed && (
                    <XpBadge amount={mission.xpReward} variant="small" />
                )}
            </div>

            {/* Hover glow */}
            {!mission.completed && (
                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />
            )}
        </motion.div>
    );
}

// Generate sample missions based on project
export function generateDailyMissions(projectName: string, progressPercent: number): Mission[] {
    const today = new Date().toDateString();

    // Simple deterministic "random" based on date
    const seed = today.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

    const allMissions: Mission[] = [
        {
            id: `${today}-1`,
            type: "quick_win",
            title: "یک سوال بپرس",
            description: "هر سوالی درباره کسب‌وکارت بپرس",
            xpReward: 15,
            completed: false,
            actionPrompt: "سلام، می‌خوام یه سوال بپرسم",
        },
        {
            id: `${today}-2`,
            type: "growth",
            title: "تحلیل یک رقیب",
            description: "از AI بخواه یک رقیب رو تحلیل کنه",
            xpReward: 40,
            completed: false,
            actionPrompt: "لطفا یک رقیب اصلی من رو تحلیل کن",
        },
        {
            id: `${today}-3`,
            type: "learning",
            title: "یک مفهوم یاد بگیر",
            description: "درباره MVP یا مدل کسب‌وکار بپرس",
            xpReward: 25,
            completed: false,
            actionPrompt: "MVP چیه و چطور بسازمش؟",
        },
        {
            id: `${today}-4`,
            type: "action",
            title: "یک محتوا بساز",
            description: "یک پست اینستاگرام برای پروژه بساز",
            xpReward: 50,
            completed: false,
            actionPrompt: `یک پست اینستاگرام جذاب برای ${projectName} بساز`,
        },
    ];

    // Pick 3 missions based on seed
    const selected = allMissions
        .sort((a, b) => ((seed + a.id.charCodeAt(0)) % 10) - ((seed + b.id.charCodeAt(0)) % 10))
        .slice(0, 3);

    return selected;
}
