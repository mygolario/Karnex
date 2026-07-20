"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Map,
  Presentation,
  LayoutGrid,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/* Hotspots positioned on the mockup */
const hotspots = [
  {
    x: "15%",
    y: "25%",
    icon: Bot,
    title: "دستیار AI",
    description: "پیشنهاد هوشمند در هر گام",
    color: "from-pink-500 to-rose-600",
  },
  {
    x: "75%",
    y: "20%",
    icon: Map,
    title: "نقشه راه",
    description: "مسیر شخصی‌سازی شده",
    color: "from-emerald-500 to-teal-600",
  },
  {
    x: "50%",
    y: "60%",
    icon: Presentation,
    title: "پیچ‌دک",
    description: "ارائه برای سرمایه‌گذار",
    color: "from-blue-500 to-cyan-600",
  },
  {
    x: "85%",
    y: "70%",
    icon: LayoutGrid,
    title: "بوم کسب‌وکار",
    description: "تحلیل یک‌نفره",
    color: "from-violet-500 to-purple-600",
  },
];

export const ProductShowcase = () => {
  return (
    <section id="showcase" className="py-24 lg:py-32 relative overflow-hidden bg-muted/20">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="container relative z-10 px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-bold text-secondary">یک نگاه به داشبورد</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
            همه چیز در یک
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              داشبورد هوشمند
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            نقشه راه، ابزارها، پیشرفت و دستیار AI — همگی در یک صفحه
          </p>
        </motion.div>

        {/* Dashboard mockup with hotspots */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 to-secondary/15 blur-[60px] rounded-3xl" />

          {/* Browser frame */}
          <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 flex justify-center">
                <div className="bg-background/80 rounded-lg px-4 py-1 text-xs text-muted-foreground font-medium">
                  www.karnex.ir/dashboard
                </div>
              </div>
            </div>

            {/* Mockup body */}
            <div className="relative p-6 lg:p-8 bg-gradient-to-br from-card to-muted/10 min-h-[400px]">
              {/* Sidebar mock */}
              <div className="flex gap-6">
                <div className="hidden lg:flex flex-col gap-2 w-48 shrink-0">
                  {["نمای کلی", "نقشه راه", "بوم کسب‌وکار", "پیچ‌دک", "آنالیتیکس"].map((item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                        i === 0
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-muted-foreground"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded ${i === 0 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main content area */}
                <div className="flex-1 space-y-4">
                  {/* Greeting bar */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 w-32 bg-muted rounded mb-2" />
                      <div className="h-3 w-48 bg-muted/60 rounded" />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary" />
                  </div>

                  {/* Progress + stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-3 w-24 bg-muted rounded" />
                        <div className="h-4 w-10 bg-primary/30 rounded" />
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "68%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        />
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/50 p-4 flex flex-col justify-center">
                      <div className="h-6 w-12 bg-muted rounded mb-1" />
                      <div className="h-3 w-20 bg-muted/60 rounded" />
                    </div>
                  </div>

                  {/* Cards row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="rounded-xl border border-border/50 p-4">
                        <div className="w-8 h-8 rounded-lg bg-muted mb-3" />
                        <div className="h-5 w-16 bg-muted rounded mb-2" />
                        <div className="h-3 w-20 bg-muted/60 rounded" />
                      </div>
                    ))}
                  </div>

                  {/* AI suggestion bar */}
                  <div className="rounded-xl bg-muted/40 p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 bg-muted rounded" />
                      <div className="h-2 w-48 bg-muted/60 rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hotspots overlay — desktop only */}
              <div className="hidden lg:block">
                {hotspots.map((spot, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 + i * 0.2, type: "spring" }}
                    className="absolute"
                    style={{ left: spot.x, top: spot.y }}
                  >
                    {/* Pulse ring */}
                    <motion.div
                      animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      className={`absolute inset-0 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${spot.color}`}
                    />
                    {/* Pin */}
                    <div className={`relative w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${spot.color} flex items-center justify-center shadow-lg cursor-pointer`}>
                      <spot.icon className="w-5 h-5 text-white" />
                    </div>
                    {/* Tooltip */}
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute top-6 -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg px-3 py-2 whitespace-nowrap pointer-events-none"
                    >
                      <p className="text-xs font-bold text-foreground">{spot.title}</p>
                      <p className="text-[10px] text-muted-foreground">{spot.description}</p>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating CTA below mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <Link href="/signup">
              <Button
                size="lg"
                rounded="lg"
                variant="outline"
                className="font-bold gap-2"
              >
                همین داشبورد رو برای خودت بساز
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
