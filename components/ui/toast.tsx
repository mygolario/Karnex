"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "celebration";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  celebrate: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const toastVariants = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, damping: 20, stiffness: 300 } },
  exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }
};

const icons = {
  success: <CheckCircle2 size={20} className="text-emerald-500" />,
  error: <AlertCircle size={20} className="text-red-500" />,
  info: <Info size={20} className="text-blue-500" />,
  celebration: <Sparkles size={20} className="text-amber-500" />,
};

const styles = {
  success: "border-emerald-500/20 bg-emerald-500/10",
  error: "border-red-500/20 bg-red-500/10",
  info: "border-blue-500/20 bg-blue-500/10",
  celebration: "border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((options: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = options.duration || 4000;
    
    setToasts(prev => [...prev, { ...options, id }]);
    
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const toast = useCallback((options: Omit<Toast, "id">) => addToast(options), [addToast]);
  const success = useCallback((title: string, message?: string) => 
    addToast({ type: "success", title, message }), [addToast]);
  const error = useCallback((title: string, message?: string) => 
    addToast({ type: "error", title, message }), [addToast]);
  const info = useCallback((title: string, message?: string) => 
    addToast({ type: "info", title, message }), [addToast]);
  const celebrate = useCallback((title: string, message?: string) => 
    addToast({ type: "celebration", title, message, duration: 5000 }), [addToast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, celebrate }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 w-full max-w-md px-4 pointer-events-none">
        <AnimatePresence mode="sync">
          {toasts.map(t => (
            <motion.div
              key={t.id}
              variants={toastVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={cn(
                "pointer-events-auto relative overflow-hidden rounded-2xl border backdrop-blur-xl shadow-2xl p-4",
                styles[t.type]
              )}
            >
              {/* Celebration shimmer effect */}
              {t.type === "celebration" && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              )}
              
              <div className="relative flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {icons[t.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">{t.title}</p>
                  {t.message && (
                    <p className="text-sm text-muted-foreground mt-0.5">{t.message}</p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 p-1 rounded-lg hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
