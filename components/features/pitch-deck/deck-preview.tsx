"use client";

import { PageTourHelp } from "@/components/features/onboarding/page-tour-help";

import { PitchDeckSlide } from "@/lib/db";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, Download, RefreshCw, LayoutTemplate } from "lucide-react";

interface DeckPreviewProps {
  slides: PitchDeckSlide[];
  onEditSlide: (index: number) => void;
  onRegenerate: () => void;
  onDownload: () => void;
}

export function DeckPreview({ slides, onEditSlide, onRegenerate, onDownload }: DeckPreviewProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-card/50 backdrop-blur border border-border/50 rounded-3xl shadow-sm" data-tour-id="deck-header">
         <div className="flex items-center gap-4">
            <PageTourHelp tourId="pitch-deck" />
            <div>
                <h2 className="text-2xl font-black text-foreground">داستان استارتاپ شما</h2>
                <p className="text-muted-foreground">این نسخه اولیه است. روی هر اسلاید کلیک کنید تا ویرایش شود.</p>
            </div>
         </div>
         <div className="flex gap-3" data-tour-id="deck-actions">
             <Button variant="outline" onClick={onRegenerate} className="h-12 px-6 rounded-xl border-dashed">
                <RefreshCw size={16} className="ml-2" />
                شروع مجدد
             </Button>
             <Button onClick={onDownload} className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                <Download size={16} className="ml-2" />
                دانلود PDF
             </Button>
         </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20" data-tour-id="deck-grid">
        {slides.map((slide, index) => (
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onEditSlide(index)}
            className="group relative aspect-[1.414] bg-white text-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer ring-1 ring-border/10 hover:ring-primary/50"
          >
            {/* Thumbnail Content */}
            <div className="w-full h-full p-6 flex flex-col pointer-events-none select-none transform scale-[1] origin-top-left">
                <div className="flex justify-between items-center mb-4 opacity-30">
                    <span className="text-[10px] font-black tracking-widest uppercase">{slide.type}</span>
                    <span className="text-[10px] font-mono">{index + 1}</span>
                </div>
                
                <h3 className="text-lg font-bold mb-4 leading-tight line-clamp-2">{slide.title}</h3>
                
                <div className="space-y-2">
                    {slide.bullets.slice(0, 3).map((b, i) => (
                        <div key={i} className="flex gap-2 items-start opacity-70">
                            <div className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                            <p className="text-[10px] leading-relaxed line-clamp-2">{b}</p>
                        </div>
                    ))}
                    {slide.bullets.length > 3 && <span className="text-[10px] opacity-40">...</span>}
                </div>

                {/* Decoration */}
                <div className={`
                    absolute bottom-0 left-0 w-24 h-24 rounded-tr-full blur-2xl opacity-20
                    ${index % 2 === 0 ? 'bg-blue-500' : 'bg-purple-500'}
                `} />
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur text-foreground px-4 py-2 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    <Edit3 size={14} />
                    ویرایش اسلاید
                </div>
            </div>

          </motion.div>
        ))}
        
        {/* Add New Slide Card */}
        <button 
            className="aspect-[1.414] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary hover:bg-muted/30 transition-all group"
            onClick={() => onEditSlide(-1)} // Special code for new
            data-tour-id="add-slide-btn"
        >
            <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <LayoutTemplate size={24} />
            </div>
            <span className="font-bold">افزودن اسلاید جدید</span>
        </button>
      </div>
    </div>
  );
}
