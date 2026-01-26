"use client";

import { motion } from "framer-motion";
import { Type, Download, Wand2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TypographySectionProps {
  fontName: string;
  projectName: string;
  primaryColor: string;
  secondaryColor: string;
  specimenUrl?: string; // AI generated poster
  onGenerateSpecimen: () => Promise<void>;
  isGenerating: boolean;
}

export function TypographySection({
  fontName,
  projectName,
  primaryColor,
  secondaryColor,
  specimenUrl,
  onGenerateSpecimen,
  isGenerating
}: TypographySectionProps) {
  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Type size={24} />
        </div>
        <h2 className="text-2xl font-black text-foreground tracking-tight">تایپوگرافی</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Font Info & Preview */}
        <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm p-0 flex flex-col h-full">
          <div className="flex justify-between items-center p-8 border-b border-border/50 bg-muted/20">
            <div>
              <h3 className="text-4xl font-black text-foreground mb-2">{fontName}</h3>
              <p className="text-lg text-muted-foreground">فونت اختصاصی برند</p>
            </div>
            <Badge variant="outline" className="font-mono text-sm px-4 py-2 border-primary/20 text-primary bg-primary/5 rounded-xl">
              Aa
            </Badge>
          </div>
          
          <div className="p-8 space-y-8 flex-1">
            <div className="space-y-3">
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest opacity-50">HEADING 1 / BLACK / 48PX</span>
              <h1 className="text-4xl md:text-5xl font-black text-foreground leading-tight">خلاقیت مرز ندارد</h1>
            </div>
            <div className="space-y-3">
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest opacity-50">HEADING 2 / BOLD / 30PX</span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">برای آینده طراحی کنید</h2>
            </div>
            <div className="space-y-3">
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest opacity-50">BODY / REGULAR / 16PX</span>
              <p className="text-base md:text-lg text-muted-foreground leading-8 text-justify">
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است.
              </p>
            </div>
          </div>
        </Card>

        {/* Right: AI Specimen Poster */}
        <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm p-0 flex flex-col h-full relative group">
          <div className="absolute top-4 right-4 z-20">
             <Badge variant="secondary" className="backdrop-blur-md bg-black/30 text-white border-0">
               AI Creative Poster
             </Badge>
          </div>

          <div className="relative flex-1 bg-muted/30 flex items-center justify-center overflow-hidden min-h-[400px]">
            {specimenUrl ? (
              <>
                <img 
                  src={specimenUrl} 
                  alt="Typography Specimen" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                  <a 
                    href={specimenUrl} 
                    download="typography-poster.png"
                    className="w-full"
                  >
                    <Button variant="secondary" className="w-full gap-2">
                      <Download size={16} /> دانلود پوستر
                    </Button>
                  </a>
                </div>
              </>
            ) : (
              <div className="text-center p-8 max-w-sm mx-auto relative z-10">
                 <div className="mb-6 mx-auto w-24 h-32 border-4 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                    <span className="text-6xl font-black text-muted-foreground/20">Aa</span>
                 </div>
                 <h3 className="text-xl font-bold mb-2">تولید پوستر تایپوگرافی</h3>
                 <p className="text-muted-foreground mb-6">
                   با استفاده از هوش‌مصنوعی، یک پوستر خلاقانه که فونت و هویت برند شما را به نمایش می‌گذارد تولید کنید.
                 </p>
                 <Button 
                   onClick={onGenerateSpecimen} 
                   disabled={isGenerating}
                   className="w-full gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25"
                 >
                   {isGenerating ? (
                     <><Loader2 size={16} className="animate-spin" /> در حال طراحی...</>
                   ) : (
                     <><Wand2 size={16} /> تولید پوستر با AI</>
                   )}
                 </Button>
              </div>
            )}
            
            {/* Loading Overlay if rebuilding */}
            {isGenerating && specimenUrl && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-30">
                <div className="bg-card p-4 rounded-2xl shadow-2xl flex items-center gap-3">
                  <Loader2 size={24} className="animate-spin text-primary" />
                  <span className="font-medium">در حال بازطراحی پوستر...</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer Actions if image exists */}
          {specimenUrl && !isGenerating && (
             <div className="p-4 border-t border-white/10 bg-white/5">
               <Button 
                 onClick={onGenerateSpecimen} 
                 variant="ghost" 
                 size="sm" 
                 className="w-full gap-2 justify-center text-muted-foreground hover:text-foreground"
               >
                 <RefreshCw size={14} /> تولید مجدد پوستر
               </Button>
             </div>
          )}
        </Card>
      </div>
    </section>
  );
}
