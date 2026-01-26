"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, Wand2, Loader2, Download, RefreshCw, FileText 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BrandBookCoverProps {
  projectName: string;
  primaryColor: string;
  secondaryColor: string;
  coverUrl?: string;
  onGenerateCover: () => Promise<void>;
  onDownloadPDF: () => Promise<void>;
  isGeneratingCover: boolean;
  isGeneratingPDF: boolean;
}

export function BrandBookCover({
  projectName,
  primaryColor,
  secondaryColor,
  coverUrl,
  onGenerateCover,
  onDownloadPDF,
  isGeneratingCover,
  isGeneratingPDF
}: BrandBookCoverProps) {
  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">کتابچه برند</h2>
            <p className="text-sm text-muted-foreground">کاور و خروجی PDF برند</p>
          </div>
        </div>
        <Button 
          variant="gradient" 
          onClick={onDownloadPDF}
          disabled={isGeneratingPDF}
          className="gap-2"
        >
          {isGeneratingPDF ? (
            <><Loader2 size={16} className="animate-spin" /> در حال آماده‌سازی...</>
          ) : (
            <><FileText size={16} /> دانلود PDF برند</>
          )}
        </Button>
      </div>

      {/* Cover Preview */}
      <Card className="overflow-hidden border-white/5 bg-card">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Cover Image */}
          <div 
            className="aspect-[3/4] relative overflow-hidden"
            style={{
              background: coverUrl 
                ? undefined 
                : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
            }}
          >
            {coverUrl ? (
              <img 
                src={coverUrl} 
                alt="Brand Book Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                  <span className="text-5xl font-black">{projectName.charAt(0)}</span>
                </div>
                <h3 className="text-3xl font-black mb-2 text-center">{projectName}</h3>
                <p className="text-white/70 text-lg">کتابچه هویت بصری</p>
                <div className="absolute bottom-8 text-white/50 text-sm">
                  ۱۴۰۴
                </div>
              </div>
            )}
            
            {/* Loading Overlay */}
            {isGeneratingCover && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur flex flex-col items-center justify-center gap-4">
                <Loader2 size={48} className="animate-spin text-white" />
                <span className="text-white font-medium">در حال تولید کاور...</span>
              </div>
            )}
          </div>
          
          {/* Info Panel */}
          <div className="p-8 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">کاور کتابچه برند</h3>
            <p className="text-muted-foreground mb-6 leading-7">
              تصویری AI-Generated برای کاور کتابچه هویت بصری کسب‌وکار شما. این تصویر در خروجی PDF نهایی استفاده می‌شود.
            </p>
            
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={onGenerateCover}
                disabled={isGeneratingCover}
                className="gap-2"
              >
                {isGeneratingCover ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : coverUrl ? (
                  <RefreshCw size={16} />
                ) : (
                  <Wand2 size={16} />
                )}
                {coverUrl ? 'بازسازی کاور' : 'تولید کاور با AI'}
              </Button>
              
              {coverUrl && (
                <a
                  href={coverUrl}
                  download={`${projectName}-brand-cover.png`}
                >
                  <Button variant="secondary" className="gap-2">
                    <Download size={16} />
                    دانلود تصویر
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
