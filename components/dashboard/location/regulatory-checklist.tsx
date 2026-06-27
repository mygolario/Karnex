"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertCircle, HelpCircle } from "lucide-react";
import { useLocation } from "./location-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function RegulatoryChecklist() {
  const { analysis } = useLocation();

  if (!analysis?.legalChecklist || analysis.legalChecklist.length === 0) {
    // Show a default localized checklist for traditional businesses in Iran if not provided
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 bg-card/30 border-white/5 shadow-xl backdrop-blur-md text-right dir-rtl">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500 animate-pulse" />
              الزامات قانونی و استعلامات صنفی (اتحادیه)
            </h4>
            <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">کشوری / تهران</Badge>
          </div>
          <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block mb-0.5">محدودیت ترافیک شهری (زوج و فرد/طرح ترافیک)</strong>
                بررسی کنید که مغازه در محدوده طرح ترافیک نباشد، در غیر این صورت ترافیک عابرین در ساعات روز کاهش و هزینه ارسال کالا افزایش می‌یابد.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block mb-0.5">تاییدیه اداره نظارت بر اماکن عمومی ناجا</strong>
                صنوف خاص (کافه‌ها، کافی‌شاپ‌ها و رستوران‌ها) باید متراژ مشخصی داشته باشند و دید مستقیم از بیرون به فضای داخلی نداشته باشند.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block mb-0.5">ضوابط بهداشتی و ایمنی (شهرداری و بهداشت)</strong>
                نیاز به سیستم تهویه استاندارد، چاه سپتیک مجزا برای پسماندهای غذایی و تاییدیه ضد حریق آتش‌نشانی منطقه.
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="p-6 bg-card/30 border-white/5 shadow-xl backdrop-blur-md text-right dir-rtl">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-500" />
            بررسی قوانین و مجوزهای صنفی محلی
          </h4>
          <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-500 bg-emerald-500/5">استعلامات صنف</Badge>
        </div>

        <div className="space-y-4">
          {analysis.legalChecklist.map((item, index) => (
            <div 
              key={index}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors duration-200",
                item.isRequired ? "bg-red-500/[0.02] border-red-500/10" : "bg-white/[0.01] border-white/5"
              )}
            >
              <div className="mt-0.5 shrink-0">
                {item.isRequired ? (
                  <AlertCircle size={15} className="text-rose-500" />
                ) : (
                  <HelpCircle size={15} className="text-muted-foreground/60" />
                )}
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-foreground">{item.title}</strong>
                  {item.isRequired && (
                    <span className="text-[9px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">الزامی</span>
                  )}
                </div>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
