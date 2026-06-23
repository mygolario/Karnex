"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BudgetOption {
  id: string;
  emoji: string;
  label: string;
  sublabel: string;
  range: string;
  color: string;
}

const budgetOptions: BudgetOption[] = [
  { 
    id: "side", 
    emoji: "💡", 
    label: "پروژه جانبی", 
    sublabel: "شروع با سرمایه کم",
    range: "۰ - ۱۰ میلیون تومان",
    color: "from-amber-400 to-orange-500"
  },
  { 
    id: "small", 
    emoji: "📈", 
    label: "کسب‌وکار کوچک", 
    sublabel: "رشد پایدار",
    range: "۱۰ - ۱۰۰ میلیون تومان",
    color: "from-blue-400 to-indigo-500"
  },
  { 
    id: "startup", 
    emoji: "🚀", 
    label: "استارتاپ مقیاس‌پذیر", 
    sublabel: "رشد سریع و جذب سرمایه",
    range: "۱۰۰+ میلیون تومان",
    color: "from-emerald-400 to-teal-500"
  },
];

interface BudgetSelectorProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function BudgetSelector({ selected, onSelect }: BudgetSelectorProps) {
  return (
    <div className="grid gap-4">
      {budgetOptions.map((option, index) => (
        <motion.button
          key={option.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
          onClick={() => onSelect(option.id)}
          className={cn(
            "p-5 rounded-2xl border-2 transition-all text-end flex items-center gap-4 group",
            selected === option.id
              ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
              : "border-border hover:border-primary/30 hover:shadow-lg"
          )}
        >
          <div className={cn(
            "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110",
            option.color
          )}>
            {option.emoji}
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground">{option.label}</p>
            <p className="text-sm text-muted-foreground">{option.sublabel}</p>
            <p className="text-xs text-primary font-medium mt-1">{option.range}</p>
          </div>
          {selected === option.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
}

export { budgetOptions };
