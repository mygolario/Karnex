"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Palette, Sparkles, Loader2, RefreshCw, Wand2, Download 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BrandBookHeaderProps {
  projectName: string;
  audience: string;
  primaryColor: string;
  secondaryColor: string;
  heroImageUrl?: string;
  onGenerateHero: () => Promise<void>;
  isGenerating: boolean;
}

export function BrandBookHeader({
  projectName,
  audience,
  primaryColor,
  secondaryColor,
  heroImageUrl,
  onGenerateHero,
  isGenerating
}: BrandBookHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl shadow-purple-500/20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center" />
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/20 blur-[100px] rounded-full animate-float mix-blend-overlay" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-yellow-300/20 blur-[100px] rounded-full animate-float mix-blend-overlay" style={{ animationDelay: "-2s" }} />
      
      {/* AI Hero Image */}
      {heroImageUrl && (
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImageUrl} 
            alt="Brand Hero" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 via-purple-600/80 to-transparent" />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-right flex-1">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
            <motion.div 
              className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-inner border border-white/20"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Palette size={32} />
            </motion.div>
            <div className="text-right">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">هویت بصری برند</h1>
                <Badge variant="outline" className="hidden md:flex bg-white/10 backdrop-blur border-white/20 text-white gap-1 px-3">
                  <Sparkles size={12} />
                  کارنکس
                </Badge>
              </div>
              <p className="text-white/80 text-lg mt-2 font-medium">
                طراحی شده برای مخاطب: <span className="text-white font-bold bg-white/20 px-2 py-0.5 rounded-lg">{audience}</span>
              </p>
            </div>
          </div>
          
          {/* Generate Hero Button */}
          <Button
            variant="outline"
            onClick={onGenerateHero}
            disabled={isGenerating}
            className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2"
          >
            {isGenerating ? (
              <><Loader2 size={16} className="animate-spin" /> در حال تولید...</>
            ) : heroImageUrl ? (
              <><RefreshCw size={16} /> بازسازی تصویر هیرو</>
            ) : (
              <><Wand2 size={16} /> تولید تصویر هیرو با AI</>
            )}
          </Button>
        </div>
        
        {/* Color Preview */}
        <div className="hidden md:block">
          <div className="flex -space-x-6 space-x-reverse">
            <motion.div 
              className="w-20 h-20 rounded-full border-[6px] border-white/20 shadow-2xl z-10"
              style={{ backgroundColor: primaryColor }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <motion.div 
              className="w-20 h-20 rounded-full border-[6px] border-white/20 shadow-2xl hover:z-20"
              style={{ backgroundColor: secondaryColor }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
