"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Instagram, Mail, Globe, MessageCircle, Plus, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ContentItem {
    id: string;
    channel: "instagram" | "email" | "website" | "telegram";
    title: string;
    time?: string;
}

interface DayContent {
    day: string;
    dayName: string;
    items: ContentItem[];
    isToday?: boolean;
}

const channelIcons = {
    instagram: Instagram,
    email: Mail,
    website: Globe,
    telegram: MessageCircle,
};

const channelColors = {
    instagram: "bg-pink-500",
    email: "bg-blue-500",
    website: "bg-emerald-500",
    telegram: "bg-sky-500",
};

// Sample data for the week
const generateWeekData = (): DayContent[] => {
    const days = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
    const dayNames = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

    return days.map((day, idx) => ({
        day,
        dayName: dayNames[idx],
        isToday: idx === 2, // Wednesday as today for demo
        items: idx === 0 ? [
            { id: "1", channel: "instagram", title: "پست معرفی محصول", time: "10:00" },
        ] : idx === 2 ? [
            { id: "2", channel: "instagram", title: "استوری تخفیف", time: "14:00" },
            { id: "3", channel: "email", title: "خبرنامه هفتگی", time: "18:00" },
        ] : idx === 4 ? [
            { id: "4", channel: "telegram", title: "پست آموزشی", time: "12:00" },
        ] : idx === 5 ? [
            { id: "5", channel: "website", title: "مقاله بلاگ", time: "09:00" },
        ] : [],
    }));
};

interface ContentCalendarProps {
    onAddContent?: () => void;
}

export function ContentCalendar({ onAddContent }: ContentCalendarProps) {
    const [weekData] = useState(generateWeekData);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    return (
        <Card variant="default" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground">تقویم محتوا</h3>
                        <p className="text-xs text-muted-foreground">Content Calendar</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight size={16} />
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground">بهمن ۱۴۰۴</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronLeft size={16} />
                    </Button>
                </div>
            </div>

            {/* Week view */}
            <div className="grid grid-cols-7 gap-2">
                {weekData.map((dayData, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedDay(selectedDay === idx ? null : idx)}
                        className={cn(
                            "relative p-2 rounded-xl cursor-pointer transition-all min-h-[100px] border",
                            dayData.isToday
                                ? "bg-primary/10 border-primary/30"
                                : "bg-muted/30 border-transparent hover:border-border/50",
                            selectedDay === idx && "ring-2 ring-primary/50"
                        )}
                    >
                        {/* Day header */}
                        <div className={cn(
                            "text-center mb-2 pb-2 border-b",
                            dayData.isToday ? "border-primary/20" : "border-border/30"
                        )}>
                            <div className={cn(
                                "text-xs font-bold",
                                dayData.isToday ? "text-primary" : "text-muted-foreground"
                            )}>
                                {dayData.day}
                            </div>
                            {dayData.isToday && (
                                <Badge variant="secondary" className="text-[10px] h-4 px-1 mt-1">
                                    امروز
                                </Badge>
                            )}
                        </div>

                        {/* Content items */}
                        <div className="space-y-1.5">
                            {dayData.items.map((item, itemIdx) => {
                                const Icon = channelIcons[item.channel];
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2 + itemIdx * 0.1 }}
                                        className={cn(
                                            "w-full h-6 rounded-lg flex items-center justify-center text-white",
                                            channelColors[item.channel]
                                        )}
                                        title={`${item.title} - ${item.time}`}
                                    >
                                        <Icon size={12} />
                                    </motion.div>
                                );
                            })}

                            {dayData.items.length === 0 && (
                                <div className="flex items-center justify-center h-6 opacity-30">
                                    <Plus size={12} className="text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Selected day details */}
            {selectedDay !== null && weekData[selectedDay].items.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-border/50"
                >
                    <div className="text-sm font-bold text-foreground mb-2">
                        {weekData[selectedDay].dayName}
                    </div>
                    <div className="space-y-2">
                        {weekData[selectedDay].items.map((item) => {
                            const Icon = channelIcons[item.channel];
                            return (
                                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                                        channelColors[item.channel]
                                    )}>
                                        <Icon size={14} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-foreground">{item.title}</div>
                                        <div className="text-xs text-muted-foreground">{item.time}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Add content button */}
            <Button
                variant="outline"
                className="w-full mt-4 gap-2"
                onClick={onAddContent}
            >
                <Sparkles size={14} className="text-primary" />
                افزودن محتوای جدید
            </Button>
        </Card>
    );
}
