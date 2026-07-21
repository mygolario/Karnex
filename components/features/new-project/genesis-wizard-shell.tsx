"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenesisStepper } from "./genesis-stepper";
import { useGenesisWizard } from "./genesis-wizard-context";

interface GenesisWizardShellProps {
  children: React.ReactNode;
}

export function GenesisWizardShell({ children }: GenesisWizardShellProps) {
  const { activeStep, currentPhase, error, clearError } = useGenesisWizard();

  const showBackHome = currentPhase === "welcome" || currentPhase === "pillar";

  return (
    <div
      className="min-h-screen bg-background font-sans overflow-x-hidden relative"
      dir="rtl"
    >
      {/* Ambient pink/orange mesh — evolved */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-mesh-gradient">
        <div className="absolute top-[-18%] start-[-12%] w-[50vw] h-[50vw] rounded-full blur-[130px] opacity-45 bg-brand-primary/25" />
        <div className="absolute bottom-[-18%] end-[-12%] w-[45vw] h-[45vw] rounded-full blur-[130px] opacity-40 bg-brand-secondary/25" />
        <div className="absolute top-[40%] start-[30%] w-[28vw] h-[28vw] rounded-full blur-[100px] opacity-20 bg-brand-accent/20" />
      </div>

      <header className="relative z-50 p-6 md:p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
            <Image
              src="/logo.png"
              alt="Karnex Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            کارنکس
          </span>
        </Link>

        {showBackHome && (
          <Link href="/">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              بازگشت
            </Button>
          </Link>
        )}
      </header>

      {activeStep > 0 && currentPhase !== "build" && (
        <div className="relative z-10 pb-6">
          <GenesisStepper />
        </div>
      )}

      <AnimatePresence>
        {error && currentPhase !== "build" && (
          <motion.div
            key={error}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={clearError}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-destructive/10 border border-destructive/50 text-destructive px-6 py-3 rounded-xl backdrop-blur-md z-50 font-medium cursor-pointer max-w-[90vw] text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 w-full mx-auto pb-12 flex flex-col min-h-[calc(100vh-220px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="flex-1 flex flex-col justify-center"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
