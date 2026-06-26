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
  const { activeStep, error, clearError } = useGenesisWizard();

  return (
    <div
      className="min-h-screen bg-background font-sans overflow-x-hidden relative"
      dir="rtl"
    >
      {/* On-brand ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-mesh-gradient">
        <div className="absolute top-[-15%] start-[-10%] w-[45vw] h-[45vw] rounded-full blur-[120px] opacity-40 bg-brand-primary/20" />
        <div className="absolute bottom-[-15%] end-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-40 bg-brand-secondary/20" />
      </div>

      {/* Header */}
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

        {activeStep === 0 && (
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

      {/* Stepper (hidden on the first step for a cleaner intro, shown from Details onward) */}
      {activeStep > 0 && (
        <div className="relative z-10 pb-6">
          <GenesisStepper />
        </div>
      )}

      {/* Error toast */}
      <AnimatePresence>
        {error && (
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

      {/* Step content */}
      <main className="relative z-10 w-full mx-auto pb-12 flex flex-col min-h-[calc(100vh-220px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-1 flex flex-col justify-center"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
