"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Package, Wand2, Loader2, RefreshCw, Download, FileText, 
  Smartphone, ShoppingBag, Coffee, Phone, Mail, CreditCard,
  Instagram, Linkedin, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandMockup } from "@/lib/db";

interface MockupGalleryProps {
  mockups?: BrandMockup[];
  projectName: string;
  primaryColor: string;
  secondaryColor: string;
  onGenerateAllMockups: () => Promise<void>;
  onGenerateSingleMockup: (type: BrandMockup['type']) => Promise<void>;
  isGenerating: boolean;
  generatingType?: string;
}

type MockupCategory = 'product' | 'stationery' | 'social';

const MOCKUP_ITEMS: { 
  type: BrandMockup['type']; 
  label: string; 
  category: MockupCategory;
  icon: any;
}[] = [
  // Products
  { type: 'tshirt', label: 'تی‌شرت', category: 'product', icon: ShoppingBag },
  { type: 'mug', label: 'لیوان', category: 'product', icon: Coffee },
  { type: 'tote_bag', label: 'کیف پارچه‌ای', category: 'product', icon: ShoppingBag },
  { type: 'phone_case', label: 'قاب گوشی', category: 'product', icon: Phone },
  // Stationery
  { type: 'letterhead', label: 'سربرگ', category: 'stationery', icon: FileText },
  { type: 'business_card', label: 'کارت ویزیت', category: 'stationery', icon: CreditCard },
  { type: 'envelope', label: 'پاکت نامه', category: 'stationery', icon: Mail },
  // Social
  { type: 'instagram', label: 'اینستاگرام', category: 'social', icon: Instagram },
  { type: 'linkedin', label: 'لینکدین', category: 'social', icon: Linkedin },
  { type: 'whatsapp', label: 'واتساپ', category: 'social', icon: MessageCircle },
];

const CATEGORY_LABELS: Record<MockupCategory, string> = {
  product: '🛍️ محصولات',
  stationery: '📄 اوراق اداری',
  social: '📱 شبکه اجتماعی'
};

export function MockupGallery({
  mockups = [],
  projectName,
  primaryColor,
  secondaryColor,
  onGenerateAllMockups,
  onGenerateSingleMockup,
  isGenerating,
  generatingType
}: MockupGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<MockupCategory>('product');
  
  const filteredItems = MOCKUP_ITEMS.filter(item => item.category === activeCategory);
  
  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
            <Package size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">گالری موکاپ</h2>
            <p className="text-sm text-muted-foreground">نمایش برند روی محصولات واقعی</p>
          </div>
        </div>
        <Button 
          variant="gradient" 
          onClick={onGenerateAllMockups}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating && !generatingType ? (
            <><Loader2 size={16} className="animate-spin" /> تولید همه موکاپ‌ها...</>
          ) : (
            <><Wand2 size={16} /> تولید ۱۰ موکاپ</>
          )}
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {(Object.keys(CATEGORY_LABELS) as MockupCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Mockup Grid */}
      <motion.div 
        key={activeCategory}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {filteredItems.map((item) => {
          const mockup = mockups.find(m => m.type === item.type);
          const isCurrentlyGenerating = generatingType === item.type;
          const IconComponent = item.icon;
          
          return (
            <motion.div
              key={item.type}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group"
            >
              <Card className="overflow-hidden border-white/5 bg-card hover:shadow-xl transition-all duration-300">
                {/* Mockup Preview */}
                <div className="aspect-square relative overflow-hidden">
                  {mockup?.imageUrl ? (
                    <>
                      <img 
                        src={mockup.imageUrl} 
                        alt={item.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a 
                          href={mockup.imageUrl}
                          download={`${projectName}-${item.type}.png`}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Download size={18} className="text-black" />
                        </a>
                        <button
                          onClick={() => onGenerateSingleMockup(item.type)}
                          disabled={isGenerating}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw size={18} className="text-black" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div 
                      className="w-full h-full flex flex-col items-center justify-center gap-3"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`
                      }}
                    >
                      {isCurrentlyGenerating ? (
                        <>
                          <Loader2 size={32} className="animate-spin text-primary" />
                          <span className="text-xs text-muted-foreground">در حال تولید...</span>
                        </>
                      ) : (
                        <>
                          <IconComponent size={40} className="text-muted-foreground/40" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onGenerateSingleMockup(item.type)}
                            disabled={isGenerating}
                            className="gap-1"
                          >
                            <Wand2 size={14} />
                            تولید
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground">{item.label}</h3>
                    {mockup && (
                      <Badge variant="secondary" className="text-[10px]">آماده</Badge>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
