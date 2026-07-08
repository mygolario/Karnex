"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "./location-context";
import { Upload, Camera, CheckCircle2, Eye, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function VisionAnalyzer() {
  const { analysis, updateStorefrontPhoto, loading } = useLocation();
  const [dragActive, setDragActive] = useState(false);
  const [localPhoto, setLocalPhoto] = useState<string | null>(
    analysis?.storefront?.photoDataUrl || null
  );

  const storefront = analysis?.storefront;

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("لطفاً فقط فایل تصویر انتخاب کنید");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setLocalPhoto(base64);
      try {
        await updateStorefrontPhoto(base64);
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <Card className="p-6 border-white/5 bg-slate-900/30 backdrop-blur-md dir-rtl text-right">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Camera size={18} className="text-violet-400" />
          <h3 className="font-black text-sm text-white">تحلیل هوش مصنوعی ویترین (Vision Audit)</h3>
        </div>
        {localPhoto && (
          <span className="text-[10px] bg-violet-500/15 border border-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-bold">
            فعال
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Column */}
        <div className="flex flex-col gap-4">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px] relative ${
              dragActive
                ? "border-indigo-500 bg-indigo-500/5"
                : localPhoto
                ? "border-white/10 bg-slate-950/20 hover:border-violet-500/30"
                : "border-white/5 bg-slate-950/40 hover:border-indigo-500/20 hover:bg-slate-950/20"
            }`}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-xs text-muted-foreground">در حال پردازش و استخراج هوشمند پارامترها...</p>
              </div>
            ) : localPhoto ? (
              <div className="relative w-full h-full min-h-[160px] flex flex-col items-center justify-center">
                <img
                  src={localPhoto}
                  alt="Storefront facade"
                  className="max-h-[140px] rounded-lg object-cover border border-white/10 mb-3"
                />
                <label className="text-[10px] text-violet-400 font-bold flex items-center gap-1.5 cursor-pointer hover:underline">
                  <RefreshCw size={12} />
                  <span>تغییر تصویر ویترین</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full h-full">
                <Upload size={32} className="text-muted-foreground/60 mb-1" />
                <span className="text-xs text-white font-bold">تصویر نمای بیرونی مغازه را آپلود کنید</span>
                <span className="text-[10px] text-muted-foreground leading-relaxed max-w-[200px]">
                  برای تحلیل میدان دید، عوارض پیاده‌رو، تابلو خوری و موانع ورودی.
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                />
              </label>
            )}
          </div>
        </div>

        {/* Audit Details Column */}
        <div className="flex flex-col justify-between">
          {localPhoto && storefront?.visibilityAssessment ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-bold">
                  <Eye size={14} />
                  <span>بینش بصری هوش مصنوعی (Vision Insight)</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1.5 border-t border-white/5">
                  {storefront.visibilityAssessment}
                </p>
              </div>

              {/* Suggestions checklist */}
              <div className="space-y-2">
                <div className="text-[10px] text-white font-bold">پیشنهادهای بهبود نما و دیدرس:</div>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
                    <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                    <span>نصب تابلوی عمود بر خیابان (Light Box) برای افزایش دید رانندگان.</span>
                  </div>
                  <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
                    <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                    <span>بهینه‌سازی روشنایی ویترین در طول شب جهت جذب عابران پیاده دیروقت.</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full py-8 text-muted-foreground">
              <Eye size={24} className="opacity-30 mb-2" />
              <p className="text-xs">هیچ تصویری برای تحلیل ویترین آپلود نشده است.</p>
              <p className="text-[10px] opacity-70 mt-1 max-w-[220px]">
                تصویر مغازه را آپلود کنید تا هوش مصنوعی دید تابلوی شما را ارزیابی کند.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
