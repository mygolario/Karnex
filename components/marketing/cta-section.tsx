"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Rocket, Star, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export const CTASection = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black" />
      
      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]"
      />
      <motion.div
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-[20%] w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[120px]"
      />
      
      {/* Noise texture */}
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3QgZmlsdGVyPSJ1cmwoI2EpIiBoZWlnaHQ9IjEwMCUiIHdpZHRoPSIxMDAlIi8+PC9zdmc+')]" />
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Main content */}
          <div className="text-center mb-12">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <Image
                src="/logo.png"
                alt="کارنکس"
                width={80}
                height={80}
                className="mx-auto rounded-2xl shadow-2xl shadow-primary/30"
              />
            </motion.div>
            
            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight"
            >
              آماده‌ای مسیرت رو
              <br />
              <span className="bg-gradient-to-r from-primary via-pink-400 to-secondary bg-clip-text text-transparent">
                شروع کنی؟
              </span>
            </motion.h2>
            
            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto"
            >
              ایده با تو، مسیرش با کارنکس.
              <br />
              <span className="text-white font-medium">رایگان شروع کن، بدون محدودیت.</span>
            </motion.p>
            
            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="h-16 px-12 text-lg rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-all"
                >
                  <Sparkles className="ml-2 h-5 w-5" />
                  شروع رایگان
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </Link>

            </motion.div>
          </div>
          

        </div>
      </div>
    </section>
  );
};
