"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
    GamificationProfile,
    getGamificationProfile,
    addGamificationXp
} from "@/lib/db";
import { LevelUpModal } from "@/components/gamification/level-up-modal";
import { XpToast } from "@/components/gamification/xp-toast";

interface GamificationContextType {
    profile: GamificationProfile | null;
    loading: boolean;
    addXp: (amount: number, reason: string) => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType>({
    profile: null,
    loading: true,
    addXp: async () => { },
    refreshProfile: async () => { },
});

export const useGamification = () => useContext(GamificationContext);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [profile, setProfile] = useState<GamificationProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // UI States
    const [levelUpModalOpen, setLevelUpModalOpen] = useState(false);
    const [newLevel, setNewLevel] = useState(1);
    const [xpToast, setXpToast] = useState<{ show: boolean; xp: number; reason: string }>({
        show: false, xp: 0, reason: ""
    });

    useEffect(() => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }
        refreshProfile();
    }, [user]);

    const refreshProfile = async () => {
        if (!user) return;
        try {
            const data = await getGamificationProfile(user.id);
            setProfile(data);
        } catch (err) {
            console.error("Failed to load gamification profile", err);
        } finally {
            setLoading(false);
        }
    };

    const addXp = async (amount: number, reason: string) => {
        if (!user || !profile) return;

        // Optimistic UI update
        setXpToast({ show: true, xp: amount, reason });

        // Play sound? (Optional)

        try {
            const result = await addGamificationXp(user.id, amount, reason);

            if (result) {
                setProfile(prev => prev ? {
                    ...prev,
                    totalXp: result.newXp,
                    level: result.newLevel
                } : null);

                if (result.levelUp) {
                    setNewLevel(result.newLevel);
                    setTimeout(() => setLevelUpModalOpen(true), 1000); // Small delay after toast
                }
            }
        } catch (err) {
            console.error("Failed to add XP", err);
        }
    };

    return (
        <GamificationContext.Provider value={{
            profile,
            loading,
            addXp,
            refreshProfile
        }}>
            {children}

            {/* Global Gamification UI Components */}
            <LevelUpModal
                isOpen={levelUpModalOpen}
                onClose={() => setLevelUpModalOpen(false)}
                level={newLevel}
            />

            <XpToast
                isVisible={xpToast.show}
                xp={xpToast.xp}
                reason={xpToast.reason}
                onHide={() => setXpToast(prev => ({ ...prev, show: false }))}
            />

        </GamificationContext.Provider>
    );
}
