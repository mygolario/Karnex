"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface XpFloatProps {
    amount: number;
    trigger: boolean;
    position?: { x: number; y: number };
    onComplete?: () => void;
}

export function XpFloat({ amount, trigger, position, onComplete }: XpFloatProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (trigger && amount > 0) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                onComplete?.();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [trigger, amount, onComplete]);

    const defaultPosition = { x: 50, y: 50 };
    const pos = position || defaultPosition;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{
                        opacity: [0, 1, 1, 0],
                        y: -80,
                        scale: [0.5, 1.2, 1, 1]
                    }}
                    transition={{ duration: 1.5, times: [0, 0.2, 0.5, 1] }}
                    className="fixed pointer-events-none z-[110]"
                    style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        transform: "translate(-50%, -50%)"
                    }}
                >
                    <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-xl shadow-amber-500/40 font-black text-lg">
                        <motion.span
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 0.5, repeat: 2 }}
                        >
                            ⚡
                        </motion.span>
                        <span>+{amount} XP</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Inline XP indicator for messages
interface XpBadgeProps {
    amount: number;
    variant?: "default" | "small" | "inline";
}

export function XpBadge({ amount, variant = "default" }: XpBadgeProps) {
    if (amount <= 0) return null;

    const sizes = {
        default: "px-3 py-1.5 text-sm",
        small: "px-2 py-0.5 text-xs",
        inline: "px-1.5 py-0.5 text-[10px]",
    };

    return (
        <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full font-bold shadow-lg shadow-amber-500/20 ${sizes[variant]}`}
        >
            <span>⚡</span>
            <span>+{amount} XP</span>
        </motion.span>
    );
}

// XP counter animation (for header)
interface XpCounterProps {
    value: number;
    className?: string;
}

export function XpCounter({ value, className }: XpCounterProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (value !== displayValue) {
            setIsAnimating(true);

            // Animate the number
            const diff = value - displayValue;
            const steps = 20;
            const stepValue = diff / steps;
            let current = displayValue;
            let step = 0;

            const interval = setInterval(() => {
                step++;
                current += stepValue;
                setDisplayValue(Math.round(current));

                if (step >= steps) {
                    clearInterval(interval);
                    setDisplayValue(value);
                    setTimeout(() => setIsAnimating(false), 300);
                }
            }, 30);

            return () => clearInterval(interval);
        }
    }, [value, displayValue]);

    return (
        <motion.div
            animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
            className={`flex items-center gap-1 ${className}`}
        >
            <span className="text-xs font-medium opacity-80">XP</span>
            <span className="text-amber-400">⚡</span>
            <span className={`font-bold tabular-nums ${isAnimating ? "text-amber-400" : ""}`}>
                {displayValue > 0 ? displayValue.toLocaleString("fa-IR") : "۰"}
            </span>
        </motion.div>
    );
}
