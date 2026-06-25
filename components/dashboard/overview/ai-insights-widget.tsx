"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Bot, Lightbulb, ArrowLeft, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const insights = [
  {
    id: "insight-1",
    icon: Lightbulb,
    title: "بوم کسب‌وکارت رو کامل کن",
    description: "۴ بخش از بوم شما خالی است. تکمیل آن‌ها امتیازت رو ۱۵ تا بالا می‌بره.",
    action: "تکمیل بوم",
    href: "/dashboard/canvas",
    color: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
    iconColor: "text-amber-500",
  },
  {
    id: "insight-2",
    icon: Bot,
    title: "تحلیل رقبا رو شروع کن",
    description: "هنوز رقبای خودت رو اضافه نکردی. تحلیل رقبا کلید تمایز شماست.",
    action: "تحلیل رقبا",
    href: "/dashboard/canvas",
    color: "from-blue-500/10 to-cyan-500/10 border-blue-500/20",
    iconColor: "text-blue-500",
  },
  {
    id: "insight-3",
    icon: Lightbulb,
    title: "پیچ‌دک آماده ساخت است",
    description: "با داده‌های فعلی پروژه، می‌تونی یه پیچ‌دک حرفه‌ای بسازی.",
    action: "ساخت پیچ‌دک",
    href: "/dashboard/pitch-deck",
    color: "from-violet-500/10 to-purple-500/10 border-violet-500/20",
    iconColor: "text-violet-500",
  },
];

export function AIInsightsWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const activeInsights = insights.filter(i => !dismissed.has(i.id));
  const current = activeInsights[currentIndex % (activeInsights.length || 1)];

  // Auto-rotate every 12 seconds
  useEffect(() => {
    if (activeInsights.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeInsights.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [activeInsights.length]);

  const handleDismiss = () => {
    if (!current) return;
    setDismissed(prev => new Set([...prev, current.id]));
    setCurrentIndex(0);
  };

  if (!current || activeInsights.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground">پیشنهادات هوشمند</h3>
        </div>
        <div className="text-center py-8">
          <Bot className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">همه پیشنهادات بررسی شدند ✅</p>
        </div>
      </Card>
    );
  }

  const Icon = current.icon;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground">پیشنهادات هوشمند</h3>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="رد کردن"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={cn("rounded-xl border p-4 bg-gradient-to-br", current.color)}
        >
          <div className="flex items-start gap-3">
            <div className={cn("w-10 h-10 rounded-xl bg-white/50 dark:bg-white/10 flex items-center justify-center shrink-0", current.iconColor)}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-foreground mb-1">{current.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{current.description}</p>
              <Link href={current.href}>
                <Button size="sm" variant="soft" className="font-bold text-xs gap-1 h-7">
                  {current.action}
                  <ArrowLeft className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots indicator */}
      {activeInsights.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {activeInsights.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === currentIndex % activeInsights.length
                  ? "w-4 bg-primary"
                  : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
