"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, MessageCircle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { FAQ_ITEMS } from "@/lib/marketing/faq-data";

const faqs = FAQ_ITEMS;

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 lg:py-32 relative overflow-hidden bg-muted/30">
      <div className="absolute inset-0 pattern-dots opacity-30" />

      <div className="container relative z-10 px-4 md:px-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            سوالات{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              متداول
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            پاسخ سوالاتی که ممکن است داشته باشید
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-12">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className={`bg-card border rounded-2xl overflow-hidden transition-all duration-300 ${
                  openIndex === index
                    ? "border-primary/50 shadow-lg shadow-primary/10"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between gap-4 text-end"
                >
                  <span className="font-bold text-lg text-foreground">
                    {faq.question}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      openIndex === index
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {openIndex === index ? (
                      <Minus className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6">
                        <p className="text-muted-foreground leading-relaxed border-t border-border pt-4">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA — "still have questions?" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-3xl bg-card border border-border">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">سوال دیگه‌ای داری؟</h3>
              <p className="text-muted-foreground text-sm mb-4">تیم پشتیبانی ما آماده پاسخگویی است</p>
            </div>
            <Link href="/contact">
              <Button variant="outline" rounded="lg" className="font-bold gap-2">
                <MessageCircle className="w-4 h-4" />
                تماس با پشتیبانی
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
