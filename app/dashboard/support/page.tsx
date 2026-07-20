"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  AlertTriangle, 
  HelpCircle, 
  DollarSign, 
  Sparkles,
  CheckCircle,
  Loader2,
  Smile,
  Meh,
  Frown,
  Heart
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";

export default function SupportPage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [satisfaction, setSatisfaction] = useState<number | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    subject: "",
    category: "general",
    priority: "medium",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.message.trim() || !formData.subject.trim()) {
      return error("خطا", "لطفاً تمامی فیلدهای الزامی را پر کنید.");
    }
    
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "کاربر داشبورد",
          email: "support_in_app@karnex.ir",
          subject: formData.subject,
          message: formData.message,
          category: formData.category,
          priority: formData.priority,
          source: "dashboard-support",
        }),
      });

      if (!res.ok) throw new Error("ارسال پیام با خطا مواجه شد.");

      success("پیام ارسال شد", "تیم پشتیبانی کارنکس به زودی درخواست شما را بررسی خواهد کرد.");
      setSubmitted(true);
    } catch (e: any) {
      error("خطا", e.message || "خطا در برقراری ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  // Quick Action Handler to pre-fill form
  const applyQuickAction = (category: string, subject: string, priority: string) => {
    setFormData({
      category,
      subject,
      priority,
      message: ""
    });
    success("پیش‌فرض اعمال شد", `فرم برای موضوع "${subject}" تنظیم گردید.`);
  };

  const handleSatisfactionSubmit = (score: number) => {
    setSatisfaction(score);
    success("متشکریم", "بازخورد ارزشمند شما با موفقیت ثبت شد.");
  };

  const resetForm = () => {
    setSubmitted(false);
    setSatisfaction(null);
    setFormData({
      subject: "",
      category: "general",
      priority: "medium",
      message: ""
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-24 md:pb-8 animate-fade-in" dir="rtl">
      
      {/* Header with gradient details */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 p-8 border border-white/5 shadow-xl">
        <div className="absolute top-[-50%] left-[-20%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px]" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            <span>پشتیبانی و ارتباط با کارشناسان</span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
            در صورت بروز هرگونه مشکل یا نیاز به راهنمایی در مسیر تدوین مدل تجاری، با ما در تماس باشید.
          </p>
        </div>
      </div>

      {/* Quick Action Helper Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "خطا در تراکنش یا پرداخت",
            desc: "پر کردن فرم با اولویت بالا و موضوع درگاه زیبال",
            icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
            cat: "billing",
            sub: "بررسی تراکنش ناموفق پرداخت",
            prio: "high",
            bgColor: "bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20"
          },
          {
            title: "گزارش باگ یا مشکل فنی",
            desc: "پر کردن فرم برای خطاهای لودینگ یا ابزارهای هوش مصنوعی",
            icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
            cat: "technical",
            sub: "گزارش خطای فنی در عملکرد داشبورد",
            prio: "medium",
            bgColor: "bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20"
          },
          {
            title: "مشاوره و راهنمای بوم",
            desc: "سوالات مربوط به چگونگی ارتقای ایده و مراحل بوم ناب",
            icon: <HelpCircle className="w-5 h-5 text-blue-500" />,
            cat: "guidance",
            sub: "درخواست راهنمایی در مورد مفاهیم بوم کسب‌وکار",
            prio: "low",
            bgColor: "bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20"
          }
        ].map((action, i) => (
          <button
            key={i}
            onClick={() => applyQuickAction(action.cat, action.sub, action.prio)}
            className={`text-right p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 hover:scale-[1.01] active:scale-[0.99] ${action.bgColor}`}
          >
            <div className="p-3 bg-background rounded-xl shrink-0 border border-border/50">
              {action.icon}
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-xs text-foreground">{action.title}</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">{action.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Support Ticket Submission Card (Left) */}
        <div className="lg:col-span-8">
          <Card className="bg-card/45 backdrop-blur-xl border-border/60 shadow-2xl relative overflow-hidden group">
            <CardHeader className="border-b border-border/40 pb-5">
              <CardTitle className="flex items-center gap-3 text-lg font-black">
                <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span>ارسال درخواست جدید</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form 
                    key="form"
                    onSubmit={handleSubmit} 
                    className="space-y-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    
                    {/* Category and Priority selectors */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-xs font-bold text-muted-foreground mr-1">دسته‌بندی موضوعی</Label>
                        <select
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full p-3 rounded-xl border border-border bg-background/50 focus:bg-background outline-none text-xs font-bold text-foreground"
                        >
                          <option value="general">سوال عمومی پلتفرم</option>
                          <option value="technical">گزارش مشکل فنی و باگ</option>
                          <option value="billing">امور مالی و پرداخت اشتراک</option>
                          <option value="guidance">راهنمایی و مشاوره بیزینس</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="priority" className="text-xs font-bold text-muted-foreground mr-1">اولویت درخواست</Label>
                        <select
                          id="priority"
                          value={formData.priority}
                          onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                          className="w-full p-3 rounded-xl border border-border bg-background/50 focus:bg-background outline-none text-xs font-bold text-foreground"
                        >
                          <option value="low">کم (پاسخ تا ۴۸ ساعت)</option>
                          <option value="medium">متوسط (پاسخ تا ۲۴ ساعت)</option>
                          <option value="high">بالا (پاسخ فوری - زیر ۴ ساعت)</option>
                        </select>
                      </div>
                    </div>

                    {/* Subject field */}
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-xs font-bold text-muted-foreground mr-1">موضوع تیکت</Label>
                      <Input 
                        id="subject" 
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="مثلا: خطای عدم بارگذاری نقشه راه پروژه" 
                        className="rounded-xl border-border bg-background/30 focus:bg-background focus:ring-primary/20 text-xs font-bold"
                        required 
                      />
                    </div>
                    
                    {/* Message textarea */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mr-1">
                        <Label htmlFor="message" className="text-xs font-bold text-muted-foreground">متن پیام</Label>
                        
                        {/* Dynamic category-specific hints */}
                        {formData.category === "billing" && (
                          <span className="text-[10px] text-emerald-500 font-bold">ارائه شماره تراکنش الزامی است.</span>
                        )}
                        {formData.category === "technical" && (
                          <span className="text-[10px] text-amber-500 font-bold">نام مرورگر و صفحه را ذکر کنید.</span>
                        )}
                      </div>
                      <Textarea 
                        id="message" 
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="توضیحات کامل مشکل یا سوال خود را اینجا بنویسید..." 
                        className="min-h-[160px] rounded-xl border-border bg-background/30 focus:bg-background focus:ring-primary/20 text-xs font-semibold leading-relaxed"
                        required 
                      />
                    </div>

                    <Button type="submit" className="w-full h-12 rounded-xl text-xs font-black shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          در حال ارسال درخواست...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span>ثبت و ارسال تیکت</span>
                          <Send className="w-3.5 h-3.5 rotate-180" />
                        </span>
                      )}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success"
                    className="text-center py-10 space-y-6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 border border-green-500/20">
                      <CheckCircle className="w-10 h-10" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-foreground">تیکت شما با موفقیت ثبت شد</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto font-semibold">
                        درخواست شما در سیستم ثبت گردید. پاسخ کارشناس به محض ثبت از طریق ایمیل به اطلاع شما خواهد رسید.
                      </p>
                    </div>

                    {/* Customer Satisfaction widget on success state */}
                    <div className="bg-muted/40 p-6 rounded-2xl border border-border/40 max-w-md mx-auto space-y-4">
                      <h4 className="text-xs font-black text-foreground flex items-center justify-center gap-1.5">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        <span>از روند ثبت درخواست خود رضایت داشتید؟</span>
                      </h4>
                      <div className="flex justify-center gap-4">
                        {[
                          { score: 1, label: "ناراضی", icon: Frown, color: "hover:text-red-500 hover:bg-red-500/10" },
                          { score: 3, label: "معمولی", icon: Meh, color: "hover:text-amber-500 hover:bg-amber-500/10" },
                          { score: 5, label: "عالی", icon: Smile, color: "hover:text-green-500 hover:bg-green-500/10" }
                        ].map(item => {
                          const IconComponent = item.icon;
                          const isSelected = satisfaction === item.score;
                          return (
                            <button
                              key={item.score}
                              type="button"
                              onClick={() => handleSatisfactionSubmit(item.score)}
                              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border border-transparent transition-all duration-300 ${item.color} ${isSelected ? 'border-primary bg-primary/5 text-primary scale-110' : 'text-slate-500'}`}
                            >
                              <IconComponent className="w-7 h-7" />
                              <span className="text-[10px] font-bold">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Button 
                      onClick={resetForm}
                      variant="outline" 
                      className="rounded-xl px-8"
                    >
                      ارسال درخواست جدید
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info Sidebar (Right) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card/45 backdrop-blur-xl border-border/60 shadow-2xl">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-base font-extrabold">راه‌های ارتباطی مستقیم</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-foreground">ایمیل رسمی پشتیبانی</div>
                  <a href="mailto:support@karnex.ir" className="text-[11px] text-primary font-bold font-mono tracking-wide">
                    support@karnex.ir
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-foreground">تلفن تماس مستقیم</div>
                  <div className="text-[11px] text-muted-foreground font-bold tracking-wide">به‌زودی</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white border border-white/5 shadow-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-sm text-foreground">ساعات پاسخگویی</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                پشتیبانان صنف‌های مختلف آماده دریافت پیام‌های شما هستند:
              </p>
              
              <div className="space-y-2 pt-2 text-[11px] font-semibold text-slate-400">
                <div className="flex justify-between">
                  <span>شنبه تا چهارشنبه:</span>
                  <span className="text-foreground">۹ صبح تا ۱۷ عصر</span>
                </div>
                <div className="flex justify-between">
                  <span>پنجشنبه:</span>
                  <span className="text-foreground">۹ صبح تا ۱۳ ظهر</span>
                </div>
                <div className="flex justify-between">
                  <span>جمعه و روزهای تعطیل:</span>
                  <span className="text-red-400">غیرفعال (ثبت پیام فعال است)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
