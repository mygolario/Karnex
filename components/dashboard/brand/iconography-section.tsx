"use client";

import { motion } from "framer-motion";
import { Shapes, Wand2, Loader2, RefreshCw, Download, ArrowRight } from "lucide-react"; // Changed Icons to Shapes
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface IconItem {
  id: string;
  name: string;
  imageUrl: string;
  prompt: string;
}

interface IconographySectionProps {
  icons: IconItem[] | undefined;
  projectName: string;
  primaryColor: string;
  onGenerateIcons: () => Promise<void>;
  isGenerating: boolean;
}

export function IconographySection({
  icons,
  projectName,
  primaryColor,
  onGenerateIcons,
  isGenerating
}: IconographySectionProps) {
  const hasIcons = icons && icons.length > 0;

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Shapes size={24} />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">آیکون‌گرافی</h2>
        </div>
        
        {hasIcons && (
           <Button 
             onClick={onGenerateIcons} 
             disabled={isGenerating}
             variant="outline"
             size="sm"
             className="gap-2"
           >
             {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
             تولید مجدد مجموعه
           </Button>
        )}
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm p-8 md:p-12 relative overflow-hidden group">
        
        {!hasIcons ? (
          // Empty State
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
            <div className="w-20 h-20 rounded-full bg-muted/50 mb-6 flex items-center justify-center">
              <Shapes size={32} className="text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold mb-3">آیکون‌های اختصاصی برند</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              تولید یک مجموعه آیکون هماهنگ و مینیمال که با هویت بصری و کسب‌وکار شما همخوانی کاملی دارد.
            </p>
            <Button 
              onClick={onGenerateIcons} 
              disabled={isGenerating}
              size="lg"
              className="w-full sm:w-auto gap-2 bg-foreground text-background hover:bg-foreground/90 rounded-xl px-8 h-12 font-bold shadow-xl shadow-foreground/10"
            >
              {isGenerating ? (
                <><Loader2 size={18} className="animate-spin" /> در حال طراحی آیکون‌ها...</>
              ) : (
                <><Wand2 size={18} /> تولید آیکون‌گرافی هوشمند</>
              )}
            </Button>
          </div>
        ) : (
          // Icons Grid
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 relative z-10">
            {icons.map((icon, idx) => (
              <motion.div
                key={icon.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="group/icon"
              >
                <div className="aspect-square rounded-[2rem] bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                  <img 
                    src={icon.imageUrl} 
                    alt={icon.name}
                    className="w-full h-full object-contain drop-shadow-sm" 
                  />
                  
                  {/* Hover Actions */}
                  <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover/icon:opacity-100 transition-opacity bg-gradient-to-t from-background/90 to-transparent flex justify-center">
                    <a href={icon.imageUrl} download={`${projectName}-icon-${idx}.png`}>
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg">
                        <Download size={14} />
                      </Button>
                    </a>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <span className="text-sm font-medium text-muted-foreground capitalize">{icon.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Loading Overlay */}
        {isGenerating && hasIcons && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="bg-card p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
              <Loader2 size={32} className="animate-spin text-primary" />
              <div className="text-center">
                <h4 className="font-bold text-lg mb-1">در حال طراحی مجدد...</h4>
                <p className="text-sm text-muted-foreground">لطفاً چند لحظه صبر کنید</p>
              </div>
            </div>
          </div>
        )}
      </Card>
      
      {/* Context info */}
      {hasIcons && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-sm text-muted-foreground">
          <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          <p>
            این آیکون‌ها با تحلیل کسب‌وکار شما تولید شده‌اند. می‌توانید از آن‌ها در وب‌سایت، اپلیکیشن یا هایلایت‌های اینستاگرام استفاده کنید.
            برای فرمت‌های وکتور (SVG)، می‌توانید تصویر را در نرم‌افزارهای طراحی Trace کنید.
          </p>
        </div>
      )}
    </section>
  );
}
