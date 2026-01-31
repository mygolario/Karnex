"use client";

import { motion } from "framer-motion";
import { Instagram, Mail, Globe, MessageCircle, TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Channel {
    id: string;
    name: string;
    icon: React.ElementType;
    score: number;
    trend: number;
    action: string;
    color: string;
    bgColor: string;
}

const defaultChannels: Channel[] = [
    {
        id: "instagram",
        name: "اینستاگرام",
        icon: Instagram,
        score: 78,
        trend: 12,
        action: "پست جدید منتشر کن",
        color: "text-pink-500",
        bgColor: "from-pink-500 to-rose-500"
    },
    {
        id: "email",
        name: "ایمیل",
        icon: Mail,
        score: 45,
        trend: -5,
        action: "لیست ایمیل بساز",
        color: "text-blue-500",
        bgColor: "from-blue-500 to-cyan-500"
    },
    {
        id: "website",
        name: "وبسایت",
        icon: Globe,
        score: 62,
        trend: 8,
        action: "SEO را بهبود بده",
        color: "text-emerald-500",
        bgColor: "from-emerald-500 to-teal-500"
    },
    {
        id: "telegram",
        name: "تلگرام",
        icon: MessageCircle,
        score: 55,
        trend: 0,
        action: "کانال بساز",
        color: "text-sky-500",
        bgColor: "from-sky-500 to-blue-500"
    },
];

interface ChannelCardsProps {
    channels?: Channel[];
}

export function ChannelCards({ channels = defaultChannels }: ChannelCardsProps) {
    const getTrendIcon = (trend: number) => {
        if (trend > 0) return TrendingUp;
        if (trend < 0) return TrendingDown;
        return Minus;
    };

    const getTrendColor = (trend: number) => {
        if (trend > 0) return "text-emerald-500";
        if (trend < 0) return "text-rose-500";
        return "text-muted-foreground";
    };

    // Calculate circular progress
    const getCircleProps = (score: number) => {
        const circumference = 2 * Math.PI * 18;
        const offset = circumference - (score / 100) * circumference;
        return { circumference, offset };
    };

    return (
        <Card variant="default" className="relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-foreground">عملکرد کانال‌ها</h3>
                    <p className="text-xs text-muted-foreground">Channel Performance</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {channels.map((channel, idx) => {
                    const { circumference, offset } = getCircleProps(channel.score);
                    const TrendIcon = getTrendIcon(channel.trend);

                    return (
                        <motion.div
                            key={channel.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-border/50"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br shadow-sm",
                                    channel.bgColor
                                )}>
                                    <channel.icon size={16} />
                                </div>
                                <div>
                                    <div className="font-bold text-foreground text-sm">{channel.name}</div>
                                    <div className={cn("flex items-center gap-1 text-xs", getTrendColor(channel.trend))}>
                                        <TrendIcon size={10} />
                                        {channel.trend > 0 ? `+${channel.trend}%` : `${channel.trend}%`}
                                    </div>
                                </div>
                            </div>

                            {/* Progress circle */}
                            <div className="flex items-center justify-between">
                                <div className="relative w-12 h-12">
                                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                                        <circle
                                            cx="22"
                                            cy="22"
                                            r="18"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            className="text-muted/30"
                                        />
                                        <motion.circle
                                            cx="22"
                                            cy="22"
                                            r="18"
                                            fill="none"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            className={channel.color}
                                            stroke="currentColor"
                                            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                                            animate={{ strokeDashoffset: offset }}
                                            transition={{ delay: 0.3 + idx * 0.1, duration: 0.8 }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-bold text-foreground">{channel.score}</span>
                                    </div>
                                </div>

                                {/* Action button */}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs opacity-70 group-hover:opacity-100 h-7 px-2"
                                >
                                    {channel.action}
                                </Button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </Card>
    );
}
