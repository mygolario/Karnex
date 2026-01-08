"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Crown,
  Sparkles,
  Download,
  RefreshCw,
  Check,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandKit, LogoConcept } from "@/lib/db";
import { TabContent, AssetCard, EmptyState } from "../brand-studio";
import { cn } from "@/lib/utils";

interface LogoTabProps {
  brandKit: BrandKit;
  projectName: string;
  onGenerateLogo: (index: number) => Promise<void>;
  generatingIndex: number | null;
}

const LOGO_TYPES = [
  { id: "primary", label: "لوگوی اصلی", description: "نسخه کامل لوگو" },
  { id: "secondary", label: "لوگوی جایگزین", description: "نسخه ساده‌تر" },
  { id: "icon", label: "آیکون", description: "فقط نماد" },
  { id: "wordmark", label: "وردمارک", description: "فقط متن" },
];

export function LogoTab({ brandKit, projectName, onGenerateLogo, generatingIndex }: LogoTabProps) {
  const [selectedConcept, setSelectedConcept] = useState(0);
  
  const concepts = brandKit.logoConcepts || [];
  const hasLogos = concepts.some(c => c.imageUrl);

  return (
    <TabContent
      title="لوگولب"
      description="لوگوی منحصر به فرد برندتان را بسازید و دانلود کنید"
      actions={
        <Button variant="gradient" size="sm" className="gap-2">
          <Sparkles size={16} />
          تولید مجدد همه
        </Button>
      }
    >
      {!hasLogos ? (
        <EmptyState
          icon={Crown}
          title="لوگویی تولید نشده"
          description="برای شروع، روی دکمه تولید کلیک کنید تا لوگوی برندتان ساخته شود"
          action={
            <Button variant="gradient" onClick={() => onGenerateLogo(0)}>
              <Sparkles className="ml-2" size={18} />
              تولید لوگو
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {/* Main Logo Display */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Selected Logo Preview */}
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-white border-2 border-border overflow-hidden shadow-2xl">
                {concepts[selectedConcept]?.imageUrl ? (
                  <img 
                    src={concepts[selectedConcept].imageUrl}
                    alt={concepts[selectedConcept].conceptName}
                    className="w-full h-full object-contain p-8"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                      <p>تصویری موجود نیست</p>
                    </div>
                  </div>
                )}
                
                {generatingIndex === selectedConcept && (
                  <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">در حال تولید لوگو...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={() => onGenerateLogo(selectedConcept)}
                  disabled={generatingIndex !== null}
                >
                  <RefreshCw size={16} />
                  تولید مجدد
                </Button>
                <Button 
                  variant="gradient" 
                  className="flex-1 gap-2"
                  disabled={!concepts[selectedConcept]?.imageUrl}
                >
                  <Download size={16} />
                  دانلود PNG
                </Button>
              </div>
            </div>
            
            {/* Logo Info & Concepts */}
            <div className="space-y-6">
              {/* Concept Info */}
              <div className="p-6 rounded-2xl bg-muted/50">
                <h3 className="font-bold text-lg mb-2">
                  {concepts[selectedConcept]?.conceptName || "کانسپت لوگو"}
                </h3>
                <p className="text-muted-foreground">
                  {concepts[selectedConcept]?.description || "توضیحات لوگو"}
                </p>
              </div>
              
              {/* Concept Thumbnails */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">کانسپت‌های دیگر</h4>
                <div className="grid grid-cols-3 gap-3">
                  {concepts.map((concept, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedConcept(index)}
                      className={cn(
                        "aspect-square rounded-xl border-2 overflow-hidden transition-all",
                        selectedConcept === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {concept.imageUrl ? (
                        <img 
                          src={concept.imageUrl}
                          alt={concept.conceptName}
                          className="w-full h-full object-contain bg-white p-2"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <ImageIcon size={24} className="text-muted-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Logo Variations */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">نسخه‌های لوگو</h4>
                <div className="grid grid-cols-2 gap-3">
                  {LOGO_TYPES.map(type => {
                    const url = brandKit.logoVariations?.[type.id as keyof typeof brandKit.logoVariations];
                    return (
                      <div 
                        key={type.id}
                        className="p-4 rounded-xl border border-border bg-card"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{type.label}</span>
                          {url && <Check size={16} className="text-green-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Color Variations Preview */}
          <div className="p-6 rounded-2xl bg-muted/50">
            <h4 className="font-bold mb-4">پیش‌نمایش روی رنگ‌های مختلف</h4>
            <div className="grid grid-cols-4 gap-4">
              {["#ffffff", "#f8fafc", "#1f2937", brandKit.primaryColorHex].map((bg, i) => (
                <div 
                  key={i}
                  className="aspect-video rounded-xl flex items-center justify-center p-4"
                  style={{ backgroundColor: bg }}
                >
                  {concepts[selectedConcept]?.imageUrl && (
                    <img 
                      src={concepts[selectedConcept].imageUrl}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                      style={{ filter: i === 2 ? 'invert(1)' : 'none' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </TabContent>
  );
}
