"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, AlertCircle, Info, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Types
interface CanvasCard {
  id: string;
  content: string;
  color: string;
}

interface BMCBlockProps {
  field: string;
  config: {
    title: string;
    subtitle: string;
    icon: any;
    bgColor: string;
    iconBg: string;
    borderColor?: string;
    description?: string; // Extended help text
  };
  cards: CanvasCard[];
  onAdd: () => void;
  onUpdate: (key: string, id: string, text: string) => void;
  onDelete: (key: string, id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function BMCBlock({ 
  field, config, cards, onAdd, onUpdate, onDelete, className, style 
}: BMCBlockProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Card 
      dir="rtl" 
      style={style} 
      className={cn(
        "flex flex-col border border-border/50 shadow-sm overflow-visible h-full min-h-[180px] transition-all duration-300 relative group",
        "hover:shadow-md hover:border-primary/20",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className={cn("p-3 border-b bg-gradient-to-r flex items-center justify-between rounded-t-2xl", config.bgColor)}>
        <div className="flex items-center gap-2">
          {/* Icon Box */}
          <div className={cn(
            "w-8 h-8 rounded-lg text-white flex items-center justify-center shadow-lg shadow-black/10 transition-transform duration-300",
            config.iconBg,
            isHovered ? "scale-110 rotate-3" : ""
          )}>
            <config.icon size={16} />
          </div>
          
          {/* Text */}
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm leading-tight text-foreground/90">{config.title}</h3>
              {/* Tooltip Trigger */}
              <div 
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info size={12} className="text-muted-foreground/50 hover:text-primary cursor-help transition-colors" />
                
                {/* Custom Tooltip */}
                <AnimatePresence>
                  {showTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.9 }}
                      className="absolute z-50 w-48 p-2.5 rounded-xl bg-popover border border-border shadow-xl text-xs leading-relaxed text-popover-foreground right-[-10px] top-5"
                    >
                      <div className="font-semibold mb-1 text-primary">{config.subtitle}</div>
                      <div className="opacity-80 leading-4">{config.description || config.subtitle}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {/* Subtitle (Hidden on small screens if needed, strictly truncated) */}
            <p className="text-[10px] text-muted-foreground opacity-70 line-clamp-1 max-w-[120px]">
              {config.subtitle}
            </p>
          </div>
        </div>

        {/* Quick Add Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-7 w-7 transition-all duration-300", 
            isHovered ? "bg-background/50 text-foreground" : "opacity-60"
          )} 
          onClick={onAdd}
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Content Area */}
      <div className="p-2 flex-1 space-y-2 bg-card/30 relative overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 rounded-b-2xl">
        <AnimatePresence mode="popLayout">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div 
                className={cn(
                  "group/card relative bg-background border rounded-lg p-2.5 text-xs shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5",
                  "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50",
                  `shadow-${card.color}-500/5`
                )}
                style={{ borderRight: `3px solid var(--${card.color}-500, #3b82f6)` }}
              >
                <textarea
                  className="w-full bg-transparent resize-none outline-none min-h-[44px] leading-relaxed text-foreground/90 placeholder:text-muted-foreground/40"
                  value={card.content}
                  onChange={(e) => onUpdate(field, card.id, e.target.value)}
                  placeholder="اینجا بنویسید..."
                  rows={2}
                />
                
                {/* Card Actions */}
                <div className="absolute top-1 left-1 opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(field, card.id)}
                  >
                    <AlertCircle size={12} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {cards.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center cursor-pointer group/empty"
            onClick={onAdd}
          >
            <div className={cn(
              "w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-2 transition-all duration-300",
              "group-hover/empty:bg-primary/10 group-hover/empty:scale-110"
            )}>
              <Plus size={20} className="text-muted-foreground group-hover/empty:text-primary transition-colors" />
            </div>
            <p className="text-[10px] text-muted-foreground/60 font-medium group-hover/empty:text-primary/80 transition-colors">
              موردی اضافه کنید
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
