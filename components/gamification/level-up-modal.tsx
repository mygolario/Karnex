"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Award, Star, X } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LevelUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    level: number;
}

export function LevelUpModal({ isOpen, onClose, level }: LevelUpModalProps) {

    useEffect(() => {
        if (isOpen) {
            const duration = 3000;
            const end = Date.now() + duration;

            const colors = ['#f59e0b', '#d97706', '#fbbf24', '#ffffff'];

            (function frame() {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-8 text-center text-white shadow-2xl overflow-hidden"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Glow Effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-amber-500/10 blur-[60px] pointer-events-none" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-2">
                            <Award size={48} className="text-white drop-shadow-md" />
                        </div>

                        <div>
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-amber-400 font-bold uppercase tracking-widest text-xs mb-1"
                            >
                                LEVEL UP!
                            </motion.div>
                            <motion.h2
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                                className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200"
                            >
                                {level}
                            </motion.h2>
                        </div>

                        <p className="text-slate-300 text-sm">
                            تبریک! شما به سطح {level} «بنیان‌گذار» رسیدید. ویژگی‌های جدیدی برای شما باز شد.
                        </p>

                        <div className="grid grid-cols-3 gap-2 w-full mt-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white/5 rounded-lg p-2 flex flex-col items-center border border-white/5">
                                    <Star size={14} className="text-amber-400 mb-1" />
                                    <span className="text-[10px] text-slate-400">پاداش {i + 1}</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            variant="gradient"
                            className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
                            onClick={onClose}
                        >
                            ادامه بده!
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
