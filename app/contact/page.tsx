"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Mail, MessageSquare, FileText, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ContactPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'خطایی رخ داد');

      toast.success("پیام شما با موفقیت ارسال شد. تیکت پشتیبانی ایجاد گردید.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      toast.error(error.message || "خطا در برقراری ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <Navbar />
      
      <main className="pt-32 pb-24 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2" />

        <div className="container px-4 md:px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              ارتباط با <span className="text-primary">تیم کارنکس</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              ما اینجا هستیم تا به شما در مسیر کارآفرینی کمک کنیم.<br/>
              سوالات، پیشنهادات و مشکلات خود را با ما در میان بگذارید.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-12 gap-8 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-7 lg:col-span-8"
            >
              <div className="bg-card/50 backdrop-blur-sm border rounded-3xl p-6 md:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <Send className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">ثبت تیکت پشتیبانی</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">نام شما</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full p-4 rounded-xl border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="نام کامل"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">ایمیل</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full p-4 rounded-xl border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="example@mail.com"
                        dir="ltr" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">موضوع</label>
                    <input 
                      type="text" 
                      required
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full p-4 rounded-xl border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="مثال: مشکل در پرداخت"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">پیام شما</label>
                    <textarea 
                      required
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className="w-full p-4 rounded-xl border bg-background/50 min-h-[180px] focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none leading-relaxed"
                      placeholder="توضیحات کامل..."
                    />
                  </div>

                  <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" />
                        در حال ارسال...
                      </span>
                    ) : (
                      "ارسال پیام"
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Support Info */}
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.5, delay: 0.3 }}
               className="md:col-span-5 lg:col-span-4 space-y-6"
            >
              <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Mail className="w-32 h-32 rotate-12" />
                </div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
                  <Mail className="w-5 h-5 text-primary" />
                  ایمیل پشتیبانی
                </h3>
                <p className="text-muted-foreground mb-6 text-sm relative z-10">
                  برای همکاری‌های تجاری یا پیگیری‌های رسمی می‌توانید مستقیماً ایمیل بزنید:
                </p>
                <a href="mailto:support@karnex.ir" className="text-xl font-bold text-primary hover:text-primary/80 transition-colors dir-ltr block text-left relative z-10 font-mono">
                  support@karnex.ir
                </a>
              </div>

              <div className="grid gap-4">
                <div className="p-6 rounded-2xl border bg-card/50 hover:bg-card hover:border-primary/30 transition-all group cursor-default">
                    <h4 className="font-bold flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        چت آنلاین
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        سیستم چت آنلاین ۲۴ ساعته.
                        <span className="block mt-2 text-xs font-bold text-primary bg-primary/10 w-fit px-2 py-1 rounded-full">به زودی</span>
                    </p>
                </div>
                
                <div className="p-6 rounded-2xl border bg-card/50 hover:bg-card hover:border-primary/30 transition-all group cursor-pointer hover:shadow-md">
                    <h4 className="font-bold flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <FileText className="w-5 h-5" />
                        </div>
                        مرکز راهنما
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        مشاهده آموزش‌های ویدیویی و متنی پلتفرم.
                    </p>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="bg-slate-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        پیشنهادی دارید؟
                    </h3>
                    <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                        نظرات شما مسیر توسعه کارنکس را می‌سازد. ایده‌های خود را با ما در میان بگذارید.
                    </p>
                    <Button variant="secondary" className="w-full font-bold hover:bg-white/90 transition-colors">
                        ثبت بازخورد
                    </Button>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20 z-0" />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
