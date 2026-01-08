"use client";

import { motion } from "framer-motion";
import { 
  Sparkles, 
  Crown, 
  Palette, 
  Type, 
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandKit } from "@/lib/db";
import { cn } from "@/lib/utils";
import { TabId } from "../brand-studio";

interface OverviewTabProps {
  brandKit: BrandKit;
  projectName: string;
  ideaInput?: string;
  onNavigate: (tab: TabId) => void;
}

export function OverviewTab({ brandKit, projectName, ideaInput, onNavigate }: OverviewTabProps) {
  // Calculate completeness
  const completenessItems = [
    { label: "لوگو", complete: (brandKit.logoConcepts?.length || 0) > 0, tab: "logo" as TabId },
    { label: "پالت رنگ", complete: !!brandKit.primaryColorHex, tab: "colors" as TabId },
    { label: "تایپوگرافی", complete: !!brandKit.suggestedFont, tab: "typography" as TabId },
    { label: "پترن‌ها", complete: (brandKit.patterns?.length || 0) > 0, tab: "patterns" as TabId },
    { label: "موکاپ‌ها", complete: (brandKit.mockups?.length || 0) > 0, tab: "mockups" as TabId },
    { label: "صدای برند", complete: !!brandKit.brandVoice, tab: "voice" as TabId },
  ];

  const completedCount = completenessItems.filter(i => i.complete).length;
  const completenessScore = Math.round((completedCount / completenessItems.length) * 100);

  return (
    <div className="space-y-8">
      {/* Hero Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 border border-primary/20 p-8"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        
        <div className="relative flex flex-col md:flex-row gap-8 items-start">
          {/* Logo Preview */}
          <div className="w-32 h-32 rounded-3xl bg-white shadow-2xl flex items-center justify-center overflow-hidden">
            {brandKit.logoVariations?.primary || brandKit.logoConcepts?.[0]?.imageUrl ? (
              <img 
                src={brandKit.logoVariations?.primary || brandKit.logoConcepts?.[0]?.imageUrl} 
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
                <span className="text-4xl font-black text-white">
                  {projectName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          {/* Brand Info */}
          <div className="flex-1">
            <h2 className="text-3xl font-black text-foreground mb-2">{projectName}</h2>
            <p className="text-muted-foreground mb-4 max-w-xl">
              {ideaInput || "هویت بصری کسب‌وکار شما آماده شده است."}
            </p>
            
            {/* Color Preview */}
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div 
                  className="w-10 h-10 rounded-xl shadow-lg"
                  style={{ backgroundColor: brandKit.primaryColorHex || '#6366f1' }}
                />
                <div 
                  className="w-10 h-10 rounded-xl shadow-lg"
                  style={{ backgroundColor: brandKit.secondaryColorHex || '#a855f7' }}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {brandKit.suggestedFont || 'Vazirmatn'}
              </span>
            </div>
          </div>
          
          {/* Completeness Ring */}
          <div className="text-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 251 }}
                  animate={{ strokeDashoffset: 251 - (251 * completenessScore / 100) }}
                  transition={{ duration: 1, delay: 0.5 }}
                  strokeDasharray="251"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black">{completenessScore}%</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">تکمیل شده</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {completenessItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onNavigate(item.tab)}
            className={cn(
              "p-4 rounded-2xl border-2 transition-all text-center group hover:shadow-lg",
              item.complete 
                ? "border-green-500/30 bg-green-500/5 hover:border-green-500/50"
                : "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center",
              item.complete ? "bg-green-500/20" : "bg-amber-500/20"
            )}>
              {item.complete ? (
                <CheckCircle2 className="text-green-500" size={20} />
              ) : (
                <AlertCircle className="text-amber-500" size={20} />
              )}
            </div>
            <p className="font-medium text-sm">{item.label}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {item.complete ? "آماده" : "نیاز به تولید"}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Wizard Info */}
      {brandKit.wizardData && (
        <div className="bg-muted/50 rounded-2xl p-6">
          <h3 className="font-bold mb-4">تنظیمات برند</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">صنعت:</span>
              <span className="mr-2 font-medium">{brandKit.wizardData.industry}</span>
            </div>
            <div>
              <span className="text-muted-foreground">سبک لوگو:</span>
              <span className="mr-2 font-medium">{brandKit.wizardData.logoStyle}</span>
            </div>
            <div>
              <span className="text-muted-foreground">احساس:</span>
              <span className="mr-2 font-medium">{brandKit.wizardData.desiredFeeling}</span>
            </div>
            <div>
              <span className="text-muted-foreground">شخصیت:</span>
              <span className="mr-2 font-medium">{brandKit.wizardData.brandPersonality?.join("، ")}</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Generate All */}
      <div className="flex justify-center">
        <Button variant="gradient" size="lg" className="gap-2">
          <Sparkles size={18} />
          تولید تمام دارایی‌های ناقص
        </Button>
      </div>
    </div>
  );
}
