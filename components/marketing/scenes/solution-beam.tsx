"use client";

import { motion } from "framer-motion";

export function SolutionBeam() {
  return (
    <section className="h-screen w-full relative flex items-center justify-center bg-slate-950 text-white overflow-hidden snap-center">
      
      {/* === THE BEAM === */}
      <motion.div 
        initial={{ height: "0%" }}
        whileInView={{ height: "100%" }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className="absolute bottom-0 w-1 md:w-2 bg-gradient-to-t from-primary via-cyan-400 to-transparent shadow-[0_0_50px_10px_rgba(34,211,238,0.3)]"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_50%)]" />

      {/* === CONTENT === */}
      <div className="relative z-10 text-center px-4">
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
        >
            <div className="inline-block mb-6 px-4 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-bold tracking-widest uppercase">
                بصیـــــرت کارنکــــس
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-8">
                نظم در آشوب
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                ما مسیر را روشن می‌کنیم. از اولین جرقه ذهنی تا اولین فروش،<br/>
                یک خط مستقیم و شفاف.
            </p>
        </motion.div>
      </div>
    </section>
  );
}
