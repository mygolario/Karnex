"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface CelebrationProps {
    type: "confetti" | "stars" | "fireworks" | "levelup" | "streak" | "mission";
    trigger: boolean;
    onComplete?: () => void;
}

// Star burst animation component
const StarBurst = ({ onComplete }: { onComplete?: () => void }) => {
    const stars = Array.from({ length: 12 }, (_, i) => i);

    useEffect(() => {
        const timer = setTimeout(() => onComplete?.(), 1000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
            {stars.map((i) => (
                <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: 0, x: 0, y: 0 }}
                    animate={{
                        scale: [0, 1, 0],
                        rotate: [0, 180],
                        x: Math.cos((i * 30 * Math.PI) / 180) * 150,
                        y: Math.sin((i * 30 * Math.PI) / 180) * 150,
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute text-3xl"
                >
                    ⭐
                </motion.div>
            ))}
        </div>
    );
};

// Level up celebration
const LevelUpBurst = ({ onComplete }: { onComplete?: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(() => onComplete?.(), 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 1.5] }}
            transition={{ duration: 2, times: [0, 0.3, 0.7, 1] }}
            className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center"
        >
            <div className="text-center">
                <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="text-8xl mb-4"
                >
                    🏆
                </motion.div>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-black text-primary"
                >
                    Level Up!
                </motion.p>
            </div>
        </motion.div>
    );
};

// Streak fire animation
const StreakFire = ({ onComplete }: { onComplete?: () => void }) => {
    const fires = Array.from({ length: 5 }, (_, i) => i);

    useEffect(() => {
        const timer = setTimeout(() => onComplete?.(), 1500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
            {fires.map((i) => (
                <motion.div
                    key={i}
                    initial={{ scale: 0, y: 50, opacity: 0 }}
                    animate={{
                        scale: [0, 1.5, 1],
                        y: [50, -50, -100],
                        opacity: [0, 1, 0],
                    }}
                    transition={{ duration: 1.2, delay: i * 0.1, ease: "easeOut" }}
                    className="absolute text-5xl"
                    style={{ left: `${40 + i * 5}%` }}
                >
                    🔥
                </motion.div>
            ))}
        </div>
    );
};

// Mission complete celebration
const MissionComplete = ({ onComplete }: { onComplete?: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(() => onComplete?.(), 1500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.2, 1, 1] }}
            transition={{ duration: 1.5, times: [0, 0.2, 0.8, 1] }}
            className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center"
        >
            <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-8 py-6 rounded-3xl shadow-2xl shadow-emerald-500/40"
            >
                <div className="flex items-center gap-4">
                    <motion.span
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.5, repeat: 2 }}
                        className="text-5xl"
                    >
                        ✅
                    </motion.span>
                    <div>
                        <p className="text-2xl font-black">ماموریت انجام شد!</p>
                        <p className="text-emerald-100">عالی بود! 🎉</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export function Celebration({ type, trigger, onComplete }: CelebrationProps) {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (trigger) {
            setIsActive(true);

            // Trigger confetti for certain types
            if (type === "confetti" || type === "levelup") {
                const duration = 2000;
                const end = Date.now() + duration;

                const frame = () => {
                    confetti({
                        particleCount: 3,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0, y: 0.7 },
                        colors: ["#6366f1", "#8b5cf6", "#a855f7", "#fbbf24"],
                    });
                    confetti({
                        particleCount: 3,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1, y: 0.7 },
                        colors: ["#6366f1", "#8b5cf6", "#a855f7", "#fbbf24"],
                    });

                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                };
                frame();
            }

            if (type === "fireworks") {
                const count = 200;
                const defaults = {
                    origin: { y: 0.7 },
                };

                function fire(particleRatio: number, opts: confetti.Options) {
                    confetti({
                        ...defaults,
                        ...opts,
                        particleCount: Math.floor(count * particleRatio),
                    });
                }

                fire(0.25, { spread: 26, startVelocity: 55 });
                fire(0.2, { spread: 60 });
                fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
                fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
                fire(0.1, { spread: 120, startVelocity: 45 });
            }
        }
    }, [trigger, type]);

    const handleComplete = () => {
        setIsActive(false);
        onComplete?.();
    };

    return (
        <AnimatePresence>
            {isActive && (
                <>
                    {type === "stars" && <StarBurst onComplete={handleComplete} />}
                    {type === "levelup" && <LevelUpBurst onComplete={handleComplete} />}
                    {type === "streak" && <StreakFire onComplete={handleComplete} />}
                    {type === "mission" && <MissionComplete onComplete={handleComplete} />}
                </>
            )}
        </AnimatePresence>
    );
}

// Quick celebration trigger functions
export function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#8b5cf6", "#a855f7", "#fbbf24", "#10b981"],
    });
}

export function triggerStars() {
    const defaults = {
        spread: 360,
        ticks: 50,
        gravity: 0,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["star"] as confetti.Shape[],
        colors: ["#fbbf24", "#f59e0b", "#d97706"],
    };

    confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
    });

    confetti({
        ...defaults,
        particleCount: 20,
        scalar: 0.75,
    });
}
