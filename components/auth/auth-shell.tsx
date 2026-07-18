"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { AuthBrandPanel } from "./auth-brand-panel";

interface AuthShellProps {
  mode: "login" | "signup";
  mobileTitle?: string;
  children: React.ReactNode;
}

export function AuthShell({ mode, mobileTitle = "کارنکس", children }: AuthShellProps) {
  return (
    <div className="min-h-screen flex w-full bg-background overflow-hidden" dir="rtl">
      {/* Decorative background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-mesh-gradient">
        <div className="absolute top-[-10%] start-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-40 bg-brand-primary/20" />
        <div className="absolute bottom-[-10%] end-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-40 bg-brand-secondary/20" />
      </div>

      <AuthBrandPanel mode={mode} />

      {/* Form side */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10"
      >
        <div className="w-full max-w-md space-y-8">
          {/* Mobile header */}
          <div className="lg:hidden text-center">
            <div className="w-16 h-16 mx-auto bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Image
                src="/logo.png"
                alt="لوگوی کارنکس"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{mobileTitle}</h2>
          </div>

          {children}
        </div>
      </motion.div>
    </div>
  );
}
