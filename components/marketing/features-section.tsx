"use client";

import { motion } from "framer-motion";
import { 
  Map, 
  BarChart3,
  Sparkles,
  ArrowLeft,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    icon: Map,
    title: "نقشه راه",
    description: "قدم‌به‌قدم بهت میگیم چی کار کنی تا به درآمد برسی.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: LayoutGrid, // Using LayoutGrid for Business Analysis/BMC context
    title: "تحلیل کسب و کار",
    description: "ایده‌ت رو بررسی می‌کنیم تا ببینی چقدر پول‌ساز میشه.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: Sparkles,
    title: "دستیار کارنکس",
    description: "مثل یه هم‌بنیان‌گذار باهوش، ۲۴ ساعته کنارتیم.",
    color: "from-pink-500 to-rose-600",
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative h-full"
    >
      {/* Card */}
      <div className="h-full rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-8 overflow-hidden transition-all duration-500 group-hover:border-primary/30 group-hover:shadow-2xl group-hover:shadow-primary/10 flex flex-col items-center text-center">
        
        {/* Gradient glow on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
        
        {/* Icon */}
        <div className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <feature.icon className="w-8 h-8 text-white" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <h3 className="font-bold text-foreground mb-3 text-2xl">
            {feature.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed text-lg">
            {feature.description}
          </p>
        </div>
        
      </div>
    </motion.div>
  );
};

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />
      
      {/* Decorative elements */}
      <div className="absolute top-40 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-40 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]" />
      
      <div className="container relative z-10 px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">جعبه ابزار دستیار کارنکس</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
            همه چیز برای
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              شروع و رشد
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground">
            ابزارهای قدرتمند با دستیار کارنکس برای تبدیل ایده به کسب‌وکار واقعی
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link href="/signup">
            <Button size="lg" className="h-14 px-8 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all">
              شروع رایگان با دستیار کارنکس
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
