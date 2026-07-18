"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Activity } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function ValidationEmptyHero({
  projectName,
  onStart,
  loading,
}: {
  projectName?: string;
  onStart: () => void;
  loading?: boolean;
}) {
  return (
    <Card variant="gradient" className="text-white text-center py-12 px-6">
      <motion.div
        className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {loading ? (
          <Loader2 size={36} className="animate-spin" />
        ) : (
          <Sparkles size={36} />
        )}
      </motion.div>
      <h3 className="text-2xl font-black mb-3">اعتبارسنجی ایده</h3>
      <p className="text-white/80 mb-8 max-w-lg mx-auto leading-7">
        قبل از ساختن، فرض‌های خطرناک «{projectName || "پروژه‌ات"}» را بکش.
        حکم صریح، ابعاد واقعی، و آزمایش ارزان برای این هفته.
      </p>
      <Button
        variant="secondary"
        size="lg"
        onClick={onStart}
        disabled={loading}
        className="gap-3 h-14 px-8 text-base font-bold shadow-xl"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            در حال آماده‌سازی...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            پر کردن بریف و شروع
          </>
        )}
      </Button>
    </Card>
  );
}

export function ValidationGate() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="p-8 text-center max-w-md space-y-4">
        <h2 className="text-xl font-bold">اعتبارسنجی ایده — استارتاپ</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          این ابزار برای پروژه‌های استارتاپی است. برای کسب‌وکار سنتی، سلامت عملیاتی و
          پیشخوان را ببین.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/dashboard/health">
              <Activity className="h-4 w-4" />
              سلامت کسب‌وکار
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/overview">بازگشت به پیشخوان</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
