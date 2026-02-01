"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Mail, MessageSquare, Ticket, FileText, ArrowLeft, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate support ticket submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("پیام شما با موفقیت ثبت شد. تیکت پشتیبانی ایجاد گردید.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              ارتباط با <span className="text-primary">تیم کارنکس</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              ما اینجا هستیم تا به شما در مسیر کارآفرینی کمک کنیم. سوالات، پیشنهادات و مشکلات خود را با ما در میان بگذارید.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Form */}
            <div className="bg-card border rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Ticket className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">ثبت تیکت پشتیبانی</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">نام شما</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="نام کامل"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ایمیل</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="example@mail.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">موضوع</label>
                  <input 
                    type="text" 
                    required
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="مثال: مشکل در پرداخت"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">پیام شما</label>
                  <textarea 
                    required
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full p-3 rounded-xl border bg-background min-h-[150px] focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    placeholder="توضیحات کامل..."
                  />
                </div>

                <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
                  {loading ? "در حال ارسال..." : "ارسال پیام"}
                  {!loading && <Send className="mr-2 h-4 w-4" />}
                </Button>
              </form>
            </div>

            {/* Support Info */}
            <div className="space-y-8">
              <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  ایمیل پشتیبانی
                </h3>
                <p className="text-muted-foreground mb-4">
                  برای همکاری‌های تجاری یا پیگیری‌های رسمی می‌توانید مستقیماً ایمیل بزنید:
                </p>
                <a href="mailto:shayan@karnex.ir" className="text-2xl font-bold text-primary hover:underline dir-ltr block text-left">
                  shayan@karnex.ir
                </a>
              </div>

              <div className="grid gap-4">
                <div className="p-6 rounded-2xl border bg-card hover:border-primary/50 transition-colors">
                    <h4 className="font-bold flex items-center gap-2 mb-2">
                        <MessageSquare className="w-5 h-5 text-green-500" />
                        چت آنلاین
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        به زودی سیستم چت آنلاین ۲۴ ساعته فعال خواهد شد.
                    </p>
                </div>
                
                <div className="p-6 rounded-2xl border bg-card hover:border-primary/50 transition-colors">
                    <h4 className="font-bold flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        مرکز راهنما
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        آموزش‌های ویدیویی و متنی کار با پلتفرم کارنکس.
                    </p>
                </div>
              </div>

              {/* Feedback Section (Moved from dashboard) */}
              <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">پیشنهادی دارید؟</h3>
                    <p className="text-slate-300 mb-6 text-sm">
                        ما همیشه در حال بهبود هستیم. نظرات شما مسیر توسعه کارنکس را می‌سازد.
                    </p>
                    <Button variant="secondary" className="w-full font-bold">
                        ثبت بازخورد محصول
                    </Button>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 z-0" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
