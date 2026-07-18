"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { submitFeedback } from "@/app/actions/feedback";
import { 
  X, 
  CheckCircle2, 
  MessageSquare, 
  FileText, 
  Send, 
  Mail, 
  Loader2, 
  Sparkles,
  Phone,
  ArrowLeft,
  Smile,
  Meh,
  Frown,
  Heart,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function ContactPageInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse move effect for glowing gradient
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top } = currentTarget.getBoundingClientRect();
    setMousePosition({ x: clientX - left, y: clientY - top });
  };

  // Pre-fill subject from URL query param (e.g. from pricing CTA)
  useEffect(() => {
    const subject = searchParams.get("subject");
    if (subject) {
      setFormData(prev => ({ ...prev, subject }));
    }
  }, [searchParams]);

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
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      toast.error(error.message || "خطا در برقراری ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackMessage.trim()) return toast.error("لطفا متن بازخورد را بنویسید");
    
    setFeedbackLoading(true);
    try {
      const result = await submitFeedback(feedbackMessage, user?.id);
      if (result.error) throw new Error(result.error);
      
      toast.success("بازخورد شما با موفقیت ثبت شد");
      setFeedbackMessage("");
      setShowFeedbackModal(false);
    } catch (error) {
      toast.error("خطا در ثبت بازخورد");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleSatisfactionSubmit = (score: number) => {
    setSatisfaction(score);
    toast.success("از ثبت بازخورد شما متشکریم!");
  };

  return (
    <div 
      className="min-h-screen bg-background text-foreground relative overflow-hidden" 
      dir="rtl"
      onMouseMove={handleMouseMove}
    >
      <Navbar />

      {/* Dynamic Ambient Background Glow */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-60 z-0"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.06), transparent 80%)`
        }}
      />
      
      <main className="pt-32 pb-24 relative z-10">
        {/* Decorative background radial blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] -z-10 animate-pulse-gentle" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] -z-10" />

        <div className="container px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span>پشتیبانی و ارتباط مستقیم</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-muted-foreground leading-tight">
              در کنار شما هستیم برای <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">تحول کسب‌وکار</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
              تیم کارشناسان و پشتیبانی کارنکس آماده شنیدن پیشنهادات، پاسخ به سوالات فنی و همراهی شما در مسیر کارآفرینی هستند.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
            {/* Contact Form Container */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-7 xl:col-span-8"
            >
              <div className="relative bg-card/45 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden group">
                {/* Inner decorative light line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                
                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.div
                      key="form-step"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-3.5 bg-primary/10 rounded-2xl border border-primary/20 text-primary">
                          <Send className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black">ثبت تیکت پشتیبانی</h2>
                          <p className="text-sm text-muted-foreground mt-1">پاسخ‌گویی در کوتاه‌ترین زمان ممکن</p>
                        </div>
                      </div>
                      
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground mr-1">نام و نام خانوادگی</label>
                            <input 
                              type="text" 
                              required
                              value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                              className="w-full p-4 rounded-xl border border-border/80 bg-background/40 hover:bg-background/80 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 font-medium"
                              placeholder="نام شما"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground mr-1">نشانی ایمیل</label>
                            <input 
                              type="email" 
                              required
                              value={formData.email}
                              onChange={e => setFormData({...formData, email: e.target.value})}
                              className="w-full p-4 rounded-xl border border-border/80 bg-background/40 hover:bg-background/80 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 dir-ltr text-left font-medium"
                              placeholder="name@example.com"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-muted-foreground mr-1">موضوع پیام</label>
                          <input 
                            type="text" 
                            required
                            value={formData.subject}
                            onChange={e => setFormData({...formData, subject: e.target.value})}
                            className="w-full p-4 rounded-xl border border-border/80 bg-background/40 hover:bg-background/80 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 font-medium"
                            placeholder="مثال: سوال در مورد نحوه استفاده از بوم کسب‌وکار"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-muted-foreground mr-1">متن پیام</label>
                          <textarea 
                            required
                            value={formData.message}
                            onChange={e => setFormData({...formData, message: e.target.value})}
                            className="w-full p-4 rounded-xl border border-border/80 bg-background/40 hover:bg-background/80 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 min-h-[180px] resize-none leading-relaxed font-medium"
                            placeholder="جزئیات درخواست یا سوال خود را با ما در میان بگذارید..."
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full h-14 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300" 
                          disabled={loading}
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              در حال ارسال تیکت...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <span>ارسال پیام پشتیبانی</span>
                              <Send className="w-4 h-4 rotate-180" />
                            </span>
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success-step"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="text-center py-10"
                    >
                      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 text-green-500">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h2 className="text-3xl font-black text-foreground mb-4">پیام شما دریافت شد!</h2>
                      <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed font-medium">
                        تیکت پشتیبانی برای شما ایجاد شد. کارشناسان ما پیام شما را بررسی کرده و پاسخ آن را به ایمیل شما ارسال خواهند کرد.
                      </p>

                      {/* Customer Satisfaction rating widget */}
                      <div className="bg-muted/40 rounded-2xl p-6 max-w-md mx-auto border border-border/50">
                        <h4 className="font-bold text-sm text-foreground mb-4 flex items-center justify-center gap-2">
                          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                          <span>چقدر از تجربه ثبت تیکت رضایت دارید؟</span>
                        </h4>
                        
                        <div className="flex justify-center gap-4">
                          {[
                            { score: 1, label: "ضعیف", icon: Frown, color: "hover:text-red-500 hover:bg-red-500/10" },
                            { score: 3, label: "معمولی", icon: Meh, color: "hover:text-amber-500 hover:bg-amber-500/10" },
                            { score: 5, label: "عالی", icon: Smile, color: "hover:text-green-500 hover:bg-green-500/10" },
                          ].map((item) => {
                            const IconComponent = item.icon;
                            const isSelected = satisfaction === item.score;
                            return (
                              <button
                                key={item.score}
                                onClick={() => handleSatisfactionSubmit(item.score)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-transparent transition-all duration-300 ${item.color} ${isSelected ? 'border-primary bg-primary/5 text-primary scale-110' : 'text-muted-foreground'}`}
                              >
                                <IconComponent className="w-8 h-8" />
                                <span className="text-xs font-bold">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <Button 
                        onClick={() => setSubmitted(false)} 
                        variant="outline" 
                        className="mt-8 rounded-xl px-8"
                      >
                        ارسال پیام دیگر
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Support Info Sidebar */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-5 xl:col-span-4 space-y-6"
            >
              {/* Support Email Card */}
              <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                  <Mail className="w-36 h-36 rotate-12" />
                </div>
                
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  ارتباط مستقیم مکاتبه‌ای
                </h3>
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed font-medium">
                  برای ارسال مستندات، درخواست‌های رسمی همکاری تجاری یا پیگیری‌های ویژه:
                </p>
                <a 
                  href="mailto:support@karnex.ir" 
                  className="text-2xl font-black text-primary hover:text-primary/80 transition-colors dir-ltr block text-left font-mono tracking-wide"
                >
                  support@karnex.ir
                </a>
              </div>

              {/* Enhanced Info Grid */}
              <div className="grid gap-4">
                {/* Live Chat Notification */}
                <div className="p-6 rounded-2xl border border-border bg-card/40 hover:bg-card hover:border-primary/30 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-extrabold flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-xl text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      چت آنلاین و زنده
                    </h4>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">به‌زودی</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    در حال توسعه سیستم گفتگوی زنده با مشاوران کسب‌وکار کارنکس هستیم تا پاسخگوی لحظه‌ای شما باشیم.
                  </p>
                </div>
                
                {/* Help Center Navigation Card */}
                <a 
                  href="/help" 
                  className="block p-6 rounded-2xl border border-border bg-card/40 hover:bg-card hover:border-primary/30 transition-all duration-300 group hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-extrabold flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      مرکز راهنما و آموزش
                    </h4>
                    <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:translate-x-[-4px] transition-transform" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    راهنمای شروع، سوالات متداول و معرفی ابزارهای اصلی کارنکس — بدون نیاز به ورود.
                  </p>
                </a>

                {/* Telephone Support Card */}
                <div className="p-6 rounded-2xl border border-border bg-card/40 hover:bg-card hover:border-primary/30 transition-all duration-300 group">
                  <h4 className="font-extrabold flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    پشتیبانی تلفنی ویژه
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    ساعات کاری شنبه تا چهارشنبه ۹ تا ۱۷ آماده دریافت تماس‌های کاربران پلن تیم هستیم.
                    <span className="block mt-2 font-semibold text-foreground">۰۲۱-۹۱۰۱۵۶۷۸</span>
                  </p>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="bg-slate-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl border border-white/5">
                <div className="relative z-10">
                  <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    انتقاد یا پیشنهاد؟
                  </h3>
                  <p className="text-slate-400 mb-6 text-sm leading-relaxed font-medium">
                    نظرات و ایده‌های ارزشمند شما مسیر توسعه ویژگی‌های جدید کارنکس را ترسیم می‌کنند.
                  </p>
                  <Button 
                    variant="secondary" 
                    className="w-full font-bold hover:bg-white/90 transition-colors rounded-xl"
                    onClick={() => setShowFeedbackModal(true)}
                  >
                    ثبت بازخورد پلتفرم
                  </Button>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20 z-0" />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border relative border-border/80"
            >
              <button 
                onClick={() => setShowFeedbackModal(false)}
                className="absolute top-4 left-4 p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 border border-purple-500/20">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-2xl font-black">ثبت بازخورد توسعه</h3>
              </div>
              
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed font-medium">
                پیشنهاد، انتقاد یا ایده خود را برای بهبود امکانات کارنکس بنویسید. ما تمام پیام‌ها را مستقیماً بررسی می‌کنیم.
              </p>

              <div className="space-y-4">
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="ایده یا پیشنهاد خود را اینجا بنویسید..."
                  className="w-full h-32 p-4 rounded-xl border border-border/80 bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none font-medium leading-relaxed"
                  autoFocus
                />
                
                <div className="flex gap-3 justify-end">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowFeedbackModal(false)}
                    className="rounded-xl"
                  >
                    انصراف
                  </Button>
                  <Button 
                    onClick={handleFeedbackSubmit} 
                    className="rounded-xl px-8"
                    disabled={feedbackLoading}
                  >
                    {feedbackLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ارسال بازخورد"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <ContactPageInner />
    </Suspense>
  );
}
