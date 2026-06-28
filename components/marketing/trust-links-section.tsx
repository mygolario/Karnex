"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ExternalLink, Link2 } from "lucide-react";
import Link from "next/link";

export const TrustLinksSection = () => {
  return (
    <section className="py-16 relative overflow-hidden bg-muted/10 border-t border-border/40 font-sans" dir="rtl">
      <div className="container relative z-10 px-4 md:px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Right Column: Internal Links Directory */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2.5 text-primary font-bold">
              <Link2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">دسترسی سریع به بخش‌های کارنکس</h3>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              برای کسب اطلاعات بیشتر در خصوص خدمات ما، می‌توانید از بخش‌های گوناگون سایت بازدید فرمایید.
              برای بررسی جزئیات اشتراک‌ها و هزینه‌ها به صفحه{" "}
              <Link href="/pricing" className="text-primary hover:text-primary/80 transition-colors hover:underline font-semibold">
                تعرفه‌ها و پلن‌ها
              </Link>{" "}
              مراجعه کنید. جهت طرح هرگونه پرسش یا دریافت راهنمایی تخصصی، از صفحه{" "}
              <Link href="/contact" className="text-primary hover:text-primary/80 transition-colors hover:underline font-semibold">
                تماس با پشتیبانی
              </Link>{" "}
              استفاده نمایید. همچنین مطالعه سند رسمی{" "}
              <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors hover:underline font-semibold">
                قوانین و مقررات کارنکس
              </Link>{" "}
              و سند{" "}
              <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors hover:underline font-semibold">
                حریم خصوصی کاربران
              </Link>{" "}
              به درک متقابل حقوقی کمک خواهد کرد.
            </p>
          </motion.div>

          {/* Left Column: Scientific Reference & External Citations */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2.5 text-primary font-bold">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">مبانی علمی و اعتبار متدولوژی ما</h3>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              طراحی ابزارها و فرآیندهای رشد کسب‌وکار در پلتفرم کارنکس مبتنی بر الگوهای پذیرفته‌شده جهانی است.
              بخش بوم هوشمند ما برگرفته از مدل نظری معتبر{" "}
              <a
                href="https://en.wikipedia.org/wiki/Business_model_canvas"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors hover:underline font-semibold inline-flex items-center gap-1"
              >
                بوم مدل کسب‌وکار (Wikipedia) <ExternalLink className="w-3.5 h-3.5" />
              </a>{" "}
              است. همچنین الگوهای راهبری محصول و فرآیندها براساس مدل استارتاپ ناب پایه‌ریزی گردیده که جزئیات و مزایای آن در تحقیقات منتشرشده توسط{" "}
              <a
                href="https://hbr.org/2013/05/why-the-lean-start-up-changes-everything"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors hover:underline font-semibold inline-flex items-center gap-1"
              >
                نشریه کسب‌وکار هاروارد (HBR) <ExternalLink className="w-3.5 h-3.5" />
              </a>{" "}
              به تفصیل تبیین شده است.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
