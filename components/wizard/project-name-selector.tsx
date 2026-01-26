"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RefreshCw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectNameSelectorProps {
  idea: string;
  selectedName: string;
  onNameChange: (name: string) => void;
}

export function ProjectNameSelector({ idea, selectedName, onNameChange }: ProjectNameSelectorProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchSuggestions = async () => {
    if (!idea || idea.length < 3) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/suggest-project-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea })
      });
      
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.names || []);
        setHasLoaded(true);
      }
    } catch (error) {
      console.error("Failed to fetch name suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch suggestions when idea is available and hasn't loaded yet
  useEffect(() => {
    if (idea && !hasLoaded && !isLoading) {
      fetchSuggestions();
    }
  }, [idea]);

  return (
    <div className="space-y-6">
      {/* Custom Name Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          نام پروژه‌ات چیه؟
        </label>
        <input
          type="text"
          value={selectedName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="مثال: عسل کوهستان، آکادمی زبان..."
          className="input-premium text-lg"
        />
      </div>

      {/* AI Suggestions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            پیشنهادات دستیار کارنکس:
          </p>
          <button
            onClick={fetchSuggestions}
            disabled={isLoading || !idea}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            تازه‌سازی
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : suggestions.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {suggestions.map((name, index) => (
                <motion.button
                  key={name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onNameChange(name)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 text-right transition-all group",
                    selectedName === name
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <span className={cn(
                    "font-bold text-lg",
                    selectedName === name ? "text-primary" : "text-foreground"
                  )}>
                    {name}
                  </span>
                  {selectedName === name && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 left-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                    >
                      <Check size={12} className="text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        ) : !isLoading && hasLoaded ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            نامی پیدا نشد. خودت یک نام انتخاب کن!
          </p>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            ایده‌ات رو وارد کن تا نام پیشنهاد بدم
          </p>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground text-center">
        💡 یک نام کوتاه و به‌یادماندنی انتخاب کن که ماهیت کسب‌وکارت رو نشون بده
      </p>
    </div>
  );
}
