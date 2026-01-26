"use client";

import { motion } from "framer-motion";
import { 
  Image as ImageIcon, Wand2, Loader2, RefreshCw, Download, Zap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoConcept } from "@/lib/db";

interface LogoConceptCardProps {
  concepts: LogoConcept[];
  projectName: string;
  primaryColor: string;
  secondaryColor: string;
  onGenerateLogo: (index: number) => Promise<void>;
  generatingIndex: number | null;
}

export function LogoConceptsSection({
  concepts,
  projectName,
  primaryColor,
  secondaryColor,
  onGenerateLogo,
  generatingIndex
}: LogoConceptCardProps) {
  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <ImageIcon size={24} />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">ایده‌های لوگو</h2>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Zap size={12} />
          AI تصویرساز فعال
        </Badge>
      </div>

      {/* Logo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {concepts?.map((logo, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="group p-6 text-center border-white/5 bg-gradient-to-b from-card to-card/50 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Logo Image */}
              <div className="relative w-full aspect-square rounded-2xl mb-6 overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                {logo.imageUrl ? (
                  <>
                    <img 
                      src={logo.imageUrl} 
                      alt={logo.conceptName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <a 
                      href={logo.imageUrl} 
                      download={`${projectName}-logo-${index + 1}.png`}
                      className="absolute bottom-3 left-3 bg-white/90 backdrop-blur p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download size={18} className="text-foreground" />
                    </a>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div 
                      className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <span className="font-black text-2xl" style={{ color: primaryColor }}>
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">برای تولید لوگو کلیک کنید</p>
                  </div>
                )}
                
                {/* Loading Overlay */}
                {generatingIndex === index && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur flex flex-col items-center justify-center gap-3">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">در حال تولید با AI...</span>
                  </div>
                )}
              </div>
              
              {/* Info */}
              <h3 className="font-bold text-lg text-foreground mb-2">{logo.conceptName}</h3>
              <p className="text-muted-foreground text-sm leading-7 mb-4 line-clamp-2">
                {logo.description}
              </p>
              
              {/* Generate Button */}
              <Button 
                variant={logo.imageUrl ? "outline" : "gradient"}
                size="sm"
                onClick={() => onGenerateLogo(index)}
                disabled={generatingIndex !== null}
                className="w-full gap-2"
              >
                {logo.imageUrl ? (
                  <><RefreshCw size={14} /> بازسازی لوگو</>
                ) : (
                  <><Wand2 size={14} /> تولید لوگو با AI</>
                )}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
