"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTourStore } from "@/lib/tour/store";
import { tourI18n } from "@/lib/tour/i18n";
import type { TourPersona } from "@/lib/tour/types";
import { TourMascot } from "./tour-mascot";
import { trackWelcomeCompleted } from "@/lib/tour/analytics";
import { cn } from "@/lib/utils";
import { Rocket, Mic, Megaphone, LayoutGrid } from "lucide-react";

const PERSONAS: {
  id: TourPersona;
  icon: typeof Rocket;
  color: string;
}[] = [
  { id: "founder", icon: Rocket, color: "from-blue-500 to-indigo-600" },
  { id: "creator", icon: Mic, color: "from-purple-500 to-pink-600" },
  { id: "marketer", icon: Megaphone, color: "from-amber-500 to-orange-600" },
  { id: "general", icon: LayoutGrid, color: "from-slate-500 to-slate-700" },
];

export function TourWelcome() {
  const { showWelcome, setPersona, closeWelcome, startTour, skipTourById } = useTourStore();

  if (!showWelcome) return null;

  const handleStart = (persona: TourPersona) => {
    setPersona(persona);
    trackWelcomeCompleted(persona);
    closeWelcome();
    startTour("dashboard", 0, true);
  };

  const handleSkip = () => {
    setPersona("general");
    closeWelcome();
    skipTourById("dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10003] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      dir="rtl"
    >
      <motion.div
        initial={{ scale: 0.92, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-card border border-border rounded-[2rem] p-8 max-w-lg w-full text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-violet-500/10 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <TourMascot mood="welcome" size="lg" />
          </div>

          <h1 className="text-3xl font-black text-foreground mb-2">
            {tourI18n.welcomeTitle}
          </h1>
          <p className="text-muted-foreground mb-8">{tourI18n.welcomeSubtitle}</p>

          <p className="text-sm font-bold text-foreground mb-4">{tourI18n.pickPersona}</p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {PERSONAS.map(({ id, icon: Icon, color }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleStart(id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/50",
                  "hover:border-primary/40 hover:shadow-lg transition-all group"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg group-hover:scale-110 transition-transform",
                    color
                  )}
                >
                  <Icon size={22} />
                </div>
                <span className="text-xs font-medium">
                  {tourI18n.personas[id]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="gradient" size="lg" onClick={() => handleStart("general")}>
              {tourI18n.startGrandTour}
            </Button>
            <Button variant="ghost" onClick={handleSkip}>
              {tourI18n.skipToDashboard}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
