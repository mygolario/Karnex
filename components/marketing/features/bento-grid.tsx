"use client";

import { motion } from "framer-motion";
import { Rocket, Target, Zap, BarChart3, Users, FileText } from "lucide-react";

export function BentoFeatures() {
  return (
    <section className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-5xl md:text-7xl font-black mb-6">جعبه‌ابزار رشد</h2>
        <p className="text-2xl text-muted-foreground">تمام ابزارهای مورد نیاز شما در یک مکان.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[800px]">
        
        {/* BIG ITEM 1 */}
        <motion.div 
            whileHover={{ scale: 1.02 }}
            className="md:col-span-2 md:row-span-2 rounded-3xl bg-secondary/5 border border-white/10 p-8 flex flex-col justify-between relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
                <div className="bg-blue-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white">
                    <Rocket size={24} />
                </div>
                <h3 className="text-3xl font-bold mb-2">استارتاپ کیت</h3>
                <p className="text-muted-foreground text-lg">از ایده تا جذب سرمایه. ما تمام ابزارهای مورد نیاز برای ساخت پیچ‌دک، محاسبه اندازه بازار و نقشه‌راه محصول را در اختیار شما قرار می‌دهیم.</p>
            </div>
            <div className="mt-8 flex-1 bg-background/50 rounded-xl border border-white/5 p-4 relative overflow-hidden">
                {/* Simulated UI */}
                <div className="flex gap-2 mb-4">
                     <div className="w-3 h-3 rounded-full bg-red-500" />
                     <div className="w-3 h-3 rounded-full bg-yellow-500" />
                     <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-1/2 animate-pulse delay-75" />
                    <div className="h-32 bg-muted rounded w-full animate-pulse delay-150" />
                </div>
            </div>
        </motion.div>

        {/* SMALL ITEM 2 */}
         <motion.div 
            whileHover={{ scale: 1.02 }}
            className="rounded-3xl bg-secondary/5 border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div>
                 <div className="bg-emerald-500 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-white">
                    <Target size={20} />
                </div>
                <h3 className="text-xl font-bold mb-2">تحلیل مالی</h3>
                <p className="text-muted-foreground text-sm">پیش‌بینی سود و زیان و جریان نقدینگی.</p>
            </div>
        </motion.div>

        {/* SMALL ITEM 3 */}
         <motion.div 
            whileHover={{ scale: 1.02 }}
            className="rounded-3xl bg-secondary/5 border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div>
                 <div className="bg-purple-500 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-white">
                    <Zap size={20} />
                </div>
                <h3 className="text-xl font-bold mb-2">دستیار کارنکس</h3>
                <p className="text-muted-foreground text-sm">مشاور ۲۴ ساعته اختصاصی کسب‌وکار شما.</p>
            </div>
        </motion.div>
        
        {/* MEDIUM ITEM 4 (Wide bottom) */}
         <motion.div 
            whileHover={{ scale: 1.02 }}
            className="md:col-span-1 md:row-span-1 rounded-3xl bg-secondary/5 border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden group"
        >
             <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div>
                 <div className="bg-orange-500 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-white">
                    <FileText size={20} />
                </div>
                <h3 className="text-xl font-bold mb-2">بوم مدل</h3>
                <p className="text-muted-foreground text-sm">طراحی تعاملی مدل کسب‌وکار.</p>
            </div>
        </motion.div>

      </div>
    </section>
  );
}
