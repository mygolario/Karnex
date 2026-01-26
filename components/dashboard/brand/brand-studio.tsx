"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Crown, 
  Palette, 
  Type, 
  Grid3x3,
  Image,
  MessageSquare,
  Download,
  Settings,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===== TAB CONFIGURATION =====

export const BRAND_TABS = [
  { id: "overview", label: "خلاصه برند", icon: Sparkles },
  { id: "logo", label: "لوگولب", icon: Crown },
  { id: "colors", label: "سیستم رنگ", icon: Palette },
  { id: "typography", label: "تایپوگرافی", icon: Type },
  { id: "patterns", label: "پترن‌ها", icon: Grid3x3 },
  { id: "mockups", label: "موکاپ‌ها", icon: Image },
  { id: "voice", label: "صدای برند", icon: MessageSquare },
  { id: "export", label: "دانلود", icon: Download },
] as const;

export type TabId = typeof BRAND_TABS[number]["id"];

// ===== PROPS =====

interface BrandStudioProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  children: ReactNode;
  projectName: string;
  completenessScore?: number;
  onRerunWizard?: () => void;
}

// ===== BRAND STUDIO COMPONENT =====

export function BrandStudio({ 
  activeTab, 
  onTabChange, 
  children,
  projectName,
  completenessScore = 0,
  onRerunWizard
}: BrandStudioProps) {
  
  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          {/* Title Row */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <Crown size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-foreground">استودیو برند</h1>
                <p className="text-sm text-muted-foreground">{projectName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Completeness Score */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
                <div className="w-24 h-2 bg-background rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${completenessScore}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
                <span className="text-sm font-bold">{completenessScore}%</span>
              </div>
              
              {/* Settings Button */}
              {onRerunWizard && (
                <button
                  onClick={onRerunWizard}
                  className="p-2 rounded-xl hover:bg-muted transition-colors"
                  title="اجرای مجدد ویزارد"
                >
                  <RefreshCw size={20} className="text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-1 overflow-x-auto pb-4 scrollbar-hide">
            {BRAND_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all",
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ===== TAB CONTENT WRAPPER =====

interface TabContentProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function TabContent({ title, description, actions, children }: TabContentProps) {
  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground mb-1">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      
      {/* Tab Body */}
      <div>
        {children}
      </div>
    </div>
  );
}

// ===== EMPTY STATE =====

interface EmptyStateProps {
  icon: typeof Sparkles;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
        <Icon size={40} className="text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
}

// ===== ASSET CARD =====

interface AssetCardProps {
  imageUrl?: string;
  title: string;
  subtitle?: string;
  isGenerating?: boolean;
  onGenerate?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function AssetCard({ 
  imageUrl, 
  title, 
  subtitle, 
  isGenerating, 
  onGenerate,
  onDownload,
  className 
}: AssetCardProps) {
  return (
    <div className={cn(
      "group relative rounded-2xl border-2 border-border overflow-hidden bg-card transition-all hover:border-primary/50 hover:shadow-xl",
      className
    )}>
      {/* Image */}
      <div className="aspect-square bg-muted relative">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center">
              <Image size={32} className="text-muted-foreground" />
            </div>
          </div>
        )}
        
        {/* Generating Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">در حال تولید...</span>
            </div>
          </div>
        )}
        
        {/* Hover Actions */}
        {!isGenerating && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {onGenerate && (
              <button 
                onClick={onGenerate}
                className="p-3 rounded-xl bg-white text-black hover:bg-primary hover:text-white transition-colors"
              >
                <RefreshCw size={20} />
              </button>
            )}
            {onDownload && imageUrl && (
              <button 
                onClick={onDownload}
                className="p-3 rounded-xl bg-white text-black hover:bg-primary hover:text-white transition-colors"
              >
                <Download size={20} />
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-4">
        <h4 className="font-bold text-foreground">{title}</h4>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
