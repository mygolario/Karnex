"use client";

import { PageTourHelp } from "@/components/tour/page-tour-help";
import type { PitchDeckSlide } from "@/lib/pitch-deck/types";
import { resolveTheme } from "@/lib/pitch-deck/themes";
import { useProject } from "@/contexts/project-context";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Edit3, 
  Trash2, 
  Presentation, 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  CheckCircle, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Milestone, 
  Users, 
  Plus
} from "lucide-react";

interface DeckPreviewProps {
  slides: PitchDeckSlide[];
  onEditSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onRegenerate: () => void;
  onDownload: () => void;
}

export function DeckPreview({ slides, onEditSlide, onDeleteSlide, onRegenerate, onDownload }: DeckPreviewProps) {
  const { activeProject } = useProject();

  const getSlideLabel = (type: string) => {
    const map: Record<string, string> = {
      'title': 'عنوان (Title)',
      'problem': 'مشکل (Problem)',
      'solution': 'راهکار (Solution)',
      'market': 'اندازه بازار (Market)',
      'market_size': 'اندازه بازار (Market)',
      'business_model': 'مدل درآمدی (Revenue)',
      'competition': 'رقبا (Competition)',
      'roadmap': 'نقشه راه (Roadmap)',
      'team': 'تیم (Team)',
      'ask': 'سرمایه (Ask)',
      'generic': 'توضیحات (Generic)'
    };
    return map[type] || type;
  };

  // Render a visual miniature representation of the slide layout type
  const renderMiniature = (slide: PitchDeckSlide) => {
    const title = slide.title || "بدون عنوان";
    const themeKey = slide.theme || slide.metadata?.theme || "karnex_light";
    const activeTheme = resolveTheme(themeKey);

    switch (slide.type) {
      case "title":
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center border-b" style={{ backgroundColor: activeTheme.bg, borderColor: activeTheme.border }}>
            <Zap className="w-5 h-5 mb-1 animate-pulse" style={{ color: activeTheme.primary }} />
            <h4 className="text-[10px] font-extrabold text-white truncate w-full">{title}</h4>
            <span className="text-[8px] mt-1 opacity-70" style={{ color: activeTheme.primary }}>ارائه استارتاپ</span>
          </div>
        );
      case "problem":
        return (
          <div className="w-full h-full p-3 flex flex-col justify-between border-b" style={{ backgroundColor: activeTheme.bg, borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <div className="flex justify-between items-center">
              <span className="text-[8px] text-rose-400 font-bold uppercase">چالش</span>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <h4 className="text-[9px] font-bold text-slate-200 truncate">{title}</h4>
            <div className="space-y-1">
              <div className="h-1 w-full rounded" style={{ backgroundColor: activeTheme.card }} />
              <div className="h-1 w-4/5 rounded" style={{ backgroundColor: activeTheme.card }} />
            </div>
          </div>
        );
      case "solution":
        return (
          <div className="w-full h-full p-3 flex flex-col justify-between border-b" style={{ backgroundColor: activeTheme.bg, borderColor: 'rgba(16, 185, 129, 0.2)' }}>
            <div className="flex justify-between items-center">
              <span className="text-[8px] text-emerald-400 font-bold uppercase">راهکار</span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h4 className="text-[9px] font-bold text-slate-200 truncate">{title}</h4>
            <div className="space-y-1">
              <div className="h-1 w-full rounded" style={{ backgroundColor: activeTheme.card }} />
              <div className="h-1 w-4/5 rounded" style={{ backgroundColor: activeTheme.card }} />
            </div>
          </div>
        );
      case "market":
      case "market_size":
        return (
          <div className="w-full h-full p-3 flex flex-col justify-between border-b" style={{ backgroundColor: activeTheme.bg, borderColor: activeTheme.border }}>
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-bold uppercase" style={{ color: activeTheme.primary }}>بازار</span>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: activeTheme.primary }} />
            </div>
            <div className="flex items-center justify-center gap-1 my-1">
              <div className="w-6 h-6 rounded-full border flex items-center justify-center text-[5px]" style={{ borderColor: activeTheme.border, backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <div className="w-4 h-4 rounded-full border flex items-center justify-center text-[5px]" style={{ borderColor: activeTheme.secondary, backgroundColor: activeTheme.badgeBg }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeTheme.primary }} />
                </div>
              </div>
            </div>
            <h4 className="text-[8px] font-bold text-slate-400 truncate">{title}</h4>
          </div>
        );
      case "business_model":
        return (
          <div className="w-full h-full p-3 flex flex-col justify-between border-b" style={{ backgroundColor: activeTheme.bg, borderColor: activeTheme.border }}>
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-bold uppercase" style={{ color: activeTheme.secondary }}>درآمدزایی</span>
              <DollarSign className="w-3.5 h-3.5" style={{ color: activeTheme.secondary }} />
            </div>
            <div className="flex gap-1.5 justify-center">
              <span className="w-4 h-4 rounded border" style={{ backgroundColor: activeTheme.badgeBg, borderColor: activeTheme.border }} />
              <span className="w-4 h-4 rounded border" style={{ backgroundColor: activeTheme.badgeBg, borderColor: activeTheme.border }} />
              <span className="w-4 h-4 rounded border" style={{ backgroundColor: activeTheme.badgeBg, borderColor: activeTheme.border }} />
            </div>
            <h4 className="text-[8px] font-bold text-slate-400 truncate">{title}</h4>
          </div>
        );
      case "competition":
        return (
          <div className="w-full h-full p-3 flex flex-col justify-between border-b" style={{ backgroundColor: activeTheme.bg, borderColor: activeTheme.border }}>
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-bold uppercase" style={{ color: activeTheme.secondary }}>رقبا</span>
              <Layers className="w-3.5 h-3.5" style={{ color: activeTheme.secondary }} />
            </div>
            <div className="grid grid-cols-2 gap-1 my-0.5">
              <div className="h-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded" />
              <div className="h-2.5 bg-rose-500/10 border border-rose-500/20 rounded" />
              <div className="h-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded" />
              <div className="h-2.5 bg-amber-500/10 border border-amber-500/20 rounded" />
            </div>
            <h4 className="text-[8px] font-bold text-slate-400 truncate">{title}</h4>
          </div>
        );
      case "roadmap":
        return (
          <div className="w-full h-full p-3 flex flex-col justify-between border-b" style={{ backgroundColor: activeTheme.bg, borderColor: activeTheme.border }}>
            <div className="flex justify-between items-center">
              <span className="text-[8px] text-cyan-400 font-bold uppercase" style={{ color: activeTheme.primary }}>مسیر زمان‌بندی</span>
              <Milestone className="w-3.5 h-3.5" style={{ color: activeTheme.primary }} />
            </div>
            <div className="flex items-center gap-1 my-1.5 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2" style={{ backgroundColor: activeTheme.primary, opacity: 0.3 }} />
              <span className="w-1.5 h-1.5 rounded-full z-10" style={{ backgroundColor: activeTheme.primary }} />
              <div className="flex-1" />
              <span className="w-1.5 h-1.5 rounded-full z-10" style={{ backgroundColor: activeTheme.secondary }} />
              <div className="flex-1" />
              <span className="w-1.5 h-1.5 rounded-full z-10" style={{ backgroundColor: activeTheme.primary }} />
            </div>
            <h4 className="text-[8px] font-bold text-slate-400 truncate">{title}</h4>
          </div>
        );
      case "team":
        return (
          <div className="w-full h-full p-3 flex flex-col justify-between border-b" style={{ backgroundColor: activeTheme.bg, borderColor: activeTheme.border }}>
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-bold uppercase" style={{ color: activeTheme.primary }}>تیم قهرمان</span>
              <Users className="w-3.5 h-3.5" style={{ color: activeTheme.primary }} />
            </div>
            <div className="flex gap-1.5 justify-center my-1">
              <div className="w-4 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.secondary})` }} />
              <div className="w-4 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.secondary})` }} />
              <div className="w-4 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.secondary})` }} />
            </div>
            <h4 className="text-[8px] font-bold text-slate-400 truncate">{title}</h4>
          </div>
        );
      case "ask":
        return (
          <div className="w-full h-full p-3 flex flex-col justify-between border-b" style={{ backgroundColor: activeTheme.bg, borderColor: activeTheme.border }}>
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-bold uppercase" style={{ color: activeTheme.primary }}>جذب سرمایه</span>
              <DollarSign className="w-3.5 h-3.5" style={{ color: activeTheme.primary }} />
            </div>
            <div className="space-y-1 my-0.5">
              <div className="h-1 bg-cyan-500 rounded-full w-4/5" />
              <div className="h-1 bg-violet-500 rounded-full w-3/5" />
            </div>
            <h4 className="text-[8px] font-bold text-slate-400 truncate">{title}</h4>
          </div>
        );
      default:
        return (
          <div className="w-full h-full p-3 flex flex-col justify-between border-b" style={{ backgroundColor: activeTheme.bg, borderColor: activeTheme.border }}>
            <div className="flex justify-between items-center">
              <span className="text-[8px] text-slate-400 font-bold uppercase">اسلاید ساده</span>
              <Zap className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <h4 className="text-[9px] font-bold text-slate-200 truncate">{title}</h4>
            <div className="space-y-1">
              <div className="h-1 w-full rounded" style={{ backgroundColor: activeTheme.card }} />
              <div className="h-1 w-full rounded" style={{ backgroundColor: activeTheme.card }} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-slate-100" dir="rtl">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-slate-900/60 backdrop-blur border border-white/5 rounded-2xl shadow-lg" data-tour-id="deck-header">
         <div className="flex items-center gap-4">
            <PageTourHelp tourId="pitch-deck" />
            <div className="text-right">
                <h2 className="text-2xl font-black text-white">داستان استارتاپ شما</h2>
                <p className="text-xs text-slate-400 mt-1">این یک سناریوی ارائه هوشمند است. روی هر اسلاید کلیک کنید تا وارد کارگاه ویرایش اختصاصی شوید.</p>
            </div>
         </div>
         <div className="flex gap-3" data-tour-id="deck-actions">
             <Button variant="outline" onClick={onRegenerate} className="h-11 px-5 rounded-xl border-white/5 bg-slate-950 text-slate-300 hover:text-white">
                <Sparkles size={16} className="ms-2 text-cyan-400 animate-pulse" />
                تولید مجدد با هوش مصنوعی
             </Button>
             <Button onClick={onDownload} className="h-11 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/10">
                <Presentation size={16} className="ms-2" />
                دانلود پاورپوینت (PPTX)
             </Button>
         </div>
      </div>

      {/* Slide Thumbnails Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-20" data-tour-id="deck-grid">
        {slides.map((slide, index) => (
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onEditSlide(index)}
            className={`group relative aspect-[1.777] rounded-xl overflow-hidden shadow-md cursor-pointer transition-all border ${
              slide.isHidden 
                ? 'opacity-40 border-dashed border-white/10 hover:opacity-75' 
                : 'border-white/5 hover:border-cyan-500/50 hover:shadow-cyan-500/5'
            }`}
          >
            {/* Visual Thumbnail */}
            {renderMiniature(slide)}

            {/* Title / Info Footer */}
            <div className="absolute bottom-0 left-0 w-full p-2 bg-slate-900/90 backdrop-blur-sm flex justify-between items-center text-[10px] border-t border-white/5">
              <span className="font-bold text-slate-300 truncate max-w-[120px]">{getSlideLabel(slide.type)}</span>
              <span className="font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded">{index + 1}</span>
            </div>

            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-slate-950/80 group-hover:flex transition-all flex-col items-center justify-center gap-2 hidden animate-in fade-in duration-200">
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-8 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-600 font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditSlide(index);
                }}
              >
                <Edit3 size={12} className="me-1.5" />
                ویرایش اسلاید
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-7 w-7 rounded-lg p-0 text-slate-400 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSlide(index);
                }}
              >
                <Trash2 size={12} />
              </Button>
            </div>

          </motion.div>
        ))}
        
        {/* Add Slide Trigger */}
        <button 
          className="aspect-[1.777] rounded-xl border-2 border-dashed border-white/10 hover:border-cyan-500/50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-900/30 transition-all group"
          data-tour-id="add-slide-btn"
          onClick={() => onEditSlide(-1)}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 group-hover:bg-cyan-500/10 flex items-center justify-center transition-colors border border-white/5">
            <Plus size={18} />
          </div>
          <span className="text-xs font-bold">افزودن اسلاید جدید</span>
        </button>
      </div>

    </div>
  );
}
