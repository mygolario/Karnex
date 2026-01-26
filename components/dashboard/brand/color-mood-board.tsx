"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Palette, Wand2, Loader2, RefreshCw, Download, Info, Lightbulb 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorMoodImage } from "@/lib/db";

interface ColorMoodBoardProps {
  primaryColor: string;
  secondaryColor: string;
  colorPsychology: string;
  colorMoodImages?: ColorMoodImage[];
  onGenerateMood: () => Promise<void>;
  onRegeneratePsychology: () => Promise<void>;
  isGeneratingMood: boolean;
  isGeneratingPsychology: boolean;
}

export function ColorMoodBoard({
  primaryColor,
  secondaryColor,
  colorPsychology,
  colorMoodImages = [],
  onGenerateMood,
  onRegeneratePsychology,
  isGeneratingMood,
  isGeneratingPsychology
}: ColorMoodBoardProps) {
  const colors = [
    { label: "رنگ اصلی", hex: primaryColor, usage: "دکمه‌های اصلی، لوگو، تیترهای مهم" },
    { label: "رنگ مکمل", hex: secondaryColor, usage: "پس‌زمینه‌ها، آیکون‌ها، حاشیه‌ها" }
  ];

  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Palette size={24} />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">پالت رنگی</h2>
        </div>
        <Button 
          variant="outline" 
          onClick={onGenerateMood}
          disabled={isGeneratingMood}
          className="gap-2 border-primary/20 hover:border-primary hover:bg-primary/5"
        >
          {isGeneratingMood ? (
            <><Loader2 size={16} className="animate-spin" /> در حال تولید...</>
          ) : (
            <><Wand2 size={16} /> تولید مودبورد رنگی</>
          )}
        </Button>
      </div>

      {/* Color Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {colors.map((color, idx) => {
          const moodImage = colorMoodImages?.find(img => img.color === color.hex);
          
          return (
            <motion.div 
              key={idx} 
              className="group relative rounded-[2.5rem] p-3 overflow-visible transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="absolute inset-0 bg-white/50 dark:bg-black/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-card border border-border/50 rounded-[2rem] overflow-hidden p-2 h-full flex flex-col">
                {/* Color Swatch */}
                <div 
                  className="h-56 w-full rounded-[1.5rem] shadow-inner relative overflow-hidden group-hover:scale-[0.98] transition-all duration-500" 
                  style={{ backgroundColor: color.hex }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                  
                  {/* Mood Image Overlay */}
                  {moodImage && (
                    <div className="absolute inset-0">
                      <img 
                        src={moodImage.imageUrl} 
                        alt="Color Mood"
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                      />
                    </div>
                  )}
                  
                  {/* Copy Button */}
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl text-black font-mono font-bold shadow-2xl flex items-center gap-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-lg">{color.hex}</span>
                    <button 
                      onClick={() => copyToClipboard(color.hex)} 
                      className="hover:text-primary transition-colors"
                    >
                      {copied === color.hex ? '✓' : '📋'}
                    </button>
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-8 pb-6 bg-card">
                  <h3 className="font-extrabold text-2xl text-foreground mb-3 flex items-center justify-between">
                    {color.label}
                    <div className="w-6 h-6 rounded-full border-2 border-background shadow-sm" style={{ backgroundColor: color.hex }} />
                  </h3>
                  <p className="text-muted-foreground text-base flex items-start gap-3 leading-7">
                    <Info size={20} className="text-primary mt-1 shrink-0" />
                    {color.usage}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Psychology Note */}
      <div className="card-glass border-l-4 border-l-amber-500 rounded-2xl p-8 shadow-lg shadow-amber-500/5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-lg text-foreground flex items-center gap-2">
            <Lightbulb size={24} className="text-amber-500 fill-amber-500/20" />
            فلسفه انتخاب این رنگ‌ها
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onRegeneratePsychology}
            disabled={isGeneratingPsychology}
            className="gap-1 text-muted-foreground hover:text-primary"
          >
            {isGeneratingPsychology ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            بازنویسی با AI
          </Button>
        </div>
        <p className="text-muted-foreground leading-8 text-base md:text-lg">
          {colorPsychology}
        </p>
      </div>
    </section>
  );
}
