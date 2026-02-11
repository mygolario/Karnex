"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, MapPin, Trash2, GitCompare, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "./location-context";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("fa-IR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateStr;
  }
}

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HistorySidebar({ isOpen, onClose }: HistorySidebarProps) {
  const {
    history, analysis,
    loadFromHistory, addToComparison, deleteFromHistory,
    comparisonMode, comparisonItems,
  } = useLocation();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 60 }}
        className="w-[300px] shrink-0 h-full border-r border-border bg-card/30 backdrop-blur-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={16} className="text-primary" />
              <h3 className="font-bold text-sm">تاریخچه تحلیل‌ها</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-7 px-2 text-muted-foreground">
              بستن
            </Button>
          </div>
          {history.length > 0 && (
            <p className="text-[10px] text-muted-foreground mt-1">{history.length} تحلیل ذخیره شده</p>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground opacity-50">
              <History size={32} className="mb-3" />
              <p className="text-sm font-medium">بدون سابقه</p>
              <p className="text-xs">اولین تحلیل خود را انجام دهید</p>
            </div>
          ) : (
            history.map((item, index) => {
              const isActive = analysis?.createdAt === item.createdAt;
              const isInComparison = comparisonItems.some(c => c.createdAt === item.createdAt);
              
              return (
                <motion.div
                  key={item.createdAt || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      "p-3 cursor-pointer transition-all group border",
                      isActive
                        ? "border-primary/30 bg-primary/5"
                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                    )}
                    onClick={() => loadFromHistory(item)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin size={12} className={isActive ? "text-primary" : "text-muted-foreground"} />
                        <span className="text-xs font-bold truncate">{item.address}</span>
                      </div>
                      <div className={cn(
                        "shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black",
                        item.score >= 7 ? "bg-emerald-500/10 text-emerald-500"
                          : item.score >= 4 ? "bg-amber-500/10 text-amber-500"
                          : "bg-red-500/10 text-red-500"
                      )}>
                        {item.score}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{formatDate(item.createdAt)}</span>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isActive && (
                          <Badge variant="outline" className="text-[8px] py-0 px-1.5 border-primary/20 text-primary">
                            <Eye size={8} className="ml-0.5" /> فعال
                          </Badge>
                        )}
                        {comparisonMode && (
                          <button
                            onClick={(e) => { e.stopPropagation(); addToComparison(item); }}
                            className={cn(
                              "p-1 rounded text-[10px]",
                              isInComparison
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-white/5 text-muted-foreground"
                            )}
                            title="افزودن به مقایسه"
                          >
                            <GitCompare size={12} />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteFromHistory(item.createdAt); }}
                          className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
