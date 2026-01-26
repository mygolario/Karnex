"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Rocket,
    Target,
    Users,
    TrendingUp,
    Instagram,
    Mail,
    Globe,
    MessageCircle,
    Check,
    Sparkles,
    ArrowLeft,
    ArrowRight,
    Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Goal {
    id: string;
    label: string;
    labelEn: string;
    icon: React.ElementType;
    description: string;
    color: string;
}

interface Channel {
    id: string;
    label: string;
    icon: React.ElementType;
    color: string;
}

const goals: Goal[] = [
    {
        id: "awareness",
        label: "آگاهی برند",
        labelEn: "Brand Awareness",
        icon: Users,
        description: "بیشتر دیده شوید",
        color: "from-violet-500 to-purple-500"
    },
    {
        id: "conversion",
        label: "افزایش فروش",
        labelEn: "Conversion",
        icon: TrendingUp,
        description: "مشتری جذب کنید",
        color: "from-emerald-500 to-teal-500"
    },
    {
        id: "retention",
        label: "وفاداری مشتری",
        labelEn: "Retention",
        icon: Target,
        description: "مشتریان را نگه دارید",
        color: "from-amber-500 to-orange-500"
    },
];

const channels: Channel[] = [
    { id: "instagram", label: "اینستاگرام", icon: Instagram, color: "from-pink-500 to-rose-500" },
    { id: "email", label: "ایمیل", icon: Mail, color: "from-blue-500 to-cyan-500" },
    { id: "website", label: "وبسایت", icon: Globe, color: "from-emerald-500 to-teal-500" },
    { id: "telegram", label: "تلگرام", icon: MessageCircle, color: "from-sky-500 to-blue-500" },
];

interface CampaignBuilderProps {
    onComplete?: (data: { goal: string; channels: string[] }) => void;
}

export function CampaignBuilder({ onComplete }: CampaignBuilderProps) {
    const [step, setStep] = useState(0);
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
    const [generating, setGenerating] = useState(false);
    const [suggestion, setSuggestion] = useState<string | null>(null);

    const handleChannelToggle = (channelId: string) => {
        setSelectedChannels(prev =>
            prev.includes(channelId)
                ? prev.filter(c => c !== channelId)
                : [...prev, channelId]
        );
    };

    const handleGenerate = async () => {
        setGenerating(true);
        // Simulate AI generation
        await new Promise(resolve => setTimeout(resolve, 2000));

        const suggestions = {
            awareness: "یک چالش ویروسی در اینستاگرام با هشتگ اختصاصی راه‌اندازی کنید. از اینفلوئنسرهای میکرو دعوت کنید و جایزه برای مشارکت‌کنندگان در نظر بگیرید.",
            conversion: "یک کمپین تخفیف محدود ۴۸ ساعته با کد تخفیف اختصاصی اجرا کنید. از ایمیل و تلگرام برای اطلاع‌رسانی استفاده کنید.",
            retention: "برنامه امتیازدهی VIP برای مشتریان وفادار طراحی کنید. دسترسی زودهنگام به محصولات جدید و تخفیف‌های اختصاصی ارائه دهید.",
        };

        setSuggestion(suggestions[selectedGoal as keyof typeof suggestions] || suggestions.awareness);
        setGenerating(false);
        setStep(2);
    };

    const handleComplete = () => {
        onComplete?.({ goal: selectedGoal!, channels: selectedChannels });
        // Reset
        setStep(0);
        setSelectedGoal(null);
        setSelectedChannels([]);
        setSuggestion(null);
    };

    return (
        <Card variant="default" className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Rocket size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground">ساخت کمپین</h3>
                        <p className="text-xs text-muted-foreground">Campaign Builder</p>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-1">
                    {[0, 1, 2].map((s) => (
                        <div
                            key={s}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all",
                                step >= s ? "bg-primary" : "bg-muted"
                            )}
                        />
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* Step 0: Select Goal */}
                {step === 0 && (
                    <motion.div
                        key="goals"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                    >
                        <div className="text-sm text-muted-foreground mb-4">
                            هدف کمپین شما چیست؟
                        </div>

                        <div className="space-y-3">
                            {goals.map((goal) => (
                                <button
                                    key={goal.id}
                                    onClick={() => setSelectedGoal(goal.id)}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-right",
                                        selectedGoal === goal.id
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-border/50 hover:border-border bg-muted/30"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br shadow-md",
                                        goal.color
                                    )}>
                                        <goal.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-foreground">{goal.label}</div>
                                        <div className="text-xs text-muted-foreground">{goal.description}</div>
                                    </div>
                                    {selectedGoal === goal.id && (
                                        <Check size={18} className="text-primary" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <Button
                            className="w-full mt-4"
                            disabled={!selectedGoal}
                            onClick={() => setStep(1)}
                        >
                            مرحله بعد
                            <ArrowLeft size={16} className="mr-2" />
                        </Button>
                    </motion.div>
                )}

                {/* Step 1: Select Channels */}
                {step === 1 && (
                    <motion.div
                        key="channels"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                    >
                        <div className="text-sm text-muted-foreground mb-4">
                            از کدام کانال‌ها استفاده می‌کنید؟
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {channels.map((channel) => (
                                <button
                                    key={channel.id}
                                    onClick={() => handleChannelToggle(channel.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                                        selectedChannels.includes(channel.id)
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-border/50 hover:border-border bg-muted/30"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br shadow-sm",
                                        channel.color
                                    )}>
                                        <channel.icon size={18} />
                                    </div>
                                    <span className="text-sm font-medium text-foreground">{channel.label}</span>
                                    {selectedChannels.includes(channel.id) && (
                                        <Badge variant="secondary" className="text-[10px] h-4">
                                            انتخاب شد
                                        </Badge>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-4">
                            <Button variant="outline" onClick={() => setStep(0)}>
                                <ArrowRight size={16} className="ml-2" />
                                قبلی
                            </Button>
                            <Button
                                className="flex-1"
                                disabled={selectedChannels.length === 0 || generating}
                                onClick={handleGenerate}
                            >
                                {generating ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin ml-2" />
                                        در حال ایده‌پردازی...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} className="ml-2" />
                                        ایده بگیر
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: AI Suggestion */}
                {step === 2 && suggestion && (
                    <motion.div
                        key="suggestion"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                    >
                        <Badge className="gap-1">
                            <Sparkles size={12} />
                            پیشنهاد کارنکس
                        </Badge>

                        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20">
                            <p className="text-sm leading-7 text-foreground">
                                {suggestion}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setStep(1)}>
                                ایده دیگر
                            </Button>
                            <Button className="flex-1" onClick={handleComplete}>
                                <Check size={16} className="ml-2" />
                                شروع کمپین
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
