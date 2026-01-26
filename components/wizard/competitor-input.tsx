"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CompetitorInputProps {
  competitors: string[];
  onChange: (competitors: string[]) => void;
  placeholder?: string;
  maxCompetitors?: number;
}

export function CompetitorInput({ 
  competitors, 
  onChange, 
  placeholder = "نام رقیب را وارد کنید...",
  maxCompetitors = 5 
}: CompetitorInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (competitors.length < maxCompetitors && !competitors.includes(inputValue.trim())) {
        onChange([...competitors, inputValue.trim()]);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && competitors.length > 0) {
      onChange(competitors.slice(0, -1));
    }
  };

  const removeCompetitor = (index: number) => {
    onChange(competitors.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {competitors.map((competitor, index) => (
            <motion.span
              key={competitor}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              layout
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              {competitor}
              <button
                type="button"
                onClick={() => removeCompetitor(index)}
                className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {competitors.length < maxCompetitors && (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input-premium"
        />
      )}

      <p className="text-xs text-muted-foreground">
        {competitors.length}/{maxCompetitors} رقیب اضافه شده • Enter برای افزودن
      </p>
    </div>
  );
}
