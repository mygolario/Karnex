"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface XpToastProps {
    xp: number;
    reason: string;
    isVisible: boolean;
    onHide: () => void;
}

export function XpToast({ xp, reason, isVisible, onHide }: XpToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onHide, 3000); // Auto hide after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [isVisible, onHide]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 border border-amber-500/30 text-white px-4 py-3 rounded-full shadow-xl shadow-amber-500/10 backdrop-blur-md"
                >
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/40 animate-pulse">
                        <Zap size={16} className="text-white fill-white" />
                    </div>
                    <div>
                        <span className="font-black text-amber-400 text-lg">+{xp} XP</span>
                        <span className="text-xs text-slate-400 mr-2 border-r border-slate-700 pr-2">{reason}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
