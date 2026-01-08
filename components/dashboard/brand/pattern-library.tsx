"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Grid3X3, Wand2, Loader2, RefreshCw, Download, Plus, Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandPattern } from "@/lib/db";

interface PatternLibraryProps {
  patterns?: BrandPattern[];
  primaryColor: string;
  secondaryColor: string;
  onGeneratePatterns: () => Promise<void>;
  onGenerateSinglePattern: (style: BrandPattern['style']) => Promise<void>;
  isGenerating: boolean;
  generatingStyle?: string;
}

const PATTERN_STYLES: { id: BrandPattern['style']; label: string; description: string }[] = [
  { id: 'geometric', label: 'هندسی', description: 'الگوهای مدرن با اشکال هندسی' },
  { id: 'gradient', label: 'گرادیان', description: 'ترکیب رنگ‌های برند' },
  { id: 'abstract', label: 'انتزاعی', description: 'طرح‌های خلاقانه و منحصربفرد' },
  { id: 'organic', label: 'ارگانیک', description: 'الگوهای طبیعی و نرم' },
];

export function PatternLibrary({
  patterns = [],
  primaryColor,
  secondaryColor,
  onGeneratePatterns,
  onGenerateSinglePattern,
  isGenerating,
  generatingStyle
}: PatternLibraryProps) {
  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Grid3X3 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">کتابخانه پترن</h2>
            <p className="text-sm text-muted-foreground">الگوهای تزئینی برای برند شما</p>
          </div>
        </div>
        <Button 
          variant="gradient" 
          onClick={onGeneratePatterns}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating && !generatingStyle ? (
            <><Loader2 size={16} className="animate-spin" /> در حال تولید همه...</>
          ) : (
            <><Wand2 size={16} /> تولید ۴ پترن</>
          )}
        </Button>
      </div>

      {/* Pattern Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {PATTERN_STYLES.map((style) => {
          const pattern = patterns.find(p => p.style === style.id);
          const isCurrentlyGenerating = generatingStyle === style.id;
          
          return (
            <motion.div
              key={style.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group"
            >
              <Card className="overflow-hidden border-white/5 bg-card hover:shadow-xl transition-all duration-300">
                {/* Pattern Preview */}
                <div className="aspect-square relative overflow-hidden">
                  {pattern?.imageUrl ? (
                    <>
                      <img 
                        src={pattern.imageUrl} 
                        alt={style.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a 
                          href={pattern.imageUrl}
                          download={`pattern-${style.id}.png`}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Download size={18} className="text-black" />
                        </a>
                        <button
                          onClick={() => onGenerateSinglePattern(style.id)}
                          disabled={isGenerating}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw size={18} className="text-black" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div 
                      className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-muted to-muted/50"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`
                      }}
                    >
                      {isCurrentlyGenerating ? (
                        <Loader2 size={32} className="animate-spin text-primary" />
                      ) : (
                        <>
                          <Grid3X3 size={32} className="text-muted-foreground/50" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onGenerateSinglePattern(style.id)}
                            disabled={isGenerating}
                            className="gap-1"
                          >
                            <Plus size={14} />
                            تولید
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Loading Overlay */}
                  {isCurrentlyGenerating && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur flex flex-col items-center justify-center gap-3">
                      <Loader2 size={32} className="animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">در حال تولید...</span>
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-foreground">{style.label}</h3>
                    {pattern && (
                      <Badge variant="secondary" className="text-[10px]">آماده</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{style.description}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
